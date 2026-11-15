import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, SessionLocal, engine, Base
import models
import auth
import schemas

router = APIRouter(prefix="/admin", tags=["SuperAdmin Governance & Operation Controls"])

# Baseline canonical roles (9 distinct platform roles)
CANONICAL_ROLES = [
    {"role": "super_admin", "badge": "Super Admin", "default_post": "System Administrator", "default_name": "System SuperAdmin", "default_roll": "SA01", "default_email": "superadmin@college.edu"},
    {"role": "faculty", "badge": "Faculty Advisor", "default_post": "Faculty Advisor", "default_name": "Dr. Sarah Jenkins", "default_roll": "FAC01", "default_email": "sarah.jenkins@college.edu"},
    {"role": "coordinator", "badge": "Coordinator", "default_post": "Club President", "default_name": "Alex Rivera", "default_roll": "21GEO001", "default_email": "alex.rivera@college.edu"},
    {"role": "management", "badge": "Management Lead", "default_post": "Vice President", "default_name": "Elena Rostova", "default_roll": "21GEO010", "default_email": "elena.rostova@college.edu"},
    {"role": "documentation", "badge": "Documentation", "default_post": "Documentation Lead", "default_name": "Aarav Patel", "default_roll": "22GEO018", "default_email": "aarav.patel@college.edu"},
    {"role": "treasurer", "badge": "Treasurer", "default_post": "Treasurer", "default_name": "Ananya Iyer", "default_roll": "22GEO019", "default_email": "ananya.iyer@college.edu"},
    {"role": "promotion", "badge": "Promotion", "default_post": "Promotion Lead", "default_name": "David Chen", "default_roll": "22GEO014", "default_email": "david.chen@college.edu"},
    {"role": "volunteer", "badge": "Lead Volunteer", "default_post": "Squad Volunteer", "default_name": "Liam Vance", "default_roll": "23GEO042", "default_email": "liam.vance@college.edu"},
    {"role": "student", "badge": "Student Member", "default_post": "Club Member", "default_name": "Maya Patel", "default_roll": "23GEO088", "default_email": "maya.patel@college.edu"},
]

class RoleCredentialPayload(BaseModel):
    role: str
    roll_no: str
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = "active"

class MatrixUpdatePayload(BaseModel):
    role: str
    permissions: Optional[Dict[str, bool]] = None
    action: Optional[str] = None # "enable_all" | "disable_all" | None

class MatrixResetPayload(BaseModel):
    role: Optional[str] = "all"

def load_overrides_into_cache():
    """Initializes in-memory auth.DYNAMIC_OVERRIDES from database records."""
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    db = SessionLocal()
    try:
        overrides = db.query(models.RolePermissionOverride).all()
        for ov in overrides:
            try:
                auth.DYNAMIC_OVERRIDES[ov.role] = json.loads(ov.overrides_json)
            except Exception:
                pass
    except Exception as e:
        print(f"[Admin Notice] Could not load permission overrides: {e}")
    finally:
        db.close()

# Load overrides on module load
load_overrides_into_cache()

@router.get("/roles-credentials")
def get_roles_credentials(db: Session = Depends(get_db)):
    """
    Returns credentials, usernames/roll numbers, scholar names, emails,
    and account statuses for all 8 official chapter roles.
    """
    results = []
    for meta in CANONICAL_ROLES:
        role_key = meta["role"]
        norm = auth.normalize_role(role_key)

        # Look up existing user for this role
        user = db.query(models.User).filter(
            (models.User.role == role_key) | (models.User.role == norm)
        ).first()

        if user:
            results.append({
                "role": role_key,
                "badge": meta["badge"],
                "user_id": user.id,
                "name": user.name,
                "roll_no": user.roll_no or meta["default_roll"],
                "email": user.email,
                "post": user.post or meta["default_post"],
                "status": user.status or "active",
                "is_registered": True,
            })
        else:
            results.append({
                "role": role_key,
                "badge": meta["badge"],
                "user_id": f"u_{role_key}_unassigned",
                "name": "Unassigned",
                "roll_no": meta["default_roll"],
                "email": meta["default_email"],
                "post": meta["default_post"],
                "status": "unassigned",
                "is_registered": False,
            })
    return results

