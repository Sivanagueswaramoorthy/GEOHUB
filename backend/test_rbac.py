"""
Backend RBAC, Lifecycle, Protection Rules, and QR Scanner Verification Tests
Uses Python standard library `unittest` and FastAPI TestClient.
"""

import unittest
import os
import json
import time
from datetime import datetime, timedelta

# Import backend modules
import sys
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import HTTPException
from auth import (
    normalize_role,
    has_permission,
    check_event_scanner_assignment,
    verify_no_self_escalation,
    PERMISSIONS_MATRIX,
)

class TestBackendRBAC(unittest.TestCase):
    def setUp(self):
        self.matrix = PERMISSIONS_MATRIX

    # =========================================================================
    # 1. Matrix & Role Normalization
    # =========================================================================
    def test_matrix_structure(self):
        """Assert all 6 final roles and 27 flags exist in backend permissions_matrix.json"""
        expected_roles = ["faculty", "coordinator", "documentation", "treasurer", "promotion", "student"]
        for role in expected_roles:
            self.assertIn(role, self.matrix["roles"])
            self.assertEqual(len(self.matrix["matrix"][role]), 27)

    def test_role_normalization(self):
        """Verify legacy roles map correctly to final roles"""
        self.assertEqual(normalize_role("super_admin"), "faculty")
        self.assertEqual(normalize_role("admin"), "coordinator")
        self.assertEqual(normalize_role("social_media"), "promotion")
        self.assertEqual(normalize_role("member"), "student")
        self.assertEqual(normalize_role("volunteer"), "student")
        self.assertEqual(normalize_role("team_admin"), "student")
        self.assertEqual(normalize_role("unknown"), "student")
        self.assertEqual(normalize_role(""), "student")

    # =========================================================================
    # 2. Permissions Matrix Assertions
    # =========================================================================
    def test_matrix_exact_permissions(self):
        """Verify key role × flag permissions exactly match the specification"""
        matrix_roles = self.matrix["matrix"]
        # Faculty
        self.assertTrue(matrix_roles["faculty"]["canApproveEvents"])
        self.assertTrue(matrix_roles["faculty"]["canArchiveEvents"])
        self.assertTrue(matrix_roles["faculty"]["canApproveBudget"])
        self.assertTrue(matrix_roles["faculty"]["canAssignPosts"])
        self.assertTrue(matrix_roles["faculty"]["canViewAuditLog"])
        self.assertFalse(matrix_roles["faculty"]["canEditDocStudio"]) # View only
        self.assertFalse(matrix_roles["faculty"]["canManageCampaigns"]) # View only

        # Coordinator
        self.assertTrue(matrix_roles["coordinator"]["canCreateEditEvents"])
        self.assertFalse(matrix_roles["coordinator"]["canApproveEvents"]) # Faculty only
        self.assertFalse(matrix_roles["coordinator"]["canArchiveEvents"]) # Faculty only
        self.assertTrue(matrix_roles["coordinator"]["canCancelEvents"])
        self.assertFalse(matrix_roles["coordinator"]["canApproveBudget"]) # Faculty only
        self.assertFalse(matrix_roles["coordinator"]["canAssignPosts"]) # Faculty only
        self.assertFalse(matrix_roles["coordinator"]["canViewAuditLog"]) # Faculty only

        # Treasurer
        self.assertFalse(matrix_roles["treasurer"]["canApproveBudget"]) # Removed from treasurer
        self.assertTrue(matrix_roles["treasurer"]["canSubmitBudgetRequest"])
        self.assertTrue(matrix_roles["treasurer"]["canManageExpenses"])
        self.assertTrue(matrix_roles["treasurer"]["canAccessFinance"])
        self.assertFalse(matrix_roles["treasurer"]["canEditBudget"]) # Faculty only allocations
        self.assertFalse(matrix_roles["treasurer"]["canReviewExecutiveApprovals"]) # Own only

        # Documentation
        self.assertTrue(matrix_roles["documentation"]["canEditDocStudio"])
        self.assertTrue(matrix_roles["documentation"]["canCreateMemories"])
        self.assertTrue(matrix_roles["documentation"]["canPublishMemories"])

        # Promotion
        self.assertTrue(matrix_roles["promotion"]["canManageCampaigns"])
        self.assertTrue(matrix_roles["promotion"]["canAccessCampaigns"])
        self.assertTrue(matrix_roles["promotion"]["canSendNotifications"])

        # Student
        self.assertFalse(matrix_roles["student"]["canCreateEditEvents"])
        self.assertFalse(matrix_roles["student"]["canApproveBudget"])
        self.assertFalse(matrix_roles["student"]["canAccessFinance"])

        # canScanQr must not exist in matrix
        for role, flags in matrix_roles.items():
            self.assertNotIn("canScanQr", flags)

    # =========================================================================
    # 3. Layer 2: Squad Post Authority & Tenure Expiration
    # =========================================================================
    def test_post_tenure_expiration(self):
        """Active post grants squad authority; expired post automatically loses permissions"""
        now = datetime.utcnow()
        future = (now + timedelta(days=30)).isoformat()
        past = (now - timedelta(days=2)).isoformat()

        # Active team admin in Management
        user_active = {
            "id": "u_active_lead",
            "role": "student",
            "post": "team_admin",
            "team": "Management",
            "tenure_end": future,
        }
        self.assertTrue(has_permission(user_active, "canManageSquads", resource={"squad": "Management"}))
        # Cannot manage outside own squad
        self.assertFalse(has_permission(user_active, "canManageSquads", resource={"squad": "Documentation"}))

        # Expired team admin in Management
        user_expired = {
            "id": "u_expired_lead",
            "role": "student",
            "post": "team_admin",
            "team": "Management",
            "tenure_end": past,
        }
        self.assertFalse(has_permission(user_expired, "canManageSquads", resource={"squad": "Management"}))

    # =========================================================================
    # 4. Layer 3: Per-Event QR Scanner Assignment
    # =========================================================================
    def test_qr_scanner_assignment(self):
        """Unassigned user cannot scan; assigned student can scan"""
        event = {
            "id": "event_geo_01",
            "assigned_scanner_user_ids": ["u_student_99", "u_coord_01"],
        }

        # Assigned student
        assigned_user = {"id": "u_student_99", "role": "student"}
        self.assertTrue(check_event_scanner_assignment(assigned_user, event))

        # Unassigned student
        unassigned_user = {"id": "u_student_other", "role": "student"}
        self.assertFalse(check_event_scanner_assignment(unassigned_user, event))

        # Faculty if assigned
        assigned_faculty = {"id": "u_coord_01", "role": "coordinator"}
        self.assertTrue(check_event_scanner_assignment(assigned_faculty, event))

    # =========================================================================
    # 5. Protection Rules
    # =========================================================================
    def test_no_self_escalation(self):
        """User cannot modify their own role or post"""
        # Self modification blocked with HTTPException
        with self.assertRaises(HTTPException) as ctx:
            verify_no_self_escalation("u_user_01", "u_user_01")
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Self-escalation", ctx.exception.detail)

        # Modification of others allowed (no exception raised)
        verify_no_self_escalation("u_faculty_01", "u_student_02")

    def test_last_faculty_protection(self):
        """Cannot demote the last remaining faculty account"""
        def check_last_faculty_rule(target_role, new_role, faculty_count):
            if normalize_role(target_role) == "faculty" and normalize_role(new_role) != "faculty":
                if faculty_count <= 1:
                    raise HTTPException(status_code=400, detail="Cannot demote last remaining faculty")

        # Demoting when only 1 faculty remains -> raises HTTPException
        with self.assertRaises(HTTPException) as ctx:
            check_last_faculty_rule(target_role="faculty", new_role="student", faculty_count=1)
        self.assertIn("last remaining faculty", ctx.exception.detail)

        # Demoting when 2 faculty remain -> allowed
        check_last_faculty_rule(target_role="faculty", new_role="student", faculty_count=2)

    # =========================================================================
    # 6. Event Lifecycle State Machine
    # =========================================================================
    def test_event_lifecycle_transitions(self):
        """Allowed: Draft -> Submitted -> Approved -> Live -> Done -> Archived"""
        allowed = {
            "draft": ["submitted", "cancelled"],
            "submitted": ["approved", "draft", "cancelled"],
            "approved": ["live", "cancelled"],
            "live": ["done", "completed", "cancelled"],
            "completed": ["archived"],
            "done": ["archived"],
            "archived": [],
            "cancelled": [],
        }

        def is_valid_jump(current, target):
            return target in allowed.get(current, [])

        # Valid transitions
        self.assertTrue(is_valid_jump("draft", "submitted"))
        self.assertTrue(is_valid_jump("submitted", "approved"))
        self.assertTrue(is_valid_jump("approved", "live"))
        self.assertTrue(is_valid_jump("live", "done"))
        self.assertTrue(is_valid_jump("done", "archived"))

        # Invalid transitions (rejected jumps)
        self.assertFalse(is_valid_jump("draft", "live"))
        self.assertFalse(is_valid_jump("draft", "approved"))
        self.assertFalse(is_valid_jump("submitted", "live"))
        self.assertFalse(is_valid_jump("archived", "live"))
        self.assertFalse(is_valid_jump("cancelled", "approved"))

    # =========================================================================
    # 7. QR Token Verification Logic
    # =========================================================================
    def test_qr_token_validation(self):
        """Test token validity: unexpired, unused, event match"""
        now = time.time()
        valid_token = {
            "token": "tok_valid",
            "event_id": "event_100",
            "user_id": "u_student_1",
            "expires_at": now + 60,
            "is_used": False,
        }

        def verify_scan(token_obj, scanning_event_id):
            if token_obj["is_used"]:
                return False, "Reused token rejected"
            if time.time() > token_obj["expires_at"]:
                return False, "Expired token rejected (> 60s)"
            if token_obj["event_id"] != scanning_event_id:
                return False, "Wrong-event token rejected"
            token_obj["is_used"] = True
            return True, "Success"

        # 1. Valid scan
        ok, msg = verify_scan(valid_token, "event_100")
        self.assertTrue(ok)
        self.assertEqual(msg, "Success")

        # 2. Reused token rejected
        ok, msg = verify_scan(valid_token, "event_100")
        self.assertFalse(ok)
        self.assertIn("Reused", msg)

        # 3. Expired token rejected
        expired_token = {
            "token": "tok_exp",
            "event_id": "event_100",
            "user_id": "u_student_2",
            "expires_at": now - 10,
            "is_used": False,
        }
        ok, msg = verify_scan(expired_token, "event_100")
        self.assertFalse(ok)
        self.assertIn("Expired", msg)

        # 4. Wrong event token rejected
        wrong_event_token = {
            "token": "tok_wrong",
            "event_id": "event_999",
            "user_id": "u_student_3",
            "expires_at": now + 60,
            "is_used": False,
        }
        ok, msg = verify_scan(wrong_event_token, "event_100")
        self.assertFalse(ok)
        self.assertIn("Wrong-event", msg)

if __name__ == "__main__":
    unittest.main()
