import os

class Settings:
    PROJECT_NAME: str = "GeoHub API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "geohub-super-secret-production-key-2026-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Allowed College Domain
    ALLOWED_EMAIL_DOMAIN: str = "@college.edu"

    # Database Configuration (MySQL / SQLite)
    # Format: mysql+pymysql://<user>:<password>@localhost:3306/<database_name>
    # Default for XAMPP: mysql+pymysql://root:@localhost:3306/geohub
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:@localhost:3306/geohub"
    )

    # Local Uploads Directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

settings = Settings()
