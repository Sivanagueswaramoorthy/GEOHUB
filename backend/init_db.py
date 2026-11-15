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
        # 1. Seed Teams / Squads (Clean Containers)
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

        # 2. Seed Exclusively the System SuperAdmin Account
        default_pwd = auth.get_password_hash("GeoHub2026!")

        superadmin_user = {
            "id": "u_super_admin_sa01",
            "roll_no": "SA01",
            "name": "System SuperAdmin",
            "email": "superadmin@college.edu",
            "role": "super_admin",
            "post": "System Administrator",
            "department": "Platform Governance & IT",
            "year_of_study": "Executive Staff",
            "phone": "+91 94420 18800",
            "team": "Platform Governance",
            "team_role": "Master Admin",
            "is_volunteer": False,
            "status": "active",
            "squad_memberships": json.dumps([{"squad": "Platform Governance", "isLead": True}]),
        }

        existing_sa = db.query(models.User).filter(
            (models.User.email == superadmin_user["email"]) | (models.User.roll_no == superadmin_user["roll_no"])
        ).first()

        if not existing_sa:
            user = models.User(
                id=superadmin_user["id"],
                roll_no=superadmin_user["roll_no"],
                name=superadmin_user["name"],
                email=superadmin_user["email"],
                hashed_password=default_pwd,
                role=superadmin_user["role"],
                post=superadmin_user["post"],
                department=superadmin_user["department"],
                year_of_study=superadmin_user["year_of_study"],
                phone=superadmin_user["phone"],
                team=superadmin_user["team"],
                team_role=superadmin_user["team_role"],
                squad_memberships=superadmin_user["squad_memberships"],
                is_volunteer=superadmin_user["is_volunteer"],
                status=superadmin_user["status"],
            )
            db.add(user)
            print(f"[Init DB] Seeded sole SuperAdmin: {superadmin_user['name']} ({superadmin_user['roll_no']})")

        db.commit()
        print("[Init DB] Database initialized cleanly with sole System SuperAdmin!")
    except Exception as e:
        db.rollback()
        print(f"[Init DB Error] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
