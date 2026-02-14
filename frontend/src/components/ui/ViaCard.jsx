import React, { useState } from 'react';
import {
    MapPin, AlertTriangle, CheckCircle, Clock, Ban,
    Signpost, ThumbsUp, MessageSquare, AlertCircle
} from 'lucide-react';

const ViaCard = ({ via }) => {
    // Estado para los votos (simulando interacción social)
    const [votes, setVotes] = useState(Math.floor(Math.random() * 15));
    const [hasVoted, setHasVoted] = useState(false);

    // Configuración de estilos profesionales
    const getStatusConfig = (codigo) => {
        switch (codigo) {
            case 'CERRADA':
                return {
                    border: 'border-l-red-600',
                    badge: 'bg-red-50 text-red-700 border-red-100',
                    icon: <Ban size={14} />,
                    light: 'bg-red-50/30'
                };
            case 'PARCIAL':
                return {
                    border: 'border-l-amber-500',
                    badge: 'bg-amber-50 text-amber-700 border-amber-100',
                    icon: <AlertTriangle size={14} />,
                    light: 'bg-amber-50/30'
                };
            default:
                return {
                    border: 'border-l-emerald-500',
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    icon: <CheckCircle size={14} />,
                    light: 'bg-emerald-50/30'
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
        <div className="group relative bg-white/70 backdrop-blur-xl rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-white/80 p-1 hover:-translate-y-2">
            <div className={`rounded-[22px] overflow-hidden border-l-[6px] ${config.border} h-full flex flex-col`}>

                {/* Header con Efecto Glass */}
                <div className={`px-5 py-4 flex justify-between items-center ${config.light}`}>
                    <div className="flex items-center gap-2">
                        <div className="bg-white/80 p-1.5 rounded-lg shadow-sm">
                            <MapPin size={14} className="text-slate-500" />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            {via.provincia}
                        </span>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${config.badge}`}>
                        {config.icon}
                        {via.estado_codigo}
                    </span>
                </div>

                {/* Contenido Principal */}
                <div className="p-6 flex-grow bg-white/40">
                    <h3 className="text-lg font-extrabold text-slate-800 leading-tight mb-3 group-hover:text-blue-600 transition-colors">
                        {via.nombre_via}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                        {via.observaciones}
                    </p>

                    {/* Vía Alterna con Diseño de Señalética */}
                    {hasAlterna && (
                        <div className="relative mt-2 p-4 bg-slate-900 rounded-2xl border-b-4 border-blue-500 shadow-lg">
                            <div className="absolute -top-3 right-4 bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                Desvío Sugerido
                            </div>
                            <div className="flex gap-3">
                                <Signpost className="text-blue-400 shrink-0" size={20} />
                                <p className="text-xs font-bold text-slate-100 leading-snug">
                                    {via.via_alterna}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Social */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-5">
                        <button
                            onClick={handleVote}
                            className={`flex items-center gap-1.5 text-[11px] font-bold transition-all ${hasVoted ? 'text-green-600' : 'text-slate-400 hover:text-green-500'}`}
                        >
                            <ThumbsUp size={14} fill={hasVoted ? "currentColor" : "none"} />
                            {votes}
                        </button>
                        <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-blue-500 transition-all">
                            <MessageSquare size={14} />
                            COMENTAR
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-400">
                            <Clock size={10} />
                            {via.fecha_actualizacion.split(' ')[1]}
                        </div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ViaCard;