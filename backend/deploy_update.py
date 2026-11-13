#!/usr/bin/env python3
"""
GeoHub Master Mobile App Push Update & OTA Deployment Orchestrator
Executes an end-to-end 8-stage automated pipeline:
  1. Synchronizes Version Control (Gradle, package.json, version.ts, config.py)
  2. Updates Server app_version.json Metadata
  3. Bundles Web Client via Vite (npm run build)
  4. Mirrors Web Bundle into Android Native Assets
  5. Clears Stale Daemons & Compiles Android APKs (Gradle assembleRelease / assembleDebug)
  6. Hosts Artifacts in Static Downloads Directory & Project Root
  7. Generates Cryptographic SHA-256 Checksum & File Telemetry
  8. Dispatches High-Priority FCM Push & In-App Notification Broadcast
"""

import os
import sys
import re
import json
import shutil
import hashlib
import argparse
import subprocess
from datetime import datetime

# Set working directory to project root
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
ANDROID_DIR = os.path.join(ROOT_DIR, "android")

GRADLE_FILE = os.path.join(ANDROID_DIR, "app", "build.gradle")
APP_VERSION_FILE = os.path.join(BACKEND_DIR, "app_version.json")
PACKAGE_JSON = os.path.join(FRONTEND_DIR, "package.json")
CONFIG_VERSION_TS = os.path.join(FRONTEND_DIR, "src", "config", "version.ts")
BACKEND_CONFIG_PY = os.path.join(BACKEND_DIR, "config.py")
STATIC_DOWNLOADS_DIR = os.path.join(BACKEND_DIR, "static_downloads")

sys.path.insert(0, BACKEND_DIR)

def print_banner(text: str):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def compute_sha256(file_path: str) -> str:
    sha = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest().upper()

def bump_semver(current_ver: str, bump_type: str) -> str:
    parts = current_ver.strip().lstrip("v").split(".")
    while len(parts) < 3:
        parts.append("0")
    major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])

    if bump_type == "major":
        return f"{major + 1}.0.0"
    elif bump_type == "minor":
        return f"{major}.{minor + 1}.0"
    else:  # patch
        return f"{major}.{minor}.{patch + 1}"

def get_current_gradle_version() -> tuple[int, str]:
    version_code = 7
    version_name = "1.5.0"
    if os.path.exists(GRADLE_FILE):
        with open(GRADLE_FILE, "r", encoding="utf-8") as f:
            content = f.read()
            vc_match = re.search(r"versionCode\s+(\d+)", content)
            vn_match = re.search(r"versionName\s+['\"]([^'\"]+)['\"]", content)
            if vc_match:
                version_code = int(vc_match.group(1))
            if vn_match:
                version_name = vn_match.group(1)
    return version_code, version_name

def update_version_files(new_code: int, new_version: str):
    # 1. Update android/app/build.gradle
    if os.path.exists(GRADLE_FILE):
        with open(GRADLE_FILE, "r", encoding="utf-8") as f:
            gradle_text = f.read()
        gradle_text = re.sub(r"versionCode\s+\d+", f"versionCode {new_code}", gradle_text)
        gradle_text = re.sub(r"versionName\s+['\"][^'\"]+['\"]", f"versionName '{new_version}'", gradle_text)
        with open(GRADLE_FILE, "w", encoding="utf-8") as f:
            f.write(gradle_text)
        print(f" [Gradle] Updated {GRADLE_FILE} -> versionCode {new_code}, versionName '{new_version}'")

    # 2. Update frontend/package.json
    if os.path.exists(PACKAGE_JSON):
        try:
            with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
                pkg_data = json.load(f)
            pkg_data["version"] = new_version
            with open(PACKAGE_JSON, "w", encoding="utf-8") as f:
                json.dump(pkg_data, f, indent=2)
            print(f" [Vite/NPM] Updated {PACKAGE_JSON} -> version {new_version}")
        except Exception as e:
            print(f" [Warning] Could not update package.json: {e}")

    # 3. Update frontend/src/config/version.ts
    os.makedirs(os.path.dirname(CONFIG_VERSION_TS), exist_ok=True)
    with open(CONFIG_VERSION_TS, "w", encoding="utf-8") as f:
        f.write(f"export const APP_VERSION = '{new_version}';\n")
        f.write(f"export const APP_VERSION_CODE = {new_code};\n")
    print(f" [Client Config] Updated {CONFIG_VERSION_TS} -> APP_VERSION '{new_version}'")

    # 4. Update backend/config.py
    if os.path.exists(BACKEND_CONFIG_PY):
        with open(BACKEND_CONFIG_PY, "r", encoding="utf-8") as f:
            config_text = f.read()
        config_text = re.sub(r'VERSION:\s*str\s*=\s*["\'][^"\']+["\']', f'VERSION: str = "{new_version}"', config_text)
        with open(BACKEND_CONFIG_PY, "w", encoding="utf-8") as f:
            f.write(config_text)
        print(f" [Backend Config] Updated {BACKEND_CONFIG_PY} -> VERSION '{new_version}'")

