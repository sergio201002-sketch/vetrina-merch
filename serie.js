'use strict';
/* ════════════════════════════════════════════════════════════
   SERIE (#/serie, #/serie/<marca|serie>) — il listino serie per serie: tutti i colori con le varianti e i decori
   (niente pezzi speciali né tozzetti), ognuno con la foto, i formati, le finiture, lo spessore e i codici.
   A sinistra l'elenco (cerca anche per colore o codice, filtro marca), a destra la serie scelta a foto o a tabella
   dei codici, con il filtro per formato; tocca un colore per la foto grande e tutti i suoi formati.
   PDF (A4 verticale, si scarica): la serie scelta, oppure tutte quelle dell'elenco con l'indice in copertina.
   I gruppi (fondi, famiglie, decori) sono quelli della Galleria+ (g2SeriesGroups).
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewSerie'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="serie"] #viewSerie { display: block; overflow: hidden; }
body[data-view="serie"] .hbtn[data-nav="serie"] { background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 -2px 0 var(--red); }
#viewSerie { background: #fbfaf8; }
.sr { display: grid; grid-template-columns: 320px minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); height: 100%; }
.sr-top { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; padding: 12px 20px; background: #fff; border-bottom: 1px solid #ebe8e2; }
.sr-top h2 { margin: 0; font: 700 19px var(--font-display); letter-spacing: -.02em; }
.sr-kpi { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }
.sr-kpi span { background: #f6f4f0; border-radius: 999px; padding: 6px 12px; font-size: 12px; color: #555; white-space: nowrap; }
.sr-kpi b { color: #1d1d20; font-weight: 700; }
.sr-side { border-right: 1px solid #ebe8e2; background: #fff; display: flex; flex-direction: column; min-height: 0; }
.sr-tools { display: flex; gap: 6px; padding: 10px 12px; border-bottom: 1px solid #f0ede7; }
.sr-tools input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 13px; }
.sr-tools select { padding: 7px 6px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 12.5px; background: #fff; max-width: 130px; }
.sr-list { overflow-y: auto; flex: 1; padding: 0 0 20px; }
.sr-bh { font: 700 10.5px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #b0101a; padding: 14px 16px 4px; }
.sr-row { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; padding: 6px 14px 6px 5px; border-left: 3px solid transparent; }
.sr-row .ck { flex: none; width: 34px; height: 38px; display: flex; align-items: center; justify-content: center; margin-right: -6px; }
.sr-row .ck .ic { width: 20px; height: 20px; padding: 3px; box-sizing: border-box; border: 1.5px solid #cfcac1; border-radius: 6px; background: #fff; color: transparent; transition: background .12s, border-color .12s; }
.sr-row .ck:hover .ic { border-color: #9b958b; }
.sr-row.mk .ck .ic { background: var(--red); border-color: var(--red); color: #fff; }
.sr-sel { display: flex; align-items: center; gap: 10px; padding: 8px 14px; border-bottom: 1px solid #f0ede7; font-size: 12px; color: var(--mid); background: #fcfbf9; }
.sr-sel b { color: #1d1d20; }
.sr-sel .sp { flex: 1; }
.sr-sel button { border: 0; background: none; color: #8e1016; font: 600 12px var(--font-body); cursor: pointer; padding: 2px 0; white-space: nowrap; }
.sr-tacts { display: flex; gap: 8px; flex-wrap: wrap; }
.sr-row:hover { background: #f8f7f4; }
.sr-row.on { background: #f4f1ec; border-left-color: var(--red); }
.sr-row .th { width: 38px; height: 38px; border-radius: 7px; background: #ebe8e2 center / cover no-repeat; flex: none; }
.sr-row .tx { flex: 1; min-width: 0; }
.sr-row .n { display: block; font: 600 14px var(--font-display); letter-spacing: -.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sr-row .m { display: block; font-size: 11.5px; color: var(--mid); margin-top: 1px; }
.sr-main { overflow-y: auto; min-height: 0; padding: 22px 28px 60px; }
.sr-head { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; padding-bottom: 14px; border-bottom: 1px solid #ebe8e2; }
.sr-head .who { flex: 1; min-width: 240px; }
.sr-head .br { font: 700 11px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #b0101a; }
.sr-head h3 { margin: 2px 0 8px; font: 700 30px/1.05 var(--font-display); letter-spacing: -.03em; }
.sr-head .meta { font-size: 12.5px; color: #444; line-height: 1.55; }
.sr-head .meta b { color: #1d1d20; }
.sr-head .acts { display: flex; gap: 8px; flex-wrap: wrap; }
.sr-bar { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin: 14px 0 2px; }
.sr-bar .sp { flex: 1; }
.sr-chip { border: 1px solid var(--border); background: #fff; border-radius: 999px; padding: 5px 11px; font: 600 12px var(--font-body); cursor: pointer; color: #333; display: inline-flex; align-items: center; gap: 5px; }
.sr-chip .ic { width: 14px; height: 14px; }
.sr-chip.on { background: #1d1d20; border-color: #1d1d20; color: #fff; }
.sr-seg { display: inline-flex; gap: 4px; }
.sr-grp { margin-top: 22px; }
.sr-grp h5 { display: flex; align-items: baseline; gap: 8px; margin: 0 0 10px; font: 700 13.5px var(--font-body); color: #222; }
.sr-grp h5 span { font-weight: 500; font-size: 12px; color: var(--mid); }
.sr-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 14px; }
.sr-card { background: #fff; border: 1px solid #ebe8e2; border-radius: 12px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; transition: box-shadow .15s, border-color .15s; }
.sr-card:hover { border-color: #d9d4ca; box-shadow: 0 6px 20px rgba(20,18,15,.08); }
.sr-card .im { aspect-ratio: 1; background: #ebe8e2; position: relative; }
.sr-card .im img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sr-card .im .no { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--mid); }
.sr-card .tx { padding: 8px 10px 10px; }
.sr-card b { display: block; font-size: 13px; line-height: 1.25; }
.sr-card .z { font-size: 11.5px; color: #555; margin-top: 3px; line-height: 1.4; }
.sr-tw { overflow-x: auto; margin-top: 18px; }
.sr-tab { width: 100%; border-collapse: collapse; background: #fff; font-size: 12.5px; }
.sr-tw .sr-tab { border: 1px solid #ebe8e2; }
.sr-tab th { text-align: left; font: 700 10.5px var(--font-body); letter-spacing: .08em; text-transform: uppercase; color: var(--mid); padding: 8px 10px; background: #f8f7f4; white-space: nowrap; }
.sr-tab td { padding: 5px 10px; border-top: 1px solid #f3f0eb; vertical-align: middle; }
.sr-tab tbody tr { cursor: pointer; }
.sr-tab tbody tr:hover td { background: #faf9f6; }
.sr-tab tr.c1 td { border-top-color: #e2ded6; }
.sr-tab tr.gh td { background: #f4f1ec; font-weight: 700; padding: 7px 10px; cursor: default; }
.sr-tab tr.gh span { font-weight: 500; color: var(--mid); margin-left: 6px; }
.sr-tab .cn { display: flex; align-items: center; gap: 8px; font-weight: 600; white-space: nowrap; }
.sr-tab .cn i { width: 28px; height: 28px; border-radius: 5px; background: #ebe8e2 center / cover no-repeat; flex: none; }
.sr-tab .k { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 600; white-space: nowrap; }
.sr-tab .z { white-space: nowrap; }
.sr-empty { color: var(--mid); padding: 40px 0; text-align: center; }
#srFull .mbox { width: min(1060px, 100%); }
#srFull .mhead h3 { min-width: 0; }
.sr-cnt { font-size: 12px; color: var(--mid); }
.sr-fb { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 18px; padding: 16px 18px 18px; overflow: auto; }
.sr-fb .sr-ph { background: #f3f1ec; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 280px; overflow: hidden; color: var(--mid); }
.sr-fb .sr-ph img { max-width: 100%; max-height: 68vh; display: block; }
.sr-fb .br { font: 700 11px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #b0101a; }
.sr-fb h4 { margin: 2px 0 2px; font: 700 22px/1.15 var(--font-display); letter-spacing: -.02em; }
.sr-fb .gr { font-size: 12.5px; color: var(--mid); margin-bottom: 12px; }
.sr-fb .sr-tab { border: 1px solid #ebe8e2; }
.sr-fb .sr-tab tbody tr { cursor: default; }
@media (max-width: 760px) {
  body[data-view="serie"] #viewSerie { overflow-y: auto; }
  .sr { display: block; height: auto; }
  .sr-top { padding: 10px 12px; }
  .sr-side { border-right: 0; border-bottom: 1px solid #ebe8e2; }
  .sr-list { max-height: 36vh; }
  .sr-main { padding: 16px 12px 40px; }
  .sr-head h3 { font-size: 24px; }
  .sr-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .sr-fb { grid-template-columns: 1fr; padding: 12px; }
  .sr-fb .sr-ph { min-height: 200px; }
}
</style>`);

let srSel = '', srQ = '', srBrand = '', srZ = '', srMode = 'foto', srCur = null, srIdx = 0;
const SR_BRANDS = ['Emilceramica', 'Ergon', 'Provenza', 'Viva'];
const srBrandIdx = b => { const i = SR_BRANDS.indexOf(b); return i < 0 ? 99 : i; };
const srBySize = (a, b) => { const A = parseSize(a), B = parseSize(b); return !A || !B ? 0 : A[0] * A[1] - B[0] * B[1] || A[0] - B[0]; };
const srByNum = (a, b) => parseFloat(String(a).replace(',', '.')) - parseFloat(String(b).replace(',', '.'));
/* miniatura (240 px) per l'elenco e la tabella */
const srMini = x => { const u = x && IMG[photoKey(x)]; return u ? (FOTO_MINI[u] || glPhoto(x)) : ''; };

