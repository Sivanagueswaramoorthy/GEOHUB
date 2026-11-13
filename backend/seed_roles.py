import sys
sys.path.insert(0, 'backend')
import sqlite3
import auth

conn = sqlite3.connect('geohub.db')
c = conn.cursor()
hashed = auth.get_password_hash('GeoHub2026!')

# Ensure SA01 exists as super_admin
c.execute("SELECT roll_no FROM users WHERE roll_no = 'SA01'")
if not c.fetchone():
    c.execute("""
        INSERT INTO users (id, roll_no, email, name, hashed_password, role, post, status, department, is_volunteer)
        VALUES ('u_super_admin_sa01', 'SA01', 'superadmin@college.edu', 'System SuperAdmin', ?, 'super_admin', 'System Administrator', 'active', 'Platform Governance', 0)
    """, (hashed,))
    print('Seeded SA01 super_admin into geohub.db')
else:
    c.execute("UPDATE users SET role = 'super_admin', name = 'System SuperAdmin', post = 'System Administrator' WHERE roll_no = 'SA01'")
    print('Updated SA01 super_admin in geohub.db')

# Ensure FAC01 exists as faculty
c.execute("SELECT roll_no FROM users WHERE roll_no = 'FAC01'")
if not c.fetchone():
    c.execute("""
        INSERT INTO users (id, roll_no, email, name, hashed_password, role, post, status, department, is_volunteer)
        VALUES ('u_faculty_fac01', 'FAC01', 'sarah.jenkins@college.edu', 'Dr. Sarah Jenkins', ?, 'faculty', 'Faculty Advisor', 'active', 'Geography & Geomatics', 0)
    """, (hashed,))
    print('Seeded FAC01 faculty into geohub.db')
else:
    c.execute("UPDATE users SET role = 'faculty' WHERE roll_no = 'FAC01'")
    print('Updated FAC01 to role faculty in geohub.db')

conn.commit()

# Print all users in DB
print("Current DB Users:")
for row in c.execute("SELECT roll_no, name, role, email FROM users").fetchall():
    print(row)

conn.close()

