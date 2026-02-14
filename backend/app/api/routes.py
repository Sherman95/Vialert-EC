# app/api/routes.py
from fastapi import APIRouter
from app.schemas.via import ViaList, ReporteComunidad
from app.services.ecu911 import ECU911Service
from app.services.reportes import reportes_service # Importamos el nuevo servicio

router = APIRouter()
ecu_service = ECU911Service()

@router.get("/vias", response_model=ViaList)
async def get_vias():
    return ecu_service.fetch_vias()

# --- NUEVAS RUTAS TIPO WAZE ---

@router.post("/vias/{via_id}/reportar")
async def post_reporte(via_id: str, reporte: ReporteComunidad):
    return reportes_service.guardar_reporte(via_id, reporte)

@router.get("/vias/{via_id}/reportes")
async def get_reportes(via_id: str):
    return reportes_service.obtener_reportes(via_id)