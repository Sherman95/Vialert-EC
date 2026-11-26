import React, { useState } from 'react';
import {
    MapPin,
    TriangleAlert,
    CircleCheck,
    Ban,
    Signpost,
    Clock3,
    Radio,
    UserRound,
    ChevronDown,
    ChevronUp,
    MapPinned,
} from 'lucide-react';

const statusConfig = {
    CERRADA: {
        label: 'Cerrada',
        icon: Ban,
        accent: 'border-l-red-700',
        badge: 'border-red-200 bg-red-50 text-red-800',
        iconSurface: 'bg-red-100 text-red-700',
    },
    PARCIAL: {
        label: 'Paso controlado',
        icon: TriangleAlert,
        accent: 'border-l-amber-600',
        badge: 'border-amber-200 bg-amber-50 text-amber-800',
        iconSurface: 'bg-amber-100 text-amber-800',
    },
    REPORTE: {
        label: 'Reporte ciudadano',
        icon: UserRound,
        accent: 'border-l-sky-700',
        badge: 'border-sky-200 bg-sky-50 text-sky-800',
        iconSurface: 'bg-sky-100 text-sky-800',
    },
    HABILITADA: {
        label: 'Habilitada',
        icon: CircleCheck,
        accent: 'border-l-emerald-700',
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        iconSurface: 'bg-emerald-100 text-emerald-800',
    },
};

const formatUpdatedAt = (value) => {
    if (!value) return 'Sin fecha reportada';

    const date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('es-EC', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const SourceLabel = ({ isUserReport }) => (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {isUserReport ? <UserRound size={13} aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
        {isUserReport ? 'Comunidad' : 'ECU 911'}
    </span>
);

const RoadDetails = ({ via }) => {
    const hasAlternate = via.via_alterna && via.via_alterna !== 'N/A';

    return (
        <>
            {via.estado_texto && via.estado_texto !== via.estado_codigo && (
                <p className="mb-2 text-sm font-bold text-slate-700">{via.estado_texto}</p>
            )}
            <p className="text-[0.95rem] leading-6 text-slate-600">
                {via.observaciones || 'Sin observaciones adicionales.'}
            </p>

            {hasAlternate && (
                <div className="mt-4 flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
                    <Signpost size={18} className="mt-0.5 shrink-0 text-sky-800" aria-hidden="true" />
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.08em] text-sky-800">Ruta alterna</p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">{via.via_alterna}</p>
                    </div>
                </div>
            )}
        </>
    );
};

const ViaCard = ({ via, variant = 'full', onViewOnMap }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = statusConfig[via.estado_codigo] || statusConfig.HABILITADA;
    const StatusIcon = config.icon;

    if (variant === 'compact') {
        return (
            <article className={`overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white ${config.accent}`}>
                <button
                    type="button"
                    onClick={() => setIsExpanded((current) => !current)}
                    className="flex w-full items-start gap-3 p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#1f5673]"
                    aria-expanded={isExpanded}
                >
                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconSurface}`}>
                        <StatusIcon size={19} strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-base font-extrabold leading-5 text-slate-900">{via.nombre_via}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
                                <MapPin size={13} aria-hidden="true" />
                                {via.provincia}{via.canton ? ` · ${via.canton}` : ''}
                            </span>
                            <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${config.badge}`}>
                                {config.label}
                            </span>
                        </span>
                    </span>
                    <span className="mt-1 shrink-0 text-slate-500">
                        {isExpanded ? <ChevronUp size={20} aria-hidden="true" /> : <ChevronDown size={20} aria-hidden="true" />}
                    </span>
                </button>

                {isExpanded && (
                    <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                        <RoadDetails via={via} />
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <SourceLabel isUserReport={via.isUserReport} />
                            <div className="flex flex-wrap items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                    <Clock3 size={13} aria-hidden="true" />
                                    {formatUpdatedAt(via.fecha_actualizacion)}
                                </span>
                                {onViewOnMap && (
                                    <button type="button" onClick={() => onViewOnMap(via)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-bold text-brand-primary hover:bg-blue-100">
                                        <MapPinned size={14} aria-hidden="true" />
                                        Ver en mapa
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </article>
        );
    }

    return (
        <article className={`rounded-xl border border-slate-200 border-l-4 bg-white p-4 transition hover:border-slate-300 hover:shadow-md ${config.accent}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-extrabold ${config.badge}`}>
                            <StatusIcon size={14} strokeWidth={2.5} aria-hidden="true" />
                            {config.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.06em] text-slate-500">
                            <MapPin size={13} aria-hidden="true" />
                            {via.provincia}{via.canton ? ` · ${via.canton}` : ''}
                        </span>
                    </div>
                    <h3 className="text-base font-extrabold leading-5 text-slate-900">{via.nombre_via}</h3>
                </div>
            </div>

            <div className="mt-3">
                <RoadDetails via={via} />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <SourceLabel isUserReport={via.isUserReport} />
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Clock3 size={13} aria-hidden="true" />
                        {formatUpdatedAt(via.fecha_actualizacion)}
                    </span>
                    {onViewOnMap && (
                        <button type="button" onClick={() => onViewOnMap(via)} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-blue-50 px-3 text-xs font-bold text-brand-primary transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-brand-primary/30">
                            <MapPinned size={14} aria-hidden="true" />
                            Ver en mapa
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ViaCard;
