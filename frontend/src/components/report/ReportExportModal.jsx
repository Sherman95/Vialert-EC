import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Download,
    FileChartColumn,
    LoaderCircle,
    ShieldAlert,
    UsersRound,
    X,
} from 'lucide-react';
import { processReportData } from '../../utils/reportDataProcessor';
import { createReportAssets, exportReportElement } from '../../utils/pdfReportExporter';
import { PdfReportDocument, formatCutoff } from './PdfReportDocument';
import './report-export.css';

const THEMES = [
    {
        id: 'coe',
        title: 'Ejecutivo / Sala de crisis',
        description: 'Dashboard gerencial, auditoría de datos, alertas críticas y matriz operativa.',
        audience: 'COE y autoridades',
        orientation: 'A4 vertical',
        icon: ShieldAlert,
        tone: 'red',
    },
    {
        id: 'ciudadano',
        title: 'Boletín ciudadano',
        description: 'Rutas cerradas, desvíos, restricciones de carga y lectura sencilla por provincia.',
        audience: 'Prensa y transportistas',
        orientation: 'A4 vertical',
        icon: UsersRound,
        tone: 'green',
    },
    {
        id: 'tecnico',
        title: 'Bitácora técnica',
        description: 'Tabla de alta densidad en blanco y negro, optimizada para impresión de campo.',
        audience: 'Personal operativo',
        orientation: 'A4 horizontal',
        icon: ClipboardList,
        tone: 'slate',
    },
];

const waitForRender = () => new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
});

export const ReportExportModal = ({
    isOpen,
    onClose,
    roads,
    updatedAt,
    onGeneratingChange,
}) => {
    const [selectedTheme, setSelectedTheme] = useState('coe');
    const [isGenerating, setIsGenerating] = useState(false);
    const [assets, setAssets] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const reportRef = useRef(null);
    const reportData = useMemo(() => processReportData(roads), [roads]);

    useEffect(() => {
        onGeneratingChange?.(isGenerating);
    }, [isGenerating, onGeneratingChange]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isGenerating) onClose();
        };
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isGenerating, isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setError('');
            setSuccess(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const generateReport = async () => {
        setIsGenerating(true);
        setError('');
        setSuccess(null);

        try {
            const generatedAssets = await createReportAssets(reportData);
            setAssets(generatedAssets);
            await document.fonts?.ready;
            await waitForRender();

            if (!reportRef.current) throw new Error('No fue posible preparar el contenido del reporte.');
            const result = await exportReportElement({
                element: reportRef.current,
                theme: selectedTheme,
                qrDataUrl: generatedAssets.qrDataUrl,
                cutoffLabel: formatCutoff(updatedAt),
            });
            setSuccess(result);
        } catch (generationError) {
            console.error('No se pudo generar el reporte PDF:', generationError);
            setError(generationError.message || 'No fue posible generar el PDF. Inténtalo nuevamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation">
            <section
                className="max-h-[94dvh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby="report-export-title"
            >
                <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
                    <div className="flex min-w-0 gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-primary">
                            <FileChartColumn size={22} aria-hidden="true" />
                        </span>
                        <div>
                            <h2 id="report-export-title" className="text-lg font-extrabold text-slate-950 sm:text-xl">Descargar reporte vial</h2>
                            <p className="mt-1 text-sm leading-5 text-slate-600">Elige el formato según quién recibirá el informe.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isGenerating}
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
                        aria-label="Cerrar selector de reportes"
                    >
                        <X size={21} aria-hidden="true" />
                    </button>
                </header>

                <div className="p-5 sm:p-6">
                    <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-4">
                        <div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Registros</span><strong className="mt-1 block text-lg text-slate-900">{reportData.stats.total}</strong></div>
                        <div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Cerradas</span><strong className="mt-1 block text-lg text-red-700">{reportData.stats.closed}</strong></div>
                        <div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Restricción</span><strong className="mt-1 block text-lg text-amber-700">{reportData.stats.restricted}</strong></div>
                        <div><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Corte</span><strong className="mt-1 block text-sm text-slate-900">{formatCutoff(updatedAt)}</strong></div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3" role="radiogroup" aria-label="Diseño del reporte PDF">
                        {THEMES.map((theme) => {
                            const Icon = theme.icon;
                            const selected = selectedTheme === theme.id;
                            return (
                                <button
                                    key={theme.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => {
                                        setSelectedTheme(theme.id);
                                        setSuccess(null);
                                        setError('');
                                    }}
                                    disabled={isGenerating}
                                    className={`report-theme-option report-theme-option--${theme.tone} ${selected ? 'report-theme-option--selected' : ''}`}
                                >
                                    <span className="report-theme-option__top">
                                        <span className="report-theme-option__icon"><Icon size={21} aria-hidden="true" /></span>
                                        <span className="report-theme-option__check">{selected && <CheckCircle2 size={19} aria-hidden="true" />}</span>
                                    </span>
                                    <strong>{theme.title}</strong>
                                    <span className="report-theme-option__description">{theme.description}</span>
                                    <span className="report-theme-option__meta"><i>{theme.audience}</i><i>{theme.orientation}</i></span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-5 text-blue-950">
                        <Download size={18} className="mt-0.5 shrink-0 text-brand-primary" aria-hidden="true" />
                        <p><strong>Generación privada:</strong> los datos se procesan en este dispositivo. El archivo no se envía ni se almacena en el servidor.</p>
                    </div>

                    {error && (
                        <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900" role="alert">
                            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mt-4 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900" role="status">
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <p><strong>Reporte descargado.</strong> {success.pages} páginas generadas en formato PDF.</p>
                        </div>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isGenerating}
                            className="min-h-11 rounded-lg border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={generateReport}
                            disabled={isGenerating || reportData.stats.total === 0}
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#164b68] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isGenerating ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <Download size={19} aria-hidden="true" />}
                            {isGenerating ? 'Generando PDF...' : 'Descargar reporte'}
                        </button>
                    </div>
                </div>
            </section>

            {assets && (
                <div className={`pdf-export-stage ${selectedTheme === 'tecnico' ? 'pdf-export-stage--landscape' : ''}`} aria-hidden="true">
                    <PdfReportDocument
                        ref={reportRef}
                        theme={selectedTheme}
                        data={reportData}
                        assets={assets}
                        updatedAt={updatedAt}
                    />
                </div>
            )}
        </div>
    );
};
