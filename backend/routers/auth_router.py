import uuid
from typing import List
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

    token = auth.create_access_token(data={"sub": new_user.id, "role": new_user.role})
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

    # 2. Canonical alias match (e.g. SA01, FAC01, superadmin, faculty, president)
    if not user:
        alias_map = {
            "super_admin": "SA01",
            "superadmin": "SA01",
            "sa01": "SA01",
            "super": "SA01",
            "faculty": "FAC01",
            "fac01": "FAC01",
            "advisor": "FAC01",
            "coordinator": "21GEO001",
            "president": "21GEO001",
            "admin": "21GEO001",
            "pres": "21GEO001",
            "21geo001": "21GEO001",
            "management": "21GEO010",
            "mgmt": "21GEO010",
            "vicepresident": "21GEO010",
            "vp": "21GEO010",
            "21geo010": "21GEO010",
            "documentation": "22GEO018",
            "doc": "22GEO018",
            "docs": "22GEO018",
            "22geo018": "22GEO018",
            "treasurer": "22GEO019",
            "treasury": "22GEO019",
            "finance": "22GEO019",
            "22geo019": "22GEO019",
            "promotion": "22GEO014",
            "promo": "22GEO014",
            "social": "22GEO014",
            "22geo014": "22GEO014",
            "volunteer": "23GEO042",
            "vol": "23GEO042",
            "23geo042": "23GEO042",
            "student": "23GEO088",
            "member": "23GEO088",
            "scholar": "23GEO088",
            "23geo088": "23GEO088",
        }
        target_roll = alias_map.get(ident_lower)
        if target_roll:
            user = db.query(models.User).filter(models.User.roll_no == target_roll).first()

    # 3. Dynamic auto-seed for any canonical role if missing from database
    if not user:
        canonical_templates = {
            "SA01": ("u_super_admin_sa01", "superadmin@college.edu", "System SuperAdmin", "super_admin", "System Administrator", "Platform Governance & IT"),
            "FAC01": ("u_faculty_fac01", "sarah.jenkins@college.edu", "Dr. Sarah Jenkins", "faculty", "Faculty Advisor", "Geography & Geomatics"),
            "21GEO001": ("u_admin_02", "alex.rivera@college.edu", "Alex Rivera", "coordinator", "Club President", "Geoinformatics Engineering"),
            "21GEO010": ("u_mgmt_06", "elena.rostova@college.edu", "Elena Rostova", "management", "Vice President", "Geology & Environmental Management"),
            "22GEO018": ("u_doc_lead_08", "aarav.patel@college.edu", "Aarav Patel", "documentation", "Documentation Lead", "Geoinformatics & Archival Science"),
            "22GEO019": ("u_treasurer_07", "ananya.iyer@college.edu", "Ananya Iyer", "treasurer", "Treasurer", "Economics & Financial Analytics"),
            "22GEO014": ("u_promo_03", "david.chen@college.edu", "David Chen", "promotion", "Promotion Lead", "Earth Science & Media"),
            "23GEO042": ("u_volunteer_05", "liam.vance@college.edu", "Liam Vance", "volunteer", "Lead Volunteer", "Environmental Studies"),
            "23GEO088": ("u_member_04", "maya.patel@college.edu", "Maya Patel", "student", "Club Member", "Cartography & Geography"),
        }
        matched_roll = alias_map.get(ident_lower, ident_upper)
        if matched_roll in canonical_templates:
            uid, email, name, role, post, dept = canonical_templates[matched_roll]
            user = models.User(
                id=uid,
                roll_no=matched_roll,
                name=name,
                email=email,
                role=role,
                post=post,
                department=dept,
                hashed_password=auth.get_password_hash("GeoHub2026!"),
                is_volunteer=(1 if role == "volunteer" else 0),
                status="active",
                created_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect credentials. Please verify your roll number/email and password.")

    if user.status == "disabled":
        raise HTTPException(status_code=403, detail="Your account has been disabled by an administrator.")

    token = auth.create_access_token(data={"sub": user.id, "role": user.role})
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
    actor: models.User = Depends(auth.require_permission("canAssignPosts"))
):
    """Assign or modify user roles and posts.
    Enforces:
    - Only Faculty can assign posts / change roles
    - No self-escalation
    - Last faculty account protection
    - Audit logging
    """
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Protection Rule 1: No self-escalation
    auth.verify_no_self_escalation(actor, target_user.id)

    # Protection Rule 2: Last faculty protection
    auth.verify_last_faculty_protection(db, target_user, req.role)

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
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
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
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Retrieve full official roster of chapter scholars and leads from database."""
    users = db.query(models.User).order_by(models.User.name.asc()).all()
    return [schemas.UserResponse.from_orm(u) for u in users]

@router.post("/users", response_model=schemas.UserResponse)
def enroll_user(
    req: schemas.UserEnrollRequest,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.get_current_active_user)
):
    """Enroll a new scholar into the chapter directory."""
    # Check if roll number or email already exists
    clean_roll = req.roll_no.strip().upper()
    clean_email = req.email.strip().lower()

    existing = db.query(models.User).filter(
        (models.User.roll_no == clean_roll) | (models.User.email == clean_email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scholar with this roll number or email already exists.")

    new_user = models.User(
        id=f"u_{uuid.uuid4().hex[:12]}",
        roll_no=clean_roll,
        name=req.name.strip(),
        email=clean_email,
        hashed_password=auth.get_password_hash(req.password or "GeoHub2026!"),
        role=req.role or "student",
        post=req.post,
        department=req.department or "Geoinformatics Engineering",
        year_of_study=req.year_of_study or "1st Year",
        phone=req.phone,
        team=req.team,
        team_role=req.team_role,
        is_volunteer=req.is_volunteer or False,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    auth.log_audit(
        db=db,
        actor=actor,
        action="member_enrolled",
        target_type="user",
        target_id=new_user.id,
        target_name=new_user.name,
        details=f"Enrolled new scholar {new_user.name} ({clean_roll}) with role {new_user.role}"
    )

    return schemas.UserResponse.from_orm(new_user)

