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
    assert len(roles) == 9
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
    # Baseline for coordinator: canCreateEditEvents is True, canArchiveEvents is False
    assert rst_data["effective_matrix"]["matrix"]["coordinator"]["canCreateEditEvents"] is True
    assert rst_data["effective_matrix"]["matrix"]["coordinator"]["canArchiveEvents"] is False
    print("✓ POST /api/admin/reset-permissions-matrix verified: restored default institutional baseline")

def test_superadmin_faculty_separation():
    # 1. Test SuperAdmin login
    sa_res = client.post("/api/auth/login", json={"roll_no": "SA01", "password": "admin123"})
    assert sa_res.status_code == 200, f"SuperAdmin login failed: {sa_res.text}"
    sa_user = sa_res.json()["user"]
    assert sa_user["role"] == "super_admin"
    assert sa_user["roll_no"] == "SA01"
    print("✓ SuperAdmin (SA01) logged in successfully with role 'super_admin'")

    # 2. Test Faculty login
    fac_res = client.post("/api/auth/login", json={"roll_no": "FAC01", "password": "admin123"})
    assert fac_res.status_code == 200, f"Faculty login failed: {fac_res.text}"
    fac_user = fac_res.json()["user"]
    assert fac_user["role"] == "faculty"
    assert fac_user["roll_no"] == "FAC01"
    print("✓ Faculty (FAC01) logged in successfully with distinct role 'faculty'")

    # 3. SuperAdmin root protection guard
    disable_sa = client.put("/api/admin/permissions-matrix", json={
        "role": "super_admin",
        "action": "disable_all"
    })
    assert disable_sa.status_code == 400
    assert "SuperAdmin operations cannot be completely revoked" in disable_sa.json()["detail"]
    print("✓ SuperAdmin root protection guard confirmed (cannot revoke all super_admin operations)")

if __name__ == "__main__":
    test_roles_credentials()
    test_permissions_matrix()
    test_superadmin_faculty_separation()
    print("\nAll SuperAdmin and Faculty governance tests passed successfully!")

