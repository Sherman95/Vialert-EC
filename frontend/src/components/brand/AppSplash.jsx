import React, { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

export const AppSplash = ({ active }) => {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!active) return undefined;
        const timer = window.setTimeout(() => setTimedOut(true), 5000);
        return () => window.clearTimeout(timer);
    }, [active]);

    if (!active || timedOut) return null;

    return (
        <div className="app-splash" role="status" aria-live="polite" aria-label="Cargando información vial">
            <div className="app-splash__glow" />
            <div className="app-splash__content">
                <BrandLogo variant="isotype" className="app-splash__mark" priority />
                <p className="app-splash__name">Vialert-EC</p>
                <p className="app-splash__tagline">Monitoreo vial en tiempo real</p>
                <span className="app-splash__tricolor" aria-hidden="true" />
                <span className="app-splash__loader" aria-hidden="true" />
                <span className="sr-only">Conectando con la fuente oficial del ECU 911</span>
            </div>
            <div className="app-splash__mountains" aria-hidden="true">
                <i /><i /><i />
            </div>
            <svg className="app-splash__road" viewBox="0 0 500 300" aria-hidden="true">
                <path d="M520 320C390 260 330 242 287 183C250 132 248 80 260 18" />
                <path className="app-splash__road-line" d="M520 320C390 260 330 242 287 183C250 132 248 80 260 18" />
            </svg>
        </div>
    );
};
