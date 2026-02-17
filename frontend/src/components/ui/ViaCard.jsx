import React, { useState } from 'react';
import {
    MapPin, AlertTriangle, CheckCircle, Clock, Ban,
    Signpost, ThumbsUp, MessageSquare, AlertCircle
} from 'lucide-react';

const ViaCard = ({ via }) => {
    // Estado para los votos (simulando interacción social)
    const [votes, setVotes] = useState(Math.floor(Math.random() * 15));
    const [hasVoted, setHasVoted] = useState(false);

    // Configuración de estilos profesionales y contrastes
    const getStatusConfig = (codigo) => {
        switch (codigo) {
            case 'CERRADA':
                return {
                    border: 'border-l-red-600',

                    // Header Background (stronger contrast)
                    headerBg: 'bg-red-50',

                    // Badge (Solid for high visibility)
                    badge: 'bg-red-600 text-white border-red-700 shadow-sm',

                    // Icon color
                    iconColor: 'text-red-600',

                    // Ping color
                    pingColor: 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]'
                };
            case 'PARCIAL':
                return {
                    border: 'border-l-amber-500',
                    headerBg: 'bg-amber-50',
                    badge: 'bg-amber-500 text-white border-amber-600 shadow-sm',
                    iconColor: 'text-amber-500',
                    pingColor: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                };
            case 'REPORTE':
                return {
                    border: 'border-l-purple-600',
                    headerBg: 'bg-purple-50',
                    badge: 'bg-purple-600 text-white border-purple-700 shadow-sm',
                    iconColor: 'text-purple-600',
                    pingColor: 'bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.6)]'
                };
            default:
                return {
                    border: 'border-l-emerald-500',
                    headerBg: 'bg-emerald-50',
                    badge: 'bg-emerald-500 text-white border-emerald-600 shadow-sm',
                    iconColor: 'text-emerald-500',
                    pingColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                };
        }
    };

    const config = getStatusConfig(via.estado_codigo);
    const hasAlterna = via.via_alterna && via.via_alterna !== "N/A";

    const handleVote = () => {
        if (!hasVoted) {
            setVotes(prev => prev + 1);
            setHasVoted(true);
        }
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 overflow-hidden hover:-translate-y-1">
            <div className={`border-l-[4px] ${config.border} h-full flex flex-col`}>

                {/* Header Compacto - Con fondo de color tenue para separar áreas */}
                <div className={`px-4 py-3 flex justify-between items-center ${config.headerBg} border-b border-slate-100/50`}>
                    <div className="flex items-center gap-2">
                        {/* Tag de Provincia con alto contraste */}
                        <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-wide uppercase">
                            {via.provincia}
                        </span>

                        {via.isUserReport && (
                            <span className="bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-purple-200">
                                📢 Ciudadano
                            </span>
                        )}
                    </div>
                    {/* Badge de Estado Sólido */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold ${config.badge}`}>
                        {/* Icono dinámico según estado */}
                        {via.estado_codigo === 'CERRADA' && <Ban size={12} strokeWidth={3} />}
                        {via.estado_codigo === 'PARCIAL' && <AlertTriangle size={12} strokeWidth={3} />}
                        {via.estado_codigo === 'Agendado' && <Clock size={12} strokeWidth={3} />}
                        {!['CERRADA', 'PARCIAL', 'Agendado'].includes(via.estado_codigo) && <CheckCircle size={12} strokeWidth={3} />}
                        {via.estado_codigo}
                    </span>
                </div>

                {/* Contenido Principal */}
                <div className="p-4 flex-grow bg-gradient-to-b from-white to-slate-50/30">
                    <h3 className="text-[15px] font-extrabold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {via.nombre_via}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium line-clamp-3">
                        {via.observaciones}
                    </p>

                    {/* Vía Alterna Destacada */}
                    {hasAlterna && (
                        <div className="relative mt-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                            <div className="flex gap-2 items-start">
                                <Signpost className="text-blue-600 shrink-0 mt-0.5" size={14} />
                                <div>
                                    <span className="text-[9px] font-black text-blue-700 uppercase mb-0.5 block tracking-wide">Ruta Alterna</span>
                                    <p className="text-[11px] font-bold text-slate-700 leading-tight">
                                        {via.via_alterna}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Social Compacto */}
                <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={handleVote}
                            className={`flex items-center gap-1 text-[10px] font-bold transition-all p-1 rounded hover:bg-slate-50 ${hasVoted ? 'text-green-600' : 'text-slate-400 hover:text-green-500'}`}
                        >
                            <ThumbsUp size={12} fill={hasVoted ? "currentColor" : "none"} />
                            {votes}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                            <Clock size={10} />
                            {via.fecha_actualizacion.split(' ')[1]}
                        </div>
                        {/* Ping del color del estado */}
                        <div className={`w-2 h-2 rounded-full animate-pulse ${config.pingColor}`}></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViaCard;