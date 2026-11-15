#!/usr/bin/env python3
"""
Verification Script for Data Purge and Faculty Provisioning
"""

import sys
import os
import requests

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("=" * 60)
    print("STARTING DATA PURGE & FACULTY PROVISIONING VERIFICATION")
    print("=" * 60)

    # 1. Test SuperAdmin Login
    print("\n1. Testing SuperAdmin Login (SA01 / GeoHub2026!)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "roll_no": "SA01",
        "password": "GeoHub2026!"
    })
    print(f"Status: {res.status_code}")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    token_data = res.json()
    sa_token = token_data.get("access_token")
    assert sa_token, "No access token in login response"
    print(f"✓ SuperAdmin login successful. User: {token_data.get('user', {}).get('name')}")

    # 2. Test Zombie Demo Accounts Rejection
    print("\n2. Testing Deleted Demo Accounts (FAC01, 21GEO001, random)...")
    for bad_roll in ["FAC01", "21GEO001", "21GEO010", "RANDOM99"]:
        bad_res = requests.post(f"{BASE_URL}/auth/login", json={
            "roll_no": bad_roll,
            "password": "GeoHub2026!"
        })
        print(f"Login attempt [{bad_roll}]: Status {bad_res.status_code}")
        assert bad_res.status_code in (400, 401), f"Expected 400 or 401 for deleted user {bad_roll}, got {bad_res.status_code}"
    print("✓ All purged/unregistered accounts successfully rejected (HTTP 400/401)!")

    # 3. Test Empty Datasets
    print("\n3. Testing Empty Operational Endpoints...")
    headers = {"Authorization": f"Bearer {sa_token}"}
    
    events_res = requests.get(f"{BASE_URL}/events", headers=headers)
    print(f"GET /events: Status {events_res.status_code}, Length: {len(events_res.json())}")
    assert events_res.status_code == 200 and len(events_res.json()) == 0

    tasks_res = requests.get(f"{BASE_URL}/tasks?scope=all", headers=headers)
    print(f"GET /tasks: Status {tasks_res.status_code}, Length: {len(tasks_res.json())}")
    assert tasks_res.status_code == 200 and len(tasks_res.json()) == 0

    exp_res = requests.get(f"{BASE_URL}/finance/expenses", headers=headers)
    print(f"GET /finance/expenses: Status {exp_res.status_code}, Length: {len(exp_res.json())}")
    assert exp_res.status_code == 200 and len(exp_res.json()) == 0

    print("✓ All operational endpoints verified clean (0 records)!")

    # 4. Test Faculty Roster (initially empty)
    print("\n4. Testing GET /admin/faculty...")
    fac_res = requests.get(f"{BASE_URL}/admin/faculty", headers=headers)
    print(f"GET /admin/faculty: Status {fac_res.status_code}, Count: {len(fac_res.json())}")
    assert fac_res.status_code == 200 and len(fac_res.json()) == 0
    print("✓ Initial faculty list is clean (0 records)")

    # 5. Provision New Faculty Member via SuperAdmin
    print("\n5. Testing POST /admin/faculty (Provisioning Dr. Sarah Jenkins)...")
    new_faculty_payload = {
        "name": "Dr. Sarah Jenkins",
        "roll_no": "FAC01",
        "email": "sarah.jenkins@college.edu",
        "department": "Geography & Geomatics",
        "post": "Faculty Advisor",
        "phone": "+91 94420 18820",
        "password": "FacultyPass2026!"
    }
    create_res = requests.post(f"{BASE_URL}/admin/faculty", json=new_faculty_payload, headers=headers)
    print(f"POST /admin/faculty: Status {create_res.status_code}")
    assert create_res.status_code == 200, f"Expected 200, got {create_res.status_code}: {create_res.text}"
    created_fac = create_res.json()
    print(f"✓ Provisioned Faculty: {created_fac['name']} (ID: {created_fac['id']}, Roll: {created_fac['roll_no']})")

    # 6. Verify GET /admin/faculty now returns 1
    fac_res2 = requests.get(f"{BASE_URL}/admin/faculty", headers=headers)
    assert len(fac_res2.json()) == 1, f"Expected 1 faculty, got {len(fac_res2.json())}"
    print(f"✓ GET /admin/faculty returns {len(fac_res2.json())} faculty member")

    # 7. Test Newly Provisioned Faculty Can Log In
    print("\n6. Testing Login for Newly Provisioned Faculty (FAC01 / FacultyPass2026!)...")
    fac_login = requests.post(f"{BASE_URL}/auth/login", json={
        "roll_no": "FAC01",
        "password": "FacultyPass2026!"
    })
    print(f"Faculty Login: Status {fac_login.status_code}")
    assert fac_login.status_code == 200, f"Expected 200, got {fac_login.status_code}: {fac_login.text}"
    fac_data = fac_login.json()
    assert fac_data.get("user", {}).get("role") == "faculty"
    print(f"✓ Faculty successfully authenticated! Role: {fac_data['user']['role']}")

    # 8. Test Purge Platform Data Endpoint
    print("\n7. Testing POST /admin/purge-data...")
    purge_res = requests.post(f"{BASE_URL}/admin/purge-data", headers=headers)
    print(f"POST /admin/purge-data: Status {purge_res.status_code}, Summary: {purge_res.json()}")
    assert purge_res.status_code == 200
    summary = purge_res.json().get("summary", {})
    assert summary.get("users_count") == 1, f"Expected 1 user after purge, got {summary.get('users_count')}"
    print(f"✓ Purge endpoint verified! SuperAdmin retention locked: 1 user")

    print("\n" + "=" * 60)
    print("ALL VERIFICATION SUITES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