@router.post("/set-role-credentials")
def set_role_credentials(payload: RoleCredentialPayload, db: Session = Depends(get_db)):
    """
    Allows SuperAdmin to set or update the Username (Roll No / Email),
    scholar name, and password for any role.
    """
    role_key = payload.role.strip().lower()
    roll_no_clean = payload.roll_no.strip().upper()
    norm = auth.normalize_role(role_key)

    # Find existing user for this role or roll number
    user = db.query(models.User).filter(
        (models.User.role == role_key) | (models.User.roll_no == roll_no_clean)
    ).first()

    default_meta = next((r for r in CANONICAL_ROLES if r["role"] == role_key), None)
    default_name = default_meta["default_name"] if default_meta else f"Role ({role_key})"
    default_email = default_meta["default_email"] if default_meta else f"{role_key}@college.edu"
    default_post = default_meta["default_post"] if default_meta else "Officer"

    if not user:
        # Create new user record
        user = models.User(
            roll_no=roll_no_clean,
            name=payload.name or default_name,
            email=payload.email or default_email,
            role=role_key,
            post=default_post,
            hashed_password=auth.get_password_hash(payload.password or "GeoHub2026!"),
            status=payload.status or "active",
        )
        db.add(user)
    else:
        # Update existing user
        user.roll_no = roll_no_clean
        if payload.name:
            user.name = payload.name
        if payload.email:
            user.email = payload.email
        if payload.password and payload.password.strip():
            user.hashed_password = auth.get_password_hash(payload.password.strip())
        if payload.status:
            user.status = payload.status
        user.role = role_key

    # Log governance audit event
    audit = models.AuditLog(
        actor_id="super_admin",
        actor_name="Super Admin",
        action="UPDATE_ROLE_CREDENTIALS",
        target_type="role_credentials",
        target_id=role_key,
        target_name=f"{role_key} ({roll_no_clean})",
        details=f"SuperAdmin updated credentials for {role_key}. Username set to {roll_no_clean}.",
    )
    db.add(audit)

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": f"Credentials updated for role '{role_key}' (Username: {user.roll_no})",
        "user": {
            "id": user.id,
            "role": user.role,
            "roll_no": user.roll_no,
            "name": user.name,
            "email": user.email,
            "status": user.status,
        }
    }

@router.get("/permissions-matrix")
def get_permissions_matrix():
    """
    Returns the complete list of operation flags and current effective
    authorities for all roles, including live overrides.
    """
    return auth.get_effective_matrix()

@router.put("/permissions-matrix")
def update_permissions_matrix(payload: MatrixUpdatePayload, db: Session = Depends(get_db)):
    """
    Updates operational authorities for a role.
    Supports individual flag toggling, or master 'enable_all' / 'disable_all'.
    """
    role_key = payload.role.strip().lower()
    norm = auth.normalize_role(role_key)
    all_flags = auth.MATRIX.get("flags", [])

    # Load existing overrides for this role or create new
    override_rec = db.query(models.RolePermissionOverride).filter(
        models.RolePermissionOverride.role == norm
    ).first()

    current_perms = {}
    if override_rec and override_rec.overrides_json:
        try:
            current_perms = json.loads(override_rec.overrides_json)
        except Exception:
            current_perms = {}
    else:
        current_perms = dict(auth.MATRIX.get("matrix", {}).get(norm, {}))

    if payload.action == "enable_all":
        for flag in all_flags:
            current_perms[flag] = True
    elif payload.action == "disable_all":
        # Safeguard: Do not allow disabling all operations for super_admin
        if norm == "super_admin":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SuperAdmin operations cannot be completely revoked."
            )
        for flag in all_flags:
            current_perms[flag] = False
    elif payload.permissions:
        current_perms.update(payload.permissions)

    # Persist in database
    if not override_rec:
        override_rec = models.RolePermissionOverride(
            role=norm,
            overrides_json=json.dumps(current_perms),
            updated_by="super_admin",
        )
        db.add(override_rec)
    else:
        override_rec.overrides_json = json.dumps(current_perms)
        override_rec.updated_at = datetime.utcnow()

    # Update in-memory auth cache immediately
    auth.DYNAMIC_OVERRIDES[norm] = current_perms

    # Audit log
    audit = models.AuditLog(
        actor_id="super_admin",
        actor_name="Super Admin",
        action="UPDATE_PERMISSIONS_MATRIX",
        target_type="permissions_matrix",
        target_id=norm,
        target_name=f"Role: {norm}",
        details=f"SuperAdmin updated operation authorities for {norm}. Action: {payload.action or 'custom_toggle'}.",
    )
    db.add(audit)

    db.commit()

    return {
        "status": "success",
        "message": f"Updated operations authority for role '{norm}'",
        "effective_matrix": auth.get_effective_matrix(),
    }

