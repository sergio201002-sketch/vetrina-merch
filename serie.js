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
.sr-row { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; padding: 6px 14px 6px 13px; border-left: 3px solid transparent; }
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
  grs.forEach(gr => { gr.title = gr.name === 'Fondi' ? (grs.length > 1 ? 'Fondi' : 'Colori') : glTitle(gr.name); });
  return grs;
}
/* riassunto della serie: colori, formati, finiture, spessori */
function srInfo(g, grs) {
  return { nC: grs.reduce((a, gr) => a + gr.cols.length, 0), zs: [...new Set(g.list.map(x => x.z))].sort(srBySize),
    fins: [...new Set(g.list.flatMap(x => x.f))], ths: [...new Set(g.list.flatMap(x => x.t))].sort(srByNum) };
}
const srColN = n => `${n} ${n === 1 ? 'colore' : 'colori'}`;

function renderSerie(k) {
  srClose();
  const all = srAll();
  if (k && all.some(g => g.k === k)) { if (k !== srSel) srZ = ''; srSel = k; }
  if (!all.some(g => g.k === srSel)) srSel = all.length ? all[0].k : '';
  const v = document.getElementById('viewSerie'), brands = [...new Set(all.map(g => g.b))];
  v.innerHTML = `<div class="sr">
    <div class="sr-top"><h2>Serie</h2>
      <div class="sr-kpi"><span><b>${all.length}</b> serie</span><span><b>${all.reduce((a, g) => a + g.nc, 0)}</b> colori e decori</span><span><b>${brands.length}</b> marche</span></div>
      <button class="btn" id="srPdfAll" onclick="srPdfList()"></button></div>
    <aside class="sr-side"><div class="sr-tools"><input id="srSearch" placeholder="Cerca serie, colore o codice…" value="${esc(srQ)}">
      <select onchange="srBrand = this.value; srList()"><option value="">Tutte le marche</option>${brands.map(b => `<option${b === srBrand ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>
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
    return h + `<button class="sr-row${g.k === srSel ? ' on' : ''}" data-k="${esc(g.k)}" onclick="srPick(this.dataset.k)">
      <span class="th" style="${th ? `background-image:url('${esc(th)}')` : ''}"></span>
      <span class="tx"><span class="n">${esc(glTitle(g.s))}${g.nuovo ? ' <span class="nwb">NOVITÀ</span>' : ''}</span><span class="m">${srColN(g.nc)} · ${nz} ${nz === 1 ? 'formato' : 'formati'}</span></span></button>`;
  }).join('') || '<div class="sr-empty">Nessuna serie trovata.</div>';
  const b = document.getElementById('srPdfAll');
  if (b) { b.disabled = !list.length; b.innerHTML = `<svg class="ic"><use href="#i-download"/></svg> PDF ${list.length === all.length ? 'di tutte le serie' : list.length === 1 ? 'di 1 serie' : `di ${list.length} serie`}`; }
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
  const zN = z => grs.reduce((a, gr) => a + gr.cols.filter(e => e.list.some(x => x.z === z)).length, 0);
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
    <div class="acts"><button class="btn red" onclick="srPdf([srSel])"><svg class="ic"><use href="#i-download"/></svg> PDF della serie</button>
      <button class="btn" onclick="srCampiona()" title="Apre gli Espositori con i colori di questa serie"><svg class="ic"><use href="#i-grid"/></svg> Campiona</button></div></div>
    <div class="sr-bar">${inf.zs.length > 1 ? `<button class="sr-chip${srZ ? '' : ' on'}" onclick="srZ = ''; srShow()">Tutti i formati</button>${inf.zs.map(z => `<button class="sr-chip${srZ === z ? ' on' : ''}" data-z="${esc(z)}" onclick="srZ = this.dataset.z; srShow()" title="${srColN(zN(z))}">${esc(fmt(z))}</button>`).join('')}` : ''}
      <span class="sp"></span><span class="sr-seg"><button class="sr-chip${srMode === 'foto' ? ' on' : ''}" onclick="srMode = 'foto'; srShow()"><svg class="ic"><use href="#i-image"/></svg> Foto</button>
      <button class="sr-chip${srMode === 'tab' ? ' on' : ''}" onclick="srMode = 'tab'; srShow()"><svg class="ic"><use href="#i-grid"/></svg> Codici</button></span></div>
    ${srMode === 'tab'
      ? `<div class="sr-tw"><table class="sr-tab"><thead><tr><th>Colore</th><th>Formato</th><th>Finitura</th><th>Spessore</th><th>Codice</th></tr></thead><tbody>${vis.map(gr =>
          (grs.length > 1 ? `<tr class="gh"><td colspan="5">${esc(gr.title)}<span>${srColN(gr.cols.length)}</span></td></tr>` : '') + gr.cols.map(tr).join('')).join('')}</tbody></table></div>`
      : vis.map(gr => `<div class="sr-grp">${grs.length > 1 ? `<h5>${esc(gr.title)} <span>${srColN(gr.cols.length)}</span></h5>` : ''}<div class="sr-cards">${gr.cols.map(card).join('')}</div></div>`).join('')}`;
}

/* ── foto grande di un colore, con tutti i suoi formati, finiture e codici (frecce: colore prima / dopo) ── */
function srOpen(n) {
  if (!srCur || !srCur.cols[n]) return;
  srIdx = n;
  let m = document.getElementById('srFull');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', '<div class="modal open" id="srFull"></div>');
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
  if (e.key === 'Escape') srClose(); else if (e.key === 'ArrowRight') srOpen(srIdx + 1); else if (e.key === 'ArrowLeft') srOpen(srIdx - 1);
});
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/serie')) srClose(); });

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
async function srJpeg(u, px) {
  const im = u && await schLoadImg(u); if (!im) return '';
  const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.min(iw, ih), W = Math.max(1, Math.min(px, s));
  const cv = document.createElement('canvas'); cv.width = cv.height = W;
  const c = cv.getContext('2d'); c.imageSmoothingQuality = 'high';
  c.drawImage(im, (iw - s) / 2, (ih - s) / 2, s, s, 0, 0, W, W);
  const d = cv.toDataURL('image/jpeg', 0.82); cv.width = cv.height = 0;
  return d;
}
function srPdfList() {
  const list = srFiltered();
  return srPdf(list.map(g => g.k), srBrand || (srQ.trim() ? 'Ricerca ' + srQ.trim() : 'Tutte le marche'));
}
async function srPdf(keys, label) {
  const all = srAll(), list = keys.map(k => all.find(g => g.k === k)).filter(Boolean), multi = list.length > 1;
  if (!list.length) return toast('Nessuna serie da esportare');
  const data = list.map(g => { const grs = srGroups(g); return { g, grs, inf: srInfo(g, grs) }; }), cols = data.flatMap(d => d.grs.flatMap(gr => gr.cols));
  if (list.length > 5) {
    const nf = cols.filter(e => e.ph).length, sec = nf / 12, mb = Math.max(1, Math.round(nf * 0.016));
    if (!await ask(`Il PDF di ${list.length} serie ha ${cols.length} colori e decori (${nf} con la foto).\n\nCi vuole ${sec < 50 ? 'meno di un minuto' : 'circa ' + Math.ceil(sec / 60) + ' minuti'} e il file sarà di circa ${mb} MB.`, { ok: 'Crea il PDF' })) return;
  }
  const wait = document.createElement('div'); wait.className = 'sch-wait'; wait.textContent = 'Preparo il PDF…'; document.body.appendChild(wait);
  try {
    await loadPdfLibs();
    const [logo, mark] = await Promise.all(['img/prop_logo.png', 'img/prop_mark.png'].map(schLoadImg));
    // foto: 6 alla volta
    const jobs = cols.filter(e => e.ph); let next = 0, done = 0;
    const work = async () => { while (next < jobs.length) { const e = jobs[next++]; e.jpg = await srJpeg(glPhoto(e.ph), 300);
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
    // con più serie: copertina e indice prima (le pagine si scrivono alla fine)
    const ent = [];
    if (multi) { let lb = ''; data.forEach(d => { if (d.g.b !== lb) { if (lb) ent.push({ sp: 1 }); ent.push({ b: d.g.b }); lb = d.g.b; } ent.push({ d }); }); }
    const LH = 4.7, Y1 = 98, YN = 26, per1 = Math.floor((BOT - Y1) / LH), perN = Math.floor((BOT - YN) / LH);
    const nIdx = multi ? 1 + Math.max(0, Math.ceil((ent.length - 2 * per1) / (2 * perN))) : 0;
    for (let i = 0; i < nIdx; i++) addPage('Indice');
    for (const d of data) {
      head(d);
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
    schDeliver(pdf, multi ? `${ymd}_Serie_${safe(label === 'Tutte le marche' ? 'Tutte' : label) || 'Tutte'}.pdf` : `${ymd}_${safe(glTitle(list[0].s))}_Serie.pdf`, multi ? 'Il PDF delle serie è pronto' : 'Il PDF della serie è pronto');
  } catch (err) { console.error(err); toast('PDF non riuscito: riprova'); }
  finally { wait.remove(); }
}
