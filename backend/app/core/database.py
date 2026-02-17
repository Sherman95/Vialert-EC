import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Prioridad: Variable de entorno (Nube) -> SQLite local (Desarrollo)
# Prioridad: Variable de entorno (Nube) -> SQLite local (Desarrollo)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vialert.db")

# Fix para Heroku/Railway/Render que a veces usan postgres:// y SQLAlchemy pide postgresql://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True,  # Verifica la conexión antes de usarla (evita SSL closed)
    pool_recycle=300     # Recicla conexiones cada 5 minutos
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
