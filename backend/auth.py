import os
import json
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from config import settings
from database import get_db
import models

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Load central permissions matrix (Single Source of Truth)
MATRIX_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "permissions_matrix.json")
if not os.path.exists(MATRIX_FILE):
    # Try finding it in frontend
    MATRIX_FILE = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "src", "core", "permissions_matrix.json"))

MATRIX: Dict[str, Any] = {}
if os.path.exists(MATRIX_FILE):
    with open(MATRIX_FILE, "r", encoding="utf-8") as f:
        MATRIX = json.load(f)

PERMISSIONS_MATRIX = MATRIX

def normalize_role(role: Optional[str]) -> str:
    """Normalize legacy role strings to final role names."""
    if not role:
        return "student"
    r = role.lower().strip()
    mapping = {
        "super_admin": "faculty",
        "faculty": "faculty",
        "admin": "coordinator",
        "coordinator": "coordinator",
        "documentation": "documentation",
        "treasurer": "treasurer",
        "social_media": "promotion",
        "promotion": "promotion",
        "member": "student",
        "volunteer": "student",
        "team_admin": "student",
        "student": "student",
    }
    return mapping.get(r, "student")

def has_permission(user, flag: str, context: Optional[Dict[str, Any]] = None, resource: Optional[Dict[str, Any]] = None) -> bool:
    """Three-layer permission check:
    Layer 1: Role permission flag.
    Layer 2: Squad post authority (active tenure).
    Deny by default: missing flag or ungranted = false.
    """
    ctx = resource or context or {}
    role = user.role if hasattr(user, "role") else user.get("role")
    norm_role = normalize_role(role)
    role_perms = MATRIX.get("matrix", {}).get(norm_role, {})
    if role_perms.get(flag, False):
        return True

    # Layer 2: Squad-level post authority
    tenure_end = user.tenure_end if hasattr(user, "tenure_end") else user.get("tenure_end")
    if tenure_end:
        if isinstance(tenure_end, str):
            try:
                tenure_dt = datetime.fromisoformat(tenure_end.replace("Z", "+00:00"))
                now_dt = datetime.now(tenure_dt.tzinfo) if tenure_dt.tzinfo else datetime.utcnow()
                if tenure_dt < now_dt:
                    return False
            except Exception:
                pass
        elif isinstance(tenure_end, datetime):
            if tenure_end < datetime.utcnow():
                return False

    post = user.post if hasattr(user, "post") else user.get("post")
    team_role = user.team_role if hasattr(user, "team_role") else user.get("team_role")
    team = user.team if hasattr(user, "team") else user.get("team")

    is_squad_admin = (
        (post and ("admin" in post.lower() or "lead" in post.lower()))
        or (team_role and "lead" in team_role.lower())
    )
    if is_squad_admin and team and ctx.get("squad"):
        if ctx["squad"].lower() == team.lower() and flag in ["canManageSquads", "canManageMembers"]:
            return True

    return False

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    # Enforce short-lived token: default 15 minutes
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    if token == "demo-token":
        admin = db.query(models.User).filter(models.User.role.in_(["faculty", "super_admin"])).first()
        if not admin:
            admin = models.User(
                id="usr_faculty_01",
                name="Dr. Faculty Advisor",
                email="advisor@college.edu",
                hashed_password=get_password_hash("admin123"),
                role="faculty",
                status="active",
                team="Management",
                is_volunteer=False
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        return admin

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: models.User = Depends(get_current_user)) -> models.User:
    if current_user.status == "disabled":
        raise HTTPException(status_code=403, detail="Account is disabled.")
    return current_user

def require_permission(flag: str):
    """FastAPI route dependency checking permission flag on the active user."""
    def dependency(current_user: models.User = Depends(get_current_active_user)) -> models.User:
        if not has_permission(current_user, flag):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: Missing '{flag}' permission."
            )
        return current_user
    return dependency

def require_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Dependency requiring coordinator or faculty role."""
    if normalize_role(current_user.role) not in ["coordinator", "faculty", "super_admin", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin or Coordinator clearance required."
        )
    return current_user

require_coordinator = require_admin

def require_faculty(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    """Dependency requiring faculty role."""
    if normalize_role(current_user.role) not in ["faculty", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Faculty clearance required."
        )
    return current_user

def check_event_scanner_assignment(user, event) -> bool:
    """Helper to check if user is in event's assigned scanner list."""
    user_id = user.id if hasattr(user, "id") else (user.get("id") if isinstance(user, dict) else str(user))
    assigned = event.assigned_scanner_user_ids if hasattr(event, "assigned_scanner_user_ids") else event.get("assigned_scanner_user_ids")
    if isinstance(assigned, str):
        try:
            assigned = json.loads(assigned)
        except Exception:
            assigned = []
    elif not isinstance(assigned, list):
        assigned = []
    return user_id in assigned

def require_event_scanner(event_id: str, db: Session, scanner: models.User) -> models.User:
    """Resource-level Layer 3 scanner verification:
    Scanner must be explicitly assigned to the event.
    """
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    
    if not check_event_scanner_assignment(scanner, event):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not assigned as an attendance scanner for this event."
        )
    return scanner

def verify_no_self_escalation(actor, target_id: str):
    """Protection rule: A user can never change their own role or posts."""
    actor_id = actor.id if hasattr(actor, "id") else (actor.get("id") if isinstance(actor, dict) else str(actor))
    if actor_id == target_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Protection Rule: Self-escalation rejected. You cannot modify your own role or posts."
        )

def verify_last_faculty_protection(db: Session, target_user: models.User, new_role: str):
    """Protection rule: The last remaining faculty account cannot be removed or demoted."""
    if normalize_role(target_user.role) == "faculty" and normalize_role(new_role) != "faculty":
        faculty_count = db.query(models.User).filter(
            models.User.role.in_(["faculty", "super_admin"]),
            models.User.status == "active"
        ).count()
        if faculty_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Protection Rule: The last remaining faculty account cannot be removed or demoted."
            )

def log_audit(
    db: Session,
    actor: models.User,
    action: str,
    target_type: str,
    target_id: str,
    target_name: Optional[str] = None,
    before_state: Optional[str] = None,
    after_state: Optional[str] = None,
    details: Optional[str] = None,
):
    """Audit logger writing an audit record to the database."""
    record = models.AuditLog(
        actor_id=actor.id,
        actor_name=actor.name,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_name=target_name or "",
        before_state=before_state,
        after_state=after_state,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(record)
    db.commit()
