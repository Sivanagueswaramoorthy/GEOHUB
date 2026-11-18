import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth
from routers.sync_router import broadcast_sync_event

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[schemas.NotificationResponse])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Retrieve all notifications relevant to the active user (plus broadcast notifications)."""
    user_id = current_user.id if current_user else "all"
    notifications = db.query(models.Notification).filter(
        (models.Notification.user_id == user_id) | (models.Notification.user_id == "all")
    ).order_by(models.Notification.created_at.desc()).limit(100).all()
    return notifications

@router.post("/broadcast", response_model=schemas.NotificationResponse)
def broadcast_campus_notification(
    payload: schemas.NotificationBroadcastRequest,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Dispatches a campus-wide push notification and audit alert across all mobile clients."""
    actor_id = current_user.id if current_user else "u_super_admin_sa01"
    actor_name = current_user.name if current_user else "System SuperAdmin"

    new_notif = models.Notification(
        id=f"notif_{uuid.uuid4().hex[:12]}",
        user_id="all",
        title=payload.title.strip(),
        message=payload.message.strip(),
        type=payload.type or "alert",
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(new_notif)
    db.commit()
    db.refresh(new_notif)

    # Real-time multi-device SSE broadcast
    broadcast_sync_event("CAMPUS_BROADCAST", {
        "id": new_notif.id,
        "title": new_notif.title,
        "message": new_notif.message,
        "type": new_notif.type,
        "urgency": payload.urgency or "normal",
        "actor": actor_name,
        "timestamp": new_notif.created_at.isoformat()
    })

    return new_notif

@router.put("/{notif_id}/read", response_model=schemas.NotificationResponse)
def mark_notification_read(
    notif_id: str,
    db: Session = Depends(get_db)
):
    """Mark a notification as read."""
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.put("/read-all")
def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """Mark all notifications for the active user as read."""
    user_id = current_user.id if current_user else "all"
    db.query(models.Notification).filter(
        (models.Notification.user_id == user_id) | (models.Notification.user_id == "all")
    ).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read."}
