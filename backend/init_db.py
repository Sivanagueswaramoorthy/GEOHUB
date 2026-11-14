import json
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
import models
import auth

def init_database():
    print("[Init DB] Creating all relational database tables...")
    Base.metadata.create_all(bind=engine)

    # Ensure SQLite schema is up to date with models
    if engine.url.drivername.startswith("sqlite"):
        from sqlalchemy import text
        with engine.connect() as conn:
            existing_cols = [r[1] for r in conn.execute(text("PRAGMA table_info(users)")).fetchall()]
            cols_to_add = [
                ("roll_no", "VARCHAR(32)"),
                ("post", "VARCHAR(64)"),
                ("department", "VARCHAR(128)"),
                ("year_of_study", "VARCHAR(64)"),
                ("phone", "VARCHAR(32)"),
                ("tenure_end", "DATETIME"),
                ("squad_memberships", "TEXT"),
            ]
            for col_name, col_type in cols_to_add:
                if col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
            conn.commit()

    print("[Init DB] Tables verified successfully.")

    db = SessionLocal()
    try:
        # 1. Seed Teams / Squads
        squads = [
            ("Management", "Responsible for club planning, coordination, and administrative operations."),
            ("Promotion", "Responsible for social media outreach, campaigns, posters, and campus engagement."),
            ("Documentation", "Responsible for event photography, videography, report compilation, and archival."),
            ("Entertainment", "Responsible for cultural activities, stage hosting, sound, and audience activities."),
        ]
        for name, desc in squads:
            existing_team = db.query(models.Team).filter(models.Team.name == name).first()
            if not existing_team:
                team = models.Team(
                    id=name,
                    name=name,
                    description=desc,
                    admin_user_ids="[]",
                    member_user_ids="[]",
                )
                db.add(team)
                print(f"[Init DB] Created squad: {name}")

        # 2. Seed Core Chapter Roles & Accounts
        default_pwd = auth.get_password_hash("GeoHub2026!")

        seed_users = [
            {
                "id": "u_fac_01",
                "roll_no": "21GEO000",
                "name": "Dr. Robert Vance",
                "email": "faculty@college.edu",
                "role": "faculty",
                "post": "Faculty Advisor",
                "department": "Geoinformatics Engineering",
                "year_of_study": "Faculty Board",
                "phone": "+91 94420 18800",
                "team": "Management",
                "team_role": "Advisor",
                "is_volunteer": False,
                "status": "active",
                "squad_memberships": json.dumps([{"squad": "Management", "isLead": True}]),
            },
            {
                "id": "u_admin_02",
                "roll_no": "21GEO001",
                "name": "Alex Rivera",
                "email": "president@college.edu",
                "role": "coordinator",
                "post": "Club President",
                "department": "Geoinformatics Engineering",
                "year_of_study": "4th Year (Senior)",
                "phone": "+91 94420 18820",
                "team": "Management",
                "team_role": "Squad Lead",
                "is_volunteer": True,
                "status": "active",
                "squad_memberships": json.dumps([{"squad": "Management", "isLead": True}]),
            },
            {
                "id": "u_treasurer_03",
                "roll_no": "21GEO002",
                "name": "Marcus Chen",
                "email": "treasurer@college.edu",
                "role": "treasurer",
                "post": "Treasurer",
                "department": "Geoinformatics Engineering",
                "year_of_study": "3rd Year",
                "phone": "+91 94420 18822",
                "team": "Management",
                "team_role": "Finance Officer",
                "is_volunteer": False,
                "status": "active",
                "squad_memberships": json.dumps([{"squad": "Management", "isLead": False}]),
            },
            {
                "id": "u_doc_04",
                "roll_no": "21GEO003",
                "name": "Sarah Jenkins",
                "email": "doc@college.edu",
                "role": "documentation",
                "post": "Documentation Lead",
                "department": "Cartography & Surveying",
                "year_of_study": "3rd Year",
                "phone": "+91 94420 18823",
                "team": "Documentation",
                "team_role": "Lead Archivist",
                "is_volunteer": False,
                "status": "active",
                "squad_memberships": json.dumps([{"squad": "Documentation", "isLead": True}]),
            },
            {
                "id": "u_promo_05",
                "roll_no": "21GEO004",
                "name": "David Kim",
                "email": "promo@college.edu",
                "role": "promotion",
                "post": "Promotion Lead",
                "department": "Geoinformatics Engineering",
                "year_of_study": "2nd Year",
                "phone": "+91 94420 18824",
                "team": "Promotion",
                "team_role": "Creative Lead",
                "is_volunteer": False,
                "status": "active",
                "squad_memberships": json.dumps([{"squad": "Promotion", "isLead": True}]),
            },
            {
                "id": "u_student_06",
                "roll_no": "21GEO006",
                "name": "Fatima Zahra",
                "email": "student@college.edu",
                "role": "student",
                "post": "Chapter Member",
                "department": "Geoinformatics Engineering",
                "year_of_study": "2nd Year",
                "phone": "+91 94420 18826",
                "team": None,
                "team_role": None,
                "is_volunteer": True,
                "status": "active",
                "squad_memberships": json.dumps([]),
            },
        ]

        for u in seed_users:
            existing = db.query(models.User).filter(
                (models.User.email == u["email"]) | (models.User.roll_no == u["roll_no"])
            ).first()
            if not existing:
                user = models.User(
                    id=u["id"],
                    roll_no=u["roll_no"],
                    name=u["name"],
                    email=u["email"],
                    hashed_password=default_pwd,
                    role=u["role"],
                    post=u["post"],
                    department=u["department"],
                    year_of_study=u["year_of_study"],
                    phone=u["phone"],
                    team=u["team"],
                    team_role=u["team_role"],
                    squad_memberships=u["squad_memberships"],
                    is_volunteer=u["is_volunteer"],
                    status=u["status"],
                )
                db.add(user)
                print(f"[Init DB] Seeded user: {u['name']} ({u['roll_no']}) - {u['role']}")

        db.commit()
        print("[Init DB] Database successfully initialized with core squads and official role accounts!")
    except Exception as e:
        db.rollback()
        print(f"[Init DB Error] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

