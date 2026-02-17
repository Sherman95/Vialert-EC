import React, { useState } from 'react';
import { RefreshCw, Map as MapIcon, Plus, List, Search, Filter, Minimize2, Maximize2, MapPin, AlertTriangle } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import ViaCard from '../components/ui/ViaCard';
import { Filters } from '../components/ui/Filters';
import { StatsGrid } from '../components/ui/StatsGrid';
import { ViaMap } from '../components/ui/ViaMap';
import { ReportModal } from '../components/ui/ReportModal';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { useVias } from '../hooks/useVias';

export const HomePage = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    // Estado para el mapa en móvil
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    const {
        vias,
        stats,
        provinciasDisponibles,
        loading,
        error,
        filters,
        refresh,
        setFilters,
        uniqueProvincias,
        isLoading,
        filteredVias
    } = useVias();

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

            {/* --- MOBILE VIEW (xs/sm) --- */}
            <div className="md:hidden flex flex-col h-full relative">
                {/* 1. Mobile Header (Sticky) */}
                <MobileHeader
                    searchTerm={filters.searchTerm}
                    setSearchTerm={(term) => setFilters(prev => ({ ...prev, searchTerm: term }))}
                    filterEstado={filters.filterEstado}
                    setFilterEstado={(est) => setFilters(prev => ({ ...prev, filterEstado: est }))}
                    filterProvincia={filters.filterProvincia}
                    setFilterProvincia={(prov) => setFilters(prev => ({ ...prev, filterProvincia: prov }))}
                    provincias={uniqueProvincias}
                />

                {/* 2. Collapsible Map */}
                <div className={`relative transition-all duration-300 ease-in-out shrink-0 ${isMapExpanded ? 'h-[60vh] z-40' : 'h-[25vh] z-0'}`}>
                    <ViaMap vias={vias} interactive selectedProvince={filters.filterProvincia} />

                    {/* Botón Expandir/Contraer Map */}
                    <button
                        onClick={() => setIsMapExpanded(!isMapExpanded)}
                        className="absolute bottom-2 right-2 z-[400] bg-white/90 backdrop-blur p-2 rounded-full shadow-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-transform active:scale-95"
                    >
                        {isMapExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>

                {/* 3. Lista Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-24 bg-slate-50">
                    {/* Stats Resumen (Compacto Mobile) */}
                    <div className="grid grid-cols-3 gap-2 mb-1">
                        <div className="bg-red-50 p-2 rounded-lg text-center border border-red-100 flex flex-col items-center justify-center">
                            <span className="block text-lg font-bold text-red-600 leading-none">{stats.cerradas}</span>
                            <span className="text-[9px] uppercase font-bold text-red-400 mt-1">Cerradas</span>
                        </div>
                        <div className="bg-yellow-50 p-2 rounded-lg text-center border border-yellow-100 flex flex-col items-center justify-center">
                            <span className="block text-lg font-bold text-yellow-600 leading-none">{stats.parciales}</span>
                            <span className="text-[9px] uppercase font-bold text-yellow-400 mt-1">Parciales</span>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-100 flex flex-col items-center justify-center">
                            <span className="block text-lg font-bold text-blue-600 leading-none">{stats.total}</span>
                            <span className="text-[9px] uppercase font-bold text-blue-400 mt-1">Total</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400 animate-pulse">Cargando vías...</div>
                    ) : filteredVias.length === 0 ? (
                        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 mt-4">
                            <MapPin size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500 font-medium">No se encontraron vías</p>
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, searchTerm: '', filterEstado: 'TODAS', filterProvincia: 'TODAS' }))}
                                className="mt-2 text-blue-500 text-sm font-bold"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    ) : (
                        filteredVias.map(via => (
                            <ViaCard key={via.id} via={via} variant="compact" />
                        ))
                    )}
                </div>

                {/* 4. FAB - Action Button */}
                <div className="absolute bottom-6 right-6 z-50">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="bg-slate-900 hover:bg-black text-white p-4 rounded-full shadow-xl shadow-slate-900/30 active:scale-95 transition-all flex items-center justify-center"
                    >
                        <AlertTriangle size={24} />
                    </button>
                </div>
            </div>

            {/* --- DESKTOP VIEW (md/lg) --- */}
            <div className="hidden md:flex flex-row h-full">
                {/* Sidebar Izquierdo */}
                <div className="w-[450px] flex flex-col border-r border-slate-200 bg-white z-20 shadow-xl relative">
                    <Navbar onRefresh={refresh} loading={isLoading} />

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50">
                        <StatsGrid stats={stats} />

                        <div className="my-6">
                            <Filters
                                filterEstado={filters.filterEstado} setFilterEstado={(e) => setFilters(prev => ({ ...prev, filterEstado: e }))}
                                filterProvincia={filters.filterProvincia} setFilterProvincia={(p) => setFilters(prev => ({ ...prev, filterProvincia: p }))}
                                provincias={uniqueProvincias}
                                searchTerm={filters.searchTerm} setSearchTerm={(t) => setFilters(prev => ({ ...prev, searchTerm: t }))}
                            />
                        </div>

                        <div className="space-y-4 pb-20">
                            {isLoading ? (
                                <p className="text-center text-slate-500 py-10">Cargando datos en tiempo real...</p>
                            ) : filteredVias.length > 0 ? (
                                filteredVias.map((via) => (
                                    <ViaCard key={via.id} via={via} />
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
                                    <MapPin size={48} className="mx-auto text-slate-300 mb-3" />
                                    <p className="text-slate-500 font-medium">No hay vías con estos filtros</p>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, searchTerm: '', filterEstado: 'TODAS', filterProvincia: 'TODAS' }))}
                                        className="mt-3 text-blue-500 text-sm font-semibold hover:underline"
                                    >
                                        Limpiar búsqueda
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mapa Derecho */}
                <div className="flex-1 relative bg-slate-100">
                    <ViaMap vias={vias} interactive selectedProvince={filters.filterProvincia} />

                    {/* Botón flotante desktop */}
                    <div className="absolute bottom-8 right-8 z-[1000]">
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            className="bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-full shadow-lg border border-slate-200 font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                        >
                            <AlertTriangle size={20} className="text-amber-500" />
                            Reportar Incidente
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Global */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onReportSubmitted={refresh}
                provincias={provinciasDisponibles}
            />
        </div>
    );
};