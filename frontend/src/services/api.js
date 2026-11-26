import axios from 'axios';

const ECU911_API_URL = 'https://ecu911.gob.ec/Services/WSVias/ViasWeb.php?estado=A&and:%3C%3E:EstadoActual-id=593&order=Provincia-descripcion&limit=600&start=0';
const ROAD_CACHE_KEY = 'vialert:official-roads:v1';
const ROAD_CACHE_WARNING_AGE_MS = 60 * 60 * 1000;
const ROAD_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// Render conserva los reportes ciudadanos. Los datos oficiales se consultan
// directamente porque ECU911 habilita CORS y así evitamos el cold start.
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

const cleanText = (value, fallback = 'Sin información') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value).replace(/\s+/g, ' ').trim();
};

const deriveStatus = (status, observations) => {
    const context = `${status || ''} ${observations || ''}`.toUpperCase();

    if (context.includes('CERRADA')) return 'CERRADA';
    if (
        context.includes('PARCIAL') ||
        context.includes('RESTRIC') ||
        context.includes('PASO CONTROLADO') ||
        context.includes('50%')
    ) return 'PARCIAL';

    return 'HABILITADA';
};

const getAlternateRoute = (item, observations) => {
    const alternate = item?.DetalleViaAlterna?.[0]?.Via?.descripcion;
    if (alternate) return cleanText(alternate);

    const match = observations?.match(/V[IÍ]A ALTERNA\s*[:/-]?\s*(.+?)(?:\.|$)/i);
    return match?.[1] ? cleanText(match[1]) : 'N/A';
};

const normalizeOfficialRoad = (item) => {
    const observations = cleanText(item?.observaciones);
    const statusText = cleanText(item?.EstadoActual?.nombre, 'Estado no especificado');

    return {
        id: item?.id || `${item?.provincia_id}-${item?.canton_id}-${item?.descripcion}`,
        provincia: cleanText(item?.Provincia?.descripcion, 'SIN PROVINCIA'),
        canton: cleanText(item?.Canton?.descripcion, 'SIN CANTÓN'),
        nombre_via: cleanText(item?.descripcion, 'Vía sin nombre'),
        estado_texto: statusText,
        estado_codigo: deriveStatus(statusText, observations),
        observaciones: observations,
        via_alterna: getAlternateRoute(item, observations),
        fecha_actualizacion: item?.modified || item?.created || null,
        fuente: 'ECU911_API',
    };
};

const fetchOfficialRoadsDirectly = async () => {
    const response = await axios.get(ECU911_API_URL, {
        timeout: 30000,
        headers: { Accept: 'application/json' },
    });
    const records = Array.isArray(response.data?.data) ? response.data.data : [];
    return records.map(normalizeOfficialRoad);
};

const saveRoadSnapshot = (roads) => {
    try {
        localStorage.setItem(ROAD_CACHE_KEY, JSON.stringify({
            savedAt: new Date().toISOString(),
            roads,
        }));
    } catch (error) {
        console.warn('No se pudo guardar la copia local de las vías.', error);
    }
};

const readRoadSnapshot = () => {
    try {
        const snapshot = JSON.parse(localStorage.getItem(ROAD_CACHE_KEY));
        if (!Array.isArray(snapshot?.roads) || snapshot.roads.length === 0) return null;
        const savedAt = new Date(snapshot.savedAt).getTime();
        const ageMs = Date.now() - savedAt;
        if (!Number.isFinite(savedAt) || ageMs < 0 || ageMs > ROAD_CACHE_MAX_AGE_MS) {
            localStorage.removeItem(ROAD_CACHE_KEY);
            return null;
        }
        return {
            ...snapshot,
            ageMs,
            isStale: ageMs > ROAD_CACHE_WARNING_AGE_MS,
        };
    } catch {
        return null;
    }
};

const onlineResult = (roads) => {
    saveRoadSnapshot(roads);
    return { roads, isCached: false, isStale: false, cachedAt: null };
};

export const viasService = {
    getAll: async () => {
        try {
            const roads = await fetchOfficialRoadsDirectly();
            if (roads.length > 0) return onlineResult(roads);
            throw new Error('ECU911 devolvió una lista vacía');
        } catch (directError) {
            console.warn('Consulta directa a ECU911 no disponible; usando backend.', directError);
            try {
                const response = await apiClient.get('/vias');
                const roads = Array.isArray(response.data?.datos) ? response.data.datos : [];
                if (roads.length > 0) return onlineResult(roads);
                throw new Error('El servidor devolvió una lista vacía');
            } catch (backendError) {
                const snapshot = readRoadSnapshot();
                if (snapshot) {
                    return {
                        roads: snapshot.roads,
                        isCached: true,
                        isStale: snapshot.isStale,
                        cachedAt: snapshot.savedAt,
                    };
                }
                throw backendError;
            }
        }
    },
};

export const reportsService = {
    getAll: async () => {
        try {
            const response = await apiClient.get('/api/reports');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo reportes ciudadanos:', error);
            return [];
        }
    },
    create: async (reportData) => {
        const response = await apiClient.post('/api/reports', reportData);
        return response.data;
    },
};
