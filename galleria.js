'use strict';
/* ════════════════════════════════════════════════════════════
   GALLERIA CAMPIONI della sala mostra (#/campioni/CLIENTE[/COMPOSIZIONE])
   Senza entrare nella stanza 3D: in alto gli espositori del cliente, per ogni serie le strisce verticali
   con le foto dei colori (come i cataloghi) e il nome della serie accanto. Tocchi una striscia: il campione
   a tutto schermo con serie, colore, formato, finiture e codici; frecce o scorrendo col dito per gli altri.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewGallery'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
<style>
body[data-view="gallery"] #viewGallery { display: block; }
body[data-view="gallery"] .hbtn[data-nav="home"] { background: var(--red); border-color: var(--red); }
#viewGallery { background: #fbfaf8; min-height: calc(100vh - 56px); }
.gl-wrap { max-width: 1280px; margin: 0 auto; padding: 18px 20px 60px; }
.gl-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.gl-head h2 { font-size: 22px; flex: 1; min-width: 200px; }
.gl-head h2 small { display: block; font: 600 12px var(--font-body); color: var(--mid); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 2px; }
.gl-tabs { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 12px; scrollbar-width: thin; }
.gl-tab { flex: none; display: flex; align-items: center; gap: 8px; border: 1px solid var(--border); background: #fff; border-radius: 14px; padding: 6px 12px 6px 6px; cursor: pointer; font: 600 13px var(--font-body); color: var(--dark); }
.gl-tab img { width: 38px; height: 38px; object-fit: contain; border-radius: 9px; background: #f2f0ec; }
.gl-tab .k { display: block; font-weight: 500; font-size: 11px; color: var(--mid); }
.gl-tab.on { background: var(--dark); color: #fff; border-color: var(--dark); }
.gl-tab.on .k { color: #bbb; }
.gl-tab.on img { background: #2a2a2a; }
.gl-serie { display: flex; gap: 28px; align-items: stretch; padding: 26px 0; border-top: 1px solid #ebe8e2; }
.gl-strips { flex: 1; display: flex; gap: 18px; overflow-x: auto; padding: 14px 12px 16px; scroll-snap-type: x proximity; }
.gl-strip { --sw: clamp(96px, 11vw, 150px); --sh: clamp(320px, 52vh, 520px); position: relative; flex: none; width: var(--sw); height: var(--sh); border-radius: 999px 999px 999px 999px / 26px 26px 999px 999px;
  overflow: hidden; cursor: pointer; background: #e9e6df; box-shadow: 0 10px 26px rgba(40,30,20,.10); scroll-snap-align: start; transition: transform .25s, box-shadow .25s; border: 0; padding: 0; }
.gl-strip:hover { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(40,30,20,.16); }
.gl-strip .glph { position: absolute; inset: 0; background-size: cover; background-position: center; }
.gl-strip .glph.turn { inset: auto; left: 50%; top: 50%; width: var(--sh); height: var(--sw); transform: translate(-50%, -50%) rotate(90deg); }
.gl-strip .nm { position: absolute; left: 0; right: 0; top: 0; padding: 16px 8px 30px; text-align: center; font: 600 12.5px var(--font-body); color: #222;
  background: linear-gradient(rgba(255,255,255,.82), rgba(255,255,255,0)); }
.gl-strip .nm small { display: block; font-weight: 500; font-size: 10.5px; color: #555; margin-top: 2px; }
.gl-strip .nof { position: absolute; inset: auto 0 44% 0; text-align: center; font-size: 11px; color: #8a857b; }
.gl-info { flex: none; width: 270px; border-left: 2px solid #d8d4cc; padding: 6px 0 6px 22px; display: flex; flex-direction: column; justify-content: center; }
.gl-info .t { font: 600 12.5px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #333; }
.gl-info h3 { font: 500 34px/1.08 'Playfair Display', Georgia, serif; letter-spacing: -.01em; margin: 6px 0 12px; color: #1a1a1a; }
.gl-info .b { font: 700 11px var(--font-body); color: var(--red); letter-spacing: .1em; text-transform: uppercase; }
.gl-info p { margin: 8px 0 0; font-size: 13.5px; line-height: 1.5; color: #444; }
.gl-info p b { color: #222; }
.gl-empty { padding: 40px; text-align: center; color: var(--mid); }
/* colori che non ha: foto normale, con una luce rossa intorno */
.gl-strip.miss { box-shadow: 0 0 0 3px rgba(214,30,40,.95), 0 0 22px 6px rgba(230,40,50,.55), 0 10px 26px rgba(40,30,20,.10); }
.gl-strip.miss:hover { box-shadow: 0 0 0 3px rgba(214,30,40,1), 0 0 30px 9px rgba(230,40,50,.65), 0 16px 34px rgba(40,30,20,.16); }
.gl-strip .tag { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 2; white-space: nowrap; font: 700 10px var(--font-body); letter-spacing: .04em;
  padding: 4px 8px; border-radius: 999px; background: rgba(150,15,20,.92); color: #fff; }
.gl-strip .tag.el { background: rgba(255,255,255,.9); color: #333; }
.gl-tools { display: flex; gap: 8px; align-items: center; margin: -4px 0 10px; flex-wrap: wrap; }
.gl-tools .btn.on { background: #8e1016; border-color: #8e1016; color: #fff; }
.gl-tools .lg { font-size: 12px; color: var(--mid); display: flex; gap: 12px; flex-wrap: wrap; }
.gl-tools .lg i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; vertical-align: -2px; margin-right: 4px; }
.gl-tab.all img { display: none; }
.gl-tab.all { padding-left: 14px; }
.gl-full .gl-side .warn { background: #8e1016; color: #fff; font: 700 12px var(--font-body); padding: 7px 10px; border-radius: 8px; }
.gl-full .gl-side .elsew { background: #2a2a2e; color: #ddd; font: 600 12px var(--font-body); padding: 7px 10px; border-radius: 8px; }
@media (max-width: 760px) {
  .gl-wrap { padding: 12px 12px 40px; }
  .gl-serie { flex-direction: column-reverse; gap: 12px; padding: 18px 0; }
  .gl-info { width: auto; border-left: 0; padding: 0; }
  .gl-info h3 { font-size: 27px; margin-bottom: 6px; }
  .gl-strip { --sw: 104px; --sh: 360px; }
}
/* schermo intero */
.gl-full { position: fixed; inset: 0; z-index: 450; background: #0e0e10; color: #fff; display: flex; }
.gl-full .gl-stage { flex: 1; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: pan-y; }
.gl-full .gl-stage img { object-fit: contain; border-radius: 6px; box-shadow: 0 30px 80px rgba(0,0,0,.6); transition: transform .35s, opacity .2s; }
.gl-full .gl-side { width: 330px; flex: none; background: #17171a; padding: 26px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }
.gl-full .gl-side .t { font: 600 11.5px var(--font-body); letter-spacing: .16em; text-transform: uppercase; color: #9a9a9a; }
.gl-full .gl-side h3 { font: 500 32px/1.1 'Playfair Display', Georgia, serif; margin: 2px 0 0; }
.gl-full .gl-side .col { font: 600 20px var(--font-body); color: #fff; }
.gl-full .gl-side .b { font: 700 11px var(--font-body); color: #ff5a5a; letter-spacing: .1em; text-transform: uppercase; }
.gl-full .gl-side dl { margin: 6px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; font-size: 13.5px; }
.gl-full .gl-side dt { color: #8d8d8d; } .gl-full .gl-side dd { margin: 0; color: #eee; }
.gl-full .gl-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 50px; height: 50px; border-radius: 50%; border: 0; background: rgba(255,255,255,.12); color: #fff; font-size: 26px; cursor: pointer; }
.gl-full .gl-nav:disabled { opacity: .25; cursor: default; }
.gl-full .gl-nav.l { left: 14px; } .gl-full .gl-nav.r { right: 14px; }
.gl-full .gl-x { position: absolute; top: 12px; right: 12px; z-index: 2; border: 0; background: rgba(255,255,255,.14); color: #fff; border-radius: 20px; padding: 8px 14px; font: 700 13px var(--font-body); cursor: pointer; }
.gl-full .gl-rot { position: absolute; top: 12px; left: 12px; z-index: 2; border: 0; background: rgba(255,255,255,.14); color: #fff; border-radius: 20px; padding: 8px 12px; font: 700 13px var(--font-body); cursor: pointer; }
.gl-full .gl-count { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #aaa; }
@media (max-width: 760px) {
  .gl-full { flex-direction: column; }
  .gl-full .gl-side { width: auto; max-height: 38vh; padding: 14px 16px; gap: 8px; }
  .gl-full .gl-side h3 { font-size: 24px; }
  .gl-full .gl-nav { width: 42px; height: 42px; }
}
</style>`);

let glState = null;
/* espositori della sala mostra del cliente (tutte le stanze, da sinistra a destra): una voce per composizione */
function galleryDisplays(cid) {
  const seen = new Set(), out = [];
  showRooms(cid).forEach(r => r.items.slice().sort((a, b) => a.x - b.x).forEach(it => {
    const c = comps[it.comp], d = DISP[it.disp];
    if (!c || !d || !d.slots || seen.has(c.id) || !c.slots.some(k => k && SAMPLE[k])) return;
    seen.add(c.id); out.push({ c, d, room: r.name });
  }));
  return out;
}
/* campioni di una o più composizioni raggruppati per serie (nell'ordine dei posti), senza doppioni */
function gallerySeries(list) {
  const groups = new Map();
  list.forEach(c => c.slots.forEach((k, i) => {
    const s = k && SAMPLE[k]; if (!s) return;
    const g = groups.get(s.b + '|' + s.s) || { b: s.b, s: s.s, items: [], keys: new Set() };
    if (!g.keys.has(s.key)) { g.keys.add(s.key); g.items.push({ s, slot: i, c }); }
    groups.set(s.b + '|' + s.s, g);
  }));
  return [...groups.values()];
}
/* con "Colori che non ha": per ogni serie anche gli altri colori del listino (nel formato più usato),
   segnati come "non in sala mostra" oppure, se il cliente li ha in un altro espositore, "in un altro espositore" */
function addMissingColors(g, all) {
  const here = new Set(g.items.map(x => x.s.c)), inRoom = new Map();
  all.forEach(c => c.slots.forEach(k => { const s = k && SAMPLE[k]; if (s && s.b === g.b && s.s === g.s && !inRoom.has(s.c)) inRoom.set(s.c, c); }));
  const zc = {}; g.items.forEach(x => { zc[x.s.z] = (zc[x.s.z] || 0) + 1; });
  const zPref = Object.keys(zc).sort((a, b) => zc[b] - zc[a])[0];
  const byColor = new Map();
  SAMPLES.filter(x => x.b === g.b && x.s === g.s && !x.toz && !here.has(x.c)).forEach(x => {
    const cur = byColor.get(x.c), score = (x.z === zPref ? 2 : 0) + (hasPhoto(x) ? 1 : 0);
    if (!cur || score > cur.score) byColor.set(x.c, { s: x, score });
  });
  [...byColor.values()].sort((a, b) => a.s.c.localeCompare(b.s.c)).forEach(({ s }) => {
    const other = inRoom.get(s.c);
    g.items.push(other ? { s, elsewhere: other } : { s, missing: true });
  });
  return g;
}
const glTitle = t => String(t || '').toLowerCase().replace(/(^|[\s-])\S/g, m => m.toUpperCase());
function glPhoto(s, big) {
  const u = IMG[photoKey(s)]; if (!u) return null;
  if (big) return (window.AVIF_OK || !/\.avif$/i.test(u)) ? u : (FOTO_MED[u] || u);
  return FOTO_MED[u] || u;
}
const glLandscape = s => { const u = IMG[photoKey(s)], wh = u && (window.FOTO_WH || {})[u]; return wh ? wh[0] > wh[1] * 1.05 : false; };

function renderGallery(cid, sub) {
  const v = document.getElementById('viewGallery'), cl = clients[cid];
  const list = galleryDisplays(cid), allC = list.map(x => x.c);
  const isAll = sub === 'tutti';
  const cur = isAll ? null : list.find(x => x.c.id === sub) || list[0];
  const view = isAll ? allC : cur ? [cur.c] : [];
  const groups = gallerySeries(view).map(g => ui.glMissing ? addMissingColors(g, allC) : g);
  const nTot = new Set(allC.flatMap(c => c.slots.filter(k => k && SAMPLE[k]))).size;
  v.innerHTML = `<div class="gl-wrap">
    <div class="gl-head">
      <button class="btn" onclick="go('#/cliente/${cid}')">← ${esc(cl.name)}</button>
      <h2><small>Sala mostra · campioni</small>${esc(cl.name)}</h2>
      <button class="btn red" onclick="go('#/salamostra/${cid}')">▶ Entra nella sala mostra</button>
    </div>
    ${list.length ? `<div class="gl-tabs"><button class="gl-tab all ${isAll ? 'on' : ''}" onclick="go('#/campioni/${cid}/tutti')"><span>Tutta la sala mostra<span class="k">${nTot} campioni · ${list.length} espositori</span></span></button>${list.map(x => `<button class="gl-tab ${x === cur ? 'on' : ''}" onclick="go('#/campioni/${cid}/${x.c.id}')">
        <img src="${x.d.img}" alt=""><span>${esc(x.c.name)}<span class="k">${esc(x.d.name)} · ${filledOf(x.c)} campioni${showRooms(cid).length > 1 ? ' · ' + esc(x.room) : ''}</span></span></button>`).join('')}</div>` : ''}
    ${list.length ? `<div class="gl-tools"><button class="btn ${ui.glMissing ? 'on' : ''}" onclick="ui.glMissing = !ui.glMissing; saveUI(); renderGallery('${cid}', '${isAll ? 'tutti' : cur ? cur.c.id : ''}')"
        title="Mostra anche gli altri colori di ogni serie">${ui.glMissing ? '✓ ' : ''}◐ Colori che non ha</button>
      ${ui.glMissing ? `<span class="lg"><span><i style="background:#ddd"></i>in sala mostra</span><span><i style="background:#fff;box-shadow:0 0 0 2px #d61e28,0 0 6px 2px rgba(230,40,50,.6)"></i>non in sala mostra</span>${isAll ? '' : '<span><i style="background:#fff;border:1px solid #ccc"></i>in un altro espositore</span>'}</span>` : ''}</div>` : ''}
    <div id="glBody">${groups.length ? groups.map((g, gi) => galleryBlock(g, gi, isAll)).join('') : `<div class="gl-empty">La sala mostra di ${esc(cl.name)} non ha ancora campioni negli espositori.</div>`}</div>
  </div>`;
  glState = view.length ? { cid, list: groups.flatMap(g => g.items) } : null;
}
function galleryBlock(g, gi, isAll) {
  const own = g.items.filter(x => !x.missing && !x.elsewhere);
  const sizes = [...new Set(own.map(x => x.s.toz ? 'tozzetto' : fmt(x.s.z)))], fins = [...new Set(own.flatMap(x => x.s.f || []))];
  const nMiss = g.items.filter(x => x.missing).length;
  const strips = g.items.map(({ s, missing, elsewhere }, k) => {
    const p = glPhoto(s), turn = p && glLandscape(s) && !s.toz && sorted2(parseSize(s.z))[0] < sorted2(parseSize(s.z))[1];
    return `<button class="gl-strip${missing ? ' miss' : ''}" onclick="openGalleryFull(${gi * 1000 + k})" title="${esc(s.s + ' ' + s.c)}">
      ${p ? `<div class="glph${turn ? ' turn' : ''}" style="background-image:url('${p}')"></div>` : `<div class="nof">foto non disponibile</div>`}
      <div class="nm">${esc(glTitle(s.c))}<small>${esc(s.toz ? 'tozzetto' : fmt(s.z))}</small></div>
      ${missing ? '<span class="tag">non in sala mostra</span>' : elsewhere ? `<span class="tag el">in: ${esc(elsewhere.name)}</span>` : ''}</button>`;
  }).join('');
  return `<section class="gl-serie">
    <div class="gl-strips">${strips}</div>
    <div class="gl-info"><div class="b">${esc(g.b)}</div><div class="t">Serie:</div><h3>${esc(glTitle(g.s))}</h3>
      <p><b>${own.length}</b> ${own.length === 1 ? 'colore' : 'colori'} ${isAll ? 'in sala mostra' : 'in questo espositore'}${nMiss ? ` · <b style="color:#8e1016">${nMiss}</b> che non ha` : ''}</p>
      <p><b>Formati:</b> ${esc(sizes.join(' · '))}</p>
      ${fins.length ? `<p><b>Finiture:</b> ${esc(fins.slice(0, 4).join(' · '))}${fins.length > 4 ? '…' : ''}</p>` : ''}</div>
  </section>`;
}

/* ── schermo intero ── */
let glIdx = 0, glTurn = 0, glAuto = true;
function openGalleryFull(code) {
  if (!glState) return;
  const groups = []; let n = 0;
  document.querySelectorAll('#glBody .gl-serie').forEach(sec => { groups.push(n); n += sec.querySelectorAll('.gl-strip').length; });
  glIdx = Math.max(0, Math.min(glState.list.length - 1, groups[Math.floor(code / 1000)] + code % 1000)); glTurn = 0; glAuto = true;
  let m = document.getElementById('glFull');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', `<div class="gl-full" id="glFull"><div class="gl-stage" id="glStage">
      <button class="gl-rot" onclick="glTurn = (glTurn + 90) % 360; glShow()" title="Gira la foto">⟳ Gira</button>
      <button class="gl-x" onclick="closeGalleryFull()">✕ Chiudi</button>
      <button class="gl-nav l" onclick="glStep(-1)">‹</button><img id="glImg" alt=""><button class="gl-nav r" onclick="glStep(1)">›</button>
      <div class="gl-count" id="glCount"></div></div><aside class="gl-side" id="glSide"></aside></div>`);
    m = document.getElementById('glFull');
    const st = document.getElementById('glStage'); let sx = null;
    st.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) glStep(dx < 0 ? 1 : -1); });
    document.addEventListener('keydown', e => { if (!document.getElementById('glFull')) return; if (e.key === 'ArrowRight') glStep(1); if (e.key === 'ArrowLeft') glStep(-1); if (e.key === 'Escape') closeGalleryFull(); });
  }
  glShow();
}
function glStep(dir) { const n = glState.list.length; glIdx = Math.max(0, Math.min(n - 1, glIdx + dir)); glTurn = 0; glAuto = true; glShow(); }
function glShow() {
  const { s, slot, c, missing, elsewhere } = glState.list[glIdx], d = c && DISP[c.disp], img = document.getElementById('glImg');
  const p = glPhoto(s, true);
  img.style.opacity = 0;
  const fit = () => {                                   // foto girata di 90°: le misure massime si scambiano
    const st = document.getElementById('glStage'), W = st.clientWidth * 0.94, H = st.clientHeight * 0.9, side = glTurn % 180 !== 0;
    img.style.maxWidth = (side ? H : W) + 'px'; img.style.maxHeight = (side ? W : H) + 'px'; img.style.transform = `rotate(${glTurn}deg)`;
  };
  img.onload = () => {
    if (glTurn === 0 && glAuto) { const [a, b] = s.toz ? [1, 1] : sorted2(parseSize(s.z)), tilePortrait = b > a * 1.05, photoLand = img.naturalWidth > img.naturalHeight * 1.05; if (tilePortrait && photoLand) glTurn = 90; }   // come la piastrella: in verticale
    glAuto = false; fit(); img.style.opacity = 1;
  };
  img.src = p || ''; fit(); if (!p) img.alt = 'Foto non disponibile';
  const n = glState.list.length;
  document.querySelector('#glFull .gl-nav.l').disabled = glIdx === 0; document.querySelector('#glFull .gl-nav.r').disabled = glIdx >= n - 1;
  document.getElementById('glCount').textContent = `${glIdx + 1} / ${n}`;
  document.getElementById('glSide').innerHTML = `<div class="b">${esc(s.b)}</div><div class="t">Serie</div><h3>${esc(glTitle(s.s))}</h3>
    <div class="col">${esc(glTitle(s.c))}</div>
    <dl><dt>Formato</dt><dd>${esc(s.toz ? 'tozzetto' + tozFrom(s) : fmt(s.z) + ' cm')}</dd>
      ${(s.f || []).length ? `<dt>Finiture</dt><dd>${esc(s.f.join(', '))}</dd>` : ''}
      ${(s.t || []).length ? `<dt>Spessore</dt><dd>${esc(s.t.join(' / '))} mm</dd>` : ''}
      ${(s.k || []).length ? `<dt>Codici</dt><dd>${esc(s.k.join(' · '))}</dd>` : ''}
      ${c ? `<dt>Espositore</dt><dd>${esc(c.name)} · ${esc(d.name)}</dd><dt>Posto</dt><dd>${esc(slotName(d, slot, c.slots.length))}</dd>` : ''}</dl>
    ${missing ? '<div class="warn">Non presente in sala mostra</div>' : elsewhere ? `<div class="elsew">In sala mostra in un altro espositore: ${esc(elsewhere.name)}</div>` : ''}`;
}
function closeGalleryFull() { const m = document.getElementById('glFull'); if (m) m.remove(); }
