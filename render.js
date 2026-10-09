'use strict';
/* ════════════════════════════════════════════════════════════
   RENDER REALISTICO della sala mostra (three.js / WebGL).
   Prende la stanza 3D così com'è sullo schermo (ogni faccia CSS diventa un piano con la sua foto o il suo colore),
   con la stessa inquadratura, e la ridisegna con luce vera: sole dall'alto, ombre morbide a terra, cielo diffuso.
   Il risultato è un'immagine ferma che si può salvare.
   ════════════════════════════════════════════════════════════ */
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
function loadThree() {
  if (window.THREE) return Promise.resolve();
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = THREE_URL; s.onload = res; s.onerror = () => rej(new Error('three.js non raggiungibile')); document.head.appendChild(s); });
}
document.head.insertAdjacentHTML('beforeend', `<style>
.rnd-modal { position: fixed; inset: 0; z-index: 500; background: rgba(10,10,12,.92); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 14px; }
.rnd-modal img, .rnd-modal canvas { max-width: 100%; max-height: calc(100vh - 90px); border-radius: 8px; box-shadow: 0 20px 60px rgba(0,0,0,.5); background: #222; }
.rnd-modal .bar { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.rnd-modal .msg { color: #ddd; font-size: 14px; }
</style>`);

/* matrice di un elemento rispetto alla stanza (radice = #roomScene) */
function relMatrix(el, root) {
  let m = new DOMMatrix();
  for (let e = el; e && e !== root; e = e.parentElement) {
    const cs = getComputedStyle(e), t = cs.transform && cs.transform !== 'none' ? new DOMMatrix(cs.transform) : new DOMMatrix();
    const [ox = 0, oy = 0, oz = 0] = cs.transformOrigin.split(' ').map(v => parseFloat(v) || 0);
    const local = new DOMMatrix().translate(e.offsetLeft || 0, e.offsetTop || 0).translate(ox, oy, oz).multiply(t).translate(-ox, -oy, -oz);
    m = local.multiply(m);
  }
  return m;
}
/* quadrotta di gres chiaro 60×60 con fuga e una leggera venatura (si ripete su tutto il pavimento) */
function floorTileCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#e8e7e4'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {                       // grana del gres
    const v = 200 + Math.random() * 40 | 0; g.fillStyle = `rgba(${v},${v},${v - 4},.18)`;
    g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  g.strokeStyle = 'rgba(160,156,148,.25)'; g.lineWidth = 1.2;            // venature leggere
  for (let k = 0; k < 4; k++) { g.beginPath(); let x = Math.random() * 512, y = Math.random() * 512; g.moveTo(x, y); for (let j = 0; j < 8; j++) { x += (Math.random() - .3) * 90; y += (Math.random() - .5) * 60; g.lineTo(x, y); } g.stroke(); }
  g.fillStyle = '#c4c1ba'; g.fillRect(0, 0, 512, 2); g.fillRect(0, 0, 2, 512);   // fuga sottile
  return c;
}
/* ambiente di luce per i riflessi: stanza bianca con pannelli luminosi a soffitto (come uno showroom) */
function showroomEnv(T, rdr) {
  const env = new T.Scene();
  const roomBox = new T.Mesh(new T.BoxGeometry(20, 8, 20), new T.MeshBasicMaterial({ color: 0x8a8781, side: T.BackSide }));
  roomBox.position.y = 3; env.add(roomBox);
  const lamp = new T.MeshBasicMaterial({ color: new T.Color(2.6, 2.6, 2.45) });
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const p = new T.Mesh(new T.PlaneGeometry(2.4, 2.4), lamp); p.rotation.x = Math.PI / 2; p.position.set(i * 6, 6.9, j * 6); env.add(p); }
  const floor = new T.Mesh(new T.PlaneGeometry(20, 20), new T.MeshBasicMaterial({ color: 0xbdbab3 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.99; env.add(floor);
  const pm = new T.PMREMGenerator(rdr), tex = pm.fromScene(env, 0.03).texture; pm.dispose();
  return tex;
}
const firstColor = s => { const m = String(s || '').match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/i); return m ? m[0] : null; };
function cssColor(str) {
  const m = String(str).match(/rgba?\(([^)]*)\)/);
  if (m) { const p = m[1].split(',').map(x => parseFloat(x)); return { c: new THREE.Color(p[0] / 255, p[1] / 255, p[2] / 255).convertSRGBToLinear(), a: p.length > 3 ? p[3] : 1 }; }
  try { return { c: new THREE.Color(str).convertSRGBToLinear(), a: 1 }; } catch (e) { return null; }
}

