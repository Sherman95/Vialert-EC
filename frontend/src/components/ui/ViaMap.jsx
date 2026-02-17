import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCantonCoordinates, DEFAULT_ECUADOR_CENTER } from '../../constants/cantonCoordinates';

// Esto es necesario porque Vite a veces no encuentra los iconos de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Iconos coloreados de la librería 'leaflet-color-markers'
const getMarkerIcon = (color) => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Cache de iconos para no recrearlos
const icons = {
    red: getMarkerIcon('red'),
    gold: getMarkerIcon('gold'),
    green: getMarkerIcon('green'),
    violet: getMarkerIcon('violet'),
    blue: getMarkerIcon('blue'),
    grey: getMarkerIcon('grey')
};

// URL de GeoJSON de Ecuador (Provincias)
const ECUADOR_GEOJSON_URL = "https://raw.githubusercontent.com/jpmarindiaz/geo-collection/master/ecu/ecuador.geojson";

export const ViaMap = ({ vias, interactive, selectedProvince }) => {
    const [geoJsonData, setGeoJsonData] = useState(null);

    // Cargar GeoJSON al montar
    useEffect(() => {
        fetch(ECUADOR_GEOJSON_URL)
            .then(res => res.json())
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Error cargando mapa:", err));
    }, []);

    // Componente para manejar el Zoom dinámico y el filtrado
    const ProvinceHighlighter = ({ data, selected }) => {
        const map = useMap();

        useEffect(() => {
            try {
                if (data && selected && selected !== 'TODAS') {
                    const selectedFeature = data.features.find(
                        f => f.properties.dpa_despro.toUpperCase().includes(selected.toUpperCase()) ||
                            selected.toUpperCase().includes(f.properties.dpa_despro.toUpperCase())
                    );

                    if (selectedFeature) {
                        try {
                            // Crear capa temporal para obtener bounds
                            const layer = L.geoJSON(selectedFeature);
                            const bounds = layer.getBounds();

                            if (bounds && bounds.isValid()) {
                                const center = bounds.getCenter();
                                if (!isNaN(center.lat) && !isNaN(center.lng)) {
                                    map.flyToBounds(bounds, { padding: [20, 20], duration: 1.5 });
                                } else {
                                    console.warn("Calculated center is NaN", center);
                                }
                            } else {
                                console.warn("Invalid bounds for feature", selectedFeature);
                            }
                        } catch (err) {
                            console.error("Error analyzing bounds:", err);
                        }
                    }
                } else if ((selected === 'TODAS' || !selected)) {
                    // DEFAULT_ECUADOR_CENTER Validation
                    if (DEFAULT_ECUADOR_CENTER &&
                        Array.isArray(DEFAULT_ECUADOR_CENTER) &&
                        DEFAULT_ECUADOR_CENTER.length === 2 &&
                        !isNaN(DEFAULT_ECUADOR_CENTER[0]) &&
                        !isNaN(DEFAULT_ECUADOR_CENTER[1])) {

                        map.flyTo(DEFAULT_ECUADOR_CENTER, 7, { duration: 1.5 });
                    } else {
                        console.error("Invalid DEFAULT_ECUADOR_CENTER:", DEFAULT_ECUADOR_CENTER);
                        // Fallback hardcoded
                        map.flyTo([-1.8312, -78.1834], 7, { duration: 1.5 });
                    }
                }
            } catch (error) {
                console.error("CRITICAL MAP ERROR in ProvinceHighlighter:", error);
            }
        }, [data, selected, map]);

        if (!data || !selected || selected === 'TODAS') return null;

        const selectedFeature = data.features.find(
            f => f.properties.dpa_despro.toUpperCase().includes(selected.toUpperCase()) ||
                selected.toUpperCase().includes(f.properties.dpa_despro.toUpperCase())
        );

        return selectedFeature ? (
            <GeoJSON
                key={selected} // Forzar re-render al cambiar provincia
                data={selectedFeature}
                style={{
                    color: '#3b82f6', // Blue color for border
                    weight: 3,
                    opacity: 0.8,
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1
                }}
            />
        ) : null;
    };

    const markers = useMemo(() => {
        return vias.map(via => {
            // 1. Si es reporte de usuario, tiene coordenadas exactas
            if (via.isUserReport && via.coordenadas) {
                return { ...via, lat: via.coordenadas.lat, lng: via.coordenadas.lng, isApprox: false };
            }

            // 2. Si es data oficial, intentamos buscar por Cantón
            if (!via.isUserReport && via.canton) {
                const coords = getCantonCoordinates(via.canton);
                if (coords) {
                    // Pequeña variación aleatoria para que no se superpongan todos en el centro exacto
                    const randomOffset = () => (Math.random() - 0.5) * 0.005;
                    return {
                        ...via,
                        lat: coords.lat + randomOffset(),
                        lng: coords.lng + randomOffset(),
                        isApprox: true
                    };
                }
            }
            return null;
        }).filter(m => m !== null);
    }, [vias]);

    const getIconForVia = (via) => {
        if (via.isUserReport) return icons.violet;

        switch (via.estado_codigo) {
            case 'CERRADA': return icons.red;
            case 'PARCIAL': return icons.gold; // Gold/Orange for partial
            case 'HABILITADA': return icons.green;
            default: return icons.blue;
        }
    };

    return (
        <div className={`${interactive ? 'h-full w-full rounded-none border-0 shadow-none' : 'h-[450px] w-full rounded-[32px] shadow-2xl border-8 border-white mb-10'} relative z-0 overflow-hidden`}>
            <MapContainer center={DEFAULT_ECUADOR_CENTER} zoom={7} scrollWheelZoom={!!interactive} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* Capa de GeoJSON para Provincias */}
                <ProvinceHighlighter data={geoJsonData} selected={selectedProvince} />

                {markers.map((via) => (
                    <Marker
                        key={via.id}
                        position={[via.lat, via.lng]}
                        icon={getIconForVia(via)}
                    >
                        <Popup className="custom-popup">
                            <div className="p-1 min-w-[200px]">
                                {via.isApprox && (
                                    <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded block mb-1 w-fit border border-slate-200">
                                        📍 Approx: {via.canton}
                                    </span>
                                )}
                                <h4 className="font-extrabold text-slate-900 text-sm mb-1 leading-tight">{via.nombre_via || via.descripcion}</h4>

                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide inline-block mb-2 ${via.estado_codigo === 'CERRADA' ? 'bg-red-600 text-white' :
                                    via.estado_codigo === 'PARCIAL' ? 'bg-amber-500 text-white' :
                                        via.isUserReport ? 'bg-purple-600 text-white' :
                                            'bg-emerald-500 text-white'
                                    }`}>
                                    {via.estado_texto || via.estado_codigo}
                                </span>

                                {via.observaciones && (
                                    <p className="text-xs text-slate-600 leading-normal line-clamp-4 bg-slate-50 p-2 rounded border border-slate-100 italic">
                                        "{via.observaciones}"
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};