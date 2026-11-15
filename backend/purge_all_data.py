#!/usr/bin/env python3
"""
GeoHub Platform Data Purge & SuperAdmin Isolation Script
Wipes all events, tasks, registrations, attendances, QR sessions,
finances, expenses, audit logs, and non-admin users.
Retains exclusively the System SuperAdmin (SA01) account and clean team squads.
"""

import sys
import os
import json
import sqlite3
from datetime import datetime

# Add backend directory to path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

import auth

DB_PATH = os.path.join(BACKEND_DIR, "geohub.db")

def purge_database():
    print(f"[Purge] Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # 1. Purge all operational and transactional data tables
    tables_to_clear = [
        "events",
        "event_registrations",
        "tasks",
        "qr_sessions",
        "attendance",
        "documents",
        "audit_logs",
        "budget_requests",
        "expenses",
        "notifications",
        "join_requests",
        "role_permission_overrides",
        "app_devices",
    ]

    for tbl in tables_to_clear:
        try:
            c.execute(f"DELETE FROM {tbl}")
            print(f"[Purge] Cleared table: {tbl}")
        except sqlite3.OperationalError as e:
            print(f"[Purge Notice] Table {tbl} not present or skipped: {e}")

    # 2. Reset team squad containers (keep the 4 squads with empty member arrays)
    try:
        c.execute("UPDATE teams SET admin_user_ids = '[]', member_user_ids = '[]'")
        print("[Purge] Reset squad admin and member lists in teams table.")
    except Exception as e:
        print(f"[Purge Notice] Error resetting teams: {e}")

    # 3. Purge all users EXCEPT the SuperAdmin (roll_no == 'SA01' or role == 'super_admin')
    # First, delete everyone with role != 'super_admin' or roll_no != 'SA01'
    c.execute("DELETE FROM users WHERE roll_no != 'SA01' AND role != 'super_admin'")
    # Also delete any secondary super_admin test accounts like u_fac_full
    c.execute("DELETE FROM users WHERE roll_no != 'SA01'")
    
    # Check if SA01 exists
    sa = c.execute("SELECT id, roll_no, email, name, role FROM users WHERE roll_no = 'SA01'").fetchone()
    
    hashed_pwd = auth.get_password_hash("GeoHub2026!")
    now_iso = datetime.utcnow().isoformat()

    if not sa:
        print("[Purge] SuperAdmin account SA01 missing. Provisioning fresh master account...")
        c.execute("""
            INSERT INTO users (
                id, roll_no, email, name, hashed_password, role, post,
                department, year_of_study, phone, team, team_role,
                squad_memberships, is_volunteer, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "u_super_admin_sa01",
            "SA01",
            "superadmin@college.edu",
            "System SuperAdmin",
            hashed_pwd,
            "super_admin",
            "System Administrator",
            "Platform Governance & IT",
            "Executive Staff",
            "+91 94420 18800",
            "Platform Governance",
            "Master Admin",
            json.dumps([{"squad": "Platform Governance", "isLead": True}]),
            0,
            "active",
            now_iso,
            now_iso
        ))
        print("[Purge] Created System SuperAdmin (SA01) account.")
    else:
        print(f"[Purge] Retained existing SuperAdmin: {sa[3]} ({sa[1]})")
        # Ensure credentials and status are active
        c.execute("""
            UPDATE users SET
                hashed_password = ?,
                role = 'super_admin',
                post = 'System Administrator',
                status = 'active',
                updated_at = ?
            WHERE roll_no = 'SA01'
        """, (hashed_pwd, now_iso))

    # 4. Insert baseline governance audit log
    audit_id = "audit_init_" + datetime.utcnow().strftime("%Y%m%d%H%M%S")
    c.execute("""
        INSERT INTO audit_logs (
            id, actor_id, actor_name, action, target_type, target_id, target_name, details, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_id,
        "u_super_admin_sa01",
        "System SuperAdmin",
        "PLATFORM_PURGE_AND_INITIALIZE",
        "system",
        "geohub_platform",
        "GeoHub System Core",
        "System SuperAdmin executed complete platform data purge. All dummy data and non-admin accounts cleared. SuperAdmin retention locked.",
        now_iso
    ))

    conn.commit()

    # Print verification summary
    print("\n" + "=" * 50)
    print("  DATABASE PURGE VERIFICATION SUMMARY")
    print("=" * 50)
    user_count = c.execute("SELECT count(*) FROM users").fetchone()[0]
    event_count = c.execute("SELECT count(*) FROM events").fetchone()[0]
    task_count = c.execute("SELECT count(*) FROM tasks").fetchone()[0]
    expense_count = c.execute("SELECT count(*) FROM expenses").fetchone()[0]
    budget_count = c.execute("SELECT count(*) FROM budget_requests").fetchone()[0]
    audit_count = c.execute("SELECT count(*) FROM audit_logs").fetchone()[0]

    print(f" Users Count       : {user_count} (Must be exactly 1)")
    print(f" Events Count      : {event_count} (Must be 0)")
    print(f" Tasks Count       : {task_count} (Must be 0)")
    print(f" Expenses Count    : {expense_count} (Must be 0)")
    print(f" Budget Petitions  : {budget_count} (Must be 0)")
    print(f" Audit Logs Count  : {audit_count} (Must be 1 baseline entry)")

    remaining_users = c.execute("SELECT roll_no, name, role, email, status FROM users").fetchall()
    print("\n Remaining Users:")
    for u in remaining_users:
        print(f"  - [{u[0]}] {u[1]} | Role: {u[2]} | Email: {u[3]} | Status: {u[4]}")
    print("=" * 50)

    conn.close()
    return {
        "users_count": user_count,
        "events_count": event_count,
        "tasks_count": task_count,
        "expenses_count": expense_count,
        "budget_count": budget_count,
        "audit_count": audit_count,
    }

run_purge = purge_database

if __name__ == "__main__":
    purge_database()
