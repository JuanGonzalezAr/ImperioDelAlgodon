/* ==========================================================
   El Imperio del Algodón · Visor 3D del reloj del capataz
   Monta las 5 piezas (tapa, mecanismo, esfera, bisel + agujas y
   cristal generados aquí) y aplica las herramientas infográficas:
   Montado · Despiece · Explosión · Corte · Transparencia · Zoom (lupa)
   ========================================================== */
import * as T from './three-bundle.js';

const PIEZAS = {
  tapa: { archivo: 'reloj-tapa.glb', nombre: 'Tapa trasera', s: [1.053, 1.053, 1.053], p: [0, 0, 0], ry: 0,
    info: 'Caja de latón martillado. Encierra el mecanismo y protege el grabado de miradas curiosas.' },
  mecanismo: { archivo: 'reloj-mecanismo.glb', nombre: 'Mecanismo', s: [1.07, 1.07, 1.07], p: [0, 0.03, -0.107], ry: 0,
    info: 'Tren de engranajes, volante y escape. Marca los turnos de guardia. En la platina, junto a las 6, está el grabado.' },
  esfera: { archivo: 'reloj-esfera.glb', nombre: 'Esfera', s: [1.161, 1.16, 1.268], p: [0.006, 0.222, -0.304], ry: 0,
    info: 'Esfera de porcelana con el mapa del Sur, fases lunares y la marca KING. Tapa por completo lo que hay debajo.' },
  bisel: { archivo: 'reloj-bisel.glb', nombre: 'Bisel y asa', s: [1.52, 1.52, 1.52], p: [0, 0.17, -0.418], ry: Math.PI,
    info: 'Aro grabado con flores de algodón, corona y asa. Sujeta el cristal sobre la esfera.' }
};
const EXTRA = {
  agujas: { nombre: 'Agujas', info: 'Agujas de acero pavonado. Marcan la hora del turno de guardia más débil.' },
  cristal: { nombre: 'Cristal', info: 'Cristal abombado. Deja ver la hora, pero no lo que esconde la esfera.' }
};
// Desplazamientos por modo [x, y, z] relativos a la posición montada
const EXPLOSION = { tapa: [0, -0.7, 0], mecanismo: [0, -0.2, 0], esfera: [0, 0.38, 0], agujas: [0, 0.72, 0], bisel: [0, 1.08, 0], cristal: [0, 1.4, 0] };
const DESPIECE_ANCHO = { tapa: [-2.25, 0, -1.35], mecanismo: [0, 0, -1.35], esfera: [2.25, 0, -1.35], agujas: [-2.25, 0, 1.6], bisel: [0, 0, 1.75], cristal: [2.25, 0, 1.6] };
const DESPIECE_ALTO = { tapa: [-1.1, 0, -2.9], mecanismo: [1.1, 0, -2.9], esfera: [-1.1, 0, -0.2], agujas: [1.1, 0, -0.3], bisel: [-1.1, 0, 3.15], cristal: [1.1, 0, 2.6] };
const MESA = { tapa: 0, mecanismo: -0.03, esfera: -0.2, agujas: -0.28, bisel: -0.15, cristal: -0.2 };
const CAMARAS = {
  Montado: { pos: [0, 3.1, 2.3], mira: [0, 0.1, 0] },
  'Despiece': { pos: [0, 10.6, 4.4], mira: [0, 0, 0.3], alto: { pos: [0, 17.5, 4.6], mira: [0, 0, 0.35] } },
  'Explosión': { pos: [3.7, 2.5, 4.0], mira: [0, 0.35, 0] },
  Corte: { pos: [3.0, 1.7, 1.5], mira: [0, 0.05, 0] },
  Transparencia: { pos: [0, 3.0, 2.0], mira: [0, 0, 0.05] },
  Zoom: { pos: [0, 2.35, 1.35], mira: [0, 0, 0.18] }
};

