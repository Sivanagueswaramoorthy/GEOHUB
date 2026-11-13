"""
GeoHub Firebase Cloud Messaging (FCM) & In-App Notification Service
Orchestrates high-priority Over-The-Air (OTA) update push broadcasts
to Android mobile devices and topic subscribers.
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from database import SessionLocal
import models

logger = logging.getLogger("GeoHubNotifications")

SERVICE_ACCOUNT_KEY_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "serviceAccountKey.json"
)

def broadcast_app_update_notification(
    version: str,
    release_notes: str = "",
    custom_message: Optional[str] = None,
    download_url: str = "/downloads/geohub-app.apk"
) -> Dict[str, Any]:
    """
    Broadcasts an app update notification across two channels:
    1. Firebase Cloud Messaging (FCM topic and active device tokens if configured)
    2. In-App Notifications table for active user accounts
    """
    title = f"GeoHub v{version} Available!"
    message = custom_message or f"A new version of GeoHub ({version}) is available. Tap to install the latest features and updates."

    results = {
        "version": version,
        "fcm_success": False,
        "fcm_topic_dispatched": False,
        "tokens_dispatched": 0,
        "in_app_notifications_created": 0,
        "timestamp": datetime.utcnow().isoformat(),
    }

    # 1. In-App Database Notifications for enrolled users
    db = SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.status != "disabled").all()
        for user in users:
            notif = models.Notification(
                user_id=user.roll_no or user.id,
                title=title,
                message=message,
                type="alert",
            )
            db.add(notif)
        db.commit()
        results["in_app_notifications_created"] = len(users)
        logger.info(f"Created {len(users)} in-app notifications for OTA update v{version}")
    except Exception as e:
        logger.warning(f"Error persisting in-app notifications: {e}")
        db.rollback()
    finally:
        db.close()

    # 2. Firebase Cloud Messaging Dispatch (if credentials exist)
    if os.path.exists(SERVICE_ACCOUNT_KEY_PATH):
        try:
            import firebase_admin
            from firebase_admin import credentials, messaging

            if not firebase_admin._apps:
                cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
                firebase_admin.initialize_app(cred)

            # A. Broadcast to pub/sub topic
            topic_msg = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=message,
                ),
                data={
                    "type": "APP_UPDATE",
                    "version": version,
                    "release_notes": release_notes,
                    "download_url": download_url,
                },
                topic="app_updates",
            )
            messaging.send(topic_msg)
            results["fcm_topic_dispatched"] = True
            results["fcm_success"] = True
            logger.info(f"FCM topic notification dispatched for v{version}")
        except Exception as fcm_err:
            logger.warning(f"FCM broadcast encountered notice: {fcm_err}")
            results["fcm_error"] = str(fcm_err)
    else:
        logger.info(f"FCM serviceAccountKey.json not present at {SERVICE_ACCOUNT_KEY_PATH}; using in-app notification channel.")

    return results

