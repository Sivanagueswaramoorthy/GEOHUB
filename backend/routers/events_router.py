import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/events", tags=["Events"])

# Allowed sequential transitions
ALLOWED_TRANSITIONS = {
    "draft": ["submitted", "cancelled"],
    "submitted": ["approved", "cancelled"],
    "approved": ["live", "cancelled"],
    "live": ["done", "completed", "cancelled"],
    "done": ["archived"],
    "completed": ["archived"],
    "archived": [],
    "cancelled": []
}

@router.get("", response_model=List[schemas.EventResponse])
def get_events(
    status: Optional[str] = None,
    type: Optional[str] = None,
    academic_year: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    query = db.query(models.Event)
    norm_role = auth.normalize_role(current_user.role) if current_user else "coordinator"

    # Regular students only see approved, live, done, completed
    if norm_role == "student":
        query = query.filter(models.Event.status.in_(["approved", "live", "done", "completed"]))
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
            cancellation_reason=e.cancellation_reason,
            academic_year=e.academic_year,
            volunteer_user_ids=json.loads(e.volunteer_user_ids or "[]"),
            assigned_scanner_user_ids=json.loads(e.assigned_scanner_user_ids or "[]"),
            geofence_enabled=e.geofence_enabled or False,
            latitude=e.latitude,
            longitude=e.longitude,
            geofence_radius_meters=e.geofence_radius_meters or 100.0,
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
        cancellation_reason=event.cancellation_reason,
        academic_year=event.academic_year,
        volunteer_user_ids=json.loads(event.volunteer_user_ids or "[]"),
        assigned_scanner_user_ids=json.loads(event.assigned_scanner_user_ids or "[]"),
        geofence_enabled=event.geofence_enabled or False,
        latitude=event.latitude,
        longitude=event.longitude,
        geofence_radius_meters=event.geofence_radius_meters or 100.0,
        created_by=event.created_by,
        created_at=event.created_at,
        attendance_count=event.attendance_count
    )

@router.post("", response_model=schemas.EventResponse)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    creator: Optional[models.User] = Depends(auth.get_optional_user)
):
    if creator and not auth.has_permission(creator, "canCreateEditEvents"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied: Missing 'canCreateEditEvents' permission."
        )

    creator_id = creator.id if creator else "u_coordinator_01"

    # Coordinator creates events in 'draft' or 'submitted'
    new_event = models.Event(
        title=event_in.title,
        type=event_in.type,
        date_time=event_in.date_time,
        venue=event_in.venue,
        description=event_in.description or "",
        budget=event_in.budget or 0.0,
        poster_url=event_in.poster_url,
        academic_year=event_in.academic_year or "2025-26",
        status=event_in.status if event_in.status in ["draft", "submitted", "approved", "live"] else "approved",
        assigned_scanner_user_ids="[]",
        volunteer_user_ids="[]",
        geofence_enabled=event_in.geofence_enabled or False,
        latitude=event_in.latitude,
        longitude=event_in.longitude,
        geofence_radius_meters=event_in.geofence_radius_meters or 100.0,
        created_by=creator_id,
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    auth.log_audit(
        db=db,
        actor=creator,
        action="event_created",
        target_type="event",
        target_id=new_event.id,
        target_name=new_event.title,
        after_state="draft",
        details="Event created in draft status"
    )

    resp = schemas.EventResponse(
        id=new_event.id,
        title=new_event.title,
        type=new_event.type,
        date_time=new_event.date_time,
        venue=new_event.venue,
        description=new_event.description,
        budget=new_event.budget,
        poster_url=new_event.poster_url,
        status=new_event.status,
        cancellation_reason=new_event.cancellation_reason,
        academic_year=new_event.academic_year,
        volunteer_user_ids=[],
        assigned_scanner_user_ids=[],
        geofence_enabled=new_event.geofence_enabled,
        latitude=new_event.latitude,
        longitude=new_event.longitude,
        geofence_radius_meters=new_event.geofence_radius_meters,
        created_by=new_event.created_by,
        created_at=new_event.created_at,
        attendance_count=0
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_CREATED", {
            "id": resp.id,
            "title": resp.title,
            "type": resp.type,
            "date_time": resp.date_time.isoformat() if hasattr(resp.date_time, 'isoformat') else str(resp.date_time),
            "venue": resp.venue,
            "description": resp.description,
            "budget": resp.budget,
            "poster_url": resp.poster_url,
            "status": resp.status,
            "cancellation_reason": resp.cancellation_reason,
            "academic_year": resp.academic_year,
            "volunteer_user_ids": resp.volunteer_user_ids,
            "assigned_scanner_user_ids": resp.assigned_scanner_user_ids,
            "geofence_enabled": resp.geofence_enabled,
            "created_by": resp.created_by,
            "created_at": resp.created_at.isoformat() if hasattr(resp.created_at, 'isoformat') else str(resp.created_at),
            "attendance_count": resp.attendance_count,
        })
    except Exception:
        pass

    return resp

