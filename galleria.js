'use strict';
/* ════════════════════════════════════════════════════════════
   GALLERIA CAMPIONI della sala mostra (#/campioni/CLIENTE[/COMPOSIZIONE])
   Senza entrare nella stanza 3D: in alto gli espositori del cliente, per ogni serie le strisce verticali
   con le foto dei colori (come i cataloghi) e il nome della serie accanto. Tocchi una striscia: il campione
   a tutto schermo con serie, colore, formato, finiture e codici; frecce o scorrendo col dito per gli altri.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewGallery'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="gallery"] #viewGallery { display: block; }
/* pagina iniziale della galleria: un riquadro per cliente con le strisce dei suoi campioni */
.gh-search { flex: 1; max-width: 320px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; font: inherit; background: #fff; }
.gh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; margin-top: 8px; }
.gh-card { background: #fff; border: 1px solid #ebe8e2; border-radius: 18px; overflow: hidden; cursor: pointer; text-align: left; padding: 0; font: inherit; color: inherit;
  box-shadow: 0 6px 18px rgba(40,30,20,.06); transition: transform .2s, box-shadow .2s; }
.gh-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(40,30,20,.12); }
.gh-strips { display: flex; gap: 6px; height: 150px; padding: 12px 12px 0; background: #f6f4f0; }
.gh-strips span { flex: 1; border-radius: 8px 8px 999px 999px; background: #e6e2da center/cover; margin-bottom: 10px; }
.gh-card .in { padding: 12px 14px 14px; }
.gh-card .nm { font: 600 22px/1.15 var(--font-display); letter-spacing: -.02em; }
.gh-card .mt { font-size: 12.5px; color: var(--mid); margin-top: 4px; }
.gh-card.off { opacity: .55; cursor: default; }
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
.gl-info h3 { font: 600 34px/1.08 var(--font-display); letter-spacing: -.02em; letter-spacing: -.01em; margin: 6px 0 12px; color: #1a1a1a; }
.gl-info .b { font: 700 11px var(--font-body); color: var(--red); letter-spacing: .1em; text-transform: uppercase; }
.gl-info p { margin: 8px 0 0; font-size: 13.5px; line-height: 1.5; color: #444; }
.gl-info p b { color: #222; }
.gl-empty { padding: 40px; text-align: center; color: var(--mid); }
/* colori che non ha: foto normale, con una luce rossa intorno */
.gl-strip.miss { box-shadow: 0 0 0 2px rgba(214,40,50,.45), 0 0 20px 5px rgba(230,60,70,.26), 0 10px 26px rgba(40,30,20,.08); }
.gl-strip.miss:hover { box-shadow: 0 0 0 2px rgba(214,40,50,.6), 0 0 26px 8px rgba(230,60,70,.34), 0 16px 34px rgba(40,30,20,.14); }
.gl-strip .tag { position: absolute; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 2; white-space: nowrap; font: 700 10px var(--font-body); letter-spacing: .04em;
  padding: 4px 8px; border-radius: 999px; background: rgba(170,30,38,.78); color: #fff; max-width: calc(100% - 12px); overflow: hidden; text-overflow: ellipsis; }
.gl-strip .tag.el { background: rgba(255,255,255,.88); color: #333; }
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
.gl-full .gl-side h3 { font: 600 32px/1.1 var(--font-display); letter-spacing: -.02em; margin: 2px 0 0; }
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
/* lo stesso colore in più formati (es. 60×120 e 120×120) è una striscia sola: formati "60×120 / 120×120" */
function gallerySeries(list) {
  const groups = new Map();
  list.forEach(c => c.slots.forEach((k, i) => {
    const s = k && SAMPLE[k]; if (!s) return;
    const g = groups.get(s.b + '|' + s.s) || { b: s.b, s: s.s, items: [], byColor: new Map() };
    let it = g.byColor.get(glCid(s));
    if (!it) { it = { s, slot: i, c, sizes: [], all: [] }; g.byColor.set(glCid(s), it); g.items.push(it); }
    if (!it.all.some(x => x.s.key === s.key && x.c === c && x.slot === i)) it.all.push({ s, slot: i, c });
    if (!it.sizes.includes(s.z)) it.sizes.push(s.z);
    groups.set(s.b + '|' + s.s, g);
  }));
  groups.forEach(g => g.items.forEach(it => it.sizes.sort((a, b) => { const A = parseSize(a), B = parseSize(b); return A[0] * A[1] - B[0] * B[1]; })));
  return [...groups.values()];
}
/* identità di un colore nella serie: stesso nome ma grafica diversa (es. fondo "Antracite" e "Antracite" Esagona) = colori diversi */
const glCid = x => ((x.toz && x.pkey && SAMPLE[x.pkey] ? SAMPLE[x.pkey].g : x.g) || '') + '|' + x.c;
const glSizes = it => it.s.toz ? 'tozzetto' : (it.sizes && it.sizes.length ? it.sizes : [it.s.z]).map(fmt).join(' / ');
/* con "Colori che non ha": per ogni serie anche gli altri colori del listino (nel formato più usato),
   segnati come "non in sala mostra" oppure, se il cliente li ha in un altro espositore, "in un altro espositore" */
function addMissingColors(g, all) {
  const here = new Set(g.items.map(x => glCid(x.s))), inRoom = new Map();
  all.forEach(c => c.slots.forEach(k => { const s = k && SAMPLE[k]; if (s && s.b === g.b && s.s === g.s && !inRoom.has(glCid(s))) inRoom.set(glCid(s), c); }));
  const zc = {}; g.items.forEach(x => { zc[x.s.z] = (zc[x.s.z] || 0) + 1; });
  const zPref = Object.keys(zc).sort((a, b) => zc[b] - zc[a])[0];
  const byColor = new Map();
  SAMPLES.filter(x => x.b === g.b && x.s === g.s && !x.toz && !here.has(glCid(x))).forEach(x => {
    const cur = byColor.get(glCid(x)), score = (x.z === zPref ? 2 : 0) + (hasPhoto(x) ? 1 : 0);
    if (!cur || score > cur.score) byColor.set(glCid(x), { s: x, score });
  });
  [...byColor.values()].sort((a, b) => a.s.c.localeCompare(b.s.c)).forEach(({ s }) => {
    const other = inRoom.get(glCid(s));
    g.items.push(other ? { s, elsewhere: other } : { s, missing: true });
  });
  return glSort(g);
}
/* ordine delle strisce: ha (qui) → ha (in un altro espositore) → non ha. In ogni gruppo prima tutti i fondi, poi una
   grafica/decoro alla volta come nel listino (es. Pigmento: fondi, Cardboard, Eden, Pop Art, Carioca, Peonia;
   Unique Intensity: Purestone, Cobblestone, Arcade); dentro: quelli che ha nell'ordine dei posti, gli altri per colore */
function glSort(g) {
  const block = x => x.missing ? 2 : x.elsewhere ? 1 : 0, noPh = x => x.missing && !hasPhoto(x.s) ? 1 : 0;   // senza foto: per ultimi
  g.items = g.items.map((x, i) => [x, i]).sort((a, b) => block(a[0]) - block(b[0]) || noPh(a[0]) - noPh(b[0]) || (a[0].s.gi || 0) - (b[0].s.gi || 0)
    || (block(a[0]) ? a[0].s.c.localeCompare(b[0].s.c) : a[1] - b[1])).map(a => a[0]);
  return g;
}
const glTitle = t => String(t || '').toLowerCase().replace(/(^|[\s-])\S/g, m => m.toUpperCase());
function glPhoto(s, big) {
  const u = IMG[photoKey(s)]; if (!u) return null;
  if (big) return ((typeof AVIF_OK !== 'undefined' && AVIF_OK) || !/\.avif$/i.test(u)) ? u : (FOTO_MED[u] || u);
  return (window.FOTO_GAL || {})[u] || FOTO_MED[u] || u;    // strisce: foto da 800 px (con tante foto grandi l'iPhone ne lasciava vuote)
}
let glObs = null;
function glLazy() {
  if (glObs) glObs.disconnect();
  const load = el => { el.style.backgroundImage = `url('${el.dataset.bg}')`; el.removeAttribute('data-bg'); };
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('#glBody .glph[data-bg]').forEach(load); return; }
  glObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); glObs.unobserve(e.target); } }), { rootMargin: '400px 600px' });
  document.querySelectorAll('#glBody .glph[data-bg]').forEach(el => glObs.observe(el));
}
const glLandscape = s => { const u = IMG[photoKey(s)], wh = u && (window.FOTO_WH || {})[u]; return wh ? wh[0] > wh[1] * 1.05 : false; };

/* ── pagina iniziale: i clienti con la loro sala mostra ── */
let ghQ = '';
function renderGalleryHome() {
  const v = document.getElementById('viewGallery');
  const rows = Object.values(clients).map(cl => {
    const list = galleryDisplays(cl.id), keys = [...new Set(list.flatMap(x => x.c.slots.filter(k => k && SAMPLE[k])))];
    return { cl, list, keys };
  }).filter(r => r.keys.length || showRooms(r.cl.id).length).sort((a, b) => b.keys.length - a.keys.length || a.cl.name.localeCompare(b.cl.name));
  const q = normTxt(ghQ).trim();
  const shown = rows.filter(r => !q || normTxt(r.cl.name + ' ' + (r.cl.city || '')).includes(q));
  v.innerHTML = `<div class="gl-wrap">
    <div class="gl-head"><h2><small>Galleria campioni</small>Sale mostra dei clienti</h2>
      <input class="gh-search" id="ghSearch" placeholder="Cerca cliente o città…" value="${esc(ghQ)}"></div>
    ${shown.length ? `<div class="gh-grid">${shown.map(({ cl, list, keys }) => {
      const pics = keys.map(k => SAMPLE[k]).filter(s => IMG[photoKey(s)]).slice(0, 6);
      return `<button class="gh-card${keys.length ? '' : ' off'}" ${keys.length ? `onclick="go('#/campioni/${cl.id}/tutti')"` : ''}>
        <div class="gh-strips">${(pics.length ? pics : [null, null, null]).map(s => `<span style="${s ? `background-image:url('${esc(glPhoto(s))}')` : ''}"></span>`).join('')}</div>
        <div class="in"><div class="nm">${esc(cl.name)}</div>
          <div class="mt">${cl.city ? esc(cl.city) + ' · ' : ''}${keys.length ? `${keys.length} campioni · ${list.length} espositori` : 'sala mostra ancora senza campioni'}</div></div></button>`;
    }).join('')}</div>` : `<div class="gl-empty">${rows.length ? 'Nessun cliente trovato.' : 'Nessun cliente ha ancora una sala mostra con i campioni: crea la sala mostra dalla scheda del cliente.'}</div>`}
  </div>`;
  const inp = document.getElementById('ghSearch');
  inp.addEventListener('input', e => { ghQ = e.target.value; const pos = e.target.selectionStart; renderGalleryHome(); const n = document.getElementById('ghSearch'); n.focus(); n.setSelectionRange(pos, pos); });
}
function renderGallery(cid, sub) {
  const v = document.getElementById('viewGallery'), cl = clients[cid];
  const list = galleryDisplays(cid), allC = list.map(x => x.c);
  const isAll = sub === 'tutti';
  const cur = isAll ? null : list.find(x => x.c.id === sub) || list[0];
  const view = isAll ? allC : cur ? [cur.c] : [];
  const groups = gallerySeries(view).map(g => ui.glMissing ? addMissingColors(g, allC) : glSort(g));
  const nTot = new Set(allC.flatMap(c => c.slots.filter(k => k && SAMPLE[k]))).size;
  v.innerHTML = `<div class="gl-wrap">
    <div class="gl-head">
      <button class="btn" onclick="go('#/galleria')"><svg class="ic"><use href="#i-left"/></svg>Galleria</button>
      <h2><small>Sala mostra · campioni</small>${esc(cl.name)}</h2>
      <button class="btn" onclick="go('#/cliente/${cid}')">Scheda cliente</button>
      <button class="btn" onclick="glExportAsk('${cid}', '${isAll ? 'tutti' : cur ? cur.c.id : ''}')" title="Catalogo in PDF dei campioni e delle serie, con i formati"><svg class="ic"><use href="#i-download"/></svg> Esporta PDF</button>
      <button class="btn red" onclick="go('#/salamostra/${cid}')"><svg class="ic"><use href="#i-play"/></svg> Entra nella sala mostra</button>
    </div>
    ${list.length ? `<div class="gl-tabs"><button class="gl-tab all ${isAll ? 'on' : ''}" onclick="go('#/campioni/${cid}/tutti')"><span>Tutta la sala mostra<span class="k">${nTot} campioni · ${list.length} espositori</span></span></button>${list.map(x => `<button class="gl-tab ${x === cur ? 'on' : ''}" onclick="go('#/campioni/${cid}/${x.c.id}')">
        <img src="${x.d.img}" alt=""><span>${esc(x.c.name)}<span class="k">${esc(x.d.name)} · ${filledOf(x.c)} campioni${showRooms(cid).length > 1 ? ' · ' + esc(x.room) : ''}</span></span></button>`).join('')}</div>` : ''}
    ${list.length ? `<div class="gl-tools"><button class="btn ${ui.glMissing ? 'on' : ''}" onclick="ui.glMissing = !ui.glMissing; saveUI(); renderGallery('${cid}', '${isAll ? 'tutti' : cur ? cur.c.id : ''}')"
        title="Mostra anche gli altri colori di ogni serie">${ui.glMissing ? '<svg class="ic"><use href="#i-check"/></svg> ' : ''}<svg class="ic"><use href="#i-half"/></svg> Colori che non ha</button>
      ${ui.glMissing ? `<span class="lg"><span><i style="background:#ddd"></i>in sala mostra</span><span><i style="background:#fff;box-shadow:0 0 0 2px rgba(214,40,50,.5),0 0 6px 2px rgba(230,60,70,.3)"></i>non in sala mostra</span>${isAll ? '' : '<span><i style="background:#fff;border:1px solid #ccc"></i>in un altro espositore</span>'}</span>` : ''}</div>` : ''}
    <div id="glBody">${groups.length ? groups.map((g, gi) => galleryBlock(g, gi, isAll)).join('') : `<div class="gl-empty">La sala mostra di ${esc(cl.name)} non ha ancora campioni negli espositori.</div>`}</div>
  </div>`;
  glState = view.length ? { cid, list: groups.flatMap(g => g.items) } : null;
  glLazy();
}
function galleryBlock(g, gi, isAll) {
  const own = g.items.filter(x => !x.missing && !x.elsewhere);
  const sizes = [...new Set(own.flatMap(x => x.s.toz ? ['tozzetto'] : (x.sizes || [x.s.z]).map(fmt)))], fins = [...new Set(own.flatMap(x => (x.all || [x]).flatMap(y => y.s.f || [])))];
  const nMiss = g.items.filter(x => x.missing).length;
  const strips = g.items.map((it, k) => {
    const { s, missing, elsewhere } = it;
    const p = glPhoto(s), turn = p && glLandscape(s) && !s.toz && sorted2(parseSize(s.z))[0] < sorted2(parseSize(s.z))[1];
    return `<button class="gl-strip${missing ? ' miss' : ''}" onclick="openGalleryFull(${gi * 1000 + k})" title="${esc(s.s + ' ' + s.c)}">
      ${p ? `<div class="glph${turn ? ' turn' : ''}" data-bg="${esc(p)}"></div>` : `<div class="nof">foto non disponibile</div>`}
      <div class="nm">${esc(glTitle(s.c))}<small>${esc(glSizes(it))}</small></div>
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
      <button class="gl-x" onclick="closeGalleryFull()"><svg class="ic"><use href="#i-x"/></svg> Chiudi</button>
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
  const it = glState.list[glIdx], { s, slot, c, missing, elsewhere } = it, d = c && DISP[c.disp], img = document.getElementById('glImg');
  const all = it.all || (c ? [{ s, slot, c }] : []);
  const p = glPhoto(s, true);
  img.style.opacity = 0;
  const fit = () => {                                   // foto girata di 90°: le misure massime si scambiano
    const st = document.getElementById('glStage'), W = st.clientWidth * 0.94, H = st.clientHeight * 0.9, side = glTurn % 180 !== 0;
    img.style.maxWidth = (side ? H : W) + 'px'; img.style.maxHeight = (side ? W : H) + 'px'; img.style.transform = `rotate(${glTurn}deg)`;
  };
  img.onload = () => {
    // schermo largo (PC): la foto resta com'è, grande; schermo alto (telefono in verticale): la piastrella verticale si gira in verticale
    const st = document.getElementById('glStage'), tall = st.clientHeight > st.clientWidth;
    if (glTurn === 0 && glAuto && tall) { const [a, b] = s.toz ? [1, 1] : sorted2(parseSize(s.z)), tilePortrait = b > a * 1.05, photoLand = img.naturalWidth > img.naturalHeight * 1.05; if (tilePortrait && photoLand) glTurn = 90; }
    glAuto = false; fit(); img.style.opacity = 1;
  };
  img.src = p || ''; fit(); if (!p) img.alt = 'Foto non disponibile';
  const n = glState.list.length;
  document.querySelector('#glFull .gl-nav.l').disabled = glIdx === 0; document.querySelector('#glFull .gl-nav.r').disabled = glIdx >= n - 1;
  document.getElementById('glCount').textContent = `${glIdx + 1} / ${n}`;
  document.getElementById('glSide').innerHTML = `<div class="b">${esc(s.b)}</div><div class="t">Serie</div><h3>${esc(glTitle(s.s))}</h3>
    <div class="col">${esc(glTitle(s.c))}</div>
    <dl><dt>${(it.sizes || []).length > 1 ? 'Formati' : 'Formato'}</dt><dd>${esc(s.toz ? 'tozzetto' + tozFrom(s) : glSizes(it) + ' cm')}</dd>
      ${(s.f || []).length ? `<dt>Finiture</dt><dd>${esc(s.f.join(', '))}</dd>` : ''}
      ${(s.t || []).length ? `<dt>Spessore</dt><dd>${esc(s.t.join(' / '))} mm</dd>` : ''}
      ${(s.k || []).length ? `<dt>Codici</dt><dd>${esc([...new Set((all.length ? all : [{ s }]).flatMap(x => x.s.k || []))].join(' · '))}</dd>` : ''}
      ${all.length ? `<dt>Dove</dt><dd>${all.map(x => `${esc(x.c.name)} · posto ${esc(slotName(DISP[x.c.disp], x.slot, x.c.slots.length))}${(it.sizes || []).length > 1 ? ' (' + esc(fmt(x.s.z)) + ')' : ''}`).join('<br>')}</dd>` : ''}</dl>
    ${missing ? '<div class="warn">Non presente in sala mostra</div>' : elsewhere ? `<div class="elsew">In sala mostra in un altro espositore: ${esc(elsewhere.name)}</div>` : ''}`;
}
function closeGalleryFull() { const m = document.getElementById('glFull'); if (m) m.remove(); }

/* ════ ESPORTA PDF della galleria: copertina + una sezione per serie con la griglia dei campioni (foto, colore, formati).
   Si apre la stampa del browser: "Salva come PDF" (su iPhone: Condividi → Salva su File). ════ */
document.head.insertAdjacentHTML('beforeend', `<style>
#glPrint { display: none; }
@media print {
  body.gl-printing > *:not(#glPrint) { display: none !important; }
  body.gl-printing { background: #fff !important; }
  #glPrint { display: block !important; }
  @page { size: A4 portrait; margin: 11mm 11mm 13mm; }
}
#glPrint { font-family: Inter, Arial, sans-serif; color: #18181b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
#glPrint .cov { height: 268mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: page; }
#glPrint .cov .top { font: 700 9pt Inter, Arial; letter-spacing: .22em; text-transform: uppercase; color: #b0101a; }
#glPrint .cov h1 { font: 700 40pt/1.02 'Inter Tight', Inter, Arial; letter-spacing: -.03em; margin: 6mm 0 3mm; }
#glPrint .cov .sub { font-size: 12pt; color: #555; }
#glPrint .cov .mosaic { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2.5mm; margin: 10mm 0; }
#glPrint .cov .mosaic img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 2mm; display: block; }
#glPrint .cov .kpi { display: flex; gap: 10mm; border-top: .3mm solid #ddd; padding-top: 5mm; }
#glPrint .cov .kpi b { display: block; font: 700 22pt 'Inter Tight', Inter, Arial; }
#glPrint .cov .kpi span { font-size: 9pt; color: #666; }
#glPrint .cov .brands { font-size: 9.5pt; color: #444; margin-top: 4mm; }
#glPrint .ser { break-inside: avoid-page; page-break-inside: avoid; margin: 0 0 8mm; }
#glPrint .ser.big { break-inside: auto; page-break-inside: auto; }
#glPrint .sh { display: flex; align-items: flex-end; gap: 6mm; border-bottom: .4mm solid #18181b; padding-bottom: 2mm; margin-bottom: 3.5mm; break-after: avoid; page-break-after: avoid; }
#glPrint .sh .w { flex: 1; }
#glPrint .sh .b { font: 700 7.5pt Inter, Arial; letter-spacing: .18em; text-transform: uppercase; color: #b0101a; }
#glPrint .sh h2 { font: 700 19pt/1.1 'Inter Tight', Inter, Arial; letter-spacing: -.02em; margin: 1mm 0 0; }
#glPrint .sh .f { font-size: 8.5pt; color: #444; text-align: right; }
#glPrint .sh .f b { color: #18181b; }
#glPrint .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4mm 3.5mm; }
#glPrint .it { break-inside: avoid; page-break-inside: avoid; }
#glPrint .it .im { width: 100%; aspect-ratio: 1; border-radius: 1.6mm; overflow: hidden; background: #eee; }
#glPrint .it img { width: 100%; height: 100%; object-fit: cover; display: block; }
#glPrint .it .n { font: 600 8.5pt/1.2 Inter, Arial; margin-top: 1.6mm; }
#glPrint .it .z { font-size: 7.3pt; color: #666; margin-top: .4mm; }
#glPrint .it .im { position: relative; }
#glPrint .it.miss .im { box-shadow: 0 0 0 .5mm rgba(214,40,50,.75); }
#glPrint .it.miss .n { color: #8e1016; }
#glPrint .it .mt { position: absolute; left: 1.2mm; bottom: 1.2mm; background: #b0101a; color: #fff; font: 700 6pt Inter, Arial; padding: .5mm 1.4mm; border-radius: 1mm; letter-spacing: .03em; }
#glPrint .foot { font-size: 7.5pt; color: #999; margin-top: 6mm; text-align: center; }
</style>`);
/* prima di esportare: solo quello che ha, o anche i colori che non ha delle stesse serie */
function glExportAsk(cid, scope) {
  let m = document.getElementById('glPdfAsk'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="glPdfAsk"><div class="mbox" style="max-width:440px;width:calc(100vw - 32px)">
    <div class="mhead"><h3><svg class="ic"><use href="#i-download"/></svg> Esporta PDF</h3></div>
    <div style="padding:8px 18px 18px;display:flex;flex-direction:column;gap:10px">
      <button class="btn" style="justify-content:flex-start;text-align:left;padding:12px 14px" onclick="document.getElementById('glPdfAsk').remove(); glExportPDF('${cid}', '${scope}', false)">
        <b>Solo quello che ha</b><br><span style="font-weight:500;color:var(--mid)">i campioni che sono in sala mostra</span></button>
      <button class="btn" style="justify-content:flex-start;text-align:left;padding:12px 14px" onclick="document.getElementById('glPdfAsk').remove(); glExportPDF('${cid}', '${scope}', 'mark')">
        <b>Anche i colori che non ha · segnati</b><br><span style="font-weight:500;color:var(--mid)">gli altri colori delle serie nei formati che ha, in rosso con scritto "non in sala mostra"</span></button>
      <button class="btn" style="justify-content:flex-start;text-align:left;padding:12px 14px" onclick="document.getElementById('glPdfAsk').remove(); glExportPDF('${cid}', '${scope}', 'plain')">
        <b>Anche i colori che non ha · tutti normali</b><br><span style="font-weight:500;color:var(--mid)">la serie completa nei formati che ha, senza segni: come un catalogo</span></button>
      <button class="btn" onclick="document.getElementById('glPdfAsk').remove()">Annulla</button>
    </div></div></div>`);
  m = document.getElementById('glPdfAsk'); m.addEventListener('click', e => { if (e.target === m) m.remove(); });
}
async function glExportPDF(cid, scope, withMissing) {
  const mark = withMissing && withMissing !== 'plain';   // 'mark' (o true): mancanti in rosso; 'plain': tutti uguali
  const cl = clients[cid]; if (!cl) return;
  const list = galleryDisplays(cid), allC = list.map(x => x.c);
  const cur = scope && scope !== 'tutti' ? list.find(x => x.c.id === scope) : null;
  const view = cur ? [cur.c] : allC;
  // colori che non ha: per ogni serie, gli altri colori che esistono NEI FORMATI CHE HA (una volta sola per colore)
  const ownAll = new Set(allC.flatMap(c => c.slots.filter(k => k && SAMPLE[k]).map(k => glCid(SAMPLE[k]))));
  const bySz = (a, b) => { const A = parseSize(a), B = parseSize(b); return A[0] * A[1] - B[0] * B[1]; };
  const groups = gallerySeries(view).map(g => {
    glSort(g); if (!withMissing) return g;
    const zs = new Set(g.items.filter(x => !x.s.toz).flatMap(x => x.sizes || [x.s.z]));
    const byC = new Map();
    SAMPLES.forEach(x => {
      if (x.b !== g.b || x.s !== g.s || x.toz || !zs.has(x.z) || ownAll.has(glCid(x))) return;
      const e = byC.get(glCid(x)) || { s: x, missing: true, mz: [] };
      if (!e.mz.includes(x.z)) e.mz.push(x.z);
      if (!hasPhoto(e.s) && hasPhoto(x)) e.s = x;
      byC.set(glCid(x), e);
    });
    const miss = [...byC.values()].sort((a, b) => (hasPhoto(b.s) ? 1 : 0) - (hasPhoto(a.s) ? 1 : 0) || (a.s.gi || 0) - (b.s.gi || 0));
    g.items = g.items.concat(miss);
    return g;
  });
  if (!groups.length) return toast('Non ci sono campioni da esportare');
  const zOf = it => it.mz.sort(bySz).map(fmt).join(' / ');
  const nMiss = groups.reduce((n, g) => n + g.items.filter(x => x.missing).length, 0);
  const items = groups.flatMap(g => g.items.filter(x => !x.missing)), brands = {};
  groups.forEach(g => { brands[g.b] = (brands[g.b] || 0) + 1; });
  const img = s => glPhoto(s) || '';
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  const cover = items.filter(it => img(it.s)).slice(0, 12);
  let el = document.getElementById('glPrint'); if (!el) { el = document.createElement('div'); el.id = 'glPrint'; document.body.appendChild(el); }
  el.innerHTML = `<section class="cov"><div>
      <div class="top">${withMissing && !mark ? 'Sala mostra · serie complete' : `Sala mostra · campioni esposti${withMissing ? ' e colori da completare' : ''}`}</div>
      <h1>${esc(cl.name)}</h1>
      <div class="sub">${[cl.city, cur ? cur.c.name + ' · ' + cur.d.name : 'Tutta la sala mostra', today].filter(Boolean).map(esc).join(' · ')}</div>
      <div class="mosaic">${cover.map(it => `<img src="${esc(img(it.s))}" alt="">`).join('')}</div></div>
    <div><div class="kpi"><div><b>${groups.length}</b><span>serie</span></div><div><b>${items.length}</b><span>colori</span></div>
        <div><b>${new Set(view.flatMap(c => c.slots.filter(k => k && SAMPLE[k]))).size}</b><span>campioni</span></div><div><b>${cur ? 1 : list.length}</b><span>espositori</span></div>${mark ? `<div><b style="color:#b0101a">${nMiss}</b><span>colori che non ha</span></div>` : ''}</div>
      <div class="brands">${Object.entries(brands).sort((a, b) => b[1] - a[1]).map(([b, n]) => `<b>${esc(b)}</b> ${n} serie`).join(' · ')}</div></div>
  </section>` + groups.map(g => {
    const own = g.items.filter(x => !x.missing), miss = g.items.length - own.length;
    const sizes = [...new Set(own.flatMap(x => x.s.toz ? ['tozzetto'] : (x.sizes || [x.s.z]).map(fmt)))];
    return `<section class="ser${g.items.length > 15 ? ' big' : ''}"><div class="sh"><div class="w"><div class="b">${esc(g.b)}</div><h2>${esc(glTitle(g.s))}</h2></div>
        <div class="f">${mark ? `${own.length} color${own.length === 1 ? 'e' : 'i'}${miss ? ` · <span style="color:#b0101a">${miss} che non ha</span>` : ''}` : `${g.items.length} color${g.items.length === 1 ? 'e' : 'i'}`}<br><b>Formati:</b> ${esc(sizes.join(' · '))}</div></div>
      <div class="grid">${g.items.map(it => {
        const u = img(it.s);
        return `<div class="it${it.missing && mark ? ' miss' : ''}"><div class="im">${u ? `<img src="${esc(u)}" alt="">` : ''}${it.missing && mark ? '<span class="mt">non in sala mostra</span>' : ''}</div><div class="n">${esc(glTitle(it.s.c))}</div><div class="z">${esc(it.missing ? zOf(it) : glSizes(it))}${it.s.toz ? '' : ' cm'}</div></div>`;
      }).join('')}</div></section>`;
  }).join('') + `<div class="foot">${esc(cl.name)} · ${today}</div>`;
  toast('Preparo il PDF…');
  await Promise.all([...el.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  printWhenReady('gl-printing', 'Il PDF della galleria è pronto');
}
