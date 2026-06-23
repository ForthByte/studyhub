import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


#load environment variables from .env file into is.environ
load_dotenv()

#retrieve the database connection string from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

#create the SQLAlchemy engine instance to manage database connections
engine = create_engine(DATABASE_URL)
#configure a session factory for generating individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#construct a base class for all SQLAlchemy models to inherit from
Base = declarative_base()

def get_db():
    """
    provide a transactional database session context manager.
    used as a FastAPI dependency to ensure sessions are cleanly opened and automatically closed after request finishes.
    :yield: local SQLAlchemy database session instance
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()