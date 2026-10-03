from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
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

    # Check if first user in system: automatically make them super_admin!
    user_count = db.query(models.User).count()
    initial_role = "super_admin" if user_count == 0 else "member"
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

    token = auth.create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.from_orm(new_user)
    )

@router.post("/login", response_model=schemas.TokenResponse)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    email_clean = login_data.email.strip().lower()
    user = db.query(models.User).filter(models.User.email == email_clean).first()

    if not user or not auth.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    if user.status == "disabled":
        raise HTTPException(status_code=403, detail="Your account has been disabled by an administrator.")

    token = auth.create_access_token(data={"sub": user.id, "role": user.role})
    return schemas.TokenResponse(
        access_token=token,
        user=schemas.UserResponse.from_orm(user)
    )

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserResponse.from_orm(current_user)

@router.post("/set-role")
def set_user_role(
    req: schemas.RoleAssignRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_super_admin)
):
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.role = req.role
    if req.team is not None:
        target_user.team = req.team
    if req.is_volunteer is not None:
        target_user.is_volunteer = req.is_volunteer

    db.commit()
    return {"success": True, "message": f"Updated role to {req.role}"}

@router.post("/assign-team-admin")
def assign_team_admin(
    req: schemas.TeamAdminAssignRequest,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    target_user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    target_user.role = "team_admin"
    target_user.team = req.team
    target_user.status = "active"

    # Add to team table
    team = db.query(models.Team).filter(models.Team.name == req.team).first()
    if team:
        admin_ids = json.loads(team.admin_user_ids or "[]")
        if target_user.id not in admin_ids:
            admin_ids.append(target_user.id)
            team.admin_user_ids = json.dumps(admin_ids)

        member_ids = json.loads(team.member_user_ids or "[]")
        if target_user.id not in member_ids:
            member_ids.append(target_user.id)
            team.member_user_ids = json.dumps(member_ids)

    db.commit()
    return {"success": True, "message": f"Assigned {target_user.name} as admin for {req.team}"}
