import { getCantonCoordinates, getProvinceCoordinates } from '../constants/cantonCoordinates';

export const hasFiniteCoordinates = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng);

const deterministicOffset = (id, axis) => {
    const source = `${id || 'road'}-${axis}`;
    let hash = 0;
    for (let index = 0; index < source.length; index += 1) {
        hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
    }
    return (((Math.abs(hash) % 1000) / 1000) - 0.5) * 0.006;
};

export const getRoadMapPoint = (road) => {
    if (road?.isUserReport && road.coordenadas) {
        const lat = Number(road.coordenadas.lat);
        const lng = Number(road.coordenadas.lng);
        if (hasFiniteCoordinates(lat, lng)) {
            return { ...road, lat, lng, isApprox: false, approximationLevel: 'exact' };
        }
    }

    if (!road?.isUserReport && road?.canton) {
        const coordinates = getCantonCoordinates(road.canton);
        if (coordinates && hasFiniteCoordinates(coordinates.lat, coordinates.lng)) {
            return {
                ...road,
                lat: coordinates.lat + deterministicOffset(road.id, 'lat'),
                lng: coordinates.lng + deterministicOffset(road.id, 'lng'),
                isApprox: true,
                approximationLevel: 'canton',
                approximationLabel: road.canton,
            };
        }
    }

    const provinceCoordinates = getProvinceCoordinates(road?.provincia);
    if (provinceCoordinates && hasFiniteCoordinates(provinceCoordinates.lat, provinceCoordinates.lng)) {
        return {
            ...road,
            lat: provinceCoordinates.lat + deterministicOffset(road.id, 'province-lat'),
            lng: provinceCoordinates.lng + deterministicOffset(road.id, 'province-lng'),
            isApprox: true,
            approximationLevel: 'province',
            approximationLabel: road.provincia,
        };
    }

    return null;
};