@router.patch("/{event_id}/status")
def update_event_status(
    event_id: str,
    status_in: str,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.get_current_active_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    target_status = status_in.lower().strip()
    current_status = event.status.lower()

    # Lifecycle State Machine: check allowed transitions
    allowed = ALLOWED_TRANSITIONS.get(current_status, [])
    if target_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid lifecycle transition: Cannot move event from '{current_status}' to '{target_status}'. Allowed transitions: {allowed}"
        )

    # Permission enforcement per transition
    if target_status == "submitted":
        if not auth.has_permission(actor, "canCreateEditEvents"):
            raise HTTPException(status_code=403, detail="Permission denied: Coordinator role required to submit events.")

    elif target_status == "approved":
        # Only faculty can approve events! Coordinator CAN NEVER approve their own events.
        if not auth.has_permission(actor, "canApproveEvents"):
            raise HTTPException(status_code=403, detail="Permission denied: Faculty role required to approve events. Coordinators cannot approve events.")

    elif target_status == "archived":
        # Only faculty can archive events!
        if not auth.has_permission(actor, "canArchiveEvents"):
            raise HTTPException(status_code=403, detail="Permission denied: Only Faculty can archive events.")

    elif target_status == "cancelled":
        raise HTTPException(
            status_code=400,
            detail="To cancel an event, use the cancellation endpoint with a mandatory reason: PATCH /events/{id}/cancel"
        )

    elif target_status in ["live", "done", "completed"]:
        norm_role = auth.normalize_role(actor.role)
        if norm_role not in ["faculty", "coordinator", "super_admin"]:
            raise HTTPException(status_code=403, detail="Permission denied: Faculty or Coordinator role required.")

    before_state = event.status
    event.status = target_status
    db.commit()

    auth.log_audit(
        db=db,
        actor=actor,
        action="event_status_change",
        target_type="event",
        target_id=event.id,
        target_name=event.title,
        before_state=before_state,
        after_state=target_status,
        details=f"Status transitioned from {before_state} to {target_status}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_UPDATED", {
            "id": event.id,
            "title": event.title,
            "status": target_status,
            "before_status": before_state,
        })
    except Exception:
        pass

    return {"success": True, "event_id": event.id, "status": target_status}

@router.patch("/{event_id}/cancel")
def cancel_event(
    event_id: str,
    req: schemas.EventCancelRequest,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.require_permission("canCancelEvents"))
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    if event.status in ["archived", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel an event that is already {event.status}.")

    clean_reason = req.reason.strip()
    if not clean_reason:
        raise HTTPException(status_code=400, detail="A mandatory, non-empty cancellation reason is required.")

    before_state = event.status
    event.status = "cancelled"
    event.cancellation_reason = clean_reason
    db.commit()

    auth.log_audit(
        db=db,
        actor=actor,
        action="event_cancellation",
        target_type="event",
        target_id=event.id,
        target_name=event.title,
        before_state=before_state,
        after_state="cancelled",
        details=f"Event cancelled. Reason: {clean_reason}"
    )

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_CANCELLED", {
            "id": event.id,
            "title": event.title,
            "status": "cancelled",
            "cancellation_reason": clean_reason,
        })
    except Exception:
        pass

    return {"success": True, "event_id": event.id, "status": "cancelled", "reason": clean_reason}

