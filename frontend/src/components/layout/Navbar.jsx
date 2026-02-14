import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';
import AppLogo from '../ui/AppLogo';

export const Navbar = ({ onRefresh, loading }) => {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Branding con AppLogo */}
                    <div className="flex items-center gap-3">
                        <AppLogo className="w-10 h-10" />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">
                                Vialert<span className="text-blue-600">EC</span>
                            </h1>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    Monitor Vial Nacional
                                </span>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Acciones de la Navbar */}
                    <div className="flex items-center gap-2">
                        {/* Indicador de "En Vivo" para Desktop */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full mr-2">
                            <Radio size={12} className="text-red-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Live Feed</span>
                        </div>

                        {/* Botón Refrescar */}
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-2 
                                ${loading
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            title="Actualizar datos"
                        >
                            <span className="hidden md:block text-xs font-bold uppercase tracking-wider">
                                {loading ? 'Sincronizando...' : 'Actualizar'}
                            </span>
                            <RefreshCw
                                size={18}
                                className={`${loading ? 'animate-spin text-blue-600' : ''}`}
                            />
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );
};