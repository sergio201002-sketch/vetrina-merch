'use strict';
/* ════════════════════════════════════════════════════════════
   SALA MOSTRA IN WebGL (three.js): la stanza CSS resta come "scheletro" invisibile (posizioni, aperture, animazioni),
   e una tela WebGL la ridisegna con la scheda grafica: fluida anche sul telefono e foto nitide a ogni distanza
   (texture con mipmap). Il campione aperto usa la foto grande. Clic sui campioni: raggio nel 3D vero.
   Se il WebGL non c'è, resta la sala mostra di prima.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
#room3d.gl #roomScene { visibility: hidden; }
#room3d canvas.glc { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
#room3d.gl .camctl, #room3d.gl .roomhint, #room3d.gl .roomtabs, #room3d.gl .showcard { z-index: 5; }
</style>`);

const RoomGL = {
  ok: null, on: false, T: null, rdr: null, scene: null, camera: null, view: null, meshes: [], dyn: new Map(), canvas: null,
  until: 0, raf: 0, texCache: {}, imgCache: {}, rev: null, floorTex: null, sharpMeshes: [],
  wanted() { return ui.roomGL !== false; },
  /* foto: indirizzo originale da qualsiasi versione (medie, sala, galleria) */
  origOf(url) {
    if (!this.rev) {
      this.rev = {};
      [window.FOTO_MED, window.FOTO_ROOM, window.FOTO_GAL, window.FOTO_MINI].forEach(m => Object.entries(m || {}).forEach(([o, v]) => { this.rev[v] = o; }));
    }
    const rel = url.replace(location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, ''), '');
    return this.rev[decodeURI(rel)] || this.rev[rel] || null;
  },
  // foto della vista generale: 800 px sul PC, 480 px sul telefono (memoria grafica); il campione aperto passa alla grande
  smallUrl(url) { const o = this.origOf(url); const hd = typeof roomHD !== 'function' || roomHD(); return o ? ((hd ? window.FOTO_GAL : window.FOTO_ROOM) || {})[o] || FOTO_MED[o] || o : url; },   // HD: 800 px anche sul telefono; senza HD: 480 px
  bigUrl(url) { const o = this.origOf(url); if (!o) return url; return ((typeof AVIF_OK !== 'undefined' && AVIF_OK) || !/\.avif$/i.test(o)) ? o : (FOTO_MED[o] || o); },

  async attach() {
    const box = document.getElementById('room3d'), root = document.getElementById('roomScene');
    if (!box || !root || !this.wanted() || this.ok === false) { this.detach(); return; }
    try { await loadThree(); } catch (e) { this.ok = false; return; }
    const T = this.T = window.THREE;
    if (!this.rdr) {
      // profondità precisa (logarithmicDepthBuffer): facce vicine (davanti/retro) senza quadrettature
      try { this.rdr = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance', logarithmicDepthBuffer: true }); }
      catch (e) { this.ok = false; toast('Il 3D veloce non è disponibile su questo dispositivo'); return; }
      this.ok = true;
      this.rdr.outputEncoding = T.sRGBEncoding; this.rdr.toneMapping = T.NoToneMapping;   // colori veri delle foto, senza la curva cinema che li spegne
      this.canvas = this.rdr.domElement; this.canvas.className = 'glc';
      ['pointerdown', 'pointermove', 'wheel', 'keydown', 'touchmove'].forEach(ev => window.addEventListener(ev, () => this.poke(), { passive: true }));
      window.addEventListener('resize', () => this.poke());
    }
    if (this.canvas.parentElement !== box) box.insertBefore(this.canvas, box.firstChild);
    box.classList.add('gl'); this.on = true;
    this.build();
  },
  detach() {
    this.on = false; cancelAnimationFrame(this.raf); this.raf = 0;
    const box = document.getElementById('room3d'); if (box) box.classList.remove('gl');
    if (this.canvas && this.canvas.parentElement) this.canvas.remove();
  },
  /* immagine → texture (una per foto e ripetizione), con mipmap: nitida vicino e lontano */
  tex(url, rx, ry, cover, pw, ph, onload) {
    const T = this.T;
    const im = this.imgCache[url] || (this.imgCache[url] = new Promise(r => { const i = new Image(); i.decoding = 'async'; i.onload = () => r(i); i.onerror = () => r(null); i.src = url; }));
    return im.then(img => {
      if (!img) return null;
      let sx = 1, sy = 1;
      if (cover) { const pa = pw / ph, ia = img.width / img.height; if (ia > pa) sx = Math.round(pa / ia * 1000) / 1000; else sy = Math.round(ia / pa * 1000) / 1000; }
      const k = url + '|' + rx + '|' + ry + '|' + sx + '|' + sy;
      if (!this.texCache[k]) {
        const t = new T.Texture(img); t.encoding = T.sRGBEncoding; t.anisotropy = this.rdr.capabilities.getMaxAnisotropy(); t.generateMipmaps = true; t.minFilter = T.LinearMipmapLinearFilter; t.needsUpdate = true;
        if (rx > 1.02 || ry > 1.02) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
        else if (rx < 0.98 || ry < 0.98) { t.repeat.set(rx, ry); t.offset.set(0, 1 - ry); }   // pezzo tagliato (box in posa): solo una parte della foto
        else if (sx < 1 || sy < 1) { t.repeat.set(sx, sy); t.offset.set((1 - sx) / 2, (1 - sy) / 2); }
        this.texCache[k] = t;
      }
      return this.texCache[k];
    });
  },
  /* elementi che si muovono (aperture, carrelli, cassetti, espositori trascinati): la loro posizione si ricalcola */
  isDyn(e) { return e.classList && (e.classList.contains('ritem') || e.classList.contains('ttile') || e.classList.contains('drawer3d') || e.classList.contains('holder') || e.classList.contains('panel')); },
  local(e) {
    const cs = getComputedStyle(e), t = cs.transform && cs.transform !== 'none' ? new DOMMatrix(cs.transform) : new DOMMatrix();
    const [ox = 0, oy = 0, oz = 0] = cs.transformOrigin.split(' ').map(v => parseFloat(v) || 0);
    return new DOMMatrix().translate(e.offsetLeft || 0, e.offsetTop || 0).translate(ox, oy, oz).multiply(t).translate(-ox, -oy, -oz);
  },
  build() {
    const T = this.T, root = document.getElementById('roomScene'); if (!root || !this.on) return;
    // pulizia
    if (this.scene) this.scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    this.scene = new T.Scene(); this.scene.background = new T.Color(0xf3f2ef);
    this.view = new T.Group(); this.view.matrixAutoUpdate = false; this.scene.add(this.view);
    this.meshes = []; this.dyn = new Map(); this.sharpMeshes = [];
    const FLIP = new DOMMatrix().scale(1, -1, 1);
    this.flip = FLIP;
    const dynOf = new Map();                               // elemento → antenato che si muove (o null = la stanza)
    const findDyn = e => { if (dynOf.has(e)) return dynOf.get(e); let p = e.parentElement; while (p && p !== root && !this.isDyn(p)) p = p.parentElement; const r = p && p !== root ? p : null; dynOf.set(e, r); return r; };
    const relTo = (e, stop) => { let m = new DOMMatrix(); for (let x = e; x && x !== stop && x !== root; x = x.parentElement) m = this.local(x).multiply(m); return m; };
    for (const el of root.querySelectorAll('*')) {
      const w = el.offsetWidth, h = el.offsetHeight; if (w < 0.05 || h < 0.05) continue;
      if (el.classList.contains('empty')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none') continue;
      const bi = cs.backgroundImage, url0 = (bi.match(/url\("?([^")]+)"?\)/) || [])[1];
      let ccol = cssColor(cs.backgroundColor);
      if ((!ccol || ccol.a === 0) && bi && bi !== 'none' && !url0) { const fc = firstColor(bi); if (fc) ccol = cssColor(fc); }
      if (!url0 && (!ccol || ccol.a === 0)) continue;
      const floor = el.classList.contains('rfloor'), wall = el.classList.contains('rwall');
      const face = url0 && !floor && !/retro_/.test(url0);
      // davanti delle piastrelle: la foto com'è (niente luci che la scuriscono o la sbiadiscono)
      const mat = face ? new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, toneMapped: false })
        : new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0, side: T.DoubleSide, envMapIntensity: 0.3 });
      let photo = null, metal = false;
      if (floor) {
        if (!this.floorTex) { this.floorTex = new T.CanvasTexture(floorTileCanvas()); this.floorTex.encoding = T.sRGBEncoding; this.floorTex.wrapS = this.floorTex.wrapT = T.RepeatWrapping; this.floorTex.anisotropy = 8; }
        const ft = this.floorTex.clone(); ft.needsUpdate = true; ft.repeat.set(w / 60, h / 60); mat.map = ft; mat.roughness = 0.35; mat.color = new T.Color(0xdedcd8);
      } else if (wall) { mat.color = new T.Color(0xf6f5f2).convertSRGBToLinear(); mat.roughness = 0.95; }
      else if (url0) {
        const sz = cs.backgroundSize.split(',').pop().trim().split(/\s+/);
        let rx = 1, ry = 1; if (/%$/.test(sz[0]) && /%$/.test(sz[1] || '')) { rx = Math.round(100 / parseFloat(sz[0]) * 1000) / 1000; ry = Math.round(100 / parseFloat(sz[1]) * 1000) / 1000; }
        const isRetro = /retro_/.test(url0), url = isRetro ? url0 : this.smallUrl(url0);
        photo = { url0, rx, ry, cover: sz[0] === 'cover', w, h };
        this.tex(url, rx, ry, photo.cover, w, h).then(t => { if (t) { mat.map = t; mat.needsUpdate = true; this.poke(); } });
        if (isRetro && ccol) { const c2 = ccol.c.clone(); c2.lerp(new T.Color(1, 1, 1), 0.45); mat.color = c2; }
        if (!face) { mat.roughness = 0.45; mat.envMapIntensity = 0.22; }
      } else {
        mat.color = ccol.c; const l = ccol.c.r + ccol.c.g + ccol.c.b;
        if (l < 0.5) {   // metallo nero degli espositori: verniciato a polvere, opaco, con la grana "a buccia d'arancia"
          const pm = powderMaps(T); metal = true;
          mat.color = new T.Color(0x232327).convertSRGBToLinear(); mat.roughness = 0.88; mat.metalness = 0; mat.envMapIntensity = 0.12;
          mat.normalMap = pm.normal; mat.normalScale = new T.Vector2(0.45, 0.45); mat.roughnessMap = pm.rough;
        }
        if (ccol.a < 1) { mat.transparent = true; mat.opacity = ccol.a; }
      }
      const g = new T.PlaneGeometry(1, 1); g.translate(0.5, -0.5, 0); g.scale(w, h, 1);   // piano w×h con origine in alto a sinistra (y verso il basso dopo il ribaltamento)
      g.scale(1, -1, 1);
      // la foto sta sullo stesso piano del pannello sotto: la stacco appena verso chi guarda, così non si mescolano a puntini
      if (photo) g.translate(0, 0, 0.08);
      if (metal) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 18, uv.getY(i) * h / 18); }   // grana sempre della stessa misura (18 cm per ripetizione)
      const mesh = new T.Mesh(g, mat); mesh.matrixAutoUpdate = false;
      const D = this.isDyn(el) ? el : findDyn(el);
      const staticM = D === el ? new DOMMatrix() : relTo(el, D);   // senza antenato mobile: fino alla stanza
      mesh.userData = { el, D, staticM, self: D === el, item: el.closest('.ritem'), wall: el.closest('[data-wall]'), photo };
      this.view.add(mesh); this.meshes.push(mesh);
      if (D && !this.dyn.has(D)) this.dyn.set(D, null);
    }
    this.scene.add(new T.HemisphereLight(0xffffff, 0xb5b0a6, 0.95));
    const sun = new T.DirectionalLight(0xfff6ec, 0.85); sun.position.set(-0.4, 1, 0.8); this.scene.add(sun);
    if (!this.envTex) this.envTex = showroomEnv(T, this.rdr);
    this.scene.environment = this.envTex;
    this.updateMatrices(true);
    this.poke(2500);
  },
  /* posizione di ogni pezzo: (antenato che si muove, ricalcolato) × (parte fissa calcolata una volta) */
  updateMatrices(all) {
    const root = document.getElementById('roomScene');
    const memo = new Map();
    const rel = e => { if (!e) return new DOMMatrix(); if (memo.has(e)) return memo.get(e); let p = e.parentElement; while (p && p !== root && !this.isDyn(p)) p = p.parentElement;
      // da e fino al prossimo antenato mobile: parte fissa ricalcolata (pochi livelli)
      let m = new DOMMatrix(); for (let x = e; x && x !== root && (x === e || !this.isDyn(x)); x = x.parentElement) m = this.local(x).multiply(m);
      const r = (p && p !== root ? rel(p) : new DOMMatrix()).multiply(m); memo.set(e, r); return r; };
    for (const mesh of this.meshes) {
      const u = mesh.userData;
      if (!all && !u.D) continue;
      const m = u.D ? (u.self ? rel(u.D) : rel(u.D).multiply(u.staticM)) : u.staticM;
      mesh.matrix.fromArray(m.toFloat32Array()); mesh.matrixWorldNeedsUpdate = true;
    }
  },
  updateVisibility() {
    for (const mesh of this.meshes) {
      const u = mesh.userData;
      mesh.visible = !(u.item && u.item.style.visibility === 'hidden') && !(u.wall && u.wall.style.display === 'none');
    }
  },
  updateCamera() {
    const T = this.T, box = document.getElementById('room3d'), root = document.getElementById('roomScene');
    const W = box.clientWidth, H = box.clientHeight; if (!W || !H) return false;
    const csb = getComputedStyle(box), P = parseFloat(csb.perspective) || 2400;
    const [pox, poy] = csb.perspectiveOrigin.split(' ').map(v => parseFloat(v) || 0);
    const tr = getComputedStyle(root).transform, view = tr && tr !== 'none' ? new DOMMatrix(tr) : new DOMMatrix();
    this.view.matrix.fromArray(this.flip.multiply(view).toFloat32Array()); this.view.matrixWorldNeedsUpdate = true;
    const hd = typeof roomHD !== 'function' || roomHD(), pr = Math.min(window.devicePixelRatio || 1, hd ? 3 : 1.5);   // HD: densità piena dello schermo (iPhone 3×)
    if (this._w !== W || this._h !== H || this._pr !== pr) { this.rdr.setPixelRatio(pr); this.rdr.setSize(W, H, false); this._w = W; this._h = H; this._pr = pr; }
    const fw = 2 * Math.max(pox, W - pox), fh = 2 * Math.max(poy, H - poy);
    if (!this.camera) this.camera = new T.PerspectiveCamera(30, 1, 5, 100000);
    const c = this.camera; c.fov = 2 * Math.atan(fh / 2 / P) * 180 / Math.PI; c.aspect = fw / fh; c.near = P * 0.05; c.far = P * 6;
    c.position.set(pox, -poy, P); c.lookAt(pox, -poy, 0); c.setViewOffset(fw, fh, fw / 2 - pox, fh / 2 - poy, W, H); c.updateProjectionMatrix();
    return true;
  },
  /* disegna per un po' (animazioni CSS in corso); fuori da lì non consuma niente */
  poke(ms = 1400) {
    if (!this.on) return;
    this.until = Math.max(this.until, performance.now() + ms);
    if (!this.raf) this.raf = requestAnimationFrame(() => this.loop());
  },
  loop() {
    this.raf = 0;
    if (!this.on || !document.getElementById('roomScene')) return;
    if (this.updateCamera()) { this.updateMatrices(false); this.updateVisibility(); this.rdr.render(this.scene, this.camera); }
    if (performance.now() < this.until) this.raf = requestAnimationFrame(() => this.loop());
  },
  /* clic: il pezzo 3D sotto il dito → l'elemento della stanza CSS corrispondente */
  hit(x, y) {
    if (!this.on || !this.camera) return null;
    const r = this.canvas.getBoundingClientRect(), T = this.T;
    const ray = new T.Raycaster(), v = new T.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    this.scene.updateMatrixWorld(true); ray.setFromCamera(v, this.camera);
    const hits = ray.intersectObjects(this.meshes.filter(m => m.visible), false);
    const h = hits.find(i => i.object.userData.item);
    return h ? h.object.userData.el : (hits[0] ? hits[0].object.userData.el : null);
  },
  /* campione aperto: foto grande sulle sue facce (al posto di quella leggera) */
  sharp(id, slot) {
    this.unsharp();
    this.meshes.forEach(m => {
      const u = m.userData; if (!u.photo || !u.item || u.item.dataset.id !== id) return;
      const s = u.el.closest('[data-slot]'); if (!s || +s.dataset.slot !== slot) return;
      const prev = m.material.map;
      this.tex(this.bigUrl(u.photo.url0), u.photo.rx, u.photo.ry, u.photo.cover, u.photo.w, u.photo.h).then(t => { if (t && this.sharpMeshes.includes(m)) { m.material.map = t; m.material.needsUpdate = true; this.poke(); } });
      this.sharpMeshes.push(m); u.prevMap = prev;
    });
  },
  unsharp() { this.sharpMeshes.forEach(m => { if (m.userData.prevMap) { m.material.map = m.userData.prevMap; m.material.needsUpdate = true; } }); this.sharpMeshes = []; this.poke(); },
};
window.RoomGL = RoomGL;

