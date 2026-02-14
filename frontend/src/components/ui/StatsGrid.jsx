import React from 'react';

export const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-xs text-gray-500 font-medium uppercase">Total Vías</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                <p className="text-xs text-gray-500 font-medium uppercase">Cerradas</p>
                <p className="text-2xl font-bold text-red-600">{stats.cerradas}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
                <p className="text-xs text-gray-500 font-medium uppercase">Parciales</p>
                <p className="text-2xl font-bold text-amber-600">{stats.parciales}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
                <p className="text-xs text-gray-500 font-medium uppercase">Habilitadas</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.habilitadas}</p>
            </div>
        </div>
    );
};