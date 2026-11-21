import React from 'react';
// Importamos desde assets para que Vite lo procese con Hash de seguridad
import appIcon from '../../assets/icon.jpg';

const AppLogo = ({ className = "w-10 h-10" }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="relative h-full aspect-square overflow-hidden rounded-lg border border-white/20 bg-slate-800 shadow-sm">
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
