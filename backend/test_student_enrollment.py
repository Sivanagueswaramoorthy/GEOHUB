import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
import auth

client = TestClient(app)

def setup_test_db():
    db = SessionLocal()
    try:
        # Clean up test users if they exist
        db.query(models.User).filter(
            models.User.roll_no.in_(["24GEO002", "24GEO005", "24GEO099"])
        ).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

def test_student_enrollment_and_login():
    setup_test_db()

    # 1. Login as SuperAdmin or Admin to enroll student
    admin_login = client.post('/api/auth/login', json={'identifier': 'SA01', 'password': 'admin123'})
    assert admin_login.status_code == 200, f"Admin login failed: {admin_login.text}"
    token = admin_login.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Enroll a new student using Roll Number and Name
    print("\n--- 1. Enrolling Student by Roll No & Name ---")
    payload = {
        "roll_no": "24GEO002",
        "name": "Kavitha Ramesh",
        "department": "Geoinformatics Engineering",
        "team": "Promotion"
    }
    enroll_res = client.post('/api/auth/users', json=payload, headers=headers)
    assert enroll_res.status_code == 200, f"Enrollment failed: {enroll_res.text}"
    enrolled_data = enroll_res.json()
    assert enrolled_data['roll_no'] == "24GEO002"
    assert enrolled_data['name'] == "Kavitha Ramesh"
    assert enrolled_data['role'] == "student"
    print(f"✓ Student enrolled successfully: {enrolled_data['name']} ({enrolled_data['roll_no']})")

    # 3. Test Student Login with Roll Number and default password 'geohub'
    print("\n--- 2. Testing Student Login with Roll No & default password 'geohub' ---")
    student_login = client.post('/api/auth/login', json={'identifier': '24GEO002', 'password': 'geohub'})
    assert student_login.status_code == 200, f"Student login failed: {student_login.text}"
    student_data = student_login.json()
    assert student_data['user']['roll_no'] == "24GEO002"
    assert student_data['user']['role'] == "student"
    assert "access_token" in student_data
    print(f"✓ Login with uppercase '24GEO002' + 'geohub' successful! Token received.")

    # 4. Test Student Login with lowercase roll number '24geo002' and 'geohub'
    print("\n--- 3. Testing Case-Insensitive Roll Number Login ---")
    lower_login = client.post('/api/auth/login', json={'identifier': '24geo002', 'password': 'geohub'})
    assert lower_login.status_code == 200, f"Lowercase login failed: {lower_login.text}"
    print("✓ Login with lowercase '24geo002' + 'geohub' successful!")

    # 5. Test Student Login with incorrect password
    print("\n--- 4. Testing Incorrect Password Rejection ---")
    bad_login = client.post('/api/auth/login', json={'identifier': '24GEO002', 'password': 'wrongpassword123'})
    assert bad_login.status_code == 400, f"Bad password was not rejected: {bad_login.status_code}"
    print("✓ Incorrect password rejected with HTTP 400.")

    # 6. Test Duplicate Enrollment Prevention
    print("\n--- 5. Testing Duplicate Roll Number Protection ---")
    dup_res = client.post('/api/auth/users', json=payload, headers=headers)
    assert dup_res.status_code == 400, f"Duplicate was not rejected: {dup_res.status_code}"
    print("✓ Duplicate roll number correctly rejected with HTTP 400.")

    # 7. Test Dynamic Auto-Provisioning for valid Student Roll Number + 'geohub'
    print("\n--- 6. Testing Dynamic Auto-Provisioning for '24GEO099' + 'geohub' ---")
    dyn_login = client.post('/api/auth/login', json={'identifier': '24GEO099', 'password': 'geohub'})
    assert dyn_login.status_code == 200, f"Auto-provisioning failed: {dyn_login.text}"
    dyn_data = dyn_login.json()
    assert dyn_data['user']['roll_no'] == "24GEO099"
    assert dyn_data['user']['role'] == "student"
    print(f"✓ Dynamic student login successful for '24GEO099': {dyn_data['user']['name']}")

    print("\n=======================================================")
    print("ALL STUDENT ENROLLMENT & 'geohub' LOGIN TESTS PASSED!")
    print("=======================================================\n")

if __name__ == "__main__":
    test_student_enrollment_and_login()

