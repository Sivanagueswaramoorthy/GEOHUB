import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sqlite3
from datetime import datetime
import auth

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "geohub.db")
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
hashed = auth.get_password_hash('GeoHub2026!')
now = datetime.utcnow().isoformat()

# Sole Master SuperAdmin Account
SUPER_ADMIN_SEED = [
    {
        "id": "u_super_admin_sa01",
        "roll_no": "SA01",
        "email": "superadmin@college.edu",
        "name": "System SuperAdmin",
        "role": "super_admin",
        "post": "System Administrator",
        "department": "Platform Governance & IT",
        "team": "Platform Governance",
        "is_volunteer": 0,
        "status": "active"
    }
]

for u in SUPER_ADMIN_SEED:
    existing = c.execute("SELECT id FROM users WHERE roll_no = ?", (u["roll_no"],)).fetchone()
    if not existing:
        c.execute("""
            INSERT INTO users (
                id, roll_no, email, name, hashed_password, role, post,
                department, team, is_volunteer, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            u["id"], u["roll_no"], u["email"], u["name"], hashed,
            u["role"], u["post"], u["department"], u["team"],
            u["is_volunteer"], u["status"], now, now
        ))
        print(f"✓ Seeded SuperAdmin: {u['name']} ({u['roll_no']})")
    else:
        c.execute("""
            UPDATE users SET
                hashed_password = ?,
                role = 'super_admin',
                status = 'active',
                updated_at = ?
            WHERE roll_no = ?
        """, (hashed, now, u["roll_no"]))
        print(f"✓ Updated SuperAdmin: {u['name']} ({u['roll_no']})")

conn.commit()
conn.close()
print("✓ Seeded sole SuperAdmin into database.")
