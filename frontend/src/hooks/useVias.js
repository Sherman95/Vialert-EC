import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { viasService, reportsService } from '../services/api';

export const useVias = () => {
    // Estados para los filtros (UI State) se mantienen locales
    const [filters, setFilters] = useState({
        searchTerm: '',
        filterEstado: 'TODAS',
        filterProvincia: 'TODAS'
    });

    // React Query para cargar datos (Server State)
    const { data: rawVias = [], isLoading, error, refetch } = useQuery({
        queryKey: ['vias'],
        queryFn: async () => {
            // Cargar datos oficiales y de usuarios en paralelo
            const [viasData, reportsData] = await Promise.all([
                viasService.getAll(),
                reportsService.getAll()
            ]);

            // Normalizar reportes de usuarios
            const normalizedReports = reportsData.map(r => ({
                id: `user-${r.id}`,
                provincia: r.provincia,
                nombre_via: r.titulo,
                estado_texto: r.tipo_incidente,
                estado_codigo: 'REPORTE',
                observaciones: r.descripcion,
                fecha_actualizacion: r.timestamp,
                fuente: 'COMUNIDAD',
                coordenadas: { lat: r.latitud, lng: r.longitud },
                isUserReport: true
            }));

            // Combinar y Ordenar por fecha (recientes primero)
            return [...normalizedReports, ...viasData].sort((a, b) =>
                new Date(b.fecha_actualizacion) - new Date(a.fecha_actualizacion)
            );
        },
        refetchInterval: 10000, // Polling: Actualizar cada 10 segundos
        staleTime: 5000, // Data fresca por 5 segundos
    });

    // Lógica de Filtrado (Se mantiene igual, operando sobre 'vias')
    const filteredVias = useMemo(() => {
        let resultado = rawVias;

        // 1. Filtrar por Buscador (Texto)
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            resultado = resultado.filter(via =>
                via.provincia.toLowerCase().includes(term) ||
                via.nombre_via.toLowerCase().includes(term) ||
                (via.observaciones && via.observaciones.toLowerCase().includes(term))
            );
        }

        // 2. Filtrar por Estado (Dropdown)
        if (filters.filterEstado !== 'TODAS') {
            resultado = resultado.filter(via => via.estado_codigo === filters.filterEstado);
        }

        // 3. Filtrar por Provincia (Dropdown)
        if (filters.filterProvincia !== 'TODAS') {
            resultado = resultado.filter(via => via.provincia === filters.filterProvincia);
        }

        return resultado;
    }, [rawVias, filters]);

    // Extraer lista única de provincias desde la data ya combinada
    const uniqueProvincias = useMemo(() => {
        const provincias = rawVias.map(v => v.provincia);
        return [...new Set(provincias)].sort();
    }, [rawVias]);

    // Contadores basados en 'vias' (data completa, no filtrada)
    const stats = useMemo(() => ({
        total: rawVias.length,
        cerradas: rawVias.filter(v => v.estado_codigo === 'CERRADA').length,
        parciales: rawVias.filter(v => v.estado_codigo === 'PARCIAL').length,
        habilitadas: rawVias.filter(v => v.estado_codigo === 'HABILITADA').length,
        reportes: rawVias.filter(v => v.estado_codigo === 'REPORTE').length
    }), [rawVias]);

    return {
        vias: rawVias, // Data cruda (para mapa etc si se necesita todo)
        filteredVias, // Data filtrada (para lista)
        stats,
        uniqueProvincias,
        provinciasDisponibles: uniqueProvincias, // alias legacy
        isLoading,
        loading: isLoading, // alias legacy
        error: error ? 'Error conectando al servidor' : null,
        filters,
        setFilters,
        refresh: refetch
    };
};