export async function montarReloj3D(stage, opts = {}) {
  const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
  if (!ok) throw new Error('WebGL no disponible');

  const W = () => stage.clientWidth, H = () => stage.clientHeight;
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.localClippingEnabled = true;
  renderer.domElement.className = 'r3d-canvas';
  stage.appendChild(renderer.domElement);

  const capa = document.createElement('div'); capa.className = 'r3d-labels'; stage.appendChild(capa);
  const cargador = document.createElement('div'); cargador.className = 'r3d-loader'; cargador.innerHTML = '<span>Abriendo el estuche del relojero…</span><i><b></b></i>'; stage.appendChild(cargador);

  const scene = new T.Scene();
  const pm = new T.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new T.RoomEnvironment(), 0.04).texture;
  const sol = new T.DirectionalLight(0xffe2b0, 1.4); sol.position.set(2.5, 5, 1.5); scene.add(sol);
  scene.add(new T.HemisphereLight(0xfff3dc, 0x3a2a14, 0.35));

  const camera = new T.PerspectiveCamera(32, W() / H(), 0.05, 60);
  camera.position.set(0, 3.1, 2.3);
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 1.2; controls.maxDistance = 22;
  controls.target.set(0, 0.1, 0); controls.autoRotateSpeed = 0.8;

  const raiz = new T.Group(); scene.add(raiz);
  const grupos = {};      // nombre -> Group (posición montada + desplazamiento)
  const materiales = {};  // nombre -> [Material]

  // --- carga de los GLB con progreso combinado
  const loader = new T.GLTFLoader().setMeshoptDecoder(T.MeshoptDecoder);
  const nombres = Object.keys(PIEZAS);
  const prog = Object.fromEntries([...nombres, 'taller'].map(n => [n, 0]));
  const barra = cargador.querySelector('b');
  const avance = () => { const v = Object.values(prog); barra.style.width = Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) + '%'; };
  const cargar = (url, n) => new Promise((res, rej) => loader.load(url, g => { prog[n] = 1; avance(); res(g); },
    e => { if (e.total) { prog[n] = e.loaded / e.total; avance(); } }, rej));

  const gltfs = await Promise.all(nombres.map(n => cargar(PIEZAS[n].archivo, n)));
  const registrar = (n, obj) => {
    const g = new T.Group(); g.name = n; g.add(obj); raiz.add(g); grupos[n] = g; materiales[n] = [];
    obj.traverse(o => { if (o.isMesh) {
      o.material = o.material.clone(); o.material.side = T.DoubleSide; o.userData.pieza = n;
      o.material.userData.op = o.material.opacity; materiales[n].push(o.material);
    } });
    g.userData.base = new T.Vector3(); return g;
  };
  nombres.forEach((n, i) => {
    const P = PIEZAS[n], o = gltfs[i].scene;
    o.scale.set(...P.s); o.position.set(...P.p); o.rotation.y = P.ry;
    registrar(n, o);
  });

  // --- agujas (acero pavonado) generadas aquí
  const acero = new T.MeshStandardMaterial({ color: 0x1d2536, metalness: 0.85, roughness: 0.28 });
  const rojo = new T.MeshStandardMaterial({ color: 0x8b1e19, metalness: 0.5, roughness: 0.4 });
  const aguja = (largo, ancho, punta, mat, cola = 0.12) => {
    const s = new T.Shape();
    s.moveTo(-ancho * 0.45, cola); s.lineTo(-ancho * 0.45, -largo * 0.62);
    s.quadraticCurveTo(-ancho * 1.6, -largo * (0.62 + punta * 0.45), 0, -largo);
    s.quadraticCurveTo(ancho * 1.6, -largo * (0.62 + punta * 0.45), ancho * 0.45, -largo * 0.62);
    s.lineTo(ancho * 0.45, cola); s.lineTo(-ancho * 0.45, cola);
    const geo = new T.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false });
    geo.rotateX(Math.PI / 2); // del plano XY al plano XZ: la punta apunta a −Z (las XII)
    const m = new T.Mesh(geo, mat); m.userData.pieza = 'agujas'; return m;
  };
  const hAg = new T.Group();
  const yA = 0.29;
  const horaria = aguja(0.44, 0.034, 0.5, acero); horaria.position.y = yA;
  const minutero = aguja(0.68, 0.024, 0.35, acero); minutero.position.y = yA + 0.012;
  const segundero = aguja(0.74, 0.01, 0.1, rojo, 0.2); segundero.position.y = yA + 0.024;
  const eje = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.05, 24), acero); eje.position.y = yA + 0.02; eje.userData.pieza = 'agujas';
  hAg.add(horaria, minutero, segundero, eje);
  registrar('agujas', new T.Group().add(hAg));

  // --- cristal abombado
  const cristalMat = new T.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, clearcoat: 1, depthWrite: false, side: T.DoubleSide });
  cristalMat.userData.vidrio = true;
  const cristalGeo = new T.SphereGeometry(2.2, 64, 12, 0, Math.PI * 2, 0, Math.asin(0.9 / 2.2));
  const cristal = new T.Mesh(cristalGeo, cristalMat); cristal.position.y = 0.33 - 2.2 * Math.cos(Math.asin(0.9 / 2.2)); cristal.userData.pieza = 'cristal'; cristal.renderOrder = 5;
  registrar('cristal', new T.Group().add(cristal));

  // --- grabado oculto en la platina (bajo la esfera, junto a las 6)
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256;
  const cx = cv.getContext('2d');
  cx.font = '600 92px Cinzel, Georgia, serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
  cx.fillStyle = 'rgba(255,236,190,.55)'; cx.fillText('32.31° N · 86.90° O', 514, 102);
  cx.fillStyle = 'rgba(52,30,6,.95)'; cx.fillText('32.31° N · 86.90° O', 510, 98);
  cx.font = 'italic 54px Lora, Georgia, serif'; cx.fillText('— B. —', 512, 198);
  const grabTex = new T.CanvasTexture(cv); grabTex.colorSpace = T.SRGBColorSpace; grabTex.anisotropy = 8;
  const grabMat = new T.MeshStandardMaterial({ map: grabTex, transparent: true, metalness: 0.3, roughness: 0.6, emissive: 0xd9a441, emissiveMap: grabTex, emissiveIntensity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const grabado = new T.Mesh(new T.PlaneGeometry(0.62, 0.155), grabMat); grabado.rotation.x = -Math.PI / 2; grabado.userData.pieza = 'mecanismo';
  raiz.updateMatrixWorld(true);
  { // apoyarlo sobre la superficie real de la platina
    const rc = new T.Raycaster(new T.Vector3(0, 2, 0.68), new T.Vector3(0, -1, 0));
    const hit = rc.intersectObject(grupos.mecanismo, true)[0];
    grabado.position.set(0, (hit ? hit.point.y : 0.16) + 0.006, 0.68);
  }
  grupos.mecanismo.add(grabado); materiales.mecanismo.push(grabMat); grabMat.userData.op = 1;

  // --- pieza de taller: el calibre seccionado (modelo "completo")
  const taller = (await cargar('reloj-completo.glb', 'taller')).scene;
  taller.scale.setScalar(1.25); taller.traverse(o => { if (o.isMesh) { o.material.side = T.DoubleSide; o.userData.pieza = 'taller'; } });
  taller.visible = false; scene.add(taller);
  cargador.classList.add('fuera'); setTimeout(() => cargador.remove(), 700);

  // --- etiquetas HTML (Explosión y Despiece)
  const etiquetas = {};
  const todas = [...nombres, 'agujas', 'cristal'];
  const nombreDe = n => (PIEZAS[n] || EXTRA[n]).nombre;
  todas.forEach((n, i) => {
    const d = document.createElement('button'); d.className = 'r3d-tag'; d.type = 'button';
    d.innerHTML = `<i>${String.fromCharCode(65 + i)}</i><span>${nombreDe(n)}</span>`;
    d.addEventListener('click', () => seleccionar(n)); capa.appendChild(d); etiquetas[n] = d;
  });
  const ANCLA = { tapa: [0.95, -0.05, 0.2], mecanismo: [0.9, 0.1, 0.1], esfera: [0.85, 0.24, 0.2], agujas: [0.3, 0.3, -0.35], bisel: [0.9, 0.3, 0.2], cristal: [0.6, 0.33, 0.4] };

  // --- estado y animación
  let modo = 'Montado', corteX = 0.0, lupa = null, revelado = false, seleccion = null, vista = 'reloj';
  const destino = {}; todas.forEach(n => destino[n] = new T.Vector3());
  const camDest = { pos: new T.Vector3().copy(camera.position), mira: new T.Vector3().copy(controls.target), t: 1 };
  const plano = new T.Plane(new T.Vector3(-1, 0, 0), 10);

  const opacidad = (n, v) => materiales[n].forEach(m => {
    const base = m.userData.op ?? 1; const o = Math.min(base, v);
    const v2 = m.userData.vidrio || m === grabMat; m.transparent = o < 0.999 || v2; m.opacity = o; m.depthWrite = o > 0.6 && !v2; m.needsUpdate = true;
  });
  const clip = on => todas.forEach(n => materiales[n].forEach(m => { m.clippingPlanes = on ? [plano] : null; m.needsUpdate = true; }));

  function setModo(m) {
    modo = m; stage.dataset.modo = m;
    const alto = W() / H() < 0.95;
    const off = m === 'Explosión' ? EXPLOSION : m === 'Despiece' ? (alto ? DESPIECE_ALTO : DESPIECE_ANCHO) : null;
    todas.forEach(n => { destino[n].set(...(off && off[n] ? off[n] : [0, 0, 0])); if (m === 'Despiece') destino[n].y += MESA[n]; });
    const cam = CAMARAS[m]; const c = (alto && cam.alto) ? cam.alto : cam;
    camDest.pos.set(...c.pos); camDest.mira.set(...c.mira); camDest.t = 0;
    if (alto && m !== 'Despiece') camDest.pos.multiplyScalar(1.25);
    if (alto && m === 'Explosión') camDest.mira.add(new T.Vector3(-0.5, 0, 0.46));
    controls.autoRotate = m === 'Montado';
    todas.forEach(n => opacidad(n, 1));
    if (m === 'Transparencia') { ['tapa', 'esfera', 'bisel', 'cristal', 'agujas'].forEach(n => opacidad(n, n === 'agujas' ? 0.25 : 0.14)); revelar(); }
    if (m === 'Zoom') { ['esfera', 'cristal', 'agujas', 'bisel'].forEach(n => opacidad(n, 0.05)); }
    clip(m === 'Corte'); plano.constant = m === 'Corte' ? corteX : 10;
    grabMat.emissiveIntensity = m === 'Transparencia' || m === 'Zoom' ? 0.35 : 0;
    if (m !== 'Corte' && vista === 'taller') verTaller(false);
    if (!lupa && m === 'Zoom') crearLupa(); if (lupa) lupa.el.style.display = m === 'Zoom' ? '' : 'none';
    capa.classList.toggle('on', m === 'Explosión' || m === 'Despiece');
    capa.classList.toggle('abajo', m === 'Despiece'); capa.classList.toggle('izq', alto && m === 'Explosión');
    opts.onModo && opts.onModo(m);
  }
  function revelar() { if (!revelado) { revelado = true; opts.onRevelar && opts.onRevelar(); } }
  function seleccionar(n) {
    seleccion = seleccion === n ? null : n;
    todas.forEach(k => materiales[k].forEach(mt => { if (mt.emissive && mt !== grabMat) { mt.emissive.setHex(k === seleccion ? 0x6b4a12 : 0x000000); } }));
    Object.entries(etiquetas).forEach(([k, d]) => d.classList.toggle('sel', k === seleccion));
    opts.onPieza && opts.onPieza(seleccion ? { id: seleccion, nombre: nombreDe(seleccion), info: (PIEZAS[seleccion] || EXTRA[seleccion]).info } : null);
  }
  function verTaller(on) {
    vista = on ? 'taller' : 'reloj'; taller.visible = on; raiz.visible = !on;
    taller.traverse(o => { if (o.isMesh) { o.material.clippingPlanes = null; } });
    opts.onTaller && opts.onTaller(on);
  }

  // --- lupa: segunda pasada con la cámara desplazada y ampliada, pintada en un círculo
  function crearLupa() {
    const el = document.createElement('div'); el.className = 'r3d-lupa'; stage.appendChild(el);
    const size = Math.round(Math.min(190, W() * 0.46)), k = 3.2;
    const c2 = document.createElement('canvas'); c2.width = size * 2; c2.height = size * 2; el.appendChild(c2);
    lupa = { el, size, k, x: W() / 2, y: H() * 0.62, ctx: c2.getContext('2d') };
    el.style.width = el.style.height = size + 'px';
  }
  const ndc = new T.Vector3();
  function pintarLupa() {
    const { size, k, x, y } = lupa; const w = W(), h = H();
    const sub = size / k;
    camera.setViewOffset(w, h, x - sub / 2, y - sub / 2, sub, sub);
    const pr = renderer.getPixelRatio(); renderer.setPixelRatio(1);
    renderer.setSize(size * 2, size * 2, false); renderer.render(scene, camera);
    lupa.ctx.clearRect(0, 0, size * 2, size * 2); lupa.ctx.drawImage(renderer.domElement, 0, 0, size * 2, size * 2);
    camera.clearViewOffset(); renderer.setPixelRatio(pr); renderer.setSize(w, h, false);
    lupa.el.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
    // ¿está la lupa sobre el grabado?
    grabado.getWorldPosition(ndc); ndc.project(camera);
    const gx = (ndc.x + 1) / 2 * w, gy = (1 - ndc.y) / 2 * h;
    if (Math.hypot(gx - x, gy - y) < size * 0.32) { revelar(); lupa.el.classList.add('hallazgo'); } else lupa.el.classList.remove('hallazgo');
  }
  const pos = ev => { const r = stage.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  renderer.domElement.addEventListener('pointermove', ev => { if (lupa && modo === 'Zoom') { [lupa.x, lupa.y] = pos(ev); } });

  // --- selección de piezas con clic (sin arrastre)
  const rc = new T.Raycaster(); let abajo = null;
  renderer.domElement.addEventListener('pointerdown', ev => { abajo = pos(ev); });
  renderer.domElement.addEventListener('pointerup', ev => {
    const p = pos(ev); if (!abajo || Math.hypot(p[0] - abajo[0], p[1] - abajo[1]) > 5 || modo === 'Zoom') return;
    rc.setFromCamera(new T.Vector2(p[0] / W() * 2 - 1, -(p[1] / H()) * 2 + 1), camera);
    const objetivos = vista === 'taller' ? [taller] : [raiz];
    const hits = rc.intersectObjects(objetivos, true).filter(hh => {
      if (modo === 'Corte' && hh.point.x > corteX) return false;
      const n = hh.object.userData.pieza; return n && n !== 'cristal' && (n === 'taller' || materiales[n][0].opacity > 0.3);
    });
    if (hits[0] && hits[0].object.userData.pieza !== 'taller') seleccionar(hits[0].object.userData.pieza);
    else if (!hits[0] && seleccion) seleccionar(seleccion);
  });

  // --- hora: arranca en la hora del turno y avanza con el reloj real
  const [h0, m0] = opts.hora || [14, 0]; const t0 = performance.now(); const s0 = new Date().getSeconds();
  function agujas() {
    const s = s0 + (performance.now() - t0) / 1000;
    const min = m0 + s / 60, hr = (h0 % 12) + min / 60;
    horaria.rotation.y = -hr / 12 * Math.PI * 2; minutero.rotation.y = -min / 60 * Math.PI * 2;
    segundero.rotation.y = -Math.floor(s) / 60 * Math.PI * 2;
  }

  // --- bucle (solo cuando el visor está en pantalla)
  let visible = true, raf = 0, ultimo = performance.now();
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0.01 });
  io.observe(stage);
  const tmp = new T.Vector3();
  function loop(now) {
    raf = 0; if (!visible) return;
    const dt = Math.min(0.25, (now - ultimo) / 1000); ultimo = now;
    const a = stage.dataset.instant ? 1 : 1 - Math.pow(0.002, dt);
    todas.forEach(n => grupos[n].position.lerp(destino[n], a));
    if (camDest.t < 1) {
      camDest.t = Math.min(1, camDest.t + dt * 1.1);
      camera.position.lerp(camDest.pos, Math.min(1, a * 1.2)); controls.target.lerp(camDest.mira, Math.min(1, a * 1.2));
      if (camera.position.distanceTo(camDest.pos) < 0.01) camDest.t = 1;
    }
    agujas();
    if (modo === 'Transparencia' || modo === 'Zoom') grabMat.emissiveIntensity = 0.3 + 0.2 * Math.sin(now / 400);
    controls.update();
    if (lupa && modo === 'Zoom' && vista === 'reloj') pintarLupa();
    renderer.render(scene, camera);
    if (capa.classList.contains('on')) {
      const w = W(), h = H();
      const des = modo === 'Despiece', izq = capa.classList.contains('izq');
      todas.forEach(n => { const an = des ? [0, 0, n === 'bisel' ? 1.1 : 1.05] : ANCLA[n]; tmp.set(izq && !des ? -an[0] : an[0], an[1], an[2]).add(grupos[n].position).project(camera);
        const d = etiquetas[n]; d.style.transform = `translate(${(tmp.x + 1) / 2 * w}px, ${(1 - tmp.y) / 2 * h}px)` + (des ? ' translateX(-50%)' : izq ? ' translateX(-100%)' : ''); });
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); });
  ro.observe(stage);

  setModo('Montado');
  return {
    setModo,
    setCorte(v) { corteX = v; if (modo === 'Corte') plano.constant = v; },
    verTaller,
    seleccionar,
    _grabadoPantalla() { grabado.getWorldPosition(ndc); ndc.project(camera); return [(ndc.x + 1) / 2 * W(), (1 - ndc.y) / 2 * H()]; },
    destroy() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); controls.dispose(); renderer.dispose(); stage.querySelectorAll('.r3d-canvas,.r3d-labels,.r3d-lupa,.r3d-loader').forEach(e => e.remove()); }
  };
}
