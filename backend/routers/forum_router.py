import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/forum", tags=["Campus Forum & Discussions"])

def _serialize_message(m: models.ForumMessage) -> dict:
    liked_by = []
    if m.liked_by:
        try:
            liked_by = json.loads(m.liked_by)
        except Exception:
            liked_by = []

    replies = []
    if m.replies:
        try:
            replies = json.loads(m.replies)
        except Exception:
            replies = []

    return {
        "id": m.id,
        "channel_id": m.channel_id,
        "author_id": m.author_id,
        "author_name": m.author_name,
        "author_role": m.author_role,
        "author_avatar": m.author_avatar,
        "title": m.title,
        "content": m.content,
        "timestamp": m.timestamp,
        "likes": m.likes,
        "liked_by": liked_by,
        "pinned": m.pinned,
        "replies": replies,
        "created_at": m.created_at,
    }

@router.get("/messages", response_model=List[schemas.ForumMessageResponse])
def get_forum_messages(
    channel_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.ForumMessage)
    if channel_id and channel_id.lower() != "all":
        query = query.filter(models.ForumMessage.channel_id == channel_id)

    messages = query.order_by(models.ForumMessage.pinned.desc(), models.ForumMessage.created_at.desc()).all()
    return [_serialize_message(m) for m in messages]

@router.post("/messages", response_model=schemas.ForumMessageResponse)
def create_forum_message(
    req: schemas.ForumMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    now_str = datetime.utcnow().strftime("%b %d, %Y • %I:%M %p")
    msg = models.ForumMessage(
        channel_id=req.channel_id,
        author_id=current_user.id,
        author_name=current_user.name,
        author_role=current_user.role or "student",
        author_avatar=None,
        title=req.title,
        content=req.content,
        timestamp=now_str,
        likes=0,
        liked_by="[]",
        pinned=False,
        replies="[]"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="forum_post_created",
        target_type="forum",
        target_id=msg.id,
        target_name=msg.title or msg.content[:30],
        details=f"Posted message in channel '{msg.channel_id}'"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("FORUM_MESSAGE_CREATED", _serialize_message(msg))
    except Exception:
        pass

    return _serialize_message(msg)

@router.post("/messages/{message_id}/pin", response_model=schemas.ForumMessageResponse)
def toggle_pin_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    msg = db.query(models.ForumMessage).filter(models.ForumMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    msg.pinned = not msg.pinned
    db.commit()
    db.refresh(msg)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="forum_post_pinned" if msg.pinned else "forum_post_unpinned",
        target_type="forum",
        target_id=msg.id,
        target_name=msg.title or msg.content[:30],
        details=f"Message pin toggled to {msg.pinned}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("FORUM_MESSAGE_UPDATED", _serialize_message(msg))
    except Exception:
        pass

    return _serialize_message(msg)

@router.post("/messages/{message_id}/like", response_model=schemas.ForumMessageResponse)
def toggle_like_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    msg = db.query(models.ForumMessage).filter(models.ForumMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    liked_by = []
    if msg.liked_by:
        try:
            liked_by = json.loads(msg.liked_by)
        except Exception:
            liked_by = []

    if current_user.id in liked_by:
        liked_by.remove(current_user.id)
    else:
        liked_by.append(current_user.id)

    msg.liked_by = json.dumps(liked_by)
    msg.likes = len(liked_by)
    db.commit()
    db.refresh(msg)

    return _serialize_message(msg)

@router.delete("/messages/{message_id}")
def delete_forum_message(
    message_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    msg = db.query(models.ForumMessage).filter(models.ForumMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found.")

    is_author = msg.author_id == current_user.id
    is_admin = auth.normalize_role(current_user.role) in ["super_admin", "faculty", "coordinator"]
    if not is_author and not is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message.")

    db.delete(msg)
    db.commit()

    auth.log_audit(
        db=db,
        actor=current_user,
        action="forum_post_deleted",
        target_type="forum",
        target_id=message_id,
        target_name=msg.title or msg.content[:30],
        details=f"Deleted forum message '{message_id}'"
    )

    return {"success": True, "message": "Message deleted."}
