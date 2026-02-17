import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { viasService, reportsService } from '../services/api';

export const useVias = () => {
    // Estados para los filtros (UI State) se mantienen locales
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('TODAS');
    const [filterProvincia, setFilterProvincia] = useState('TODAS');

    // React Query para cargar datos (Server State)
    const { data: vias = [], isLoading: loading, error, refetch } = useQuery({
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
        let resultado = vias;

        // 1. Filtrar por Buscador (Texto)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            resultado = resultado.filter(via =>
                via.provincia.toLowerCase().includes(term) ||
                via.nombre_via.toLowerCase().includes(term) ||
                (via.observaciones && via.observaciones.toLowerCase().includes(term))
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

        return resultado;
    }, [vias, searchTerm, filterEstado, filterProvincia]);

    // Extraer lista única de provincias desde la data ya combinada
    const provinciasDisponibles = useMemo(() => {
        const provincias = vias.map(v => v.provincia);
        return [...new Set(provincias)].sort();
    }, [vias]);

    // Contadores basados en 'vias' (data completa, no filtrada)
    const stats = useMemo(() => ({
        total: vias.length,
        cerradas: vias.filter(v => v.estado_codigo === 'CERRADA').length,
        parciales: vias.filter(v => v.estado_codigo === 'PARCIAL').length,
        habilitadas: vias.filter(v => v.estado_codigo === 'HABILITADA').length,
        reportes: vias.filter(v => v.estado_codigo === 'REPORTE').length
    }), [vias]);

    return {
        vias: filteredVias,
        stats,
        provinciasDisponibles,
        loading,
        error: error ? 'Error conectando al servidor' : null,
        filters: {
            searchTerm, setSearchTerm,
            filterEstado, setFilterEstado,
            filterProvincia, setFilterProvincia
        },
        refresh: refetch
    };
};