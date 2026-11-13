import unittest
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
import auth

class TestAuthEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()
        # Ensure test user exists
        cls.test_email = "testscholar@college.edu"
        cls.test_roll_no = "21GEO999"
        cls.test_initial_pwd = "InitPassword123!"

        user = db.query(models.User).filter(models.User.email == cls.test_email).first()
        if not user:
            user = models.User(
                id="u_test_999",
                roll_no=cls.test_roll_no,
                name="Scholar Tester",
                email=cls.test_email,
                hashed_password=auth.get_password_hash(cls.test_initial_pwd),
                role="student",
                status="active"
            )
            db.add(user)
            db.commit()
        db.close()

    def test_01_login_with_roll_no(self):
        resp = self.client.post("/api/auth/login", json={
            "roll_no": self.test_roll_no,
            "password": self.test_initial_pwd
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        data = resp.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["roll_no"], self.test_roll_no)

    def test_02_change_password_success(self):
        # 1. Login to get token
        login_resp = self.client.post("/api/auth/login", json={
            "roll_no": self.test_roll_no,
            "password": self.test_initial_pwd
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Change Password
        new_pwd = "UpdatedPassword2026!"
        change_resp = self.client.post("/api/auth/change-password", headers=headers, json={
            "old_password": self.test_initial_pwd,
            "new_password": new_pwd
        })
        self.assertEqual(change_resp.status_code, 200, change_resp.text)
        self.assertTrue(change_resp.json()["success"])

        # 3. Verify login with new password succeeds
        new_login_resp = self.client.post("/api/auth/login", json={
            "roll_no": self.test_roll_no,
            "password": new_pwd
        })
        self.assertEqual(new_login_resp.status_code, 200)

        # 4. Verify login with old password fails
        old_login_resp = self.client.post("/api/auth/login", json={
            "roll_no": self.test_roll_no,
            "password": self.test_initial_pwd
        })
        self.assertEqual(old_login_resp.status_code, 400)

        # Reset back for idempotent runs
        auth_token = new_login_resp.json()["access_token"]
        self.client.post("/api/auth/change-password", headers={"Authorization": f"Bearer {auth_token}"}, json={
            "old_password": new_pwd,
            "new_password": self.test_initial_pwd
        })

    def test_03_change_password_invalid_old_password(self):
        login_resp = self.client.post("/api/auth/login", json={
            "roll_no": self.test_roll_no,
            "password": self.test_initial_pwd
        })
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        resp = self.client.post("/api/auth/change-password", headers=headers, json={
            "old_password": "WrongPassword999!",
            "new_password": "AnotherPassword2026!"
        })
        self.assertEqual(resp.status_code, 400)
        self.assertIn("Current password entered is incorrect", resp.text)

if __name__ == "__main__":
    unittest.main()
