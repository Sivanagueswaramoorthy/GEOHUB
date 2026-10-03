import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[schemas.EventResponse])
def get_events(
    status: Optional[str] = None,
    type: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    query = db.query(models.Event)

    # Regular members only see approved, live, completed
    if current_user.role not in ["admin", "super_admin"]:
        query = query.filter(models.Event.status.in_(["approved", "live", "completed"]))
    elif status:
        query = query.filter(models.Event.status == status)

    if type:
        query = query.filter(models.Event.type == type)
    if academic_year:
        query = query.filter(models.Event.academic_year == academic_year)

    events = query.order_by(models.Event.date_time.desc()).all()
    results = []
    for e in events:
        results.append(schemas.EventResponse(
            id=e.id,
            title=e.title,
            type=e.type,
            date_time=e.date_time,
            venue=e.venue,
            description=e.description,
            budget=e.budget,
            poster_url=e.poster_url,
            status=e.status,
            academic_year=e.academic_year,
            volunteer_user_ids=json.loads(e.volunteer_user_ids or "[]"),
            created_by=e.created_by,
            created_at=e.created_at,
            attendance_count=e.attendance_count
        ))
    return results

@router.get("/{event_id}", response_model=schemas.EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    return schemas.EventResponse(
        id=event.id,
        title=event.title,
        type=event.type,
        date_time=event.date_time,
        venue=event.venue,
        description=event.description,
        budget=event.budget,
        poster_url=event.poster_url,
        status=event.status,
        academic_year=event.academic_year,
        volunteer_user_ids=json.loads(event.volunteer_user_ids or "[]"),
        created_by=event.created_by,
        created_at=event.created_at,
        attendance_count=event.attendance_count
    )

@router.post("", response_model=schemas.EventResponse)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    initial_status = "approved" if admin.role == "super_admin" else "submitted"
    new_event = models.Event(
        title=event_in.title,
        type=event_in.type,
        date_time=event_in.date_time,
        venue=event_in.venue,
        description=event_in.description or "",
        budget=event_in.budget or 0.0,
        poster_url=event_in.poster_url,
        academic_year=event_in.academic_year or "2025-26",
        status=initial_status,
        created_by=admin.id,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return schemas.EventResponse(
        id=new_event.id,
        title=new_event.title,
        type=new_event.type,
        date_time=new_event.date_time,
        venue=new_event.venue,
        description=new_event.description,
        budget=new_event.budget,
        poster_url=new_event.poster_url,
        status=new_event.status,
        academic_year=new_event.academic_year,
        volunteer_user_ids=[],
        created_by=new_event.created_by,
        created_at=new_event.created_at,
        attendance_count=0
    )

@router.patch("/{event_id}/status")
def update_event_status(
    event_id: str,
    status: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    event.status = status
    db.commit()
    return {"success": True, "status": status}

@router.post("/{event_id}/register")
def register_for_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    reg_id = f"{event_id}_{current_user.id}"
    existing = db.query(models.EventRegistration).filter(models.EventRegistration.id == reg_id).first()
    if existing:
        return {"success": True, "message": "Already registered"}

    reg = models.EventRegistration(
        id=reg_id,
        event_id=event_id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
    )
    db.add(reg)
    db.commit()
    return {"success": True, "message": "Registration successful"}

@router.get("/{event_id}/is-registered")
def is_registered(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    reg_id = f"{event_id}_{current_user.id}"
    existing = db.query(models.EventRegistration).filter(models.EventRegistration.id == reg_id).first()
    return {"is_registered": existing is not None}
