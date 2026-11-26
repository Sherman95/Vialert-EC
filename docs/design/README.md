# Identidad visual de Vialert-EC

Los ocho masters aprobados permanecen sin modificaciones en `img/`. Esta carpeta conserva copias de referencia del tablero de marca y del encabezado; los recursos que consume la aplicación se generan en `frontend/public/`.

## Paleta

- Azul primario: `#0D47A1`
- Azul de apoyo: `#1976D2`
- Azul noche: `#062044`
- Rojo de alerta: `#E53935`
- Verde operativo: `#2E7D32`
- Amarillo preventivo: `#FFC107`

La tipografía de interfaz es Poppins en pesos 400, 600 y 700, alojada localmente como WOFF2.

## Recursos generados

- `frontend/public/brand/`: logotipo horizontal, isotipo y aplicaciones monocromáticas.
- `frontend/public/icons/`: favicon, Apple Touch Icon, iconos PWA de 48 a 512 px e iconos maskable con zona segura.
- `frontend/public/splash/`: composiciones mobile y desktop convertidas a WebP real.
- `frontend/public/images/og-image.png`: tarjeta social de 1200 × 630 px.
- `frontend/public/manifest.webmanifest` y `frontend/public/sw.js`: instalación y shell offline.

Para regenerar los binarios después de actualizar un master:

```powershell
python scripts/generate_brand_assets.py
```

El script solo lee `img/` y sobrescribe recursos derivados.
