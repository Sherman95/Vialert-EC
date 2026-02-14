import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Esto es necesario porque Vite a veces no encuentra los iconos de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

export const ViaMap = ({ vias }) => {
    const ecuadorCenter = [-1.8312, -78.1834];

    return (
        <div className="h-[450px] w-full rounded-[32px] overflow-hidden shadow-2xl border-8 border-white mb-10 relative z-0">
            <MapContainer center={ecuadorCenter} zoom={7} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                {vias.map((via) => (
                    via.estado_codigo !== 'HABILITADA' && (
                        <Marker key={via.id} position={ecuadorCenter} icon={customIcon}>
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <h4 className="font-black text-slate-800 text-sm mb-1">{via.nombre_via}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full uppercase">
                                        {via.estado_texto}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};