@router.post("/{event_id}/scanners")
def assign_event_scanners(
    event_id: str,
    req: schemas.ScannerAssignRequest,
    db: Session = Depends(get_db),
    organizer: models.User = Depends(auth.get_current_active_user)
):
    """Organizers (coordinator or faculty) assign users authorized to scan for this event."""
    norm_role = auth.normalize_role(organizer.role)
    if norm_role not in ["faculty", "coordinator"]:
        raise HTTPException(status_code=403, detail="Only Coordinators or Faculty organizers can assign scanners.")

    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    before_scanners = event.assigned_scanner_user_ids
    event.assigned_scanner_user_ids = json.dumps(req.scanner_user_ids)
    db.commit()

    auth.log_audit(
        db=db,
        actor=organizer,
        action="scanner_assignment_change",
        target_type="event",
        target_id=event.id,
        target_name=event.title,
        before_state=before_scanners,
        after_state=json.dumps(req.scanner_user_ids),
        details=f"Assigned scanners updated to: {req.scanner_user_ids}"
    )

    return {"success": True, "assigned_scanner_user_ids": req.scanner_user_ids}

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

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_REGISTERED", {
            "event_id": event_id,
            "user_id": current_user.id,
            "user_name": current_user.name,
        })
    except Exception:
        pass

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

@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event(
    event_id: str,
    event_in: schemas.EventUpdate,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.get_current_active_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    if not auth.has_permission(actor, "canCreateEditEvents") and auth.normalize_role(actor.role) != "super_admin":
        raise HTTPException(status_code=403, detail="Permission denied to modify event.")

    if event_in.title is not None:
        event.title = event_in.title
    if event_in.type is not None:
        event.type = event_in.type
    if event_in.date_time is not None:
        event.date_time = event_in.date_time
    if event_in.venue is not None:
        event.venue = event_in.venue
    if event_in.description is not None:
        event.description = event_in.description
    if event_in.budget is not None:
        event.budget = event_in.budget
    if event_in.poster_url is not None:
        event.poster_url = event_in.poster_url
    if event_in.status is not None:
        event.status = event_in.status
    if event_in.academic_year is not None:
        event.academic_year = event_in.academic_year

    db.commit()
    db.refresh(event)

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_UPDATED", {"id": event.id, "title": event.title, "status": event.status})
    except Exception:
        pass

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
        cancellation_reason=event.cancellation_reason,
        academic_year=event.academic_year,
        volunteer_user_ids=json.loads(event.volunteer_user_ids or "[]"),
        assigned_scanner_user_ids=json.loads(event.assigned_scanner_user_ids or "[]"),
        geofence_enabled=event.geofence_enabled or False,
        latitude=event.latitude,
        longitude=event.longitude,
        geofence_radius_meters=event.geofence_radius_meters or 100.0,
        created_by=event.created_by,
        created_at=event.created_at,
        attendance_count=event.attendance_count
    )

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    actor: models.User = Depends(auth.get_current_active_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    if not auth.has_permission(actor, "canCancelEvents") and auth.normalize_role(actor.role) != "super_admin":
        raise HTTPException(status_code=403, detail="Permission denied to delete event.")

    # Delete registrations
    db.query(models.EventRegistration).filter(models.EventRegistration.event_id == event_id).delete()
    db.delete(event)
    db.commit()

    try:
        from routers.sync_router import broadcast_sync_event
        broadcast_sync_event("EVENT_DELETED", {"id": event_id})
    except Exception:
        pass

    return {"status": "success", "message": f"Event '{event_id}' successfully deleted."}
