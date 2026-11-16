'use strict';
/* ════════════════════════════════════════════════════════════
   CULLE E PANNELLI (#/culle, #/culle/<marca|serie>) — il materiale dei cataloghi Merchandising 2026 serie per serie:
   culle dedicate, espositori, pannelli sinottici e posati, testate fotografiche, cornici per pedane,
   scatole / cofanetti / valigette, cataloghi e cartelle architetti (kit architetti), con codici, prezzi e misure.
   A sinistra le serie (cerca anche per codice), sopra il tipo; tocca una scheda per l'immagine grande,
   i codici (anche No Logo), la procedura d'ordine e la pagina del catalogo.
   Dati e immagini: build_merch.py -> merch_data.js (window.MERCH) e merch/.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewCulle'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="culle"] #viewCulle { display: block; overflow: hidden; }
body[data-view="culle"] .hbtn[data-nav="culle"] { background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 -2px 0 var(--red); }
#viewCulle { background: #fbfaf8; }
.cu-cats { display: flex; gap: 6px; flex-wrap: wrap; grid-column: 1 / -1; padding: 10px 20px; background: #fff; border-bottom: 1px solid #ebe8e2; }
.cu-cats .sr-chip b { font-weight: 500; opacity: .6; }
.sr.cu { grid-template-rows: auto auto minmax(0, 1fr); }
.cu-all .th { display: flex; align-items: center; justify-content: center; color: #8a857c; }
.cu-all .th .ic { width: 20px; height: 20px; }
.cu-gen { margin-top: 14px; background: #fff; border: 1px solid #ebe8e2; border-radius: 12px; padding: 10px 14px; font-size: 12.5px; color: #444; line-height: 1.6; }
.cu-gen b { color: #1d1d20; }
.cu-k { font-family: ui-monospace, Menlo, Consolas, monospace; font-weight: 700; color: #1d1d20; cursor: copy; white-space: nowrap; }
.cu-k:hover { color: var(--red); }
.cu-sec { margin-top: 24px; }
.cu-sec h5 { display: flex; align-items: baseline; gap: 8px; margin: 0 0 10px; font: 700 15px var(--font-display); letter-spacing: -.01em; color: #1d1d20; }
.cu-sec h5 span { font: 500 12px var(--font-body); color: var(--mid); }
.cu-sec .how { font-size: 12px; color: #555; margin: -4px 0 10px; line-height: 1.5; }
.cu-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 14px; }
.cu-cards.wide { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
.cu-card { background: #fff; border: 1px solid #ebe8e2; border-radius: 12px; overflow: hidden; cursor: pointer; display: flex; flex-direction: column; transition: box-shadow .15s, border-color .15s; }
.cu-card:hover { border-color: #d9d4ca; box-shadow: 0 6px 20px rgba(20,18,15,.08); }
.cu-card .im { aspect-ratio: 1; background: #fff; display: flex; align-items: center; justify-content: center; padding: 8px; overflow: hidden; border-bottom: 1px solid #f3f0eb; }
.cu-cards.wide .im { aspect-ratio: 2 / 1; padding: 0; }
.cu-card .im img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cu-cards.wide .im img { width: 100%; height: 100%; object-fit: cover; }
.cu-card .tx { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 3px; flex: 1; }
.cu-card .s { font: 700 10px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: #b0101a; }
.cu-card b { font-size: 13px; line-height: 1.25; }
.cu-card .d { font-size: 11.5px; color: #555; line-height: 1.4; }
.cu-card .row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 4px; }
.cu-card .row .cu-k { font-size: 12px; }
.cu-pr { background: #1d1d20; color: #fff; border-radius: 999px; padding: 2px 8px; font: 700 11.5px var(--font-body); white-space: nowrap; }
.cu-nl { font-size: 11px; color: var(--mid); white-space: nowrap; }
.cu-ser { margin-top: 26px; }
.cu-ser > h4 { margin: 0 0 4px; font: 700 20px var(--font-display); letter-spacing: -.02em; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.cu-ser > h4 small { font: 700 10.5px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #b0101a; }
.cu-ser > h4 a { font: 600 12px var(--font-body); color: #8e1016; cursor: pointer; }
.cu-pages { display: flex; gap: 8px; overflow-x: auto; padding: 4px 0 8px; }
.cu-pages img { height: 150px; border: 1px solid #e6e2da; border-radius: 6px; cursor: zoom-in; background: #fff; flex: none; }
#cuFull .mbox { width: min(1120px, 100%); }
.cu-fb { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 18px; padding: 16px 18px 18px; overflow: auto; }
.cu-fb .cu-ph { background: #fff; border: 1px solid #ebe8e2; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 280px; overflow: hidden; padding: 10px; }
.cu-fb .cu-ph img { max-width: 100%; max-height: 70vh; display: block; }
.cu-fb .cu-ph.pg img { max-height: none; width: 100%; }
.cu-fb .br { font: 700 11px var(--font-body); letter-spacing: .14em; text-transform: uppercase; color: #b0101a; }
.cu-fb h4 { margin: 2px 0 10px; font: 700 22px/1.15 var(--font-display); letter-spacing: -.02em; }
.cu-fb dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0 0 12px; font-size: 13px; }
.cu-fb dt { color: var(--mid); }
.cu-fb dd { margin: 0; }
.cu-fb .sr-tab { border: 1px solid #ebe8e2; margin-bottom: 12px; }
.cu-fb .sr-tab tbody tr { cursor: default; }
.cu-fb .how { background: #f8f7f4; border-radius: 10px; padding: 10px 12px; font-size: 12.5px; line-height: 1.55; color: #333; margin-bottom: 12px; }
.cu-fb .how ol { margin: 4px 0 0; padding-left: 18px; }
.cu-fb .acts { display: flex; gap: 8px; flex-wrap: wrap; }
@media (max-width: 760px) {
  body[data-view="culle"] #viewCulle { overflow-y: auto; }
  .cu-cats { padding: 8px 12px; flex-wrap: nowrap; overflow-x: auto; }
  .cu-cats .sr-chip { flex: none; }
  .sr.cu .sr-kpi { display: none; }
  .sr.cu .sr-top { justify-content: space-between; }
  .cu-cards, .cu-cards.wide { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .cu-fb { grid-template-columns: 1fr; padding: 12px; }
  .cu-pages img { height: 120px; }
}
</style>`);

const CU = window.MERCH || { series: {}, items: [] };
const CU_CATS = [
  ['culle', 'Culle dedicate', 'culla', 'culle'], ['espositori', 'Espositori', 'espositore', 'espositori'],
  ['sinottici', 'Pannelli sinottici', 'pannello sinottico', 'pannelli sinottici'], ['posati', 'Pannelli posati', 'schema', 'schemi'],
  ['testate', 'Testate fotografiche', 'testata', 'testate'], ['cornici', 'Cornici per pedane', 'cornice', 'cornici'],
  ['scatole', 'Scatole, cofanetti e valigette', 'scatola', 'scatole'], ['cataloghi', 'Cataloghi e kit architetti', 'catalogo', 'cataloghi'],
];
const CU_BRANDS = ['Emilceramica', 'Ergon', 'Provenza'];
const cuCatN = (c, n) => { const x = CU_CATS.find(k => k[0] === c); return n + ' ' + (n === 1 ? x[2] : x[3]); };
let cuSel = '', cuCat = 'culle', cuQ = '', cuBrand = '', cuList = [], cuIdx = 0, cuPage = false;
const cuKey = s => String(s || '').normalize('NFKD').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
const cuName = sk => (CU.series[sk] || {}).n || sk.split('|')[1] || '';
const cuImg = (it, big) => it.img ? 'merch/' + (big ? '' : 'm/') + it.img + '.avif' : '';
const cuPrice = p => p ? '€ ' + String(p).replace(/,00$/, '') : '';
/* le serie con il materiale, nell'ordine delle marche; txt = dove cercare (serie, articoli, codici) */
function cuAll() {
  const m = new Map();
  CU.items.forEach(it => { if (!m.has(it.s)) m.set(it.s, []); m.get(it.s).push(it); });
  return Object.entries(CU.series).filter(([k]) => m.has(k)).map(([k, s]) => {
    const list = m.get(k);
    return { k, b: s.b, n: s.n, s, list, txt: normTxt([s.b, s.n, ...list.map(i => i.t), ...list.flatMap(i => (i.codes || []).flatMap(c => [c.c, c.nl, c.l]))].join(' ')) };
  }).sort((a, b) => CU_BRANDS.indexOf(a.b) - CU_BRANDS.indexOf(b.b) || a.n.localeCompare(b.n));
}
/* serie del listino -> serie del merchandising (per il pulsante nella sezione Serie) */
function cuFor(b, s) { const k = cuKey(s); return Object.keys(CU.series).find(sk => CU.series[sk].b === b && CU.series[sk].key === k) || ''; }
/* serie del merchandising -> serie del listino (#/serie/…) */
function cuSerie(sk) {
  const s = CU.series[sk]; if (!s || typeof SAMPLES === 'undefined') return '';
  const x = SAMPLES.find(x => x.b === s.b && cuKey(x.s) === s.key); return x ? x.b + '|' + x.s : '';
}

