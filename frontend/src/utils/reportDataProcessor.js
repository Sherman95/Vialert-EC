const normalizeText = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const STATE_PRIORITY = {
    CERRADA: 1,
    CERRADA_VERIFICAR: 1,
    RESTRICCION: 2,
    PARCIAL: 3,
    REPORTE: 4,
    HABILITADA: 5,
};

const STATE_LABELS = {
    CERRADA: 'CERRADA',
    CERRADA_VERIFICAR: 'CERRADA (VERIFICAR)',
    RESTRICCION: 'HABILITADA CON RESTRICCIÓN VEHICULAR',
    PARCIAL: 'PARCIALMENTE HABILITADA',
    REPORTE: 'REPORTE CIUDADANO',
    HABILITADA: 'HABILITADA',
};

const CLOSED_OBSERVATION_PATTERN = /\b(?:VIA|VÍA)\s+CERRADA\b|\bCIERRE\s+TOTAL\b/i;
const LOAD_RESTRICTION_PATTERN = /TRANSPORTE\s+PESADO|VEH[IÍ]CULOS?\s+PESADOS?|PROHIBIDO[^.]{0,45}PESADO|SOLO\s+VEH[IÍ]CULOS?\s+LIVIANOS?|PASO[^.]{0,35}(?:BUSES?|LIVIANOS?)|RESTRICCI[ÓO]N[^.]{0,45}(?:PESO|CARGA|BUSES?)/i;
const KILOMETER_PATTERN = /\bKM(?:\.|:)?\s*\d+(?:[.,]\d+)?(?:\s*(?:AL|A|-)\s*(?:KM\s*)?\d+(?:[.,]\d+)?)?/gi;
const CRITICAL_DATA_PATTERN = /(\bKM(?:\.|:)?\s*\d+(?:[.,]\d+)?(?:\s*(?:AL|A|-)\s*(?:KM\s*)?\d+(?:[.,]\d+)?)?|\b\d+(?:[.,]\d+)?\s*(?:CENT[IÍ]METROS?|CM)\b|\bSOLO\s+VEH[IÍ]CULOS?\s+LIVIANOS?\b|\bPROHIBIDO\s+TRANSPORTE\s+PESADO\b|\bTRANSPORTE\s+PESADO\b)/gi;

const classifyState = (road) => {
    const stateText = normalizeText(road.estado_texto || road.estado || '');
    const stateCode = normalizeText(road.estado_codigo || '');

    if (stateCode === 'CERRADA' || stateText.includes('CERRADA')) return 'CERRADA';
    if (stateText.includes('RESTRICCION') || stateText.includes('HABILITADA CON')) return 'RESTRICCION';
    if (stateCode === 'PARCIAL' || stateText.includes('PARCIALMENTE')) return 'PARCIAL';
    if (stateCode === 'REPORTE' || road.isUserReport) return 'REPORTE';
    return 'HABILITADA';
};

const classifyCause = (observation) => {
    const text = normalizeText(observation);
    if (/DESLIZ|DERRUMBE|CAIDA DE (?:MATERIAL|ROCAS?|TIERRA)/.test(text)) return 'Deslizamiento';
    if (/SOCAV|PERDIDA DE (?:LA )?CALZADA|COLAPSO|HUNDIMIENTO/.test(text)) return 'Socavón / Pérdida de calzada';
    if (/INUND|AGUA SOBRE|DESBORD|CRECIENTE|ANEGAD/.test(text)) return 'Inundación';
    if (/ACCIDENTE|SINIESTRO|CHOQUE|COLISION|VOLCAMIENTO/.test(text)) return 'Siniestro de tránsito';
    return 'Mantenimiento / Otros';
};

const extractKilometers = (text) => {
    const matches = String(text || '').match(KILOMETER_PATTERN) || [];
    return [...new Set(matches.map((match) => match.replace(/\s+/g, ' ').trim().toUpperCase()))];
};

export const splitCriticalText = (text) => {
    const source = String(text || 'Sin observaciones registradas.');
    const segments = [];
    let cursor = 0;
    let match;
    const pattern = new RegExp(CRITICAL_DATA_PATTERN.source, 'gi');

    while ((match = pattern.exec(source)) !== null) {
        if (match.index > cursor) segments.push({ text: source.slice(cursor, match.index), strong: false });
        segments.push({ text: match[0], strong: true });
        cursor = match.index + match[0].length;
    }

    if (cursor < source.length) segments.push({ text: source.slice(cursor), strong: false });
    return segments.length > 0 ? segments : [{ text: source, strong: false }];
};

