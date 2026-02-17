// Coordenadas aproximadas para Cantones/Ciudades principales de Ecuador
// Usado para georreferenciar reportes oficiales que no traen coordenadas

export const CANTON_COORDINATES = {
    // AZUAY
    'CUENCA': { lat: -2.9001, lng: -79.0059 },
    'GUALACEO': { lat: -2.8000, lng: -78.7833 },
    'PAUTE': { lat: -2.7833, lng: -78.7667 },
    'CAMILO PONCE ENRIQUEZ': { lat: -3.0500, lng: -79.7333 },

    // PICHINCHA
    'QUITO': { lat: -0.1807, lng: -78.4678 },
    'CAYAMBE': { lat: 0.0417, lng: -78.1452 },
    'MEJIA': { lat: -0.5000, lng: -78.5667 }, // Machachi

    // GUAYAS
    'GUAYAQUIL': { lat: -2.1894, lng: -79.8891 },
    'DAULE': { lat: -1.8667, lng: -79.9833 },
    'SAMBORONDON': { lat: -2.0000, lng: -79.7500 },
    'DURAN': { lat: -2.1667, lng: -79.8333 },

    // MANABI
    'PORTOVIEJO': { lat: -1.0546, lng: -80.4544 },
    'MANTA': { lat: -0.9621, lng: -80.7127 },
    'CHONE': { lat: -0.6982, lng: -80.0936 },
    'PEDERNALES': { lat: 0.0764, lng: -80.0525 },
    'PAJAN': { lat: -1.5500, lng: -80.4333 },
    'TOSAGUA': { lat: -0.7833, lng: -80.2333 },
    'BOLIVAR': { lat: -0.8500, lng: -80.1667 }, // Calceta

    // EL ORO
    'MACHALA': { lat: -3.2581, lng: -79.9551 },
    'PIÑAS': { lat: -3.6833, lng: -79.6833 },
    'BALSAS': { lat: -3.7667, lng: -79.8167 },
    'ZARUMA': { lat: -3.6833, lng: -79.6167 },
    'ARENILLAS': { lat: -3.5500, lng: -80.0667 },

    // LOJA
    'LOJA': { lat: -3.9931, lng: -79.2042 },
    'CATAMAYO': { lat: -3.9833, lng: -79.3500 },
    'MACARA': { lat: -4.3833, lng: -79.9333 },
    'CELICA': { lat: -4.1000, lng: -79.9500 },
    'GONZANAMA': { lat: -4.2333, lng: -79.4333 },
    'CALVAS': { lat: -4.3167, lng: -79.5500 }, // Cariamanga
    'PUYANGO': { lat: -3.9667, lng: -80.0833 }, // Alamor

    // CHIMBORAZO
    'RIOBAMBA': { lat: -1.6635, lng: -78.6546 },
    'ALAUSI': { lat: -2.2000, lng: -78.8500 },
    'COLTA': { lat: -1.7000, lng: -78.7667 },

    // COTOPAXI
    'LATACUNGA': { lat: -0.9333, lng: -78.6167 },
    'PUJILI': { lat: -0.9500, lng: -78.6833 },

    // TUNGURAHUA
    'AMBATO': { lat: -1.2491, lng: -78.6168 },
    'BAÑOS': { lat: -1.3964, lng: -78.4247 }, // Baños de Agua Santa

    // ESMERALDAS
    'ESMERALDAS': { lat: 0.9682, lng: -79.6517 },
    'QUININDE': { lat: 0.3333, lng: -79.4833 },
    'RIOVERDE': { lat: 1.0667, lng: -79.4000 },

    // MORONA SANTIAGO
    'MACAS': { lat: -2.3167, lng: -78.1167 }, // Morona
    'MORONA': { lat: -2.3167, lng: -78.1167 },
    'SANTIAGO': { lat: -3.0500, lng: -78.0333 }, // Santiago de Mendez
    'LIMON INDANZA': { lat: -2.9667, lng: -78.4333 },
    'GUALAQUIZA': { lat: -3.4000, lng: -78.5833 },
    'SAN JUAN BOSCO': { lat: -3.1167, lng: -78.5333 },
    'TIWINTZA': { lat: -2.8833, lng: -78.1667 }, // Approx

    // NAPO
    'TENA': { lat: -0.9938, lng: -77.8129 },
    'ARCHIDONA': { lat: -0.9167, lng: -77.8000 },
    'QUIJOS': { lat: -0.4000, lng: -77.9667 }, // Baeza

    // SUCUMBIOS
    'LAGO AGRIO': { lat: 0.0833, lng: -76.8833 }, // Nueva Loja
    'SUCUMBIOS': { lat: 0.5000, lng: -77.5000 }, // La Bonita approx

    // ZAMORA CHINCHIPE
    'ZAMORA': { lat: -4.0692, lng: -78.9567 },
    'YANTZAZA': { lat: -3.8333, lng: -78.7667 },
    'EL PANGUI': { lat: -3.6167, lng: -78.5833 },

    // SANTO DOMINGO
    'SANTO DOMINGO': { lat: -0.2530, lng: -79.1754 },

    // IMBABURA
    'IBARRA': { lat: 0.3627, lng: -78.1308 },
    'OTAVALO': { lat: 0.2333, lng: -78.2667 },

    // CARCHI
    'TULCAN': { lat: 0.8119, lng: -77.7173 }
};

export const DEFAULT_ECUADOR_CENTER = [-1.8312, -78.1834];

export const getCantonCoordinates = (cantonName) => {
    if (!cantonName) return null;
    const key = cantonName.toUpperCase();

    // Búsqueda directa
    if (CANTON_COORDINATES[key]) {
        return CANTON_COORDINATES[key];
    }

    // Búsqueda parcial (ej: "SANTO DOMINGO DE LOS TSACHILAS" -> "SANTO DOMINGO")
    const partialMatch = Object.keys(CANTON_COORDINATES).find(c => key.includes(c));
    if (partialMatch) {
        return CANTON_COORDINATES[partialMatch];
    }

    return null;
};
