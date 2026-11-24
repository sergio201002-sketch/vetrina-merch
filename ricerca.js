'use strict';
/* ════════════════════════════════════════════════════════════
   RICERCA CAMPIONI (#/ricerca) — chi ha un campione: scrivi uno o più codici (anche le righe d'ordine 00XXXX01) oppure
   marca, serie e colore ("mapierre blanc", "pigmento amaranto") e vedi i clienti che lo hanno negli espositori, con i
   formati e le finiture, per colore o per cliente. Tocca il cliente per aprirlo, l'espositore per aprire la composizione.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewRicerca'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="ricerca"] #viewRicerca { display: block; }
.rc-intro { color: var(--mid); font-size: 13px; margin: -8px 0 14px; max-width: 760px; line-height: 1.5; }
.rc-top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
.rc-top input { flex: 1 1 360px; max-width: 620px; font: 600 15px var(--font-body); padding: 11px 14px; border: 1px solid #ddd8cf; border-radius: 12px; background: #fff; min-width: 0; }
.rc-seg { display: inline-flex; border: 1px solid #ddd8cf; border-radius: 10px; overflow: hidden; }
.rc-seg button { border: 0; background: #fff; padding: 9px 14px; font: 600 13px var(--font-body); cursor: pointer; color: #1d1d20; }
.rc-seg button.on { background: #1d1d20; color: #fff; }
.rc-sum { font-size: 13.5px; margin: 6px 0 14px; color: #1d1d20; }
.rc-sum span { color: var(--mid); }
.rc-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 14px; align-items: start; }
.rc-card { padding: 0; overflow: hidden; }
.rc-h { display: flex; gap: 12px; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--border); cursor: pointer; }
.rc-h .sw { width: 54px; height: 54px; border-radius: 8px; flex: none; background-size: cover; background-position: center; border: 1px solid #ece9e2; }
.rc-h .t { min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.rc-h .br { font: 700 10.5px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: var(--red); }
.rc-h b { font-size: 15px; }
.rc-h span { font-size: 12.5px; color: var(--mid); }
.rc-row { display: grid; grid-template-columns: minmax(0, 1fr); gap: 5px; padding: 10px 14px; border-top: 1px solid #f0ede7; }
.rc-row:first-child { border-top: 0; }
.rc-row .who { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.rc-row .who a { font-weight: 700; font-size: 14px; color: #1d1d20; cursor: pointer; text-decoration: none; }
.rc-row .who a:hover { color: var(--red); }
.rc-row .who .sw { width: 30px; height: 30px; border-radius: 6px; background-size: cover; background-position: center; border: 1px solid #ece9e2; align-self: center; flex: none; }
.rc-row .who span { font-size: 12px; color: var(--mid); }
.rc-chips { display: flex; gap: 5px; flex-wrap: wrap; }
.rc-chips i { font-style: normal; background: #f3f1ec; border-radius: 7px; padding: 3px 8px; font: 600 12px var(--font-body); color: #1d1d20; }
.rc-chips i small { font-weight: 500; color: var(--mid); }
.rc-chips i em { font-style: normal; color: var(--red); font-weight: 700; }
.rc-es { font-size: 12px; color: var(--mid); }
.rc-es a { color: var(--mid); cursor: pointer; text-decoration: underline dotted; }
.rc-es a:hover { color: var(--red); }
.rc-none { margin-top: 18px; font-size: 13px; color: var(--mid); max-width: 900px; line-height: 1.5; }
.rc-none b { color: #1d1d20; }
@media (max-width: 560px) { .rc-list { grid-template-columns: minmax(0, 1fr); } .rc-top input { flex-basis: 100%; } }
</style>`);

let rcQ = '', rcBy = 'colore', rcT = null;

/* cosa si cerca: se tutte le parole sono codici del listino si cercano quei codici, se no le parole devono esserci tutte
   in marca, serie, colore, gruppo o codici del campione */