@router.post("/reset-permissions-matrix")
def reset_permissions_matrix(payload: MatrixResetPayload, db: Session = Depends(get_db)):
    """
    Restores default institutional permissions matrix baseline.
    """
    target = (payload.role or "all").strip().lower()

    if target == "all":
        db.query(models.RolePermissionOverride).delete()
        auth.DYNAMIC_OVERRIDES.clear()
    else:
        norm = auth.normalize_role(target)
        db.query(models.RolePermissionOverride).filter(
            models.RolePermissionOverride.role == norm
        ).delete()
        auth.DYNAMIC_OVERRIDES.pop(norm, None)

    audit = models.AuditLog(
        actor_id="super_admin",
        actor_name="Super Admin",
        action="RESET_PERMISSIONS_MATRIX",
        target_type="permissions_matrix",
        target_id=target,
        target_name=f"Target: {target}",
        details=f"SuperAdmin reset permissions matrix to default baseline for {target}.",
    )
    db.add(audit)

    db.commit()

    return {
        "status": "success",
        "message": f"Reset permissions matrix to default institutional baseline for {target}",
        "effective_matrix": auth.get_effective_matrix(),
    }

# ==========================================
# SuperAdmin Faculty Provisioning & Governance
# ==========================================

@router.get("/faculty", response_model=List[schemas.FacultyResponse])
def get_faculty_roster(db: Session = Depends(get_db)):
    """
    Returns all officially provisioned Faculty members.
    """
    faculty_users = db.query(models.User).filter(
        models.User.role == "faculty"
    ).order_by(models.User.created_at.desc()).all()
    return faculty_users

