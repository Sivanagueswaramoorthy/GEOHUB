import json
from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
import models
import auth

def init_database():
    print("[Init DB] Creating all relational database tables...")
    Base.metadata.create_all(bind=engine)
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

        # 3. Seed Sample Events
        now = datetime.utcnow()
        sample_events = [
            {
                "id": "ev_01",
                "title": "GEO FEST 2026: Campus Odyssey",
                "type": "Cultural & Academic",
                "date_time": now + timedelta(days=2),
                "venue": "University Grand Auditorium & North Grounds",
                "description": "Annual institutional GIS exposition and geomatics hackathon.",
                "budget": 450000.0,
                "status": "live",
                "created_by": "u_admin_02",
                "attendance_count": 16,
            },
            {
                "id": "ev_02",
                "title": "GIS & Satellite Telemetry Workshop",
                "type": "Technical Workshop",
                "date_time": now + timedelta(days=5),
                "venue": "Geomatics High-Performance Computer Lab 4B",
                "description": "Hands-on spatial analysis using QGIS, GDAL, and real-time Landsat telemetry.",
                "budget": 25000.0,
                "status": "approved",
                "created_by": "u_admin_02",
                "attendance_count": 6,
            },
            {
                "id": "ev_03",
                "title": "Campus Biodiversity Drone Survey",
                "type": "Field Expedition",
                "date_time": now + timedelta(days=9),
                "venue": "South Botanical Gardens & Drone Flight Deck",
                "description": "LiDAR point cloud acquisition and multispectral vegetation indexing.",
                "budget": 15000.0,
                "status": "approved",
                "created_by": "u_admin_02",
                "attendance_count": 6,
            },
            {
                "id": "ev_04",
                "title": "Territory Orienteering & Navigation Sprint",
                "type": "Sports & Adventure",
                "date_time": now + timedelta(days=16),
                "venue": "Pine Ridge Nature Reserve",
                "description": "Topographic map navigation, compass bearings, and geocaching competition.",
                "budget": 12000.0,
                "status": "draft",
                "created_by": "u_admin_02",
                "attendance_count": 0,
            },
        ]

        for ev in sample_events:
            existing_ev = db.query(models.Event).filter(models.Event.id == ev["id"]).first()
            if not existing_ev:
                event = models.Event(**ev)
                db.add(event)
                print(f"[Init DB] Seeded event: {ev['title']}")

        # 4. Seed Sample Tasks
        sample_tasks = [
            {
                "id": "task_01",
                "title": "Gate Verification & Scholar Check-in",
                "description": "Coordinate entrance barcode scanning and dynamic QR roster verification.",
                "team_id": "Management",
                "assigned_user_ids": json.dumps(["u_admin_02", "u_student_06"]),
                "deadline": now + timedelta(days=2),
                "status": "in_progress",
                "created_by": "u_admin_02",
            },
            {
                "id": "task_02",
                "title": "Promotion Squad Lead Coordination",
                "description": "Distribute symposium flyers across civil engineering and science departments.",
                "team_id": "Promotion",
                "assigned_user_ids": json.dumps(["u_promo_05"]),
                "deadline": now + timedelta(days=3),
                "status": "todo",
                "created_by": "u_admin_02",
            },
        ]

        for t in sample_tasks:
            existing_t = db.query(models.Task).filter(models.Task.id == t["id"]).first()
            if not existing_t:
                task = models.Task(**t)
                db.add(task)
                print(f"[Init DB] Seeded task: {t['title']}")

        db.commit()
        print("[Init DB] Database successfully initialized and seeded!")
    except Exception as e:
        db.rollback()
        print(f"[Init DB Error] {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

