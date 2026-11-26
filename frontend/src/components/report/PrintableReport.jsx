import React, { useMemo } from 'react';

const STATUS_LABELS = {
    CERRADA: 'Cerrada',
    PARCIAL: 'Paso controlado',
    HABILITADA: 'Habilitada',
    REPORTE: 'Reporte ciudadano',
};

const formatDate = (value, fallback = 'Sin fecha reportada') => {
    if (!value) return fallback;
    const date = value instanceof Date || typeof value === 'number'
        ? new Date(value)
        : new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

const getFilterSummary = (filters = {}) => {
    const activeFilters = [];
    if (filters.filterEstado !== 'TODAS') activeFilters.push(`Estado: ${STATUS_LABELS[filters.filterEstado] || filters.filterEstado}`);
    if (filters.filterProvincia !== 'TODAS') activeFilters.push(`Provincia: ${filters.filterProvincia}`);
    if (filters.searchTerm?.trim()) activeFilters.push(`Búsqueda: "${filters.searchTerm.trim()}"`);
    return activeFilters.length > 0 ? activeFilters.join(' - ') : 'Todos los registros disponibles';
};

export const PrintableReport = ({ roads = [], filters, updatedAt }) => {
    const generatedAt = new Date();
    const summary = useMemo(() => {
        const provinceCounts = roads.reduce((counts, road) => {
            const province = road.provincia || 'Sin provincia';
            counts[province] = (counts[province] || 0) + 1;
            return counts;
        }, {});
        const cerradas = roads.filter((road) => road.estado_codigo === 'CERRADA').length;
        const parciales = roads.filter((road) => road.estado_codigo === 'PARCIAL').length;
        const habilitadas = roads.filter((road) => road.estado_codigo === 'HABILITADA').length;
        const comunidad = roads.filter((road) => road.isUserReport).length;

        return {
            total: roads.length,
            cerradas,
            parciales,
            habilitadas,
            comunidad,
            oficiales: roads.length - comunidad,
            atencion: cerradas + parciales,
            provincias: Object.keys(provinceCounts).length,
            topProvinces: Object.entries(provinceCounts)
                .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
                .slice(0, 5),
        };
    }, [roads]);
    const reportCode = `VEC-${generatedAt.toISOString().slice(0, 10).replaceAll('-', '')}-${String(summary.total).padStart(3, '0')}`;
    const attentionRate = summary.total > 0 ? Math.round((summary.atencion / summary.total) * 100) : 0;
    const statusRows = [
        { key: 'cerradas', label: 'Cierres totales', value: summary.cerradas, tone: 'danger' },
        { key: 'parciales', label: 'Paso controlado', value: summary.parciales, tone: 'warning' },
        { key: 'habilitadas', label: 'Vías habilitadas', value: summary.habilitadas, tone: 'success' },
        { key: 'comunidad', label: 'Reportes ciudadanos', value: summary.comunidad, tone: 'info' },
    ];

    return (
        <section className="print-report" aria-label="Reporte vial detallado para impresión">
            <section className="print-report__cover">
                <header className="print-report__brandbar">
                    <img src="/brand/logo-horizontal.png" alt="Vialert-EC" />
                    <div className="print-report__document-id">
                        <span>Informe operativo</span>
                        <strong>{reportCode}</strong>
                    </div>
                </header>

                <div className="print-report__titleblock">
                    <p className="print-report__eyebrow">Monitor nacional de condiciones viales</p>
                    <h1>Informe situacional<br />de la red vial</h1>
                    <p className="print-report__subtitle">
                        Consolidado ejecutivo y detalle de novedades reportadas para la planificación de desplazamientos.
                    </p>
                    <div className="print-report__cutoff">
                        <span>Corte de información</span>
                        <strong>{formatDate(updatedAt, 'Pendiente de actualización')}</strong>
                    </div>
                </div>

                <section className="print-report__executive-summary">
                    <div>
                        <p className="print-report__section-label">Resumen ejecutivo</p>
                        <h2>
                            {summary.atencion} registros requieren seguimiento operativo en {summary.provincias} provincias.
                        </h2>
                        <p>
                            El consolidado contiene {summary.cerradas} cierres totales y {summary.parciales} sectores con paso controlado.
                            Estos representan el {attentionRate}% de los registros incluidos en este corte.
                        </p>
                    </div>
                    <div className="print-report__attention-index">
                        <strong>{attentionRate}%</strong>
                        <span>con afectación<br />o restricción</span>
                    </div>
                </section>

                <div className="print-report__stats" aria-label="Indicadores principales">
                    <div><span>Registros analizados</span><strong>{summary.total}</strong></div>
                    <div><span>Cierres totales</span><strong>{summary.cerradas}</strong></div>
                    <div><span>Pasos controlados</span><strong>{summary.parciales}</strong></div>
                    <div><span>Provincias incluidas</span><strong>{summary.provincias}</strong></div>
                </div>

                <div className="print-report__analysis-grid">
                    <section className="print-report__panel">
                        <p className="print-report__section-label">Distribución por condición</p>
                        <div className="print-report__distribution">
                            {statusRows.map((row) => {
                                const percentage = summary.total > 0 ? Math.round((row.value / summary.total) * 100) : 0;
                                return (
                                    <div key={row.key} className="print-report__distribution-row">
                                        <div><span>{row.label}</span><strong>{row.value}</strong></div>
                                        <div className="print-report__bar"><i className={`print-report__bar-fill print-report__bar-fill--${row.tone}`} style={{ width: `${percentage}%` }} /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="print-report__panel">
                        <p className="print-report__section-label">Mayor concentración territorial</p>
                        <ol className="print-report__province-ranking">
                            {summary.topProvinces.map(([province, count], index) => (
                                <li key={province}>
                                    <span><i>{index + 1}</i>{province}</span>
                                    <strong>{count} {count === 1 ? 'registro' : 'registros'}</strong>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                <section className="print-report__document-sheet">
                    <p className="print-report__section-label">Ficha del documento</p>
                    <dl>
                        <div><dt>Fecha de emisión</dt><dd>{formatDate(generatedAt)}</dd></div>
                        <div><dt>Alcance aplicado</dt><dd>{getFilterSummary(filters)}</dd></div>
                        <div><dt>Fuentes incluidas</dt><dd>ECU 911 ({summary.oficiales}){summary.comunidad > 0 ? ` y comunidad (${summary.comunidad})` : ''}</dd></div>
                        <div><dt>Generación</dt><dd>Local, mediante el navegador del usuario</dd></div>
                    </dl>
                </section>

                <aside className="print-report__method-note">
                    <strong>Nota de interpretación.</strong> La ubicación de registros oficiales puede ser referencial por cantón o provincia cuando la fuente no publica coordenadas. Este informe apoya la consulta preventiva y no sustituye disposiciones de las autoridades competentes.
                </aside>

                <footer className="print-report__cover-footer">
                    <span>Vialert-EC</span>
                    <span>Monitoreo vial en tiempo real</span>
                    <span>Uso informativo</span>
                </footer>
            </section>

            <section className="print-report__detail-section">
                <header className="print-report__detail-header">
                    <div>
                        <p className="print-report__eyebrow">Anexo operativo</p>
                        <h2>Detalle de novedades viales</h2>
                        <p>{summary.total} registros ordenados según la actualización recibida.</p>
                    </div>
                    <div>
                        <span>Documento</span>
                        <strong>{reportCode}</strong>
                    </div>
                </header>

                <div className="print-report__list">
                    {roads.map((road, index) => {
                        const hasAlternateRoute = road.via_alterna && road.via_alterna !== 'N/A';
                        return (
                            <article key={road.id} className={`print-road print-road--${String(road.estado_codigo || 'HABILITADA').toLowerCase()}`}>
                                <div className="print-road__heading">
                                    <span className="print-road__number">{index + 1}</span>
                                    <div>
                                        <p className="print-road__location">
                                            {road.provincia || 'Provincia no especificada'}{road.canton ? ` - ${road.canton}` : ''}
                                        </p>
                                        <h3>{road.nombre_via || 'Vía sin nombre'}</h3>
                                    </div>
                                    <span className="print-road__status">{STATUS_LABELS[road.estado_codigo] || road.estado_texto || 'Sin estado'}</span>
                                </div>

                                {road.estado_texto && road.estado_texto !== road.estado_codigo && (
                                    <p className="print-road__condition"><strong>Condición:</strong> {road.estado_texto}</p>
                                )}
                                <p><strong>Detalle:</strong> {road.observaciones || 'Sin observaciones adicionales.'}</p>
                                {hasAlternateRoute && <p><strong>Ruta alterna:</strong> {road.via_alterna}</p>}

                                <footer>
                                    <span>Fuente: {road.isUserReport ? 'Comunidad' : 'ECU 911'}</span>
                                    <span>Actualización: {formatDate(road.fecha_actualizacion)}</span>
                                </footer>
                            </article>
                        );
                    })}
                </div>

                <footer className="print-report__footer">
                    <strong>Advertencia de uso</strong>
                    <p>Las condiciones viales pueden cambiar sin previo aviso. Confirma la información con fuentes oficiales antes de iniciar un desplazamiento.</p>
                    <p>Documento generado localmente desde el navegador; no fue creado ni almacenado en el servidor.</p>
                </footer>
            </section>
        </section>
    );
};
