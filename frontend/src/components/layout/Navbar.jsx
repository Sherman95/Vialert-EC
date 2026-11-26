import React from 'react';
import { Download, FileDown, LoaderCircle, RefreshCw, Radio, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../brand/BrandLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const formatUpdateTime = (timestamp) => {
    if (!timestamp) return 'Esperando datos';

    return new Intl.DateTimeFormat('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(timestamp));
};

export const Navbar = ({ onRefresh, onOpenReport, canExport, reportGenerating, loading, updatedAt }) => {
    const { canInstall, install } = usePWAInstall();

    return (
        <header className="app-header shrink-0 border-b border-white/10 bg-brand-navy text-white">
            <div className="flex min-h-[68px] items-center justify-between gap-3 px-3 py-2 sm:min-h-[76px] sm:px-6">
                <div className="flex min-w-0 items-center">
                    <div className="hidden h-[58px] w-[230px] items-center rounded-xl bg-white px-2.5 shadow-sm sm:flex">
                        <BrandLogo variant="horizontal" className="h-[50px] w-full" priority />
                    </div>
                    <div className="flex items-center gap-2.5 sm:hidden">
                        <BrandLogo variant="isotype" className="h-12 w-12 shrink-0" alt="Vialert-EC" priority />
                        <div className="min-w-0">
                            <h1 className="truncate text-[1.05rem] font-bold tracking-tight">Vialert-EC</h1>
                            <p className="truncate text-[0.68rem] font-medium text-blue-100">Monitoreo vial en tiempo real</p>
                        </div>
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

                    {canInstall && (
                        <button
                            type="button"
                            onClick={install}
                            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-blue-300/40 bg-blue-600/30 px-3 text-sm font-semibold text-white transition hover:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
                            aria-label="Instalar Vialert-EC"
                        >
                            <Download size={17} aria-hidden="true" />
                            <span className="hidden lg:inline">Instalar</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onOpenReport}
                        disabled={!canExport || reportGenerating}
                        className="hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:cursor-not-allowed disabled:opacity-50 md:inline-flex"
                        aria-label="Descargar reporte vial"
                        title="Elegir diseño y descargar reporte PDF"
                    >
                        {reportGenerating
                            ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                            : <FileDown size={17} aria-hidden="true" />}
                        <span className="hidden xl:inline">{reportGenerating ? 'Generando PDF...' : 'Descargar reporte'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-brand-yellow disabled:cursor-wait disabled:opacity-70 sm:px-4"
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
