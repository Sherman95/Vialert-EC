from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Usamos importación absoluta
from app.api.routes import router as api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "Vialert-EC Operativo", "version": settings.VERSION}