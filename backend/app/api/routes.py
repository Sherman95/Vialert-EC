# app/api/routes.py
from fastapi import APIRouter, HTTPException
from app.schemas.via import ViaList, ReporteComunidad
from app.services.ecu911 import ECU911Service, ECU911ServiceError
from app.services.reportes import reportes_service # Importamos el nuevo servicio

router = APIRouter()
ecu_service = ECU911Service()

@router.get("/vias", response_model=ViaList)
def get_vias():
    try:
        return ecu_service.fetch_vias()
    except ECU911ServiceError as error:
        raise HTTPException(
            status_code=502,
            detail={
                "code": "ECU911_UNAVAILABLE",
                "message": str(error),
            },
        ) from error

# --- NUEVAS RUTAS TIPO WAZE ---

@router.post("/vias/{via_id}/reportar")
async def post_reporte(via_id: str, reporte: ReporteComunidad):
    return reportes_service.guardar_reporte(via_id, reporte)

@router.get("/vias/{via_id}/reportes")
async def get_reportes(via_id: str):
    return reportes_service.obtener_reportes(via_id)
