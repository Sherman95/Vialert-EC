import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { viasService, reportsService } from '../services/api';

const toTimestamp = (value) => {
    const timestamp = new Date(String(value || '').replace(' ', 'T')).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
};

export const useVias = () => {
    const [filters, setFilters] = useState({
        searchTerm: '',
        filterEstado: 'TODAS',
        filterProvincia: 'TODAS',
    });

    const officialQuery = useQuery({
        queryKey: ['vias-official'],
        queryFn: viasService.getAll,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    // Los reportes usan Render, pero no bloquean la carga de la fuente oficial.
    const reportsQuery = useQuery({
        queryKey: ['vias-community'],
        queryFn: reportsService.getAll,
        refetchInterval: 60000,
        staleTime: 30000,
    });

    const normalizedReports = useMemo(() => (
        (Array.isArray(reportsQuery.data) ? reportsQuery.data : []).map((report) => ({
            id: `user-${report.id}`,
            provincia: report.provincia,
            canton: null,
            nombre_via: report.titulo,
            estado_texto: report.tipo_incidente,
            estado_codigo: 'REPORTE',
            observaciones: report.descripcion,
            fecha_actualizacion: report.timestamp,
            fuente: 'COMUNIDAD',
            coordenadas: { lat: report.latitud, lng: report.longitud },
            isUserReport: true,
        }))
    ), [reportsQuery.data]);

    const rawVias = useMemo(() => {
        const officialRoads = Array.isArray(officialQuery.data) ? officialQuery.data : [];
        return [...normalizedReports, ...officialRoads]
            .sort((first, second) => toTimestamp(second.fecha_actualizacion) - toTimestamp(first.fecha_actualizacion));
    }, [normalizedReports, officialQuery.data]);

    const filteredVias = useMemo(() => {
        let result = rawVias;

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase().trim();
            result = result.filter((road) => [
                road.provincia,
                road.canton,
                road.nombre_via,
                road.observaciones,
            ].filter(Boolean).join(' ').toLowerCase().includes(term));
        }

        if (filters.filterEstado !== 'TODAS') {
            result = result.filter((road) => road.estado_codigo === filters.filterEstado);
        }

        if (filters.filterProvincia !== 'TODAS') {
            result = result.filter((road) => road.provincia === filters.filterProvincia);
        }

        return result;
    }, [rawVias, filters]);

    const uniqueProvincias = useMemo(() => (
        [...new Set(rawVias.map((road) => road.provincia).filter(Boolean))].sort()
    ), [rawVias]);

    const stats = useMemo(() => ({
        total: rawVias.length,
        cerradas: rawVias.filter((road) => road.estado_codigo === 'CERRADA').length,
        parciales: rawVias.filter((road) => road.estado_codigo === 'PARCIAL').length,
        habilitadas: rawVias.filter((road) => road.estado_codigo === 'HABILITADA').length,
        reportes: rawVias.filter((road) => road.estado_codigo === 'REPORTE').length,
    }), [rawVias]);

    const refresh = () => Promise.all([
        officialQuery.refetch(),
        reportsQuery.refetch(),
    ]);

    return {
        vias: rawVias,
        filteredVias,
        stats,
        uniqueProvincias,
        isLoading: officialQuery.isLoading,
        isFetching: officialQuery.isFetching || reportsQuery.isFetching,
        loading: officialQuery.isFetching || reportsQuery.isFetching,
        dataUpdatedAt: Math.max(officialQuery.dataUpdatedAt || 0, reportsQuery.dataUpdatedAt || 0),
        error: officialQuery.error ? 'Error conectando con la fuente oficial' : null,
        filters,
        setFilters,
        refresh,
    };
};
