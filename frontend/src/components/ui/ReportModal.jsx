import React, { useState } from 'react';
import { X, MapPin, Send, TriangleAlert, LocateFixed, ShieldCheck, ChevronDown } from 'lucide-react';
import { reportsService } from '../../services/api';

const initialForm = {
    titulo: '',
    descripcion: '',
    tipo_incidente: 'Derrumbe',
    provincia: 'PICHINCHA',
    latitud: null,
    longitud: null,
};

const ECUADOR_PROVINCES = [
    'AZUAY', 'BOLIVAR', 'CAÑAR', 'CARCHI', 'CHIMBORAZO', 'COTOPAXI',
    'EL ORO', 'ESMERALDAS', 'GALAPAGOS', 'GUAYAS', 'IMBABURA', 'LOJA',
    'LOS RIOS', 'MANABI', 'MORONA SANTIAGO', 'NAPO', 'ORELLANA', 'PASTAZA',
    'PICHINCHA', 'SANTA ELENA', 'SANTO DOMINGO DE LOS TSACHILAS', 'SUCUMBIOS',
    'TUNGURAHUA', 'ZAMORA CHINCHIPE',
];

export const ReportModal = ({ isOpen, onClose, onReportSubmitted }) => {
    const [formData, setFormData] = useState(initialForm);
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle');
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleChange = (event) => {
        setMessage('');
        setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    };

    const handleGetLocation = () => {
        setMessage('');
        setLocationStatus('loading');

        if (!navigator.geolocation) {
            setLocationStatus('error');
            setMessage('Este navegador no permite obtener la ubicación.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((current) => ({
                    ...current,
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                }));
                setLocationStatus('success');
            },
            () => {
                setLocationStatus('error');
                setMessage('No pudimos obtener tu ubicación. Revisa el permiso del navegador.');
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (locationStatus !== 'success') {
            setMessage('Necesitamos la ubicación para situar el incidente en el mapa.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            await reportsService.create(formData);
            await onReportSubmitted();
            setFormData((current) => ({ ...initialForm, provincia: current.provincia }));
            setLocationStatus('idle');
            onClose();
        } catch {
            setMessage('No fue posible publicar el reporte. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-950/70 sm:items-center sm:p-5">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-title"
                className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-[#0b1f33] px-5 py-4 text-white sm:px-6">
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                            <TriangleAlert size={20} aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="report-title" className="text-lg font-extrabold">Reportar una novedad vial</h2>
                            <p className="mt-0.5 text-sm text-slate-300">La ubicación y los detalles serán visibles públicamente.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        aria-label="Cerrar formulario"
                    >
                        <X size={21} aria-hidden="true" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">
                        <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                        <p><strong>Información responsable.</strong> Publica únicamente novedades que hayas podido verificar.</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-bold text-slate-700">Tipo de novedad</span>
                            <span className="relative block">
                                <select
                                    name="tipo_incidente"
                                    value={formData.tipo_incidente}
                                    onChange={handleChange}
                                    className="min-h-12 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-base font-medium text-slate-900 outline-none focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                                >
                                    <option value="Derrumbe">Derrumbe</option>
                                    <option value="Accidente">Accidente</option>
                                    <option value="Cierre">Cierre total</option>
                                    <option value="Trafico">Tráfico intenso</option>
                                    <option value="Clima">Clima o neblina</option>
                                    <option value="Otro">Otra novedad</option>
                                </select>
                                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                            </span>
                        </label>

                        <label className="block">
                            <span className="mb-1.5 block text-sm font-bold text-slate-700">Provincia</span>
                            <span className="relative block">
                                <select
                                    name="provincia"
                                    value={formData.provincia}
                                    onChange={handleChange}
                                    className="min-h-12 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-base font-medium text-slate-900 outline-none focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                                >
                                    {ECUADOR_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
                                </select>
                                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                            </span>
                        </label>
                    </div>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-bold text-slate-700">Título breve</span>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ej. Deslizamiento en el km 45"
                            required
                            maxLength={70}
                            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-sm font-bold text-slate-700">Descripción</span>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Describe el punto afectado, el sentido de circulación y cualquier restricción."
                            required
                            maxLength={300}
                            className="min-h-28 w-full resize-y rounded-lg border border-slate-300 bg-white p-3 text-base leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1f5673] focus:ring-2 focus:ring-[#1f5673]/15"
                        />
                    </label>

                    <div>
                        <span className="mb-1.5 block text-sm font-bold text-slate-700">Ubicación del incidente</span>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationStatus === 'loading'}
                            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-extrabold transition focus:outline-none focus:ring-2 focus:ring-[#1f5673]/25 ${locationStatus === 'success'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100'
                                }`}
                        >
                            {locationStatus === 'success' ? <LocateFixed size={18} aria-hidden="true" /> : <MapPin size={18} aria-hidden="true" />}
                            {locationStatus === 'loading' ? 'Obteniendo ubicación…' : locationStatus === 'success' ? 'Ubicación confirmada' : 'Usar mi ubicación actual'}
                        </button>
                        {locationStatus === 'success' && (
                            <p className="mt-2 text-center text-xs font-medium tabular-nums text-slate-500">
                                {formData.latitud.toFixed(5)}, {formData.longitud.toFixed(5)}
                            </p>
                        )}
                    </div>

                    {message && (
                        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                            {message}
                        </p>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-12 rounded-lg px-5 text-sm font-bold text-slate-600 hover:bg-slate-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#123b56] px-6 text-sm font-extrabold text-white transition hover:bg-[#0b2e45] focus:outline-none focus:ring-2 focus:ring-[#1f5673] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                        >
                            <Send size={17} aria-hidden="true" />
                            {loading ? 'Publicando…' : 'Publicar reporte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
