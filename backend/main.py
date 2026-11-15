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
    audit_router,
    finance_router,
    app_router,
    admin_router,
    sync_router,
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
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist"))

# Mount assets directory for modern React bundle
assets_dir = os.path.join(STATIC_DIR, "assets")
if not os.path.exists(assets_dir) and os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Mount static downloads directory for Over-The-Air (OTA) APK distribution
STATIC_DOWNLOADS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static_downloads")
os.makedirs(STATIC_DOWNLOADS, exist_ok=True)
app.mount("/downloads", StaticFiles(directory=STATIC_DOWNLOADS), name="downloads")

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
app.include_router(audit_router.router, prefix=settings.API_V1_STR)
app.include_router(finance_router.router, prefix=settings.API_V1_STR)
app.include_router(app_router.router, prefix=settings.API_V1_STR)
app.include_router(admin_router.router, prefix=settings.API_V1_STR)
app.include_router(sync_router.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": "connected"
    }

@app.on_event("startup")
def on_startup():
    from init_db import init_database
    try:
        init_database()
    except Exception as e:
        print(f"[Startup Warning] init_database error: {e}")

@app.get("/geo-hub-logo.png")
def get_logo():
    path = os.path.join(STATIC_DIR, "geo-hub-logo.png")
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse(os.path.join(FRONTEND_DIST, "geo-hub-logo.png"))

@app.get("/app-logo.png")
def get_app_logo():
    path = os.path.join(STATIC_DIR, "app-logo.png")
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse(os.path.join(FRONTEND_DIST, "app-logo.png"))

@app.get("/geo-hub-logo-hd.png")
def get_hd_logo():
    path = os.path.join(STATIC_DIR, "geo-hub-logo-hd.png")
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse(os.path.join(FRONTEND_DIST, "geo-hub-logo-hd.png"))

@app.get("/favicon.svg")
def get_favicon():
    path = os.path.join(STATIC_DIR, "favicon.svg")
    if os.path.exists(path):
        return FileResponse(path)
    return FileResponse(os.path.join(FRONTEND_DIST, "favicon.svg"))

@app.get("/")
def serve_frontend():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if not os.path.exists(index_file) and os.path.exists(FRONTEND_DIST):
        index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs_url": "/docs",
    }

@app.get("/{full_path:path}")
def serve_spa_fallback(full_path: str):
    """
    SPA catch-all route: serves index.html for React client-side routing on any device,
    avoiding 404 errors when reloading pages or navigating directly to subroutes.
    """
    # Exclude API endpoints and static mounted directories
    if (
        full_path.startswith("api")
        or full_path.startswith("static")
        or full_path.startswith("downloads")
        or full_path.startswith("uploads")
        or full_path.startswith("docs")
        or full_path.startswith("redoc")
        or full_path == "openapi.json"
        or "." in full_path.split("/")[-1]
    ):
        raise HTTPException(status_code=404, detail="Resource not found.")

    index_file = os.path.join(STATIC_DIR, "index.html")
    if not os.path.exists(index_file) and os.path.exists(FRONTEND_DIST):
        index_file = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(status_code=404, detail="SPA index.html not found.")
