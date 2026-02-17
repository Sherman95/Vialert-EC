import React from 'react';

export const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total</p>
                <p className="text-lg font-black text-slate-900 leading-none">{stats.total}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-red-500 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Cerradas</p>
                <p className="text-lg font-black text-red-600 leading-none">{stats.cerradas}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-amber-500 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Parcial</p>
                <p className="text-lg font-black text-amber-600 leading-none">{stats.parciales}</p>
            </div>
            <div className="bg-white p-2 rounded-lg shadow-sm border-l-2 border-emerald-500 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Ok</p>
                <p className="text-lg font-black text-emerald-600 leading-none">{stats.habilitadas}</p>
            </div>
        </div>
    );
};