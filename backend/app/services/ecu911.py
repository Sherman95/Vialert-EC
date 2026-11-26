import logging
import re
from pathlib import Path

import requests

from app.core.config import settings


logger = logging.getLogger(__name__)
ECU911_CA_BUNDLE = Path(__file__).resolve().parents[2] / "certs" / "SectigoPublicServerAuthenticationCADVR36.pem"


class ECU911ServiceError(RuntimeError):
    """Raised when the official road source cannot provide a valid response."""


class ECU911Service:
    request_headers = {
        "User-Agent": "Vialert-EC/2.0 (+https://vialert-ec.vercel.app)",
        "Accept": "application/json",
        "Accept-Language": "es-EC,es;q=0.9",
    }

    def limpiar_texto(self, texto, fallback="N/A"):
        if texto is None or texto == "":
            return fallback
        return re.sub(r"\s+", " ", str(texto)).strip()

    def detectar_estado(self, estado, observaciones=""):
        contexto = f"{estado} {observaciones}".upper()
        if "CERRADA" in contexto:
            return "CERRADA"
        if any(term in contexto for term in ("PARCIAL", "RESTRIC", "PASO CONTROLADO", "50%")):
            return "PARCIAL"
        return "HABILITADA"

    def extraer_via_alterna(self, obs, alterna_api):
        if alterna_api and len(alterna_api) > 4 and alterna_api != "N/A":
            return self.limpiar_texto(alterna_api)

        if not obs or len(obs) < 5:
            return "N/A"

        obs_upper = obs.upper()
        for keyword in ("VIA ALTERNA", "RUTA ALTERNA", "DESVIO", "TOMAR LA VIA"):
            if keyword not in obs_upper:
                continue
            start = obs_upper.find(keyword) + len(keyword)
            remainder = re.sub(r"^[:/\-.\s]+", "", obs_upper[start:])
            candidate = re.split(r"\.", remainder)[0].strip()
            if len(candidate) > 4:
                return self.limpiar_texto(candidate)
        return "N/A"

    def _request_official_data(self):
        try:
            response = requests.get(
                settings.ECU911_URL,
                headers=self.request_headers,
                timeout=(10, 60),
                verify=str(ECU911_CA_BUNDLE),
            )
            response.raise_for_status()
        except requests.Timeout as error:
            raise ECU911ServiceError("ECU 911 excedió el tiempo máximo de respuesta") from error
        except requests.RequestException as error:
            raise ECU911ServiceError(f"No fue posible consultar ECU 911: {error}") from error

        try:
            payload = response.json()
        except requests.exceptions.JSONDecodeError as error:
            raise ECU911ServiceError("ECU 911 devolvió una respuesta que no es JSON") from error

        if not isinstance(payload, dict) or not isinstance(payload.get("data"), list):
            raise ECU911ServiceError("ECU 911 devolvió una estructura de datos inesperada")
        return payload["data"]

    def fetch_vias(self):
        raw_data = self._request_official_data()
        processed_roads = []

        for item in raw_data:
            if not isinstance(item, dict):
                logger.warning("ECU 911 devolvió un registro no procesable")
                continue

            observations = self.limpiar_texto(item.get("observaciones"))
            province = self.limpiar_texto(item.get("Provincia", {}).get("descripcion"), "DESCONOCIDO")
            canton = self.limpiar_texto(item.get("Canton", {}).get("descripcion"), "DESCONOCIDO")
            road_name = self.limpiar_texto(item.get("descripcion"), "Vía sin nombre")
            status = self.limpiar_texto(item.get("EstadoActual", {}).get("nombre"), "DESCONOCIDO")

            alternate = "N/A"
            alternate_details = item.get("DetalleViaAlterna")
            if isinstance(alternate_details, list) and alternate_details:
                alternate = alternate_details[0].get("Via", {}).get("descripcion", "N/A")

            processed_roads.append({
                "id": str(item.get("id") or f"{province}-{road_name}".lower().replace(" ", "-")),
                "provincia": province,
                "canton": canton,
                "nombre_via": road_name,
                "estado_texto": status,
                "estado_codigo": self.detectar_estado(status, observations),
                "observaciones": observations,
                "via_alterna": self.extraer_via_alterna(observations, alternate),
                "fecha_actualizacion": self.limpiar_texto(
                    item.get("modified") or item.get("created"),
                    "Sin fecha",
                ),
                "fuente": "ECU911_API",
            })

        logger.info("ECU 911: %s registros procesados", len(processed_roads))
        return {"cantidad": len(processed_roads), "datos": processed_roads}
