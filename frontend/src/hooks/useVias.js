import { useState, useEffect, useMemo } from 'react';
import { viasService } from '../services/api';

export const useVias = () => {
    const [vias, setVias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODAS'); // TODAS, CERRADA, PARCIAL, HABILITADA
    const [filterProvincia, setFilterProvincia] = useState('TODAS');

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await viasService.getAll();
            setVias(data);
        } catch (err) {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Lógica de Filtrado y Ordenamiento
    const filteredVias = useMemo(() => {
        let resultado = vias;

        // 1. Filtrar por Buscador (Texto)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            resultado = resultado.filter(via =>
                via.provincia.toLowerCase().includes(term) ||
                via.nombre_via.toLowerCase().includes(term) ||
                via.observaciones.toLowerCase().includes(term)
            );
        }

        // 2. Filtrar por Estado (Dropdown)
        if (filterEstado !== 'TODAS') {
            resultado = resultado.filter(via => via.estado_codigo === filterEstado);
        }

        // 3. Filtrar por Provincia (Dropdown)
        if (filterProvincia !== 'TODAS') {
            resultado = resultado.filter(via => via.provincia === filterProvincia);
        }

        // 4. Ordenar por fecha (Las más recientes primero)
        // Asumimos formato YYYY-MM-DD HH:MM:SS
        resultado.sort((a, b) => new Date(b.fecha_actualizacion) - new Date(a.fecha_actualizacion));

        return resultado;
    }, [vias, searchTerm, filterEstado, filterProvincia]);

    // Extraer lista única de provincias para el dropdown
    const provinciasDisponibles = useMemo(() => {
        const provincias = vias.map(v => v.provincia);
        return [...new Set(provincias)].sort(); // Elimina duplicados y ordena A-Z
    }, [vias]);

    // Contadores para estadísticas
    const stats = useMemo(() => ({
        total: vias.length,
        cerradas: vias.filter(v => v.estado_codigo === 'CERRADA').length,
        parciales: vias.filter(v => v.estado_codigo === 'PARCIAL').length,
        habilitadas: vias.filter(v => v.estado_codigo === 'HABILITADA').length
    }), [vias]);

    return {
        vias: filteredVias,
        stats,
        provinciasDisponibles,
        loading,
        error,
        filters: {
            searchTerm, setSearchTerm,
            filterEstado, setFilterEstado,
            filterProvincia, setFilterProvincia
        },
        refresh: loadData
    };
};