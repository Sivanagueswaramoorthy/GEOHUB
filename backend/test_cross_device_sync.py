import sys
import json
import threading
import time
import requests

BASE_URL = "http://localhost:8000/api"
received_events = []
stop_sse = False

def sse_listener():
    global stop_sse
    headers = {
        "Accept": "text/event-stream",
        "ngrok-skip-browser-warning": "true",
        "Cache-Control": "no-cache",
    }
    try:
        response = requests.get(f"{BASE_URL}/sync/stream", headers=headers, stream=True, timeout=15)
        for line in response.iter_lines():
            if stop_sse:
                break
            if not line:
                continue
            decoded = line.decode("utf-8")
            if decoded.startswith("data:"):
                payload_str = decoded[5:].strip()
                try:
                    payload = json.loads(payload_str)
                    received_events.append(payload)
                    print(f"  [SSE Client Received] Type: {payload.get('type')}")
                except Exception as err:
                    print(f"  [SSE Error parsing] {err}")
    except Exception as e:
        if not stop_sse:
            print(f"  [SSE Listener Error] {e}")

def wait_for_event(predicate, timeout=4.0):
    start = time.time()
    while time.time() - start < timeout:
        for e in list(received_events):
            if predicate(e):
                return True
        time.sleep(0.05)
    return False

def run_tests():
    global stop_sse
    print("=== STARTING REAL-TIME CROSS-DEVICE SYNC VERIFICATION ===")

    # 1. Start SSE Listener in background thread (simulating Device B)
    print("\n[Step 1] Starting SSE listener thread (Simulating Device B)...")
    t = threading.Thread(target=sse_listener, daemon=True)
    t.start()

    assert wait_for_event(lambda e: e.get("type") == "SYNC_CONNECTED"), f"Failed to receive SYNC_CONNECTED handshake. Received: {received_events}"
    print("✓ Device B connected to real-time sync stream and received SYNC_CONNECTED handshake")

    # 2. Check sync diagnostics endpoint
    print("\n[Step 2] Checking /sync/status endpoint...")
    status_res = requests.get(f"{BASE_URL}/sync/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["active_devices_connected"] >= 1
    print(f"✓ Diagnostics report {status_data['active_devices_connected']} active device(s) connected")

    # 3. SuperAdmin Login (Simulating Device A)
    print("\n[Step 3] Device A logging in as SuperAdmin (SA01)...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={"roll_no": "SA01", "password": "GeoHub2026!"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✓ Device A authenticated successfully")

    # 4. Device A creates an Event
    print("\n[Step 4] Device A creating an Event...")
    event_payload = {
        "title": "Cross-Device Drone Mapping Workshop",
        "type": "Technical",
        "date_time": "2026-11-22T10:00:00Z",
        "venue": "Campus Grounds",
        "budget": 15000.0,
        "description": "Multi-device synchronization field testing",
        "academic_year": "2025-26"
    }
    event_res = requests.post(f"{BASE_URL}/events", json=event_payload, headers=headers)
    assert event_res.status_code == 200
    event_id = event_res.json()["id"]

    assert wait_for_event(lambda e: e.get("type") == "EVENT_CREATED" and e.get("data", {}).get("id") == event_id)
    print("✓ Device B received EVENT_CREATED live broadcast within milliseconds")

    # 5. Device A creates and updates a Task
    print("\n[Step 5] Device A creating and updating a Task...")
    task_payload = {
        "title": "Setup RTK Ground Station",
        "description": "Calibrate base on benchmark BM-01",
        "team_id": "tech-squad",
        "assigned_user_ids": ["SA01"],
        "deadline": "2026-11-23T15:00:00Z"
    }
    task_res = requests.post(f"{BASE_URL}/tasks", json=task_payload, headers=headers)
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    assert wait_for_event(lambda e: e.get("type") == "TASK_CREATED" and e.get("data", {}).get("id") == task_id)
    print("✓ Device B received TASK_CREATED live broadcast")

    # Update Task Status
    update_res = requests.patch(f"{BASE_URL}/tasks/{task_id}/status?status=in_progress", headers=headers)
    assert update_res.status_code == 200

    assert wait_for_event(lambda e: e.get("type") == "TASK_UPDATED" and e.get("data", {}).get("id") == task_id)
    print("✓ Device B received TASK_UPDATED live broadcast")

    # 6. Device A creates an Expense
    print("\n[Step 6] Device A logging an Expense...")
    expense_payload = {
        "title": "UAV Propeller Replacements",
        "category": "Equipment",
        "amount": 3200.0
    }
    expense_res = requests.post(f"{BASE_URL}/finance/expenses", json=expense_payload, headers=headers)
    assert expense_res.status_code == 200
    expense_id = expense_res.json()["id"]

    assert wait_for_event(lambda e: e.get("type") == "EXPENSE_CREATED" and e.get("data", {}).get("id") == expense_id)
    print("✓ Device B received EXPENSE_CREATED live broadcast")

    # 7. Device A submits and approves Budget Request
    print("\n[Step 7] Device A submitting and approving Budget Request...")
    budget_payload = {
        "team_name": "Field Ops",
        "requested_amount": 8000.0,
        "reason": "GNSS battery spares"
    }
    b_res = requests.post(f"{BASE_URL}/finance/budget-requests", json=budget_payload, headers=headers)
    assert b_res.status_code == 200
    b_id = b_res.json()["id"]

    assert wait_for_event(lambda e: e.get("type") == "BUDGET_REQUEST_SUBMITTED" and e.get("data", {}).get("id") == b_id)
    print("✓ Device B received BUDGET_REQUEST_SUBMITTED live broadcast")

    # Approve Budget Request
    appr_res = requests.post(f"{BASE_URL}/finance/budget-requests/{b_id}/approve", headers=headers)
    assert appr_res.status_code == 200

    assert wait_for_event(lambda e: e.get("type") == "BUDGET_REQUEST_APPROVED" and e.get("data", {}).get("id") == b_id)
    print("✓ Device B received BUDGET_REQUEST_APPROVED live broadcast")

    # 8. Clean up created test items
    print("\n[Step 8] Cleaning up test items and verifying deletion broadcasts...")
    del_event_res = requests.delete(f"{BASE_URL}/events/{event_id}", headers=headers)
    assert del_event_res.status_code == 200

    assert wait_for_event(lambda e: e.get("type") == "EVENT_DELETED" and e.get("data", {}).get("id") == event_id)
    print("✓ Device B received EVENT_DELETED live broadcast")

    requests.delete(f"{BASE_URL}/tasks/{task_id}", headers=headers)
    requests.delete(f"{BASE_URL}/finance/expenses/{expense_id}", headers=headers)
    requests.delete(f"{BASE_URL}/finance/budget-requests/{b_id}", headers=headers)

    stop_sse = True
    print("\n============================================================")
    print(">>> ALL REAL-TIME CROSS-DEVICE SYNC VERIFICATIONS PASSED! <<<")
    print("============================================================")

if __name__ == "__main__":
    run_tests()
