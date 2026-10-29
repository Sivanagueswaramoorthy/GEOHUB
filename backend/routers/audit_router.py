from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/audit-logs", tags=["Audit Log"])

@router.get("", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(
    action: Optional[str] = None,
    target_type: Optional[str] = None,
    actor_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    faculty: models.User = Depends(auth.require_permission("canViewAuditLog"))
):
    """Faculty-only viewer screen for audit logs with filters."""
    query = db.query(models.AuditLog)

    if action:
        query = query.filter(models.AuditLog.action == action)
    if target_type:
        query = query.filter(models.AuditLog.target_type == target_type)
    if actor_id:
        query = query.filter(models.AuditLog.actor_id == actor_id)

    logs = query.order_by(models.AuditLog.timestamp.desc()).limit(limit).all()
    return logs
