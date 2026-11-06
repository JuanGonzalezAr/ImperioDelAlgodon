# El Imperio del Algodón · La Ruta del Contrabando (1829)

Experiencia web interactiva (scrolling story) del proyecto transmedia *El Imperio del Algodón*.

1. **Portada:** un ejemplar de *The Southern Gazette* (octubre de 1829). Se entra rompiendo el sello de cera.
2. **Elección de personaje:** August (El Operativo) o Gideon (El Estratega).
3. **7 capítulos por personaje**, con situaciones y decisiones distintas. Cada decisión cambia el **riesgo** y los **fondos** de la red; al final se genera el dossier con la insignia.

## Archivos (todos en la raíz)

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Página principal y portada del periódico |
| `styles.css` | Estilos (paleta, tipografías, diseño) |
| `data.js` | **Todos los textos, decisiones y cifras de las gráficas.** `RUTA_AUGUST` y `RUTA_GIDEON` |
| `app.js` | Lógica: capítulos, gráficas, HUD, inventario |
| `mapa-sur.js` | Trazos del mapa de los estados del Sur |
| `chart.umd.min.js` | Chart.js (librería de gráficas) |
| `*.woff2` | Tipografías Cinzel, Lora e Inter |
| `august.jpg`, `gideon.jpg` | Retratos de los personajes |
| `august-cartel.jpg`, `grabado.jpg` | Imágenes de la portada del periódico |

## Cómo editar

- **Textos, decisiones o números:** abre `data.js`. Las cifras de las gráficas vienen del tablero *Registro de la Plantación 1820–1830*.
- **Imágenes:** reemplaza el archivo manteniendo el mismo nombre.

## Cómo actualizar la página

En el repositorio: **Add file → Upload files**, arrastra los archivos que cambiaron y pulsa **Commit changes**. GitHub Pages publica la nueva versión en 1–2 minutos en <https://juangonzalezar.github.io/ImperioDelAlgodon/>.

## Notas

- El progreso y la votación del capítulo 07 se guardan en el navegador de cada persona (no hay servidor).
- "Exportar registro" abre la impresión del navegador para guardar el dossier como PDF.
