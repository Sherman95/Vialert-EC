import React from 'react';
// Importamos desde assets para que Vite lo procese con Hash de seguridad
import appIcon from '../../assets/icon.jpg';

const AppLogo = ({ className = "w-10 h-10" }) => {
    return (
        <div className={`relative ${className} group`}>
            {/* Glow dinámico de fondo */}
            <div className="absolute inset-0 bg-blue-600/20 blur-lg rounded-xl group-hover:bg-blue-600/40 transition-all duration-500"></div>

            {/* Contenedor Cuadrado con Bordes Suaves (Estilo App) */}
            <div className="relative h-full aspect-square overflow-hidden rounded-xl border border-white/40 shadow-sm transition-transform duration-300 group-hover:scale-110">
                <img
                    src={appIcon}
                    alt="Vialert EC"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default AppLogo;