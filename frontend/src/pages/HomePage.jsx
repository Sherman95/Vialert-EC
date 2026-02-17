import React, { useState } from 'react';
import { RefreshCw, Map as MapIcon, Plus, List, Search, Filter } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import ViaCard from '../components/ui/ViaCard';
import { Filters } from '../components/ui/Filters';
import { StatsGrid } from '../components/ui/StatsGrid';
import { ViaMap } from '../components/ui/ViaMap';
import { ReportModal } from '../components/ui/ReportModal';
import { useVias } from '../hooks/useVias';

export const HomePage = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'
    const {
        vias,
        stats,
        provinciasDisponibles,
        loading,
        error,
        filters,
        refresh
    } = useVias();

    return (
        <div className="h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden font-sans text-slate-900">

            {/* --- PANEL IZQUIERDO (SIDEBAR) --- */}
            <aside className={`w-full lg:w-[480px] xl:w-[500px] flex flex-col bg-white border-r border-slate-200 z-20 shadow-xl lg:h-full relative transition-transform duration-300 ${mobileView === 'map' ? 'hidden lg:flex' : 'flex h-full'}`}>

                {/* Header Compacto */}
                <header className="p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                    <Navbar onRefresh={refresh} loading={loading} simpleMode />

                    {/* Mobile Tabs */}
                    <div className="mt-4 flex lg:hidden bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMobileView('list')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileView === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            <List size={14} /> Lista
                        </button>
                        <button
                            onClick={() => setMobileView('map')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${mobileView === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            <MapIcon size={14} /> Mapa
                        </button>
                    </div>

                    {/* Buscador & Stats Mini */}
                    <div className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all"
                                placeholder="Buscar vía, cantón o incidente..."
                                value={filters.searchTerm}
                                onChange={(e) => filters.setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <Filters
                                filterEstado={filters.filterEstado}
                                setFilterEstado={filters.setFilterEstado}
                                filterProvincia={filters.filterProvincia}
                                setFilterProvincia={filters.setFilterProvincia}
                                provincias={provinciasDisponibles}
                                compact
                            />
                        </div>
                    </div>
                </header>

                {/* Lista Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">

                    {/* Stats Resumen (Solo si no hay búsqueda activa para no estorbar) */}
                    {!filters.searchTerm && (
                        <div className="mb-2">
                            <StatsGrid stats={stats} />
                        </div>
                    )}

                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {vias.length} Reportes Activos
                        </h3>
                        {error && <span className="text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">Error de conexión</span>}
                    </div>

                    {/* Empty State */}
                    {!loading && vias.length === 0 && (
                        <div className="group relative">
                            <div className="absolute -top-3 left-6 z-[1000] bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                Vista Satelital Operativa
                            </div>
                            <ViaMap vias={vias} selectedProvince={filters.filterProvincia} />
                        </div>
                    )}

                    {/* Lista de Tarjetas */}
                    <div className="space-y-4 pb-20 lg:pb-4">
                        {vias.map((via) => (
                            <ViaCard key={via.id} via={via} />
                        ))}
                    </div>
                </div>

                {/* FAB (Solo visible en desktop o lista móvil) */}
                <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white p-3.5 lg:p-4 rounded-full shadow-lg shadow-blue-500/30 hover:scale-110 transition-all active:scale-95 group"
                    title="Reportar Incidente"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
            </aside>

            {/* --- MAPA (DERECHA / FULL MOBILE) --- */}
            <main className={`flex-1 relative bg-slate-100 ${mobileView === 'list' ? 'hidden lg:block' : 'block h-full'}`}>
                {/* Botón Volver a Lista (Solo Móvil) */}
                <button
                    onClick={() => setMobileView('list')}
                    className="absolute top-4 left-4 z-[1000] lg:hidden bg-white text-slate-700 p-2 rounded-lg shadow-md font-bold text-xs flex items-center gap-2"
                >
                    <List size={16} /> Volver a Lista
                </button>

                <div className="w-full h-full">
                    <ViaMap vias={vias} interactive selectedProvince={filters.filterProvincia} />
                </div>
            </main>

            {/* Modal */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onReportSubmitted={refresh}
                provincias={provinciasDisponibles}
            />
        </div>
    );
};