import React from 'react';
import { Search, X, ChevronDown, MapPin } from 'lucide-react';

const statusOptions = [
    { value: 'TODAS', label: 'Todas' },
    { value: 'CERRADA', label: 'Cerradas' },
    { value: 'PARCIAL', label: 'Controladas' },
    { value: 'HABILITADA', label: 'Habilitadas' },
];

export const MobileHeader = ({
    searchTerm,
    setSearchTerm,
    filterEstado,
    setFilterEstado,
    filterProvincia,
    setFilterProvincia,
    provincias,
}) => (
    <section aria-label="Búsqueda y filtros" className="space-y-3">
        <label className="relative block">
            <span className="sr-only">Buscar vía, cantón o provincia</span>
            <Search size={19} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar vía, cantón o provincia"
                className="min-h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 text-base font-medium text-slate-900 outline-none focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
            />
            {searchTerm && (
                <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
                    aria-label="Limpiar búsqueda"
                >
                    <X size={17} aria-hidden="true" />
                </button>
            )}
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" aria-label="Filtrar por condición">
            {statusOptions.map((option) => {
                const active = filterEstado === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilterEstado(option.value)}
                        className={`min-h-10 shrink-0 rounded-lg border px-3 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#1f5673]/30 ${active
                            ? 'border-[#153d57] bg-[#153d57] text-white'
                            : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>

        <label className="relative flex min-h-11 items-center rounded-lg border border-slate-300 bg-white">
            <MapPin size={17} className="pointer-events-none ml-3 text-slate-500" aria-hidden="true" />
            <span className="sr-only">Filtrar por provincia</span>
            <select
                value={filterProvincia}
                onChange={(event) => setFilterProvincia(event.target.value)}
                className="min-h-11 min-w-0 flex-1 appearance-none bg-transparent px-2 pr-9 text-sm font-semibold text-slate-800 outline-none"
            >
                <option value="TODAS">Todo Ecuador</option>
                {provincias.map((province) => (
                    <option key={province} value={province}>{province}</option>
                ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-500" aria-hidden="true" />
        </label>
    </section>
);
