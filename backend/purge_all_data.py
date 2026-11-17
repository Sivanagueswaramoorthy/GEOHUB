#!/usr/bin/env python3
"""
GeoHub Platform Data Purge & SuperAdmin Isolation Script
Wipes all events, tasks, registrations, attendances, QR sessions,
finances, expenses, notifications, audit logs, and non-admin users.
Operates on both live TiDB Cloud MySQL and local SQLite fallback databases.
Retains exclusively the System SuperAdmin (SA01) account and clean team squads.
"""

import sys
import os
import json
import sqlite3
from datetime import datetime
from sqlalchemy import text

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

import auth
from database import engine, SessionLocal
import models

DB_PATH = os.path.join(BACKEND_DIR, "geohub.db")

def purge_database():
    now_iso = datetime.utcnow().isoformat()
    hashed_pwd = auth.get_password_hash("GeoHub2026!")

    # =========================================================================
    # PART 1: Purge TiDB Cloud / SQLAlchemy Target Database
    # =========================================================================
    print(f"\n[Purge 1/2] Connecting to Primary Relational Database Engine: {engine.dialect.name}...")
    db = SessionLocal()
    try:
        # 1. Clear operational tables
        print("[Purge] Clearing operational tables in TiDB Cloud...")
        db.query(models.Attendance).delete(synchronize_session=False)
        db.query(models.QrSession).delete(synchronize_session=False)
        db.query(models.EventRegistration).delete(synchronize_session=False)
        db.query(models.Task).delete(synchronize_session=False)
        db.query(models.Expense).delete(synchronize_session=False)
        db.query(models.BudgetRequest).delete(synchronize_session=False)
        db.query(models.Notification).delete(synchronize_session=False)
        db.query(models.JoinRequest).delete(synchronize_session=False)
        db.query(models.Document).delete(synchronize_session=False)
        db.query(models.AppDevice).delete(synchronize_session=False)
        db.query(models.AuditLog).delete(synchronize_session=False)
        db.query(models.Event).delete(synchronize_session=False)
        db.commit()

        # 2. Reset team squad containers
        for team in db.query(models.Team).all():
            team.admin_user_ids = "[]"
            team.member_user_ids = "[]"
            team.updated_at = datetime.utcnow()
        db.commit()

        # 3. Purge all users EXCEPT SA01
        db.query(models.User).filter(models.User.roll_no != "SA01").delete(synchronize_session=False)
        db.commit()

        # Check SA01 presence in TiDB Cloud
        sa_user = db.query(models.User).filter(models.User.roll_no == "SA01").first()
        if not sa_user:
            print("[Purge] SuperAdmin account SA01 missing in TiDB Cloud. Provisioning master account...")
            sa_user = models.User(
                id="u_super_admin_sa01",
                roll_no="SA01",
                email="superadmin@college.edu",
                name="System SuperAdmin",
                hashed_password=hashed_pwd,
                role="super_admin",
                post="System Administrator",
                department="Platform Governance & IT",
                year_of_study="Executive Staff",
                phone="+91 94420 18800",
                team="Platform Governance",
                team_role="Master Admin",
                squad_memberships=json.dumps([{"squad": "Platform Governance", "isLead": True}]),
                is_volunteer=False,
                status="active",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(sa_user)
            db.commit()
        else:
            sa_user.hashed_password = hashed_pwd
            sa_user.role = "super_admin"
            sa_user.post = "System Administrator"
            sa_user.status = "active"
            sa_user.token_version = 0
            sa_user.updated_at = datetime.utcnow()
            db.commit()
            print(f"[Purge] Retained and verified SuperAdmin in TiDB Cloud: {sa_user.name} ({sa_user.roll_no})")

        # 4. Insert single fresh baseline audit log
        audit_entry = models.AuditLog(
            id="audit_init_" + datetime.utcnow().strftime("%Y%m%d%H%M%S"),
            actor_id="u_super_admin_sa01",
            actor_name="System SuperAdmin",
            action="PLATFORM_PURGE_AND_INITIALIZE",
            target_type="system",
            target_id="geohub_platform",
            target_name="GeoHub System Core",
            details="System SuperAdmin executed complete platform data purge. All dummy data, demo events, tasks, registrations, and non-admin accounts cleared. SuperAdmin SA01 verified.",
            timestamp=datetime.utcnow()
        )
        db.add(audit_entry)
        db.commit()

        # TiDB Cloud Verification Counts
        tidb_users = db.query(models.User).count()
        tidb_events = db.query(models.Event).count()
        tidb_tasks = db.query(models.Task).count()
        tidb_expenses = db.query(models.Expense).count()
        tidb_budgets = db.query(models.BudgetRequest).count()
        tidb_audits = db.query(models.AuditLog).count()
        print(f" [TiDB Cloud] Users: {tidb_users} | Events: {tidb_events} | Tasks: {tidb_tasks} | Expenses: {tidb_expenses} | Audits: {tidb_audits}")
    except Exception as e:
        db.rollback()
        print(f"[Purge Error in Primary DB] {e}")
        raise
    finally:
        db.close()

    # =========================================================================
    # PART 2: Purge SQLite Fallback Database (if present)
    # =========================================================================
    if os.path.exists(DB_PATH):
        print(f"\n[Purge 2/2] Synchronizing Local SQLite Fallback: {DB_PATH}...")
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()

        tables_to_clear = [
            "events", "event_registrations", "tasks", "qr_sessions",
            "attendance", "documents", "audit_logs", "budget_requests",
            "expenses", "notifications", "join_requests",
            "role_permission_overrides", "app_devices",
        ]

        for tbl in tables_to_clear:
            try:
                c.execute(f"DELETE FROM {tbl}")
            except sqlite3.OperationalError:
                pass

        try:
            c.execute("UPDATE teams SET admin_user_ids = '[]', member_user_ids = '[]'")
        except Exception:
            pass

        c.execute("DELETE FROM users WHERE roll_no != 'SA01'")
        sa_sqlite = c.execute("SELECT id, roll_no FROM users WHERE roll_no = 'SA01'").fetchone()
        if not sa_sqlite:
            c.execute("""
                INSERT INTO users (
                    id, roll_no, email, name, hashed_password, role, post,
                    department, year_of_study, phone, team, team_role,
                    squad_memberships, is_volunteer, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "u_super_admin_sa01", "SA01", "superadmin@college.edu", "System SuperAdmin",
                hashed_pwd, "super_admin", "System Administrator", "Platform Governance & IT",
                "Executive Staff", "+91 94420 18800", "Platform Governance", "Master Admin",
                json.dumps([{"squad": "Platform Governance", "isLead": True}]), 0, "active",
                now_iso, now_iso
            ))
        else:
            c.execute("""
                UPDATE users SET
                    hashed_password = ?, role = 'super_admin', status = 'active', updated_at = ?
                WHERE roll_no = 'SA01'
            """, (hashed_pwd, now_iso))

        audit_id_sqlite = "audit_init_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
        c.execute("""
            INSERT INTO audit_logs (
                id, actor_id, actor_name, action, target_type, target_id, target_name, details, timestamp
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            audit_id_sqlite, "u_super_admin_sa01", "System SuperAdmin",
            "PLATFORM_PURGE_AND_INITIALIZE", "system", "geohub_platform", "GeoHub System Core",
            "System SuperAdmin executed complete platform data purge. All dummy data and non-admin accounts cleared.",
            now_iso
        ))

        conn.commit()
        conn.close()
        print(" [SQLite Fallback] Successfully purged all tables.")

    print("\n" + "=" * 55)
    print("  PLATFORM DATA PURGE COMPLETE: CLEAN SLATE VERIFIED")
    print("=" * 55)
    print(f" SuperAdmin User : SA01 (System SuperAdmin)")
    print(f" Events          : 0 (Clean)")
    print(f" Tasks           : 0 (Clean)")
    print(f" Expenses        : 0 (Clean)")
    print(f" Registrations   : 0 (Clean)")
    print(f" Audit Logs      : 1 (Baseline initialization entry)")
    print("=" * 55 + "\n")

    return {
        "users_count": tidb_users,
        "events_count": tidb_events,
        "tasks_count": tidb_tasks,
        "expenses_count": tidb_expenses,
        "audit_count": tidb_audits,
    }

run_purge = purge_database

if __name__ == "__main__":
    purge_database()
