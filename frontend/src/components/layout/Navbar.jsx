import React from 'react';
import { RefreshCw, Radio, ShieldCheck } from 'lucide-react';
import AppLogo from '../ui/AppLogo';

const formatUpdateTime = (timestamp) => {
    if (!timestamp) return 'Esperando datos';

    return new Intl.DateTimeFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(timestamp));
};

export const Navbar = ({ onRefresh, loading, updatedAt }) => {
    return (
        <header className="shrink-0 border-b border-slate-700/70 bg-[#0b1f33] text-white">
            <div className="flex h-[72px] items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <AppLogo className="h-10 w-10 shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                            <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">
                                Vialert EC
                            </h1>
                            <span className="hidden rounded border border-slate-600 px-1.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-300 sm:inline">
                                Ecuador
                            </span>
                        </div>
                        <p className="truncate text-xs font-medium text-slate-300 sm:text-sm">
                            Monitor nacional de condiciones viales
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <div className="hidden items-center gap-3 rounded-lg border border-slate-600/80 bg-slate-800/50 px-3 py-2 lg:flex">
                        <div className="flex items-center gap-2">
                            <Radio size={15} className="text-emerald-400" aria-hidden="true" />
                            <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-200">
                                ECU 911
                            </span>
                        </div>
                        <span className="h-4 w-px bg-slate-600" />
                        <span className="text-xs text-slate-300">
                            Actualizado {formatUpdateTime(updatedAt)}
                        </span>
                    </div>

                    <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-300 sm:flex lg:hidden">
                        <ShieldCheck size={15} className="text-emerald-400" aria-hidden="true" />
                        Fuente oficial
                    </div>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:cursor-wait disabled:opacity-70 sm:px-4"
                        aria-label="Actualizar información vial"
                    >
                        <RefreshCw size={17} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
                        <span className="hidden sm:inline">{loading ? 'Actualizando' : 'Actualizar'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