/* texture del metallo verniciato a polvere (nero opaco): rilievo fine e irregolare + ruvidità che varia appena. Ripetibile senza giunte. */
let _powder = null;
function powderMaps(T) {
  if (_powder) return _powder;
  const N = 256, h = new Float32Array(N * N);
  const octave = (P, amp) => {   // rumore a reticolo periodico (si ripete senza giunte)
    const g = Array.from({ length: P * P }, () => Math.random());
    const at = (x, y) => g[((y + P) % P) * P + ((x + P) % P)], sm = t => t * t * (3 - 2 * t);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const fx = x / N * P, fy = y / N * P, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = sm(fx - x0), ty = sm(fy - y0);
      const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx, b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
      h[y * N + x] += (a + (b - a) * ty) * amp;
    }
  };
  octave(24, 1); octave(48, 0.6); octave(128, 0.35);
  for (let i = 0; i < h.length; i++) h[i] += Math.random() * 0.12;   // grana finissima della polvere
  const cn = document.createElement('canvas'), cr = document.createElement('canvas'); cn.width = cn.height = cr.width = cr.height = N;
  const xn = cn.getContext('2d'), xr = cr.getContext('2d'), dn = xn.createImageData(N, N), dr = xr.createImageData(N, N);
  const H = (x, y) => h[((y + N) % N) * N + ((x + N) % N)];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = (H(x + 1, y) - H(x - 1, y)) * 1.6, dy = (H(x, y + 1) - H(x, y - 1)) * 1.6, l = Math.hypot(dx, dy, 1), i = (y * N + x) * 4;
    dn.data[i] = (-dx / l * 0.5 + 0.5) * 255; dn.data[i + 1] = (-dy / l * 0.5 + 0.5) * 255; dn.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; dn.data[i + 3] = 255;
    const r = 235 + (H(x, y) - 1.1) * 30; dr.data[i] = dr.data[i + 1] = dr.data[i + 2] = Math.max(150, Math.min(255, r)); dr.data[i + 3] = 255;
  }
  xn.putImageData(dn, 0, 0); xr.putImageData(dr, 0, 0);
  const mk = c => { const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.anisotropy = 8; return t; };
  return (_powder = { normal: mk(cn), rough: mk(cr) });
}
