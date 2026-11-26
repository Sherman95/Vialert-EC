import React from 'react';
import { Route, Ban, TriangleAlert, CircleCheck } from 'lucide-react';

const items = [
    { key: 'total', label: 'Registros', icon: Route, tone: 'text-slate-700', surface: 'bg-slate-100' },
    { key: 'cerradas', label: 'Cerradas', icon: Ban, tone: 'text-red-700', surface: 'bg-red-50' },
    { key: 'parciales', label: 'Controladas', icon: TriangleAlert, tone: 'text-amber-700', surface: 'bg-amber-50' },
    { key: 'habilitadas', label: 'Habilitadas', icon: CircleCheck, tone: 'text-emerald-700', surface: 'bg-emerald-50' },
];

export const StatsGrid = ({ stats }) => (
    <section aria-label="Resumen de condiciones viales" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((item) => (
            <div key={item.key} className="min-w-0 rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-md ${item.surface} ${item.tone}`}>
                    {React.createElement(item.icon, { size: 16, strokeWidth: 2.25, 'aria-hidden': true })}
                </div>
                <p className={`text-xl font-extrabold leading-none tabular-nums ${item.tone}`}>
                    {stats[item.key] ?? 0}
                </p>
                <p className="mt-1 truncate text-[0.72rem] font-semibold text-slate-500 sm:text-xs">
                    {item.label}
                </p>
            </div>
        ))}
    </section>
);