/* tutte le serie del listino (e delle novità): marca, nome, campioni; txt = dove cercare (serie, colori, codici) */
function srAll() {
  const m = new Map();
  SAMPLES.forEach(x => {
    if (x.toz || x.sp) return;
    const k = x.b + '|' + x.s;
    if (!m.has(k)) m.set(k, { k, b: x.b, s: x.s, list: [], nuovo: false });
    const g = m.get(k); g.list.push(x); if (x.nuovo) g.nuovo = true;
  });
  return [...m.values()].map(g => Object.assign(g, { nc: new Set(g.list.map(glCid)).size,
    txt: normTxt([g.b, g.s, ...new Set(g.list.map(x => x.c)), ...g.list.flatMap(x => x.k)].join(' ')) }))
    .sort((a, b) => srBrandIdx(a.b) - srBrandIdx(b.b) || a.b.localeCompare(b.b) || a.s.localeCompare(b.s));
}
/* gruppi della serie con i colori: nome nel gruppo (senza il nome del decoro), campioni per formato,
   righe formato × finitura (una per codice) e il campione da cui prendere la foto */
function srGroups(g) {
  const grs = g2SeriesGroups(g.b, g.s).map(gr => ({ name: gr.name, cols: gr.cols.map(e => {
    let nm = e.c;
    if (gr.tint && gr.tint[e.c]) nm = gr.tint[e.c];
    else if (gr.strip) nm = nm.replace(new RegExp('\\b' + g2ReEsc(gr.strip) + '\\b', 'i'), '').replace(/\s+/g, ' ').trim() || e.c;
    const list = e.list.slice().sort((a, b) => srBySize(a.z, b.z));
    const rows = list.flatMap(x => (FIN_VAR[x.key] || [x]).map(v => ({ z: x.z, f: (v.f || []).join(' / '), t: (v.t || []).join(' / '), k: (v.k || []).join(' · ') })));
    const ph = list.find(x => x.z === '60x120' && hasPhoto(x)) || list.find(hasPhoto) || null;
    return { id: e.id, name: glTitle(nm), full: glTitle(e.c), list, rows, all: rows, ph };
  }) }));
  grs.forEach(gr => { gr.title = gr.name === 'Fondi' ? (grs.length > 1 ? 'Fondo' : 'Colori') : glTitle(gr.name); });
  return grs;
}
/* riassunto della serie: colori, formati, finiture, spessori */
function srInfo(g, grs) {
  return { nC: grs.reduce((a, gr) => a + gr.cols.length, 0), zs: [...new Set(g.list.map(x => x.z))].sort(srBySize),
    fins: [...new Set(g.list.flatMap(x => x.f))], ths: [...new Set(g.list.flatMap(x => x.t))].sort(srByNum) };
}
const srColN = n => `${n} ${n === 1 ? 'colore' : 'colori'}`;
/* cartella colori, come nei cataloghi: i colori in colonna (Chocolate, Cream…), le varianti in riga (Fondo, Tegolo, Vein Cut…)
   con il nome scritto di lato. Ci va tutta la serie, a cartelle: le varianti con gli stessi colori stanno nella stessa
   (il colore si riconosce dal nome senza il nome del gruppo e degli altri gruppi: "Sand Falda" nel Mosaico è Sand),
   quelle con colori loro (Metalbrick, Majolica) in una cartella a parte, i decori senza colore (Eden, Carioca A/B) tutti
   in una riga "Decori". Una variante sola = una riga; un colore solo in più varianti = le varianti in colonna */
const SR_GEN = /^(decoro|decor|deco|[a-z]|\d+)$/;
function srChart(grs) {
  const W = s => normTxt(s).split(' ').filter(Boolean), tk = gr => W(gr.title).join(' ');
  const disp = (e, k) => { const ks = new Set(k.split(' ')); return e.name.split(/\s+/).filter(w => ks.has(normTxt(w))).join(' ') || e.name; };
  const keyed = grs.map((gr, at) => {
    const own = new Set(W(gr.title)), others = grs.filter(o => o !== gr).map(tk).filter(Boolean).sort((a, b) => b.length - a.length), extra = [];
    // stesso colore scritto in due modi nel listino (Be-Square "Ivory" e "Ivory Slim", Sleek Wood "Beige *"): un riquadro solo, il primo
    const cells = gr.cols.map(e => {
      const w = W(e.name), s = w.filter(x => !own.has(x));
      let k = (s.length ? s : w).join(' ');
      others.forEach(t => { const r = (' ' + k + ' ').replace(' ' + t + ' ', ' ').trim(); if (r && r !== k) { k = r; if (!extra.includes(t)) extra.push(t); } });
      return { e, k };
    }).filter((c, i, a) => a.findIndex(o => o.k === c.k) === i);
    const title = gr.title + extra.map(t => ' · ' + glTitle((grs.find(o => tk(o) === t) || {}).title || t)).join('');
    return { gr, at, title, cells, gen: cells.every(c => SR_GEN.test(c.k)) };
  });
  const sets = [];
  keyed.filter(q => !q.gen).forEach(q => {
    const ks = new Set(q.cells.map(c => c.k));
    const b = sets.find(b => { const n = [...ks].filter(k => b.keys.has(k)).length; return n && (n >= ks.size * 0.6 || n >= b.keys.size * 0.6); });
    if (b) { b.items.push(q); ks.forEach(k => b.keys.add(k)); } else sets.push({ keys: ks, items: [q], at: q.at });
  });
  const blocks = sets.map(b => {
    const cols = [], seen = new Set();
    b.items.forEach(q => q.cells.forEach(c => { if (!seen.has(c.k)) { seen.add(c.k); cols.push({ k: c.k, name: disp(c.e, c.k) }); } }));
    const rows = b.items.map(q => ({ title: q.title, cells: cols.map(c => (q.cells.find(x => x.k === c.k) || {}).e || null) }));
    return cols.length === 1 && rows.length > 1 ? { at: b.at, cols: rows.map(r => ({ k: r.title, name: r.title })), rows: [{ title: cols[0].name, cells: rows.map(r => r.cells[0]) }] }
      : { at: b.at, cols, rows };
  });
  const gen = keyed.filter(q => q.gen), dec = gen.flatMap(q => q.cells.map(c => ({ name: /^dec/.test(c.k) ? q.gr.title : q.gr.title + ' ' + c.e.name, e: c.e })));
  if (dec.length) blocks.push({ at: gen[0].at, dec: true, cols: dec.map((d, i) => ({ k: '#' + i, name: d.name })), rows: [{ title: 'Decori', cells: dec.map(d => d.e) }] });
  if (!blocks.length) return null;
  blocks.sort((a, b) => a.at - b.at);
  const nC = new Set(keyed.filter(q => !q.gen).flatMap(q => q.cells.map(c => c.k))).size, nV = keyed.length - gen.length;
  return { blocks, sum: [nC ? srColN(nC) : '', nV > 1 ? nV + ' varianti' : '', dec.length ? dec.length + (dec.length === 1 ? ' decoro' : ' decori') : ''].filter(Boolean).join(' · ') };
}
/* a blocchi di 6 colori; tocca un riquadro per la foto grande con i codici */
function srChartHTML(ch) {
  const out = [];
  ch.blocks.forEach(bk => {
    for (let a = 0; a < bk.cols.length; a += 6) {
      const b = Math.min(bk.cols.length, a + 6);
      out.push(`<div class="sr-chart" style="--n:${b - a}">${bk.cols.slice(a, b).map(c => `<div class="h" title="${esc(c.name)}">${esc(c.name)}</div>`).join('')}<div></div>
        ${bk.rows.map(r => r.cells.slice(a, b).map(e => e ? `<button class="c" data-id="${esc(e.id)}" onclick="srOpenId(this.dataset.id)" title="${esc(e.full)}" style="${e.ph ? `background-image:url('${esc(glPhoto(e.ph))}')` : ''}"></button>`
          : '<span class="c e"></span>').join('') + `<div class="l"><span title="${esc(r.title)}">${esc(r.title)}</span></div>`).join('')}</div>`);
    }
  });
  return out.join('');
}
const SR_ARROW = '<svg class="ar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';   // ↗ come sul sito Emilgroup
function srOpenId(id) { const n = srCur ? srCur.cols.findIndex(e => e.id === id) : -1; if (n >= 0) srOpen(n); }
document.head.insertAdjacentHTML('beforeend', `<style>
.sr-chart { display: grid; grid-template-columns: repeat(var(--n), minmax(0, 1fr)) 24px; gap: 4px; max-width: calc(var(--n) * 170px + 28px); }
.sr-chart + .sr-chart { margin-top: 24px; }
.sr-chart .h { text-align: center; font: 600 13px var(--font-body); color: #1a1a1c; padding: 0 2px 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; align-self: end; }
.sr-chart .c { display: block; width: 100%; aspect-ratio: 3 / 5; background: #e6e1d8 center / cover no-repeat; border: 0; padding: 0; cursor: zoom-in; transition: filter .2s; }
.sr-chart .c:hover { filter: brightness(1.06); }
.sr-chart .c.e { background: repeating-linear-gradient(45deg, #f2efe9 0 6px, #ebe7df 6px 12px); cursor: default; }
.sr-chart .l { display: flex; align-items: center; justify-content: center; min-width: 0; }
.sr-chart .l span { writing-mode: vertical-rl; font: 600 12px var(--font-body); color: #1a1a1c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-height: 100%; }
.sr-grp .sr-chart { max-width: min(100%, calc(var(--n) * 130px + 28px)); }
@media (max-width: 760px) { .sr-chart { gap: 3px; grid-template-columns: repeat(var(--n), minmax(0, 1fr)) 18px; } .sr-chart .h { font-size: 11px; } .sr-chart .l span { font-size: 11px; } }
</style>`);