async function renderRealistic() {
  const root = document.getElementById('roomScene'), box = document.getElementById('room3d');
  if (!root || !box) { toast('Apri una sala mostra per fare il render'); return; }
  const modal = document.createElement('div'); modal.className = 'rnd-modal';
  modal.innerHTML = `<div class="msg">📸 Preparo il render realistico…</div>`;
  document.body.appendChild(modal);
  try { await loadThree(); } catch (e) { modal.remove(); say('Non riesco a caricare il motore 3D (serve internet). Riprova.'); return; }
  const T = window.THREE;
  const W = box.clientWidth, H = box.clientHeight, csb = getComputedStyle(box);
  const P = parseFloat(csb.perspective) || 2400;
  const [pox, poy] = csb.perspectiveOrigin.split(' ').map(v => parseFloat(v) || 0);
  const view = new DOMMatrix(getComputedStyle(root).transform === 'none' ? undefined : getComputedStyle(root).transform);
  const FLIP = new DOMMatrix().scale(1, -1, 1);          // CSS (y in giù) → three (y in su)
  const toWorld = m => new T.Matrix4().fromArray(FLIP.multiply(view).multiply(m).toFloat32Array());

  const s = Math.hypot(view.m11, view.m12, view.m13) || 1;   // scala della vista (zoom)
  const rw = (window.room && room.w) || 600, rd = (window.room && room.d) || 400, rh = (window.room && room.h) || 300;
  const pt = (x, y, z) => { const p = FLIP.multiply(view).transformPoint(new DOMPoint(x, y, z)); return new T.Vector3(p.x, p.y, p.z); };
  const scene = new T.Scene();
  scene.background = new T.Color('#f2f1ee');
  // le foto: prima si caricano tutte (immagini), poi diventano texture (una per foto e ripetizione)
  const imgs = {}, texCache = {}, pending = [];
  const loadImg = url => imgs[url] || (imgs[url] = new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = url; }));
  const texFor = (im, rx, ry) => {
    const k = im.src + '|' + rx + '|' + ry;
    if (!texCache[k]) {
      const t = new T.Texture(im); t.encoding = T.sRGBEncoding; t.anisotropy = 8; t.needsUpdate = true;
      if (rx > 1.02 || ry > 1.02) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
      texCache[k] = t;
    }
    return texCache[k];
  };
  const els = root.querySelectorAll('*');
  let n = 0, floorCanvas = null;
  for (const el of els) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (w < 0.05 || h < 0.05) continue;
    if (el.classList.contains('empty') || el.classList.contains('rfloor') || el.classList.contains('rwall')) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || !el.getClientRects().length) continue;
    const bi = cs.backgroundImage, url = (bi.match(/url\("?([^")]+)"?\)/) || [])[1];
    let col = cs.backgroundColor, ccol = cssColor(col);
    if ((!ccol || ccol.a === 0) && bi && bi !== 'none' && !url) { const fc = firstColor(bi); if (fc) ccol = cssColor(fc); }   // sfumature: il primo colore
    if (!url && (!ccol || ccol.a === 0)) continue;
    const opacity = parseFloat(cs.opacity) || 1;
    const mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0, side: T.DoubleSide });
    if (url) {
      const sz = cs.backgroundSize.split(',').pop().trim().split(/\s+/);
      let rx = 1, ry = 1;
      if (/%$/.test(sz[0]) && /%$/.test(sz[1] || '')) { rx = Math.round(100 / parseFloat(sz[0]) * 100) / 100; ry = Math.round(100 / parseFloat(sz[1]) * 100) / 100; }   // foto ripetuta
      pending.push(loadImg(url).then(im => { if (im) { mat.map = texFor(im, rx, ry); mat.needsUpdate = true; } }));
      if (cs.backgroundBlendMode && cs.backgroundBlendMode.includes('multiply') && ccol) mat.color = ccol.c;   // retro tinto
      mat.roughness = 0.35; mat.envMapIntensity = 0.3;            // piastrelle: un po' lucide, riflettono le luci
    } else {
      mat.color = ccol.c;
      const l = ccol.c.r + ccol.c.g + ccol.c.b;
      if (l < 0.5) { mat.color = new T.Color(0x0c0c0d); mat.roughness = 0.5; mat.metalness = 0.1; mat.envMapIntensity = 0.18; }   // metallo nero verniciato degli espositori
      if (el.classList.contains('rfloor')) {                   // gres lucido a quadrotte 60×60
        const t = new T.CanvasTexture(floorCanvas || (floorCanvas = floorTileCanvas()));
        t.encoding = T.sRGBEncoding; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(w / 60, h / 60); t.anisotropy = 16;
        mat.map = t; mat.color = new T.Color(0xd8d6d1); mat.roughness = 0.2; mat.metalness = 0; mat.envMapIntensity = 0.45;
      }
      if (el.classList.contains('rwall')) { mat.color = new T.Color(0xe9e7e3); mat.roughness = 0.95; mat.envMapIntensity = 0.25; }
    }
    if (opacity < 1 || (ccol && ccol.a < 1 && !url)) { mat.transparent = true; mat.opacity = opacity * (url ? 1 : ccol.a); }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, w, 0, 0, w, h, 0, 0, h, 0], 3));
    g.setAttribute('uv', new T.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
    g.setIndex([0, 2, 1, 0, 3, 2]);
    g.applyMatrix4(toWorld(relMatrix(el, root)));
    g.computeVertexNormals();
    const mesh = new T.Mesh(g, mat);
    const floor = el.classList.contains('rfloor'), wall = el.classList.contains('rwall');
    mesh.castShadow = !floor && !wall; mesh.receiveShadow = true;
    scene.add(mesh); n++;
  }
  // ── la stanza: grande, così intorno non resta il vuoto ──
  const quad = (pts, mat, uvs, shadow) => {
    const g = new T.BufferGeometry(), v = [];
    pts.forEach(q => { const w2 = pt(q[0], q[1], q[2]); v.push(w2.x, w2.y, w2.z); });
    g.setAttribute('position', new T.Float32BufferAttribute(v, 3));
    g.setAttribute('uv', new T.Float32BufferAttribute(uvs || [0, 0, 1, 0, 1, 1, 0, 1], 2));
    g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
    const m = new T.Mesh(g, mat); m.receiveShadow = true; m.castShadow = !!shadow; scene.add(m); return m;
  };
  const X0 = -rw * 1.5, X1 = rw * 2.5, Z1 = rd * 3, CH = rh * 4;   // muro alto: la telecamera sta in alto e vede sempre muro, mai il vuoto
  const ft = new T.CanvasTexture(floorTileCanvas()); ft.encoding = T.sRGBEncoding; ft.wrapS = ft.wrapT = T.RepeatWrapping; ft.anisotropy = 16;
  quad([[X0, 0, 0], [X1, 0, 0], [X1, 0, Z1], [X0, 0, Z1]], new T.MeshStandardMaterial({ map: ft, color: 0xffffff, roughness: 0.12, metalness: 0, envMapIntensity: 0.75, side: T.DoubleSide }),
    [X0 / 60, 0, X1 / 60, 0, X1 / 60, Z1 / 60, X0 / 60, Z1 / 60]);
  const wallM = new T.MeshStandardMaterial({ color: new T.Color(0xf4f3f1).convertSRGBToLinear(), roughness: 0.95, envMapIntensity: 0.3, side: T.DoubleSide });
  quad([[X0, 0, 0], [X1, 0, 0], [X1, -CH, 0], [X0, -CH, 0]], wallM);
  if (room.wallL) quad([[0, 0, 0], [0, 0, Z1], [0, -CH, Z1], [0, -CH, 0]], wallM);
  if (room.wallR) quad([[rw, 0, 0], [rw, 0, Z1], [rw, -CH, Z1], [rw, -CH, 0]], wallM);
  // luci
  scene.add(new T.HemisphereLight(0xffffff, 0xa9a59d, 0.35));
  // faretti a soffitto in fila davanti agli espositori: luce dall'alto, ombre morbide sotto e dietro
  const nx = Math.max(2, Math.round(rw / 220)), sm = LOWMEM ? 1024 : 2048;
  for (let i = 0; i < nx; i++) {
    const x = rw * (i + 0.5) / nx, sp = new T.SpotLight(0xfff6ec, 1.1 * 3 / (nx + 1), 0, Math.PI / 2.6, 0.9, 1);
    sp.position.copy(pt(x, -rh + 4, rd * 0.55)); sp.target.position.copy(pt(x, 0, rd * 0.25));
    sp.castShadow = true; sp.shadow.mapSize.set(sm, sm); sp.shadow.bias = -0.0006; sp.shadow.normalBias = 0.4 * s;
    sp.shadow.camera.near = 5 * s; sp.shadow.camera.far = (rh + rd) * 3 * s; sp.shadow.radius = 6;
    scene.add(sp, sp.target);
  }
  const key = new T.DirectionalLight(0xffffff, 0.35); key.position.copy(pt(rw * 0.3, -rh * 2, rd * 2.5)); key.target.position.copy(pt(rw / 2, 0, rd / 2)); scene.add(key, key.target);
  // telecamera = la stessa prospettiva CSS (punto di fuga in perspective-origin)
  const fw = 2 * Math.max(pox, W - pox), fh = 2 * Math.max(poy, H - poy);
  const cam = new T.PerspectiveCamera(2 * Math.atan(fh / 2 / P) * 180 / Math.PI, fw / fh, 5, P * 20);
  cam.position.set(pox, -poy, P); cam.lookAt(pox, -poy, 0);
  cam.setViewOffset(fw, fh, fw / 2 - pox, fh / 2 - poy, W, H);
  modal.querySelector('.msg').textContent = `📸 Carico le foto (${Object.keys(imgs).length})…`;
  await Promise.all(pending);
  await new Promise(r => setTimeout(r, 200));
  const rdr = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  const scale = Math.min(LOWMEM ? 2.5 : 4, (LOWMEM ? 1600 : 2400) / Math.max(W, H));   // immagine grande e nitida
  rdr.setPixelRatio(scale); rdr.setSize(W, H);
  rdr.shadowMap.enabled = true; rdr.shadowMap.type = T.PCFSoftShadowMap;
  rdr.outputEncoding = T.sRGBEncoding; rdr.toneMapping = T.ACESFilmicToneMapping; rdr.toneMappingExposure = 1.0;
  rdr.physicallyCorrectLights = false;
  scene.environment = showroomEnv(T, rdr);
  rdr.render(scene, cam);
  const url = rdr.domElement.toDataURL('image/jpeg', 0.92);
  rdr.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  modal.innerHTML = `<img src="${url}" alt="Render della sala mostra">
    <div class="bar"><button class="btn" id="rndSave">⬇ Salva immagine</button><button class="btn dark" id="rndClose">Chiudi</button></div>`;
  modal.querySelector('#rndClose').onclick = () => modal.remove();
  modal.querySelector('#rndSave').onclick = () => {
    const a = document.createElement('a'); a.href = url; a.download = 'sala-mostra-' + ((window.room && room.name) || 'render').replace(/[^\w-]+/g, '_') + '.jpg'; a.click();
  };
  console.log('render: facce', n);
}