def find_java_home() -> str:
    studio_jbr = r"C:\Program Files\Android\Android Studio\jbr"
    if os.path.exists(studio_jbr):
        return studio_jbr
    env_java = os.environ.get("JAVA_HOME")
    if env_java and os.path.exists(env_java):
        return env_java
    return ""

def main():
    parser = argparse.ArgumentParser(description="GeoHub Automated OTA Push Update & Deployment Pipeline")
    parser.add_argument("--bump", choices=["patch", "minor", "major"], default=None, help="Semantic version bump type")
    parser.add_argument("--version", type=str, default=None, help="Explicit target version (e.g. 1.5.1)")
    parser.add_argument("--notes", type=str, default="Routine performance improvements and stability updates.", help="Release notes")
    parser.add_argument("-m", "--message", type=str, default=None, help="Custom push alert message")
    parser.add_argument("--no-broadcast", action="store_true", help="Skip notification broadcast")
    parser.add_argument("--no-apk", action="store_true", help="Skip Gradle native compilation (web bundle and manifest only)")

    args = parser.parse_args()

    print_banner("GeoHub Mobile App Push Update & OTA Deployment Pipeline")
    print(f" Root Directory : {ROOT_DIR}")
    print(f" Execution Time : {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")

    # Stage 1: Version Synchronization
    current_code, current_version = get_current_gradle_version()
    print(f"\n[Stage 1/8] Synchronizing Version Control...")
    print(f" Current Native Version: v{current_version} (Build {current_code})")

    if args.version:
        new_version = args.version.lstrip("v")
    elif args.bump:
        new_version = bump_semver(current_version, args.bump)
    else:
        new_version = bump_semver(current_version, "patch")

    new_code = current_code + 1
    print(f" Target Deployment Version: v{new_version} (Build {new_code})")
    update_version_files(new_code, new_version)

    # Stage 2: Server Metadata Synchronization
    print(f"\n[Stage 2/8] Writing Server app_version.json Metadata...")
    os.makedirs(STATIC_DOWNLOADS_DIR, exist_ok=True)
    release_date = datetime.utcnow().strftime("%Y-%m-%d")
    version_payload = {
        "version": new_version,
        "version_code": new_code,
        "apk_filename": "geohub-app.apk",
        "release_notes": args.notes,
        "download_url": "https://cdn.jsdelivr.net/gh/Sivanagueswaramoorthy/GEOHUB@main/geohub-app.apk",
        "min_supported_version": "1.0.0",
        "released_at": release_date,
        "file_size_bytes": 0,
        "file_size_mb": "",
        "sha256": ""
    }
    with open(APP_VERSION_FILE, "w", encoding="utf-8") as f:
        json.dump(version_payload, f, indent=2)
    print(f" ✓ Metadata staged at {APP_VERSION_FILE}")

    # Stage 3: Vite Production Web Bundle
    print(f"\n[Stage 3/8] Compiling Production Frontend Bundle via Vite...")
    cmd_build = "npm run build"
    res_build = subprocess.run(cmd_build, shell=True, cwd=FRONTEND_DIR)
    if res_build.returncode != 0:
        print("[ERROR] Frontend compilation failed! Aborting deployment.")
        sys.exit(1)
    print(" ✓ Frontend bundle compiled successfully.")

    # Stage 4: Mirror Web Assets to Android Project
    print(f"\n[Stage 4/8] Mirroring Web Assets to Android Project Assets...")
    dist_dir = os.path.join(FRONTEND_DIR, "dist")
    android_assets_dir = os.path.join(ANDROID_DIR, "app", "src", "main", "assets")
    
    if os.path.exists(android_assets_dir):
        for item in os.listdir(android_assets_dir):
            item_path = os.path.join(android_assets_dir, item)
            try:
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
            except Exception:
                pass

    for item in os.listdir(dist_dir):
        src = os.path.join(dist_dir, item)
        dst = os.path.join(android_assets_dir, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    print(" ✓ Assets synchronized to android/app/src/main/assets/")

    if args.no_apk:
        print("\n[Notice] --no-apk flag specified. Skipping Gradle APK build.")
        sys.exit(0)

    # Stage 5: Gradle Clean & APK Compilation
    print(f"\n[Stage 5/8] Compiling Native Android APK with Gradle...")
    java_home = find_java_home()
    env = os.environ.copy()
    if java_home:
        env["JAVA_HOME"] = java_home
        env["PATH"] = f"{os.path.join(java_home, 'bin')};{env.get('PATH', '')}"
        print(f" Utilizing Java SDK: {java_home}")

    # Stop stale daemons first
    print(" Resetting Gradle daemons...")
    subprocess.run("cmd /c gradlew.bat --stop", shell=True, cwd=ANDROID_DIR, env=env)

    # Assemble Release & Debug APKs
    print(" Executing: gradlew.bat assembleRelease assembleDebug...")
    cmd_gradle = "cmd /c gradlew.bat assembleRelease assembleDebug"
    res_gradle = subprocess.run(cmd_gradle, shell=True, cwd=ANDROID_DIR, env=env)
    if res_gradle.returncode != 0:
        print("[ERROR] Gradle build failed! Aborting deployment.")
        sys.exit(1)
    print(" ✓ Gradle build completed successfully.")

    # Stage 6: Artifact Deployment
    print(f"\n[Stage 6/8] Deploying Artifacts to Static Downloads & Root...")
    release_apk_src = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "release", "app-release.apk")
    debug_apk_src = os.path.join(ANDROID_DIR, "app", "build", "outputs", "apk", "debug", "app-debug.apk")

    # Destination paths
    root_release = os.path.join(ROOT_DIR, "geohub-app.apk")
    root_release_alt = os.path.join(ROOT_DIR, "geohub-app-release.apk")
    root_debug = os.path.join(ROOT_DIR, "geohub-app-debug.apk")

    dl_release = os.path.join(STATIC_DOWNLOADS_DIR, "geohub-app.apk")
    dl_release_alt = os.path.join(STATIC_DOWNLOADS_DIR, "geohub-app-release.apk")
    dl_debug = os.path.join(STATIC_DOWNLOADS_DIR, "geohub-app-debug.apk")

    if os.path.exists(release_apk_src):
        shutil.copy2(release_apk_src, root_release)
        shutil.copy2(release_apk_src, root_release_alt)
        shutil.copy2(release_apk_src, dl_release)
        shutil.copy2(release_apk_src, dl_release_alt)
        print(f" ✓ Staged Release APK -> {dl_release}")

    if os.path.exists(debug_apk_src):
        shutil.copy2(debug_apk_src, root_debug)
        shutil.copy2(debug_apk_src, dl_debug)
        print(f" ✓ Staged Debug APK -> {dl_debug}")

    # Stage 7: Cryptographic Validation
    print(f"\n[Stage 7/8] Generating SHA-256 Checksum & File Validation...")
    if os.path.exists(dl_release):
        file_bytes = os.path.getsize(dl_release)
        file_mb = f"{round(file_bytes / (1024 * 1024), 2)} MB"
        sha_hash = compute_sha256(dl_release)

        version_payload["file_size_bytes"] = file_bytes
        version_payload["file_size_mb"] = file_mb
        version_payload["sha256"] = sha_hash

        with open(APP_VERSION_FILE, "w", encoding="utf-8") as f:
            json.dump(version_payload, f, indent=2)

        print(f" File Size : {file_mb} ({file_bytes} bytes)")
        print(f" SHA-256   : {sha_hash}")
        print(" ✓ Cryptographic manifest written to app_version.json")

    # Stage 8: Notification Broadcast
    print(f"\n[Stage 8/8] Dispatching High-Priority Push Notification Broadcast...")
    if args.no_broadcast:
        print(" [Notice] --no-broadcast flag passed. Skipping push notification broadcast.")
    else:
        from notifications.fcm_service import broadcast_app_update_notification
        broadcast_res = broadcast_app_update_notification(
            version=new_version,
            release_notes=args.notes,
            custom_message=args.message,
            download_url="/downloads/geohub-app.apk"
        )
        print(f" In-App Notifications : {broadcast_res.get('in_app_notifications_created', 0)} created")
        print(f" FCM Status           : {'Topic Sent' if broadcast_res.get('fcm_topic_dispatched') else 'In-App Channel Active'}")
        print(" ✓ Broadcast dispatched to mobile devices.")

    print_banner(f"DEPLOYMENT SUCCESSFUL! GeoHub v{new_version} (Build {new_code}) Live!")
    print(f" Download URL: /downloads/geohub-app.apk")
    print(f" Version Manifest: /api/app/version")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()

