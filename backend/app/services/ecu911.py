import requests
import re
import urllib3
import json
from app.core.config import settings

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ECU911Service:
    def limpiar_texto(self, texto):
        if not texto: return "N/A"
        return re.sub(r'\s+', ' ', str(texto)).strip()

    def detectar_estado(self, texto):
        t = str(texto).upper()
        if "CERRADA" in t: return "CERRADA"
        if "PARCIAL" in t: return "PARCIAL"
        return "HABILITADA"

    def extraer_via_alterna(self, obs, alterna_api):
        if alterna_api and len(alterna_api) > 4 and alterna_api != "N/A":
            return alterna_api
        
        if not obs or len(obs) < 5: return "N/A"
        
        obs_upper = obs.upper()
        keywords = ["VIA ALTERNA", "RUTA ALTERNA", "DESVIO", "TOMAR LA VIA"]
        
        for kw in keywords:
            if kw in obs_upper:
                start = obs_upper.find(kw) + len(kw)
                resto = obs_upper[start:]
                resto = re.sub(r'^[:\/\-\.\s]+', '', resto)
                candidato = re.split(r'\.', resto)[0].strip()
                if len(candidato) > 4: return self.limpiar_texto(candidato)
        return "N/A"

    def fetch_vias(self):
        # HEADERS COMPLETOS DE CHROME (Importante para evitar bloqueo)
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/html, application/xhtml+xml, application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
        }

        try:
            print(f"--- [DEBUG] Iniciando petición a ECU911: {settings.ECU911_URL} ---")
            
            response = requests.get(
                settings.ECU911_URL, 
                headers=headers, 
                verify=False, 
                timeout=15
            )
            
            print(f"--- [DEBUG] ECU911 Status Code: {response.status_code} ---")

            if response.status_code != 200:
                print(f"--- [ERROR] La API devolvió estado {response.status_code} ---")
                return {"cantidad": 0, "datos": [], "error": f"Error HTTP {response.status_code}"}

            try:
                # AQUÍ ESTÁ EL BLINDAJE
                raw_data = response.json().get("data", [])
            except json.JSONDecodeError:
                print("--- [ERROR CRÍTICO] La respuesta NO es un JSON válido ---")
                print(f"Contenido recibido (primeros 200 chars): {response.text[:200]}")
                return {"cantidad": 0, "datos": [], "error": "API bloqueada o respuesta inválida"}

            vias_procesadas = []
            for item in raw_data:
                obs = self.limpiar_texto(item.get("observaciones"))
                prov = self.limpiar_texto(item.get("Provincia", {}).get("descripcion", "DESCONOCIDO"))
                canton = self.limpiar_texto(item.get("Canton", {}).get("descripcion", "DESCONOCIDO"))
                nom = self.limpiar_texto(item.get("descripcion"))
                est = self.limpiar_texto(item.get("EstadoActual", {}).get("nombre", "DESCONOCIDO"))
                
                alt_api = "N/A"
                if item.get("DetalleViaAlterna"):
                    detalles = item["DetalleViaAlterna"]
                    if isinstance(detalles, list) and len(detalles) > 0:
                         alt_api = detalles[0].get("Via", {}).get("descripcion", "N/A")

                vias_procesadas.append({
                    "id": f"{prov}-{nom}".lower().replace(" ", "-"),
                    "provincia": prov,
                    "canton": canton,
                    "nombre_via": nom,
                    "estado_texto": est,
                    "estado_codigo": self.detectar_estado(est),
                    "observaciones": obs,
                    "via_alterna": self.extraer_via_alterna(obs, alt_api),
                    "fecha_actualizacion": item.get("modified", "Sin fecha"),
                    "fuente": "ECU911_API"
                })
            
            print(f"--- [EXITO] Datos procesados: {len(vias_procesadas)} ---")
            return {"cantidad": len(vias_procesadas), "datos": vias_procesadas}

        except Exception as e:
            print(f"--- [ERROR GENERAL] {str(e)} ---")
            return {"cantidad": 0, "datos": [], "error": str(e)}