export const cleanTechnicalObservation = (text) => String(text || 'Sin observaciones registradas.')
    .replace(/[⚠⚠️]/gu, '')
    .replace(/\/{2,}/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const normalizeRoad = (road, index) => {
    const observation = String(road.observaciones || road.observation || '').trim();
    const originalState = classifyState(road);
    const inconsistency = originalState === 'PARCIAL' && CLOSED_OBSERVATION_PATTERN.test(observation);
    const normalizedState = inconsistency ? 'CERRADA_VERIFICAR' : originalState;
    const kilometers = extractKilometers(`${road.nombre_via || road.via || ''} ${observation}`);

    return {
        id: road.id || `road-${index}`,
        province: String(road.provincia || 'Sin provincia').trim(),
        canton: String(road.canton || '').trim(),
        roadName: String(road.nombre_via || road.via || 'Vía sin nombre').trim(),
        observation: observation || 'Sin observaciones registradas.',
        alternateRoad: road.via_alterna && road.via_alterna !== 'N/A' ? String(road.via_alterna).trim() : '',
        originalState,
        normalizedState,
        stateLabel: STATE_LABELS[normalizedState],
        priority: STATE_PRIORITY[normalizedState],
        inconsistency,
        auditNote: inconsistency
            ? 'El estado oficial indica parcialmente habilitada, pero la observación menciona cierre total.'
            : '',
        cause: classifyCause(observation),
        kilometers,
        kilometerLabel: kilometers.join(' / ') || 'No indicado',
        hasLoadRestriction: LOAD_RESTRICTION_PATTERN.test(observation),
        updatedAt: road.fecha_actualizacion || road.updatedAt || null,
        source: road.isUserReport ? 'Comunidad' : 'ECU 911',
    };
};

const countBy = (items, getKey) => items.reduce((result, item) => {
    const key = getKey(item);
    result[key] = (result[key] || 0) + 1;
    return result;
}, {});

export const processReportData = (roads = []) => {
    const records = roads
        .map(normalizeRoad)
        .sort((first, second) => (
            first.priority - second.priority ||
            first.province.localeCompare(second.province, 'es') ||
            first.roadName.localeCompare(second.roadName, 'es')
        ));
    const causeCounts = countBy(records, (record) => record.cause);
    const provinceCounts = countBy(records, (record) => record.province);
    const dominantCauseEntry = Object.entries(causeCounts)
        .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0] || ['Sin datos', 0];
    const groupedByProvince = Object.entries(records.reduce((groups, record) => {
        if (!groups[record.province]) groups[record.province] = [];
        groups[record.province].push(record);
        return groups;
    }, {})).sort(([firstProvince], [secondProvince]) => firstProvince.localeCompare(secondProvince, 'es'));

    return {
        records,
        closed: records.filter((record) => ['CERRADA', 'CERRADA_VERIFICAR'].includes(record.normalizedState)),
        restricted: records.filter((record) => record.normalizedState === 'RESTRICCION'),
        partial: records.filter((record) => record.normalizedState === 'PARCIAL'),
        loadRestricted: records.filter((record) => record.hasLoadRestriction),
        inconsistencies: records.filter((record) => record.inconsistency),
        groupedByProvince,
        topProvinces: Object.entries(provinceCounts)
            .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
            .slice(0, 5)
            .map(([province, count]) => ({ province, count })),
        stats: {
            total: records.length,
            closed: records.filter((record) => ['CERRADA', 'CERRADA_VERIFICAR'].includes(record.normalizedState)).length,
            restricted: records.filter((record) => record.normalizedState === 'RESTRICCION').length,
            partial: records.filter((record) => record.normalizedState === 'PARCIAL').length,
            dominantCause: dominantCauseEntry[0],
            dominantCauseCount: dominantCauseEntry[1],
            dominantCausePercentage: records.length > 0
                ? Math.round((dominantCauseEntry[1] / records.length) * 100)
                : 0,
        },
    };
};

export const REPORT_STATE_LABELS = STATE_LABELS;
