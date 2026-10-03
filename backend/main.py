import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import engine, Base, SessionLocal
import models
from routers import (
    auth_router,
    teams_router,
    events_router,
    qr_router,
    tasks_router,
    gallery_router,
    dashboard_router,
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="GeoHub FastAPI Backend for Club Orchestration & Smart QR Attendance",
)

# Enable CORS for Flutter mobile/web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse

# Static Web Application Files
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Mount local uploads folder for static image/file access
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(teams_router.router, prefix=settings.API_V1_STR)
app.include_router(events_router.router, prefix=settings.API_V1_STR)
app.include_router(qr_router.router, prefix=settings.API_V1_STR)
app.include_router(tasks_router.router, prefix=settings.API_V1_STR)
app.include_router(gallery_router.router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def seed_default_teams():
    db = SessionLocal()
    try:
        standard_teams = [
            ("Management", "Responsible for club planning, coordination, and administrative operations."),
            ("Promotion", "Responsible for social media outreach, campaigns, posters, and campus engagement."),
            ("Documentation", "Responsible for event photography, videography, report compilation, and archival."),
            ("Entertainment", "Responsible for cultural activities, stage hosting, sound, and audience activities."),
        ]
        for name, desc in standard_teams:
            existing = db.query(models.Team).filter(models.Team.name == name).first()
            if not existing:
                team = models.Team(
                    id=name,
                    name=name,
                    description=desc,
                    admin_user_ids="[]",
                    member_user_ids="[]",
                )
                db.add(team)
        db.commit()
    finally:
        db.close()

@app.get("/")
def serve_frontend():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs_url": "/docs",
    }
