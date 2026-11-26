# Auditoría técnica final de Vialert-EC

Auditoría ejecutada entre el 24 y 25 de noviembre de 2026 sobre `main`, partiendo del commit `7ef532a`. No se realizó commit, push ni despliegue.

## Resultado ejecutivo

El frontend está visual y funcionalmente preparado para revisión final. El despliegue debe permanecer detenido hasta completar dos acciones externas:

1. Rotar la credencial de base de datos que estuvo versionada en `backend/.env` y eliminarla también del historial de Git.
2. Confirmar en Render que `ECU911_URL` contiene el endpoint completo de `ViasWeb.php`; la variable remota no fue modificada durante esta auditoría.

Después de esas acciones, el código corregido puede desplegarse. El endpoint de producción actual seguirá devolviendo una lista vacía hasta que se despliegue el backend corregido y su configuración sea válida.

## Pruebas ejecutadas

- Chrome/Playwright en siete resoluciones y escenarios de mapa, splash lento, error, offline, orientación y tiles.
- Manifest e instalabilidad mediante Chrome DevTools Protocol.
- Una auditoría Lighthouse móvil real.
- Inspección de formatos, dimensiones, transparencia, hashes y referencias de 26 activos públicos y 8 masters.
- Consulta directa a ECU 911 y transformación local: **53 registros procesados**.
- Simulación de timeout del origen: el backend devuelve ahora `502 ECU911_UNAVAILABLE`.
- Verificación de zona segura maskable circular del 40%.

Resultados estructurados: [`browser-results.json`](./browser-results.json), [`asset-inventory.json`](./asset-inventory.json) y [`lighthouse-mobile.json`](./lighthouse-mobile.json).

## Diagnóstico de `/vias`

La respuesta productiva `200 {"cantidad":0,"datos":[]}` no demostraba funcionamiento correcto. Se encontraron cuatro causas o factores:

1. `ECU911Service` capturaba cualquier excepción y agregaba un campo `error`.
2. `response_model=ViaList` descartaba ese campo por no pertenecer al esquema, ocultando el fallo y conservando HTTP 200.
3. El README recomendaba una URL base incompleta que, si se copiaba a Render, devolvía HTML en lugar del JSON de vías.
4. ECU 911 no entrega su certificado intermedio Sectigo durante el handshake. El código anterior usaba `verify=False`, ocultando el defecto de cadena TLS.

Correcciones:

- El backend valida que `ECU911_URL` apunte a `ViasWeb.php`.
- Requests usa timeout de conexión/lectura de 10/60 segundos.
- Los errores de origen generan HTTP 502 con código explícito.
- La ruta síncrona se ejecuta en el threadpool de FastAPI en vez de bloquear el event loop.
- Se conserva verificación TLS usando el certificado intermedio público documentado en `backend/certs/`.
- La URL completa quedó documentada en `backend/.env.example` y README.

## PWA

- Manifest sin errores reportados por Chrome.
- Service worker controlando la página, estado `activated`.
- Caches detectadas: `vialert-shell-v2` y `vialert-runtime-v2`.
- `start_url`, `scope`, `display: standalone`, colores, favicon y Apple Touch Icon válidos.
- Iconos maskable de 192 y 512 px cumplen el radio seguro del 40%.
- El único error de instalabilidad fue `in-incognito`, una limitación del contexto automatizado.
- La navegación offline recuperó 53 tarjetas y mostró la fecha de la copia local.

La instalación física en Android/iOS y una actualización real entre dos versiones desplegadas no pudieron probarse en este entorno. El service worker usa navegación network-first, assets versionados y elimina caches antiguas en `activate`.

## Datos offline

- Cada snapshot guarda `savedAt`.
- Después de una hora se identifica como copia antigua.
- Después de 24 horas se elimina y deja de utilizarse.
- La interfaz diferencia conexión activa, copia guardada, copia antigua, error y lista vacía.
- Al recuperar conectividad, TanStack Query vuelve a consultar y sustituye la copia por datos oficiales.

## Mapa

- Marcadores, popups, zoom, pestañas y “Ver en mapa” fueron ejercitados.
- La selección Pichincha produjo polígono de resaltado válido.
- `map.stop()`, `Number.isFinite` y `bounds.isValid()` protegen todas las transiciones auditadas.
- `ResizeObserver` reajusta Leaflet al cambiar pestaña y orientación.
- El fallo de OpenStreetMap muestra un control de reintento sin ocultar la lista.
- No existe precaché ni descarga masiva de tiles; se mantiene la atribución de OpenStreetMap.

## Problemas encontrados y estado

| Severidad | Problema | Estado |
|---|---|---|
| Crítica | Credencial real versionada en `backend/.env` | Archivo eliminado e ignorado; rotación e historial pendientes fuera del código. |
| Alta | `/vias` ocultaba errores como lista vacía HTTP 200 | Corregido localmente con respuesta 502 explícita. |
| Alta | TLS de ECU 911 dependía de `verify=False` | Corregido con intermedio Sectigo verificado. |
| Media | Estadísticas recortadas a 320 px | Corregido. |
| Media | Layout desbordado en 844×390 | Corregido. |
| Media | Aviso de tiles desaparecía tras errores | Corregido. |
| Media | Caché sin caducidad máxima | Corregido: advertencia 1 h, límite 24 h. |
| Baja | Objetivos táctiles de 36–40 px | Corregido a 44 px. |
| Baja | Contraste 4,39:1 | Corregido. |
| Baja | Leaflet se montaba en la lista móvil | Corregido con carga diferida. |

## Limitaciones y recomendación

- No hubo acceso a logs ni variables remotas de Render; la causa de configuración debe confirmarse allí.
- No se realizó instalación en dispositivo físico.
- Lighthouse desktop se omitió para reducir ejecuciones; los resultados móviles reales están documentados.
- No se repitió Lighthouse después del code splitting final, por lo que no se inventan puntuaciones mejoradas.

**Recomendación:** aprobación técnica condicionada. Rotar la credencial expuesta, limpiar el historial y verificar la variable remota antes de autorizar commit, push y despliegue.
