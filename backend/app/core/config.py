from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vialert-EC API"
    VERSION: str = "2.0.0"
    ECU911_URL: str = "https://ecu911.gob.ec/Services/WSVias/ViasWeb.php?estado=A&and:%3C%3E:EstadoActual-id=593&order=Provincia-descripcion&limit=600&start=0"

    @field_validator("ECU911_URL")
    @classmethod
    def validate_ecu911_url(cls, value: str) -> str:
        if "/Services/WSVias/ViasWeb.php" not in value:
            raise ValueError("ECU911_URL debe apuntar al endpoint completo de ViasWeb.php")
        return value

settings = Settings()
