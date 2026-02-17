from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, index=True)
    descripcion = Column(String)
    latitud = Column(Float)
    longitud = Column(Float)
    provincia = Column(String, index=True)
    tipo_incidente = Column(String)  # Derrumbe, Accidente, Cierre, Otro
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    estado_verificacion = Column(String, default="NO_VERIFICADO")
