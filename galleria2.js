'use strict';
/* ════════════════════════════════════════════════════════════
   GALLERIA+  (#/galleria2 · #/g2/CLIENTE[/AMBITO]) — sezione nuova, accanto alla Galleria (che resta com'è).
   Pensata per il lavoro dell'agente con il rivenditore:
   1. panoramica del cliente e "occasioni" (serie più incomplete)
   2. ogni serie con la sua completezza (ha X di Y colori), mancanti serie per serie, filtri marca/formato/incomplete/ricerca
   3. schermo intero con miniature di tutta la serie, "Vedi posata", "Vedi in sala mostra"
   4. proposta di integrazione: i colori che non ha → copia codici, PDF, metti in un espositore
   5. modalità presentazione (per il banco): niente mancanti, codici e posti
   Usa le funzioni della Galleria (galleryDisplays, gallerySeries, addMissingColors, glPhoto…)
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewGallery2'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="gallery2"] #viewGallery2 { display: block; }
#viewGallery2 { background: #fbfaf8; min-height: calc(100vh - 56px); }
.g2-over { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 22px; background: #fff; border: 1px solid #ebe8e2; border-radius: 18px; padding: 18px 20px; margin: 4px 0 16px; }
.g2-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-content: start; }
.g2-stats div { background: #f6f4f0; border-radius: 12px; padding: 10px 12px; }
.g2-stats b { display: block; font: 700 26px var(--font-display); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.g2-stats span { font-size: 12px; color: var(--mid); }
.g2-brands { grid-column: 1 / -1; font-size: 12.5px; color: #555; line-height: 1.6; }
.g2-stats .g2-brands b { display: inline; font: 700 12.5px var(--font-body); color: #222; }
.g2-stats div.g2-brands { background: none; padding: 2px 2px 0; }
.g2-occ h4 { margin: 0 0 8px; font: 700 12px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: #8e1016; }
.g2-occ button { display: grid; grid-template-columns: minmax(150px, 240px) minmax(80px, 1fr) 64px; gap: 12px; align-items: center; width: 100%; border: 0; background: none; padding: 7px 4px; border-radius: 8px; cursor: pointer; text-align: left; font: inherit; color: inherit; }
.g2-occ button:hover { background: #f6f4f0; }
.g2-occ .n { font: 600 15px var(--font-display); letter-spacing: -.02em; }
.g2-occ .n small { display: block; font: 500 11px var(--font-body); color: var(--mid); }
.g2-bar { height: 7px; border-radius: 99px; background: #eee9e1; overflow: hidden; }
.g2-bar i { display: block; height: 100%; background: linear-gradient(90deg, #2f7d4f, #58a473); border-radius: 99px; }
.g2-occ .p { font-size: 12px; color: #555; text-align: right; white-space: nowrap; }
.g2-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin: 0 0 6px; padding: 8px 0; }
.g2-filters select, .g2-filters input { padding: 8px 10px; border: 1px solid var(--border); border-radius: 10px; font: inherit; font-size: 13px; background: #fff; }
.g2-filters input { flex: 1; min-width: 160px; max-width: 280px; }
.g2-chip { border: 1px solid var(--border); background: #fff; border-radius: 999px; padding: 7px 12px; font: 600 12.5px var(--font-body); cursor: pointer; }
.g2-chip.on { background: var(--dark); color: #fff; border-color: var(--dark); }
.g2-chip.red.on { background: #8e1016; border-color: #8e1016; }
.g2-shead { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 10px; }
.g2-shead .g2-bar { width: 140px; }
.g2-shead .p { font-size: 12.5px; color: #555; }
.gl-strip .add { position: absolute; top: 8px; right: 8px; z-index: 3; width: 30px; height: 30px; border-radius: 50%; border: 0; background: rgba(255,255,255,.92); color: #8e1016;
  font: 800 18px/30px var(--font-body); cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.18); }
.gl-strip .add.in { background: #8e1016; color: #fff; }
.g2-prop { position: fixed; right: 18px; bottom: 18px; z-index: 40; }
.g2-pres .tag, .g2-pres .add, .g2-pres .g2-only { display: none !important; }
/* schermo intero */
.g2-thumbs { position: absolute; left: 0; right: 0; bottom: 0; display: flex; gap: 8px; padding: 10px 14px; overflow-x: auto; background: linear-gradient(transparent, rgba(0,0,0,.65)); }
.g2-thumbs button { flex: none; width: 54px; height: 54px; border-radius: 10px; border: 2px solid transparent; background: #333 center/cover; cursor: pointer; padding: 0; opacity: .8; }
.g2-thumbs button.cur { border-color: #fff; opacity: 1; }
.g2-thumbs button.miss { box-shadow: 0 0 0 2px rgba(214,40,50,.7); }
.g2-posa { display: grid; gap: 3px; background: #9a958c; padding: 3px; border-radius: 6px; box-shadow: 0 30px 80px rgba(0,0,0,.6); }
.g2-posa span { background: #555 center/cover; }
.gl-full .g2-acts { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.gl-full .g2-acts button { border: 0; border-radius: 10px; padding: 9px 12px; font: 700 12.5px var(--font-body); cursor: pointer; background: #2a2a2e; color: #fff; }
.gl-full .g2-acts button.red { background: #8e1016; }
@media (max-width: 760px) {
  .g2-over { grid-template-columns: 1fr; padding: 14px; gap: 14px; }
  .g2-stats { grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .g2-stats div { padding: 7px 8px; }
  .g2-stats b { font-size: 20px; }
  .g2-stats span { font-size: 11px; }
  .g2-occ button { grid-template-columns: 1fr 70px 54px; }
}
/* ── Dettagli (tendina): tutte le serie, completezza, colori per tipo ── */
.g2-det { background: #fff; border: 1px solid #ebe8e2; border-radius: 18px; margin: 4px 0 16px; overflow: hidden; }
.g2-det > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 14px 18px; font-weight: 600; }
.g2-det > summary::-webkit-details-marker { display: none; }
.g2-det > summary .t { font: 700 15px var(--font-display); letter-spacing: -.01em; }
.g2-det > summary .s { color: var(--mid); font-size: 12.5px; font-weight: 500; flex: 1; }
.g2-det > summary .chev { transition: transform .2s; color: var(--mid); }
.g2-det[open] > summary .chev { transform: rotate(180deg); }
.g2-det[open] > summary { border-bottom: 1px solid #f0ede7; }
.g2-detin { padding: 16px 18px 18px; }
.g2-dtop { display: grid; grid-template-columns: minmax(220px, 300px) 1fr; gap: 22px; }
.g2-sl-head { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; }
.g2-sl-head h4 { margin: 0; flex: 1; font: 700 12px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: #8e1016; }
.g2-sl-head select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 12.5px; background: #fff; }
.g2-sr { border-top: 1px solid #f2efe9; }
.g2-sr > button { display: grid; grid-template-columns: 18px minmax(140px, 260px) minmax(80px, 1fr) 92px 86px; gap: 12px; align-items: center; width: 100%; border: 0; background: none; padding: 9px 4px; cursor: pointer; text-align: left; font: inherit; color: inherit; border-radius: 8px; }
.g2-sr > button:hover { background: #f8f7f4; }
.g2-sr > button .ic { color: var(--mid); transition: transform .2s; }
.g2-sr.open > button .ic { transform: rotate(90deg); }
.g2-sr .n { font: 600 14.5px var(--font-display); letter-spacing: -.01em; }
.g2-sr .n small { display: block; font: 500 11px var(--font-body); color: var(--mid); }
.g2-sr .p { font-size: 12.5px; color: #333; white-space: nowrap; }
.g2-sr .m { font-size: 12px; font-weight: 600; white-space: nowrap; text-align: right; }
.g2-sr .m.ok { color: #2f7d4f; }
.g2-sr .m.no { color: #b0101a; }
.g2-sbody { padding: 4px 4px 18px 34px; }
.g2-grp { margin-top: 12px; }
.g2-grp h5 { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font: 700 12.5px var(--font-body); color: #222; }
.g2-grp h5 .g2-bar { width: 90px; height: 5px; }
.g2-grp h5 span { font-weight: 500; color: var(--mid); }
.g2-sws { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; }
.g2-sw { position: relative; border-radius: 12px; background: #faf9f6; border: 1px solid #ece9e2; padding: 6px 6px 8px; font-size: 11.5px; line-height: 1.25; }
.g2-sw .im { display: block; aspect-ratio: 1; border-radius: 8px; background: #ddd center/cover; margin-bottom: 6px; }
.g2-sw b { display: block; font-size: 12px; font-weight: 600; }
.g2-sw small { display: block; color: #9a958c; font-size: 10.5px; margin-top: 2px; }
.g2-sw small i { font-style: normal; color: #1d1d20; font-weight: 600; }
.g2-sw .st { position: absolute; top: 10px; right: 10px; width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
.g2-sw .st .ic { width: 12px; height: 12px; stroke-width: 2.6; vertical-align: 0; }
.g2-sw.has .st { background: #2f7d4f; }
.g2-sw.miss { background: #fff; border-color: rgba(214,40,50,.35); box-shadow: 0 0 0 3px rgba(214,40,50,.10); cursor: pointer; }
.g2-sw.miss .st { background: #fff; color: #b0101a; border: 1.5px solid rgba(214,40,50,.55); }
.g2-sw.miss.inprop .st { background: #b0101a; color: #fff; border-color: #b0101a; }
.g2-sw.miss:hover { box-shadow: 0 0 0 3px rgba(214,40,50,.22); }
.g2-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--mid); margin: 10px 0 0; }
.g2-legend span { display: inline-flex; align-items: center; gap: 5px; }
.g2-legend i { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
@media (max-width: 760px) {
  .g2-dtop { grid-template-columns: 1fr; gap: 14px; }
  .g2-sr > button { grid-template-columns: 14px 1fr 70px; }
  .g2-sr > button .g2-bar, .g2-sr > button .m { display: none; }
  .g2-sbody { padding-left: 4px; }
  .g2-sws { grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); }
}
/* stampa della proposta */
@media print { body.g2-printing > *:not(#g2Print) { display: none !important; } #g2Print { display: block !important; } }
#g2Print { display: none; font-family: Inter, Arial, sans-serif; color: #111; padding: 10mm; }
#g2Print h1 { font: 700 26px var(--font-display); letter-spacing: -.02em; margin: 0 0 4px; }
#g2Print .it { display: grid; grid-template-columns: 34mm 1fr; gap: 5mm; padding: 4mm 0; border-bottom: 1px solid #ddd; break-inside: avoid; }
#g2Print .it img { width: 34mm; height: 34mm; object-fit: cover; border-radius: 3mm; }
</style>`);

const g2 = { cid: null, scope: 'tutti', brand: '', size: '', onlyInc: false, q: '', showMiss: new Set(), allMiss: false };
const g2Prop = cid => (clients[cid].proposta = clients[cid].proposta || []);
const g2Key = (b, s) => b + '|' + s;

/* ── elenco clienti (come la Galleria) ── */
function renderGallery2Home() {
  renderGalleryHome();
  const v = document.getElementById('viewGallery'), v2 = document.getElementById('viewGallery2');
  v2.innerHTML = v.innerHTML.replace(/go\('#\/campioni\/([^/']+)\/tutti'\)/g, "go('#/g2/$1')").replace('Galleria campioni', 'Galleria+');
  v.innerHTML = '';
  const inp = v2.querySelector('#ghSearch');
  if (inp) inp.addEventListener('input', e => { ghQ = e.target.value; const pos = e.target.selectionStart; renderGallery2Home(); const n = document.getElementById('ghSearch'); n.focus(); n.setSelectionRange(pos, pos); });
}

/* completezza di una serie in tutta la sala mostra del cliente: colori che ha / colori del listino */
function g2Complete(all, b, s) {
  const has = new Set(), tot = new Set();
  all.forEach(c => c.slots.forEach(k => { const x = k && SAMPLE[k]; if (x && x.b === b && x.s === s) has.add(x.c); }));
  SAMPLES.forEach(x => { if (x.b === b && x.s === s && !x.toz) tot.add(x.c); });
  has.forEach(c => tot.add(c));
  return { has: has.size, tot: tot.size };
}

function renderGallery2(cid, sub) {
  if (g2.cid !== cid) Object.assign(g2, { cid, brand: '', size: '', onlyInc: false, q: '', showMiss: new Set(), allMiss: false });
  g2.scope = sub || 'tutti';
  const v = document.getElementById('viewGallery2'), cl = clients[cid], pres = !!ui.g2Pres;
  const list = galleryDisplays(cid), allC = list.map(x => x.c);
  const cur = g2.scope === 'tutti' ? null : list.find(x => x.c.id === g2.scope);
  const view = cur ? [cur.c] : allC;
  // serie con completezza, filtri
  let groups = gallerySeries(view).map(g => { const k = g.b + '|' + g.s; const comp = g2Complete(allC, g.b, g.s); return Object.assign(g, { comp }); });
  const brands = [...new Set(gallerySeries(allC).map(g => g.b))].sort(), sizes = [...new Set(allC.flatMap(c => c.slots.filter(k => k && SAMPLE[k] && !SAMPLE[k].toz).map(k => SAMPLE[k].z)))].sort((a, b) => { const A = parseSize(a), B = parseSize(b); return A[0] * A[1] - B[0] * B[1]; });
  const q = normTxt(g2.q).trim();
  groups = groups.filter(g => (!g2.brand || g.b === g2.brand) && (!g2.onlyInc || g.comp.has < g.comp.tot)
    && (!g2.size || g.items.some(it => (it.sizes || [it.s.z]).includes(g2.size)))
    && (!q || normTxt(g.s + ' ' + g.b + ' ' + g.items.map(it => it.s.c + ' ' + (it.all || []).flatMap(y => y.s.k).join(' ')).join(' ')).includes(q)));
  groups.forEach(g => { if (!pres && (g2.allMiss || g2.showMiss.has(g2Key(g.b, g.s)))) addMissingColors(g, allC); else glSort(g); });
  // panoramica
  const nKeys = new Set(allC.flatMap(c => c.slots.filter(k => k && SAMPLE[k]))).size;
  const allSeries = gallerySeries(allC).map(g => Object.assign(g, { comp: g2Complete(allC, g.b, g.s) }));
  const byBrand = {}; allSeries.forEach(g => { byBrand[g.b] = (byBrand[g.b] || 0) + 1; });
  const occ = allSeries.filter(g => g.comp.tot > g.comp.has).sort((a, b) => (b.comp.tot - b.comp.has) - (a.comp.tot - a.comp.has)).slice(0, 6);
  const prop = g2Prop(cid);
  v.innerHTML = `<div class="gl-wrap ${pres ? 'g2-pres' : ''}">
    <div class="gl-head">
      <button class="btn" onclick="go('#/galleria2')"><svg class="ic"><use href="#i-left"/></svg>Galleria+</button>
      <h2><small>Galleria+ · sala mostra</small>${esc(cl.name)}</h2>
      <button class="btn ${pres ? 'dark' : ''}" onclick="ui.g2Pres = !ui.g2Pres; saveUI(); renderGallery2('${cid}', '${g2.scope}')" title="Per il banco: solo foto, serie e colori">${pres ? '<svg class="ic"><use href="#i-check"/></svg> ' : ''}<svg class="ic"><use href="#i-monitor"/></svg> Presentazione</button>
      <button class="btn red" onclick="go('#/salamostra/${cid}')"><svg class="ic"><use href="#i-play"/></svg> Sala mostra</button>
    </div>
    ${pres ? '' : g2DetailsHTML(cid, allC, allSeries, nKeys, list.length, byBrand)}
    <div class="g2-filters">
      <select onchange="go('#/g2/${cid}/' + this.value)"><option value="tutti">Tutta la sala mostra</option>${list.map(x => `<option value="${x.c.id}" ${cur === x ? 'selected' : ''}>${esc(x.c.name)}</option>`).join('')}</select>
      <select onchange="g2.brand = this.value; renderGallery2('${cid}', '${g2.scope}')"><option value="">Tutte le marche</option>${brands.map(b => `<option ${g2.brand === b ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>
      <select onchange="g2.size = this.value; renderGallery2('${cid}', '${g2.scope}')"><option value="">Tutti i formati</option>${sizes.map(z => `<option value="${z}" ${g2.size === z ? 'selected' : ''}>${esc(fmt(z))}</option>`).join('')}</select>
      ${pres ? '' : `<button class="g2-chip red ${g2.onlyInc ? 'on' : ''}" onclick="g2.onlyInc = !g2.onlyInc; renderGallery2('${cid}', '${g2.scope}')">Solo incomplete</button>
      <button class="g2-chip red ${g2.allMiss ? 'on' : ''}" onclick="g2.allMiss = !g2.allMiss; renderGallery2('${cid}', '${g2.scope}')"><svg class="ic"><use href="#i-half"/></svg> Mostra i mancanti</button>`}
      <input id="g2Search" placeholder="Cerca serie, colore o codice…" value="${esc(g2.q)}">
    </div>
    <div id="g2Body">${groups.length ? groups.map((g, gi) => g2Block(g, gi, pres, !!cur)).join('') : '<div class="gl-empty">Nessuna serie con questi filtri.</div>'}</div>
  </div>
  ${pres ? '' : `<button class="btn red g2-prop" onclick="openG2Prop('${cid}')"><svg class="ic"><use href="#i-clipboard"/></svg> Proposta (${prop.length})</button>`}`;
  const inp = document.getElementById('g2Search');
  inp.addEventListener('input', e => { g2.q = e.target.value; const pos = e.target.selectionStart; renderGallery2(cid, g2.scope); const n = document.getElementById('g2Search'); n.focus(); n.setSelectionRange(pos, pos); });
  g2State = { cid, list: groups.flatMap(g => g.items.map(it => Object.assign(it, { group: g }))) };
  g2Lazy();
}
let g2State = null;
function g2Goto(key) {
  const sec = document.querySelector(`#g2Body .gl-serie[data-k="${CSS.escape(key)}"]`);
  if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else { g2.brand = ''; g2.onlyInc = false; g2.q = ''; renderGallery2(g2.cid, 'tutti'); setTimeout(() => g2Goto(key), 50); }
}
function g2Block(g, gi, pres, single) {
  const prop = g2Prop(g2.cid), own = g.items.filter(x => !x.missing && !x.elsewhere);
  const sizes = [...new Set(own.flatMap(x => x.s.toz ? ['tozzetto'] : (x.sizes || [x.s.z]).map(fmt)))];
  const k = g2Key(g.b, g.s), shown = g2.allMiss || g2.showMiss.has(k), pct = Math.round(g.comp.has / g.comp.tot * 100);
  const strips = g.items.map((it, j) => {
    const { s, missing, elsewhere } = it, p = glPhoto(s), turn = p && glLandscape(s) && !s.toz && sorted2(parseSize(s.z))[0] < sorted2(parseSize(s.z))[1];
    const inProp = prop.includes(s.key);
    return `<div class="gl-strip${missing ? ' miss' : ''}" role="button" tabindex="0" onclick="openG2Full(${gi * 1000 + j})">
      ${p ? `<div class="glph${turn ? ' turn' : ''}" data-bg="${esc(p)}"></div>` : '<div class="nof">foto non disponibile</div>'}
      <div class="nm">${esc(glTitle(s.c))}<small>${esc(glSizes(it))}</small></div>
      ${missing ? `<button class="add ${inProp ? 'in' : ''}" title="${inProp ? 'Nella proposta' : 'Aggiungi alla proposta'}" onclick="event.stopPropagation(); g2Toggle('${s.key.replace(/'/g, "\\'")}')">${inProp ? '<svg class="ic"><use href="#i-check"/></svg>' : '<svg class="ic"><use href="#i-plus"/></svg>'}</button><span class="tag">non in sala mostra</span>`
        : elsewhere && single ? `<span class="tag el">in: ${esc(elsewhere.name)}</span>` : ''}</div>`;
  }).join('');
  return `<section class="gl-serie" data-k="${esc(k)}">
    <div class="gl-strips">${strips}</div>
    <div class="gl-info"><div class="b">${esc(g.b)}</div><div class="t">Serie:</div><h3>${esc(glTitle(g.s))}</h3>
      <div class="g2-shead g2-only"><span class="g2-bar"><i style="width:${pct}%"></i></span><span class="p">ha <b>${g.comp.has}</b> di ${g.comp.tot} colori</span></div>
      <p><b>Formati:</b> ${esc(sizes.join(' · '))}</p>
      ${pres || g.comp.has >= g.comp.tot ? '' : `<p class="g2-only"><button class="btn" onclick="g2ToggleMiss('${esc(k).replace(/'/g, "\\'")}')">${shown ? 'Nascondi i mancanti' : `<svg class="ic"><use href="#i-half"/></svg> Mostra i ${g.comp.tot - g.comp.has} mancanti`}</button></p>`}</div>
  </section>`;
}
function g2ToggleMiss(k) { if (g2.showMiss.has(k)) g2.showMiss.delete(k); else g2.showMiss.add(k); const y = scrollY; renderGallery2(g2.cid, g2.scope); scrollTo(0, y); }
function g2Toggle(key) {
  const p = g2Prop(g2.cid), i = p.indexOf(key);
  if (i >= 0) p.splice(i, 1); else p.push(key);
  clients[g2.cid].upd = Date.now(); saveClients();
  const y = scrollY; renderGallery2(g2.cid, g2.scope); scrollTo(0, y);
  toast(i >= 0 ? 'Tolto dalla proposta' : 'Aggiunto alla proposta');
}
let g2Obs = null;
function g2Lazy() {
  if (g2Obs) g2Obs.disconnect();
  const load = el => { el.style.backgroundImage = `url('${el.dataset.bg}')`; el.removeAttribute('data-bg'); };
  if (!('IntersectionObserver' in window)) { document.querySelectorAll('#g2Body .glph[data-bg]').forEach(load); return; }
  g2Obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { load(e.target); g2Obs.unobserve(e.target); } }), { rootMargin: '400px 600px' });
  document.querySelectorAll('#g2Body .glph[data-bg]').forEach(el => g2Obs.observe(el));
}

/* ── schermo intero: miniature della serie, "Vedi posata", "Vedi in sala mostra", aggiungi alla proposta ── */
let g2Idx = 0, g2Posa = false;
function openG2Full(code) {
  const starts = []; let n = 0;
  document.querySelectorAll('#g2Body .gl-serie').forEach(sec => { starts.push(n); n += sec.querySelectorAll('.gl-strip').length; });
  g2Idx = Math.max(0, Math.min(g2State.list.length - 1, starts[Math.floor(code / 1000)] + code % 1000)); g2Posa = false;
  if (!document.getElementById('g2Full')) {
    document.body.insertAdjacentHTML('beforeend', `<div class="gl-full" id="g2Full"><div class="gl-stage" id="g2Stage">
      <button class="gl-x" onclick="closeG2Full()"><svg class="ic"><use href="#i-x"/></svg> Chiudi</button>
      <button class="gl-nav l" onclick="g2Step(-1)">‹</button><div id="g2Pic" style="display:flex;align-items:center;justify-content:center;width:100%;height:calc(100% - 76px);margin-bottom:76px"></div><button class="gl-nav r" onclick="g2Step(1)">›</button>
      <div class="g2-thumbs" id="g2Thumbs"></div></div><aside class="gl-side" id="g2Side"></aside></div>`);
    const st = document.getElementById('g2Stage'); let sx = null;
    st.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) g2Step(dx < 0 ? 1 : -1); });
    document.addEventListener('keydown', e => { if (!document.getElementById('g2Full')) return; if (e.key === 'ArrowRight') g2Step(1); if (e.key === 'ArrowLeft') g2Step(-1); if (e.key === 'Escape') closeG2Full(); });
  }
  g2Show();
}
function g2Step(d) { g2Idx = Math.max(0, Math.min(g2State.list.length - 1, g2Idx + d)); g2Show(); }
function closeG2Full() { const m = document.getElementById('g2Full'); if (m) m.remove(); }
function g2Show() {
  const it = g2State.list[g2Idx], { s, missing, group } = it, pres = !!ui.g2Pres, p = glPhoto(s, true), box = document.getElementById('g2Pic');
  const st = document.getElementById('g2Stage'), W = st.clientWidth * 0.86, H = (st.clientHeight - 76) * 0.9;
  if (!g2Posa) box.innerHTML = p ? `<img src="${esc(p)}" alt="" style="max-width:${W}px;max-height:${H}px;object-fit:contain;border-radius:6px;box-shadow:0 30px 80px rgba(0,0,0,.6)">` : '<div style="color:#aaa">Foto non disponibile</div>';
  else {   // posata: la piastrella ripetuta con le fughe, nelle sue proporzioni
    const [a, b] = s.toz ? [1, 1] : sorted2(parseSize(s.z)), cols = b / a > 1.5 ? 4 : 3, rows = b / a > 1.5 ? 2 : 3, tw = Math.min(W / cols, H / rows * (b / a > 1.5 ? 2 : 1)) - 4;
    const cw = b / a > 1.5 ? tw : tw, ch = b / a > 1.5 ? tw * 2 : tw;   // 60×120 in piedi: celle verticali
    const cell = Math.min(W / cols, (H / rows) * (cw / ch)), w = cell, h = cell * (ch / cw);
    box.innerHTML = `<div class="g2-posa" style="grid-template-columns:repeat(${cols},${w}px);grid-template-rows:repeat(${rows},${h}px)">${Array(cols * rows).fill(`<span style="background-image:url('${esc(p || '')}')"></span>`).join('')}</div>`;
  }
  // miniature: tutta la serie
  const series = g2State.list.filter(x => x.group === group);
  document.getElementById('g2Thumbs').innerHTML = series.map(x => { const i = g2State.list.indexOf(x), u = IMG[photoKey(x.s)], m = u && ((window.FOTO_MINI || {})[u] || u);
    return `<button class="${i === g2Idx ? 'cur' : ''}${x.missing ? ' miss' : ''}" title="${esc(glTitle(x.s.c))}" style="${m ? `background-image:url('${esc(m)}')` : ''}" onclick="g2Idx=${i}; g2Show()"></button>`; }).join('');
  const cur = document.querySelector('#g2Thumbs .cur'); if (cur) cur.scrollIntoView({ inline: 'center', block: 'nearest' });
  document.querySelector('#g2Full .gl-nav.l').disabled = g2Idx === 0; document.querySelector('#g2Full .gl-nav.r').disabled = g2Idx >= g2State.list.length - 1;
  const all = it.all || [], inProp = g2Prop(g2State.cid).includes(s.key);
  document.getElementById('g2Side').innerHTML = `<div class="b">${esc(s.b)}</div><div class="t">Serie</div><h3>${esc(glTitle(s.s))}</h3>
    <div class="col">${esc(glTitle(s.c))}</div>
    <dl><dt>${(it.sizes || []).length > 1 ? 'Formati' : 'Formato'}</dt><dd>${esc(s.toz ? 'tozzetto' : glSizes(it) + ' cm')}</dd>
      ${(s.f || []).length ? `<dt>Finiture</dt><dd>${esc([...new Set((all.length ? all : [{ s }]).flatMap(x => x.s.f || []))].join(', '))}</dd>` : ''}
      ${!pres && (s.k || []).length ? `<dt>Codici</dt><dd>${esc([...new Set((all.length ? all : [{ s }]).flatMap(x => x.s.k || []))].join(' · '))}</dd>` : ''}
      ${!pres && all.length ? `<dt>Dove</dt><dd>${all.map(x => `${esc(x.c.name)} · posto ${esc(slotName(DISP[x.c.disp], x.slot, x.c.slots.length))}`).join('<br>')}</dd>` : ''}</dl>
    ${!pres && missing ? '<div class="warn">Non presente in sala mostra</div>' : ''}
    <div class="g2-acts">
      <button onclick="g2Posa = !g2Posa; g2Show()">${g2Posa ? '<svg class="ic"><use href="#i-square"/></svg> Piastrella singola' : '<svg class="ic"><use href="#i-tiles"/></svg> Vedi posata'}</button>
      ${!pres && all.length ? `<button onclick="g2OpenInRoom()"><svg class="ic"><use href="#i-store"/></svg> Vedi in sala mostra</button>` : ''}
      ${!pres && missing ? `<button class="${inProp ? '' : 'red'}" onclick="g2Toggle('${s.key.replace(/'/g, "\\'")}'); g2Show()">${inProp ? '<svg class="ic"><use href="#i-check"/></svg> Nella proposta' : '<svg class="ic"><use href="#i-plus"/></svg> Aggiungi alla proposta'}</button>` : ''}
    </div>`;
}
/* apre la sala mostra sul campione (stanza, espositore e posto giusti) */
function g2OpenInRoom() {
  const it = g2State.list[g2Idx], x = (it.all || [])[0]; if (!x) return;
  const sc = showRooms(g2State.cid).find(r => r.items.some(i => i.comp === x.c.id)); if (!sc) return;
  const item = sc.items.find(i => i.comp === x.c.id);
  closeG2Full(); go(`#/salamostra/${g2State.cid}/${sc.id}`);
  setTimeout(() => openSample(item.id, x.slot), 700);
}

/* ── proposta di integrazione ── */
function openG2Prop(cid) {
  const p = g2Prop(cid), cl = clients[cid];
  const rows = p.map(k => SAMPLE[k]).filter(Boolean);
  const html = rows.length ? rows.map(s => { const u = IMG[photoKey(s)], m = u && ((window.FOTO_MINI || {})[u] || u);
    return `<div class="srow"><span class="sw" style="${m ? `background-image:url('${esc(m)}')` : ''}"></span><div class="info"><div class="brand">${esc(s.b)}</div><div class="ser">${esc(glTitle(s.s))}</div>
      <div class="col">${esc(glTitle(s.c))} · ${esc(fmt(s.z))}</div><div class="meta">${esc((s.k || []).join(' / '))}</div></div>
      <button class="btn" onclick="g2Toggle('${s.key.replace(/'/g, "\\'")}'); openG2Prop('${cid}')"><svg class="ic"><use href="#i-x"/></svg></button></div>`; }).join('')
    : '<div class="empty-note">La proposta è vuota: nei colori che non ha tocca <svg class="ic"><use href="#i-plus"/></svg> per aggiungerli.</div>';
  let m = document.getElementById('g2PropM');
  if (!m) { document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="g2PropM"><div class="mbox" style="max-width:620px;width:calc(100vw - 32px)"><div id="g2PropB"></div></div></div>`); m = document.getElementById('g2PropM'); m.addEventListener('click', e => { if (e.target === m) m.remove(); }); }
  document.getElementById('g2PropB').innerHTML = `<div class="mhead"><h3><svg class="ic"><use href="#i-clipboard"/></svg> Proposta di integrazione · ${esc(cl.name)}</h3><button class="btn" onclick="document.getElementById('g2PropM').remove()">Chiudi</button></div>
    <div style="max-height:52vh;overflow:auto;margin:10px 0">${html}</div>
    ${rows.length ? `<div class="btns" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="g2CopyCodes('${cid}')"><svg class="ic"><use href="#i-copy"/></svg> Copia codici</button>
      <button class="btn" onclick="g2Print('${cid}')"><svg class="ic"><use href="#i-printer"/></svg> PDF / Stampa</button>
      <button class="btn dark" onclick="g2PutIn('${cid}')"><svg class="ic"><use href="#i-paste"/></svg> Metti in un espositore</button>
      <button class="btn" onclick="if (confirm('Svuotare la proposta?')) { clients['${cid}'].proposta = []; saveClients(); openG2Prop('${cid}'); renderGallery2('${cid}', g2.scope); }">Svuota</button></div>` : ''}`;
}
function g2Lines(cid) { return g2Prop(cid).map(k => SAMPLE[k]).filter(Boolean).map(s => `${glTitle(s.s)} ${glTitle(s.c)} ${fmt(s.z)} - ${(s.k || [])[0] || ''}`); }
async function g2CopyCodes(cid) {
  const txt = `Proposta di integrazione · ${clients[cid].name}\n\n` + g2Lines(cid).join('\n');
  try { await navigator.clipboard.writeText(txt); toast('Codici copiati'); } catch (e) { say(txt); }
}
function g2PutIn(cid) {
  const txt = g2Lines(cid).join('\n'), seen = new Set(), list = [];
  showRooms(cid).forEach(r => r.items.forEach(it => { const c = comps[it.comp]; if (c && !seen.has(c.id)) { seen.add(c.id); list.push(c); } }));
  document.getElementById('g2PropM').remove();
  pasteIntoComps(list, null, () => renderGallery2(cid, g2.scope));
  setTimeout(() => { const ta = document.getElementById('pasteIn'); if (ta) ta.value = txt; }, 60);
}
function g2Print(cid) {
  const cl = clients[cid], rows = g2Prop(cid).map(k => SAMPLE[k]).filter(Boolean);
  let el = document.getElementById('g2Print'); if (!el) { el = document.createElement('div'); el.id = 'g2Print'; document.body.appendChild(el); }
  el.innerHTML = `<h1>Proposta di integrazione</h1><div style="color:#555;margin-bottom:6mm">${esc(cl.name)}${cl.city ? ' · ' + esc(cl.city) : ''} · ${new Date().toLocaleDateString('it-IT')}</div>` +
    rows.map(s => `<div class="it"><img src="${esc(glPhoto(s) || '')}" alt=""><div><div style="font:700 10px Inter;color:#b0101a;letter-spacing:.1em;text-transform:uppercase">${esc(s.b)}</div>
      <div style="font:600 18px 'Inter Tight',Inter,sans-serif">${esc(glTitle(s.s))} · ${esc(glTitle(s.c))}</div>
      <div style="color:#444;margin-top:2mm">${esc(fmt(s.z))} cm · ${esc((s.f || []).join(', '))}</div><div style="color:#444">Codici: ${esc((s.k || []).join(' · '))}</div></div></div>`).join('');
  document.body.classList.add('g2-printing');
  const done = () => { document.body.classList.remove('g2-printing'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  Promise.all([...el.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => setTimeout(() => window.print(), 100));
}

/* ════ Dettagli: tutte le serie del cliente con completezza; aprendo una serie, i colori divisi per tipo ════ */
let g2DetCtx = null;
g2.openSer = new Set();
function g2DetailsHTML(cid, allC, allSeries, nKeys, nDisp, byBrand) {
  g2DetCtx = { cid, allC, allSeries };
  const tot = allSeries.reduce((a, g) => a + g.comp.tot, 0), has = allSeries.reduce((a, g) => a + g.comp.has, 0);
  const inc = allSeries.filter(g => g.comp.has < g.comp.tot).length;
  return `<details class="g2-det g2-only" ${ui.g2Det ? 'open' : ''} ontoggle="ui.g2Det = this.open; saveUI()">
    <summary><span class="t">Dettagli</span><span class="s">${allSeries.length} serie · ${nKeys} campioni · ${has} di ${tot} colori (${tot ? Math.round(has / tot * 100) : 0}%) · ${inc} serie incomplete</span>
      <svg class="ic chev"><use href="#i-cdown"/></svg></summary>
    <div class="g2-detin">
      <div class="g2-dtop">
        <div class="g2-stats"><div><b>${allSeries.length}</b><span>serie</span></div><div><b>${nKeys}</b><span>campioni</span></div>
          <div><b>${nDisp}</b><span>espositori</span></div><div><b>${Object.keys(byBrand).length}</b><span>marche</span></div>
          <div class="g2-brands">${Object.entries(byBrand).sort((a, b) => b[1] - a[1]).map(([b, n]) => `<b>${esc(b)}</b> ${n} serie`).join(' · ')}</div></div>
        <div>
          <div class="g2-sl-head"><h4>Tutte le serie</h4>
            <select onchange="g2.detSort = this.value; g2DetRender()">
              ${[['miss', 'Più incomplete'], ['brand', 'Per marca'], ['name', 'Per nome'], ['pct', 'Più complete']].map(([v, l]) => `<option value="${v}" ${(g2.detSort || 'miss') === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
          <div id="g2DetList">${g2DetListHTML()}</div>
          <div class="g2-legend"><span><i style="background:#2f7d4f"></i>ce l'ha</span><span><i style="background:#fff;border:1.5px solid rgba(214,40,50,.6)"></i>manca: tocca per metterlo nella proposta</span><span><i style="background:#b0101a"></i>nella proposta</span><span>formati: <b style="color:#1d1d20">in nero</b> quelli che ha</span></div>
        </div>
      </div>
    </div>
  </details>`;
}
function g2DetRender() { const el = document.getElementById('g2DetList'); if (el) el.innerHTML = g2DetListHTML(); }
function g2DetListHTML() {
  const { allSeries } = g2DetCtx, srt = g2.detSort || 'miss';
  const list = allSeries.slice().sort(srt === 'brand' ? (a, b) => a.b.localeCompare(b.b) || a.s.localeCompare(b.s)
    : srt === 'name' ? (a, b) => a.s.localeCompare(b.s)
    : srt === 'pct' ? (a, b) => b.comp.has / b.comp.tot - a.comp.has / a.comp.tot
    : (a, b) => (b.comp.tot - b.comp.has) - (a.comp.tot - a.comp.has) || a.s.localeCompare(b.s));
  return list.map(g => {
    const k = g2Key(g.b, g.s), open = g2.openSer.has(k), miss = g.comp.tot - g.comp.has, pct = Math.round(g.comp.has / g.comp.tot * 100);
    return `<div class="g2-sr${open ? ' open' : ''}">
      <button data-k="${esc(k)}" onclick="g2DetToggle(this.dataset.k)"><svg class="ic"><use href="#i-cright"/></svg>
        <span class="n">${esc(glTitle(g.s))}<small>${esc(g.b)}</small></span><span class="g2-bar"><i style="width:${pct}%"></i></span>
        <span class="p">${g.comp.has} di ${g.comp.tot} colori</span><span class="m ${miss ? 'no' : 'ok'}">${miss ? `mancano ${miss}` : 'completa'}</span></button>
      ${open ? `<div class="g2-sbody">${g2SeriesBody(g.b, g.s)}</div>` : ''}</div>`;
  }).join('');
}
function g2DetToggle(k) { if (g2.openSer.has(k)) g2.openSer.delete(k); else g2.openSer.add(k); g2DetRender(); }
/* i colori di una serie, divisi per tipo: fondi (o famiglie di fondi, es. Neutra / Sassi), poi le grafiche nell'ordine del listino */
function g2SeriesGroups(b, s) {
  const byC = new Map();
  SAMPLES.forEach(x => {
    if (x.b !== b || x.s !== s || x.toz) return;
    const e = byC.get(x.c) || { c: x.c, list: [], g: x.g || '', gi: x.gi || 0 };
    e.list.push(x); byC.set(x.c, e);
  });
  const cols = [...byC.values()], fondi = cols.filter(e => !e.g), groups = [];
  // famiglie di fondi: stessa prima parola e stesse tinte (Neutra Beige / Sassi Beige …)
  const first = e => e.c.split(' ')[0], rest = e => e.c.split(' ').slice(1).join(' ');
  const fam = new Map();
  fondi.forEach(e => { if (!rest(e)) return; if (!fam.has(first(e))) fam.set(first(e), []); fam.get(first(e)).push(e); });
  const famList = [...fam.entries()].filter(([, l]) => l.length >= 2);
  let split = false;
  if (famList.length >= 2) { const r0 = new Set(famList[0][1].map(rest)); split = famList[1][1].filter(e => r0.has(rest(e))).length >= 2; }
  if (split) {
    const used = new Set();
    famList.forEach(([f, l]) => { l.forEach(e => used.add(e)); groups.push({ name: f, cols: l, strip: f }); });
    const others = fondi.filter(e => !used.has(e));
    if (others.length) groups.unshift({ name: 'Fondi', cols: others });
  } else if (fondi.length) groups.push({ name: 'Fondi', cols: fondi });
  const gr = new Map();
  cols.filter(e => e.g).forEach(e => { if (!gr.has(e.g)) gr.set(e.g, { name: e.g, cols: [], gi: e.gi, strip: e.g }); gr.get(e.g).cols.push(e); });
  [...gr.values()].sort((a, b) => a.gi - b.gi).forEach(q => groups.push(q));
  return groups;
}
const g2ReEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function g2SeriesBody(b, s) {
  const { allC, cid } = g2DetCtx, prop = g2Prop(cid);
  const ownZ = new Map();   // colore → formati che ha in sala mostra
  allC.forEach(c => c.slots.forEach(k => {
    const x = k && SAMPLE[k];
    if (x && x.b === b && x.s === s && !x.toz) { if (!ownZ.has(x.c)) ownZ.set(x.c, new Set()); ownZ.get(x.c).add(x.z); }
  }));
  const bySize = (a, c) => { const A = parseSize(a), B = parseSize(c); return A[0] * A[1] - B[0] * B[1]; };
  return g2SeriesGroups(b, s).map(gr => {
    const cols = gr.cols.slice().sort((a, c) => (ownZ.has(c.c) ? 1 : 0) - (ownZ.has(a.c) ? 1 : 0));   // prima quelli che ha
    const n = cols.filter(e => ownZ.has(e.c)).length;
    return `<div class="g2-grp"><h5>${esc(glTitle(gr.name))} <span class="g2-bar"><i style="width:${Math.round(n / cols.length * 100)}%"></i></span><span>${n} di ${cols.length}</span></h5>
      <div class="g2-sws">${cols.map(e => {
        const own = ownZ.get(e.c), x0 = e.list.find(x => own && own.has(x.z)) || e.list[0], u = IMG[photoKey(x0)], m = u && ((window.FOTO_MINI || {})[u] || u);
        let nm = e.c;
        if (gr.strip) nm = nm.replace(new RegExp('\\b' + g2ReEsc(gr.strip) + '\\b', 'i'), '').replace(/\s+/g, ' ').trim() || e.c;
        const zs = [...new Set(e.list.map(x => x.z))].sort(bySize).map(z => own && own.has(z) ? `<i>${esc(fmt(z))}</i>` : esc(fmt(z))).join(' · ');
        const inP = !own && e.list.some(x => prop.includes(x.key)), key = (e.list.find(x => x.z === '60x120') || e.list[0]).key;
        const act = own ? `title="${esc(glTitle(nm))}: ce l'ha"` : `title="Manca: tocca per ${inP ? 'toglierlo dalla' : 'metterlo nella'} proposta" data-keys="${esc(e.list.map(x => x.key).join('§'))}" data-key="${esc(key)}" onclick="g2DetProp(this)"`;
        return `<div class="g2-sw ${own ? 'has' : 'miss'}${inP ? ' inprop' : ''}" ${act}>
          <span class="im" style="${m ? `background-image:url('${esc(m)}')` : ''}"></span>
          <span class="st"><svg class="ic"><use href="#i-${own || inP ? 'check' : 'plus'}"/></svg></span>
          <b>${esc(glTitle(nm))}</b><small>${zs}</small></div>`;
      }).join('')}</div></div>`;
  }).join('');
}
/* colore mancante: dentro / fuori dalla proposta (si propone il formato 60×120 se c'è) */
function g2DetProp(el) {
  const keys = el.dataset.keys.split('§'), key = el.dataset.key, p = g2Prop(g2DetCtx.cid), had = keys.some(k => p.includes(k));
  if (had) keys.forEach(k => { const i = p.indexOf(k); if (i >= 0) p.splice(i, 1); }); else p.push(key);
  clients[g2DetCtx.cid].upd = Date.now(); saveClients();
  g2DetRender();
  const b = document.querySelector('.g2-prop'); if (b) b.innerHTML = `<svg class="ic"><use href="#i-clipboard"/></svg> Proposta (${p.length})`;
  toast(had ? 'Tolto dalla proposta' : 'Aggiunto alla proposta');
}
