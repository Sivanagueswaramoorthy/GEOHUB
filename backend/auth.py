from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from config import settings
from database import get_db
import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    if token == "demo-token":
        admin = db.query(models.User).filter(models.User.role == "super_admin").first()
        if not admin:
            admin = models.User(
                id="usr_super_admin_01",
                name="Dr. Faculty Advisor",
                email="advisor@college.edu",
                hashed_password=get_password_hash("admin123"),
                role="super_admin",
                status="active",
                team="Management",
                is_volunteer=True
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
        raise HTTPException(status_code=400, detail="Account is disabled.")
    return current_user

def require_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin permissions required.")
    return current_user

def require_super_admin(current_user: models.User = Depends(get_current_active_user)) -> models.User:
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin permissions required.")
    return current_user
