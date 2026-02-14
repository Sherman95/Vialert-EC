# 🚦 Vialert-EC

![Vialert Banner](https://img.shields.io/badge/Vialert-ECUADOR-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**Vialert-EC** es un monitor de estado vial en tiempo real diseñado específicamente para Ecuador. Utiliza la API pública del ECU911 para proporcionar información actualizada sobre el estado de las carreteras, alertas de tráfico y rutas alternas.

Este proyecto sigue una arquitectura moderna de **Monorepo**, separando claramente el frontend y el backend para una escalabilidad y mantenimiento óptimos.

---

## ✨ Características Principales

*   **Monitor en Tiempo Real:** Consulta directa a la API del ECU911.
*   **Mapa Interactivo:** Visualización de alertas en un mapa usando Leaflet.
*   **Filtrado Inteligente:** Búsqueda por provincia o estado de la vía.
*   **Detección de Rutas Alternas:** Algoritmo propio para extraer rutas alternas de los comentarios del reporte.
*   **Interfaz Moderna:** Diseño responsive y amigable construido con React y Tailwind CSS.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está dividido en dos grandes componentes:

### 📂 `frontend/`
Aplicación web construida con **React (Vite)**.
*   **Librerías clave:** `react-leaflet` (mapas), `lucide-react` (iconos), `axios` (peticiones API), `tailwindcss` (estilos).

### 📂 `backend/`
API RESTful construida con **FastAPI (Python)**.
*   **Funciones:** Proxy reverso para evitar CORS con el ECU911, normalización de datos y limpieza de texto.
*   **Librerías clave:** `fastapi`, `uvicorn`, `requests`, `pydantic`.

---

## 🚀 Guía de Instalación

Sigue estos pasos para levantar el proyecto en tu máquina local.

### Prerrequisitos
*   Node.js (v18 o superior)
*   Python (v3.10 o superior)
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

# Activar entorno (Windows)
.\venv\Scripts\activate
# Activar entorno (Mac/Linux)
# source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Correr el servidor
python -m uvicorn app.main:app --reload
```
*El backend correrá en `http://localhost:8000`*

### 3. Configurar el Frontend

Abre una nueva terminal en la raíz del proyecto:

```bash
cd frontend

# Instalar dependencias
npm install

# Correr el servidor de desarrollo
npm run dev
```
*El frontend correrá en `http://localhost:5173`*

---

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Si tienes ideas para mejorar Vialert-EC, por favor abre un *issue* o envía un *pull request*.

---

Made with ❤️ for Ecuador 🇪🇨