function rcMatch(q) {
  const toks = String(q || '').toUpperCase().split(/[\s,;]+/).filter(Boolean); if (!toks.length) return null;
  const idx = codeIndex(), code = t => idx[t] ? t : /^00[A-Z0-9]{6}$/.test(t) && idx[t.slice(2, 6)] ? t.slice(2, 6) : null, codes = toks.map(code);
  if (codes.every(Boolean)) { const set = new Set(codes); return { codes: [...set], test: s => (s.k || []).some(k => set.has(String(k).toUpperCase())) }; }
  const words = normTxt(q).split(' ').filter(Boolean);
  return { words, test: s => { const h = ' ' + normTxt([s.b, s.s, s.c, s.g || '', ...(s.k || [])].join(' ')) + ' '; return words.every(w => h.includes(w)); } };
}
const rcCol = s => s.b + '|' + s.s + '|' + s.c;
const rcFin = s => s.fv || (s.f || []).length === 1 ? s.f[0] : s.toz ? s.v || '' : '';
const rcLabel = s => fmt(String(s.z || '').replace(/\s*tozzetto/i, '')) + (s.toz ? ' tozzetto' : '');
/* i campioni negli espositori dei clienti che corrispondono */
function rcHits(m) {
  const out = [];
  Object.values(comps).forEach(c => {
    const cl = c.client && clients[c.client]; if (!cl || !DISP[c.disp]) return;
    (c.slots || []).forEach(k => { const s = k && SAMPLE[k]; if (s && m.test(s)) out.push({ cl, c, s }); });
  });
  return out;
}
/* un gruppo (colore di un cliente): i formati con la finitura e quante volte, e gli espositori */
const rcAdd = (o, h) => {
  const key = rcLabel(h.s) + '|' + rcFin(h.s), x = o.fm.get(key) || { z: rcLabel(h.s), zr: h.s.z, f: rcFin(h.s), n: 0 };
  x.n++; o.fm.set(key, x); o.es.set(h.c.id, h.c.name || (DISP[h.c.disp] || {}).name || 'Espositore');
};
const rcChips = o => `<div class="rc-chips">${[...o.fm.values()].sort((a, b) => srBySize(a.zr, b.zr) || a.z.localeCompare(b.z) || a.f.localeCompare(b.f)).map(x =>
  `<i>${esc(x.z)}${x.f ? ` <small>${esc(x.f)}</small>` : ''}${x.n > 1 ? ` <em>×${x.n}</em>` : ''}</i>`).join('')}</div>`;
const rcEs = o => `<div class="rc-es">${o.es.size === 1 ? 'Espositore' : 'Espositori'}: ${[...o.es].map(([id, n]) => `<a onclick="openComp('${id}', '#/ricerca')">${esc(n)}</a>`).join(', ')}</div>`;
const rcName = s => `${glTitle(s.s)} ${glTitle(s.c)}`;
const rcSerie = s => `go('#/serie/${encodeURIComponent(s.b + '|' + s.s)}')`;

