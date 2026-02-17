# 🚦 Vialert-EC

![Vialert Banner](https://img.shields.io/badge/Vialert-ECUADOR-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

**Vialert-EC** es un monitor de estado vial en tiempo real diseñado específicamente para Ecuador. Combina datos oficiales del ECU911 con reportes ciudadanos para proporcionar información vital sobre carreteras, tráfico y rutas alternas.

Este proyecto sigue una arquitectura moderna de **Monorepo**, optimizada para escalabilidad y despliegue rápido.

---

## ✨ Características Principales

### 🖥️ UI/UX Moderna & Responsive
*   **Split View (Escritorio):** Diseño profesional con listado lateral y mapa interactivo fijo.
*   **Mobile First:** Navegación optimizada con pestañas (Lista/Mapa) y encabezados fijos.
*   **Modo Compacto:** Tarjetas de información optimizadas para mostrar más datos en menos espacio.

### 🗺️ Mapa Interactivo Avanzado
*   **Georeferenciación Inteligente:** Visualización de alertas oficiales (incluso sin coordenadas exactas) basada en cantones.
*   **Highlight por Provincia:** Zoom automático y resaltado de perímetro al filtrar por provincia (GeoJSON).
*   **Marcadores Dinámicos:** Colores distintivos según la gravedad del incidente (🔴 Cerrada, 🟠 Parcial, 🟢 Habilitada, 🟣 Reporte Ciudadano).

### ⚡ Rendimiento y Datos
*   **Tiempo Real:** Actualizaciones automáticas con **TanStack Query** (Polling inteligente).
*   **Filtrado Instantáneo:** Búsqueda por texto, estado y provincia sin recargas.
*   **Rutas Alternas:** Detección automática de rutas sugeridas en el texto del reporte.

---

## 🏗️ Stack Tecnológico

### 📂 `frontend/` (Vite + React)
*   **Core:** React 18, Vite.
*   **Estado & Data:** `@tanstack/react-query` (Gestión de estado servidor y caché).
*   **Mapas:** `react-leaflet`, `leaflet`, `leaflet-color-markers`.
*   **Estilos:** `tailwindcss`, `lucide-react` (iconos).
*   **UI:** Componentes modulares, Glassmorphism, animaciones CSS.

### 📂 `backend/` (FastAPI)
*   **API:** FastAPI (Python 3.10+).
*   **Servidor:** Uvicorn (Dev), Gunicorn (Prod).
*   **Datos:** Pydantic (Validación), SQLAlchemy (ORM).
*   **Integración:** Requests (ECU911 Proxy), GeoJSON processing.

---

## 🚀 Guía de Instalación Local

Sigue estos pasos para levantar el proyecto en tu máquina.

### Prerrequisitos
*   Node.js (v18+)
*   Python (v3.10+)
*   Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/Sherman95/Vialert-EC.git
cd Vialert-EC
```

### 2. Configurar el Backend
```bash
cd backend
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
.\venv\Scripts\activate
# Activar (Mac/Linux)
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Correr servidor (Dev)
python -m uvicorn app.main:app --reload
```
*Backend corre en: `http://localhost:8000`*

### 3. Configurar el Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend corre en: `http://localhost:5173`*

---

## ☁️ Despliegue (Producción)

### Backend (Render/Railway)
El proyecto está configurado para **Render**:
1.  Archivo `Procfile` incluido para Gunicorn.
2.  Archivo `runtime.txt` para versión de Python.
3.  Variables de Entorno requeridas:
    *   `DATABASE_URL`: String de conexión a PostgreSQL (ej: Neon.tech).
    *   `ECU911_URL`: `https://www.ecu911.gob.ec`

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar Vialert-EC, por favor abre un *issue* o envía un *pull request*.

---

Made with ❤️ for Ecuador 🇪🇨