function renderCulle(k) {
  cuClose();
  const all = cuAll();
  if (k && all.some(g => g.k === k)) cuSel = k; else if (k === '' && location.hash.startsWith('#/culle/')) cuSel = '';
  if (cuSel && !all.some(g => g.k === cuSel)) cuSel = '';
  if (k && cuSel === k) cuCat = '';
  const v = document.getElementById('viewCulle'), n = c => CU.items.filter(i => i.cat === c).length;
  v.innerHTML = `<div class="sr cu">
    <div class="sr-top"><h2>Culle e pannelli</h2>
      <div class="sr-kpi"><span><b>${n('culle')}</b> culle dedicate</span><span><b>${n('sinottici') + n('posati')}</b> pannelli</span><span><b>${n('testate')}</b> testate</span><span><b>${all.length}</b> serie</span><span>Cataloghi Merchandising 2026</span></div>
      <div class="sr-tacts"><button class="btn" onclick="cuCopy()" title="Copia i codici e i prezzi di quello che vedi"><svg class="ic"><use href="#i-copy"/></svg> Copia codici</button></div></div>
    <div class="cu-cats" id="cuCats"></div>
    <aside class="sr-side"><div class="sr-tools"><input id="cuSearch" placeholder="Cerca serie, articolo o codice…" value="${esc(cuQ)}">
      <select onchange="cuBrand = this.value; cuRenderList(); cuShow()"><option value="">Tutte le marche</option>${CU_BRANDS.map(b => `<option${b === cuBrand ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></div>
      <div class="sr-list" id="cuList"></div></aside>
    <main class="sr-main" id="cuMain"></main></div>`;
  document.getElementById('cuSearch').addEventListener('input', e => { cuQ = e.target.value; cuRenderList(); cuShow(); });
  cuRenderList(); cuShow();
  const on = document.querySelector('#cuList .sr-row.on'), ls = document.getElementById('cuList');
  if (on && ls && cuSel) { const y = on.getBoundingClientRect().top - ls.getBoundingClientRect().top; if (y > ls.clientHeight - 60) ls.scrollTop = y - ls.clientHeight / 2; }
}
function cuFiltered(all) {
  const q = normTxt(cuQ).split(' ').filter(Boolean);
  return (all || cuAll()).filter(g => (!cuBrand || g.b === cuBrand) && q.every(w => g.txt.includes(w)));
}
/* elenco serie: con un tipo scelto, solo le serie che lo hanno */
function cuRenderList() {
  const el = document.getElementById('cuList'); if (!el) return;
  const list = cuFiltered().filter(g => !cuCat || g.list.some(i => i.cat === cuCat)); let lastB = '';
  const cnt = g => CU_CATS.map(([c]) => [c, g.list.filter(i => i.cat === c).length]).filter(x => x[1]);
  el.innerHTML = `<div class="sr-row cu-all${cuSel ? '' : ' on'}" data-k="" onclick="cuPick('')"><span class="th"><svg class="ic"><use href="#i-grid"/></svg></span>
      <span class="tx"><span class="n">Tutte le serie</span><span class="m">${esc(cuCat ? CU_CATS.find(c => c[0] === cuCat)[1] : 'Tutto il materiale')}</span></span></div>`
    + list.map(g => {
      const th = g.list.find(i => i.cat === (cuCat || 'culle') && i.img) || g.list.find(i => i.cat === 'testate' && i.img) || g.list.find(i => i.img);
      const h = g.b !== lastB ? `<div class="sr-bh">${esc(g.b)}</div>` : ''; lastB = g.b;
      const c = cnt(g), m = cuCat ? cuCatN(cuCat, c.find(x => x[0] === cuCat)[1]) : c.filter(x => ['culle', 'espositori', 'sinottici', 'testate'].includes(x[0])).map(x => cuCatN(x[0], x[1])).join(' · ');
      return h + `<div class="sr-row${g.k === cuSel ? ' on' : ''}" data-k="${esc(g.k)}" onclick="cuPick(this.dataset.k)">
        <span class="th" style="${th ? `background-image:url('${esc(cuImg(th))}');background-color:#fff;background-size:contain` : ''}"></span>
        <span class="tx"><span class="n">${esc(g.n)}</span><span class="m">${esc(m)}</span></span></div>`;
    }).join('') + (list.length ? '' : '<div class="sr-empty">Nessuna serie trovata.</div>');
  cuRenderCats();
}
function cuRenderCats() {
  const el = document.getElementById('cuCats'); if (!el) return;
  const pool = cuSel ? CU.items.filter(i => i.s === cuSel) : CU.items.filter(i => cuFiltered().some(g => g.k === i.s));
  el.innerHTML = `<button class="sr-chip${cuCat ? '' : ' on'}" onclick="cuSetCat('')">Tutto <b>${pool.length}</b></button>`
    + CU_CATS.map(([c, name]) => { const n = pool.filter(i => i.cat === c).length;
      return n ? `<button class="sr-chip${cuCat === c ? ' on' : ''}" onclick="cuSetCat('${c}')">${esc(name)} <b>${n}</b></button>` : ''; }).join('');
}
function cuSetCat(c) { cuCat = c; cuRenderList(); cuShow(); const m = document.getElementById('cuMain'); if (m) m.scrollTop = 0; }
function cuPick(k) {
  cuSel = k;
  history.replaceState(null, '', '#/culle/' + encodeURIComponent(k));
  if (k) cuCat = '';   // una serie: tutto il suo materiale (le culle per prime)
  cuRenderList(); cuShow();
  const m = document.getElementById('cuMain'); if (m) m.scrollTop = 0;
  if (innerWidth <= 760 && m) m.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* codici generici della serie per un tipo (pannello posato, sinottico, pedana) */
const cuGen = (sk, c) => ((CU.series[sk] || {}).gen || {})[c] || [];
const cuGenTxt = g => g.map(x => `<span class="cu-k" onclick="event.stopPropagation(); cuCopyCode('${x.c}')" title="Copia">${x.c}</span>${x.n ? ` <span class="cu-nl">(${esc(x.n.replace(/^articoli /, ''))})</span>` : ''}`).join(' · ');
/* come si ordina, dalle pagine "Procedura ordine per customer service" */
function cuHow(it, full) {
  const g = cuGen(it.s, it.cat), code = ((it.codes || [])[0] || {}).c;
  if (it.cat === 'posati') return `Per ordinare un pannello posato: ${g.length ? 'codice generico ' + cuGenTxt(g) : 'codice generico del pannello posato'}${full
    ? `<ol><li>inserire nel configuratore le dimensioni del pannello richiesto;</li><li>il codice della piastrella da posare${it.codes && it.codes.length ? ' e lo schema ' + esc(it.codes.map(c => c.c).join(', ')) : ''};</li><li>con la testata fotografica: il codice della testata scelta.</li></ol>` : '.'}`;
  if (it.cat === 'sinottici') return g.length ? `Pannello sinottico generico (su misura): ${cuGenTxt(g)}.` : '';
  if (it.cat === 'cornici') return `Pedana: un unico preordine per pannello e cornice${full
    ? `<ol><li>codice della cornice${code ? ' ' + code : ''};</li><li>codice pannello generico ${g.length ? cuGenTxt(g) : ''};</li><li>dimensioni del pannello, annotando «pannello per pedana» e «Fuga 2 mm»;</li><li>allegare il PDF dello schema di posa (pagina del catalogo);</li><li>codice delle piastrelle da posare.</li></ol>` : '.'}`;
  if (it.cat === 'testate') return 'Testata 100x55 per pannelli larghi fino a 110 cm, 120x65 oltre 110 cm; si ordina insieme al pannello posato (ultimo passo del configuratore).';
  if (['culle', 'espositori', 'scatole'].includes(it.cat) && code && full) return `Per ordinare inserire in Oracle il codice <span class="cu-k" onclick="cuCopyCode('${code}')">${code}</span>.`;
  return '';
}

function cuCard(it, withSer) {
  const c = (it.codes || [])[0] || {}, more = (it.codes || []).length - 1;
  const d = it.cat === 'testate' ? (it.codes || []).map(x => (x.l || '').replace('Testata ', '')).filter(Boolean).join(' · ')
    : it.dims || (it.info || [])[0] || it.note || '';
  return `<div class="cu-card" onclick="cuOpen(${cuList.indexOf(it)})"><div class="im">${it.img ? `<img loading="lazy" src="${esc(cuImg(it))}" alt="">` : ''}</div>
    <div class="tx">${withSer ? `<span class="s">${esc(cuName(it.s))}</span>` : ''}<b>${esc(it.t)}</b>${d ? `<span class="d">${esc(d)}</span>` : ''}
      <div class="row">${c.c ? `<span class="cu-k">${esc(c.c)}</span>` : ''}${more > 0 ? `<span class="cu-nl">+${more}</span>` : ''}${it.price ? `<span class="cu-pr">${cuPrice(it.price)}</span>` : ''}</div></div></div>`;
}
const cuSecHTML = (c, items, withSer, how) => {
  const x = CU_CATS.find(k => k[0] === c);
  return `<div class="cu-sec"><h5>${esc(x[1])} <span>${cuCatN(c, items.length)}</span></h5>${how ? `<div class="how">${how}</div>` : ''}
    <div class="cu-cards${c === 'testate' ? ' wide' : ''}">${items.map(it => cuCard(it, withSer)).join('')}</div></div>`;
};
function cuShow() {
  const el = document.getElementById('cuMain'); if (!el) return;
  const all = cuAll(), vis = cuFiltered(all);
  if (!cuSel) {   // tutte le serie: un tipo alla volta, raggruppato per serie
    const sers = vis.map(g => [g, g.list.filter(i => !cuCat || i.cat === cuCat)]).filter(x => x[1].length);
    cuList = sers.flatMap(x => x[1]);
    if (!cuCat) {   // panoramica: i primi di ogni tipo
      const by = CU_CATS.map(([c]) => [c, cuList.filter(i => i.cat === c)]).filter(x => x[1].length);
      cuList = by.flatMap(x => x[1].slice(0, 8));
      el.innerHTML = `<div class="sr-head"><div class="who"><div class="br">Cataloghi Merchandising 2026</div><h3>Tutto il materiale</h3>
          <div class="meta">Scegli un tipo qui sopra, oppure una serie a sinistra.</div></div></div>`
        + by.map(([c, its]) => cuSecHTML(c, its.slice(0, 8), true) + (its.length > 8 ? `<p><button class="btn" onclick="cuSetCat('${c}')">Vedi tutti (${its.length})</button></p>` : '')).join('');
      return;
    }
    const x = CU_CATS.find(k => k[0] === cuCat), flat = cuList.length < sers.length * 2.5;   // uno o due per serie: una griglia sola
    el.innerHTML = `<div class="sr-head"><div class="who"><div class="br">Tutte le serie</div><h3>${esc(x[1])}</h3>
        <div class="meta"><b>${cuCatN(cuCat, cuList.length)}</b> in ${sers.length} serie${cuCat === 'cataloghi' ? ' · la cartella architetti è il kit per i progettisti' : ''}</div></div></div>`
      + (!sers.length ? '<div class="sr-empty">Niente per questa ricerca.</div>'
        : flat ? `<div class="cu-sec"><div class="cu-cards${cuCat === 'testate' ? ' wide' : ''}">${cuList.map(it => cuCard(it, true)).join('')}</div></div>`
        : sers.map(([g, its]) => `<div class="cu-ser"><h4><small>${esc(g.b)}</small> ${esc(g.n)} <a data-k="${esc(g.k)}" onclick="cuPick(this.dataset.k)">tutto il materiale →</a></h4>
          ${cuHow(its[0]) && cuCat !== 'testate' ? `<div class="how" style="font-size:12px;color:#555;margin:0 0 10px">${cuHow(its[0])}</div>` : ''}
          <div class="cu-cards${cuCat === 'testate' ? ' wide' : ''}">${its.map(it => cuCard(it)).join('')}</div></div>`).join(''));
    return;
  }
  const g = all.find(x => x.k === cuSel);
  if (!g) { el.innerHTML = '<div class="sr-empty">Nessuna serie.</div>'; return; }
  const cats = CU_CATS.map(([c]) => [c, g.list.filter(i => i.cat === c)]).filter(x => x[1].length && (!cuCat || x[0] === cuCat));
  cuList = cats.flatMap(x => x[1]);
  const sr = cuSerie(g.k), gen = g.s.gen || {};
  const genL = [['posati', 'Pannello posato'], ['sinottici', 'Pannello sinottico'], ['cornici', 'Pannello per pedana']].filter(([c]) => (gen[c] || []).length);
  el.innerHTML = `<div class="sr-head"><div class="who"><div class="br">${esc(g.b)}</div><h3>${esc(g.n)}</h3>
      <div class="meta">${CU_CATS.map(([c]) => [c, g.list.filter(i => i.cat === c).length]).filter(x => x[1]).map(x => `<b>${x[1]}</b> ${esc(cuCatN(x[0], x[1]).replace(/^\d+ /, ''))}`).join(' · ')}<br>Catalogo Merchandising ${esc(g.s.ed)} · pagine ${esc(g.s.pages.map(p => p.slice(1)).join(', '))}</div></div>
    <div class="acts">${sr ? `<button class="btn" data-k="${esc(sr)}" onclick="go('#/serie/' + encodeURIComponent(this.dataset.k))" title="Colori, formati e codici della serie"><svg class="ic"><use href="#i-tiles"/></svg> Apri la serie</button>` : ''}
      <button class="btn" onclick="cuCopy()"><svg class="ic"><use href="#i-copy"/></svg> Copia codici</button></div></div>
    ${genL.length ? `<div class="cu-gen"><b>Codici generici</b> (pannelli su misura, si completano nel configuratore):<br>${genL.map(([c, l]) => `${l}: ${cuGenTxt(gen[c])}`).join('<br>')}</div>` : ''}
    ${cats.map(([c, its]) => cuSecHTML(c, its, false, c === 'posati' || c === 'cornici' ? cuHow(its[0]) : '')).join('')}
    <div class="cu-sec"><h5>Pagine del catalogo <span>${g.s.pages.length}</span></h5><div class="cu-pages">${g.s.pages.map(p =>
      `<img loading="lazy" src="merch/pm/${p}.avif" alt="Pagina ${p.slice(1)}" title="Pagina ${p.slice(1)}" data-k="${esc(g.k)}" onclick="cuPageOpen(this.dataset.k, '${p}')">`).join('')}</div></div>`;
}

/* ── scheda grande: immagine, codici, misure, contenuto, come si ordina, pagina del catalogo ── */
function cuBox() {
  let m = document.getElementById('cuFull');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', '<div class="modal open" id="cuFull"></div>');
    m = document.getElementById('cuFull'); m.addEventListener('click', e => { if (e.target === m) cuClose(); });
  }
  return m;
}
function cuOpen(n, page) {
  const it = cuList[n]; if (!it) return;
  cuIdx = n; cuPage = !!page;
  const m = cuBox(); delete m.dataset.page;
  const N = cuList.length, s = CU.series[it.s] || {}, cat = CU_CATS.find(k => k[0] === it.cat);
  const codes = it.codes || [], hasL = codes.some(c => c.l), hasNl = codes.some(c => c.nl), hasP = codes.some(c => c.p || c.nlp) || (it.price && codes.length > 1);
  const how = cuHow(it, true);
  m.innerHTML = `<div class="mbox"><div class="mhead"><h3>${esc(cat[1])} · ${esc(s.n || '')}</h3><span class="sr-cnt">${n + 1} / ${N}</span>
      <button class="btn" onclick="cuOpen(cuIdx - 1)"${n ? '' : ' disabled'} title="Prima"><svg class="ic"><use href="#i-cleft"/></svg></button>
      <button class="btn" onclick="cuOpen(cuIdx + 1)"${n < N - 1 ? '' : ' disabled'} title="Dopo"><svg class="ic"><use href="#i-cright"/></svg></button>
      <button class="btn" onclick="cuClose()"><svg class="ic"><use href="#i-x"/></svg> Chiudi</button></div>
    <div class="cu-fb"><div class="cu-ph${cuPage ? ' pg' : ''}">${cuPage ? `<img src="merch/p/${it.pg}.avif" alt="Pagina del catalogo">` : it.img ? `<img src="${esc(cuImg(it, true))}" alt="">` : ''}</div>
      <div><div class="br">${esc(s.b || '')} · ${esc(s.n || '')}</div><h4>${esc(it.t)}</h4>
        ${codes.length ? `<table class="sr-tab"><thead><tr>${hasL ? '<th>Articolo</th>' : ''}<th>Codice</th>${hasNl ? '<th>No Logo</th>' : ''}${hasP ? '<th>Prezzo</th>' : ''}</tr></thead><tbody>${codes.map(c =>
          `<tr>${hasL ? `<td>${esc(c.l || '')}${c.note ? `<div class="cu-nl">${esc(c.note)}</div>` : ''}</td>` : ''}<td>${c.c ? `<span class="cu-k" onclick="cuCopyCode('${c.c}')" title="Copia">${c.c}</span>` : '—'}</td>${hasNl ? `<td>${c.nl ? `<span class="cu-k" onclick="cuCopyCode('${c.nl}')" title="Copia">${c.nl}</span>` : '—'}</td>` : ''}${hasP ? `<td>${cuPrice(c.p || it.price)}</td>` : ''}</tr>`).join('')}</tbody></table>` : ''}
        <dl>${it.price && !hasP ? `<dt>Prezzo</dt><dd><b>${cuPrice(it.price)}</b>${it.pn ? ` <span class="cu-nl">(${esc(it.pn)})</span>` : ''}</dd>` : ''}
          ${it.price && hasP && it.pn ? `<dt>Prezzo</dt><dd>${esc(it.pn)}</dd>` : ''}
          ${it.dims ? `<dt>Misure</dt><dd>${esc(it.dims)}</dd>` : ''}
          ${(it.info || []).length ? `<dt>Contenuto</dt><dd>${it.info.map(esc).join('<br>')}</dd>` : ''}
          ${it.note ? `<dt>Nota</dt><dd>${esc(it.note)}</dd>` : ''}</dl>
        ${how ? `<div class="how">${how}</div>` : ''}
        <div class="acts">${codes.some(c => c.c) ? `<button class="btn red" onclick="cuCopyItem(cuList[cuIdx])"><svg class="ic"><use href="#i-copy"/></svg> Copia codici</button>` : ''}
          <button class="btn" onclick="cuOpen(cuIdx, ${!cuPage})"><svg class="ic"><use href="#i-${cuPage ? 'image' : 'zoom'}"/></svg> ${cuPage ? 'Immagine' : 'Pagina del catalogo'}</button>
          <a class="btn" href="merch/p/${it.pg}.avif" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">Apri la pagina ${esc(it.pg.slice(1))}</a></div></div></div></div>`;
}
/* pagina intera dalla striscia "Pagine del catalogo" */
function cuPageOpen(sk, p) {
  const m = cuBox(), s = CU.series[sk] || {}, i = s.pages.indexOf(p);
  m.innerHTML = `<div class="mbox"><div class="mhead"><h3>${esc(s.n)} · pagina ${esc(p.slice(1))}</h3><span class="sr-cnt">${i + 1} / ${s.pages.length}</span>
      <button class="btn" data-k="${esc(sk)}" onclick="cuPageOpen(this.dataset.k, '${s.pages[i - 1] || ''}')"${i ? '' : ' disabled'}><svg class="ic"><use href="#i-cleft"/></svg></button>
      <button class="btn" data-k="${esc(sk)}" onclick="cuPageOpen(this.dataset.k, '${s.pages[i + 1] || ''}')"${i < s.pages.length - 1 ? '' : ' disabled'}><svg class="ic"><use href="#i-cright"/></svg></button>
      <button class="btn" onclick="cuClose()"><svg class="ic"><use href="#i-x"/></svg> Chiudi</button></div>
    <div style="overflow:auto;padding:12px;text-align:center;background:#f3f1ec"><img src="merch/p/${p}.avif" alt="" style="max-width:100%;background:#fff"></div></div>`;
  m.dataset.page = sk + '|' + p;
}
function cuClose() { const m = document.getElementById('cuFull'); if (m) m.remove(); }
document.addEventListener('keydown', e => {
  const m = document.getElementById('cuFull'); if (!m) return;
  if (!['Escape', 'ArrowRight', 'ArrowLeft'].includes(e.key)) return;
  e.preventDefault();
  if (e.key === 'Escape') return cuClose();
  const d = e.key === 'ArrowRight' ? 1 : -1;
  if (m.dataset.page) { const [a, b, p] = m.dataset.page.split('|'), sk = a + '|' + b, ps = CU.series[sk].pages, q = ps[ps.indexOf(p) + d]; if (q) cuPageOpen(sk, q); }
  else cuOpen(cuIdx + d, cuPage);
});
window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#/culle')) cuClose(); });

/* ── copia: un codice, una scheda, o tutto quello che si vede (per l'ordine o una mail) ── */
async function cuCopyCode(c) { try { await navigator.clipboard.writeText(c); toast('Codice ' + c + ' copiato'); } catch (e) { showCopy('Copia il codice:', c); } }
const cuLines = it => {
  const s = cuName(it.s), codes = it.codes || [];
  if (!codes.length) return [];
  return codes.map(c => [s, it.t + (c.l ? ' — ' + c.l : ''), c.c || '', c.nl ? 'No Logo ' + c.nl : '', cuPrice(c.p || it.price)].filter(Boolean).join('\t'));
};
async function cuCopyItem(it) {
  const txt = cuLines(it).join('\n');
  try { await navigator.clipboard.writeText(txt); toast('Codici copiati'); } catch (e) { showCopy('Copia i codici:', txt); }
}
async function cuCopy() {
  const txt = cuList.flatMap(cuLines).join('\n');
  if (!txt) return say('Niente da copiare.');
  try { await navigator.clipboard.writeText(txt); toast(cuList.length + ' articoli copiati: incollali in Excel o in una mail'); } catch (e) { showCopy('Copia i codici:', txt); }
}
