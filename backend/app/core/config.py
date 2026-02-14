from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vialert-EC API"
    VERSION: str = "2.0.0"
    ECU911_URL: str = "https://ecu911.gob.ec/Services/WSVias/ViasWeb.php?estado=A&and:%3C%3E:EstadoActual-id=593&order=Provincia-descripcion&limit=600&start=0"

settings = Settings()