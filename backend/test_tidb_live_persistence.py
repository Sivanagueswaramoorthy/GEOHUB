import requests
import json
import sys
import certifi
from sqlalchemy import create_engine, text

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("=== STARTING TIDB CLOUD LIVE PERSISTENCE VERIFICATION ===")

    # Step 1: Check Health & Database Dialect
    print("\n[Step 1] Checking API health & database engine...")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    health_data = r.json()
    print(f"✓ Health check response: {health_data}")
    assert health_data.get("database") == "mysql", f"Expected mysql, got {health_data.get('database')}"
    assert health_data.get("database_connected") is True

    # Step 2: Authenticate as SuperAdmin
    print("\n[Step 2] Authenticating as SuperAdmin (SA01)...")
    login_res = requests.post(
        f"{BASE_URL}/auth/login",
        json={"identifier": "SA01", "password": "GeoHub2026!"}
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    auth_data = login_res.json()
    token = auth_data["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"✓ Authenticated successfully as {auth_data['user']['name']} ({auth_data['user']['roll_no']})")

    # Connect directly to TiDB Cloud using SQLAlchemy to inspect tables directly
    tidb_engine = create_engine(
        "mysql+pymysql://2oGb7FpyxpLhZWE.root:pEVtiQBWbs9PAGBB@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:3306/geohub",
        connect_args={"ssl": {"ca": certifi.where()}}
    )

    # Step 3: Create an Event & Verify Persistence in TiDB Cloud
    print("\n[Step 3] Creating an Event via API...")
    event_payload = {
        "title": "TiDB Cloud Verification Summit 2026",
        "type": "Technical",
        "date_time": "2026-12-15T09:30:00Z",
        "venue": "GIS High-Performance Lab",
        "description": "Verification of real-time TiDB Cloud relational persistence.",
        "budget": 25000.0,
        "academic_year": "2026-2027",
        "status": "approved"
    }
    event_res = requests.post(f"{BASE_URL}/events", json=event_payload, headers=headers)
    assert event_res.status_code == 200, f"Create event failed: {event_res.text}"
    event_id = event_res.json()["id"]
    print(f"✓ Event created via API with ID: {event_id}")

    # Inspect TiDB directly
    with tidb_engine.connect() as conn:
        row = conn.execute(text("SELECT id, title, type, budget FROM events WHERE id = :id"), {"id": event_id}).fetchone()
        assert row is not None, f"Event {event_id} NOT found in TiDB Cloud!"
        assert row[1] == "TiDB Cloud Verification Summit 2026"
        print(f"✓ TiDB Cloud direct verification confirmed event: {row[1]} (budget: ₹{row[3]})")

    # Step 4: Create a Student Member & Verify Persistence in TiDB Cloud
    print("\n[Step 4] Creating a Student Member via API...")
    user_payload = {
        "name": "Kavya Ramesh",
        "roll_no": "23GEO099",
        "email": "kavya.ramesh@college.edu",
        "role": "student",
        "department": "Geoinformatics Engineering",
        "year_of_study": "2nd Year",
        "post": "Field Mapping Lead",
        "team": "Field Mapping & GIS",
        "phone": "+91 98765 43210",
        "password": "geohub"
    }
    user_res = requests.post(f"{BASE_URL}/admin/users", json=user_payload, headers=headers)
    assert user_res.status_code == 200, f"Create user failed: {user_res.text}"
    user_id = user_res.json()["id"]
    print(f"✓ Student member created via API with ID: {user_id}")

    # Inspect TiDB directly
    with tidb_engine.connect() as conn:
        row = conn.execute(text("SELECT id, name, roll_no, role, email FROM users WHERE id = :id"), {"id": user_id}).fetchone()
        assert row is not None, f"User {user_id} NOT found in TiDB Cloud!"
        assert row[2] == "23GEO099"
        print(f"✓ TiDB Cloud direct verification confirmed student: {row[1]} ({row[2]})")

    # Step 5: Create a Task & Verify Persistence in TiDB Cloud
    print("\n[Step 5] Creating a Task via API...")
    task_payload = {
        "title": "Validate Drone Ground Calibration",
        "description": "Establish ground control points across satellite test grid.",
        "team_id": "Management",
        "assigned_user_ids": [user_id],
        "deadline": "2026-12-10T18:00:00Z",
        "status": "todo"
    }
    task_res = requests.post(f"{BASE_URL}/tasks", json=task_payload, headers=headers)
    assert task_res.status_code == 200, f"Create task failed: {task_res.text}"
    task_id = task_res.json()["id"]
    print(f"✓ Task created via API with ID: {task_id}")

    # Inspect TiDB directly
    with tidb_engine.connect() as conn:
        row = conn.execute(text("SELECT id, title, team_id, status FROM tasks WHERE id = :id"), {"id": task_id}).fetchone()
        assert row is not None, f"Task {task_id} NOT found in TiDB Cloud!"
        assert row[1] == "Validate Drone Ground Calibration"
        print(f"✓ TiDB Cloud direct verification confirmed task: {row[1]} ({row[2]})")

    # Step 6: Create an Expense & Verify Persistence in TiDB Cloud
    print("\n[Step 6] Creating an Expense via API...")
    expense_payload = {
        "title": "Drone Battery Pack Renewal",
        "amount": 4250.0,
        "category": "Equipment",
        "event_id": event_id,
        "event_title": "TiDB Cloud Verification Summit 2026"
    }
    expense_res = requests.post(f"{BASE_URL}/finance/expenses", json=expense_payload, headers=headers)
    assert expense_res.status_code == 200, f"Create expense failed: {expense_res.text}"
    expense_id = expense_res.json()["id"]
    print(f"✓ Expense logged via API with ID: {expense_id}")

    # Inspect TiDB directly
    with tidb_engine.connect() as conn:
        row = conn.execute(text("SELECT id, title, amount, category FROM expenses WHERE id = :id"), {"id": expense_id}).fetchone()
        assert row is not None, f"Expense {expense_id} NOT found in TiDB Cloud!"
        assert row[1] == "Drone Battery Pack Renewal"
        print(f"✓ TiDB Cloud direct verification confirmed expense: {row[1]} (₹{row[2]})")

    # Step 7: Clean Up Test Records & Verify Deletion in TiDB Cloud
    print("\n[Step 7] Cleaning up test records...")
    del_exp = requests.delete(f"{BASE_URL}/finance/expenses/{expense_id}", headers=headers)
    assert del_exp.status_code == 200
    del_task = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    assert del_task.status_code == 200
    del_user = requests.delete(f"{BASE_URL}/admin/users/{user_id}", headers=headers)
    assert del_user.status_code == 200
    del_event = requests.delete(f"{BASE_URL}/events/{event_id}", headers=headers)
    assert del_event.status_code == 200

    with tidb_engine.connect() as conn:
        assert conn.execute(text("SELECT id FROM events WHERE id = :id"), {"id": event_id}).fetchone() is None
        assert conn.execute(text("SELECT id FROM users WHERE id = :id"), {"id": user_id}).fetchone() is None
        assert conn.execute(text("SELECT id FROM tasks WHERE id = :id"), {"id": task_id}).fetchone() is None
        assert conn.execute(text("SELECT id FROM expenses WHERE id = :id"), {"id": expense_id}).fetchone() is None
    print("✓ All test records successfully cleaned up from TiDB Cloud")

    print("\n" + "=" * 60)
    print(">>> ALL TIDB CLOUD LIVE PERSISTENCE VERIFICATIONS PASSED! <<<")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
