/* ==========================================================
   El Imperio del Algodón — lógica de la experiencia
   ========================================================== */
(() => {
'use strict';

/* ---------- Estado de la travesía ---------- */
const ESTADO_INICIAL = { aliado: null, riesgo: 0, fondos: 100, decisiones: {} };
let estado = cargar();
function cargar() {
  try { return Object.assign({}, ESTADO_INICIAL, JSON.parse(localStorage.getItem('imperio-travesia')) || {}); }
  catch (e) { return { ...ESTADO_INICIAL }; }
}
function guardar() { try { localStorage.setItem('imperio-travesia', JSON.stringify(estado)); } catch (e) {} }

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const story = $('#story');
const tip = $('#tip');

/* ---------- Estilo base de Chart.js ---------- */
const INK = '#2a1d12', INK2 = '#5b4630', GRID = 'rgba(90,70,40,.15)';
Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = INK2;
Chart.defaults.plugins.legend.display = false;
Object.assign(Chart.defaults.plugins.tooltip, {
  backgroundColor: '#1a130e', titleColor: '#f3e6cb', bodyColor: '#f3e6cb', borderColor: '#D2A334', borderWidth: 1,
  padding: 8, cornerRadius: 4, displayColors: false
});
const ejes = (extraY = {}, extraX = {}) => ({
  x: Object.assign({ grid: { display: false }, border: { color: '#b9a57e' }, ticks: { color: INK2 } }, extraX),
  y: Object.assign({ grid: { color: GRID }, border: { display: false }, ticks: { color: INK2 }, beginAtZero: true }, extraY)
});

/* ---------- Utilidades de interfaz ---------- */
function tabla(cabeceras, filas) {
  return `<table class="data-table"><thead><tr>${cabeceras.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    filas.map(f => `<tr>${f.map((c, i) => `<td class="${i ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function tarjetaViz({ id, kicker, titulo, sub, kpis, cuerpo, nota, tablaHTML, alto }) {
  return `<div class="paper">
    <div class="viz-head"><div>${kicker ? `<div class="note" style="letter-spacing:.15em;text-transform:uppercase">${kicker}</div>` : ''}
      <div class="t">${titulo}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>
      ${tablaHTML ? `<button class="toggle-table" data-for="${id}-t">Ver tabla</button>` : ''}</div>
    ${kpis ? `<div class="stats">${kpis.map(k => `<div class="stat ${k.alerta ? 'alert' : ''}"><span>${k.l}</span><b id="${k.id || ''}"${k.peq ? ' style="font-size:17px;margin-top:6px"' : ''}>${k.v}</b></div>`).join('')}</div>` : ''}
    ${cuerpo || `<div class="chart-box ${alto ? 'tall' : ''}"><canvas id="${id}" role="img" aria-label="${titulo}"></canvas></div>`}
    ${tablaHTML ? `<div id="${id}-t">${tablaHTML}</div>` : ''}
    ${nota ? `<p class="note" style="margin-top:10px">${nota}</p>` : ''}
  </div>`;
}
function testimonio(c) {
  return `<div class="paper tilt-l">
    <div class="note" style="display:flex;justify-content:space-between;letter-spacing:.15em;text-transform:uppercase"><span>Testimonio · ${c.firma}</span><span style="color:var(--cera)">Entrada ${String(c.id).padStart(2, '0')}</span></div>
    <p class="narr" style="margin-top:14px"><span class="drop">“</span>${c.testimonio}</p>
    <p class="quote">${c.nota}</p>
    <div class="stats" style="margin-top:16px">${c.hechos.map(h => `<div class="stat"><span>${h[0]}</span><b style="font-size:15px;margin-top:4px">${h[1]}</b></div>`).join('')}</div>
    <p style="text-align:right;font-style:italic;font-size:22px;margin-top:12px;color:#3a2a1a">${c.firma}</p>
  </div>`;
}
function cabecera(c) {
  return `<div class="ch-head"><span class="ch-num">${String(c.id).padStart(2, '0')}</span><h2 class="ch-title" id="cap${c.id}t">${c.titulo}</h2></div>
    ${c.lugar ? `<p class="ch-sub"><span style="font-style:normal;font-family:var(--sans);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--laton)">${c.lugar}</span><br>${c.sub}</p>` : ''}`;
}
function dilema(c) {
  const elegida = estado.decisiones[c.id];
  return `<div class="dilemma" id="dil-${c.id}">
    <div class="k">DECISIÓN ${String(c.id).padStart(2, '0')}</div>
    <div class="q">${c.pregunta}</div>
    <div class="analysis">Análisis de datos: ${c.analisis}</div>
    <div class="options">${c.opciones.map((o, i) => `
      <button class="opt ${elegida === i ? 'chosen' : ''}" data-cap="${c.id}" data-opt="${i}" ${elegida !== undefined ? 'disabled' : ''}>
        <span class="tag">OPCIÓN ${o.letra}</span><span class="txt">${o.texto}</span>
        <span class="cost">Riesgo ${o.riesgo > 0 ? '+' : ''}${o.riesgo} %${o.fondos ? ` · Fondos +$${o.fondos}` : ''}</span>
      </button>`).join('')}</div>
    <div class="outcome" id="out-${c.id}"></div>
    ${c.id < 7 ? `<a class="next" href="#cap${c.id + 1}">Continuar al capítulo ${String(c.id + 1).padStart(2, '0')} →</a>` : ''}
  </div>`;
}
function seccion(id, html) {
  const s = document.createElement('section');
  s.className = 'chapter'; s.id = 'cap' + id; s.setAttribute('aria-labelledby', 'cap' + id + 't');
  s.innerHTML = html; story.appendChild(s); return s;
}

/* ==========================================================
   CAPÍTULO 00 · El Despacho Clandestino
   ========================================================== */
function retrato(clave) {
  // Si existe assets/<clave>.jpg se usa la foto; si no, un grabado de silueta.
  return `<div style="position:relative;height:100%;min-height:260px;background:#cdbb97;overflow:hidden;border-right:1px solid rgba(90,70,40,.3)">
    <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><pattern id="hatch-${clave}" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="4" stroke="#6b5236" stroke-width="1"/></pattern></defs>
      <rect width="200" height="260" fill="#d9c7a2"/><path d="M100 60c26 0 40 22 38 46-2 22-14 36-38 36s-36-14-38-36c-2-24 12-46 38-46z" fill="url(#hatch-${clave})"/>
      <path d="M30 260c4-54 34-84 70-84s66 30 70 84z" fill="url(#hatch-${clave})"/></svg>
    <img src="${clave}.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:sepia(.5)" onerror="this.remove()">
    <span style="position:absolute;left:10px;top:8px;font-family:var(--display);color:#3a2a1a">${ALIADOS[clave].ficha}</span></div>`;
}
function cap0() {
  const card = (k) => {
    const a = ALIADOS[k];
    return `<button class="paper dossier ${estado.aliado === k ? 'selected' : ''}" data-aliado="${k}" style="padding:0;display:grid;grid-template-columns:42% 1fr">
      ${retrato(k)}
      <div style="padding:20px 20px 18px">
        <div class="role">${a.rol}</div><div class="name">${a.nombre}</div>
        <p style="font-size:14px">${a.desc}</p>
        <div class="note" style="margin-top:12px;letter-spacing:.15em">RASGOS</div>
        ${a.rasgos.map(r => `<div style="display:flex;align-items:center;gap:8px;font-family:var(--sans);font-size:12px;margin-top:6px"><span style="width:110px">${r[0]}</span><span style="flex:1;height:5px;background:#d9c9a8;border-radius:3px"><span style="display:block;height:100%;width:${r[1]}%;background:#a8782a;border-radius:3px"></span></span><b>${r[1]}</b></div>`).join('')}
        <div style="margin-top:16px;font-family:var(--display);font-size:12px;letter-spacing:.15em;background:linear-gradient(180deg,#e2b443,#b8892a);color:#2a1d12;padding:10px 12px;border-radius:3px">Elegir a ${a.nombre} y empezar →</div>
        ${k === 'gideon' ? '<div class="soon">La ruta de Gideon está en desarrollo: por ahora la travesía sigue el modo August.</div>' : ''}
      </div></button>`;
  };
  const s = seccion(0, `
    <div style="text-align:center;margin:20px 0 30px">
      <div class="ch-num">CAPÍTULO 00 · REGISTRO DE ENTRADA</div>
      <h1 id="cap0t" style="font-family:var(--display);font-size:clamp(34px,6vw,64px);color:#f3e6cb;letter-spacing:.06em;line-height:1.05;margin-top:10px">El Imperio del Algodón</h1>
      <div style="font-family:var(--display);color:var(--laton);letter-spacing:.35em;margin-top:8px">LA RUTA DEL CONTRABANDO · 1829</div>
      <p style="font-style:italic;color:#c9b693;max-width:640px;margin:14px auto 0">Entra en las arterias ocultas del Sur. Examina documentos, artefactos y mapas sobre esta mesa: cada gráfica es una prueba de inteligencia. Elige a tu compañero para empezar la travesía de 8 capítulos.</p>
    </div>
    <div class="dilemma" style="margin-bottom:18px"><div class="k">DECISIÓN 00 · ELECCIÓN DE ALIADO</div><div class="q" style="margin-bottom:0">¿Quién llevará el registro?</div></div>
    <div class="desk"><div class="span-6">${card('august')}</div><div class="span-6">${card('gideon')}</div></div>
    <p class="note" style="margin-top:14px;color:#9c8866">Aviso confidencial: tu aliado define los diálogos, artefactos y rutas de escape disponibles. Puedes reiniciar la travesía al final.</p>`);
  $$('.dossier', s).forEach(b => b.addEventListener('click', () => {
    estado.aliado = 'august'; // por ahora solo existe el modo August
    estado.aliadoElegido = b.dataset.aliado;
    guardar(); $$('.dossier', s).forEach(x => x.classList.toggle('selected', x === b));
    actualizarHUD();
    document.getElementById('cap1').scrollIntoView();
  }));
}

/* ==========================================================
   CAPÍTULO 01 · Libro de contabilidad
   ========================================================== */
function cap1() {
  const c = CAPITULOS[1], g = DATOS.guardias, h = DATOS.horasTrabajo, q = DATOS.cuotas;
  seccion(1, `${cabecera(c)}
    <div class="desk">
      <div class="span-5">${testimonio(c)}</div>
      <div class="span-7">${tarjetaViz({ id: 'chGuardias', kicker: 'Libro de contabilidad de Oak Ridge · vol. IV', titulo: 'Turnos de guardia en la plantación',
        sub: 'Guardias activos por franja horaria', kpis: [{ l: 'Cuota promedio', v: q.promedio + ' lb' }, { l: 'Guardias activos', v: Math.max(...g.valores) }, { l: 'Mínima vigilancia', v: '2:00 p. m.', alerta: true }],
        tablaHTML: tabla(['Hora', 'Guardias'], g.horas.map((x, i) => [x, g.valores[i]])),
        nota: '⧗ La cobertura más baja es durante el cambio de turno de la tarde: una ventana de 17 minutos.' })}</div>
      <div class="span-5">${tarjetaViz({ id: 'chCuotas', kicker: 'Anexo · Registro de la Plantación', titulo: 'Cuotas de cosecha diaria', sub: 'Libras de algodón pizcado por persona al día',
        cuerpo: `<div class="stats"><div class="stat alert"><span>Límite de castigo</span><b>${q.castigo}</b><span>lb</span></div><div class="stat"><span>Promedio real</span><b>${q.promedio}</b><span>lb</span></div><div class="stat"><span>Máxima explotación</span><b>${q.maxima}</b><span>lb</span></div></div>
        <p class="note" style="margin-top:10px">Quien no llegaba a ${q.castigo} lb era castigado; la vida se medía en fardos.</p>` })}</div>
      <div class="span-7">${tarjetaViz({ id: 'chHoras', kicker: 'Anexo · Registro de la Plantación', titulo: 'Horas semanales por tipo de trabajo', sub: 'Horas por semana',
        tablaHTML: tabla(['Trabajo', 'Horas/semana'], h.etiquetas.map((x, i) => [x, h.valores[i]])) })}</div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  new Chart($('#chGuardias'), { type: 'bar',
    data: { labels: g.horas, datasets: [{ data: g.valores, borderRadius: 4, maxBarThickness: 46,
      backgroundColor: g.valores.map((_, i) => i === g.minimo ? '#2f7a4f' : '#B8892A') }] },
    options: { maintainAspectRatio: false, scales: ejes({ title: { display: true, text: 'Guardias' } }),
      plugins: { tooltip: { callbacks: { label: x => `${x.raw} guardias${x.dataIndex === g.minimo ? ' · cambio de turno' : ''}` } } } } });
  new Chart($('#chHoras'), { type: 'bar',
    data: { labels: h.etiquetas, datasets: [{ data: h.valores, backgroundColor: PALETA[0], borderRadius: 4, maxBarThickness: 22 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: ejes({ grid: { display: false }, border: { color: '#b9a57e' } }, { grid: { color: GRID }, border: { display: false }, title: { display: true, text: 'Horas por semana' } }),
      plugins: { tooltip: { callbacks: { label: x => `${x.raw} h por semana` } } } } });
}

/* ==========================================================
   CAPÍTULO 02 · Las 12 horas a oscuras (reloj + riesgo por hora)
   ========================================================== */
function relojSVG() {
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * Math.PI / 180, r1 = 78, r2 = 70;
    return `<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + r2 * Math.sin(a)}" y2="${100 - r2 * Math.cos(a)}" stroke="#2a1d12" stroke-width="${i % 3 ? 1.5 : 3}"/>
      <text x="${100 + 60 * Math.sin(a)}" y="${104 - 60 * Math.cos(a)}" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#2a1d12">${['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][i]}</text>`;
  }).join('');
  return `<svg class="watch" viewBox="0 0 200 220" role="img" aria-label="Reloj de bolsillo">
    <rect x="92" y="2" width="16" height="14" rx="4" fill="#b8892a"/><circle cx="100" cy="20" r="6" fill="none" stroke="#b8892a" stroke-width="3"/>
    <circle cx="100" cy="120" r="94" fill="#c9952e" stroke="#7a5a1a" stroke-width="4"/>
    <g transform="translate(0,20)"><circle cx="100" cy="100" r="84" fill="#f3e6cb" stroke="#a8782a" stroke-width="3"/>${marcas}
      <line id="hHand" x1="100" y1="100" x2="100" y2="52" stroke="#2a1d12" stroke-width="5" stroke-linecap="round"/>
      <line id="mHand" x1="100" y1="100" x2="100" y2="34" stroke="#8B1E19" stroke-width="2" stroke-linecap="round"/>
      <circle cx="100" cy="100" r="5" fill="#2a1d12"/></g></svg>`;
}
function cap2() {
  const c = CAPITULOS[2], E = DATOS.etapas;
  seccion(2, `${cabecera(c)}
    <div class="desk">
      <div class="span-4"><div class="dilemma watch-wrap" style="height:100%">
        <div class="k">EL RELOJ DEL CAPATAZ</div>${relojSVG()}
        <div class="hour-read" id="hourRead">Hora 0 · 00:00</div>
        <label class="sr-only" for="hourSlider">Hora del trayecto</label>
        <input id="hourSlider" class="hour-slider" type="range" min="0" max="12" step="3" value="0">
        <p class="note" style="color:#c9b693;text-align:center">Gira las manecillas: recorre las 12 horas del trayecto.</p></div></div>
      <div class="span-8">${tarjetaViz({ id: 'chRiesgoHora', kicker: 'Registro de la Plantación · trayecto', titulo: 'Riesgo en el trayecto de transporte fluvial',
        sub: 'Nivel de riesgo de 1 a 10 en cada etapa, de la plantación al puerto', kpis: [{ l: 'Hora', v: '00:00', id: 'kHora' }, { l: 'Riesgo', v: E[0].riesgo + ' / 10', id: 'kRiesgo' }, { l: 'Etapa', v: E[0].nombre, id: 'kEtapa', alerta: true, peq: true }],
        tablaHTML: tabla(['Hora', 'Etapa', 'Riesgo (1–10)'], E.map(e => [`Hora ${e.hora}`, e.nombre, e.riesgo])),
        nota: '<span id="kTexto">' + E[0].texto + '</span>' })}</div>
      <div class="span-12">${testimonio(c)}</div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  const ch = new Chart($('#chRiesgoHora'), { type: 'line',
    data: { labels: E.map(e => ['Hora ' + e.hora, e.nombre]), datasets: [{ data: E.map(e => e.riesgo), borderColor: PALETA[0], borderWidth: 2, tension: .35,
      fill: { target: 'origin', above: 'rgba(185,71,43,.12)' }, pointRadius: E.map(() => 4), pointBackgroundColor: PALETA[0], pointHoverRadius: 7 }] },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      scales: ejes({ min: 0, max: 10, title: { display: true, text: 'Riesgo (1–10)' } }),
      plugins: { tooltip: { callbacks: { title: x => E[x[0].dataIndex].nombre + ' · Hora ' + E[x[0].dataIndex].hora, label: x => `Riesgo ${x.raw} de 10` } } } } });
  const slider = $('#hourSlider'), veil = $('#veil');
  const set = h => {
    const i = Math.round(h / 3), e = E[i];
    $('#hHand').setAttribute('transform', `rotate(${h * 30} 100 100)`);
    $('#mHand').setAttribute('transform', `rotate(${(h * 90) % 360} 100 100)`);
    const hh = String(h).padStart(2, '0') + ':00';
    $('#hourRead').textContent = `Hora ${h} · ${hh}`; $('#kHora').textContent = hh; $('#kRiesgo').textContent = e.riesgo + ' / 10';
    $('#kEtapa').textContent = e.nombre; $('#kTexto').textContent = e.texto;
    ch.data.datasets[0].pointRadius = E.map((_, j) => j === i ? 9 : 4); ch.update('none');
    veil.style.opacity = (0.2 + e.riesgo / 14).toFixed(2);
  };
  slider.addEventListener('input', e => set(+e.target.value));
  set(0);
  new IntersectionObserver(([e]) => { veil.style.display = e.isIntersecting ? 'block' : 'none'; }, { threshold: .35 }).observe($('#cap2'));
}

/* ==========================================================
   CAPÍTULO 03 · Mapa de cuero de Gideon
   ========================================================== */
function mapaCuero() {
  return `<svg viewBox="0 0 600 340" role="img" aria-label="Mapa de cuero con las tres rutas hacia el puerto">
    <defs><filter id="ink"><feTurbulence baseFrequency=".9" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2"/></filter></defs>
    <g fill="none" stroke="#f3dfb6" stroke-opacity=".25"><path d="M0 250 C120 230 200 290 330 260 S520 300 600 270"/><path d="M0 90 C150 120 260 60 380 100 S520 70 600 90"/></g>
    <!-- río -->
    <path d="M40 330 C120 260 220 250 300 200 S470 150 580 70" stroke="#3b6f86" stroke-width="16" fill="none" opacity=".55"/>
    <!-- rutas -->
    <g class="routes" filter="url(#ink)">
      <path data-r="0" d="M60 120 C170 100 260 140 360 110 S480 80 540 70" stroke="#2a1d12" stroke-width="4" fill="none" stroke-dasharray="10 6"/>
      <path data-r="1" d="M60 120 C110 190 200 245 300 200 S470 150 540 70" stroke="#2F79B8" stroke-width="4" fill="none"/>
      <path data-r="2" d="M60 120 C120 160 150 300 260 290 S430 220 540 70" stroke="#f0c75a" stroke-width="4" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>
    </g>
    <!-- patrullas (x) -->
    <g stroke="#8B1E19" stroke-width="3" class="patrols">
      ${[[150,108],[210,123],[280,128],[330,116],[420,92],[470,84],[250,232],[400,170],[340,276]].map(([x, y]) => `<path d="M${x - 5} ${y - 5}l10 10M${x + 5} ${y - 5}l-10 10"/>`).join('')}
    </g>
    <g font-family="Cinzel" font-size="13" fill="#f3e6cb">
      <circle cx="60" cy="120" r="8" fill="#8B1E19" stroke="#f3e6cb" stroke-width="2"/><text x="40" y="100">Oak Ridge</text>
      <circle cx="540" cy="70" r="9" fill="#D2A334" stroke="#2a1d12" stroke-width="2"/><text x="470" y="52">Puerto fluvial</text>
      <text x="380" y="330" font-size="11" opacity=".8">Callejón del Humo · G.</text>
    </g></svg>`;
}
function cap3() {
  const c = CAPITULOS[3], p = DATOS.patrullas;
  seccion(3, `${cabecera(c)}
    <div class="desk">
      <div class="span-7"><div class="leather">${mapaCuero()}
        <div class="route-btns" id="routeBtns">${p.rutas.map((r, i) => `<button data-r="${i}">${r}</button>`).join('')}<button data-r="all" class="on">Todas</button></div>
        <p class="note" style="color:#f3dfb6;margin-top:8px">✕ = patrulla avistada · trazos de tinta del mapa de cuero de Gideon</p></div></div>
      <div class="span-5">${tarjetaViz({ id: 'chPatrullas', kicker: 'Mapa de cuero · tendencia de pérdidas', titulo: 'Caminos vs. canales', sub: '% de rutas con patrulla',
        tablaHTML: tabla(['Ruta', 'Patrullas (%)'], p.rutas.map((x, i) => [x, p.valores[i]])), nota: 'Los canales secundarios tienen la menor vigilancia.' })}</div>
      <div class="span-12">${testimonio(c)}</div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  const chP = new Chart($('#chPatrullas'), { type: 'bar',
    data: { labels: p.rutas, datasets: [{ data: p.valores, backgroundColor: ['#5b4630', PALETA[1], '#B8892A'], borderRadius: 4, maxBarThickness: 48 }] },
    options: { maintainAspectRatio: false, scales: ejes({ max: 100, title: { display: true, text: '% con patrulla' } }),
      plugins: { tooltip: { callbacks: { label: x => `${x.raw} % de la ruta patrullada` } } } } });
  const paths = $$('#cap3 .routes path');
  $$('#routeBtns button').forEach(b => b.addEventListener('click', () => {
    $$('#routeBtns button').forEach(x => x.classList.toggle('on', x === b));
    paths.forEach(pt => pt.style.opacity = (b.dataset.r === 'all' || pt.dataset.r === b.dataset.r) ? 1 : .15);
    chP.setActiveElements(b.dataset.r === 'all' ? [] : [{ datasetIndex: 0, index: +b.dataset.r }]); chP.update();
  }));
}

/* ==========================================================
   CAPÍTULO 04 · Mercado del puerto
   ========================================================== */
function cap4() {
  const c = CAPITULOS[4], m = DATOS.mercado, pr = DATOS.precioAlgodon, ex = DATOS.exportaciones;
  seccion(4, `${cabecera(c)}
    <div class="desk">
      <div class="span-5">${testimonio(c)}
        <div class="paper gazette-mini tilt-r" style="margin-top:18px"><div class="note">VOL. VII · N.º 34 · 21 DE SEPTIEMBRE DE 1829</div><div class="gz">The Southern Gazette</div>
          <div class="hl">La crisis del algodón estalla: los robos fluviales aterrorizan a los hacendados</div>
          <p class="note">Recompensa por «El Fantasma del Río» y sus saboteadores.</p></div></div>
      <div class="span-7">${tarjetaViz({ id: 'chPrecio', kicker: 'Carta mercantil', titulo: 'Precio del algodón, 1820–1830', sub: 'Centavos por libra · mueve el selector de años',
        kpis: [{ l: 'Año', v: '1829', id: 'kAnio' }, { l: 'Precio', v: '', id: 'kPrecio' }, { l: 'Valor de 50 fardos', v: '', id: 'kValor', alerta: true }],
        cuerpo: `<div class="chart-box"><canvas id="chPrecio" role="img" aria-label="Precio del algodón"></canvas></div>
          <div class="year-ctrl"><label for="yearSlider">Año</label><input id="yearSlider" type="range" min="0" max="${pr.anios.length - 1}" value="${pr.anios.indexOf(1829)}"><output id="yearOut">1829</output></div>`,
        tablaHTML: tabla(['Año', '¢ por libra'], pr.anios.map((a, i) => [a, pr.valores[i].toFixed(1)])),
        nota: 'Fardo de ~400 lb. Valor estimado = 50 fardos × 400 lb × precio.' })}</div>
      <div class="span-6">${tarjetaViz({ id: 'chMercado', kicker: 'Control del puerto', titulo: 'Distribución del mercado de terratenientes', sub: '% del mercado del algodón',
        cuerpo: `<div class="chart-box"><canvas id="chMercado" role="img" aria-label="Distribución del mercado de terratenientes"></canvas></div><div class="legend">${m.etiquetas.map((l, i) => `<span><i style="background:${PALETA[i]}"></i>${l} · ${m.valores[i]} %</span>`).join('')}</div>`,
        tablaHTML: tabla(['Actor del mercado', '%'], m.etiquetas.map((x, i) => [x, m.valores[i]])) })}</div>
      <div class="span-6">${tarjetaViz({ id: 'chExport', kicker: 'Anexo · Registro de la Plantación', titulo: 'Composición de exportaciones por producto', sub: '% de las exportaciones por producto',
        tablaHTML: tabla(['Producto', '%'], ex.etiquetas.map((x, i) => [x, ex.valores[i]])) })}</div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  const centro = { id: 'centro', afterDraw(ch) {
    const { ctx, chartArea: a } = ch; const x = (a.left + a.right) / 2, y = (a.top + a.bottom) / 2;
    ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.font = '700 26px Cinzel, serif'; ctx.fillText(m.valores[0] + ' %', x, y + 4);
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = INK2; ctx.fillText('grandes terratenientes', x, y + 22); ctx.restore(); } };
  new Chart($('#chMercado'), { type: 'doughnut', plugins: [centro],
    data: { labels: m.etiquetas, datasets: [{ data: m.valores, backgroundColor: PALETA.slice(0, m.valores.length), borderColor: '#EFE3C8', borderWidth: 2, hoverOffset: 6 }] },
    options: { maintainAspectRatio: false, cutout: '64%', plugins: { tooltip: { callbacks: { label: x => `${x.label}: ${x.raw} %` } } } } });
  new Chart($('#chExport'), { type: 'bar',
    data: { labels: ex.etiquetas, datasets: [{ data: ex.valores, backgroundColor: ex.etiquetas.map(l => l.startsWith('Algodón') ? PALETA[0] : '#a89676'), borderRadius: 4, maxBarThickness: 22 }] },
    options: { indexAxis: 'y', maintainAspectRatio: false, scales: ejes({ grid: { display: false }, border: { color: '#b9a57e' } }, { grid: { color: GRID }, border: { display: false }, max: 50, title: { display: true, text: '% del valor exportado' } }),
      plugins: { tooltip: { callbacks: { label: x => `${x.raw} % del valor exportado` } } } } });
  const chPr = new Chart($('#chPrecio'), { type: 'line',
    data: { labels: pr.anios, datasets: [{ data: pr.valores, borderColor: '#8B5A1A', borderWidth: 2, tension: .25, fill: { target: 'origin', above: 'rgba(210,163,52,.18)' }, pointRadius: 3, pointBackgroundColor: '#8B5A1A', pointHoverRadius: 6 }] },
    options: { maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, scales: ejes({ title: { display: true, text: '¢ por libra' } }),
      plugins: { tooltip: { callbacks: { label: x => `${x.raw.toFixed(1)} ¢ por libra` } } } } });
  const set = i => {
    const p = pr.valores[i]; $('#yearOut').textContent = pr.anios[i]; $('#kAnio').textContent = pr.anios[i];
    $('#kPrecio').textContent = p.toFixed(1) + ' ¢/lb'; $('#kValor').textContent = '$' + Math.round(50 * 400 * p / 100).toLocaleString('es-CO');
    chPr.data.datasets[0].pointRadius = pr.anios.map((_, j) => j === i ? 8 : 3); chPr.update('none');
  };
  $('#yearSlider').addEventListener('input', e => set(+e.target.value)); set(pr.anios.indexOf(1829));
}

/* ==========================================================
   CAPÍTULO 05 · Visor del mecanismo
   ========================================================== */
function engranaje(cx, cy, r, dientes, color) {
  let d = '';
  for (let i = 0; i < dientes; i++) {
    const a0 = i / dientes * 2 * Math.PI, a1 = (i + .5) / dientes * 2 * Math.PI;
    const p = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    d += `${i ? 'L' : 'M'}${p(a0, r)} L${p(a0 + .08, r + 7)} L${p(a1 - .08, r + 7)} L${p(a1, r)} `;
  }
  return `<path d="${d}Z" fill="${color}" stroke="#5a4012" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="${r * .35}" fill="#7a5a1a"/>`;
}
function mecanismoSVG() {
  return `<svg class="mech" id="mech" viewBox="0 0 400 400" role="img" aria-label="Mecanismo del reloj de bolsillo">
    <defs><clipPath id="corte"><rect x="0" y="0" width="200" height="400"/></clipPath><clipPath id="lensClip"><circle id="lensC" cx="-200" cy="-200" r="62"/></clipPath></defs>
    <g id="mechAll">
      <g class="layer" id="lyBack"><circle cx="200" cy="200" r="150" fill="#b9892c" stroke="#6b4a12" stroke-width="5"/>
        <text x="200" y="300" text-anchor="middle" font-family="Cinzel" font-size="6.5" fill="#4a3208">32.31°N · 86.90°O · B.</text>
        <circle cx="200" cy="200" r="138" fill="none" stroke="#7a5a1a" stroke-dasharray="2 4"/></g>
      <g class="layer" id="lyGears">${engranaje(160, 170, 46, 18, '#d8a93c')}${engranaje(245, 215, 34, 14, '#c99532')}${engranaje(190, 255, 24, 11, '#e0b858')}</g>
      <g class="layer" id="lyDial"><circle cx="200" cy="200" r="128" fill="#f3e6cb" stroke="#a8782a" stroke-width="4"/>
        ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<text x="${200 + 104 * Math.sin(a)}" y="${206 - 104 * Math.cos(a)}" text-anchor="middle" font-family="Cinzel" font-size="16" fill="#2a1d12">${['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][i]}</text>`; }).join('')}
        <text x="200" y="160" text-anchor="middle" font-family="Cinzel" font-size="11" fill="#5b4630">OAK RIDGE · 1829</text>
        <line x1="200" y1="200" x2="200" y2="120" stroke="#2a1d12" stroke-width="5" stroke-linecap="round" transform="rotate(60 200 200)"/>
        <line x1="200" y1="200" x2="200" y2="96" stroke="#8B1E19" stroke-width="2.5" transform="rotate(-20 200 200)"/><circle cx="200" cy="200" r="7" fill="#2a1d12"/></g>
      <g class="layer" id="lyCase"><circle cx="200" cy="200" r="168" fill="none" stroke="#c9952e" stroke-width="20"/><rect x="186" y="14" width="28" height="22" rx="6" fill="#b8892a"/></g>
    </g>
    <g id="lens" style="display:none"><g clip-path="url(#lensClip)"><rect x="0" y="0" width="400" height="400" fill="#f3e6cb"/><use id="lensUse" href="#mechAll"/></g>
      <circle id="lensRing" cx="-200" cy="-200" r="62" fill="none" stroke="#b8892a" stroke-width="8"/></g></svg>`;
}
function cap5() {
  const c = CAPITULOS[5];
  const modos = ['Despiece', 'Explosión', 'Corte', 'Transparencia', 'Zoom'];
  seccion(5, `${cabecera(c)}
    <div class="desk">
      <div class="span-8"><div class="paper"><div class="viz-head"><div><div class="note" style="letter-spacing:.15em">INSPECCIÓN DEL ARTEFACTO</div><div class="t">El reloj de bolsillo sustraído</div>
        <div class="s">Elige un modo de visualización técnica. Con la lupa (Zoom) recorre la placa trasera.</div></div></div>
        <div class="modes" id="modes">${modos.map((m, i) => `<button data-m="${m}" class="${i === 0 ? 'on' : ''}">${m}</button>`).join('')}</div>
        ${mecanismoSVG()}<div class="coords" id="coords"></div></div></div>
      <div class="span-4"><div class="paper tilt-r"><div class="note" style="letter-spacing:.15em">PISTA RECUPERADA</div><div class="t" style="font-family:var(--display);font-size:18px">Coordenadas grabadas</div>
        <p>Hay marcas diminutas en la placa trasera. Usa <b>Transparencia</b> o la <b>lupa</b> para leerlas.</p>
        <div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><span>Latitud</span><b id="lat" style="font-size:20px">— —</b></div><div class="stat"><span>Longitud</span><b id="lon" style="font-size:20px">— —</b></div></div>
        <p class="note" style="margin-top:10px">Cruzadas con el mapa de cuero, señalan un punto ciego en la bahía.</p></div></div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  const ly = id => $('#' + id);
  const revelar = () => { $('#lat').textContent = '32.31° N'; $('#lon').textContent = '86.90° O'; $('#coords').textContent = '32.31° N · 86.90° O'; };
  const reset = () => { ['lyBack', 'lyGears', 'lyDial', 'lyCase'].forEach(i => { ly(i).style.transform = ''; ly(i).style.opacity = 1; ly(i).removeAttribute('clip-path'); }); $('#lens').style.display = 'none'; };
  const aplicar = m => {
    reset();
    if (m === 'Despiece') { ly('lyCase').style.transform = 'translate(-40px,-40px) scale(1.05)'; ly('lyDial').style.transform = 'translate(25px,25px)'; }
    if (m === 'Explosión') { ly('lyCase').style.transform = 'translate(0,-60px)'; ly('lyDial').style.transform = 'translate(70px,-10px) scale(.6)'; ly('lyDial').style.transformOrigin = '200px 200px'; ly('lyGears').style.transform = 'translate(-30px,20px)'; }
    if (m === 'Corte') { ly('lyDial').setAttribute('clip-path', 'url(#corte)'); ly('lyCase').setAttribute('clip-path', 'url(#corte)'); }
    if (m === 'Transparencia') { ly('lyDial').style.opacity = .12; ly('lyGears').style.opacity = .35; revelar(); }
    if (m === 'Zoom') { ly('lyDial').style.opacity = .04; ly('lyGears').style.opacity = .35; $('#lens').style.display = ''; }
  };
  $$('#modes button').forEach(b => b.addEventListener('click', () => { $$('#modes button').forEach(x => x.classList.toggle('on', x === b)); aplicar(b.dataset.m); }));
  const svg = $('#mech');
  svg.addEventListener('pointermove', ev => {
    if ($('#lens').style.display === 'none') return;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse()), k = 2.6;
    $('#lensC').setAttribute('cx', p.x); $('#lensC').setAttribute('cy', p.y);
    $('#lensRing').setAttribute('cx', p.x); $('#lensRing').setAttribute('cy', p.y);
    $('#lensUse').setAttribute('transform', `translate(${p.x - k * p.x} ${p.y - k * p.y}) scale(${k})`);
    if (Math.abs(p.x - 200) < 45 && Math.abs(p.y - 298) < 18) revelar();
  });
}

/* ==========================================================
   CAPÍTULO 06 · Plano del almacén + mapa de producción
   ========================================================== */
function planoSVG() {
  // zonas: [x,y,w,h,nombre,intensidad 0-4]
  const zonas = [[20, 20, 150, 110, 'Bodega de algodón', 3], [170, 20, 180, 70, 'Piso central', 2], [350, 20, 170, 110, 'Muelle de carga', 1],
    [20, 130, 150, 120, 'Fardos en llamas', 4], [170, 90, 180, 160, 'Oficina de registro', 3], [350, 130, 100, 120, 'Compuerta del canal', 0], [450, 130, 70, 120, '', 0]];
  return `<svg viewBox="0 0 540 270" role="img" aria-label="Plano del almacén con propagación del fuego y salidas" style="width:100%;display:block;margin-top:12px">
    ${zonas.map(([x, y, w, h, n, k]) => `<g class="zona" data-n="${n || 'Pasillo del canal'}" data-k="${k}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${RAMPA_FUEGO[k]}" stroke="#2a1d12" stroke-width="3"/>
      <text x="${x + 10}" y="${y + 22}" font-family="Cinzel" font-size="12" fill="#2a1d12">${n}</text></g>`).join('')}
    <path d="M90 200 C150 180 230 210 300 200 S380 190 470 190" stroke="#D2A334" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="1 9"/>
    <path d="M90 200 C140 120 260 80 430 60" stroke="#8B1E19" stroke-width="3" fill="none" stroke-dasharray="6 5"/>
    <circle cx="90" cy="200" r="11" fill="#D2A334" stroke="#2a1d12" stroke-width="2"/><text x="85" y="205" font-family="Cinzel" font-size="12">A</text>
    <circle cx="430" cy="60" r="10" fill="#8B1E19"/><circle cx="480" cy="190" r="11" fill="#2f7a4f"/>
    <text x="410" y="262" font-family="Inter" font-size="10" fill="#2a1d12">● salida al canal</text></svg>
    <div class="legend"><span><i style="background:#D2A334"></i>Ruta de escape</span><span><i style="background:#8B1E19"></i>Salida principal (bloqueada)</span><span><i style="background:#2f7a4f"></i>Compuerta del canal</span></div>
    <div class="ramp"><span>Sin fuego</span><span class="g" style="background:linear-gradient(90deg,${RAMPA_FUEGO.join(',')})"></span><span>Fuego intenso</span></div>`;
}
function mapaSur() {
  const P = DATOS.produccion, C = DATOS.centroides, E = DATOS.etapas;
  const vals = Object.values(P), vmin = 45, vmax = 150;
  const color = v => RAMPA_FUEGO[Math.min(4, Math.floor((v - vmin) / (vmax - vmin + 1e-9) * 4.999))];
  const nombres = { AL: 'Alabama', MS: 'Misisipi', LA: 'Luisiana', GA: 'Georgia', SC: 'Carolina del Sur', NC: 'Carolina del Norte', TN: 'Tennessee', FL: 'Florida', AR: 'Arkansas', TX: 'Texas', VA: 'Virginia', KY: 'Kentucky', MO: 'Misuri', OK: 'Oklahoma' };
  const estados = Object.entries(ESTADOS_SVG).map(([k, d]) => `<path class="st" data-k="${k}" d="${d}" fill="${P[k] ? color(P[k]) : '#e4dac2'}" stroke="#b8a87f" stroke-width="1"><title>${nombres[k]}${P[k] ? ': ' + P[k] : ' · sin dato'}</title></path>`).join('');
  const pts = E.map(e => e.en.estado ? C[e.en.estado] : [(C[e.en.tramo[0]][0] + C[e.en.tramo[1]][0]) / 2, (C[e.en.tramo[0]][1] + C[e.en.tramo[1]][1]) / 2 + 10]);
  const riesgoColor = r => r >= 7 ? '#8B1E19' : r >= 4 ? '#A9781F' : '#2E5F58';
  const ruta = `<path d="M${pts.map(p => p.join(' ')).join(' L')}" fill="none" stroke="#2a1d12" stroke-width="2.5" stroke-dasharray="6 4"/>` +
    pts.map((p, i) => `<g class="stage" data-i="${i}" tabindex="0" style="cursor:pointer"><circle cx="${p[0]}" cy="${p[1]}" r="9" fill="${riesgoColor(E[i].riesgo)}" stroke="#fff" stroke-width="2"/><text x="${p[0]}" y="${p[1] + 4}" text-anchor="middle" font-family="Inter" font-size="9" font-weight="700" fill="#fff">${E[i].riesgo}</text></g>`).join('');
  const etiquetas = Object.keys(P).map(k => `<text x="${C[k][0]}" y="${C[k][1] - 14}" text-anchor="middle" font-family="Inter" font-size="10" font-weight="600" fill="#2a1d12">${k} ${P[k]}</text>`).join('');
  return `<svg viewBox="500 290 320 220" role="img" aria-label="Mapa de producción de algodón y ruta de escape" style="width:100%;display:block;margin-top:10px;background:#f3ead6;border:1px solid var(--linea)">${estados}${etiquetas}${ruta}</svg>
    <div class="ramp"><span>Menor producción (45)</span><span class="g" style="background:linear-gradient(90deg,${RAMPA_FUEGO.join(',')})"></span><span>Mayor (150)</span></div>
    <div class="legend"><span><i style="background:#8B1E19;border-radius:50%"></i>Riesgo alto</span><span><i style="background:#A9781F;border-radius:50%"></i>Riesgo medio</span><span><i style="background:#2E5F58;border-radius:50%"></i>Riesgo bajo</span><span>– – Ruta de escape de August</span></div>`;
}
function cap6() {
  const c = CAPITULOS[6], P = DATOS.produccion, E = DATOS.etapas;
  const nom = { NC: 'Carolina del Norte', SC: 'Carolina del Sur', GA: 'Georgia', AL: 'Alabama', LA: 'Luisiana' };
  seccion(6, `${cabecera(c)}
    <div class="desk">
      <div class="span-5">${testimonio(c)}</div>
      <div class="span-7">${tarjetaViz({ id: 'plano', kicker: 'Plano de emergencia · Almacén C', titulo: 'Propagación del fuego y salidas al canal',
        kpis: [{ l: 'Fuego', v: '68 %', alerta: true }, { l: 'Salida principal', v: 'Bloqueada', alerta: true }, { l: 'Compuerta del canal', v: 'Accesible' }],
        cuerpo: planoSVG(), nota: '⚑ La salida principal colapsa en menos de 3 minutos.' })}</div>
      <div class="span-8">${tarjetaViz({ id: 'mapaSur', kicker: 'Registro de la Plantación · geografía', titulo: 'Producción de algodón y ruta de escape',
        sub: 'Producción por estado (escala 45–150) y riesgo en cada etapa de la ruta. Toca una etapa.', cuerpo: mapaSur(),
        tablaHTML: tabla(['Estado', 'Producción'], Object.entries(P).sort((a, b) => b[1] - a[1]).map(([k, v]) => [nom[k], v])) })}</div>
      <div class="span-4"><div class="paper" id="etapaInfo"></div></div>
      <div class="span-12">${dilema(c)}</div>
    </div>`);
  const info = i => { const e = E[i]; $('#etapaInfo').innerHTML = `<div class="note" style="letter-spacing:.15em">ETAPA ${i + 1} DE ${E.length} · HORA ${e.hora}</div>
    <div class="t" style="font-family:var(--display);font-size:20px;margin-top:4px">${e.nombre}</div><div class="note">${e.lugar}</div>
    <div class="stats" style="grid-template-columns:1fr"><div class="stat ${e.riesgo >= 7 ? 'alert' : ''}"><span>Riesgo</span><b>${e.riesgo} / 10</b></div></div><p>${e.texto}</p>`; };
  $$('#cap6 .stage').forEach(g => { const f = () => info(+g.dataset.i); g.addEventListener('click', f); g.addEventListener('focus', f); g.addEventListener('pointerenter', f); });
  info(0);
  $$('#cap6 .zona').forEach(z => hover(z, () => `${z.dataset.n} · intensidad ${z.dataset.k}/4`));
}

/* ==========================================================
   CAPÍTULO 07 · Dossier clandestino
   ========================================================== */
function cap7() {
  const c = CAPITULOS[7];
  seccion(7, `${cabecera(c)}
    <div class="desk">
      <div class="span-12">${dilema(c)}</div>
      <div class="span-8"><div class="paper report" id="report">
        <div class="official"><div class="note">REGISTRO OFICIAL · 1829</div><div class="t">Dossier Clandestino de Travesía</div></div>
        <div id="badge"></div>
        <div class="desk" style="margin-top:14px;gap:14px">
          <div class="span-6"><div class="viz-head"><div><div class="t" style="font-size:14px">Riesgo acumulado</div><div class="s">% por capítulo</div></div></div><div class="chart-box" style="height:180px"><canvas id="chRiesgoFin" role="img" aria-label="Riesgo acumulado por capítulo"></canvas></div></div>
          <div class="span-6"><div class="viz-head"><div><div class="t" style="font-size:14px">Fondos de la red</div><div class="s">dólares por capítulo</div></div></div><div class="chart-box" style="height:180px"><canvas id="chFondosFin" role="img" aria-label="Fondos por capítulo"></canvas></div></div>
        </div>
        <div id="resumen" style="margin-top:12px"></div>
      </div></div>
      <div class="span-4"><div class="paper vote" id="vote"></div>
        <div class="actions"><button id="btnPrint">Exportar registro</button><button class="alt" id="btnShare">Compartir</button><button class="alt" id="btnReset">Reiniciar travesía</button></div></div>
    </div>`);
  pintarDossier(); pintarVoto();
  $('#btnPrint').addEventListener('click', () => window.print());
  $('#btnShare').addEventListener('click', async () => {
    const txt = `Completé la Ruta del Contrabando (1829) — riesgo ${estado.riesgo} %, fondos $${estado.fondos}.`;
    try { if (navigator.share) await navigator.share({ title: 'El Imperio del Algodón', text: txt, url: location.href }); else { await navigator.clipboard.writeText(txt + ' ' + location.href); alertaSuave('Enlace copiado'); } } catch (e) {}
  });
  $('#btnReset').addEventListener('click', () => { estado = { ...ESTADO_INICIAL, decisiones: {} }; guardar(); location.hash = ''; location.reload(); });
}
let chRF, chFF;
function serie() {
  // reconstruye riesgo y fondos capítulo a capítulo según las decisiones tomadas
  let r = 0, f = 100; const R = [0], F = [100];
  for (let i = 1; i <= 7; i++) { const d = estado.decisiones[i]; if (d !== undefined) { r += CAPITULOS[i].opciones[d].riesgo; f += CAPITULOS[i].opciones[d].fondos; } R.push(Math.max(0, r)); F.push(f); }
  return { R, F };
}
function pintarDossier() {
  const { R, F } = serie(); const labels = ['00', '01', '02', '03', '04', '05', '06', '07'];
  const d7 = estado.decisiones[7];
  let ins = d7 !== undefined ? CAPITULOS[7].opciones[d7].insignia : null;
  if (ins && d7 === 1 && estado.fondos >= 500) ins = 'Infiltrado Comercial y Liberador del Río';
  if (ins && estado.riesgo >= 60) ins = 'Fugitivo Temerario';
  $('#badge').innerHTML = `<div class="badge"><svg class="medal" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#8B1E19"/><circle cx="50" cy="50" r="36" fill="none" stroke="#f3e6cb" stroke-width="2" stroke-dasharray="3 3"/>
    <g fill="#f7f1e3"><circle cx="50" cy="40" r="9"/><circle cx="41" cy="50" r="9"/><circle cx="59" cy="50" r="9"/><circle cx="50" cy="57" r="9"/></g></svg>
    <div><div class="note">INSIGNIA OTORGADA</div><div class="bt">${ins || 'Pendiente: completa la decisión final'}</div>
    <div class="note">Riesgo final ${estado.riesgo} % · Fondos $${estado.fondos} · ${Object.keys(estado.decisiones).length} de 7 decisiones</div></div></div>`;
  const filas = CAPITULOS.slice(1).map(cc => { const d = estado.decisiones[cc.id]; return [`${String(cc.id).padStart(2, '0')} ${cc.titulo}`, d === undefined ? '—' : `Opción ${cc.opciones[d].letra}`]; });
  $('#resumen').innerHTML = tabla(['Capítulo', 'Decisión'], filas).replace('class="data-table"', 'class="data-table show"');
  const base = (canvas, data, color, txt, fmt) => new Chart(canvas, { type: 'line',
    data: { labels, datasets: [{ data, borderColor: color, borderWidth: 2, pointRadius: 3, pointBackgroundColor: color, stepped: false, tension: .2 }] },
    options: { maintainAspectRatio: false, scales: ejes({ title: { display: false } }), plugins: { tooltip: { callbacks: { title: x => 'Capítulo ' + x[0].label, label: x => fmt(x.raw) } } } } });
  if (chRF) { chRF.data.datasets[0].data = R; chRF.update(); chFF.data.datasets[0].data = F; chFF.update(); }
  else { chRF = base($('#chRiesgoFin'), R, PALETA[0], 'Riesgo', v => v + ' %'); chFF = base($('#chFondosFin'), F, '#8B5A1A', 'Fondos', v => '$' + v); }
}
function pintarVoto() {
  let votos; try { votos = JSON.parse(localStorage.getItem('imperio-votos')) || [0, 0, 0]; } catch (e) { votos = [0, 0, 0]; }
  const total = votos.reduce((a, b) => a + b, 0);
  $('#vote').innerHTML = `<div class="note">VOTACIÓN</div><div class="t" style="font-family:var(--display);font-size:17px">${VOTACION.pregunta}</div>
    ${VOTACION.opciones.map((o, i) => `<button data-v="${i}"><span class="vbar" style="width:${total ? votos[i] / total * 100 : 0}%"></span><span>${o}${total ? ` · ${Math.round(votos[i] / total * 100)} %` : ''}</span></button>`).join('')}
    <p class="note" style="margin-top:8px">${total} voto(s) en este navegador.</p>`;
  $$('#vote button').forEach(b => b.addEventListener('click', () => { votos[+b.dataset.v]++; try { localStorage.setItem('imperio-votos', JSON.stringify(votos)); } catch (e) {} pintarVoto(); }));
}

/* ==========================================================
   Decisiones, HUD, riel e inventario
   ========================================================== */
function decidir(capId, i) {
  const c = CAPITULOS[capId], o = c.opciones[i];
  estado.decisiones[capId] = i;
  recalcular(); guardar();
  $$(`#dil-${capId} .opt`).forEach((b, j) => { b.disabled = true; b.classList.toggle('chosen', j === i); });
  mostrarResultado(capId);
  actualizarHUD();
  if (capId === 7 || $('#badge')) pintarDossier();
}
function recalcular() { const { R, F } = serie(); estado.riesgo = R[R.length - 1]; estado.fondos = F[F.length - 1]; }
function mostrarResultado(capId) {
  const d = estado.decisiones[capId]; if (d === undefined) return;
  const o = CAPITULOS[capId].opciones[d], bueno = !!o.elegida, out = $('#out-' + capId);
  out.className = 'outcome show ' + (bueno ? 'good' : 'bad');
  out.innerHTML = `<span class="stamp">${bueno ? 'SIN SOSPECHAS' : 'ALERTA'}</span><b>Opción ${o.letra}.</b> ${o.resultado}
    <div class="delta">Riesgo ${o.riesgo > 0 ? '+' : ''}${o.riesgo} % · Fondos ${o.fondos ? '+$' + o.fondos : 'sin cambio'} → Riesgo total ${estado.riesgo} % · Fondos $${estado.fondos}</div>`;
}
function actualizarHUD() {
  $('#riskVal').textContent = estado.riesgo + ' %';
  $('#riskFill').style.width = Math.min(100, estado.riesgo) + '%';
  $('#fundsVal').textContent = '$' + estado.fondos;
  const juntos = estado.decisiones[3] !== undefined;
  $('#allyName').textContent = estado.aliado ? (juntos ? 'August & Gideon' : 'August') : 'Elige a tu aliado';
  $('#allySeal').textContent = estado.aliado ? (juntos ? 'A·G' : 'A') : '?';
}
function riel() {
  const gearPath = (() => { let d = ''; const n = 10; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * 2 * Math.PI, r = i % 2 ? 15 : 20; d += `${i ? 'L' : 'M'}${(22 + r * Math.cos(a)).toFixed(1)} ${(22 + r * Math.sin(a)).toFixed(1)} `; } return d + 'Z'; })();
  $('#rail').innerHTML = CAPITULOS.map(c => `<a class="gear" href="#cap${c.id}" data-c="${c.id}" aria-label="Capítulo ${c.id}: ${c.titulo}">
    <svg viewBox="0 0 44 44"><path d="${gearPath}" fill="currentColor" stroke="#000" stroke-width="1"/><circle cx="22" cy="22" r="10" fill="#e8d6b0"/></svg><span>${c.id}</span><em class="tip">${String(c.id).padStart(2, '0')} · ${c.titulo}</em></a>`).join('');
  const gears = $$('.gear');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const id = +e.target.id.replace('cap', '');
    gears.forEach(g => { const k = +g.dataset.c; g.classList.toggle('active', k === id); g.classList.toggle('done', estado.decisiones[k] !== undefined || (k === 0 && estado.aliado)); });
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('.chapter').forEach(s => io.observe(s));
}
const INVENTARIO = {
  reloj: () => `<h3>El reloj de bolsillo del capataz</h3><p>Averiado, pero su mecanismo guarda los turnos de guardia. Sirve para medir el tiempo en el trayecto y esconde coordenadas en su placa trasera.</p>
    <div class="chart-box" style="height:180px"><canvas id="mini"></canvas></div><p class="note">Guardias activos por franja (cap. 01).</p>`,
  eslabon: () => `<h3>El eslabón de hierro</h3><p>Arrancado de uno de sus antiguos grilletes en la herrería de Oak Ridge. Amuleto, recordatorio del dolor de su gente y, en el clímax, arma de liberación.</p><p class="quote">«La promesa inviolable de ganar su libertad.»</p>`,
  capsula: () => `<h3>La cápsula de algodón crudo</h3><p>Fibras suaves y espinas duras: la riqueza dorada del Sur construida sobre la condena de su pueblo.</p>
    <div class="stats"><div class="stat alert"><span>Castigo</span><b>${DATOS.cuotas.castigo}</b><span>lb/día</span></div><div class="stat"><span>Promedio</span><b>${DATOS.cuotas.promedio}</b><span>lb/día</span></div><div class="stat"><span>Máximo</span><b>${DATOS.cuotas.maxima}</b><span>lb/día</span></div></div>`,
  mapa: () => `<h3>El mapa de cuero de Gideon</h3><p>Rutas de contrabando, mareas del río, horarios de patrulla y protocolos de emergencia anotados a mano.</p><div class="leather" style="margin-top:10px">${mapaCuero()}</div>`
};
function inventario() {
  const modal = $('#modal');
  $$('.item').forEach(b => b.addEventListener('click', () => {
    $('#modalBody').innerHTML = INVENTARIO[b.dataset.item](); modal.classList.add('open');
    if (b.dataset.item === 'reloj') new Chart($('#mini'), { type: 'bar', data: { labels: DATOS.guardias.horas, datasets: [{ data: DATOS.guardias.valores, backgroundColor: DATOS.guardias.valores.map((_, i) => i === DATOS.guardias.minimo ? '#2f7a4f' : '#B8892A'), borderRadius: 4 }] }, options: { maintainAspectRatio: false, scales: ejes() } });
    $('.close', modal).focus();
  }));
  const cerrar = () => modal.classList.remove('open');
  $('.close', modal).addEventListener('click', cerrar);
  modal.addEventListener('click', e => { if (e.target === modal) cerrar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
}
function hover(el, texto) {
  el.addEventListener('pointermove', e => { tip.textContent = texto(); tip.style.display = 'block'; tip.style.left = (e.clientX + 14) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; });
  el.addEventListener('pointerleave', () => { tip.style.display = 'none'; });
  el.addEventListener('focus', () => { const r = el.getBoundingClientRect(); tip.textContent = texto(); tip.style.display = 'block'; tip.style.left = r.right + 'px'; tip.style.top = r.top + 'px'; });
  el.addEventListener('blur', () => { tip.style.display = 'none'; });
}
function alertaSuave(t) { tip.textContent = t; tip.style.display = 'block'; tip.style.left = '50%'; tip.style.top = '80px'; setTimeout(() => tip.style.display = 'none', 1600); }

/* ---------- Arranque ---------- */
cap0(); cap1(); cap2(); cap3(); cap4(); cap5(); cap6(); cap7();
story.addEventListener('click', e => {
  const b = e.target.closest('.opt'); if (b && !b.disabled) decidir(+b.dataset.cap, +b.dataset.opt);
  const t = e.target.closest('.toggle-table'); if (t) { const tb = $('#' + t.dataset.for + ' .data-table'); tb.classList.toggle('show'); t.textContent = tb.classList.contains('show') ? 'Ocultar tabla' : 'Ver tabla'; }
});
Object.keys(estado.decisiones).forEach(k => mostrarResultado(+k));
recalcular(); actualizarHUD(); riel(); inventario();
})();
