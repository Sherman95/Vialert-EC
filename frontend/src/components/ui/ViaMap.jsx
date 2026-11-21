import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCantonCoordinates, DEFAULT_ECUADOR_CENTER } from '../../constants/cantonCoordinates';

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

const hasFiniteCoordinates = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng);

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

const deterministicOffset = (id, axis) => {
    const source = `${id || 'road'}-${axis}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    }
    return (((Math.abs(hash) % 1000) / 1000) - 0.5) * 0.006;
};

const getMarkerIcon = (road) => {
    if (road.isUserReport) return markerIcons.blue;
    if (road.estado_codigo === 'CERRADA') return markerIcons.red;
    if (road.estado_codigo === 'PARCIAL') return markerIcons.amber;
    return markerIcons.green;
};

export const ViaMap = ({ vias = [], selectedProvince }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);

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

    const markers = useMemo(() => vias.map((road) => {
        if (
            road.isUserReport &&
            road.coordenadas &&
            hasFiniteCoordinates(road.coordenadas.lat, road.coordenadas.lng)
        ) {
            return { ...road, lat: road.coordenadas.lat, lng: road.coordenadas.lng, isApprox: false };
        }

        if (!road.isUserReport && road.canton) {
            const coordinates = getCantonCoordinates(road.canton);
            if (coordinates) {
                return {
                    ...road,
                    lat: coordinates.lat + deterministicOffset(road.id, 'lat'),
                    lng: coordinates.lng + deterministicOffset(road.id, 'lng'),
                    isApprox: true,
                };
            }
        }

        return null;
    }).filter((marker) => marker && hasFiniteCoordinates(marker.lat, marker.lng)), [vias]);

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
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <MapResizeHandler />
                <ProvinceHighlighter data={geoJsonData} selected={selectedProvince} />

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
                                    {road.isApprox ? `Ubicación referencial: ${road.canton}` : 'Ubicación reportada por la comunidad'}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
