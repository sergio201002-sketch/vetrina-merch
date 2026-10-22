'use strict';
/* ════════════════════════════════════════════════════════════
   SCHEDA PDF DELL'ESPOSITORE (sezione Espositori → "Scheda PDF")
   A4 orizzontale: in alto il render dell'espositore intero (three.js, luce e ombre), a destra i dati (espositore, codice, cliente, misure, campioni); sotto tutti i prodotti che contiene.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
#schPrint { display: none; }
@media print {
  body.sch-printing > *:not(#schPrint) { display: none !important; }
  body.sch-printing { background: #fff !important; }
  #schPrint { display: block !important; }
}
#schPrint { font-family: Inter, Arial, sans-serif; color: #18181b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#schPrint .sch-page { height: 209mm; padding: 9mm 10mm 8mm; box-sizing: border-box; display: flex; flex-direction: column; overflow: hidden; }
#schPrint .top { display: grid; grid-template-columns: 46mm 1fr; gap: 5mm; height: 34mm; margin-bottom: 3mm; flex: none; }
#schPrint .rn { border-radius: 2mm; overflow: hidden; background: linear-gradient(180deg, #f7f6f3, #ecebe7); }
#schPrint .rn img { width: 100%; height: 100%; object-fit: contain; display: block; }
#schPrint .info { display: grid; grid-template-columns: 1.25fr 1fr 1.25fr; gap: 6mm; align-items: start; min-height: 0; }
#schPrint .info > div { min-height: 0; overflow: hidden; }
#schPrint .info .k { font: 700 6.5pt Inter, Arial; letter-spacing: .2em; text-transform: uppercase; color: #b0101a; }
#schPrint .info h1 { font: 700 14pt/1.08 'Inter Tight', Inter, Arial; letter-spacing: -.02em; margin: 1.2mm 0 .6mm; }
#schPrint .info .cm { font-size: 8.5pt; color: #555; }
#schPrint .info .big { display: flex; gap: 6mm; margin-top: 2.5mm; }
#schPrint .info .big b { display: block; font: 700 13pt/1 'Inter Tight', Inter, Arial; }
#schPrint .info .big span { font-size: 6.8pt; color: #777; }
#schPrint .info dl { display: grid; grid-template-columns: 15mm 1fr; gap: .9mm 2.5mm; margin: 0; font-size: 7.6pt; border-left: .3mm solid #e2dfd8; padding-left: 4mm; }
#schPrint .info dt { color: #8a857c; }
#schPrint .info dd { margin: 0; font-weight: 600; }
#schPrint .info .ser { border-left: .3mm solid #e2dfd8; padding-left: 4mm; font-size: 7pt; line-height: 1.5; max-height: 34mm; }
#schPrint .info .ser h5 { margin: 0 0 1mm; font: 700 6.3pt Inter, Arial; letter-spacing: .14em; text-transform: uppercase; color: #8a857c; }
#schPrint .info .ser span { display: inline-block; background: #f3f1ec; border-radius: 1.1mm; padding: .3mm 1.4mm; margin: 0 .9mm .9mm 0; white-space: nowrap; }
#schPrint .info .ser span b { color: #b0101a; }
#schPrint .hd { display: flex; align-items: baseline; gap: 4mm; border-bottom: .45mm solid #18181b; padding-bottom: 1mm; margin-bottom: 3mm; font: 700 10pt 'Inter Tight', Inter, Arial; flex: none; }
#schPrint .hd span { font: 500 8pt Inter, Arial; color: #777; }
#schPrint .grid { display: grid; gap: var(--gy) var(--gx); align-content: start; }
#schPrint .it { break-inside: avoid; page-break-inside: avoid; font-size: var(--f); line-height: 1.22; min-width: 0; }
#schPrint .it .im { position: relative; aspect-ratio: 1; border-radius: 1.6mm; overflow: hidden; background: #ddd; }
#schPrint .it .im img { width: 100%; height: 100%; object-fit: cover; display: block; }
#schPrint .it .pos { position: absolute; left: 1mm; top: 1mm; background: rgba(17,17,17,.85); color: #fff; font: 700 calc(var(--f) * .9) Inter, Arial; padding: .3mm 1.1mm; border-radius: .8mm; }
#schPrint .it .cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.4mm 1.3mm 1mm; color: #fff;
  background: linear-gradient(to top, rgba(0,0,0,.72), rgba(0,0,0,.5) 55%, rgba(0,0,0,0)); }
#schPrint .it .cap > div { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#schPrint .it .b { font: 700 calc(var(--f) * .78) Inter, Arial; letter-spacing: .08em; text-transform: uppercase; color: #ffb3b8; }
#schPrint .it .s { font-weight: 700; font-size: calc(var(--f) * 1.08); white-space: normal !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
#schPrint .it .z { color: rgba(255,255,255,.85); }
#schPrint .it .cd { font-weight: 700; letter-spacing: .02em; }
#schPrint .foot { font-size: 6.5pt; color: #999; text-align: center; margin-top: auto; padding-top: 2mm; flex: none; }
#schPrint .sch-page.real { width: 210mm; height: 296mm; padding: 10mm; }
#schPrint .rg { display: grid; align-content: start; }
#schPrint .rh { display: flex; gap: 3mm; align-items: stretch; min-width: 0; overflow: hidden; }
#schPrint .rh .rn { width: 30mm; flex: none; border-radius: 2mm; overflow: hidden; background: linear-gradient(180deg, #f7f6f3, #ecebe7); }
#schPrint .rh .rn img { width: 100%; height: 100%; object-fit: contain; display: block; }
#schPrint .rh .k { font: 700 6pt Inter, Arial; letter-spacing: .18em; text-transform: uppercase; color: #b0101a; }
#schPrint .rh h1 { font: 700 13pt/1.08 'Inter Tight', Inter, Arial; letter-spacing: -.02em; margin: 1mm 0 .5mm; }
#schPrint .rh .cm { font-size: 7.5pt; color: #555; }
#schPrint .rh .big { display: flex; gap: 5mm; margin-top: 2mm; }
#schPrint .rh .big b { display: block; font: 700 12pt/1 'Inter Tight', Inter, Arial; }
#schPrint .rh .big span { font-size: 6pt; color: #777; }
#schPrint .real .it { position: relative; overflow: visible; }
/* mattonelle sovrapposte: ognuna continua 2 mm sotto la successiva, così negli angoli smussati si vede il bordo scuro di quella sotto (niente bianco) */
#schPrint .real .it .im { aspect-ratio: auto; height: 100%; width: calc(100% + 2mm); border-radius: 1.6mm 0 0 1.6mm; background: none; }
#schPrint .real .it .im.np { background: #d9d6d0; }
#schPrint .real .it.end .im { width: 100%; }
#schPrint .real .it .im::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: var(--sh); }
#schPrint .real .it.end .im::after { background: linear-gradient(to right, rgba(0,0,0,0) 52%, rgba(0,0,0,.10) 72%, rgba(0,0,0,.26) 88%, rgba(0,0,0,.46) 100%); }
#schPrint .real .it .cap { position: absolute; left: 0; right: 0; top: calc(100% + .9mm); padding: 0 .6mm; background: none; color: #18181b; font-size: var(--f); line-height: 1.15; }
#schPrint .real .it .cap > div { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#schPrint .real .it .cap .s { font-weight: 700; font-size: var(--f); white-space: normal; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
#schPrint .real .it .cap .p { color: #b0101a; }
#schPrint .real .it .cap .z { color: #666; }
#schPrint .real .it .cap .cd { font-weight: 700; letter-spacing: .02em; }
#schPrint .rh { padding-right: 3mm; }
#schPrint .rh.wide { flex-direction: column; gap: 2mm; }
#schPrint .rh.wide .rn { width: 100%; height: auto; }
#schPrint .real .it { height: 100%; }
#schPrint .real .it .im.turn img { position: absolute; left: 50%; top: 50%; width: var(--ch); height: var(--cw); transform: translate(-50%, -50%) rotate(90deg); object-fit: cover; }
#schPrint .ph { position: absolute; inset: 0; background: center / cover no-repeat; }
#schPrint .rn { position: relative; }
#schPrint .ph.rnph { background-size: contain; }
/* file PDF: le foto le mette il PDF a piena risoluzione; la "foto" della pagina porta solo scritte, ombre e cornici, sopra */
#schPrint.pdfpass, #schPrint.pdfpass .sch-page { background: transparent !important; }
#schPrint.pdfpass .ph { visibility: hidden; }
#schPrint.pdfpass .it .im:not(.np), #schPrint.pdfpass .rn { background: none; }
#schPrint.pdfpass .real .it .im::after { display: none; }   /* l'ombra è già dentro la foto del PDF */
#schPrint.pdfpass .real .it .im.np { width: 100%; }        /* senza foto: non deve coprire la mattonella dopo (questo strato sta sopra) */
#schPrint .real .it .im.turn .ph { inset: auto; left: 50%; top: 50%; width: var(--ch); height: calc(var(--cw) + 2mm); transform: translate(-50%, -50%) rotate(90deg); }
.sch-wait { position: fixed; inset: 0; z-index: 600; background: rgba(10,10,12,.82); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; }
</style>`);

/* due render dell'espositore da due angolazioni (davanti-sinistra e davanti-destra), con luce e ombre */
async function renderDisplayViews(c, views) {
  await loadThree();
  const T = window.THREE;
  const it = { id: 'sch_' + c.id, comp: c.id, disp: c.disp, x: 0, z: 0, rot: 0 };
  const m = roomModel(it);
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-30000px;top:0;width:0;height:0;pointer-events:none';
  host.innerHTML = `<div class="room-scene"><div class="ritem">${m.html}</div></div>`;
  document.body.appendChild(host);
  const root = host.firstChild;
  try {
    const FLIP = new DOMMatrix().scale(1, -1, 1);
    const scene = new T.Scene(); scene.background = new T.Color('#f3f2ef');
    const imgs = {}, pending = [];
    const loadImg = url => imgs[url] || (imgs[url] = new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = url; }));
    const rev = {}; [window.FOTO_ROOM, window.FOTO_GAL, window.FOTO_MINI].forEach(mp => Object.entries(mp || {}).forEach(([o, v]) => { rev[v] = o; }));
    const bigOf = url => { const i = url.indexOf('foto/'); if (i < 0) return url; const rel = decodeURI(url.slice(i)), o = rev[rel] || rev[url.slice(i)]; return o ? new URL(encodeURI(FOTO_MED[o] || o), location.href).href : url; };
    for (const el of root.querySelectorAll('*')) {
      const w = el.offsetWidth, h = el.offsetHeight; if (w < 0.05 || h < 0.05) continue;
      if (el.classList.contains('empty')) continue;
      const cs = getComputedStyle(el); if (cs.display === 'none') continue;
      const bi = cs.backgroundImage; let url = (bi.match(/url\("?([^")]+)"?\)/) || [])[1];
      let ccol = cssColor(cs.backgroundColor);
      if ((!ccol || ccol.a === 0) && bi && bi !== 'none' && !url) { const fc = firstColor(bi); if (fc) ccol = cssColor(fc); }
      if (!url && (!ccol || ccol.a === 0)) continue;
      const face = !!url && !/retro_/.test(url);
      // davanti delle piastrelle: la foto com'è, con i suoi colori (niente luci che la sbiadiscono)
      const mat = face ? new T.MeshBasicMaterial({ color: 0xffffff, side: T.DoubleSide, toneMapped: false })
        : new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, side: T.DoubleSide, envMapIntensity: 0.3 });
      if (url) {
        const retro = !face; if (!retro) url = bigOf(url);
        const sz = cs.backgroundSize.split(',').pop().trim().split(/\s+/);
        let rx = 1, ry = 1; if (/%$/.test(sz[0]) && /%$/.test(sz[1] || '')) { rx = 100 / parseFloat(sz[0]); ry = 100 / parseFloat(sz[1]); }
        const cover = sz[0] === 'cover';
        pending.push(loadImg(url).then(im => {
          if (!im) return;
          const t = new T.Texture(im); t.encoding = T.sRGBEncoding; t.anisotropy = 16; t.needsUpdate = true;
          if (rx > 1.02 || ry > 1.02) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); }
          else if (cover) { const pa = w / h, ia = im.width / im.height; let sx = 1, sy = 1; if (ia > pa) sx = pa / ia; else sy = ia / pa; t.repeat.set(sx, sy); t.offset.set((1 - sx) / 2, (1 - sy) / 2); }
          mat.map = t; mat.needsUpdate = true;
        }));
        if (retro && ccol) { const c2 = ccol.c.clone(); c2.lerp(new T.Color(1, 1, 1), 0.45); mat.color = c2; }
        mat.roughness = 0.4;
      } else {
        mat.color = ccol.c; const l = ccol.c.r + ccol.c.g + ccol.c.b;
        if (l < 0.5) { mat.color = new T.Color(0x232327).convertSRGBToLinear(); mat.roughness = 0.85; mat.envMapIntensity = 0.12; }   // metallo nero opaco
        if (ccol.a < 1) { mat.transparent = true; mat.opacity = ccol.a; }
      }
      const g = new T.BufferGeometry(), zf = face ? 0.08 : 0;   // la foto sta sullo stesso piano del pannello sotto: la stacco appena, se no resta coperta
      g.setAttribute('position', new T.Float32BufferAttribute([0, 0, zf, w, 0, zf, w, h, zf, 0, h, zf], 3));
      g.setAttribute('uv', new T.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2));
      g.setIndex([0, 2, 1, 0, 3, 2]);
      g.applyMatrix4(new T.Matrix4().fromArray(FLIP.multiply(relMatrix(el, root)).toFloat32Array()));
      g.computeVertexNormals();
      const mesh = new T.Mesh(g, mat); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
    }
    await Promise.all(pending);
    const box = new T.Box3().setFromObject(scene), ctr = box.getCenter(new T.Vector3()), size = box.getSize(new T.Vector3());
    const R = Math.max(size.x, size.y, size.z);
    // pavimento chiaro con ombra morbida
    const floor = new T.Mesh(new T.PlaneGeometry(R * 12, R * 12), new T.MeshStandardMaterial({ color: new T.Color(0xeeece8).convertSRGBToLinear(), roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(ctr.x, box.min.y - 0.2, ctr.z); floor.receiveShadow = true; scene.add(floor);
    scene.add(new T.HemisphereLight(0xffffff, 0xb9b4aa, 0.75));
    const key = new T.DirectionalLight(0xfff6ec, 0.85);
    key.position.set(ctr.x - R * 0.6, box.max.y + R * 1.6, ctr.z + R * 1.2); key.target.position.copy(ctr);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.bias = -0.0005;
    const sc = key.shadow.camera; sc.left = sc.bottom = -R * 1.4; sc.right = sc.top = R * 1.4; sc.near = 1; sc.far = R * 6;
    scene.add(key, key.target);
    const fill = new T.DirectionalLight(0xffffff, 0.35); fill.position.set(ctr.x + R, box.max.y + R, ctr.z + R * 1.5); scene.add(fill);
    const Wpx = 1620, Hpx = 1200;
    const rdr = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rdr.setPixelRatio(1); rdr.setSize(Wpx, Hpx);
    rdr.shadowMap.enabled = true; rdr.shadowMap.type = T.PCFSoftShadowMap;
    rdr.outputEncoding = T.sRGBEncoding; rdr.toneMapping = T.ACESFilmicToneMapping; rdr.toneMappingExposure = 1.15;
    scene.environment = showroomEnv(T, rdr);
    const cam = new T.PerspectiveCamera(28, Wpx / Hpx, 1, R * 40);
    const out = [];
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new T.Vector3(x, y, z));
    for (const [yaw, pitch, flat] of views) {
      const a = yaw * Math.PI / 180, p = pitch * Math.PI / 180, dir = new T.Vector3(Math.sin(a) * Math.cos(p), Math.sin(p), Math.cos(a) * Math.cos(p));
      if (flat) {   // vista frontale senza prospettiva (come la foto di catalogo): i campioni in diagonale hanno tutti la stessa angolazione
        const oc = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, R * 40);
        oc.position.copy(ctr).addScaledVector(dir, R * 8); oc.lookAt(ctr); oc.updateMatrixWorld();
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        corners.forEach(c => { const q = c.clone().applyMatrix4(oc.matrixWorldInverse); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); });
        const hw = (x1 - x0) / 2 * 1.05, hh = (y1 - y0) / 2 * 1.05, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
        // immagine con le proporzioni dell'espositore: nel riquadro del PDF viene più grande possibile
        const asp = hw / hh; rdr.setSize(asp >= 1 ? Wpx : Math.round(Wpx * asp), asp >= 1 ? Math.round(Wpx / asp) : Wpx);
        oc.left = cx - hw; oc.right = cx + hw; oc.top = cy + hh; oc.bottom = cy - hh; oc.updateProjectionMatrix();
        rdr.render(scene, oc);
        out.push(rdr.domElement.toDataURL('image/jpeg', 0.9));
        rdr.setSize(Wpx, Hpx);
        continue;
      }
      const place = dist => { cam.position.copy(ctr).addScaledVector(dir, dist); cam.lookAt(ctr); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); };
      const fits = () => corners.every(c => { const q = c.clone().project(cam); return Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.94 && q.z < 1; });
      let lo = R * 0.3, hi = R * 12;   // distanza minima perché ci stia tutto (niente tagli)
      for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; place(mid); if (fits()) hi = mid; else lo = mid; }
      place(hi);
      rdr.render(scene, cam);
      out.push(rdr.domElement.toDataURL('image/jpeg', 0.9));
    }
    rdr.dispose(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    return out;
  } finally { host.remove(); }
}

/* colonne e grandezza delle scritte perché TUTTI i prodotti stiano in una pagina (spazio utile ≈ 277 × 130 mm) */
function schFit(n) {
  const W = 277, H = 142, gx = 2.6;
  for (let cols = 1; cols <= 20; cols++) {   // il quadrato più grande che fa stare tutto: pochi prodotti = grandi, tanti = piccoli
    const cw = (W - (cols - 1) * gx) / cols, rows = Math.ceil(n / cols), gy = Math.max(2, Math.min(3.5, cw * 0.08));
    if (rows * cw + (rows - 1) * gy <= H) return { cols, f: Math.max(4.6, Math.min(11, cw / 5.4)), gx, gy };
  }
  return { cols: 20, f: 4.6, gx: 2, gy: 2 };
}
/* una scheda (render + dati + prodotti) per ogni espositore; più espositori = più schede nello stesso PDF */
async function exportSchedaPDF(cid) { const c = cid ? comps[cid] : comp(); schLayoutAsk(lay => exportSchede([c], lay)); }
async function exportSchedeCliente(clientId) {
  const list = visibleComps(clientId).filter(c => c.slots.some(k => k && SAMPLE[k]));
  if (!list.length) return toast('Nessun espositore con campioni da esportare');
  schLayoutAsk(lay => exportSchede(list, lay));
}
/* scelta del layout: Quadrati (A4 orizzontale) o Formato reale (A4 verticale, riquadri con le proporzioni del campione) */
function schLayoutAsk(cb) {
  let m = document.getElementById('schAsk'); if (m) m.remove();
  const cur = ui.schLayout || 'quadrati';
  const opt = (v, t, d, pic) => `<button class="btn${cur === v ? ' on' : ''}" data-v="${v}" style="display:grid;grid-template-columns:54px 1fr;gap:12px;align-items:center;text-align:left;padding:12px;justify-content:stretch">${pic}<span><b style="font-size:14px">${t}</b><br><span style="font-weight:500;color:var(--mid);font-size:12px">${d}</span></span></button>`;
  const picQ = `<svg viewBox="0 0 54 40" width="54" height="40"><rect x="1" y="1" width="52" height="38" rx="3" fill="#fff" stroke="#bbb"/><rect x="4" y="4" width="12" height="9" fill="#999"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${4 + i * 8}" y="17" width="7" height="7" fill="#c9c4bb"/><rect x="${4 + i * 8}" y="27" width="7" height="7" fill="#c9c4bb"/>`).join('')}</svg>`;
  const picR = `<svg viewBox="0 0 40 54" width="40" height="54" style="margin:0 7px"><rect x="1" y="1" width="38" height="52" rx="3" fill="#fff" stroke="#bbb"/><rect x="4" y="4" width="18" height="9" fill="#999"/>${[0, 1].map(i => `<rect x="${24 + i * 7}" y="4" width="6" height="9" fill="#c9c4bb"/>`).join('')}${[0, 1, 2, 3].map(r => [0, 1, 2, 3, 4].map(i => `<rect x="${4 + i * 6.6}" y="${16 + r * 9.4}" width="5.8" height="8.6" fill="#c9c4bb"/>`).join('')).join('')}</svg>`;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="schAsk" style="z-index:280"><div class="mbox" style="max-width:440px;width:calc(100vw - 32px)">
    <div class="mhead"><h3><svg class="ic"><use href="#i-download"/></svg> Scheda PDF · layout</h3></div>
    <div style="padding:6px 18px 18px;display:flex;flex-direction:column;gap:10px">
      ${opt('quadrati', 'Quadrati', 'A4 orizzontale: render e dati in alto, prodotti in quadrati', picQ)}
      ${opt('reale', 'Formato reale', 'A4 verticale: riquadri con le proporzioni del campione (es. tozzetti 19,5×29,5), anche accanto ai dati', picR)}
      <button class="btn" id="schAskNo">Annulla</button></div></div></div>`);
  m = document.getElementById('schAsk');
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  m.querySelector('#schAskNo').onclick = () => m.remove();
  m.querySelectorAll('button[data-v]').forEach(b => b.onclick = () => { ui.schLayout = b.dataset.v; saveUI(); m.remove(); cb(b.dataset.v); });
}
/* Formato reale (come l'esempio della mobile teca): riquadri con le proporzioni del campione, ATTACCATI in orizzontale,
   righe distribuite su tutta l'altezza del foglio; la fascia con i dati prende i posti che avanzano nella prima riga
   (teca da 42: 8 per riga, fascia su 6 posti + 2 tozzetti, poi 5 righe da 8). Spazio utile 190 × 276 mm. */
function schFitReal(n, a) {
  const W = 190, H = 276, gx = 0, hdrMin = 84;
  for (let c = 1; c <= 30; c++) {
    const cw = (W - (c - 1) * gx) / c, ch = cw * a;
    const f = Math.max(4, Math.min(6.6, cw / 5.4)), textH = 4 * f * 0.3528 * 1.15 + 1.1;   // fino a 4 righe di scritte sotto la mattonella
    const hcMin = Math.min(c, Math.max(1, Math.ceil(hdrMin / cw)));
    const rows = Math.ceil((n + hcMin) / c), gyMin = textH + 0.8;
    if (rows * ch + (rows - 1) * gyMin + textH > H) continue;
    const hc = Math.min(c, rows * c - n);                                               // la prima riga: fascia + i tozzetti che ci stanno
    const gy = rows > 1 ? Math.max(gyMin, Math.min(18, (H - textH - rows * ch) / (rows - 1))) : gyMin;   // righe su tutta l'altezza
    return { c, cw, ch, hc, hr: 1, gx, gy, f };
  }
  return { c: 30, cw: 6.3, ch: 6.3 * a, hc: 20, hr: 1, gx: 0, gy: 6, f: 4 };
}
async function exportSchede(list, layout) {
  const real = layout === 'reale';
  list = list.filter(c => c && DISP[c.disp] && c.slots.some(k => k && SAMPLE[k]));
  if (!list.length) return toast('Questo espositore è vuoto: metti prima i campioni');
  const wait = document.createElement('div'); wait.className = 'sch-wait'; document.body.appendChild(wait);
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const photo = s => { const u = IMG[photoKey(s)]; return u ? ((window.FOTO_GAL || {})[u] || FOTO_MED[u] || u) : ''; };
  // nel PDF va la foto originale (fino a 1920 px, Full HD); l'avif solo se il browser lo apre
  const hiRes = s => { const u = IMG[photoKey(s)]; return !u ? '' : ((typeof AVIF_OK !== 'undefined' && AVIF_OK) || !/\.avif$/i.test(u)) ? u : (FOTO_MED[u] || u); };
  const fin = s => s.a4 ? s.v : (s.f[0] || '').replace(/\s*Rett\.?$/, '');
  const pages = [];
  for (let x = 0; x < list.length; x++) {
    const c = list[x], d = DISP[c.disp], cl = c.client && clients[c.client], n = c.slots.length;
    const filled = c.slots.map((k, i) => [k && SAMPLE[k], i]).filter(([s]) => s);
    wait.textContent = list.length > 1 ? `Preparo il render ${x + 1} di ${list.length}: ${c.name}…` : 'Preparo il render dell\'espositore…';
    // un solo render: girevoli dal lato A in diagonale (le piastrelle guardano di lato), gli altri di fronte ai campioni
    const view = d.mode === 'swing' ? [-58, 14] : [0, 0, true];
    let shot = '';
    try { [shot] = await renderDisplayViews(c, [view]); }
    catch (e) { wait.remove(); say('Non riesco a fare il render (serve internet per il motore 3D). Riprova.'); return; }
    const shotIm = await schLoadImg(shot), shotA = shotIm ? shotIm.naturalWidth / shotIm.naturalHeight : 1.35;   // espositori lunghi e bassi (culle): render largo
    const bySer = new Map(); filled.forEach(([s]) => { const k = s.b + '|' + s.s; bySer.set(k, (bySer.get(k) || 0) + 1); });
    if (real) {
      const face = faceOf(d, c), a = face[1] / face[0], G = schFitReal(filled.length, a), brk = x ? 'break-before:page;page-break-before:always;' : '';
      // ombra a destra fino al bordo visibile; i 2 mm che finiscono sotto la mattonella dopo restano scuri
      const st = p => (p * G.cw / (G.cw + 2)).toFixed(1) + '%';
      const sh = `linear-gradient(to right, rgba(0,0,0,0) ${st(52)}, rgba(0,0,0,.10) ${st(72)}, rgba(0,0,0,.26) ${st(88)}, rgba(0,0,0,.46) ${st(100)}, rgba(0,0,0,.46) 100%)`;
      pages.push(`<div class="sch-page real" style="${brk}"><div class="rg" style="grid-template-columns:repeat(${G.c},${G.cw.toFixed(2)}mm);grid-auto-rows:${G.ch.toFixed(2)}mm;column-gap:${G.gx}mm;row-gap:${G.gy.toFixed(2)}mm;--f:${G.f.toFixed(2)}pt;--cw:${G.cw.toFixed(2)}mm;--ch:${G.ch.toFixed(2)}mm;--sh:${sh}">
        ${(() => { const wide = shotA > 1.6 && (G.hc * G.cw - 3) / shotA + 24 <= G.ch;   // render largo sopra i dati, a tutta larghezza (se c'è posto)
          return `<div class="rh${wide ? ' wide' : ''}" style="grid-column:1 / span ${G.hc};grid-row:1 / span ${G.hr}">
          <div class="rn"${wide ? ` style="aspect-ratio:${shotA.toFixed(3)}"` : ''}><span class="ph rnph" style="background-image:url('${shot}')"></span></div>`; })()}
          <div><div class="k">Scheda espositore${list.length > 1 ? ` · ${x + 1} di ${list.length}` : ''}</div><h1>${esc(d.name)}</h1><div class="cm">${esc(c.name)}${cl ? ' · ' + esc(cl.name) : ''}</div>
            <div class="big"><div><b>${filled.length}</b><span>campioni su ${n} posti</span></div><div><b>${bySer.size}</b><span>serie</span></div></div></div></div>
        ${filled.map(([s, i], j) => { const u = photo(s), turn = u && a > 1.05 && glLandscape(s);
          const end = (G.hc + j) % G.c === G.c - 1 || j === filled.length - 1;   // ultima della riga: non va sotto a nessuna
          return `<div class="it${end ? ' end' : ''}"><div class="im${turn ? ' turn' : ''}${u ? '' : ' np'}">${u ? `<span class="ph" data-hi="${esc(hiRes(s))}" style="background-image:url('${esc(u)}')"></span>` : ''}</div>
            <div class="cap"><div class="s"><span class="p">${esc(slotName(d, i, n))}</span> ${esc(glTitle(s.s))} ${esc(glTitle(s.c))}</div>
            <div class="z">${esc(s.toz ? fmt(tozFmt(d, c)) : fmt(s.z))}${fin(s) ? ' · ' + esc(fin(s)) : ''}</div><div class="cd">${esc((s.k || []).join(' / '))}</div></div></div>`; }).join('')}
      </div></div>`);
      continue;
    }
    pages.push(`<div class="sch-page"${x ? ' style="break-before:page;page-break-before:always"' : ''}><section class="top"${shotA > 1.6 ? ` style="grid-template-columns:${Math.min(110, 34 * shotA).toFixed(1)}mm 1fr"` : ''}>
      <div class="rn"><span class="ph rnph" style="background-image:url('${shot}')"></span></div>
      <div class="info">
        <div><div class="k">Scheda espositore${list.length > 1 ? ` · ${x + 1} di ${list.length}` : ''}</div><h1>${esc(d.name)}</h1><div class="cm">${esc(c.name)}</div>
        <div class="big"><div><b>${filled.length}</b><span>campioni su ${n} posti</span></div><div><b>${bySer.size}</b><span>serie</span></div></div></div>
        <dl><dt>Codice</dt><dd>${esc(d.code)}</dd>${d.dims ? `<dt>Misure</dt><dd>${esc(d.dims)}</dd>` : ''}
          ${cl ? `<dt>Cliente</dt><dd>${esc(cl.name)}${cl.city ? ' · ' + esc(cl.city) : ''}</dd>` : ''}<dt>Data</dt><dd>${today}</dd></dl>
        <div class="ser"><h5>Serie esposte</h5>${[...bySer.entries()].map(([k, v]) => `<span>${esc(glTitle(k.split('|')[1]))} <b>${v}</b></span>`).join('')}</div>
      </div>
    </section>
    <div class="hd">Prodotti nell'espositore <span>${filled.length} campioni · in ordine di posto</span></div>
    <div class="grid" style="${(g => `grid-template-columns:repeat(${g.cols},minmax(0,1fr));--f:${g.f.toFixed(2)}pt;--gx:${g.gx}mm;--gy:${g.gy.toFixed(1)}mm`)(schFit(filled.length))}">${filled.map(([s, i]) => { const u = photo(s);
      return `<div class="it"><div class="im${u ? '' : ' np'}">${u ? `<span class="ph" data-hi="${esc(hiRes(s))}" style="background-image:url('${esc(u)}')"></span>` : ''}<span class="pos">${esc(slotName(d, i, n))}</span>
        <div class="cap"><div class="s">${esc(glTitle(s.s))} ${esc(glTitle(s.c))}</div>
        <div class="z">${esc(s.toz ? fmt(tozFmt(d, c)) : fmt(s.z) + ' cm')}${fin(s) ? ' · ' + esc(fin(s)) : ''}</div></div></div></div>`; }).join('')}</div>
    <div class="foot">${esc(d.name)} · ${esc(c.name)}${cl ? ' · ' + esc(cl.name) : ''} · ${today}</div></div>`);
  }
  wait.textContent = 'Preparo il PDF…';
  let el = document.getElementById('schPrint'); if (!el) { el = document.createElement('div'); el.id = 'schPrint'; document.body.appendChild(el); }
  el.innerHTML = pages.join('');
  const urls = [...el.querySelectorAll('.ph')].map(x => (x.style.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1]).filter(Boolean);
  await Promise.all([...new Set(urls)].map(u => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = u; })));
  const name = (list.length > 1 ? 'schede-' + ((list[0].client && clients[list[0].client] && clients[list[0].client].name) || 'espositori') : 'scheda-' + list[0].name) + '.pdf';
  const ok = await schMakePDF(el, real, name.replace(/[^\w\-.]+/g, '_'), wait, list.length > 1 ? `Le ${list.length} schede sono pronte` : 'La scheda è pronta');
  if (!ok) { wait.remove(); printWhenReady('sch-printing', list.length > 1 ? `Le ${list.length} schede sono pronte` : 'La scheda è pronta', real ? 'A4 portrait' : 'A4 landscape'); }
}
/* crea il file PDF: ogni scheda diventa una pagina (immagine fedele della pagina), senza passare dalla stampa del browser */
const PDF_LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
function loadPdfLibs() {
  return Promise.all(PDF_LIBS.map(src => (window.html2canvas && /html2canvas/.test(src)) || (window.jspdf && /jspdf/.test(src)) ? 0
    : new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = rej; document.head.appendChild(sc); })));
}
const schLoadImg = u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
/* foto per il PDF: tagliata come nel riquadro (cover), girata se serve, alla risoluzione dell'originale (massimo 1920 px).
   shade (formato reale) = parte visibile della mattonella: ombra a destra fino al bordo, poi il pezzo che va sotto la successiva in ombra */
async function schPhotoJpeg(u, turn, aspect, shade, maxPx) {
  const im = u && await schLoadImg(u); if (!im) return '';
  const iw = im.naturalWidth, ih = im.naturalHeight, sw = turn ? ih : iw, sh = turn ? iw : ih;
  let cw = sw, ch = sw / aspect; if (ch > sh) { ch = sh; cw = sh * aspect; }
  const s = Math.min(1, maxPx / Math.max(cw, ch)), W = Math.max(1, Math.round(cw * s)), H = Math.max(1, Math.round(ch * s));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high';
  g.translate(W / 2, H / 2); if (turn) g.rotate(Math.PI / 2);
  g.drawImage(im, -iw * s / 2, -ih * s / 2, iw * s, ih * s);
  if (shade) {
    g.setTransform(1, 0, 0, 1, 0, 0);
    const vw = W * shade, gr = g.createLinearGradient(0, 0, vw, 0);
    [[0.52, 0], [0.72, 0.10], [0.88, 0.26], [1, 0.46]].forEach(([p, a]) => gr.addColorStop(p, `rgba(0,0,0,${a})`));
    g.fillStyle = gr; g.fillRect(0, 0, vw, H);
    g.fillStyle = 'rgba(0,0,0,.46)'; g.fillRect(vw, 0, W - vw, H);
  }
  const d = cv.toDataURL('image/jpeg', 0.88); cv.width = cv.height = 0;
  return d;
}
/* riquadro con angoli arrotondati (r = [alto sx, alto dx, basso dx, basso sx]) come percorso per ritagliare */
function schClipPath(pdf, x, y, w, h, r) {
  const K = 0.5523, [tl, tr, br, bl] = r;
  pdf.moveTo(x + tl, y); pdf.lineTo(x + w - tr, y);
  if (tr) pdf.curveTo(x + w - tr + tr * K, y, x + w, y + tr - tr * K, x + w, y + tr);
  pdf.lineTo(x + w, y + h - br);
  if (br) pdf.curveTo(x + w, y + h - br + br * K, x + w - br + br * K, y + h, x + w - br, y + h);
  pdf.lineTo(x + bl, y + h);
  if (bl) pdf.curveTo(x + bl - bl * K, y + h, x, y + h - bl + bl * K, x, y + h - bl);
  pdf.lineTo(x, y + tl);
  if (tl) pdf.curveTo(x, y + tl - tl * K, x + tl - tl * K, y, x + tl, y);
  pdf.close();
}
async function schMakePDF(el, real, name, wait, title) {
  try { await loadPdfLibs(); } catch (e) { return false; }
  if (!window.html2canvas || !window.jspdf) return false;
  const pw = real ? 210 : 297, ph = real ? 297 : 210;
  // la pagina deve essere visibile (fuori schermo) per essere fotografata
  el.style.cssText = `display:block;position:absolute;left:-20000px;top:0;width:${pw}mm`;
  el.classList.add('pdfpass');
  const pagesEl = [...el.querySelectorAll('.sch-page')];
  const pdf = new window.jspdf.jsPDF({ orientation: real ? 'portrait' : 'landscape', unit: 'mm', format: 'a4', compress: true });
  const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
  const made = new Map();   // stessa foto, stesso taglio: nel PDF una volta sola
  // Full HD (1920 px); con tantissime foto (schede di tutti gli espositori) un po' meno, se no il file diventa enorme e il telefono non ce la fa
  const maxPx = el.querySelectorAll('.ph:not(.rnph)').length > 120 ? 1280 : 1920;
  try {
    for (let i = 0; i < pagesEl.length; i++) {
      wait.textContent = `Creo il PDF… pagina ${i + 1} di ${pagesEl.length}`;
      const pg = pagesEl[i]; pg.style.breakBefore = 'auto'; pg.style.width = pw + 'mm';
      if (i) pdf.addPage('a4', real ? 'portrait' : 'landscape');
      const pr = pg.getBoundingClientRect(), k = pw / pr.width;   // px → mm
      // 1) sotto: le foto, ognuna nel suo riquadro con gli angoli arrotondati (in ordine: la mattonella dopo copre il pezzo di quella prima)
      const phs = [...pg.querySelectorAll('.ph')];
      for (const [j, x] of phs.entries()) {
        wait.textContent = `Creo il PDF… pagina ${i + 1} di ${pagesEl.length} · foto ${j + 1} di ${phs.length}`;
        const box = x.parentElement, r = box.getBoundingClientRect(), cs = getComputedStyle(box), rn = x.classList.contains('rnph');
        const bx = (r.left - pr.left) * k, by = (r.top - pr.top) * k, bw = r.width * k, bh = r.height * k;
        const rad = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(p => Math.min(bw / 2, bh / 2, (parseFloat(cs[p]) || 0) * k));
        const it = box.closest('.it'), ext = it && !it.classList.contains('end') ? Math.max(0, bw - it.getBoundingClientRect().width * k) : 0;
        pdf.saveGraphicsState(); schClipPath(pdf, bx, by, bw, bh, rad); pdf.clip(); pdf.discardPath();
        if (rn) {   // render dell'espositore: intero (contain) sul fondo chiaro
          const u = (x.style.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1], im = u && await schLoadImg(u);
          pdf.setFillColor(243, 242, 239); pdf.rect(bx, by, bw, bh, 'F');
          if (im) { const s = Math.min(bw / im.naturalWidth, bh / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
            pdf.addImage(u, 'JPEG', bx + (bw - w) / 2, by + (bh - h) / 2, w, h, 'render' + i, 'NONE'); }
        } else {
          const u = x.dataset.hi || (x.style.backgroundImage.match(/url\(["']?([^"')]+)/) || [])[1], turn = box.classList.contains('turn');
          const shade = real && it ? (bw - ext) / bw : 0;   // il pezzo che finisce sotto la mattonella dopo resta in ombra (si vede negli angoli smussati)
          const key = u + '|' + turn + '|' + (bw / bh).toFixed(3) + '|' + shade.toFixed(3);
          if (!made.has(key)) made.set(key, await schPhotoJpeg(u, turn, bw / bh, shade, maxPx));
          const d = made.get(key);
          if (d) pdf.addImage(d, 'JPEG', bx, by, bw, bh, key, 'NONE');
          else { pdf.setFillColor(217, 214, 208); pdf.rect(bx, by, bw, bh, 'F'); }
        }
        pdf.restoreGraphicsState();
      }
      // 2) sopra: scritte, ombre e cornici (trasparente dove ci sono le foto)
      const cv = await window.html2canvas(pg, { scale: mobile ? 2.4 : 3, backgroundColor: null, useCORS: true, logging: false });
      pdf.addImage(cv, 'PNG', 0, 0, pw, Math.min(ph, cv.height / cv.width * pw), 'pg' + i, 'FAST');
      cv.width = cv.height = 0;
    }
  } catch (e) { console.error(e); el.classList.remove('pdfpass'); el.style.cssText = ''; return false; }
  el.classList.remove('pdfpass'); el.style.cssText = '';
  const blob = pdf.output('blob'), url = URL.createObjectURL(blob);
  wait.remove();
  const download = () => { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
  if (!mobile) { download(); toast('PDF scaricato: ' + name); return true; }
  // telefono: condividi (Salva su File, WhatsApp…) con un tocco
  const file = new File([blob], name, { type: 'application/pdf' });
  const o = document.createElement('div');
  o.style.cssText = 'position:fixed;inset:0;z-index:700;background:rgba(10,10,12,.82);display:flex;align-items:center;justify-content:center;padding:20px';
  o.innerHTML = `<div style="background:#fff;border-radius:18px;padding:22px 20px;max-width:360px;width:100%;text-align:center;font-family:var(--font-body)">
      <div style="font:700 18px var(--font-display);margin-bottom:6px">${esc(title)}</div>
      <div style="font-size:13px;color:#666;margin-bottom:16px">Tocca <b>Condividi PDF</b> e scegli <b>Salva su File</b> o WhatsApp.</div>
      <button class="btn red" id="pdfShare" style="width:100%;padding:13px;font-size:15px;justify-content:center"><svg class="ic"><use href="#i-download"/></svg> Condividi PDF</button>
      <button class="btn" id="pdfOpen" style="width:100%;margin-top:8px;justify-content:center">Apri il PDF</button>
      <button class="btn" id="pdfNo" style="width:100%;margin-top:8px;justify-content:center">Chiudi</button></div>`;
  document.body.appendChild(o);
  o.querySelector('#pdfShare').onclick = async () => {
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: name }); o.remove(); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    download();
  };
  o.querySelector('#pdfOpen').onclick = () => { window.open(url, '_blank') || download(); };
  o.querySelector('#pdfNo').onclick = () => o.remove();
  return true;
}
