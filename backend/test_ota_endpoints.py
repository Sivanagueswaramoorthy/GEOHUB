import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ota_version():
    res = client.get("/api/app/version")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert "version" in data
    assert "download_url" in data
    print("✓ GET /api/app/version passed:", data["version"])

def test_device_telemetry_and_audit():
    # 1. Register Device
    reg_res = client.post("/api/app/device-register", json={
        "device_id": "test_device_phone_001",
        "user_id": "21GEO001",
        "device_name": "Google Pixel 8",
        "os_version": "Android 14",
        "app_version": "1.5.0",
    })
    assert reg_res.status_code == 200, f"Expected 200, got {reg_res.status_code}"
    print("✓ POST /api/app/device-register passed")

    # 2. Get Devices Audit
    dev_res = client.get("/api/app/devices")
    assert dev_res.status_code == 200
    audit_data = dev_res.json()
    assert "total_devices" in audit_data
    assert "adoption_percentage" in audit_data
    assert audit_data["total_devices"] >= 1
    print("✓ GET /api/app/devices passed. Total devices:", audit_data["total_devices"])

def test_broadcast_update():
    b_res = client.post("/api/app/broadcast-update", json={
        "version": "1.5.0",
        "message": "Test broadcast notification alert"
    })
    assert b_res.status_code == 200
    res_data = b_res.json()
    assert res_data["status"] == "success"
    print("✓ POST /api/app/broadcast-update passed")

if __name__ == "__main__":
    test_ota_version()
    test_device_telemetry_and_audit()
    test_broadcast_update()
    print("\nAll OTA backend endpoints passed with flying colors!")

