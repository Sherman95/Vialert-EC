from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Usamos importación absoluta
from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vialert-ec.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

from app.core.database import engine, Base
from app.api.endpoints import reports

# Crear tablas
Base.metadata.create_all(bind=engine)

app.include_router(api_router)
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
def read_root():
    return {"status": "Vialert-EC Operativo", "version": settings.VERSION}
