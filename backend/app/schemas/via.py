from pydantic import BaseModel
from typing import List, Optional


class ViaBase(BaseModel):
    id: str
    provincia: str
    canton: Optional[str]
    nombre_via: str
    estado_texto: str
    estado_codigo: str
    observaciones: str
    via_alterna: str
    fecha_actualizacion: str
    fuente: str

class ViaList(BaseModel):
    cantidad: int
    datos: List[ViaBase]

class ReporteComunidad(BaseModel):
    usuario: str = "Conductor Anónimo"
    mensaje: str
    tipo_novedad: str  # Ejemplo: "Derrumbe", "Neblina", "Accidente"

class ReporteResponse(ReporteComunidad):
    fecha: str