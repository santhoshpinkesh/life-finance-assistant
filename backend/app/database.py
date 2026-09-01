import os
import warnings
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./life_finance.db")

if DATABASE_URL.startswith("sqlite"):
    if os.getenv("ENVIRONMENT") == "production":
        warnings.warn(
            "WARNING: Using SQLite in production on Render will lose all data on redeploy. "
            "Set DATABASE_URL to a Postgres connection string.",
            RuntimeWarning
        )
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://")

    connect_args = {"sslmode": os.getenv("DB_SSLMODE", "require")}
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_recycle=3600,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
