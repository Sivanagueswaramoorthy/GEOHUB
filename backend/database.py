import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

def create_db_engine():
    # If MySQL / TiDB Cloud URL is specified
    if settings.DATABASE_URL.startswith("mysql"):
        try:
            connect_args = {}
            # Apply SSL CA if connecting to remote TiDB Cloud gateway
            if "tidbcloud.com" in settings.DATABASE_URL or settings.SSL_CA:
                connect_args["ssl"] = {"ca": settings.SSL_CA}
                connect_args["connect_timeout"] = 10

            eng = create_engine(
                settings.DATABASE_URL,
                connect_args=connect_args,
                pool_size=10,
                max_overflow=20,
                pool_recycle=300,
                pool_pre_ping=True
            )
            # Test connection
            with eng.connect():
                pass
            print(f"[Database] Successfully connected to TiDB Cloud / MySQL: {settings.DATABASE_URL.split('@')[-1]}")
            return eng
        except Exception as e:
            print(f"[Database Notice] TiDB Cloud / MySQL connection attempted ({e}).")
            print("[Database Notice] Activating resilient local database engine (geohub.db).")

    # Fallback to local SQLite engine
    return create_engine(
        "sqlite:///./geohub.db",
        connect_args={"check_same_thread": False}
    )

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
