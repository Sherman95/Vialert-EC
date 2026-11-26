import React, { forwardRef } from 'react';
import { cleanTechnicalObservation, splitCriticalText } from '../../utils/reportDataProcessor';

const formatCutoff = (value) => {
    const date = value ? new Date(value) : new Date();
    const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
    return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(safeDate);
};

const HighlightedText = ({ children }) => (
    <>
        {splitCriticalText(children).map((segment, index) => (
            segment.strong
                ? <strong key={`${segment.text}-${index}`}>{segment.text}</strong>
                : <React.Fragment key={`${segment.text}-${index}`}>{segment.text}</React.Fragment>
        ))}
    </>
);

const StatePill = ({ record }) => (
    <span className={`pdf-state pdf-state--${record.normalizedState.toLowerCase()}`}>
        {record.stateLabel}
    </span>
);

const BrandMark = () => (
    <img className="pdf-brand-logo" src="/brand/logo-horizontal.png" alt="Vialert-EC" />
);

const CoeReport = ({ data, assets, cutoff }) => (
    <>
        <header className="pdf-coe-header pdf-avoid-break">
            <div>
                <span>Vialert-EC | Sala de crisis</span>
                <h1>REPORTE EJECUTIVO DE ESTADO VIAL NACIONAL</h1>
            </div>
            <div className="pdf-coe-cutoff">
                <span>Fecha y hora de corte</span>
                <strong>{cutoff}</strong>
            </div>
        </header>

        <section className="pdf-kpi-grid pdf-avoid-break" aria-label="Indicadores ejecutivos">
            <article className="pdf-kpi pdf-kpi--danger"><span>Total vías cerradas</span><strong>{data.stats.closed}</strong></article>
            <article className="pdf-kpi pdf-kpi--warning"><span>Con restricción vehicular</span><strong>{data.stats.restricted}</strong></article>
            <article className="pdf-kpi pdf-kpi--info"><span>Parcialmente habilitadas</span><strong>{data.stats.partial}</strong></article>
            <article className="pdf-kpi pdf-kpi--neutral"><span>Causa dominante</span><strong>{data.stats.dominantCausePercentage}%</strong><small>{data.stats.dominantCause}</small></article>
        </section>

        <section className="pdf-coe-analysis pdf-avoid-break">
            <article className="pdf-panel">
                <div className="pdf-section-heading">
                    <span>Análisis territorial</span>
                    <h2>Provincias con más vías afectadas</h2>
                </div>
                {assets.chartDataUrl && <img className="pdf-province-chart" src={assets.chartDataUrl} alt="Gráfico de vías afectadas por provincia" />}
            </article>
            <article className="pdf-audit-panel">
                <div className="pdf-section-heading">
                    <span>Control de calidad</span>
                    <h2>Auditoría de datos</h2>
                </div>
                {data.inconsistencies.length > 0 ? (
                    <ul>
                        {data.inconsistencies.map((record) => (
                            <li key={record.id}>
                                <strong>{record.roadName}</strong>
                                <span>{record.province}: {record.auditNote}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="pdf-audit-ok"><strong>Sin inconsistencias detectadas</strong><span>El estado estructurado coincide con el texto revisado.</span></div>
                )}
            </article>
        </section>

        <section className="pdf-closed-section">
            <div className="pdf-section-heading">
                <span>Atención prioritaria</span>
                <h2>Vías cerradas y alternativas registradas</h2>
            </div>
            {data.closed.length > 0 ? (
                <div className="pdf-closed-grid">
                    {data.closed.map((record) => (
                        <article key={record.id} className="pdf-closed-card pdf-avoid-break">
                            <div className="pdf-closed-card__top">
                                <div><strong>{record.roadName}</strong><span>{record.province}{record.canton ? ` - ${record.canton}` : ''}</span></div>
                                <em>{record.cause}</em>
                            </div>
                            <p><HighlightedText>{record.observation}</HighlightedText></p>
                            <div className={record.alternateRoad ? 'pdf-alternate' : 'pdf-alternate pdf-alternate--empty'}>
                                <strong>Vía alterna:</strong> {record.alternateRoad || 'Sin vía alterna registrada'}
                            </div>
                        </article>
                    ))}
                </div>
            ) : <p className="pdf-empty">No existen cierres totales dentro de los filtros aplicados.</p>}
        </section>

        <section className="pdf-matrix-section">
            <div className="pdf-section-heading">
                <span>Matriz operativa</span>
                <h2>Consolidado nacional agrupado por provincia</h2>
            </div>
            <table className="pdf-table pdf-table--coe">
                <thead><tr><th>Vía / sector</th><th>Estado</th><th>Causa</th><th>Punto / Km</th><th>Observaciones</th><th>Vía alterna</th></tr></thead>
                <tbody>
                    {data.groupedByProvince.map(([province, records]) => (
                        <React.Fragment key={province}>
                            <tr className="pdf-province-row"><th colSpan="6">{province} <span>{records.length} {records.length === 1 ? 'novedad' : 'novedades'}</span></th></tr>
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td><strong>{record.roadName}</strong>{record.canton && <small>{record.canton}</small>}</td>
                                    <td><StatePill record={record} /></td>
                                    <td>{record.cause}</td>
                                    <td className="pdf-km">{record.kilometerLabel}</td>
                                    <td><HighlightedText>{record.observation}</HighlightedText></td>
                                    <td>{record.alternateRoad || 'No registrada'}</td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </section>
    </>
);

const CitizenReport = ({ data, assets, cutoff }) => (
    <>
        <header className="pdf-citizen-header pdf-avoid-break">
            <div>
                <BrandMark />
                <span>Información práctica para viajar</span>
                <h1>GUÍA DE ESTADO VIAL Y RUTAS ALTERNAS</h1>
                <p>Corte informativo: {cutoff}</p>
            </div>
            <div className="pdf-header-qr">
                <img src={assets.qrDataUrl} alt="QR para consultar el estado vial en vivo" />
                <strong>Escanea para ver<br />el estado en vivo</strong>
            </div>
        </header>

        <section className="pdf-citizen-section">
            <div className="pdf-section-heading pdf-section-heading--citizen">
                <span>Prioridad para el viajero</span>
                <h2>Rutas cerradas y desvíos</h2>
            </div>
            {data.closed.length > 0 ? data.closed.map((record) => (
                <article key={record.id} className="pdf-detour-card pdf-avoid-break">
                    <div className="pdf-detour-card__closed">
                        <span>VÍA CERRADA</span>
                        <strong>{record.roadName}</strong>
                        <p>{record.province}{record.canton ? ` - ${record.canton}` : ''}</p>
                        <small>{record.kilometerLabel}</small>
                    </div>
                    <div className="pdf-detour-card__alternate">
                        <span>RUTA ALTERNA</span>
                        <strong>{record.alternateRoad || 'Sin desvío oficial registrado'}</strong>
                        <p>{record.alternateRoad ? 'Planifica el recorrido antes de salir.' : 'Consulta a las autoridades locales antes de continuar.'}</p>
                    </div>
                </article>
            )) : <p className="pdf-empty">No hay vías cerradas dentro de los filtros seleccionados.</p>}
        </section>

        <section className="pdf-load-restrictions pdf-avoid-break">
            <div className="pdf-section-heading pdf-section-heading--citizen">
                <span>Transporte y carga</span>
                <h2>Restricciones para transporte pesado y buses</h2>
            </div>
            {data.loadRestricted.length > 0 ? (
                <ul>
                    {data.loadRestricted.map((record) => (
                        <li key={record.id}>
                            <strong>{record.roadName} - {record.province}</strong>
                            <p><HighlightedText>{record.observation}</HighlightedText></p>
                        </li>
                    ))}
                </ul>
            ) : <p>No se encontraron restricciones específicas por tipo de vehículo.</p>}
        </section>

        <section className="pdf-page-break pdf-citizen-provinces">
            <div className="pdf-section-heading pdf-section-heading--citizen">
                <span>Consulta territorial</span>
                <h2>Resumen por provincia</h2>
            </div>
            {data.groupedByProvince.map(([province, records]) => (
                <article key={province} className="pdf-citizen-province pdf-avoid-break">
                    <header><h3>{province}</h3><span>{records.length} {records.length === 1 ? 'novedad' : 'novedades'}</span></header>
                    <div>
                        {records.map((record) => (
                            <section key={record.id}>
                                <div><strong>{record.roadName}</strong><StatePill record={record} /></div>
                                <p><HighlightedText>{record.observation}</HighlightedText></p>
                                {record.alternateRoad && <small><strong>Alternativa:</strong> {record.alternateRoad}</small>}
                            </section>
                        ))}
                    </div>
                </article>
            ))}
        </section>
    </>
);

const TechnicalReport = ({ data, cutoff }) => (
    <>
        <header className="pdf-technical-header pdf-avoid-break">
            <div><strong>BITÁCORA TÉCNICA DE ESTADO VIAL NACIONAL</strong><span>CORTE: {cutoff}</span></div>
            <p>
                TOTAL: {data.stats.total} | CERRADAS: {data.stats.closed} | RESTRICCIÓN: {data.stats.restricted} | PARCIALES: {data.stats.partial} | CAUSA PRINCIPAL: {data.stats.dominantCause.toUpperCase()}
            </p>
        </header>

        {data.inconsistencies.length > 0 && (
            <aside className="pdf-technical-audit pdf-avoid-break">
                <strong>CONTROL DE CALIDAD:</strong> {data.inconsistencies.length} registro(s) reclasificado(s) como CERRADA (VERIFICAR) por contradicción entre estado y observación.
            </aside>
        )}

        <table className="pdf-table pdf-table--technical">
            <thead><tr><th>Provincia / Cantón</th><th>Vía / Eje</th><th>Estado</th><th>Punto / Km</th><th>Causa</th><th>Observaciones depuradas</th><th>Vía alterna</th></tr></thead>
            <tbody>
                {data.records.map((record) => (
                    <tr key={record.id} className={`pdf-technical-row pdf-technical-row--${record.normalizedState.toLowerCase()}`}>
                        <td><strong>{record.province}</strong>{record.canton && <small>{record.canton}</small>}</td>
                        <td><strong>{record.roadName}</strong></td>
                        <td><StatePill record={record} /></td>
                        <td className="pdf-km">{record.kilometerLabel}</td>
                        <td>{record.cause}</td>
                        <td>{cleanTechnicalObservation(record.observation)}</td>
                        <td>{record.alternateRoad || 'No registrada'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </>
);

export const PdfReportDocument = forwardRef(function PdfReportDocument({ theme, data, assets, updatedAt }, ref) {
    const cutoff = formatCutoff(updatedAt);

    return (
        <article ref={ref} className={`pdf-report pdf-report--${theme}`} data-pdf-theme={theme}>
            {theme === 'coe' && <CoeReport data={data} assets={assets} cutoff={cutoff} />}
            {theme === 'ciudadano' && <CitizenReport data={data} assets={assets} cutoff={cutoff} />}
            {theme === 'tecnico' && <TechnicalReport data={data} cutoff={cutoff} />}
        </article>
    );
});

export { formatCutoff };
