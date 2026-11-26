import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { DEFAULT_ECUADOR_CENTER } from '../../constants/cantonCoordinates';
import { getRoadMapPoint, hasFiniteCoordinates } from '../../utils/mapCoordinates';

const ECUADOR_GEOJSON_URL = 'https://raw.githubusercontent.com/jpmarindiaz/geo-collection/master/ecu/ecuador.geojson';

const markerIcons = ['red', 'amber', 'green', 'blue'].reduce((result, tone) => {
    result[tone] = L.divIcon({
        className: 'road-marker-shell',
        html: `<span class="road-marker road-marker--${tone}"><span></span></span>`,
        iconSize: [28, 34],
        iconAnchor: [14, 31],
        popupAnchor: [0, -28],
    });
    return result;
}, {});

const hasUsableMapViewport = (map) => {
    const size = map.getSize();
    const center = map.getCenter();

    return hasFiniteCoordinates(size.x, size.y) &&
        size.x > 0 &&
        size.y > 0 &&
        hasFiniteCoordinates(center.lat, center.lng) &&
        Number.isFinite(map.getZoom());
};

const findSelectedFeature = (data, selected) => {
    if (!Array.isArray(data?.features) || !selected || selected === 'TODAS') return null;

    const selectedName = selected.toUpperCase();
    return data.features.find((feature) => {
        const provinceName = feature?.properties?.dpa_despro;
        if (typeof provinceName !== 'string') return false;

        const normalizedProvinceName = provinceName.toUpperCase();
        return normalizedProvinceName.includes(selectedName) || selectedName.includes(normalizedProvinceName);
    }) || null;
};

const ProvinceHighlighter = ({ data, selected }) => {
    const map = useMap();
    const selectedFeature = useMemo(() => findSelectedFeature(data, selected), [data, selected]);

    useEffect(() => {
        if (!hasUsableMapViewport(map)) {
            map.stop();
            return undefined;
        }

        try {
            if (selectedFeature) {
                const bounds = L.geoJSON(selectedFeature).getBounds();
                if (!bounds.isValid()) return undefined;

                const center = bounds.getCenter();
                if (!hasFiniteCoordinates(center.lat, center.lng)) return undefined;

                map.stop();
                map.flyToBounds(bounds, { padding: [24, 24], duration: 1.1, maxZoom: 9 });
            } else if (selected === 'TODAS' || !selected) {
                const [lat, lng] = Array.isArray(DEFAULT_ECUADOR_CENTER) ? DEFAULT_ECUADOR_CENTER : [];
                if (!hasFiniteCoordinates(lat, lng)) return undefined;

                map.stop();
                map.flyTo([lat, lng], 7, { duration: 1.1 });
            }
        } catch (error) {
            console.error('No se pudo actualizar la vista del mapa:', error);
        }

        return () => map.stop();
    }, [map, selected, selectedFeature]);

    return selectedFeature ? (
        <GeoJSON
            key={selected}
            data={selectedFeature}
            style={{
                color: '#0f4c6e',
                weight: 3,
                opacity: 0.95,
                fillColor: '#2d789c',
                fillOpacity: 0.12,
            }}
        />
    ) : null;
};

const MapResizeHandler = () => {
    const map = useMap();

    useEffect(() => {
        const container = map.getContainer();
        const observer = new ResizeObserver(() => {
            map.invalidateSize({ animate: false, pan: false });
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, [map]);

    return null;
};

const SelectedRoadController = ({ road }) => {
    const map = useMap();

    useEffect(() => {
        if (!road || !hasUsableMapViewport(map) || !hasFiniteCoordinates(road.lat, road.lng)) return undefined;

        map.stop();
        map.flyTo([road.lat, road.lng], Math.max(map.getZoom(), 11), { duration: 0.9 });
        return () => map.stop();
    }, [map, road]);

    return null;
};

const getMarkerIcon = (road) => {
    if (road.isUserReport) return markerIcons.blue;
    if (road.estado_codigo === 'CERRADA') return markerIcons.red;
    if (road.estado_codigo === 'PARCIAL') return markerIcons.amber;
    return markerIcons.green;
};

export const ViaMap = ({ vias = [], selectedProvince, selectedRoadId }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);
    const [tileError, setTileError] = useState(false);
    const [tileLayerKey, setTileLayerKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        fetch(ECUADOR_GEOJSON_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(`GeoJSON respondió ${response.status}`);
                return response.json();
            })
            .then(setGeoJsonData)
            .catch((error) => {
                if (error.name !== 'AbortError') console.error('No se pudo cargar el límite provincial:', error);
            });

        return () => controller.abort();
    }, []);

    const markers = useMemo(() => vias
        .map(getRoadMapPoint)
        .filter((marker) => marker && hasFiniteCoordinates(marker.lat, marker.lng)), [vias]);
    const selectedRoad = useMemo(
        () => markers.find((road) => road.id === selectedRoadId) || null,
        [markers, selectedRoadId],
    );

    return (
        <div className="relative h-full w-full overflow-hidden bg-slate-200">
            <MapContainer
                center={DEFAULT_ECUADOR_CENTER}
                zoom={7}
                minZoom={6}
                scrollWheelZoom
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    key={tileLayerKey}
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                    eventHandlers={{
                        tileerror: () => setTileError(true),
                        tileload: () => setTileError(false),
                    }}
                />

                <MapResizeHandler />
                <ProvinceHighlighter data={geoJsonData} selected={selectedProvince} />
                <SelectedRoadController road={selectedRoad} />

                {markers.map((road) => (
                    <Marker key={road.id} position={[road.lat, road.lng]} icon={getMarkerIcon(road)}>
                        <Popup className="vialert-popup" maxWidth={300}>
                            <div className="min-w-[230px] p-1 text-slate-800">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-slate-800 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                        {road.provincia}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500">{road.canton}</span>
                                </div>
                                <h3 className="text-base font-extrabold leading-5 text-slate-900">{road.nombre_via}</h3>
                                <p className="mt-2 text-sm font-bold text-slate-700">{road.estado_texto || road.estado_codigo}</p>
                                {road.observaciones && (
                                    <p className="mt-2 text-sm leading-5 text-slate-600">{road.observaciones}</p>
                                )}
                                <p className="mt-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
                                    {road.isApprox
                                        ? `Ubicación referencial por ${road.approximationLevel === 'province' ? 'provincia' : 'cantón'}: ${road.approximationLabel}`
                                        : 'Ubicación reportada por la comunidad'}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {tileError && (
                <div className="absolute inset-x-4 bottom-20 z-[600] mx-auto max-w-sm rounded-xl border border-amber-200 bg-white/95 p-4 text-center shadow-xl backdrop-blur" role="alert">
                    <p className="text-sm font-bold text-slate-900">El mapa base no respondió.</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Los registros siguen disponibles en la lista.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setTileError(false);
                            setTileLayerKey((key) => key + 1);
                        }}
                        className="mt-3 min-h-10 rounded-lg bg-brand-primary px-4 text-sm font-bold text-white"
                    >
                        Reintentar mapa
                    </button>
                </div>
            )}
        </div>
    );
};