@router.post("/faculty", response_model=schemas.FacultyResponse)
def provision_faculty_account(
    payload: schemas.FacultyCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """
    Allows SuperAdmin to provision a new Faculty Advisor with verified credentials.
    """
    clean_roll = payload.roll_no.strip().upper()
    clean_email = payload.email.strip().lower()

    # Check for existing account by roll number or email
    existing_user = db.query(models.User).filter(
        (models.User.roll_no == clean_roll) | (models.User.email == clean_email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with roll number '{clean_roll}' or email '{clean_email}' already exists."
        )

    pwd = (payload.password or "GeoHub2026!").strip()
    hashed_pwd = auth.get_password_hash(pwd)

    new_faculty = models.User(
        roll_no=clean_roll,
        email=clean_email,
        name=payload.name.strip(),
        hashed_password=hashed_pwd,
        role="faculty",
        post=payload.post or "Faculty Advisor",
        department=payload.department or "Geoinformatics Engineering",
        year_of_study="Faculty Staff",
        phone=payload.phone or "+91 94420 18820",
        team="Management",
        team_role="Faculty Advisor",
        squad_memberships=json.dumps([{"squad": "Management", "isLead": True}]),
        is_volunteer=False,
        status="active"
    )
    db.add(new_faculty)

    # Log audit entry
    actor_id = current_user.id if current_user else "u_super_admin_sa01"
    actor_name = current_user.name if current_user else "System SuperAdmin"
    audit = models.AuditLog(
        actor_id=actor_id,
        actor_name=actor_name,
        action="FACULTY_PROVISIONED",
        target_type="user",
        target_id=clean_roll,
        target_name=payload.name.strip(),
        details=f"SuperAdmin provisioned Faculty account for {payload.name} ({clean_roll}) in {payload.department}.",
    )
    db.add(audit)
    db.commit()
    db.refresh(new_faculty)

    # Real-time multi-device sync
    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("FACULTY_PROVISIONED", {
            "id": new_faculty.id,
            "roll_no": new_faculty.roll_no,
            "name": new_faculty.name,
            "email": new_faculty.email,
            "role": new_faculty.role,
            "department": new_faculty.department,
            "post": new_faculty.post,
        })
    except Exception:
        pass

    return new_faculty

@router.delete("/faculty/{faculty_id}")
def delete_faculty_account(
    faculty_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """
    Deactivates or deletes a faculty member account. Unconditionally allowed for SuperAdmin.
    """
    user = db.query(models.User).filter(
        models.User.id == faculty_id,
        models.User.role == "faculty"
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty account '{faculty_id}' not found."
        )

    actor_id = current_user.id if current_user else "u_super_admin_sa01"
    actor_name = current_user.name if current_user else "System SuperAdmin"

    audit = models.AuditLog(
        actor_id=actor_id,
        actor_name=actor_name,
        action="FACULTY_DELETED",
        target_type="user",
        target_id=user.id,
        target_name=user.name,
        details=f"SuperAdmin removed Faculty account {user.name} ({user.roll_no}).",
    )
    db.add(audit)
    db.delete(user)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("FACULTY_DELETED", {"id": faculty_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Faculty account '{faculty_id}' successfully removed."}

@router.put("/faculty/{faculty_id}", response_model=schemas.FacultyResponse)
def update_faculty_account(
    faculty_id: str,
    payload: schemas.FacultyUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """
    Allows SuperAdmin to modify and update all details of a Faculty Advisor account.
    """
    user = db.query(models.User).filter(
        models.User.id == faculty_id,
        models.User.role == "faculty"
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Faculty account '{faculty_id}' not found."
        )

    # Validate uniqueness if roll_no or email changed
    if payload.roll_no and payload.roll_no.strip().upper() != user.roll_no:
        clean_roll = payload.roll_no.strip().upper()
        existing = db.query(models.User).filter(models.User.roll_no == clean_roll, models.User.id != faculty_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Roll number '{clean_roll}' already in use.")
        user.roll_no = clean_roll

    if payload.email and payload.email.strip().lower() != user.email:
        clean_email = payload.email.strip().lower()
        existing = db.query(models.User).filter(models.User.email == clean_email, models.User.id != faculty_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email '{clean_email}' already in use.")
        user.email = clean_email

    if payload.name is not None and payload.name.strip():
        user.name = payload.name.strip()
    if payload.department is not None:
        user.department = payload.department.strip()
    if payload.post is not None:
        user.post = payload.post.strip()
        user.team_role = payload.post.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip()
    if payload.status is not None:
        user.status = payload.status.strip().lower()
    if payload.password and payload.password.strip():
        user.hashed_password = auth.get_password_hash(payload.password.strip())

    user.updated_at = datetime.utcnow()

    actor_id = current_user.id if current_user else "u_super_admin_sa01"
    actor_name = current_user.name if current_user else "System SuperAdmin"

    audit = models.AuditLog(
        actor_id=actor_id,
        actor_name=actor_name,
        action="FACULTY_UPDATED",
        target_type="user",
        target_id=user.id,
        target_name=user.name,
        details=f"SuperAdmin updated details for Faculty {user.name} ({user.roll_no}).",
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("FACULTY_UPDATED", {
            "id": user.id,
            "roll_no": user.roll_no,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "department": user.department,
            "post": user.post,
            "status": user.status,
        })
    except Exception:
        pass

    return user

# ==========================================
# SuperAdmin Universal User Management CRUD
# ==========================================

@router.get("/users", response_model=List[schemas.UserResponse])
def get_admin_users(db: Session = Depends(get_db)):
    """Returns all users across all roles."""
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

@router.post("/users", response_model=schemas.UserResponse)
def create_admin_user(
    payload: schemas.UserAdminCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Allows SuperAdmin to provision any user into any role."""
    clean_roll = payload.roll_no.strip().upper()
    clean_email = payload.email.strip().lower()

    existing = db.query(models.User).filter(
        (models.User.roll_no == clean_roll) | (models.User.email == clean_email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User with roll number '{clean_roll}' or email '{clean_email}' already exists.")

    norm_role = auth.normalize_role(payload.role)
    pwd = (payload.password or "GeoHub2026!").strip()
    hashed = auth.get_password_hash(pwd)

    new_user = models.User(
        roll_no=clean_roll,
        email=clean_email,
        name=payload.name.strip(),
        hashed_password=hashed,
        role=norm_role,
        post=payload.post,
        department=payload.department or "Geoinformatics Engineering",
        year_of_study=payload.year_of_study or "1st Year",
        phone=payload.phone or "+91 94420 18820",
        team=payload.team or "General",
        team_role=payload.team_role or "Member",
        is_volunteer=bool(payload.is_volunteer),
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEMBER_ENROLLED", {"id": new_user.id, "name": new_user.name, "role": new_user.role})
    except Exception:
        pass

    return schemas.UserResponse.from_orm(new_user)

@router.put("/users/{user_id}", response_model=schemas.UserResponse)
def update_admin_user(
    user_id: str,
    payload: schemas.UserAdminUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Allows SuperAdmin to update any details of any user account."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if payload.roll_no and payload.roll_no.strip().upper() != user.roll_no:
        clean_roll = payload.roll_no.strip().upper()
        existing = db.query(models.User).filter(models.User.roll_no == clean_roll, models.User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Roll number '{clean_roll}' already in use.")
        user.roll_no = clean_roll

    if payload.email and payload.email.strip().lower() != user.email:
        clean_email = payload.email.strip().lower()
        existing = db.query(models.User).filter(models.User.email == clean_email, models.User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Email '{clean_email}' already in use.")
        user.email = clean_email

    if payload.name is not None and payload.name.strip():
        user.name = payload.name.strip()
    if payload.role is not None:
        user.role = auth.normalize_role(payload.role)
    if payload.post is not None:
        user.post = payload.post.strip()
    if payload.department is not None:
        user.department = payload.department.strip()
    if payload.year_of_study is not None:
        user.year_of_study = payload.year_of_study.strip()
    if payload.phone is not None:
        user.phone = payload.phone.strip()
    if payload.team is not None:
        user.team = payload.team.strip()
    if payload.team_role is not None:
        user.team_role = payload.team_role.strip()
    if payload.is_volunteer is not None:
        user.is_volunteer = payload.is_volunteer
    if payload.status is not None:
        user.status = payload.status.strip().lower()
    if payload.password and payload.password.strip():
        user.hashed_password = auth.get_password_hash(payload.password.strip())

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    return schemas.UserResponse.from_orm(user)

@router.delete("/users/{user_id}")
def delete_admin_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Allows SuperAdmin to delete any user account (except SA01)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.roll_no == "SA01" or user.role == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot delete root System SuperAdmin account.")

    actor_id = current_user.id if current_user else "u_super_admin_sa01"
    actor_name = current_user.name if current_user else "System SuperAdmin"

    audit = models.AuditLog(
        actor_id=actor_id,
        actor_name=actor_name,
        action="USER_DELETED",
        target_type="user",
        target_id=user.id,
        target_name=user.name,
        details=f"SuperAdmin deleted user account {user.name} ({user.roll_no}).",
    )
    db.add(audit)
    db.delete(user)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEMBER_DELETED", {"id": user_id, "name": user.name})
    except Exception:
        pass

    return {"status": "success", "message": f"User '{user.name}' ({user_id}) successfully deleted."}

@router.post("/purge-data")
def purge_platform_data(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """
    Purges all dummy and operational data across events, tasks, finance, logs,
    and removes all users except the sole System SuperAdmin (SA01).
    """
    from purge_all_data import run_purge
    res = run_purge()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("PLATFORM_PURGED", {"timestamp": datetime.utcnow().isoformat()})
    except Exception:
        pass

    return {"status": "success", "message": "All dummy records and user accounts purged successfully.", "summary": res}

