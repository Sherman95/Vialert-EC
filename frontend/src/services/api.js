import axios from 'axios';

// Configuración centralizada de Axios
const apiClient = axios.create({
    baseURL: 'http://localhost:8000', // Tu backend Python
    timeout: 15000, // Esperar máximo 15 segundos
    headers: {
        'Content-Type': 'application/json',
    },
});

export const viasService = {
    // Obtener todas las vías
    getAll: async () => {
        try {
            const response = await apiClient.get('/vias');
            return response.data.datos;
        } catch (error) {
            console.error("Error en servicio de vías:", error);
            throw error; // Lanzamos el error para que lo maneje el Hook
        }
    },
};