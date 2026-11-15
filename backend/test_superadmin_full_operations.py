import sys
import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=== STARTING SUPERADMIN FULL CRUD & OPERATIONS VERIFICATION ===")
    
    # 1. SuperAdmin Login
    print("\n[Step 1] Logging in as SuperAdmin (SA01)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"roll_no": "SA01", "password": "GeoHub2026!"})
    if res.status_code != 200:
        print(f"FAILED SuperAdmin login: {res.status_code} {res.text}")
        sys.exit(1)
    sa_token = res.json()["access_token"]
    sa_headers = {"Authorization": f"Bearer {sa_token}"}
    print("✓ SuperAdmin authenticated successfully")

    # 2. Add Faculty
    print("\n[Step 2] SuperAdmin creating a new Faculty Advisor (FAC_TEST_01)...")
    fac_payload = {
        "name": "Dr. Alan Turing",
        "roll_no": "FAC_TEST_01",
        "email": "alan.turing@college.edu",
        "department": "Geoinformatics Engineering",
        "post": "Faculty Advisor",
        "phone": "+91 98888 12345",
        "password": "TuringTestPass123!"
    }
    res = requests.post(f"{BASE_URL}/admin/faculty", json=fac_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create faculty: {res.status_code} {res.text}")
        sys.exit(1)
    faculty_data = res.json()
    fac_id = faculty_data["id"]
    print(f"✓ Faculty created successfully with ID: {fac_id}")

    # 3. Update Faculty (All Details & Password)
    print("\n[Step 3] SuperAdmin updating Faculty details & password...")
    update_payload = {
        "name": "Dr. Alan M. Turing",
        "roll_no": "FAC_TEST_01",
        "email": "alan.m.turing@college.edu",
        "department": "Quantum Geo-Computing",
        "post": "Chief Faculty Advisor",
        "phone": "+91 99999 54321",
        "status": "active",
        "password": "UpdatedTuringPass2026!"
    }
    res = requests.put(f"{BASE_URL}/admin/faculty/{fac_id}", json=update_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to update faculty: {res.status_code} {res.text}")
        sys.exit(1)
    updated_fac = res.json()
    assert updated_fac["name"] == "Dr. Alan M. Turing"
    assert updated_fac["department"] == "Quantum Geo-Computing"
    assert updated_fac["post"] == "Chief Faculty Advisor"
    print("✓ Faculty details updated successfully in database")

    # 4. Verify login with updated password
    print("\n[Step 4] Verifying login with updated Faculty password...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"roll_no": "FAC_TEST_01", "password": "UpdatedTuringPass2026!"})
    if res.status_code != 200:
        print(f"FAILED Faculty login with new password: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ Faculty logged in successfully with updated password")

    # 5. Unconditional Faculty Deletion
    print("\n[Step 5] SuperAdmin unconditionally deleting the Faculty Advisor...")
    res = requests.delete(f"{BASE_URL}/admin/faculty/{fac_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete faculty: {res.status_code} {res.text}")
        sys.exit(1)
    print(f"✓ Faculty deleted unconditionally: {res.json()}")

    # Verify Faculty is gone
    res = requests.get(f"{BASE_URL}/admin/faculty", headers=sa_headers)
    assert res.status_code == 200
    facs = res.json()
    assert not any(f["id"] == fac_id for f in facs)
    print("✓ Verified faculty removed from platform (zero faculty permitted)")

    # 6. Event CRUD (Create, Update, Delete)
    print("\n[Step 6] Testing SuperAdmin Event CRUD...")
    event_payload = {
        "title": "SuperAdmin Geo-Survey Symposium",
        "type": "Technical",
        "date_time": "2026-11-20T10:00:00Z",
        "venue": "Geo Hall A",
        "budget": 25000.0,
        "description": "Full testing symposium",
        "academic_year": "2025-26"
    }
    res = requests.post(f"{BASE_URL}/events", json=event_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create event: {res.status_code} {res.text}")
        sys.exit(1)
    event_id = res.json()["id"]
    print(f"✓ Event created with ID: {event_id}")

    # Update Event
    res = requests.put(f"{BASE_URL}/events/{event_id}", json={"title": "Updated Geo-Survey Symposium", "budget": 30000.0}, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to update event: {res.status_code} {res.text}")
        sys.exit(1)
    assert res.json()["title"] == "Updated Geo-Survey Symposium"
    print("✓ Event updated successfully")

    # Delete Event
    res = requests.delete(f"{BASE_URL}/events/{event_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete event: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ Event deleted successfully")

    # 7. Task CRUD (Create, Update, Delete)
    print("\n[Step 7] Testing SuperAdmin Task CRUD...")
    task_payload = {
        "title": "Install GPS Base Station",
        "description": "Mount dual antenna on roof",
        "team_id": "tech-squad",
        "assigned_user_ids": ["SA01"],
        "deadline": "2026-11-25T18:00:00Z"
    }
    res = requests.post(f"{BASE_URL}/tasks", json=task_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create task: {res.status_code} {res.text}")
        sys.exit(1)
    task_id = res.json()["id"]
    print(f"✓ Task created with ID: {task_id}")

    # Update Task
    res = requests.put(f"{BASE_URL}/tasks/{task_id}", json={"title": "Calibrate GPS Station"}, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to update task: {res.status_code} {res.text}")
        sys.exit(1)
    assert res.json()["title"] == "Calibrate GPS Station"
    print("✓ Task updated successfully")

    # Delete Task
    res = requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete task: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ Task deleted successfully")

    # 8. Finance CRUD (Expense & Budget Request)
    print("\n[Step 8] Testing SuperAdmin Finance CRUD...")
    expense_payload = {
        "title": "LiDAR Battery Pack",
        "amount": 4200.0,
        "category": "Equipment",
        "team_name": "Technical Squad",
        "receipt_url": "https://example.com/receipt.pdf"
    }
    res = requests.post(f"{BASE_URL}/finance/expenses", json=expense_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create expense: {res.status_code} {res.text}")
        sys.exit(1)
    expense_id = res.json()["id"]
    print(f"✓ Expense created with ID: {expense_id}")

    # Update Expense
    res = requests.put(f"{BASE_URL}/finance/expenses/{expense_id}", json={"amount": 4500.0, "category": "Hardware"}, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to update expense: {res.status_code} {res.text}")
        sys.exit(1)
    assert res.json()["amount"] == 4500.0
    print("✓ Expense updated successfully")

    # Delete Expense
    res = requests.delete(f"{BASE_URL}/finance/expenses/{expense_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete expense: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ Expense deleted successfully")

    # Submit Budget Request
    budget_payload = {
        "team_name": "Survey Squad",
        "requested_amount": 12000.0,
        "reason": "Drone battery replacements"
    }
    res = requests.post(f"{BASE_URL}/finance/budget-requests", json=budget_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create budget request: {res.status_code} {res.text}")
        sys.exit(1)
    budget_req_id = res.json()["id"]
    print(f"✓ Budget request created with ID: {budget_req_id}")

    # Delete Budget Request
    res = requests.delete(f"{BASE_URL}/finance/budget-requests/{budget_req_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete budget request: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ Budget request deleted successfully")

    # 9. SuperAdmin Universal User Management
    print("\n[Step 9] Testing SuperAdmin Universal User Management...")
    user_payload = {
        "name": "Kavitha Raman",
        "roll_no": "23GEO099",
        "email": "kavitha.raman@college.edu",
        "role": "student",
        "department": "Civil Engineering",
        "post": "Volunteer",
        "phone": "+91 98765 43210",
        "password": "GeoScholar2026!"
    }
    res = requests.post(f"{BASE_URL}/admin/users", json=user_payload, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to create user: {res.status_code} {res.text}")
        sys.exit(1)
    user_data = res.json()
    user_id = user_data["id"]
    print(f"✓ User created with ID: {user_id}")

    # List Users
    res = requests.get(f"{BASE_URL}/admin/users", headers=sa_headers)
    assert res.status_code == 200
    users = res.json()
    assert any(u["id"] == user_id for u in users)
    print(f"✓ Users listed successfully (total: {len(users)})")

    # Update User
    res = requests.put(f"{BASE_URL}/admin/users/{user_id}", json={"post": "Senior Lead", "role": "volunteer"}, headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to update user: {res.status_code} {res.text}")
        sys.exit(1)
    assert res.json()["post"] == "Senior Lead"
    print("✓ User updated successfully")

    # Delete User
    res = requests.delete(f"{BASE_URL}/admin/users/{user_id}", headers=sa_headers)
    if res.status_code != 200:
        print(f"FAILED to delete user: {res.status_code} {res.text}")
        sys.exit(1)
    print("✓ User deleted successfully")

    print("\n========================================================")
    print(">>> ALL SUPERADMIN FULL OPERATIONS VERIFICATIONS PASSED! <<<")
    print("========================================================")

if __name__ == "__main__":
    run_tests()
