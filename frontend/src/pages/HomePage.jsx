import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
    TriangleAlert,
    MapPin,
    ListFilter,
    Radio,
    Info,
    List,
    Map as MapIcon,
    WifiOff,
    Database,
    FileDown,
    LoaderCircle,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import ViaCard from '../components/ui/ViaCard';
import { Filters } from '../components/ui/Filters';
import { StatsGrid } from '../components/ui/StatsGrid';
import { ReportModal } from '../components/ui/ReportModal';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { AppSplash } from '../components/brand/AppSplash';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useVias } from '../hooks/useVias';
import { getRoadMapPoint } from '../utils/mapCoordinates';
import { PrintableReport } from '../components/report/PrintableReport';
import { ReportExportModal } from '../components/report/ReportExportModal';

const ViaMap = lazy(() => import('../components/ui/ViaMap').then((module) => ({ default: module.ViaMap })));

const formatCachedAt = (value) => {
    if (!value) return 'una actualización anterior';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'una actualización anterior';
    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const HomePage = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isReportExportOpen, setIsReportExportOpen] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [mobileView, setMobileView] = useState('list');
    const [selectedRoadId, setSelectedRoadId] = useState(null);
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);
    const isOnline = useNetworkStatus();

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const handleChange = (event) => setIsDesktop(event.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const {
        stats,
        error,
        filters,
        refresh,
        setFilters,
        uniqueProvincias,
        isLoading,
        isFetching,
        dataUpdatedAt,
        filteredVias,
        isCached,
        isStale,
        cachedAt,
    } = useVias();

    const setFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ searchTerm: '', filterEstado: 'TODAS', filterProvincia: 'TODAS' });
    };

    const viewRoadOnMap = (road) => {
        setSelectedRoadId(road.id);
        setMobileView('map');
    };

    const mapLegendStats = useMemo(() => filteredVias.reduce((totals, road) => {
        if (road.isUserReport || road.estado_codigo === 'REPORTE') totals.comunidad += 1;
        else if (road.estado_codigo === 'CERRADA') totals.cerradas += 1;
        else if (road.estado_codigo === 'PARCIAL') totals.controladas += 1;
        else totals.habilitadas += 1;
        return totals;
    }, { cerradas: 0, controladas: 0, habilitadas: 0, comunidad: 0 }), [filteredVias]);

    return (
        <div className="app-shell flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-100 text-slate-900">
            <AppSplash active={isLoading} />
            <Navbar
                onRefresh={refresh}
                onOpenReport={() => setIsReportExportOpen(true)}
                canExport={!isLoading && filteredVias.length > 0}
                reportGenerating={isGeneratingPdf}
                loading={isFetching}
                updatedAt={dataUpdatedAt}
            />

            {(!isOnline || isCached) && (
                <div className="flex shrink-0 items-start justify-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold leading-5 text-amber-950" role="status">
                    {!isOnline ? <WifiOff size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> : <Database size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
                    <span>
                        {!isOnline
                            ? isCached
                                ? `${isStale ? 'Advertencia: copia antigua. ' : ''}Sin conexión. Mostrando la copia guardada del ${formatCachedAt(cachedAt)}.`
                                : 'Sin conexión y sin una copia local válida. Reintenta cuando recuperes la conectividad.'
                            : `${isStale ? 'Advertencia: copia antigua. ' : ''}Mostrando una copia guardada del ${formatCachedAt(cachedAt)} mientras se restablece la fuente oficial.`}
                    </span>
                </div>
            )}

            <nav className="grid shrink-0 grid-cols-2 border-b border-slate-200 bg-white p-2 md:hidden" aria-label="Vista del monitor" role="tablist">
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobileView === 'list'}
                    aria-controls="road-list-panel"
                    onClick={() => setMobileView('list')}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mobileView === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <List size={18} aria-hidden="true" />
                    Lista
                    <span className={`rounded-full px-2 py-0.5 text-[0.68rem] tabular-nums ${mobileView === 'list' ? 'bg-white/15' : 'bg-slate-100'}`}>{filteredVias.length}</span>
                </button>
                <button
                    type="button"
                    role="tab"
                    aria-selected={mobileView === 'map'}
                    aria-controls="road-map-panel"
                    onClick={() => setMobileView('map')}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mobileView === 'map' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    <MapIcon size={18} aria-hidden="true" />
                    Mapa
                </button>
            </nav>

            <main className="relative flex min-h-0 flex-1 md:grid md:grid-cols-[minmax(390px,445px)_1fr]">
                <aside id="road-list-panel" role="tabpanel" className={`${mobileView === 'list' ? 'flex' : 'hidden'} min-h-0 flex-1 flex-col border-r border-slate-200 bg-[#f4f6f8] md:flex`}>
                    <div className="custom-scrollbar flex-1 overflow-y-auto p-3 pb-24 sm:p-4 md:p-5 md:pb-8">
                        <StatsGrid stats={stats} />

                        <div className="mt-4 md:hidden">
                            <MobileHeader
                                searchTerm={filters.searchTerm}
                                setSearchTerm={(value) => setFilter('searchTerm', value)}
                                filterEstado={filters.filterEstado}
                                setFilterEstado={(value) => setFilter('filterEstado', value)}
                                filterProvincia={filters.filterProvincia}
                                setFilterProvincia={(value) => setFilter('filterProvincia', value)}
                                provincias={uniqueProvincias}
                            />
                            <button
                                type="button"
                                onClick={() => setIsReportExportOpen(true)}
                                disabled={isLoading || isGeneratingPdf || filteredVias.length === 0}
                                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-brand-primary shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isGeneratingPdf
                                    ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
                                    : <FileDown size={17} aria-hidden="true" />}
                                {isGeneratingPdf ? 'Generando PDF...' : 'Descargar reporte'}
                            </button>
                        </div>

                        <div className="mt-4 hidden md:block">
                            <Filters
                                filterEstado={filters.filterEstado}
                                setFilterEstado={(value) => setFilter('filterEstado', value)}
                                filterProvincia={filters.filterProvincia}
                                setFilterProvincia={(value) => setFilter('filterProvincia', value)}
                                provincias={uniqueProvincias}
                                searchTerm={filters.searchTerm}
                                setSearchTerm={(value) => setFilter('searchTerm', value)}
                            />
                        </div>

                        {error && !isCached && (
                            <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
                                <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                                <div>
                                    <p className="font-bold">No fue posible obtener la información oficial.</p>
                                    <button type="button" onClick={refresh} className="mt-1 font-bold underline underline-offset-2">Reintentar conexión</button>
                                </div>
                            </div>
                        )}

                        <div className="mb-3 mt-5 flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ListFilter size={17} className="text-slate-500" aria-hidden="true" />
                                    <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">Estado de vías</h2>
                                </div>
                                <p className="mt-1 text-sm text-slate-600">{isLoading ? 'Consultando información…' : `${filteredVias.length} resultados visibles`}</p>
                            </div>
                            {isFetching && !isLoading && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary">
                                    <Radio size={13} className="animate-pulse" aria-hidden="true" />
                                    Sincronizando
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 3 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />)
                            ) : filteredVias.length > 0 ? (
                                filteredVias.map((road) => (
                                    <ViaCard
                                        key={road.id}
                                        via={road}
                                        variant={isDesktop ? 'full' : 'compact'}
                                        onViewOnMap={getRoadMapPoint(road) ? viewRoadOnMap : null}
                                    />
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                                    <MapPin size={34} className="mx-auto text-slate-400" aria-hidden="true" />
                                    <h3 className="mt-3 text-base font-bold text-slate-800">No encontramos coincidencias</h3>
                                    <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-slate-500">Ajusta la búsqueda o restablece los filtros para ver todos los registros.</p>
                                    <button type="button" onClick={clearFilters} className="mt-4 min-h-11 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Restablecer filtros</button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <section id="road-map-panel" role="tabpanel" className={`${mobileView === 'map' ? 'block' : 'hidden'} relative min-h-0 flex-1 overflow-hidden bg-slate-200 md:block`} aria-label="Mapa de condiciones viales">
                    {(isDesktop || mobileView === 'map') && (
                        <Suspense fallback={<div className="h-full w-full animate-pulse bg-slate-200" aria-label="Cargando mapa" />}>
                            <ViaMap vias={filteredVias} selectedProvince={filters.filterProvincia} selectedRoadId={selectedRoadId} />
                        </Suspense>
                    )}

                    <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl border border-white/70 bg-white/95 px-3 py-2 shadow-md backdrop-blur sm:left-4 sm:top-4">
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-primary">Red vial nacional</p>
                        <p className="mt-0.5 text-xs font-medium text-slate-600">{filteredVias.length} registros en el mapa</p>
                    </div>

                    <div className="absolute bottom-4 left-4 z-[500] hidden rounded-xl border border-slate-200 bg-white/95 px-3 py-2.5 shadow-md backdrop-blur lg:block">
                        <p className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-slate-500">Color provincial · condición más crítica</p>
                        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-700" /> Cerrada <b className="tabular-nums text-slate-900">{mapLegendStats.cerradas}</b></span>
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Controlada <b className="tabular-nums text-slate-900">{mapLegendStats.controladas}</b></span>
                            <span className={`flex items-center gap-1.5 ${mapLegendStats.habilitadas === 0 ? 'opacity-55' : ''}`}><i className="h-2.5 w-2.5 rounded-full bg-emerald-700" /> Habilitada <b className="tabular-nums text-slate-900">{mapLegendStats.habilitadas}</b></span>
                            <span className={`flex items-center gap-1.5 ${mapLegendStats.comunidad === 0 ? 'opacity-55' : ''}`}><i className="h-2.5 w-2.5 rounded-full bg-sky-700" /> Comunidad <b className="tabular-nums text-slate-900">{mapLegendStats.comunidad}</b></span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="absolute bottom-4 right-4 z-[500] inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-bold text-white shadow-xl transition hover:bg-[#0a3266] focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                    >
                        <TriangleAlert size={18} className="text-brand-yellow" aria-hidden="true" />
                        Reportar novedad
                    </button>
                </section>
            </main>

            {mobileView === 'list' && (
                <button
                    type="button"
                    onClick={() => setIsReportModalOpen(true)}
                    className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[700] inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-navy px-4 text-sm font-bold text-white shadow-xl md:hidden"
                >
                    <TriangleAlert size={18} className="text-brand-yellow" aria-hidden="true" />
                    Reportar
                </button>
            )}

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onReportSubmitted={refresh}
            />

            <ReportExportModal
                isOpen={isReportExportOpen}
                onClose={() => setIsReportExportOpen(false)}
                roads={filteredVias}
                updatedAt={dataUpdatedAt}
                onGeneratingChange={setIsGeneratingPdf}
            />

            <PrintableReport
                roads={filteredVias}
                filters={filters}
                updatedAt={dataUpdatedAt}
            />
        </div>
    );
};
