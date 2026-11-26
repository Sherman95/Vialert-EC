# Inventario de recursos gráficos

Recursos públicos auditados: **26**. Peso total: **2418.8 KiB**.

| Ruta | Formato real | Dimensiones | Peso | Alfa | Uso / referencia |
|---|---:|---:|---:|---:|---|
| `frontend/public/apple-touch-icon.png` | PNG | 180×180 | 32.7 KiB | no | `frontend/index.html` |
| `frontend/public/brand/isotype-color.png` | PNG | 851×1007 | 493.7 KiB | sí | `frontend/public/sw.js`<br>`frontend/src/components/brand/BrandLogo.jsx` |
| `frontend/public/brand/isotype-light.png` | PNG | 851×1007 | 69.4 KiB | sí | `frontend/src/components/brand/BrandLogo.jsx` |
| `frontend/public/brand/logo-compact.png` | PNG | 851×1007 | 493.7 KiB | sí | `frontend/public/sw.js`<br>`frontend/src/components/brand/BrandLogo.jsx` |
| `frontend/public/brand/logo-dark.png` | PNG | 1360×561 | 111.2 KiB | sí | `frontend/src/components/brand/BrandLogo.jsx` |
| `frontend/public/brand/logo-horizontal.png` | PNG | 1360×561 | 359.3 KiB | sí | `frontend/public/sw.js`<br>`frontend/src/components/brand/BrandLogo.jsx` |
| `frontend/public/favicon.ico` | ICO | 16×16, 32×32, 48×48 | 5.4 KiB | no | `frontend/index.html` |
| `frontend/public/icons/apple-touch-icon.png` | PNG | 180×180 | 32.7 KiB | no | `frontend/index.html` |
| `frontend/public/icons/favicon-16.png` | PNG | 16×16 | 0.6 KiB | no | `frontend/index.html` |
| `frontend/public/icons/favicon-32.png` | PNG | 32×32 | 1.7 KiB | no | `frontend/index.html`<br>`frontend/public/sw.js` |
| `frontend/public/icons/favicon-48.png` | PNG | 48×48 | 3.0 KiB | no | No referenciado |
| `frontend/public/icons/favicon.ico` | ICO | 16×16, 32×32, 48×48 | 5.4 KiB | no | `frontend/index.html` |
| `frontend/public/icons/icon-128.png` | PNG | 128×128 | 19.7 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-144.png` | PNG | 144×144 | 23.6 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-152.png` | PNG | 152×152 | 25.8 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-192.png` | PNG | 192×192 | 37.1 KiB | no | `frontend/public/manifest.webmanifest`<br>`frontend/public/sw.js` |
| `frontend/public/icons/icon-384.png` | PNG | 384×384 | 124.5 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-48.png` | PNG | 48×48 | 4.2 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-512.png` | PNG | 512×512 | 215.7 KiB | no | `frontend/public/manifest.webmanifest`<br>`frontend/public/sw.js` |
| `frontend/public/icons/icon-72.png` | PNG | 72×72 | 8.1 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-96.png` | PNG | 96×96 | 12.7 KiB | no | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-maskable-192.png` | PNG | 192×192 | 16.2 KiB | sí | `frontend/public/manifest.webmanifest` |
| `frontend/public/icons/icon-maskable-512.png` | PNG | 512×512 | 77.9 KiB | sí | `frontend/public/manifest.webmanifest` |
| `frontend/public/images/og-image.png` | PNG | 1200×630 | 140.8 KiB | no | `frontend/index.html` |
| `frontend/public/splash/splash-desktop.webp` | WEBP | 1672×941 | 52.3 KiB | no | `frontend/index.html` |
| `frontend/public/splash/splash-mobile.webp` | WEBP | 941×1672 | 51.6 KiB | no | `frontend/index.html` |

## Masters originales

Los hashes permiten comprobar que los ocho archivos de `img/` permanecen identificables sin cargar esos masters en producción.

- `img/favicon-master.png` — PNG, 1254×1254, SHA-256 `7efea96fcfbf3ba20cb2bd88360152c7143b0461267c720f85164f066f08ddae`
- `img/isotype-color.png` — PNG, 1254×1254, SHA-256 `3153d74c7cacbae94d5b7cfeceb1e91a1da8564244c3af1f62f74f41fa1ed9cf`
- `img/logo-horizontal.png` — PNG, 1448×1086, SHA-256 `f0de431d6a43f7fd91ad05dc19f5cfeecb102a50d8f6401a2881d404838cae38`
- `img/pwa-icon-master.png` — PNG, 1254×1254, SHA-256 `b3ca5a4308b03f77c4d96af337f62d2f15ebd3b5bc818c9db7465edc401d3e52`
- `img/splash-desktop.webp` — PNG, 1672×941, SHA-256 `c1d40d4b814b2c0c75e5d3963773fddfb7ba9b3e63d5813b964cdcf0002a18f8`
- `img/splash-mobile.webp` — PNG, 941×1672, SHA-256 `0bea2c67bf5c75151ea05545b517a2a44d92b00ccaf63ac11879e1ca36bf5ee3`
- `img/vialert-brand-board.png` — PNG, 1448×1086, SHA-256 `90379238b13a6991f171c7ac5769a3da2b473b5c0d0970489a30d0731cee8f99`
- `img/web-header-reference.png` — PNG, 1916×821, SHA-256 `ebfd22dbdc01cf84cbbea4c9ca9a2da33f8ad103b095cee260953b87b667a658`

## Zona segura maskable

- `frontend/public/icons/icon-maskable-192.png`: radio esencial 66.05 px; límite seguro 76.8 px; **cumple**.
- `frontend/public/icons/icon-maskable-512.png`: radio esencial 174.83 px; límite seguro 204.8 px; **cumple**.

Los WebP fueron abiertos y reconocidos por Pillow como `WEBP`; los PNG de marca transparentes conservan canal alfa. Ningún archivo de `img/` se referencia desde el bundle del frontend.
