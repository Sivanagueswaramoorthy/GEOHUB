from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

def create_db_engine():
    # If MySQL URL is specified, try connecting to MySQL
    if settings.DATABASE_URL.startswith("mysql"):
        try:
            eng = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=3600
            )
            # Test connection
            with eng.connect():
                pass
            print(f"Connected successfully to MySQL Database: {settings.DATABASE_URL.split('@')[-1]}")
            return eng
        except Exception as e:
            print(f"Notice: MySQL connection failed ({e}). Defaulting to local SQLite (geohub.db).")

    # Fallback to SQLite
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
