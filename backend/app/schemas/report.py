from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportBase(BaseModel):
    titulo: str
    descripcion: str
    latitud: float
    longitud: float
    provincia: str
    tipo_incidente: str

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    timestamp: datetime
    estado_verificacion: str

    class Config:
        from_attributes = True
