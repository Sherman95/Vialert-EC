import React, { useState } from 'react';
import { X, MapPin, Send, AlertTriangle } from 'lucide-react';
import { reportsService } from '../../services/api';

export const ReportModal = ({ isOpen, onClose, onReportSubmitted, provincias }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        tipo_incidente: 'Derrumbe',
        provincia: provincias[0] || 'Pichincha',
        latitud: 0,
        longitud: 0
    });
    const [loading, setLoading] = useState(false);
    const [locationStatus, setLocationStatus] = useState('idle'); // idle, loading, success, error

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGetLocation = () => {
        setLocationStatus('loading');
        if (!navigator.geolocation) {
            setLocationStatus('error');
            alert("Tu navegador no soporta geolocalización.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude
                });
                setLocationStatus('success');
            },
            (error) => {
                console.error(error);
                setLocationStatus('error');
                alert("No pudimos obtener tu ubicación. Verifica los permisos.");
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await reportsService.create(formData);
            alert("¡Reporte enviado! Gracias por colaborar.");
            onReportSubmitted(); // Refrescar lista
            onClose();
            // Reset form
            setFormData({ ...formData, titulo: '', descripcion: '' });
            setLocationStatus('idle');
        } catch (error) {
            alert("Error enviando el reporte.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <AlertTriangle className="text-yellow-400" size={20} />
                        <h3 className="font-bold text-lg">Reportar Incidente</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Alerta de Responsabilidad */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 flex gap-2">
                        <span className="font-bold">⚠️ Importante:</span>
                        <p>Tu reporte será público. Por favor, sé responsable y veraz.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                            <select
                                name="tipo_incidente"
                                value={formData.tipo_incidente}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-slate-50 focus:border-blue-500 outline-none text-sm font-semibold"
                            >
                                <option value="Derrumbe">🪨 Derrumbe</option>
                                <option value="Accidente">🚗 Accidente</option>
                                <option value="Cierre">⛔ Cierre Total</option>
                                <option value="Trafico">🐢 Tráfico Pesado</option>
                                <option value="Clima">🌧️ Clima / Neblina</option>
                                <option value="Otro">❓ Otro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Provincia</label>
                            <select
                                name="provincia"
                                value={formData.provincia}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-lg bg-slate-50 focus:border-blue-500 outline-none text-sm font-semibold"
                            >
                                {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título Breve</label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ej: Deslave en km 45"
                            required
                            className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-sm font-bold"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Detalles adicionales..."
                            required
                            className="w-full p-3 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-sm min-h-[80px]"
                            maxLength={200}
                        ></textarea>
                    </div>

                    {/* Ubicación */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ubicación (GPS)</label>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleGetLocation}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${locationStatus === 'success'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100'
                                    }`}
                            >
                                <MapPin size={16} />
                                {locationStatus === 'loading' ? 'Obteniendo...' :
                                    locationStatus === 'success' ? 'Ubicación Detectada' : 'Usar mi ubicación actual'}
                            </button>
                            {/* Lat/Lng hidden but handy for debug if needed */}
                            {locationStatus === 'success' && (
                                <span className="text-xs text-slate-400 tabular-nums">
                                    {formData.latitud.toFixed(4)}, {formData.longitud.toFixed(4)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold shadow-lg shadow-blue-500/30 transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                                }`}
                        >
                            <Send size={16} />
                            {loading ? 'Enviando...' : 'Publicar Reporte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
