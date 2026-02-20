from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# --- DATABASE CONFIGURATION ---
# We use SQLite because it is a file-based database. No separate server is needed.
# This makes it perfect for local development and portable for interviews.
SQLALCHEMY_DATABASE_URL = "sqlite:///./hr_data.db"

# engine: The connection point to the DB
# check_same_thread=False: Needed only for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal: Each request will get its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base: All our models will inherit from this class
Base = declarative_base()

# Dependency: Get a DB session for use in API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
