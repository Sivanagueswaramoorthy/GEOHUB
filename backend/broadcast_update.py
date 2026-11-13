#!/usr/bin/env python3
"""
GeoHub Standalone Push Update Broadcaster
Dispatches an OTA update push broadcast to devices and users
without re-compiling the native Android APK.
"""

import os
import sys
import json
import argparse
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from notifications.fcm_service import broadcast_app_update_notification

VERSION_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app_version.json")

def main():
    parser = argparse.ArgumentParser(description="GeoHub Standalone Push Update Broadcaster")
    parser.add_argument("--version", type=str, help="Target version to broadcast (e.g. 1.5.0)")
    parser.add_argument("--notes", type=str, default="", help="Release notes to include in broadcast")
    parser.add_argument("-m", "--message", type=str, default=None, help="Custom alert message for notification body")
    parser.add_argument("--url", type=str, default="/downloads/geohub-app.apk", help="APK download endpoint URL")

    args = parser.parse_args()

    # Load version from app_version.json if not specified
    target_version = args.version
    release_notes = args.notes
    download_url = args.url

    if os.path.exists(VERSION_FILE):
        try:
            with open(VERSION_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not target_version:
                    target_version = data.get("version", "1.5.0")
                if not release_notes:
                    release_notes = data.get("release_notes", "")
                if not download_url:
                    download_url = data.get("download_url", "/downloads/geohub-app.apk")
        except Exception as e:
            print(f"[Warning] Failed to read app_version.json: {e}")

    if not target_version:
        target_version = "1.5.0"

    print(f"\n==================================================")
    print(f"  GeoHub OTA Push Update Notification Broadcaster")
    print(f"==================================================")
    print(f" Target Version : v{target_version}")
    print(f" Download URL   : {download_url}")
    print(f" Release Notes  : {release_notes[:60]}..." if len(release_notes) > 60 else f" Release Notes  : {release_notes}")
    if args.message:
        print(f" Custom Message : {args.message}")
    print(f" Time           : {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"==================================================\n")

    res = broadcast_app_update_notification(
        version=target_version,
        release_notes=release_notes,
        custom_message=args.message,
        download_url=download_url
    )

    print(f"[Result] Broadcast completed successfully:")
    print(f" - In-App Notifications Created : {res.get('in_app_notifications_created', 0)}")
    print(f" - FCM Topic Dispatched         : {res.get('fcm_topic_dispatched', False)}")
    print(f" - FCM Status                   : {'Success' if res.get('fcm_success') else 'Notice (using in-app channel)'}")
    print("\n✓ Push update notification alert broadcast complete!\n")

if __name__ == "__main__":
    main()

