import requests
import re
import urllib3
from datetime import datetime
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
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(settings.ECU911_URL, headers=headers, verify=False)
        raw_data = response.json().get("data", [])
        
        vias_procesadas = []
        for item in raw_data:
            obs = self.limpiar_texto(item.get("observaciones"))
            prov = self.limpiar_texto(item.get("Provincia", {}).get("descripcion", "DESCONOCIDO"))
            nom = self.limpiar_texto(item.get("descripcion"))
            est = self.limpiar_texto(item.get("EstadoActual", {}).get("nombre", "DESCONOCIDO"))
            
            # Rescate de vía alterna
            alt_api = "N/A"
            if item.get("DetalleViaAlterna"):
                alt_api = item["DetalleViaAlterna"][0].get("Via", {}).get("descripcion", "N/A")

            vias_procesadas.append({
                "id": f"{prov}-{nom}".lower().replace(" ", "-"),
                "provincia": prov,
                "nombre_via": nom,
                "estado_texto": est,
                "estado_codigo": self.detectar_estado(est),
                "observaciones": obs,
                "via_alterna": self.extraer_via_alterna(obs, alt_api),
                "fecha_actualizacion": item.get("modified", "Sin fecha"),
                "fuente": "ECU911_API"
            })
        return {"cantidad": len(vias_procesadas), "datos": vias_procesadas}