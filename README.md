# El Imperio del Algodón · La Ruta del Contrabando (1829)

Experiencia web interactiva (scrolling story) del proyecto transmedia *El Imperio del Algodón*.
El usuario acompaña a August por 8 capítulos, examina gráficas y artefactos sobre una mesa de 1829 y toma decisiones que cambian el **riesgo** y los **fondos** de la red.

## Estructura

```
index.html          → página principal
css/styles.css      → estilos (paleta, tipografías, diseño)
js/data.js          → TODOS los textos, decisiones y cifras de las gráficas
js/app.js           → lógica (capítulos, gráficas, HUD, inventario)
vendor/             → Chart.js (librería de gráficas, incluida para no depender de internet)
fonts/              → Cinzel, Lora e Inter
assets/             → (opcional) august.jpg y gideon.jpg para los retratos del capítulo 00
```

## Cómo editar

- **Cambiar un texto, una decisión o un número de una gráfica:** abre `js/data.js`. Los valores marcados con `aprox` son de referencia; reemplázalos por los del tablero *Registro de la Plantación 1820–1830*.
- **Poner los retratos:** guarda las imágenes como `assets/august.jpg` y `assets/gideon.jpg`. Si no existen, se muestra un grabado de silueta.

## Publicar en GitHub Pages

1. Entra a GitHub con la cuenta **JuanGonzalezAr**.
2. Crea un repositorio nuevo (por ejemplo `ImperioDelAlgodon`), público.
3. En el repositorio: **Add file → Upload files**. Arrastra **todo el contenido** de esta carpeta (no la carpeta en sí: `index.html` tiene que quedar en la raíz). Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En *Build and deployment* elige **Deploy from a branch**, rama **main** y carpeta **/(root)**. Guarda.
5. Espera 1–2 minutos. La página queda en `https://juangonzalezar.github.io/ImperioDelAlgodon/`.

> Si prefieres usar el repositorio existente `VisualizacionDeInformacion`, sube esta carpeta dentro de una subcarpeta (por ejemplo `experiencia/`) para no reemplazar el `index.html` que ya está ahí. Quedaría en `https://juangonzalezar.github.io/VisualizacionDeInformacion/experiencia/`.

## Notas

- La votación del capítulo 07 y el progreso se guardan en el navegador de cada persona (no hay servidor).
- "Exportar registro" abre la impresión del navegador para guardar el dossier como PDF.
