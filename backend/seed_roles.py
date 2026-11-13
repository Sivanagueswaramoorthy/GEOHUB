import sys
sys.path.insert(0, 'backend')
import sqlite3
from datetime import datetime
import auth

conn = sqlite3.connect('geohub.db')
c = conn.cursor()
hashed = auth.get_password_hash('GeoHub2026!')
now = datetime.utcnow().isoformat()

# Complete roster of all 9 canonical platform roles
ALL_ROLES_SEED = [
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
    },
    {
        "id": "u_faculty_fac01",
        "roll_no": "FAC01",
        "email": "sarah.jenkins@college.edu",
        "name": "Dr. Sarah Jenkins",
        "role": "faculty",
        "post": "Faculty Advisor",
        "department": "Geography & Geomatics",
        "team": "Management",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_admin_02",
        "roll_no": "21GEO001",
        "email": "alex.rivera@college.edu",
        "name": "Alex Rivera",
        "role": "coordinator",
        "post": "Club President",
        "department": "Geoinformatics Engineering",
        "team": "Management",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_mgmt_06",
        "roll_no": "21GEO010",
        "email": "elena.rostova@college.edu",
        "name": "Elena Rostova",
        "role": "management",
        "post": "Vice President",
        "department": "Geology & Environmental Management",
        "team": "Management",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_doc_lead_08",
        "roll_no": "22GEO018",
        "email": "aarav.patel@college.edu",
        "name": "Aarav Patel",
        "role": "documentation",
        "post": "Documentation Lead",
        "department": "Geoinformatics & Archival Science",
        "team": "Documentation",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_treasurer_07",
        "roll_no": "22GEO019",
        "email": "ananya.iyer@college.edu",
        "name": "Ananya Iyer",
        "role": "treasurer",
        "post": "Treasurer",
        "department": "Economics & Financial Analytics",
        "team": "Management",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_promo_03",
        "roll_no": "22GEO014",
        "email": "david.chen@college.edu",
        "name": "David Chen",
        "role": "promotion",
        "post": "Promotion Lead",
        "department": "Earth Science & Media",
        "team": "Promotion",
        "is_volunteer": 0,
        "status": "active"
    },
    {
        "id": "u_volunteer_05",
        "roll_no": "23GEO042",
        "email": "liam.vance@college.edu",
        "name": "Liam Vance",
        "role": "volunteer",
        "post": "Lead Volunteer",
        "department": "Environmental Studies",
        "team": "Entertainment",
        "is_volunteer": 1,
        "status": "active"
    },
    {
        "id": "u_member_04",
        "roll_no": "23GEO088",
        "email": "maya.patel@college.edu",
        "name": "Maya Patel",
        "role": "student",
        "post": "Club Member",
        "department": "Cartography & Geography",
        "team": "General",
        "is_volunteer": 0,
        "status": "active"
    },
]

for u in ALL_ROLES_SEED:
    c.execute("SELECT id FROM users WHERE roll_no = ? OR email = ?", (u["roll_no"], u["email"]))
    row = c.fetchone()
    if row:
        c.execute("""
            UPDATE users SET
                roll_no = ?, email = ?, name = ?, role = ?, post = ?,
                department = ?, team = ?, is_volunteer = ?, status = ?,
                hashed_password = ?, created_at = COALESCE(created_at, ?)
            WHERE id = ?
        """, (
            u["roll_no"], u["email"], u["name"], u["role"], u["post"],
            u["department"], u["team"], u["is_volunteer"], u["status"],
            hashed, now, row[0]
        ))
        print(f"Updated user {u['roll_no']} ({u['name']}) -> role: {u['role']}")
    else:
        c.execute("""
            INSERT INTO users (id, roll_no, email, name, role, post, department, team, is_volunteer, status, hashed_password, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            u["id"], u["roll_no"], u["email"], u["name"], u["role"], u["post"],
            u["department"], u["team"], u["is_volunteer"], u["status"],
            hashed, now
        ))
        print(f"Inserted user {u['roll_no']} ({u['name']}) -> role: {u['role']}")

conn.commit()

print("\n--- Verified Active Users in geohub.db ---")
for r in c.execute("SELECT roll_no, name, role, email FROM users ORDER BY roll_no").fetchall():
    print(r)

conn.close()
