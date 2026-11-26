# Resultados de rendimiento

Medición real ejecutada con Lighthouse móvil y Chrome headless sobre el build de producción local. Resultado completo: [`lighthouse-mobile.json`](./lighthouse-mobile.json).

| Categoría | Puntuación |
|---|---:|
| Performance | 65 |
| Accessibility | 96 |
| Best Practices | 96 |
| SEO | 100 |

## Métricas principales

| Métrica | Resultado |
|---|---:|
| First Contentful Paint | 1,8 s |
| Largest Contentful Paint | 4,2 s |
| Speed Index | 3,2 s |
| Total Blocking Time | 820 ms |
| Cumulative Layout Shift | 0,015 |
| Time to Interactive | 4,5 s |

## Hallazgos

- El bundle medido era de aproximadamente 472 kB y Lighthouse estimó 65 KiB de JavaScript no utilizado.
- Leaflet se montaba en móvil aunque la vista inicial fuera la lista, generando trabajo de layout, marcadores y red no visible.
- El texto “resultados visibles” tenía contraste 4,39:1, ligeramente inferior al mínimo 4,5:1.
- La hoja CSS bloqueó aproximadamente 150 ms durante la simulación.
- Los errores de consola registrados pertenecen al CORS del preview local `127.0.0.1:4173` contra el backend todavía desplegado. El origen productivo de Vercel sí fue verificado por separado.

## Correcciones posteriores a la medición

- El mapa pasó a `React.lazy` y solo se monta cuando la pestaña Mapa está visible en móvil; Vite genera ahora un chunk independiente para Leaflet.
- El texto con contraste insuficiente cambió de `slate-500` a `slate-600`.
- Los objetivos táctiles propios quedaron con una altura mínima de 44 px.

Lighthouse no se repitió después de estas correcciones para respetar el límite de ejecuciones solicitado. Por tanto, no se atribuyen puntuaciones nuevas ni estimadas al build final.
