from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"

# For SQLite, check_same_thread must be False when using the same connection in multiple threads
engine = create_engine(
	SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
	"""FastAPI dependency that yields a database session."""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()


