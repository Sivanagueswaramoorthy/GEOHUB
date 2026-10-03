import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/qr", tags=["Smart QR Attendance"])

@router.post("/generate", response_model=schemas.QrGenerateResponse)
def generate_event_qr(
    req: schemas.QrGenerateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Verify user is registered for the event (or admin)
    reg_id = f"{req.event_id}_{current_user.id}"
    is_admin = current_user.role in ["admin", "super_admin"]
    reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == reg_id).first()

    if not reg and not is_admin:
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
    # Check scanner privileges
    event = db.query(models.Event).filter(models.Event.id == req.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    volunteers = json.loads(event.volunteer_user_ids or "[]")
    is_admin = scanner.role in ["admin", "super_admin"]
    is_volunteer = scanner.id in volunteers or scanner.is_volunteer

    if not is_admin and not is_volunteer:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized as an attendance volunteer for this event."
        )

    # Find QR session
    qr = db.query(models.QrSession).filter(
        models.QrSession.event_id == req.event_id,
        models.QrSession.token == req.token.strip()
    ).first()

    if not qr:
        raise HTTPException(status_code=400, detail="Invalid QR code for this event.")

    if qr.used:
        raise HTTPException(status_code=400, detail="This QR code has already been scanned.")

    if datetime.utcnow() > qr.expires_at:
        raise HTTPException(status_code=400, detail="This QR code has expired. Please ask attendee to refresh.")

    # Mark as used
    qr.used = True

    # Get attendee
    attendee = db.query(models.User).filter(models.User.id == qr.user_id).first()
    attendee_name = attendee.name if attendee else "Student"

    # Create Attendance Record
    att_id = f"{req.event_id}_{qr.user_id}"
    attendance = models.Attendance(
        id=att_id,
        event_id=req.event_id,
        user_id=qr.user_id,
        user_name=attendee_name,
        scanned_by=scanner.id,
        check_in_time=datetime.utcnow(),
        method="qr"
    )
    db.merge(attendance)

    # Increment event attendance count
    event.attendance_count = (event.attendance_count or 0) + 1
    db.commit()

    return schemas.QrVerifyResponse(
        success=True,
        message=f"Checked in {attendee_name} successfully!",
        attendee_name=attendee_name,
        attendee_id=qr.user_id,
        check_in_time=datetime.utcnow()
    )

@router.get("/{event_id}/attendance")
def get_event_attendance(
    event_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(auth.require_admin)
):
    records = db.query(models.Attendance).filter(models.Attendance.event_id == event_id).all()
    return {
        "count": len(records),
        "records": [
            {
                "user_id": r.user_id,
                "user_name": r.user_name,
                "scanned_by": r.scanned_by,
                "check_in_time": r.check_in_time,
                "method": r.method
            }
            for r in records
        ]
    }
