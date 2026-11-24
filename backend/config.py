import os
import certifi

class Settings:
    PROJECT_NAME: str = "GeoHub API"
    VERSION: str = "1.6.76"
    API_V1_STR: str = "/api"

    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "geohub-super-secret-production-key-2026-change-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Allowed College Domain
    ALLOWED_EMAIL_DOMAIN: str = "@college.edu"

    # TiDB Cloud MySQL Configuration
    TIDB_HOST: str = os.getenv("TIDB_HOST", "gateway01.ap-southeast-1.prod.aws.tidbcloud.com")
    TIDB_PORT: int = int(os.getenv("TIDB_PORT", "3306"))
    TIDB_USER: str = os.getenv("TIDB_USERNAME", os.getenv("TIDB_USER", "2oGb7FpyxpLhZWE.root"))
    TIDB_PASSWORD: str = os.getenv("TIDB_PASSWORD", "pEVtiQBWbs9PAGBB")
    TIDB_DATABASE: str = os.getenv("TIDB_DATABASE", "geohub")

    # SSL CA certificate location (system CA on Render Linux, certifi locally)
    SSL_CA: str = os.getenv(
        "SSL_CA",
        "/etc/ssl/certs/ca-certificates.crt" if os.path.exists("/etc/ssl/certs/ca-certificates.crt") else certifi.where()
    )

    # Database Connection URL
    # Can be set via environment variable on Render, defaults to TiDB Cloud credentials
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"mysql+pymysql://{TIDB_USER}:{TIDB_PASSWORD}@{TIDB_HOST}:{TIDB_PORT}/{TIDB_DATABASE}"
    )

    # Local Uploads Directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")

settings = Settings()