function renderSerie(k) {
  srClose();
  const all = srAll();
  if (k && all.some(g => g.k === k)) { if (k !== srSel) srZ = ''; srSel = k; }
  if (!all.some(g => g.k === srSel)) srSel = all.length ? all[0].k : '';
  const v = document.getElementById('viewSerie'), brands = [...new Set(all.map(g => g.b))];
  v.innerHTML = `<div class="sr">
    <div class="sr-top"><h2>Serie</h2>
      <div class="sr-kpi"><span><b>${all.length}</b> serie</span><span><b>${all.reduce((a, g) => a + g.nc, 0)}</b> colori e decori</span><span><b>${brands.length}</b> marche</span></div>
      <div class="sr-tacts"><button class="btn red" id="srCatBtn" onclick="srCatalog()"></button><button class="btn" id="srPdfAll" onclick="srPdfList()"></button></div></div>
    <aside class="sr-side"><div class="sr-tools"><input id="srSearch" placeholder="Cerca serie, colore o codice…" value="${esc(srQ)}">
      <select onchange="srBrand = this.value; srList()"><option value="">Tutte le marche</option>${brands.map(b => `<option${b === srBrand ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>
      <div class="sr-sel" id="srSelBar"></div>
      <div class="sr-list" id="srList"></div></aside>
    <main class="sr-main" id="srMain"></main></div>`;
  document.getElementById('srSearch').addEventListener('input', e => { srQ = e.target.value; srList(); });
  srList(); srShow();
  // la serie scelta visibile nell'elenco (scorre solo l'elenco, non la pagina)
  const on = document.querySelector('.sr-row.on'), ls = document.getElementById('srList');
  if (on && ls && on.offsetTop > ls.clientHeight - 60) ls.scrollTop = on.offsetTop - ls.clientHeight / 2;
}
function srFiltered(all) {
  const q = normTxt(srQ).split(' ').filter(Boolean);
  return (all || srAll()).filter(g => (!srBrand || g.b === srBrand) && q.every(w => g.txt.includes(w)));
}
function srList() {
  const el = document.getElementById('srList'); if (!el) return;
  const all = srAll(), list = srFiltered(all); let lastB = '';
  el.innerHTML = list.map(g => {
    const th = srMini(g.list.find(x => x.z === '60x120' && hasPhoto(x)) || g.list.find(hasPhoto)), nz = new Set(g.list.map(x => x.z)).size;
    const h = g.b !== lastB ? `<div class="sr-bh">${esc(g.b)}</div>` : ''; lastB = g.b;
    return h + `<div class="sr-row${g.k === srSel ? ' on' : ''}${srMark.has(g.k) ? ' mk' : ''}" data-k="${esc(g.k)}" onclick="srPick(this.dataset.k)">
      <span class="ck" onclick="event.stopPropagation(); srMarkToggle(this.parentNode.dataset.k)" title="Scegli per il catalogo e il PDF"><svg class="ic"><use href="#i-check"/></svg></span>
      <span class="th" style="${th ? `background-image:url('${esc(th)}')` : ''}"></span>
      <span class="tx"><span class="n">${esc(glTitle(g.s))}${g.nuovo ? ' <span class="nwb">NOVITÀ</span>' : ''}</span><span class="m">${srColN(g.nc)} · ${nz} ${nz === 1 ? 'formato' : 'formati'}</span></span></div>`;
  }).join('') || '<div class="sr-empty">Nessuna serie trovata.</div>';
  srBtns(all, list);
}
/* ── serie scelte (spunta nell'elenco): il catalogo e il PDF mostrano solo quelle; senza spunte tutte quelle dell'elenco ── */
const srMark = new Set(Array.isArray(ui.srMark) ? ui.srMark : []);
function srMarkSave() { ui.srMark = [...srMark]; saveUI(); }
function srMarkToggle(k) {
  if (srMark.has(k)) srMark.delete(k); else srMark.add(k);
  srMarkSave();
  document.querySelectorAll('.sr-row').forEach(r => r.classList.toggle('mk', srMark.has(r.dataset.k)));
  srBtns();
  if (k === srSel) srShow();
}
/* tutte quelle dell'elenco (con ricerca e marca) oppure nessuna */
function srMarkAll(on) {
  if (on) srFiltered().forEach(g => srMark.add(g.k)); else srMark.clear();
  srMarkSave(); srList(); srShow();
}
function srChoice() {
  const all = srAll(), mk = all.filter(g => srMark.has(g.k));
  if (mk.length) return { keys: mk.map(g => g.k), label: 'Serie scelte', n: mk.length };
  return { keys: srFiltered(all).map(g => g.k), label: srBrand || (srQ.trim() ? 'Ricerca ' + srQ.trim() : 'Tutte le marche'), n: 0 };
}
function srBtns(all, list) {
  all = all || srAll(); list = list || srFiltered(all);
  const ch = srChoice(), n = ch.n, N = ch.keys.length;
  const lab = n ? (n === 1 ? 'della serie scelta' : `delle ${n} scelte`) : N === all.length ? 'di tutte le serie' : N === 1 ? 'di 1 serie' : `di ${N} serie`;
  const sb = document.getElementById('srSelBar');
  if (sb) sb.innerHTML = n ? `<span><b>${n}</b> ${n === 1 ? 'serie scelta' : 'serie scelte'}</span><span class="sp"></span>${list.some(g => !srMark.has(g.k)) ? '<button onclick="srMarkAll(true)">Scegli tutte</button>' : ''}<button onclick="srMarkAll(false)">Togli le spunte</button>`
    : `<span>Spunta le serie che vuoi nel catalogo e nel PDF</span><span class="sp"></span>${list.length ? '<button onclick="srMarkAll(true)">Tutte</button>' : ''}`;
  const c = document.getElementById('srCatBtn'), b = document.getElementById('srPdfAll');
  if (c) { c.disabled = !N; c.innerHTML = `<svg class="ic"><use href="#i-image"/></svg> Catalogo ${lab}`; }
  if (b) { b.disabled = !N; b.innerHTML = `<svg class="ic"><use href="#i-download"/></svg> PDF ${lab}`; }
}
function srPick(k) {
  if (k !== srSel) srZ = '';
  srSel = k;
  history.replaceState(null, '', '#/serie/' + encodeURIComponent(k));
  document.querySelectorAll('.sr-row').forEach(r => r.classList.toggle('on', r.dataset.k === k));
  srShow();
  const m = document.getElementById('srMain'); if (m) m.scrollTop = 0;
  if (innerWidth <= 760 && m) m.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function srShow() {
  const el = document.getElementById('srMain'); if (!el) return;
  const g = srAll().find(x => x.k === srSel);
  if (!g) { el.innerHTML = '<div class="sr-empty">Nessuna serie.</div>'; srCur = null; return; }
  const grs = srGroups(g), inf = srInfo(g, grs);
  if (srZ && !inf.zs.includes(srZ)) srZ = '';
  // filtro formato: solo i colori che ce l'hanno e solo le righe di quel formato
  const vis = grs.map(gr => Object.assign({}, gr, { cols: gr.cols.filter(e => !srZ || e.list.some(x => x.z === srZ))
    .map(e => !srZ ? e : Object.assign({}, e, { rows: e.rows.filter(r => r.z === srZ), ph: e.list.find(x => x.z === srZ && hasPhoto(x)) || e.ph })) })).filter(gr => gr.cols.length);
  srCur = { g, cols: vis.flatMap(gr => gr.cols.map(e => Object.assign({ grp: gr.title, many: grs.length > 1 }, e))) };
  const zN = z => grs.reduce((a, gr) => a + gr.cols.filter(e => e.list.some(x => x.z === z)).length, 0), ch = srChart(vis);
  let i = 0;
  const card = e => { const n = i++, u = e.ph ? glPhoto(e.ph) : '', zz = [...new Set(e.rows.map(r => r.z))].map(fmt).join(' · ');
    return `<div class="sr-card" onclick="srOpen(${n})"><div class="im">${u ? `<img loading="lazy" src="${esc(u)}" alt="">` : '<span class="no"><svg class="ic"><use href="#i-camera"/></svg></span>'}</div>
      <div class="tx"><b>${esc(e.name)}</b><div class="z">${esc(zz)}</div></div></div>`; };
  const tr = e => { const n = i++;
    return e.rows.map((r, ri) => `<tr class="${ri ? '' : 'c1'}" onclick="srOpen(${n})"><td>${ri ? '' : `<span class="cn"><i style="${e.ph ? `background-image:url('${esc(srMini(e.ph))}')` : ''}"></i>${esc(e.name)}</span>`}</td>
      <td class="z">${esc(fmt(r.z))}</td><td>${esc(r.f || '—')}</td><td class="z">${r.t ? esc(r.t) + ' mm' : '—'}</td><td class="k">${esc(r.k || '—')}</td></tr>`).join(''); };
  el.innerHTML = `<div class="sr-head"><div class="who"><div class="br">${esc(g.b)}${g.nuovo ? ' <span class="nwb">NOVITÀ</span>' : ''}</div><h3>${esc(glTitle(g.s))}</h3>
      <div class="meta"><b>${srColN(inf.nC)}</b>${grs.length > 1 ? ` in ${grs.length} gruppi: ${esc(grs.map(gr => gr.title).join(', '))}` : ''}<br>
        <b>Formati:</b> ${esc(inf.zs.map(fmt).join(' · '))}${inf.fins.length ? `<br><b>Finiture:</b> ${esc(inf.fins.join(' · '))}` : ''}${inf.ths.length ? `<br><b>Spessori:</b> ${esc(inf.ths.join(' · '))} mm` : ''}</div></div>
    <div class="acts"><button class="btn${srMark.has(g.k) ? ' dark' : ''}" onclick="srMarkToggle(srSel)" title="Le serie scelte vanno nel catalogo e nel PDF"><svg class="ic"><use href="#i-${srMark.has(g.k) ? 'check' : 'plus'}"/></svg> ${srMark.has(g.k) ? 'Scelta' : 'Scegli'}</button>
      <button class="btn red" onclick="srPdf([srSel])"><svg class="ic"><use href="#i-download"/></svg> PDF della serie</button>
      <button class="btn" onclick="srCampiona()" title="Apre gli Espositori con i colori di questa serie"><svg class="ic"><use href="#i-grid"/></svg> Campiona</button></div></div>
    <div class="sr-bar">${inf.zs.length > 1 ? `<button class="sr-chip${srZ ? '' : ' on'}" onclick="srZ = ''; srShow()">Tutti i formati</button>${inf.zs.map(z => `<button class="sr-chip${srZ === z ? ' on' : ''}" data-z="${esc(z)}" onclick="srZ = this.dataset.z; srShow()" title="${srColN(zN(z))}">${esc(fmt(z))}</button>`).join('')}` : ''}
      <span class="sp"></span><span class="sr-seg"><button class="sr-chip${srMode === 'foto' ? ' on' : ''}" onclick="srMode = 'foto'; srShow()"><svg class="ic"><use href="#i-image"/></svg> Foto</button>
      <button class="sr-chip${srMode === 'tab' ? ' on' : ''}" onclick="srMode = 'tab'; srShow()"><svg class="ic"><use href="#i-grid"/></svg> Codici</button></span></div>
    ${srMode === 'tab'
      ? `<div class="sr-tw"><table class="sr-tab"><thead><tr><th>Colore</th><th>Formato</th><th>Finitura</th><th>Spessore</th><th>Codice</th></tr></thead><tbody>${vis.map(gr =>
          (grs.length > 1 ? `<tr class="gh"><td colspan="5">${esc(gr.title)}<span>${srColN(gr.cols.length)}</span></td></tr>` : '') + gr.cols.map(tr).join('')).join('')}</tbody></table></div>`
      : (ch ? `<div class="sr-grp"><h5>Cartella colori <span>${esc(ch.sum)}</span></h5>${srChartHTML(ch)}</div>` : '')
        + vis.map(gr => `<div class="sr-grp">${grs.length > 1 ? `<h5>${esc(gr.title)} <span>${srColN(gr.cols.length)}</span></h5>` : ''}<div class="sr-cards">${gr.cols.map(card).join('')}</div></div>`).join('')}`;
}

/* ── foto grande di un colore, con tutti i suoi formati, finiture e codici (frecce: colore prima / dopo) ── */
function srOpen(n) {
  if (!srCur || !srCur.cols[n]) return;
  srIdx = n;
  let m = document.getElementById('srFull');
  if (!m) {
    // dentro il catalogo, se è aperto (a schermo intero si vede solo quello)
    (document.getElementById('srCat') || document.body).insertAdjacentHTML('beforeend', '<div class="modal open" id="srFull"></div>');
    m = document.getElementById('srFull'); m.addEventListener('click', e => { if (e.target === m) srClose(); });
  }
  const e = srCur.cols[n], g = srCur.g, N = srCur.cols.length, u = e.ph ? glPhoto(e.ph, true) : '';
  m.innerHTML = `<div class="mbox"><div class="mhead"><h3>${esc(glTitle(g.s))}</h3><span class="sr-cnt">${n + 1} / ${N}</span>
      <button class="btn" onclick="srOpen(srIdx - 1)"${n ? '' : ' disabled'} title="Colore prima"><svg class="ic"><use href="#i-cleft"/></svg></button>
      <button class="btn" onclick="srOpen(srIdx + 1)"${n < N - 1 ? '' : ' disabled'} title="Colore dopo"><svg class="ic"><use href="#i-cright"/></svg></button>
      <button class="btn" onclick="srClose()"><svg class="ic"><use href="#i-x"/></svg> Chiudi</button></div>
    <div class="sr-fb"><div class="sr-ph">${u ? `<img src="${esc(u)}" alt="">` : 'Foto non disponibile'}</div>
      <div><div class="br">${esc(g.b)}</div><h4>${esc(e.full)}</h4><div class="gr">${e.many ? esc(e.grp) + ' · ' : ''}${e.all.length} ${e.all.length === 1 ? 'articolo' : 'articoli'}</div>
        <table class="sr-tab"><thead><tr><th>Formato</th><th>Finitura</th><th>Spessore</th><th>Codice</th></tr></thead><tbody>${e.all.map(r =>
          `<tr><td class="z">${esc(fmt(r.z))}</td><td>${esc(r.f || '—')}</td><td class="z">${r.t ? esc(r.t) + ' mm' : '—'}</td><td class="k">${esc(r.k || '—')}</td></tr>`).join('')}</tbody></table></div></div></div>`;
}
function srClose() { const m = document.getElementById('srFull'); if (m) m.remove(); }
document.addEventListener('keydown', e => {
  if (!document.getElementById('srFull')) return;
  if (!['Escape', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  e.preventDefault();                                     // il catalogo sotto non cambia serie
  if (e.key === 'Escape') srClose(); else if (e.key === 'ArrowRight') srOpen(srIdx + 1); else srOpen(srIdx - 1);
});
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/serie')) { srClose(); srCatClose(); } });

/* Campiona: apre gli Espositori con un espositore adatto e la ricerca già sulla serie */
function srCampiona() {
  const g = srAll().find(x => x.k === srSel); if (!g) return;
  const ss = expandFin(g.list), ok = d => d.slots && d.mode !== 'box' && !d.accept.tozzetto && ss.some(s => accepts(d, s));
  const d = (DISP[ui.disp] && ok(DISP[ui.disp]) ? DISP[ui.disp] : null) || DISPLAYS.find(ok);
  if (!d) return say('Nessun espositore accetta i formati di questa serie.');
  ui.client = ''; ui.returnTo = '#/serie/' + encodeURIComponent(g.k); ui.disp = d.id; saveUI();
  searchQ = g.s; brandFilter = ''; fmtFilter = ''; surfFilter = ''; thickFilter = ''; onlyPhoto = false;
  go('#/espositori');
  setTimeout(() => toast(`${d.name}: i colori della serie sono nei Campioni compatibili. Puoi cambiare espositore dalla lista.`), 400);
}

/* ════ PDF ════ A4 verticale: per ogni serie il titolo con colori, formati, finiture e spessori, poi i gruppi con i colori
   (4 per riga): foto, nome e una riga per formato e finitura con lo spessore e il codice. Con più serie: copertina con l'indice
   (si tocca il nome per andare alla pagina). Foto quadrate da 300 px, prese dalle foto della galleria. */
const srFin = f => String(f || '').replace(/\s·\s[\d,]+ mm$/, '').replace(/\s*Rett\./, '').replace(/Naturale/i, 'Nat').replace(/Lappat[oa]/i, 'Lapp')
  .replace(/Levigat[oa]/i, 'Lev').replace(/Strutturat[oa]/i, 'Strutt');
/* foto tagliata al centro con il rapporto ar (larghezza / altezza), lato lungo al massimo px */
async function srJpeg(u, px, ar = 1) {
  const im = u && await schLoadImg(u); if (!im) return '';
  const iw = im.naturalWidth, ih = im.naturalHeight;
  let sw = iw, sh = iw / ar; if (sh > ih) { sh = ih; sw = ih * ar; }
  const k = Math.min(1, px / Math.max(sw, sh)), W = Math.max(1, Math.round(sw * k)), H = Math.max(1, Math.round(sh * k));
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high';
  c.drawImage(im, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, W, H);
  const d = cv.toDataURL('image/jpeg', 0.82); cv.width = cv.height = 0;
  return d;
}
function srPdfList() { const ch = srChoice(); return srPdf(ch.keys, ch.label); }
async function srPdf(keys, label) {
  const all = srAll(), list = keys.map(k => all.find(g => g.k === k)).filter(Boolean), multi = list.length > 1;
  if (!list.length) return toast('Nessuna serie da esportare');
  const data = list.map(g => { const grs = srGroups(g); return { g, grs, inf: srInfo(g, grs), ch: srChart(grs) }; }), cols = data.flatMap(d => d.grs.flatMap(gr => gr.cols));
  if (list.length > 5) {
    const nf = cols.filter(e => e.ph).length, sec = nf / 6, mb = Math.max(1, Math.round(nf * 0.03));   // ogni foto due volte: elenco e cartella colori
    if (!await ask(`Il PDF di ${list.length} serie ha ${cols.length} colori e decori (${nf} con la foto).\n\nCi vuole ${sec < 50 ? 'meno di un minuto' : 'circa ' + Math.ceil(sec / 60) + ' minuti'} e il file sarà di circa ${mb} MB.`, { ok: 'Crea il PDF' })) return;
  }
  const wait = document.createElement('div'); wait.className = 'sch-wait'; wait.textContent = 'Preparo il PDF…'; document.body.appendChild(wait);
  try {
    await loadPdfLibs();
    const [logo, mark] = await Promise.all(['img/prop_logo.png', 'img/prop_mark.png'].map(schLoadImg));
    // foto: 6 alla volta; quadrate per l'elenco, verticali (3:5) per la cartella colori
    const jobs = cols.filter(e => e.ph).map(e => [e, 'jpg', 1]);
    data.forEach(d => d.ch && d.ch.blocks.forEach(bk => bk.rows.forEach(r => r.cells.forEach(e => { if (e && e.ph) jobs.push([e, 'jpgT', 0.6]); }))));
    let next = 0, done = 0;
    const work = async () => { while (next < jobs.length) { const [e, f, ar] = jobs[next++]; e[f] = await srJpeg(glPhoto(e.ph), 300, ar);
      if (++done % 6 === 0 || done === jobs.length) wait.textContent = `Preparo le foto: ${done} di ${jobs.length}…`; } };
    await Promise.all(Array.from({ length: 6 }, work));
    wait.textContent = 'Creo il PDF…'; await new Promise(r => setTimeout(r, 30));

    const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const W = 210, H = 297, M = 12, CW = W - 2 * M, NC = 4, GAP = 4, colW = (CW - GAP * (NC - 1)) / NC, BOT = H - 15;
    const INK = [24, 24, 27], MID = [118, 114, 108], TXT = [78, 75, 70], RED = [176, 16, 26], LINE = [226, 222, 214];
    const font = (sz, b) => { pdf.setFont('helvetica', b ? 'bold' : 'normal'); pdf.setFontSize(sz); }, col = c => pdf.setTextColor(...c);
    const now = new Date(), p2 = n => String(n).padStart(2, '0'), today = `${p2(now.getDate())}.${p2(now.getMonth() + 1)}.${now.getFullYear()}`;
    let fresh = true, y = 0, imgN = 0;
    const addPage = foot => {
      if (fresh) fresh = false; else pdf.addPage('a4', 'portrait');
      font(7); col(MID); pdf.text(foot ? foot + '  ·  ' + today : today, M, H - 8); pdf.text(String(pdf.getNumberOfPages()), W - M, H - 8, { align: 'right' });
    };
    const rule = (yy, c, w) => { pdf.setDrawColor(...c); pdf.setLineWidth(w); pdf.line(M, yy, W - M, yy); };
    // titolo della serie (prima pagina) o titolo corto con "segue"
    const head = d => {
      addPage(glTitle(d.g.s)); d.page = pdf.getNumberOfPages();
      if (mark) pdf.addImage(mark, 'PNG', W - M - 10, 9.5, 10, 10 * mark.naturalHeight / mark.naturalWidth, 'mark', 'SLOW');
      font(8, true); col(RED); pdf.text(d.g.b.toUpperCase() + (d.g.nuovo ? '  ·  NOVITÀ' : ''), M, 14.5, { charSpace: 0.5 });
      const t = glTitle(d.g.s); font(24, true); col(INK); if (pdf.getTextWidth(t) > CW - 16) pdf.setFontSize(24 * (CW - 16) / pdf.getTextWidth(t)); pdf.text(t, M, 24.5);
      const inf = d.inf, lines = [srColN(inf.nC) + (d.grs.length > 1 ? ` in ${d.grs.length} gruppi: ${d.grs.map(gr => gr.title).join(', ')}` : ''),
        'Formati: ' + inf.zs.map(fmt).join(' · '), inf.fins.length ? 'Finiture: ' + inf.fins.join(' · ') : '', inf.ths.length ? 'Spessori: ' + inf.ths.join(' · ') + ' mm' : ''].filter(Boolean);
      font(8.5); col(TXT); y = 31;
      lines.forEach(l => pdf.splitTextToSize(l, CW).forEach(s => { pdf.text(s, M, y); y += 3.9; }));
      rule(y, INK, 0.35); y += 5;
    };
    const cont = d => {
      addPage(glTitle(d.g.s));
      font(7.5, true); col(RED); pdf.text(d.g.b.toUpperCase(), M, 13.5, { charSpace: 0.5 });
      const t = glTitle(d.g.s); font(12, true); col(INK); pdf.text(t, M, 19.5); const w = pdf.getTextWidth(t);
      font(8); col(MID); pdf.text('segue', M + w + 2.5, 19.5);
      rule(22.5, INK, 0.35); y = 28;
    };
    const gTitle = (gr, more) => {
      font(10, true); col(INK); pdf.text(gr.title, M, y + 3.5); const w = pdf.getTextWidth(gr.title);
      font(7.5); col(MID); pdf.text(more ? 'segue' : srColN(gr.cols.length), M + w + 2.5, y + 3.5);
      rule(y + 5.5, LINE, 0.2); y += 8.5;
    };
    // un colore: misura (righe di testo) e disegno
    const lay = e => {
      font(8, true); const nl = pdf.splitTextToSize(e.name, colW).slice(0, 2);
      const rl = e.rows.map(r => {
        font(6.4, true); const cw = r.k ? pdf.getTextWidth(r.k) + 1.6 : 0;
        // si va a capo solo tra formato, finitura e spessore (mai dentro "9,5 mm")
        font(6.4); return { k: r.k, lines: pdf.splitTextToSize([fmt(r.z), srFin(r.f), r.t ? r.t + ' mm' : ''].filter(Boolean).map(t => t.replace(/ /g, '\u00a0')).join(' · '), colW - cw) };
      });
      return { nl, rl, h: colW + 3.6 + (nl.length - 1) * 3.3 + 3.1 + rl.reduce((a, r) => a + r.lines.length, 0) * 2.75 };
    };
    const draw = (e, L, x, y0) => {
      if (e.jpg) pdf.addImage(e.jpg, 'JPEG', x, y0, colW, colW, 'f' + (++imgN));
      else { pdf.setFillColor(242, 239, 234); pdf.rect(x, y0, colW, colW, 'F'); font(6.5); col(MID); pdf.text('foto non disponibile', x + colW / 2, y0 + colW / 2, { align: 'center' }); }
      pdf.setDrawColor(...LINE); pdf.setLineWidth(0.15); pdf.rect(x, y0, colW, colW, 'S');
      let yy = y0 + colW + 3.6; font(8, true); col(INK); L.nl.forEach((l, i) => { if (i) yy += 3.3; pdf.text(l, x, yy); });
      yy += 3.1;
      L.rl.forEach(r => r.lines.forEach((l, i) => {
        font(6.4); col(TXT); pdf.text(l, x, yy);
        if (!i && r.k) { font(6.4, true); col(INK); pdf.text(r.k, x + colW, yy, { align: 'right' }); }
        yy += 2.75;
      }));
    };
    // cartella colori: colori in colonna (nome sopra), varianti in riga (nome di lato, dall'alto in basso), a blocchi di 6;
    // riquadri 3:5 che si stringono se il blocco non sta in una pagina
    const chart = d => {
      const ch = d.ch; if (!ch) return;
      const G = 1.2, LW = 6, HD = 5;
      let top = true;
      ch.blocks.forEach(bk => {
        const NR = bk.rows.length;
        for (let a = 0; a < bk.cols.length; a += 6) {
          const cs = bk.cols.slice(a, a + 6), n = cs.length;
          // larghezza dei riquadri che fa stare il blocco fino in fondo alla pagina; se diventano troppo stretti, pagina nuova
          const fit = () => ((BOT - y - (top ? 9 : 0) - HD - G * (NR - 1)) / NR) * 0.6;
          let cw = Math.min(30, (CW - LW - G * n) / n);
          if (fit() < cw * 0.7) cont(d);
          cw = Math.min(cw, fit());
          const rh = cw / 0.6, x0 = M + Math.max(0, (CW - n * (cw + G) - LW) / 2);   // al centro della pagina
          if (top) { font(10, true); col(INK); pdf.text('Cartella colori', M, y + 3.5); const w = pdf.getTextWidth('Cartella colori');
            font(7.5); col(MID); pdf.text(ch.sum, M + w + 2.5, y + 3.5); rule(y + 5.5, LINE, 0.2); y += 9; top = false; }
          font(7.5, true); col(INK);
          cs.forEach((c, i) => pdf.text(pdf.splitTextToSize(c.name, cw)[0], x0 + i * (cw + G) + cw / 2, y + 3, { align: 'center' }));
          y += HD;
          bk.rows.forEach(r => {
            r.cells.slice(a, a + 6).forEach((e, i) => {
              const x = x0 + i * (cw + G);
              if (e && e.jpgT) pdf.addImage(e.jpgT, 'JPEG', x, y, cw, rh, 't' + (++imgN));
              else { pdf.setFillColor(242, 239, 234); pdf.rect(x, y, cw, rh, 'F'); }
            });
            // nome della variante di lato, girato (si legge dall'alto in basso)
            font(7.5, true); col(INK); const t = pdf.splitTextToSize(r.title, rh - 2)[0], tw = pdf.getTextWidth(t);
            pdf.text(t, x0 + n * (cw + G) + 1.4, y + rh / 2 - tw / 2, { angle: -90 });
            y += rh + G;
          });
          y += 5;
        }
      });
      y += 2;
    };
    // con più serie: copertina e indice prima (le pagine si scrivono alla fine)
    const ent = [];
    if (multi) { let lb = ''; data.forEach(d => { if (d.g.b !== lb) { if (lb) ent.push({ sp: 1 }); ent.push({ b: d.g.b }); lb = d.g.b; } ent.push({ d }); }); }
    const LH = 4.7, Y1 = 98, YN = 26, per1 = Math.floor((BOT - Y1) / LH), perN = Math.floor((BOT - YN) / LH);
    const nIdx = multi ? 1 + Math.max(0, Math.ceil((ent.length - 2 * per1) / (2 * perN))) : 0;
    for (let i = 0; i < nIdx; i++) addPage('Indice');
    for (const d of data) {
      head(d); chart(d);
      const many = d.grs.length > 1;
      d.grs.forEach(gr => {
        const Ls = gr.cols.map(lay);
        for (let i = 0; i < gr.cols.length; i += NC) {
          const rowH = Math.max(...Ls.slice(i, i + NC).map(L => L.h)), first = i === 0;
          if (y + rowH + (first && many ? 8.5 : 0) > BOT) { cont(d); if (many) gTitle(gr, !first); }
          else if (first && many) gTitle(gr, false);
          gr.cols.slice(i, i + NC).forEach((e, j) => draw(e, Ls[i + j], M + j * (colW + GAP), y));
          y += rowH + 4;
        }
        y += 2;
      });
    }
    if (multi) {
      // copertina: logo, titolo, quante serie e colori; poi l'indice su due colonne
      pdf.setPage(1);
      if (logo) pdf.addImage(logo, 'PNG', (W - 96) / 2, 22, 96, 96 * logo.naturalHeight / logo.naturalWidth, 'logo', 'SLOW');
      pdf.setDrawColor(150, 150, 150); pdf.setLineWidth(0.25); pdf.setLineDashPattern([1.2, 0.9], 0);
      pdf.line(M, 52, W - M, 52); pdf.line(M, 88, W - M, 88); pdf.setLineDashPattern([], 0);
      font(26, true); col(INK); pdf.text('SERIE', W / 2, 66, { align: 'center', charSpace: 1 });
      font(12); col(TXT); pdf.text(label || 'Tutte le marche', W / 2, 74, { align: 'center' });
      font(9); col(MID); pdf.text(`${list.length} serie  ·  ${cols.length} colori e decori  ·  ${today}`, W / 2, 81, { align: 'center' });
      let pg = 1, ci = 0, n = 0, per = per1, y0 = Y1;
      ent.forEach(en => {
        if (en.b && n >= per - 1) n = per;   // il nome della marca non resta da solo in fondo alla colonna
        if (n >= per) { n = 0; if (++ci > 1) { ci = 0; pg++; pdf.setPage(pg); per = perN; y0 = YN; font(12, true); col(INK); pdf.text('Indice', M, 17); rule(20, INK, 0.35); } }
        if (en.sp && n === 0) return;
        const x0 = M + ci * (CW / 2 + 3), yy = y0 + n * LH, cw = CW / 2 - 3; n++;
        if (en.sp) return;
        if (en.b) { font(7.5, true); col(RED); pdf.text(en.b.toUpperCase(), x0, yy, { charSpace: 0.5 }); return; }
        const t = glTitle(en.d.g.s); font(9); col(INK); pdf.text(t, x0, yy); const w = pdf.getTextWidth(t);
        font(7); col(MID); pdf.text(srColN(en.d.inf.nC), x0 + w + 2, yy);
        font(9, true); col(INK); pdf.text(String(en.d.page), x0 + cw, yy, { align: 'right' });
        pdf.link(x0, yy - 3.6, cw, LH, { pageNumber: en.d.page });
      });
    }
    const safe = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '');
    const ymd = `${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}`;
    schDeliver(pdf, multi ? `${ymd}_Serie_${safe(label === 'Tutte le marche' ? 'Tutte' : label === 'Serie scelte' ? 'Scelte' : label) || 'Tutte'}.pdf` : `${ymd}_${safe(glTitle(list[0].s))}_Serie.pdf`, multi ? 'Il PDF delle serie è pronto' : 'Il PDF della serie è pronto');
  } catch (err) { console.error(err); toast('PDF non riuscito: riprova'); }
  finally { wait.remove(); }
}

/* ════ CATALOGO DIGITALE ════ le serie scelte (o tutte quelle dell'elenco) a tutto schermo, una alla volta:
   copertina con l'indice, poi per ogni serie le foto grandi, i numeri, i formati disegnati in proporzione (si toccano per
   vedere solo i colori di quel formato) e i colori per gruppo; tocca un colore per la foto grande con i codici.
   Frecce ← → (o i pulsanti in fondo) per la serie prima / dopo; si può mettere a schermo intero per mostrarlo al cliente. */
document.head.insertAdjacentHTML('beforeend', `<style>
#srCat { position: fixed; inset: 0; z-index: 90; background: #f7f5f1; display: flex; flex-direction: column; color: #1a1a1c; }
.ct-bar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fbfaf7; border-bottom: 1px solid #e7e3db; flex: none; }
.ct-x, .ct-ic { border: 1px solid #e0dbd2; background: #fff; border-radius: 999px; height: 36px; padding: 0 14px; display: inline-flex; align-items: center; gap: 6px; font: 600 13px var(--font-body); cursor: pointer; color: #1a1a1c; flex: none; }
.ct-x:hover, .ct-ic:hover { border-color: #c9c3b8; }
.ct-ic { padding: 0 11px; }
.ct-x .ic, .ct-ic .ic { width: 16px; height: 16px; }
.ct-tabs { flex: 1; display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; min-width: 0; }
.ct-tabs::-webkit-scrollbar { display: none; }
.ct-tab { flex: none; border: 0; background: transparent; border-radius: 999px; height: 36px; padding: 0 14px 0 5px; display: inline-flex; align-items: center; gap: 8px; font: 600 13px var(--font-body); color: #55524c; cursor: pointer; white-space: nowrap; }
.ct-tab i { width: 26px; height: 26px; border-radius: 50%; background: #e6e1d8 center / cover no-repeat; flex: none; }
.ct-tab .ic { width: 16px; height: 16px; margin-left: 8px; }
.ct-tab:hover { background: #efebe4; }
.ct-tab.on { background: #1a1a1c; color: #fff; }
.ct-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.ct-wrap { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
.ct-eyebrow { font: 700 11.5px var(--font-body); letter-spacing: .22em; text-transform: uppercase; color: #b0101a; }
.ct-eyebrow .nwb { letter-spacing: .1em; margin-left: 6px; }
/* copertina e indice */
.ct-cv { text-align: center; padding: 54px 20px 38px; }
.ct-cv img { height: 42px; display: inline-block; }
.ct-cv .ct-eyebrow { margin-top: 30px; }
.ct-cv h1 { font: 700 clamp(52px, 9vw, 118px)/.92 var(--font-display); letter-spacing: -.05em; margin: 10px 0 16px; }
.ct-cv p { color: #6b6760; font-size: 15px; margin: 0; }
.ct-strip { display: grid; grid-template-columns: repeat(8, 1fr); height: clamp(120px, 20vw, 250px); }
.ct-strip span { background: #e6e1d8 center / cover no-repeat; }
.ct-index { padding-top: 30px; padding-bottom: 80px; }
.ct-index h3 { font: 700 11.5px var(--font-body); letter-spacing: .2em; text-transform: uppercase; color: #8d877d; margin: 34px 0 16px; padding-bottom: 10px; border-bottom: 1px solid #e2ddd4; }
.ct-igrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 30px 22px; }
.ct-icard { border: 0; padding: 0; background: none; text-align: left; cursor: pointer; font: inherit; color: inherit; }
.ct-icard .im { display: block; aspect-ratio: 4 / 3; border-radius: 14px; background: #e6e1d8 center / cover no-repeat; transition: transform .35s ease, box-shadow .35s ease; }
.ct-icard:hover .im { transform: translateY(-4px); box-shadow: 0 16px 34px rgba(30,25,15,.16); }
.ct-icard .br { display: block; font: 700 10.5px var(--font-body); letter-spacing: .16em; text-transform: uppercase; color: #b0101a; margin-top: 13px; }
.ct-icard b { display: block; font: 700 20px/1.15 var(--font-display); letter-spacing: -.02em; margin-top: 3px; }
.ct-icard .m { display: block; font-size: 12.5px; color: #6b6760; margin-top: 4px; }
/* pagina della serie */
.ct-hero { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 44px; align-items: center; padding: 46px 0 34px; }
.ct-hero h1 { font: 700 clamp(42px, 6vw, 86px)/.94 var(--font-display); letter-spacing: -.045em; margin: 12px 0 26px; overflow-wrap: anywhere; }
.ct-facts { display: flex; gap: 30px; flex-wrap: wrap; padding: 18px 0; border-top: 1px solid #e2ddd4; border-bottom: 1px solid #e2ddd4; }
.ct-facts b { display: block; font: 700 28px/1.1 var(--font-display); letter-spacing: -.02em; }
.ct-facts span { font-size: 12px; color: #6b6760; }
.ct-fin { font-size: 13.5px; line-height: 1.55; color: #3d3a35; margin: 16px 0 0; }
.ct-fin span { display: block; font: 700 10.5px var(--font-body); letter-spacing: .16em; text-transform: uppercase; color: #8d877d; margin-bottom: 3px; }
.ct-mosaic { display: grid; gap: 8px; height: clamp(300px, 40vw, 540px); grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
.ct-mosaic span { background: #e6e1d8 center / cover no-repeat; border-radius: 14px; }
.ct-mosaic.n1 span { grid-row: 1 / 3; grid-column: 1 / 3; }
.ct-mosaic.n2 span { grid-row: 1 / 3; }
.ct-mosaic.n3 span:first-child { grid-row: 1 / 3; }
.ct-mosaic.n0 { display: none; }
.ct-sh { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin: 0 0 18px; }
.ct-sh h2 { font: 400 36px/1.1 var(--font-body); letter-spacing: -.025em; margin: 0; }
.ct-sh span { color: #8d877d; font-size: 13px; }
.ct-fmts { padding: 30px 0 6px; }
.ct-fz-row { display: flex; align-items: flex-end; gap: 14px 18px; flex-wrap: wrap; }
.ct-fz { border: 0; background: none; padding: 10px 10px 8px; border-radius: 12px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 9px; font: inherit; color: inherit; }
.ct-fz i { display: block; background: #ddd7cc center / cover no-repeat; box-shadow: 0 1px 0 rgba(0,0,0,.05), 0 6px 14px rgba(30,25,15,.13); border-radius: 2px; }
.ct-fz i.all { width: 34px; height: 34px; background: repeating-linear-gradient(90deg, #cfc8bb 0 10px, transparent 10px 12px), #f7f5f1; box-shadow: none; border-radius: 3px; }
.ct-fz span { font: 600 12.5px var(--font-body); color: #55524c; white-space: nowrap; }
.ct-fz small { font-size: 11px; color: #9a948a; margin-top: -6px; }
.ct-fz:hover { background: #efebe4; }
.ct-fz.on { background: #1a1a1c; }
.ct-fz.on span { color: #fff; }
.ct-fz.on small { color: #bdb7ad; }
.ct-grp { padding: 34px 0 4px; }
.ct-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 28px 20px; }
.ct-card { border: 0; padding: 0; background: none; text-align: left; cursor: zoom-in; font: inherit; color: inherit; min-width: 0; }
.ct-card .im { display: block; aspect-ratio: 1; overflow: hidden; background: #e6e1d8; box-shadow: 0 2px 10px rgba(30,25,15,.10); }
.ct-card .im img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .6s ease; }
.ct-card:hover .im img { transform: scale(1.04); }
.ct-card .im .no { display: flex; height: 100%; align-items: center; justify-content: center; color: #a39d92; font-size: 12px; }
.ct-card .nm { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 13px; }
.ct-card b { font: 400 17px/1.25 var(--font-body); letter-spacing: -.005em; min-width: 0; }
.ct-card:hover b { text-decoration: underline; text-underline-offset: 3px; }
.ct-card .ar { width: 20px; height: 20px; flex: none; }
.ct-card small { display: block; font-size: 12px; color: #8a857c; margin-top: 3px; line-height: 1.4; }
.ct-chart .sr-chart { max-width: min(100%, calc(var(--n) * 175px + 28px)); }
.ct-pn { display: flex; justify-content: space-between; gap: 16px; padding: 40px 0 64px; margin-top: 46px; border-top: 1px solid #e2ddd4; }
.ct-pn button { border: 0; background: none; cursor: pointer; text-align: left; font: inherit; color: inherit; padding: 6px 0; min-width: 0; }
.ct-pn button.nx { text-align: right; margin-left: auto; }
.ct-pn small { display: block; font: 700 10.5px var(--font-body); letter-spacing: .16em; text-transform: uppercase; color: #8d877d; margin-bottom: 4px; }
.ct-pn b { font: 700 24px var(--font-display); letter-spacing: -.02em; transition: color .15s; }
.ct-pn button:hover b { color: #b0101a; }
@media (max-width: 760px) {
  .ct-wrap { padding: 0 16px; }
  .ct-bar { padding: 8px 10px; gap: 6px; }
  .ct-x span, .ct-ic span { display: none; }
  .ct-x, .ct-ic { padding: 0 10px; }
  .ct-cv { padding: 36px 16px 28px; }
  .ct-cv img { height: 32px; }
  .ct-strip { grid-template-columns: repeat(4, 1fr); }
  .ct-strip span:nth-child(n+5) { display: none; }
  .ct-hero { grid-template-columns: 1fr; gap: 22px; padding: 18px 0 18px; }
  .ct-mosaic { height: 70vw; order: -1; }
  .ct-facts { gap: 22px; }
  .ct-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px 12px; }
  .ct-igrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 12px; }
  .ct-icard b { font-size: 16px; }
  .ct-fz-row { gap: 6px; }
  .ct-pn b { font-size: 18px; }
  .ct-sh h2 { font-size: 28px; }
  .ct-card b { font-size: 15px; }
  .ct-card .ar { width: 17px; height: 17px; }
}
</style>`);

let srCatList = [], srCatI = -1, srCatZ = '', srCatLabel = '';
/* foto di una serie: un colore ciascuna (prima quelle del 60×120), al massimo n */
function srReps(g, n) {
  const seen = new Set(), out = [];
  [...g.list].sort((a, b) => (b.z === '60x120') - (a.z === '60x120')).forEach(x => {
    if (out.length >= n || seen.has(glCid(x)) || !hasPhoto(x)) return;
    seen.add(glCid(x)); out.push(glPhoto(x));
  });
  return out;
}
function srCatalog() {
  const ch = srChoice(), all = srAll();
  srCatList = ch.keys.map(k => all.find(g => g.k === k)).filter(Boolean);
  if (!srCatList.length) return toast('Nessuna serie da mostrare');
  srCatLabel = ch.label; srCatZ = '';
  srCatI = srCatList.length === 1 ? 0 : -1;
  if (!document.getElementById('srCat')) document.body.insertAdjacentHTML('beforeend', '<div id="srCat"></div>');
  srCatDraw();
}
function srCatClose() {
  const c = document.getElementById('srCat'); if (!c) return;
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  c.remove(); srShow();
}
function srCatGo(i) {
  srCatI = Math.max(srCatList.length > 1 ? -1 : 0, Math.min(srCatList.length - 1, i)); srCatZ = '';
  srCatDraw();
}
function srCatFull() {
  const c = document.getElementById('srCat'); if (!c) return;
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else if (c.requestFullscreen) c.requestFullscreen().catch(() => toast('Schermo intero non disponibile'));
}
function srCatPdf() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  srPdf(srCatList.map(g => g.k), srCatLabel);
}
function srCatDraw() {
  const c = document.getElementById('srCat'); if (!c) return;
  const L = srCatList, i = srCatI, mini = g => srMini(g.list.find(x => x.z === '60x120' && hasPhoto(x)) || g.list.find(hasPhoto));
  c.innerHTML = `<div class="ct-bar">
      <button class="ct-x" onclick="srCatClose()"><svg class="ic"><use href="#i-left"/></svg><span>Esci</span></button>
      <div class="ct-tabs" id="ctTabs">${L.length > 1 ? `<button class="ct-tab${i < 0 ? ' on' : ''}" onclick="srCatGo(-1)"><svg class="ic"><use href="#i-grid"/></svg>Indice</button>` : ''}${L.map((g, j) => {
        const u = mini(g); return `<button class="ct-tab${j === i ? ' on' : ''}" onclick="srCatGo(${j})"><i style="${u ? `background-image:url('${esc(u)}')` : ''}"></i>${esc(glTitle(g.s))}</button>`; }).join('')}</div>
      ${document.fullscreenEnabled ? '<button class="ct-ic" onclick="srCatFull()" title="Schermo intero"><svg class="ic"><use href="#i-maximize"/></svg></button>' : ''}
      <button class="ct-ic" onclick="srCatPdf()" title="Scarica il catalogo in PDF"><svg class="ic"><use href="#i-download"/></svg><span>PDF</span></button></div>
    <div class="ct-body" id="ctBody">${i < 0 ? srCatCover() : srCatSeries(L[i])}</div>`;
  const tb = document.getElementById('ctTabs'), on = tb && tb.querySelector('.ct-tab.on');
  if (on) tb.scrollLeft = on.offsetLeft - (tb.clientWidth - on.offsetWidth) / 2;
}
function srCatCover() {
  const L = srCatList, nC = L.reduce((a, g) => a + g.nc, 0);
  const today = new Date().toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  // striscia di foto: una per serie finché bastano, poi la seconda foto delle stesse
  const reps = L.map(g => srReps(g, 3)), strip = [];
  for (let r = 0; r < 3 && strip.length < 8; r++) reps.forEach(p => { if (p[r] && strip.length < 8) strip.push(p[r]); });
  return `<section class="ct-cv"><img src="img/prop_logo.png" alt="Emilgroup"><div class="ct-eyebrow">${esc(srCatLabel)}</div><h1>Catalogo</h1>
      <p>${L.length} serie · ${nC} colori e decori · ${esc(today)}</p></section>
    ${strip.length ? `<div class="ct-strip">${strip.map(u => `<span style="background-image:url('${esc(u)}')"></span>`).join('')}</div>` : ''}
    <section class="ct-wrap ct-index"><h3>Indice · ${L.length} serie</h3><div class="ct-igrid">${L.map((g, j) => {
      const u = srReps(g, 1)[0], zs = [...new Set(g.list.map(x => x.z))].sort(srBySize);
      return `<button class="ct-icard" onclick="srCatGo(${j})"><span class="im" style="${u ? `background-image:url('${esc(u)}')` : ''}"></span>
        <span class="br">${esc(g.b)}</span><b>${esc(glTitle(g.s))}</b><span class="m">${srColN(g.nc)} · ${esc(zs.map(fmt).join(' · '))}</span></button>`;
    }).join('')}</div></section>`;
}
function srCatSeries(g) {
  const grs = srGroups(g), inf = srInfo(g, grs), reps = srReps(g, 4), z = inf.zs.includes(srCatZ) ? srCatZ : '';
  const vis = grs.map(gr => Object.assign({}, gr, { cols: gr.cols.filter(e => !z || e.list.some(x => x.z === z))
    .map(e => !z ? e : Object.assign({}, e, { rows: e.rows.filter(r => r.z === z), ph: e.list.find(x => x.z === z && hasPhoto(x)) || e.ph })) })).filter(gr => gr.cols.length);
  srCur = { g, cols: vis.flatMap(gr => gr.cols.map(e => Object.assign({ grp: gr.title, many: grs.length > 1 }, e))) };
  // formati disegnati in proporzione (il lato lungo più grande alto 120 px), riempiti con la foto di un colore di quel formato
  const big = Math.max(...inf.zs.map(q => Math.max(...parseSize(q)))), k = 120 / big;
  const nOf = q => grs.reduce((a, gr) => a + gr.cols.filter(e => e.list.some(x => x.z === q)).length, 0);
  const fz = inf.zs.map(q => {
    const [a, b] = sorted2(parseSize(q)), x = g.list.find(s => s.z === q && hasPhoto(s)), u = x ? glPhoto(x) : '';
    return `<button class="ct-fz${z === q ? ' on' : ''}" data-z="${esc(q)}" onclick="srCatFilter(this.dataset.z)"><i style="width:${Math.max(5, a * k).toFixed(1)}px;height:${Math.max(5, b * k).toFixed(1)}px;${u ? `background-image:url('${esc(u)}')` : ''}"></i><span>${esc(fmt(q))}</span><small>${srColN(nOf(q))}</small></button>`;
  }).join('');
  let n = 0;
  const card = e => { const i = n++, u = e.ph ? glPhoto(e.ph) : '', zz = [...new Set(e.rows.map(r => r.z))].map(fmt).join(' · ');
    return `<button class="ct-card" onclick="srOpen(${i})"><span class="im">${u ? `<img loading="lazy" src="${esc(u)}" alt="">` : '<span class="no">foto non disponibile</span>'}</span>
      <span class="nm"><b>${esc(e.name)}</b>${SR_ARROW}</span><small>${esc(zz)}</small></button>`; };
  const L = srCatList, j = srCatI, prev = j > 0 ? L[j - 1] : null, next = j < L.length - 1 ? L[j + 1] : null, ch = srChart(vis);
  return `<div class="ct-wrap">
    <section class="ct-hero"><div><div class="ct-eyebrow">${esc(g.b)}${g.nuovo ? '<span class="nwb">NOVITÀ</span>' : ''}</div><h1>${esc(glTitle(g.s))}</h1>
        <div class="ct-facts"><div><b>${inf.nC}</b><span>${inf.nC === 1 ? 'colore' : 'colori'}</span></div><div><b>${inf.zs.length}</b><span>${inf.zs.length === 1 ? 'formato' : 'formati'}</span></div>${inf.ths.length ? `<div><b>${esc(inf.ths.join(' · '))}</b><span>mm di spessore</span></div>` : ''}</div>
        ${grs.length > 1 ? `<p class="ct-fin"><span>Gruppi</span>${esc(grs.map(gr => gr.title).join(' · '))}</p>` : ''}
        ${inf.fins.length ? `<p class="ct-fin"><span>Finiture</span>${esc(inf.fins.join(' · '))}</p>` : ''}</div>
      <div class="ct-mosaic n${reps.length}">${reps.map(u => `<span style="background-image:url('${esc(u)}')"></span>`).join('')}</div></section>
    <section class="ct-fmts"><div class="ct-sh"><h2>Formati</h2>${inf.zs.length > 1 ? '<span>tocca un formato per vedere solo i suoi colori</span>' : ''}</div>
      <div class="ct-fz-row">${inf.zs.length > 1 ? `<button class="ct-fz${z ? '' : ' on'}" onclick="srCatFilter('')"><i class="all"></i><span>Tutti</span><small>${srColN(inf.nC)}</small></button>` : ''}${fz}</div></section>
    ${ch ? `<section class="ct-grp ct-chart"><div class="ct-sh"><h2>Cartella colori</h2><span>${esc(ch.sum)}${z ? ' in ' + esc(fmt(z)) : ''}</span></div>${srChartHTML(ch)}</section>` : ''}
    ${vis.map(gr => `<section class="ct-grp"><div class="ct-sh"><h2>${esc(grs.length > 1 ? gr.title : z ? 'Colori in ' + fmt(z) : 'Colori')}</h2><span>${srColN(gr.cols.length)}${grs.length > 1 && z ? ' in ' + esc(fmt(z)) : ''}</span></div>
      <div class="ct-cards">${gr.cols.map(card).join('')}</div></section>`).join('')}
    <nav class="ct-pn">${prev ? `<button onclick="srCatGo(${j - 1})"><small>‹ Serie precedente</small><b>${esc(glTitle(prev.s))}</b></button>` : L.length > 1 ? '<button onclick="srCatGo(-1)"><small>‹ Torna</small><b>Indice</b></button>' : ''}
      ${next ? `<button class="nx" onclick="srCatGo(${j + 1})"><small>Serie successiva ›</small><b>${esc(glTitle(next.s))}</b></button>` : ''}</nav></div>`;
}
/* filtro formato: ridisegna la pagina della serie restando allo stesso punto */
function srCatFilter(q) {
  const b = document.getElementById('ctBody'); if (!b) return;
  srCatZ = q; const top = b.scrollTop; b.innerHTML = srCatSeries(srCatList[srCatI]); b.scrollTop = top;
}
document.addEventListener('keydown', e => {
  if (!document.getElementById('srCat') || document.getElementById('srFull') || e.defaultPrevented) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  if (e.key === 'Escape' && !document.fullscreenElement) srCatClose();
  else if (e.key === 'ArrowRight' && srCatI < srCatList.length - 1) srCatGo(srCatI + 1);
  else if (e.key === 'ArrowLeft' && srCatI > (srCatList.length > 1 ? -1 : 0)) srCatGo(srCatI - 1);
});
