import React from 'react';
import { RefreshCw, AlertCircle, Filter, Activity, Map as MapIcon } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import ViaCard from '../components/ui/ViaCard';
import { Filters } from '../components/ui/Filters';
import { StatsGrid } from '../components/ui/StatsGrid';
import { ViaMap } from '../components/ui/ViaMap'; // Asegúrate de haberlo creado
import { useVias } from '../hooks/useVias';

export const HomePage = () => {
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
        <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900 pb-20">
            <Navbar onRefresh={refresh} loading={loading} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- SECCIÓN 1: DASHBOARD & MAPA --- */}
                <section className="mb-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-slate-900 p-2 rounded-lg text-white">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Panel de Control en Vivo</h2>
                            <p className="text-sm text-slate-500 font-medium">Estado de la red vial nacional del Ecuador</p>
                        </div>
                    </div>

                    <StatsGrid stats={stats} />

                    <div className="group relative">
                        <div className="absolute -top-3 left-6 z-[1000] bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                            Vista Satelital Operativa
                        </div>
                        <ViaMap vias={vias} />
                    </div>
                </section>

                {/* --- SECCIÓN 2: FILTROS Y BÚSQUEDA --- */}
                <section className="mb-8">
                    <div className="bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-white shadow-xl shadow-slate-200/50">
                        <div className="bg-white rounded-xl p-6 border border-slate-100">
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="flex-grow">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Buscador Inteligente</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="block w-full pl-4 pr-12 py-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-0 outline-none transition-all text-sm font-semibold"
                                            placeholder="Ej: 'Vía Alóag', 'Derrumbe en El Oro'..."
                                            value={filters.searchTerm}
                                            onChange={(e) => filters.setSearchTerm(e.target.value)}
                                        />
                                        <div className="absolute inset-y-0 right-4 flex items-center">
                                            <RefreshCw size={18} className={`text-slate-300 ${loading ? 'animate-spin text-blue-500' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                                <div className="md:w-1/3">
                                    <Filters
                                        filterEstado={filters.filterEstado}
                                        setFilterEstado={filters.setFilterEstado}
                                        filterProvincia={filters.filterProvincia}
                                        setFilterProvincia={filters.setFilterProvincia}
                                        provincias={provinciasDisponibles}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- SECCIÓN 3: ALERTAS DE LA COMUNIDAD --- */}
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">Reportes de Carretera</h3>
                        <div className="h-[1px] w-full bg-slate-200"></div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                            {vias.length} ACTIVOS
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-700 mb-8">
                            <AlertCircle size={24} />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && vias.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sin coincidencias detectadas</p>
                        </div>
                    )}

                    {/* Grid de Tarjetas con animación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vias.map((via) => (
                            <ViaCard key={via.id} via={via} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};