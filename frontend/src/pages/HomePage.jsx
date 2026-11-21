import React, { useEffect, useState } from 'react';
import {
    TriangleAlert,
    Maximize2,
    Minimize2,
    MapPin,
    ListFilter,
    Radio,
    Info,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import ViaCard from '../components/ui/ViaCard';
import { Filters } from '../components/ui/Filters';
import { StatsGrid } from '../components/ui/StatsGrid';
import { ViaMap } from '../components/ui/ViaMap';
import { ReportModal } from '../components/ui/ReportModal';
import { MobileHeader } from '../components/mobile/MobileHeader';
import { useVias } from '../hooks/useVias';

export const HomePage = () => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);

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
    } = useVias();

    const setFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ searchTerm: '', filterEstado: 'TODAS', filterProvincia: 'TODAS' });
    };

    return (
        <div className="flex h-dvh min-h-[560px] flex-col overflow-hidden bg-[#edf1f3] text-slate-900">
            <Navbar onRefresh={refresh} loading={isFetching} updatedAt={dataUpdatedAt} />

            <main className="relative flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(380px,440px)_1fr]">
                <aside className={`${isMapExpanded ? 'hidden' : 'flex'} order-2 min-h-0 flex-1 flex-col border-r border-slate-200 bg-[#f5f7f8] md:order-1 md:flex`}>
                    <div className="flex-1 overflow-y-auto p-3 pb-24 sm:p-4 md:p-5 md:pb-8 custom-scrollbar">
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

                        {error && (
                            <div className="mt-4 flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
                                <Info size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                                <div>
                                    <p className="font-bold">No fue posible actualizar la fuente oficial.</p>
                                    <button type="button" onClick={refresh} className="mt-1 font-bold underline underline-offset-2">
                                        Reintentar conexión
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-3 mt-5 flex items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <ListFilter size={17} className="text-slate-500" aria-hidden="true" />
                                    <h2 className="text-sm font-extrabold uppercase tracking-[0.08em] text-slate-700">
                                        Estado de vías
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    {isLoading ? 'Consultando información…' : `${filteredVias.length} resultados visibles`}
                                </p>
                            </div>
                            {isFetching && !isLoading && (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f5673]">
                                    <Radio size={13} className="animate-pulse" aria-hidden="true" />
                                    Sincronizando
                                </span>
                            )}
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                Array.from({ length: 3 }, (_, index) => (
                                    <div key={index} className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white" />
                                ))
                            ) : filteredVias.length > 0 ? (
                                filteredVias.map((road) => (
                                    <ViaCard key={road.id} via={road} variant={isDesktop ? 'full' : 'compact'} />
                                ))
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                                    <MapPin size={34} className="mx-auto text-slate-400" aria-hidden="true" />
                                    <h3 className="mt-3 text-base font-extrabold text-slate-800">No encontramos coincidencias</h3>
                                    <p className="mx-auto mt-1 max-w-xs text-sm leading-5 text-slate-500">
                                        Ajusta la búsqueda o restablece los filtros para ver todos los registros.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-4 min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                                    >
                                        Restablecer filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                <section className={`relative order-1 shrink-0 overflow-hidden border-b border-slate-300 bg-slate-200 md:order-2 md:h-full md:border-b-0 ${isMapExpanded ? 'h-full flex-1' : 'h-[31dvh] min-h-[230px] max-h-[340px] md:max-h-none'}`}>
                    <ViaMap vias={filteredVias} selectedProvince={filters.filterProvincia} />

                    <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg border border-white/70 bg-white/95 px-3 py-2 shadow-md backdrop-blur sm:left-4 sm:top-4">
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#153d57]">Red vial nacional</p>
                        <p className="mt-0.5 text-xs font-medium text-slate-600">
                            {filteredVias.length} registros en el mapa
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMapExpanded((current) => !current)}
                        className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1f5673] md:hidden"
                        aria-label={isMapExpanded ? 'Contraer mapa' : 'Expandir mapa'}
                    >
                        {isMapExpanded ? <Minimize2 size={20} aria-hidden="true" /> : <Maximize2 size={20} aria-hidden="true" />}
                    </button>

                    <div className="absolute bottom-4 left-4 z-[500] hidden rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md backdrop-blur lg:block">
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-red-700" /> Cerrada</span>
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-600" /> Controlada</span>
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-emerald-700" /> Habilitada</span>
                            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sky-700" /> Comunidad</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsReportModalOpen(true)}
                        className="absolute bottom-4 right-4 z-[500] inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#0b1f33] px-4 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#123b56] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                    >
                        <TriangleAlert size={18} className="text-amber-300" aria-hidden="true" />
                        Reportar novedad
                    </button>
                </section>
            </main>

            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onReportSubmitted={refresh}
            />
        </div>
    );
};
