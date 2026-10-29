import secrets
import math
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/qr", tags=["Smart QR Attendance"])

def calculate_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to calculate geodesic distance between two lat/lng coordinates in meters."""
    R = 6371000 # Radius of earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.post("/generate", response_model=schemas.QrGenerateResponse)
def generate_event_qr(
    req: schemas.QrGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    """Server-side QR Token Generation:
    Token is strictly bound to userId + eventId + 60s TTL.
    Client only displays what the server issued.
    """
    event = db.query(models.Event).filter(models.Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    # Verify user is registered for the event (or organizer)
    reg_id = f"{req.event_id}_{current_user.id}"
    norm_role = auth.normalize_role(current_user.role)
    is_organizer = norm_role in ["faculty", "coordinator"]
    reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == reg_id).first()

    if not reg and not is_organizer:
        raise HTTPException(
            status_code=400,
            detail="You must register for this event before generating attendance QR."
        )

    # Invalidate previous unused tokens for this user and event
    db.query(models.QrSession).filter(
        models.QrSession.event_id == req.event_id,
        models.QrSession.user_id == current_user.id,
        models.QrSession.used == False
    ).update({"used": True})

    # Generate 60-second single-use token
    token = f"GEO-{secrets.token_hex(6).upper()}"
    expires_at = datetime.utcnow() + timedelta(seconds=60)

    session = models.QrSession(
        event_id=req.event_id,
        user_id=current_user.id,
        token=token,
        expires_at=expires_at,
        used=False
    )
    db.add(session)
    db.commit()

    return schemas.QrGenerateResponse(
        token=token,
        expires_at=expires_at
    )

@router.post("/verify", response_model=schemas.QrVerifyResponse)
def verify_attendance_qr(
    req: schemas.QrVerifyRequest,
    db: Session = Depends(get_db),
    scanner: models.User = Depends(auth.get_current_active_user)
):
    """Server-Side Verification:
    (a) The scanner is assigned to THIS event (Layer 3 resource-level check)
    (b) The attendee is registered for it
    (c) The token is valid, unexpired and unused (marked used in single atomic transaction)
    (d) Optional geofence check (off by default)
    """
    # 1. Fetch event
    event = db.query(models.Event).filter(models.Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    # (a) Verify scanner assignment for THIS event
    assigned_scanners = json.loads(event.assigned_scanner_user_ids or "[]")
    if scanner.id not in assigned_scanners:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not assigned as an attendance scanner for this event."
        )

    # (d) Optional geofence check
    if event.geofence_enabled and event.latitude is not None and event.longitude is not None:
        if req.scanner_latitude is not None and req.scanner_longitude is not None:
            distance = calculate_distance_meters(
                event.latitude, event.longitude,
                req.scanner_latitude, req.scanner_longitude
            )
            max_radius = event.geofence_radius_meters or 100.0
            if distance > max_radius:
                raise HTTPException(
                    status_code=400,
                    detail=f"Geofence violation: Scanner is {distance:.1f}m away from event venue (allowed radius: {max_radius}m)."
                )

    # (c) Find QR session & verify token
    clean_token = req.token.strip()
    qr = db.query(models.QrSession).filter(
        models.QrSession.event_id == req.event_id,
        models.QrSession.token == clean_token
    ).first()

    if not qr:
        raise HTTPException(status_code=400, detail="Invalid QR code: Token not recognized for this event.")

    if qr.used:
        raise HTTPException(status_code=400, detail="Duplicate scan: This QR code has already been scanned.")

    if datetime.utcnow() > qr.expires_at:
        raise HTTPException(status_code=400, detail="QR code expired: The 60-second validity window has lapsed.")

    # (b) Verify attendee registration
    reg_id = f"{req.event_id}_{qr.user_id}"
    reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == reg_id).first()
    if not reg:
        raise HTTPException(
            status_code=400,
            detail="Attendance denied: Attendee is not registered for this event."
        )

    # Single atomic transaction: mark token used + write attendance record + increment event attendance count
    qr.used = True

    attendee = db.query(models.User).filter(models.User.id == qr.user_id).first()
    attendee_name = attendee.name if attendee else "Student"

    att_id = f"{req.event_id}_{qr.user_id}"
    existing_att = db.query(models.Attendance).filter(models.Attendance.id == att_id).first()
    if existing_att:
        raise HTTPException(status_code=400, detail=f"Attendee {attendee_name} is already checked in.")

    attendance = models.Attendance(
        id=att_id,
        event_id=req.event_id,
        user_id=qr.user_id,
        user_name=attendee_name,
        scanned_by=scanner.id,
        check_in_time=datetime.utcnow(),
        method="qr"
    )
    db.add(attendance)
    event.attendance_count = (event.attendance_count or 0) + 1
    db.commit()

    # Write audit record
    auth.log_audit(
        db=db,
        actor=scanner,
        action="attendance_scan_verified",
        target_type="attendance",
        target_id=att_id,
        target_name=attendee_name,
        details=f"Verified attendance check-in for {attendee_name} at event {event.title}"
    )

    return schemas.QrVerifyResponse(
        success=True,
        message=f"Attendance confirmed for {attendee_name}",
        attendee_name=attendee_name,
        attendee_id=qr.user_id,
        check_in_time=attendance.check_in_time
    )
