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
  @page { size: A4 landscape; margin: 9mm 10mm 10mm; }
}
#schPrint { font-family: Inter, Arial, sans-serif; color: #18181b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#schPrint .top { display: grid; grid-template-columns: 1.15fr 1fr; gap: 6mm; height: 70mm; margin-bottom: 5mm; }
#schPrint .rn { border-radius: 3mm; overflow: hidden; background: linear-gradient(180deg, #f7f6f3, #ecebe7); display: flex; align-items: center; justify-content: center; }
#schPrint .rn img { width: 100%; height: 100%; object-fit: contain; display: block; }
#schPrint .info { display: flex; flex-direction: column; gap: 2.2mm; padding: 1mm 0; min-height: 0; }
#schPrint .info .k { font: 700 7pt Inter, Arial; letter-spacing: .22em; text-transform: uppercase; color: #b0101a; }
#schPrint .info h1 { font: 700 16pt/1.05 'Inter Tight', Inter, Arial; letter-spacing: -.025em; margin: 1.5mm 0 1mm; }
#schPrint .info .cm { font-size: 10pt; color: #555; }
#schPrint .info dl { display: grid; grid-template-columns: 18mm 1fr; gap: .9mm 3mm; margin: 0; font-size: 8pt; border-top: .3mm solid #e2dfd8; padding-top: 2mm; }
#schPrint .info dt { color: #8a857c; }
#schPrint .info dd { margin: 0; font-weight: 600; }
#schPrint .info .big { display: flex; gap: 8mm; }
#schPrint .info .big b { display: block; font: 700 15pt/1 'Inter Tight', Inter, Arial; }
#schPrint .info .big span { font-size: 7.5pt; color: #777; }
#schPrint .info .ser { border-top: .3mm solid #e2dfd8; padding-top: 2mm; font-size: 7.4pt; line-height: 1.55; overflow: hidden; }
#schPrint .info .ser h5 { margin: 0 0 1mm; font: 700 6.8pt Inter, Arial; letter-spacing: .14em; text-transform: uppercase; color: #8a857c; }
#schPrint .info .ser span { display: inline-block; background: #f3f1ec; border-radius: 1.2mm; padding: .4mm 1.6mm; margin: 0 1mm 1mm 0; white-space: nowrap; }
#schPrint .info .ser span b { color: #b0101a; }
#schPrint .hd { display: flex; align-items: baseline; gap: 4mm; border-bottom: .45mm solid #18181b; padding-bottom: 1.3mm; margin-bottom: 3.5mm; font: 700 11pt 'Inter Tight', Inter, Arial; }
#schPrint .hd span { font: 500 8pt Inter, Arial; color: #777; }
#schPrint .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4.5mm 3.5mm; }
#schPrint .it { break-inside: avoid; page-break-inside: avoid; font-size: 7.6pt; line-height: 1.3; }
#schPrint .it .im { position: relative; aspect-ratio: 1; border-radius: 1.6mm; overflow: hidden; background: #eee; margin-bottom: 1.4mm; }
#schPrint .it .im img { width: 100%; height: 100%; object-fit: cover; display: block; }
#schPrint .it .pos { position: absolute; left: 1.1mm; top: 1.1mm; background: rgba(17,17,17,.85); color: #fff; font: 700 6.3pt Inter, Arial; padding: .35mm 1.2mm; border-radius: .9mm; }
#schPrint .it .b { font: 700 6.4pt Inter, Arial; letter-spacing: .1em; text-transform: uppercase; color: #b0101a; }
#schPrint .it .s { font-weight: 700; font-size: 8.4pt; }
#schPrint .it .z { color: #666; }
#schPrint .it .cd { font-weight: 700; margin-top: .4mm; letter-spacing: .02em; }
#schPrint .foot { font-size: 7pt; color: #999; text-align: center; margin-top: 5mm; }
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
      const mat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0, side: T.DoubleSide, envMapIntensity: 0.3 });
      if (url) {
        const retro = /retro_/.test(url); if (!retro) url = bigOf(url);
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
      const g = new T.BufferGeometry();
      g.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, w, 0, 0, w, h, 0, 0, h, 0], 3));
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
    const Wpx = 1600, Hpx = 1300;
    const rdr = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    rdr.setPixelRatio(1); rdr.setSize(Wpx, Hpx);
    rdr.shadowMap.enabled = true; rdr.shadowMap.type = T.PCFSoftShadowMap;
    rdr.outputEncoding = T.sRGBEncoding; rdr.toneMapping = T.ACESFilmicToneMapping; rdr.toneMappingExposure = 1.15;
    scene.environment = showroomEnv(T, rdr);
    const cam = new T.PerspectiveCamera(28, Wpx / Hpx, 1, R * 40);
    const out = [];
    const corners = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) corners.push(new T.Vector3(x, y, z));
    for (const [yaw, pitch] of views) {
      const a = yaw * Math.PI / 180, p = pitch * Math.PI / 180, dir = new T.Vector3(Math.sin(a) * Math.cos(p), Math.sin(p), Math.cos(a) * Math.cos(p));
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

/* una scheda (render + dati + prodotti) per ogni espositore; più espositori = più schede nello stesso PDF */
async function exportSchedaPDF(cid) { return exportSchede([cid ? comps[cid] : comp()]); }
async function exportSchedeCliente(clientId) {
  const list = visibleComps(clientId).filter(c => c.slots.some(k => k && SAMPLE[k]));
  if (!list.length) return toast('Nessun espositore con campioni da esportare');
  return exportSchede(list);
}
async function exportSchede(list) {
  list = list.filter(c => c && DISP[c.disp] && c.slots.some(k => k && SAMPLE[k]));
  if (!list.length) return toast('Questo espositore è vuoto: metti prima i campioni');
  const wait = document.createElement('div'); wait.className = 'sch-wait'; document.body.appendChild(wait);
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const photo = s => { const u = IMG[photoKey(s)]; return u ? ((window.FOTO_GAL || {})[u] || FOTO_MED[u] || u) : ''; };
  const fin = s => s.a4 ? s.v : (s.f[0] || '').replace(/\s*Rett\.?$/, '');
  const pages = [];
  for (let x = 0; x < list.length; x++) {
    const c = list[x], d = DISP[c.disp], cl = c.client && clients[c.client], n = c.slots.length;
    const filled = c.slots.map((k, i) => [k && SAMPLE[k], i]).filter(([s]) => s);
    wait.textContent = list.length > 1 ? `Preparo il render ${x + 1} di ${list.length}: ${c.name}…` : 'Preparo il render dell\'espositore…';
    // un solo render: girevoli dal lato A (le piastrelle guardano di lato), gli altri davanti-sinistra
    const view = d.mode === 'swing' ? [-58, 14] : [-28, 13];
    let shot = '';
    try { [shot] = await renderDisplayViews(c, [view]); }
    catch (e) { wait.remove(); say('Non riesco a fare il render (serve internet per il motore 3D). Riprova.'); return; }
    const bySer = new Map(); filled.forEach(([s]) => { const k = s.b + '|' + s.s; bySer.set(k, (bySer.get(k) || 0) + 1); });
    pages.push(`<div class="sch-page"${x ? ' style="break-before:page;page-break-before:always"' : ''}><section class="top">
      <div class="rn"><img src="${shot}" alt=""></div>
      <div class="info">
        <div><div class="k">Scheda espositore${list.length > 1 ? ` · ${x + 1} di ${list.length}` : ''}</div><h1>${esc(d.name)}</h1><div class="cm">${esc(c.name)}</div></div>
        <div class="big"><div><b>${filled.length}</b><span>campioni su ${n} posti</span></div><div><b>${bySer.size}</b><span>serie</span></div></div>
        <dl><dt>Codice</dt><dd>${esc(d.code)}</dd>${d.dims ? `<dt>Misure</dt><dd>${esc(d.dims)}</dd>` : ''}
          ${cl ? `<dt>Cliente</dt><dd>${esc(cl.name)}${cl.city ? ' · ' + esc(cl.city) : ''}</dd>` : ''}<dt>Data</dt><dd>${today}</dd></dl>
        <div class="ser"><h5>Serie esposte</h5>${[...bySer.entries()].map(([k, v]) => `<span>${esc(glTitle(k.split('|')[1]))} <b>${v}</b></span>`).join('')}</div>
      </div>
    </section>
    <div class="hd">Prodotti nell'espositore <span>${filled.length} campioni · in ordine di posto</span></div>
    <div class="grid">${filled.map(([s, i]) => { const u = photo(s);
      return `<div class="it"><div class="im">${u ? `<img src="${esc(u)}" alt="">` : ''}<span class="pos">${esc(slotName(d, i, n))}</span></div>
        <div class="b">${esc(s.b)}</div><div class="s">${esc(glTitle(s.s))} ${esc(glTitle(s.c))}</div>
        <div class="z">${esc(s.toz ? fmt(tozFmt(d, c)) : fmt(s.z) + ' cm')}${fin(s) ? ' · ' + esc(fin(s)) : ''}</div>
        <div class="cd">${esc((s.k || []).join(' / '))}</div></div>`; }).join('')}</div>
    <div class="foot">${esc(d.name)} · ${esc(c.name)}${cl ? ' · ' + esc(cl.name) : ''} · ${today}</div></div>`);
  }
  wait.textContent = 'Preparo il PDF…';
  let el = document.getElementById('schPrint'); if (!el) { el = document.createElement('div'); el.id = 'schPrint'; document.body.appendChild(el); }
  el.innerHTML = pages.join('');
  await Promise.all([...el.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  wait.remove();
  document.body.classList.add('sch-printing');
  const done = () => { document.body.classList.remove('sch-printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 150);
}
