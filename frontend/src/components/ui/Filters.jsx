import React from 'react';
import { Search, SlidersHorizontal, RotateCcw, ChevronDown, X } from 'lucide-react';

export const Filters = ({
    filterEstado,
    setFilterEstado,
    filterProvincia,
    setFilterProvincia,
    provincias,
    searchTerm,
    setSearchTerm,
}) => {
    const hasActiveFilters = Boolean(searchTerm) || filterEstado !== 'TODAS' || filterProvincia !== 'TODAS';

    const clearFilters = () => {
        setSearchTerm('');
        setFilterEstado('TODAS');
        setFilterProvincia('TODAS');
    };

    return (
        <section aria-label="Filtros de vías" className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <SlidersHorizontal size={17} className="text-slate-500" aria-hidden="true" />
                    Filtrar información
                </div>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    >
                        <RotateCcw size={14} aria-hidden="true" />
                        Restablecer
                    </button>
                )}
            </div>

            <label className="relative block">
                <span className="sr-only">Buscar vía, cantón o provincia</span>
                <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar vía, cantón o provincia"
                    className="min-h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1f5673] focus:bg-white focus:ring-2 focus:ring-[#1f5673]/15"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200"
                        aria-label="Limpiar búsqueda"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">Condición</span>
                    <span className="relative block">
                        <select
                            value={filterEstado}
                            onChange={(event) => setFilterEstado(event.target.value)}
                            className="min-h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm font-semibold text-slate-800 outline-none focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                        >
                            <option value="TODAS">Todas</option>
                            <option value="CERRADA">Cerradas</option>
                            <option value="PARCIAL">Paso controlado</option>
                            <option value="HABILITADA">Habilitadas</option>
                            <option value="REPORTE">Reportes ciudadanos</option>
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    </span>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-slate-600">Provincia</span>
                    <span className="relative block">
                        <select
                            value={filterProvincia}
                            onChange={(event) => setFilterProvincia(event.target.value)}
                            className="min-h-11 w-full appearance-none truncate rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm font-semibold text-slate-800 outline-none focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                        >
                            <option value="TODAS">Todo Ecuador</option>
                            {provincias.map((province) => (
                                <option key={province} value={province}>{province}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                    </span>
                </label>
            </div>
        </section>
    );
};
