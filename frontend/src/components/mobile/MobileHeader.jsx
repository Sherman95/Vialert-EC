import React from 'react';
import { Search, MapPin, Navigation, Filter, X } from 'lucide-react';

export const MobileHeader = ({
    searchTerm, setSearchTerm,
    filterEstado, setFilterEstado,
    filterProvincia, setFilterProvincia,
    provincias
}) => {

    // Helper para estilo de chips activos
    const getChipStyle = (isActive, colorClass = "bg-blue-600 text-white border-blue-600") => {
        return isActive
            ? `${colorClass} shadow-md`
            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
    };

    return (
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm pt-safe-top">
            <div className="p-4 space-y-3">
                {/* 1. Buscador Principal */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-100 border-none rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
                        placeholder="¿Qué vía buscas?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* 2. Filtros Horizontales (Chips) */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">

                    {/* Chip: Limpiar (Solo si hay filtros activos) */}
                    {(filterEstado !== 'TODAS' || filterProvincia !== 'TODAS') && (
                        <button
                            onClick={() => { setFilterEstado('TODAS'); setFilterProvincia('TODAS'); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border bg-red-50 text-red-600 border-red-100 whitespace-nowrap animate-in fade-in zoom-in duration-200"
                        >
                            <X size={12} /> Limpiar
                        </button>
                    )}

                    {/* Chip: Estado (Select camuflado) */}
                    <div className="relative">
                        <select
                            value={filterEstado}
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className={`appearance-none pl-8 pr-4 py-1.5 rounded-full text-xs font-bold border transition-all outline-none ${getChipStyle(filterEstado !== 'TODAS', 'bg-slate-800 text-white border-slate-800')}`}
                        >
                            <option value="TODAS">Estado: Todos</option>
                            <option value="CERRADA">🔴 Cerradas</option>
                            <option value="PARCIAL">🟡 Parciales</option>
                            <option value="HABILITADA">🟢 Habilitadas</option>
                        </select>
                        <Navigation size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${filterEstado !== 'TODAS' ? 'text-white' : 'text-slate-500'}`} />
                    </div>

                    {/* Chip: Provincia (Select camuflado) */}
                    <div className="relative">
                        <select
                            value={filterProvincia}
                            onChange={(e) => setFilterProvincia(e.target.value)}
                            className={`appearance-none pl-8 pr-4 py-1.5 rounded-full text-xs font-bold border transition-all outline-none max-w-[150px] truncate ${getChipStyle(filterProvincia !== 'TODAS')}`}
                        >
                            <option value="TODAS">📍 Provincia: Todas</option>
                            {provincias.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <MapPin size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${filterProvincia !== 'TODAS' ? 'text-white' : 'text-slate-500'}`} />
                    </div>

                    {/* Chip Decorativo: Última Actualización */}
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border bg-slate-50 text-slate-400 border-slate-100 whitespace-nowrap">
                        <span>📡 En vivo</span>
                    </div>

                </div>
            </div>
        </div>
    );
};
