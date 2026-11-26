# Auditoría visual

La interfaz fue revisada con Chrome real automatizado en las siete resoluciones solicitadas y en escenarios de splash, mapa, error y offline. La hoja resumen está en [`visual-contact-sheet.png`](./visual-contact-sheet.png).

## Resoluciones

| Resolución | Captura | Resultado |
|---:|---|---|
| 320 × 568 | [`viewport-320x568.png`](./viewport-320x568.png) | Sin desbordamiento horizontal; estadísticas corregidas a 2×2. |
| 360 × 800 | [`viewport-360x800.png`](./viewport-360x800.png) | Controles legibles y navegación estable. |
| 390 × 844 | [`viewport-390x844.png`](./viewport-390x844.png) | Lista, filtros y tarjetas coherentes. |
| 430 × 932 | [`viewport-430x932.png`](./viewport-430x932.png) | Espaciado y jerarquía correctos. |
| 768 × 1024 | [`viewport-768x1024.png`](./viewport-768x1024.png) | Split view funcional en tablet. |
| 1366 × 768 | [`viewport-1366x768.png`](./viewport-1366x768.png) | Distribución desktop equilibrada. |
| 1920 × 1080 | [`viewport-1920x1080.png`](./viewport-1920x1080.png) | Mapa aprovecha el ancho sin deformar el panel. |

## Escenarios adicionales

- Splash móvil: [`splash-mobile-slow.png`](./splash-mobile-slow.png).
- Splash desktop: [`splash-desktop-slow.png`](./splash-desktop-slow.png).
- Mapa móvil: [`map-mobile-390x844.png`](./map-mobile-390x844.png).
- Popup Leaflet: [`map-popup-390x844.png`](./map-popup-390x844.png).
- Provincia resaltada: [`map-province-highlight-390x844.png`](./map-province-highlight-390x844.png).
- Cambio de orientación: [`orientation-landscape-844x390.png`](./orientation-landscape-844x390.png).
- Fallo de tiles: [`map-tile-error-390x844.png`](./map-tile-error-390x844.png).
- Error recuperable: [`data-error-recoverable-390x844.png`](./data-error-recoverable-390x844.png).
- Datos offline: [`offline-cached-390x844.png`](./offline-cached-390x844.png).
- Máscaras PWA: [`maskable-shapes.png`](./maskable-shapes.png).

## Comparación de identidad

- El encabezado móvil utiliza el isotipo oficial; desktop usa la aplicación monocromática aprobada.
- Poppins se carga localmente en pesos 400, 600 y 700.
- Los colores principales coinciden con azul `#0D47A1`, azul noche `#062044`, rojo, verde y amarillo de la guía.
- El splash mantiene isotipo, nombre, eslogan, franja tricolor, montañas y carretera sin usar iconos genéricos.
- Los logotipos no presentan deformación; se renderizan con `object-contain` y conservan transparencia.
- Las tarjetas, filtros y estados usan bordes y contrastes consistentes con el tablero de marca.

## Correcciones visuales realizadas

- Estadísticas cambiadas a cuadrícula 2×2 en móvil estrecho para evitar el recorte del cuarto indicador.
- Controles de filtro y “Ver en mapa” ampliados a 44 px de alto.
- Controles de zoom Leaflet ampliados a 44 px.
- Eliminada la altura mínima de 560 px que desbordaba la orientación 844×390.
- Aviso de tiles corregido para no desaparecer cuando Leaflet termina una tanda fallida.
- Eliminados recursos genéricos antiguos de Vite y el logotipo JPG anterior.
