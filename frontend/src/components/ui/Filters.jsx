import React from 'react';
import { Filter, X } from 'lucide-react';

export const Filters = ({
    filterEstado, setFilterEstado,
    filterProvincia, setFilterProvincia,
    provincias,
    compact
}) => {
    if (compact) {
        return (
            <div className="flex gap-2">
                <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="border-slate-200 rounded-lg shadow-sm focus:border-blue-500 text-xs py-1.5 px-2 bg-white font-medium"
                >
                    <option value="TODAS">Estado: Todos</option>
                    <option value="CERRADA">🔴 Cerradas</option>
                    <option value="PARCIAL">🟡 Parciales</option>
                    <option value="HABILITADA">🟢 Habilitadas</option>
                </select>

                <select
                    value={filterProvincia}
                    onChange={(e) => setFilterProvincia(e.target.value)}
                    className="border-slate-200 rounded-lg shadow-sm focus:border-blue-500 text-xs py-1.5 px-2 bg-white font-medium max-w-[150px]"
                >
                    <option value="TODAS">Provincia: Todas</option>
                    {provincias.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700">
                <Filter size={16} />
                <span>Filtros Avanzados</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Dropdown Estado */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Estado de la Vía</label>
                    <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-gray-50"
                    >
                        <option value="TODAS">Todos los estados</option>
                        <option value="CERRADA">🔴 Cerradas</option>
                        <option value="PARCIAL">🟡 Parcialmente Habilitadas</option>
                        <option value="HABILITADA">🟢 Habilitadas</option>
                    </select>
                </div>

                {/* Dropdown Provincia */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Provincia</label>
                    <select
                        value={filterProvincia}
                        onChange={(e) => setFilterProvincia(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 bg-gray-50"
                    >
                        <option value="TODAS">Todas las provincias</option>
                        {provincias.map(p => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* Botón Limpiar */}
                <div className="flex items-end">
                    <button
                        onClick={() => { setFilterEstado('TODAS'); setFilterProvincia('TODAS'); }}
                        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-md transition-colors text-sm border border-gray-300"
                    >
                        <X size={16} />
                        Limpiar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};