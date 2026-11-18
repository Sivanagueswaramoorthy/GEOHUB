import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
import auth

router = APIRouter(prefix="/meetings", tags=["Meetings & MoM"])

def _serialize_meeting(m: models.Meeting) -> dict:
    attendees = []
    if m.attendee_ids:
        try:
            attendees = json.loads(m.attendee_ids)
        except Exception:
            attendees = []
    
    actions = []
    if m.action_items:
        try:
            actions = json.loads(m.action_items)
        except Exception:
            actions = []

    return {
        "id": m.id,
        "title": m.title,
        "type": m.type,
        "event_id": m.event_id,
        "event_title": m.event_title,
        "date_time": m.date_time,
        "venue": m.venue,
        "organizer_name": m.organizer_name,
        "attendee_ids": attendees,
        "agenda": m.agenda or "",
        "mom_notes": m.mom_notes,
        "action_items": actions,
        "status": m.status,
        "created_at": m.created_at,
    }

@router.get("", response_model=List[schemas.MeetingResponse])
def get_meetings(
    event_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Meeting)
    if event_id:
        query = query.filter(models.Meeting.event_id == event_id)
    if status:
        query = query.filter(models.Meeting.status == status)
    
    meetings = query.order_by(models.Meeting.created_at.desc()).all()
    return [_serialize_meeting(m) for m in meetings]

@router.post("", response_model=schemas.MeetingResponse)
def create_meeting(
    req: schemas.MeetingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    organizer = req.organizer_name or current_user.name
    meeting = models.Meeting(
        title=req.title,
        type=req.type or "general",
        event_id=req.event_id,
        event_title=req.event_title,
        date_time=req.date_time,
        venue=req.venue,
        organizer_name=organizer,
        attendee_ids=json.dumps(req.attendee_ids or []),
        agenda=req.agenda or "",
        status="scheduled"
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="meeting_created",
        target_type="meeting",
        target_id=meeting.id,
        target_name=meeting.title,
        details=f"Created meeting '{meeting.title}' scheduled for {meeting.date_time}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEETING_CREATED", _serialize_meeting(meeting))
    except Exception:
        pass

    return _serialize_meeting(meeting)

@router.patch("/{meeting_id}/mom", response_model=schemas.MeetingResponse)
def update_meeting_mom(
    meeting_id: str,
    req: schemas.MeetingMoMUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    meeting.mom_notes = req.mom_notes
    if req.action_items is not None:
        meeting.action_items = json.dumps(req.action_items)
    meeting.status = "completed"
    db.commit()
    db.refresh(meeting)

    auth.log_audit(
        db=db,
        actor=current_user,
        action="meeting_mom_updated",
        target_type="meeting",
        target_id=meeting.id,
        target_name=meeting.title,
        details=f"Updated MoM notes for meeting '{meeting.title}'"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("MEETING_UPDATED", _serialize_meeting(meeting))
    except Exception:
        pass

    return _serialize_meeting(meeting)

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found.")

    title = meeting.title
    db.delete(meeting)
    db.commit()

    auth.log_audit(
        db=db,
        actor=current_user,
        action="meeting_deleted",
        target_type="meeting",
        target_id=meeting_id,
        target_name=title,
        details=f"Deleted meeting '{title}'"
    )

    return {"success": True, "message": f"Meeting '{title}' deleted."}
