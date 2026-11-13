import unittest
import json
from datetime import datetime
from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
import models
import auth

class TestFullBackendSuite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()

        # Seed Faculty (Super Admin)
        cls.faculty_email = "faculty_full@college.edu"
        cls.faculty_roll = "FAC999"
        cls.pwd = "GeoHub2026!"
        
        fac = db.query(models.User).filter(models.User.email == cls.faculty_email).first()
        if not fac:
            fac = models.User(
                id="u_fac_full",
                roll_no=cls.faculty_roll,
                name="Dr. Jenkins Full",
                email=cls.faculty_email,
                hashed_password=auth.get_password_hash(cls.pwd),
                role="super_admin",
                status="active"
            )
            db.add(fac)

        # Seed Coordinator
        cls.coord_email = "coord_full@college.edu"
        cls.coord_roll = "21GEO888"
        coord = db.query(models.User).filter(models.User.email == cls.coord_email).first()
        if not coord:
            coord = models.User(
                id="u_coord_full",
                roll_no=cls.coord_roll,
                name="Alex Coordinator",
                email=cls.coord_email,
                hashed_password=auth.get_password_hash(cls.pwd),
                role="admin",
                status="active"
            )
            db.add(coord)

        # Seed Treasurer
        cls.treas_email = "treas_full@college.edu"
        cls.treas_roll = "21GEO777"
        treas = db.query(models.User).filter(models.User.email == cls.treas_email).first()
        if not treas:
            treas = models.User(
                id="u_treas_full",
                roll_no=cls.treas_roll,
                name="Elena Treasurer",
                email=cls.treas_email,
                hashed_password=auth.get_password_hash(cls.pwd),
                role="treasurer",
                status="active"
            )
            db.add(treas)

        # Seed Student
        cls.stud_email = "stud_full@college.edu"
        cls.stud_roll = "21GEO666"
        stud = db.query(models.User).filter(models.User.email == cls.stud_email).first()
        if not stud:
            stud = models.User(
                id="u_stud_full",
                roll_no=cls.stud_roll,
                name="Marcus Scholar",
                email=cls.stud_email,
                hashed_password=auth.get_password_hash(cls.pwd),
                role="student",
                status="active"
            )
            db.add(stud)

        db.commit()
        db.close()

    def get_token(self, roll_no):
        resp = self.client.post("/api/auth/login", json={"roll_no": roll_no, "password": self.pwd})
        self.assertEqual(resp.status_code, 200, f"Login failed for {roll_no}: {resp.text}")
        return resp.json()["access_token"]

    def test_01_health_check(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["database"], "connected")

    def test_02_auth_me(self):
        token = self.get_token(self.coord_roll)
        resp = self.client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["roll_no"], self.coord_roll)

    def test_03_teams_endpoints(self):
        token = self.get_token(self.coord_roll)
        resp = self.client.get("/api/teams", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200)
        teams = resp.json()
        self.assertIsInstance(teams, list)

    def test_04_events_full_lifecycle(self):
        coord_token = self.get_token(self.coord_roll)
        fac_token = self.get_token(self.faculty_roll)

        # 1. Create Event (Draft) by Coordinator
        event_payload = {
            "title": "Fullstack Drone Camp",
            "type": "Technical",
            "date_time": "2026-12-01T10:00:00",
            "venue": "Campus Grounds",
            "description": "Full-stack validation event",
            "budget": 25000.0,
            "academic_year": "2026-2027",
            "volunteer_user_ids": [],
            "status": "draft"
        }
        res = self.client.post("/api/events", headers={"Authorization": f"Bearer {coord_token}"}, json=event_payload)
        self.assertEqual(res.status_code, 200, res.text)
        event_id = res.json()["id"]

        # 2. Coordinator submits event (draft -> submitted)
        res_sub = self.client.patch(f"/api/events/{event_id}/status?status_in=submitted", headers={"Authorization": f"Bearer {coord_token}"})
        self.assertEqual(res_sub.status_code, 200, res_sub.text)
        self.assertEqual(res_sub.json()["status"], "submitted")

        # 3. Faculty approves event (submitted -> approved)
        res_app = self.client.patch(f"/api/events/{event_id}/status?status_in=approved", headers={"Authorization": f"Bearer {fac_token}"})
        self.assertEqual(res_app.status_code, 200, res_app.text)
        self.assertEqual(res_app.json()["status"], "approved")

        # 4. Student registers for event
        stud_token = self.get_token(self.stud_roll)
        res_reg = self.client.post(f"/api/events/{event_id}/register", headers={"Authorization": f"Bearer {stud_token}"})
        self.assertEqual(res_reg.status_code, 200, res_reg.text)

    def test_05_tasks_lifecycle(self):
        coord_token = self.get_token(self.coord_roll)
        task_payload = {
            "title": "Survey Checkpoint Alpha",
            "description": "Calibrate sensors at GPS mark 1",
            "team_id": "Management",
            "assigned_user_ids": ["u_stud_full"],
            "deadline": "2026-12-01T12:00:00",
            "status": "todo"
        }
        res = self.client.post("/api/tasks", headers={"Authorization": f"Bearer {coord_token}"}, json=task_payload)
        self.assertEqual(res.status_code, 200, res.text)
        task_id = res.json()["id"]

        # Update status via patch
        stud_token = self.get_token(self.stud_roll)
        res_up = self.client.patch(f"/api/tasks/{task_id}/status?status=in_progress", headers={"Authorization": f"Bearer {stud_token}"})
        self.assertEqual(res_up.status_code, 200, res_up.text)

    def test_06_finance_budget_request_and_sanction(self):
        treas_token = self.get_token(self.treas_roll)
        fac_token = self.get_token(self.faculty_roll)

        # 1. Treasurer submits budget request
        req_payload = {
            "team_name": "Management",
            "requested_amount": 15000.0,
            "current_allocation": 5000.0,
            "reason": "Precision sensor recalibration"
        }
        res_sub = self.client.post("/api/finance/budget-requests", headers={"Authorization": f"Bearer {treas_token}"}, json=req_payload)
        self.assertEqual(res_sub.status_code, 200, res_sub.text)
        budget_id = res_sub.json()["id"]

        # 2. Faculty approves request
        res_app = self.client.post(f"/api/finance/budget-requests/{budget_id}/approve", headers={"Authorization": f"Bearer {fac_token}"})
        self.assertEqual(res_app.status_code, 200, res_app.text)
        self.assertEqual(res_app.json()["status"], "approved")

    def test_07_dashboard_stats(self):
        token = self.get_token(self.coord_roll)
        resp = self.client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(resp.status_code, 200)
        stats = resp.json()
        self.assertIn("total_events", stats)
        self.assertIn("total_members", stats)
        self.assertIn("total_volunteers", stats)

    def test_08_audit_logs(self):
        fac_token = self.get_token(self.faculty_roll)
        resp = self.client.get("/api/audit-logs", headers={"Authorization": f"Bearer {fac_token}"})
        self.assertEqual(resp.status_code, 200)
        logs = resp.json()
        self.assertIsInstance(logs, list)

    def test_09_expenses_lifecycle(self):
        treas_token = self.get_token(self.treas_roll)
        # Log expense
        payload = {
            "title": "Field Equipment Calibration",
            "category": "Equipment",
            "amount": 4200.0,
            "event_title": "Fullstack Drone Camp"
        }
        resp = self.client.post("/api/finance/expenses", headers={"Authorization": f"Bearer {treas_token}"}, json=payload)
        self.assertEqual(resp.status_code, 200, resp.text)
        exp = resp.json()
        self.assertEqual(exp["amount"], 4200.0)

        # Get expenses list
        list_resp = self.client.get("/api/finance/expenses", headers={"Authorization": f"Bearer {treas_token}"})
        self.assertEqual(list_resp.status_code, 200)
        self.assertTrue(any(e["title"] == "Field Equipment Calibration" for e in list_resp.json()))

    def test_10_users_roster_and_enrollment(self):
        coord_token = self.get_token(self.coord_roll)
        # Get users
        get_res = self.client.get("/api/auth/users", headers={"Authorization": f"Bearer {coord_token}"})
        self.assertEqual(get_res.status_code, 200)
        self.assertIsInstance(get_res.json(), list)

        # Enroll scholar
        enroll_payload = {
            "name": "Live Test Scholar",
            "roll_no": f"21TEST{datetime.now().strftime('%M%S')}",
            "email": f"test{datetime.now().strftime('%M%S')}@college.edu",
            "role": "student",
            "department": "Geoinformatics"
        }
        enroll_res = self.client.post("/api/auth/users", headers={"Authorization": f"Bearer {coord_token}"}, json=enroll_payload)
        self.assertEqual(enroll_res.status_code, 200, enroll_res.text)
        self.assertEqual(enroll_res.json()["name"], "Live Test Scholar")

if __name__ == "__main__":
    unittest.main()

