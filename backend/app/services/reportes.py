# app/services/reportes.py
from datetime import datetime
from app.schemas.via import ReporteComunidad

class ReportesService:
    def __init__(self):
        # Memoria temporal (en un futuro aquí conectarías una DB como MongoDB o PostgreSQL)
        self._storage = {}

    def guardar_reporte(self, via_id: str, reporte: ReporteComunidad):
        if via_id not in self._storage:
            self._storage[via_id] = []
        
        nuevo_item = {
            "usuario": reporte.usuario,
            "mensaje": reporte.mensaje,
            "tipo_novedad": reporte.tipo_novedad,
            "fecha": datetime.now().strftime("%H:%M")
        }
        self._storage[via_id].insert(0, nuevo_item)  # El más reciente primero
        return nuevo_item

    def obtener_reportes(self, via_id: str):
        return self._storage.get(via_id, [])

# Instancia única para compartir entre rutas
reportes_service = ReportesService()