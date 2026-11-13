import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_roles_credentials():
    res = client.get("/api/admin/roles-credentials")
    assert res.status_code == 200
    roles = res.json()
    assert len(roles) == 8
    print(f"✓ GET /api/admin/roles-credentials returned {len(roles)} canonical roles")

    # Set credentials for coordinator
    set_res = client.post("/api/admin/set-role-credentials", json={
        "role": "coordinator",
        "roll_no": "21GEO001",
        "name": "Alex Rivera",
        "email": "alex.rivera@college.edu",
        "password": "NewSecretPassword2026!",
        "status": "active"
    })
    assert set_res.status_code == 200
    set_data = set_res.json()
    assert set_data["status"] == "success"
    print("✓ POST /api/admin/set-role-credentials successfully updated coordinator credentials")

def test_permissions_matrix():
    # 1. Fetch matrix
    mat_res = client.get("/api/admin/permissions-matrix")
    assert mat_res.status_code == 200
    matrix_data = mat_res.json()
    assert "matrix" in matrix_data
    assert "coordinator" in matrix_data["matrix"]
    print("✓ GET /api/admin/permissions-matrix retrieved matrix")

    # 2. Enable All for coordinator
    enable_res = client.put("/api/admin/permissions-matrix", json={
        "role": "coordinator",
        "action": "enable_all"
    })
    assert enable_res.status_code == 200
    en_data = enable_res.json()
    assert en_data["effective_matrix"]["matrix"]["coordinator"]["canApproveBudget"] is True
    print("✓ PUT /api/admin/permissions-matrix (action: enable_all) verified: coordinator now has all permissions")

    # 3. Disable All for coordinator
    disable_res = client.put("/api/admin/permissions-matrix", json={
        "role": "coordinator",
        "action": "disable_all"
    })
    assert disable_res.status_code == 200
    dis_data = disable_res.json()
    assert dis_data["effective_matrix"]["matrix"]["coordinator"]["canCreateEditEvents"] is False
    print("✓ PUT /api/admin/permissions-matrix (action: disable_all) verified: coordinator permissions revoked")

    # 4. Reset to default matrix
    reset_res = client.post("/api/admin/reset-permissions-matrix", json={
        "role": "coordinator"
    })
    assert reset_res.status_code == 200
    rst_data = reset_res.json()
    # Baseline for coordinator: canCreateEditEvents is True, canApproveBudget is False
    assert rst_data["effective_matrix"]["matrix"]["coordinator"]["canCreateEditEvents"] is True
    assert rst_data["effective_matrix"]["matrix"]["coordinator"]["canApproveBudget"] is False
    print("✓ POST /api/admin/reset-permissions-matrix verified: restored default institutional baseline")

if __name__ == "__main__":
    test_roles_credentials()
    test_permissions_matrix()
    print("\nAll SuperAdmin governance tests passed successfully!")

