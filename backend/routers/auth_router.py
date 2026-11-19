import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from config import settings
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.TokenResponse)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    email_clean = user_in.email.strip().lower()

    # Enforce College Domain
    if not email_clean.endswith(settings.ALLOWED_EMAIL_DOMAIN):
        raise HTTPException(
            status_code=400,
            detail=f"Registration is restricted to college email addresses ending with {settings.ALLOWED_EMAIL_DOMAIN}"
        )

    existing = db.query(models.User).filter(models.User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="This email is already registered.")

    # Rule: Every new user is a student by default.
    # If the system has 0 users, the very first bootstrapping user can be faculty.
    user_count = db.query(models.User).count()
    initial_role = "faculty" if user_count == 0 else "student"
    initial_status = "active" if user_count == 0 else "pending"

    new_user = models.User(
        name=user_in.name.strip(),
        email=email_clean,
        hashed_password=auth.get_password_hash(user_in.password),
        role=initial_role,
        status=initial_status,
        is_volunteer=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    auth.log_audit(
        db=db,
        actor=new_user,
        action="user_registered",
        target_type="user",
        target_id=new_user.id,
        target_name=new_user.name,
        after_state=initial_role,
        details=f"User registered with default role {initial_role}"
    )

    token = auth.create_access_token(data={"sub": new_user.id, "role": new_user.role, "tv": getattr(new_user, "token_version", 0) or 0})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    ident = (login_data.identifier or login_data.roll_no or login_data.email or "").strip()
    if not ident:
        raise HTTPException(status_code=400, detail="Please provide a valid Roll Number or Email.")

    ident_upper = ident.upper()
    ident_lower = ident.lower()

    # 1. Exact match on roll_no or email
    user = db.query(models.User).filter(
        (models.User.email == ident_lower) | (models.User.roll_no == ident_upper)
    ).first()

    # 2. Canonical SuperAdmin alias match (SA01, superadmin, sa01)
    if not user:
        sa_aliases = {"super_admin", "superadmin", "sa01", "super"}
        if ident_lower in sa_aliases:
            user = db.query(models.User).filter(models.User.roll_no == "SA01").first()

    # 3. Fail-safe SuperAdmin self-healing: if SA01 is missing from database, provision it
    if not user and ident_upper == "SA01":
        user = models.User(
            id="u_super_admin_sa01",
            roll_no="SA01",
            name="System SuperAdmin",
            email="superadmin@college.edu",
            role="super_admin",
            post="System Administrator",
            department="Platform Governance & IT",
            hashed_password=auth.get_password_hash("GeoHub2026!"),
            is_volunteer=0,
            status="active",
            created_at=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect credentials. Please verify your roll number/email and password."
        )

    if user.status == "disabled":
        raise HTTPException(status_code=403, detail="Your account has been disabled by an administrator.")

    # Update login and platform telemetry
    try:
        user.last_login_at = datetime.utcnow()
        user.last_seen_at = datetime.utcnow()
        db.commit()
    except Exception:
        db.rollback()

    token = auth.create_access_token(data={"sub": user.id, "role": user.role, "tv": getattr(user, "token_version", 0) or 0})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.from_orm(user)
    )

