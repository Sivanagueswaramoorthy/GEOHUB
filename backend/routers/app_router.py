import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models
import auth
from notifications.fcm_service import broadcast_app_update_notification

router = APIRouter(prefix="/app", tags=["App Version & OTA Updates"])

VERSION_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "app_version.json"
)

class DeviceRegisterPayload(BaseModel):
    device_id: str
    user_id: Optional[str] = None
    device_name: Optional[str] = "Android Device"
    os_version: Optional[str] = "Android"
    app_version: Optional[str] = "1.5.0"
    fcm_token: Optional[str] = None

class BroadcastUpdatePayload(BaseModel):
    version: Optional[str] = None
    release_notes: Optional[str] = None
    message: Optional[str] = None
    download_url: Optional[str] = None

def get_current_app_version_data() -> Dict[str, Any]:
    if os.path.exists(VERSION_FILE_PATH):
        try:
            with open(VERSION_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "version": "1.5.0",
        "version_code": 7,
        "apk_filename": "geohub-app.apk",
        "release_notes": "Official release of GeoHub mobile application.",
        "download_url": "/downloads/geohub-app.apk",
        "min_supported_version": "1.0.0",
        "released_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "sha256": "",
    }

@router.get("/version")
def get_app_version():
    """
    Returns the latest published mobile application version manifest,
    download endpoint, release notes, and SHA-256 integrity hash.
    Public endpoint polled by mobile clients on startup and resume.
    """
    return get_current_app_version_data()

@router.post("/device-register")
def register_device(payload: DeviceRegisterPayload, db: Session = Depends(get_db)):
    """
    Registers or updates client device telemetry (device ID, user roll_no,
    hardware model, OS, running app version, and last seen timestamp).
    """
    device = db.query(models.AppDevice).filter(models.AppDevice.device_id == payload.device_id).first()
    if not device:
        device = models.AppDevice(
            device_id=payload.device_id,
            user_id=payload.user_id,
            device_name=payload.device_name or "Android Device",
            os_version=payload.os_version or "Android",
            app_version=payload.app_version or "1.5.0",
            fcm_token=payload.fcm_token,
            last_seen_at=datetime.utcnow(),
        )
        db.add(device)
    else:
        if payload.user_id:
            device.user_id = payload.user_id
        if payload.device_name:
            device.device_name = payload.device_name
        if payload.os_version:
            device.os_version = payload.os_version
        if payload.app_version:
            device.app_version = payload.app_version
        if payload.fcm_token:
            device.fcm_token = payload.fcm_token
        device.last_seen_at = datetime.utcnow()
        device.is_active = True

    db.commit()
    db.refresh(device)
    return {
        "status": "success",
        "message": "Device telemetry recorded",
        "device_id": device.device_id,
        "app_version": device.app_version,
    }

@router.get("/devices")
def get_devices_telemetry(db: Session = Depends(get_db)):
    """
    Returns full device registry and adoption audit report for administrators.
    Computes total devices, up-to-date count, outdated count, and compliance percentage.
    """
    version_data = get_current_app_version_data()
    latest_version = version_data.get("version", "1.5.0")

    devices = db.query(models.AppDevice).order_by(models.AppDevice.last_seen_at.desc()).all()
    
    total_count = len(devices)
    updated_count = sum(1 for d in devices if d.app_version == latest_version)
    outdated_count = total_count - updated_count
    adoption_percentage = round((updated_count / total_count * 100), 1) if total_count > 0 else 100.0

    return {
        "latest_version": latest_version,
        "version_code": version_data.get("version_code", 7),
        "total_devices": total_count,
        "updated_devices": updated_count,
        "outdated_devices": outdated_count,
        "adoption_percentage": adoption_percentage,
        "devices": [
            {
                "id": d.id,
                "device_id": d.device_id,
                "user_id": d.user_id,
                "device_name": d.device_name,
                "os_version": d.os_version,
                "app_version": d.app_version,
                "is_up_to_date": d.app_version == latest_version,
                "last_seen_at": d.last_seen_at.isoformat() if d.last_seen_at else None,
            }
            for d in devices
        ],
    }

@router.post("/broadcast-update")
def broadcast_update(
    payload: BroadcastUpdatePayload,
    current_user: Optional[models.User] = Depends(auth.get_optional_user)
):
    """
    Dispatches a high-priority Over-The-Air (OTA) update broadcast
    to all registered devices and publishes in-app notification alerts.
    """
    version_data = get_current_app_version_data()
    target_version = payload.version or version_data.get("version", "1.5.0")
    notes = payload.release_notes or version_data.get("release_notes", "")
    download_url = payload.download_url or version_data.get("download_url", "/downloads/geohub-app.apk")

    res = broadcast_app_update_notification(
        version=target_version,
        release_notes=notes,
        custom_message=payload.message,
        download_url=download_url
    )
    return {
        "status": "success",
        "message": f"Broadcast update for v{target_version} dispatched",
        "details": res,
    }