function renderRicerca() {
  const v = document.getElementById('viewRicerca');
  rcQ = ui.rcQ || ''; rcBy = ui.rcBy || 'colore';
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><button class="btn" onclick="go('#/')"><svg class="ic"><use href="#i-left"/></svg> Clienti</button><h2>Ricerca campioni</h2></div>
    <div class="rc-intro">Scrivi un codice (anche più codici, o la riga d'ordine 00XXXX01) oppure la serie e il colore: vedi i clienti che hanno
      quel campione negli espositori, con i formati e le finiture. Tocca il cliente per aprirlo o l'espositore per aprire la composizione.</div>
    <div class="rc-top"><input id="rcIn" type="search" placeholder="es. ENM5  ·  Mapierre Blanc  ·  Pigmento Amaranto" value="${esc(rcQ)}" autocomplete="off">
      <div class="rc-seg"><button data-by="colore"${rcBy === 'colore' ? ' class="on"' : ''}>Per colore</button><button data-by="cliente"${rcBy === 'cliente' ? ' class="on"' : ''}>Per cliente</button></div></div>
    <div id="rcRes"></div></div>`;
  const inp = v.querySelector('#rcIn');
  inp.addEventListener('input', () => { clearTimeout(rcT); rcT = setTimeout(() => { rcQ = inp.value; ui.rcQ = rcQ; saveUI(); rcResults(); }, 180); });
  v.querySelectorAll('.rc-seg button').forEach(b => b.onclick = () => {
    rcBy = b.dataset.by; ui.rcBy = rcBy; saveUI();
    v.querySelectorAll('.rc-seg button').forEach(x => x.classList.toggle('on', x === b)); rcResults();
  });
  rcResults();
  if (!/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) inp.focus();
}
function rcResults() {
  const el = document.getElementById('rcRes'); if (!el) return;
  const m = rcMatch(rcQ);
  if (!m) { el.innerHTML = ''; return; }
  const hits = rcHits(m), MAX = 80;
  // i colori che corrispondono nel listino (per dire quali non li ha nessuno)
  const all = new Map(); expandFin(SAMPLES).concat(TOZ_A4, TOZ_SAMPLES).forEach(s => { if (m.test(s) && !all.has(rcCol(s))) all.set(rcCol(s), s); });
  const had = new Set(hits.map(h => rcCol(h.s)));
  const none = [...all.values()].filter(s => !had.has(rcCol(s)));
  const nCl = new Set(hits.map(h => h.cl.id)).size, nEs = new Set(hits.map(h => h.c.id)).size;
  const what = m.codes ? m.codes.join(', ') : `“${esc(rcQ.trim())}”`;
  let html = hits.length ? `<div class="rc-sum"><b>${nCl} ${nCl === 1 ? 'cliente' : 'clienti'}</b> <span>· ${nEs} ${nEs === 1 ? 'espositore' : 'espositori'} · ${hits.length} ${hits.length === 1 ? 'campione' : 'campioni'} · ${had.size} ${had.size === 1 ? 'colore' : 'colori'} per ${what}</span></div>`
    : `<div class="rc-sum"><b>Nessun cliente</b> <span>ha ${all.size ? (all.size === 1 ? 'questo campione' : 'questi campioni') : 'campioni per ' + what}${all.size ? '' : ' (non è nel listino)'}</span></div>`;
  if (rcBy === 'cliente') {
    const by = new Map();
    hits.forEach(h => {
      const g = by.get(h.cl.id) || { cl: h.cl, cols: new Map() }; by.set(h.cl.id, g);
      const o = g.cols.get(rcCol(h.s)) || { s: h.s, fm: new Map(), es: new Map() }; g.cols.set(rcCol(h.s), o); rcAdd(o, h);
    });
    const list = [...by.values()].sort((a, b) => a.cl.name.localeCompare(b.cl.name));
    html += `<div class="rc-list">${list.slice(0, MAX).map(g => `<div class="card rc-card">
      <div class="rc-h" onclick="go('#/cliente/${g.cl.id}')"><div class="t"><b>${esc(g.cl.name)}</b><span>${esc([g.cl.city, g.cl.contact].filter(Boolean).join(' · ') || '—')} · ${g.cols.size} ${g.cols.size === 1 ? 'colore' : 'colori'}</span></div></div>
      ${[...g.cols.values()].sort((a, b) => rcName(a.s).localeCompare(rcName(b.s))).map(o => `<div class="rc-row">
        <div class="who"><i class="sw" style="${swatchStyle(o.s)}"></i><a onclick="${rcSerie(o.s)}">${esc(rcName(o.s))}</a><span>${esc(o.s.b)}</span></div>
        ${rcChips(o)}${rcEs(o)}</div>`).join('')}</div>`).join('')}</div>`;
    if (list.length > MAX) html += `<div class="rc-none">E altri ${list.length - MAX} clienti: scrivi qualcosa in più per restringere.</div>`;
  } else {
    const by = new Map();
    hits.forEach(h => {
      const g = by.get(rcCol(h.s)) || { s: h.s, cls: new Map() }; by.set(rcCol(h.s), g);
      const o = g.cls.get(h.cl.id) || { cl: h.cl, fm: new Map(), es: new Map() }; g.cls.set(h.cl.id, o); rcAdd(o, h);
    });
    const list = [...by.values()].sort((a, b) => b.cls.size - a.cls.size || rcName(a.s).localeCompare(rcName(b.s)));
    html += `<div class="rc-list">${list.slice(0, MAX).map(g => `<div class="card rc-card">
      <div class="rc-h" onclick="${rcSerie(g.s)}" title="Apri la serie"><i class="sw" style="${swatchStyle(g.s)}"></i>
        <div class="t"><span class="br">${esc(g.s.b)}</span><b>${esc(rcName(g.s))}</b><span>${g.cls.size} ${g.cls.size === 1 ? 'cliente' : 'clienti'}</span></div></div>
      ${[...g.cls.values()].sort((a, b) => a.cl.name.localeCompare(b.cl.name)).map(o => `<div class="rc-row">
        <div class="who"><a onclick="go('#/cliente/${o.cl.id}')">${esc(o.cl.name)}</a>${o.cl.city ? `<span>${esc(o.cl.city)}</span>` : ''}</div>
        ${rcChips(o)}${rcEs(o)}</div>`).join('')}</div>`).join('')}</div>`;
    if (list.length > MAX) html += `<div class="rc-none">E altri ${list.length - MAX} colori: scrivi qualcosa in più per restringere.</div>`;
  }
  if (none.length && hits.length) html += `<div class="rc-none"><b>Non ce l'ha nessun cliente:</b> ${none.length > 40 ? `${none.length} colori` : none.map(s => esc(rcName(s))).join(', ')}</div>`;
  el.innerHTML = html;
}