@router.post("/change-password", response_model=schemas.PasswordChangeResponse)
def change_password(
    data: schemas.PasswordChangeRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Secure Change Password matching the GeoHub Security Modal."""
    if not auth.verify_password(data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password entered is incorrect."
        )

    if data.old_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from your current password."
        )

    # Update hash in TiDB / MySQL
    current_user.hashed_password = auth.get_password_hash(data.new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()

    # Immutable Audit Log
    auth.log_audit(
        db=db,
        actor=current_user,
        action="password_change",
        target_type="user",
        target_id=current_user.id,
        target_name=current_user.name,
        details="User updated scholar password credentials."
    )

    return schemas.PasswordChangeResponse(
        success=True,
        message="Password successfully updated! Your new credentials are now active."
    )

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserResponse.from_orm(current_user)

@router.post("/set-role")
def set_user_role(
    req: schemas.RoleAssignRequest,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.require_any_permission(["canAssignPosts", "canManageMembers"]))
):
    """Assign or modify user roles and posts.
    Enforces:
    - Only Faculty can assign posts / change roles
    - No self-escalation
    - Last faculty account protection
    - Audit logging
    """
    target_user = db.query(models.User).filter(
        (models.User.id == req.user_id) |
        (models.User.roll_no == req.user_id.upper()) |
        (models.User.email == req.user_id.lower())
    ).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Protection Rule 0: SuperAdmin cannot be modified or demoted by any role member, including Faculty
    if target_user.roll_no == "SA01" or target_user.role == "super_admin":
        if auth.normalize_role(actor.role) != "super_admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Protection Rule: SuperAdmin root authority cannot be modified or deleted by any role member, including Faculty."
            )

    # Protection Rule 1: No self-escalation
    auth.verify_no_self_escalation(actor, target_user.id)

    # Protection Rule 2: Last faculty protection
    auth.verify_last_faculty_protection(db, target_user, req.role, actor=actor)

    before_role = target_user.role
    before_post = target_user.post
    normalized_new_role = auth.normalize_role(req.role)

    target_user.role = normalized_new_role
    if req.post is not None:
        target_user.post = req.post
    if req.tenure_end is not None:
        target_user.tenure_end = req.tenure_end
    if req.team is not None:
        target_user.team = req.team
    if req.is_volunteer is not None:
        target_user.is_volunteer = req.is_volunteer

    db.commit()

    auth.log_audit(
        db=db,
        actor=actor,
        action="role_change",
        target_type="user",
        target_id=target_user.id,
        target_name=target_user.name,
        before_state=f"role={before_role}, post={before_post}",
        after_state=f"role={target_user.role}, post={target_user.post}",
        details=f"Faculty updated role to {target_user.role} and post to {target_user.post}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEMBER_CLEARANCE_UPDATED", {
            "user_id": target_user.id,
            "roll_no": target_user.roll_no,
            "name": target_user.name,
            "role": target_user.role,
            "post": target_user.post,
            "team": target_user.team
        })
    except Exception:
        pass

    return {"success": True, "message": f"Updated role to {target_user.role}"}

@router.post("/assign-team-admin")
def assign_team_admin(
    req: schemas.TeamAdminAssignRequest,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.require_permission("canAssignPosts"))
):
    """Squad-level post assignment.
    Only Faculty can assign posts.
    team_admin is a squad-level post, not a distinct identity role.
    """
    target_user = db.query(models.User).filter(
        (models.User.id == req.user_id) |
        (models.User.roll_no == req.user_id.upper()) |
        (models.User.email == req.user_id.lower())
    ).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Protection: No self-escalation
    auth.verify_no_self_escalation(actor, target_user.id)

    before_post = target_user.post
    # Preserve student role, set squad post
    target_user.role = "student"
    target_user.post = req.post or "Team Admin"
    target_user.team = req.team
    target_user.tenure_end = req.tenure_end
    target_user.status = "active"

    db.commit()

    auth.log_audit(
        db=db,
        actor=actor,
        action="post_assignment",
        target_type="user",
        target_id=target_user.id,
        target_name=target_user.name,
        before_state=f"post={before_post}",
        after_state=f"squad={req.team}, post={target_user.post}",
        details=f"Assigned squad post {target_user.post} in {req.team} with tenure_end={req.tenure_end}"
    )

    return {"success": True, "message": f"Assigned {target_user.name} as {target_user.post} for {req.team}"}

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Retrieve full official roster of chapter scholars, faculty, and leads from TiDB database."""
    users = db.query(models.User).order_by(models.User.name.asc()).all()
    return [schemas.UserResponse.from_orm(u) for u in users]

@router.post("/users", response_model=schemas.UserResponse)
def enroll_user(
    req: schemas.UserEnrollRequest,
    db: Session = Depends(get_db),
    actor: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Enroll a new scholar into the chapter directory with immediate TiDB Cloud persistence and live multi-device broadcast."""
    # Check if roll number or email already exists
    clean_roll = req.roll_no.strip().upper()
    clean_email = req.email.strip().lower() if req.email and req.email.strip() else f"{clean_roll.lower()}@geohub.edu"

    existing = db.query(models.User).filter(
        (models.User.roll_no == clean_roll) | (models.User.email == clean_email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Scholar with roll number '{clean_roll}' or email '{clean_email}' already exists.")

    default_pwd = req.password or "geohub"
    new_user = models.User(
        id=f"u_{uuid.uuid4().hex[:12]}",
        roll_no=clean_roll,
        name=req.name.strip(),
        email=clean_email,
        hashed_password=auth.get_password_hash(default_pwd),
        role=req.role or "student",
        post=req.post or "Student Member",
        department=req.department or "Geoinformatics Engineering",
        year_of_study=req.year_of_study or "1st Year",
        phone=req.phone,
        team=req.team or "General",
        team_role=req.team_role or "Member",
        is_volunteer=req.is_volunteer or False,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    acting_actor = actor or db.query(models.User).filter(models.User.roll_no == "SA01").first() or new_user
    auth.log_audit(
        db=db,
        actor=acting_actor,
        action="member_enrolled",
        target_type="user",
        target_id=new_user.id,
        target_name=new_user.name,
        details=f"Enrolled new scholar {new_user.name} ({clean_roll}) with role {new_user.role}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEMBER_ENROLLED", {
            "id": new_user.id,
            "roll_no": new_user.roll_no,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "department": new_user.department,
            "year_of_study": new_user.year_of_study,
            "team": new_user.team,
            "status": new_user.status,
        })
    except Exception:
        pass

    return schemas.UserResponse.from_orm(new_user)

