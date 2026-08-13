from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file ka naam aur path
SQLALCHEMY_DATABASE_URL = "sqlite:///./cryptotrendx.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency: Har request ke liye naya DB session create aur close karega
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()