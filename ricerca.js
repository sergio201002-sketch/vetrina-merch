'use strict';
/* ════════════════════════════════════════════════════════════
   RICERCA CAMPIONI (#/ricerca) — chi ha un campione: scrivi uno o più codici (anche le righe d'ordine 00XXXX01) oppure
   marca, serie e colore ("mapierre blanc", "pigmento amaranto") e vedi i clienti che lo hanno negli espositori, con i
   formati e le finiture, per colore o per cliente. Tocca il cliente per aprirlo, l'espositore per aprire la composizione.
   «Tutti i formati»: di quella serie e colore tutti i formati a listino (finitura, spessore, codice) e chi ha ciascuno.
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
.rc-h .btn { margin-left: auto; flex: none; padding: 6px 10px; font-size: 12.5px; }
.rc-sum .btn { margin-left: 10px; padding: 6px 10px; font-size: 12.5px; vertical-align: middle; }
/* tutti i formati di un colore: formato, finitura e spessore, codice; sotto chi li ha */
.rc-fr { display: grid; grid-template-columns: 92px minmax(0, 1fr) auto; gap: 3px 10px; align-items: baseline; padding: 8px 14px; border-top: 1px solid #f0ede7; font-size: 13px; }
.rc-fr b { font-size: 13.5px; }
.rc-fr code { font: 700 12.5px ui-monospace, Menlo, Consolas, monospace; color: #1d1d20; text-align: right; }
.rc-fr .cl { grid-column: 1 / -1; font-size: 12px; color: var(--mid); }
.rc-fr .cl a { color: #1d1d20; font-weight: 600; cursor: pointer; }
.rc-fr .cl a:hover { color: var(--red); }
/* formato che qualche cliente ha: riga verde, nomi dei clienti più grandi */
.rc-fr.own { background: #e6f4ea; box-shadow: inset 3px 0 0 #1f8a4c; }
.rc-fr.own .cl { font-size: 13px; color: #1f6b3c; margin-top: 2px; }
.rc-fr.own .cl a { font-size: 15px; font-weight: 800; color: #14532d; }
.rc-fr.hit { box-shadow: inset 3px 0 0 var(--red); }
.rc-fr.hit:not(.own) { background: #fff4f2; }
.rc-fr.hit code { color: var(--red); }
.rc-none b { color: #1d1d20; }
@media (max-width: 560px) { .rc-list { grid-template-columns: minmax(0, 1fr); } .rc-top input { flex-basis: 100%; } .rc-fr { grid-template-columns: 74px minmax(0, 1fr) auto; } }
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
      quel campione negli espositori, con i formati e le finiture. Tocca il cliente per aprirlo o l'espositore per aprire la composizione.
      Con <b>Tutti i formati</b> vedi di quella serie e colore tutti i formati a listino, con finitura, spessore, codice e chi li ha.</div>
    <div class="rc-top"><input id="rcIn" type="search" placeholder="es. ENM5  ·  Mapierre Blanc  ·  Pigmento Amaranto" value="${esc(rcQ)}" autocomplete="off">
      <div class="rc-seg">${[['colore', 'Per colore'], ['cliente', 'Per cliente'], ['formati', 'Tutti i formati']].map(([k, t]) =>
        `<button data-by="${k}"${rcBy === k ? ' class="on"' : ''}>${t}</button>`).join('')}</div></div>
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
/* «Tutti i formati» (dal riquadro di un colore: si va subito a quel colore) */
function rcGoFmt(k) {
  rcBy = 'formati'; ui.rcBy = rcBy; saveUI();
  document.querySelectorAll('.rc-seg button').forEach(x => x.classList.toggle('on', x.dataset.by === rcBy));
  rcResults();
  const c = k && [...document.querySelectorAll('#rcRes .rc-card')].find(x => x.dataset.k === k);
  if (c) c.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
/* chi ha quel formato (o il colore in tozzetto) */
const rcWho = hs => { const cl = [...new Map(hs.map(h => [h.cl.id, h.cl])).values()].sort((a, b) => a.name.localeCompare(b.name));
  return `<div class="cl">${cl.length ? `Ce l'${cl.length === 1 ? 'ha' : 'hanno'}: ${cl.map(c => `<a onclick="go('#/cliente/${c.id}')">${esc(c.name)}</a>`).join(', ')}` : 'Nessun cliente'}</div>`; };
/* tutti i formati a listino dei colori trovati (finitura, spessore, codice), con i clienti che hanno ciascuno; in rosso il codice cercato */
function rcFormats(m, cols, what) {
  const rows = new Map(), MAX = 60;
  expandFin(SAMPLES).forEach(s => { const k = rcCol(s); if (cols.has(k)) rows.set(k, [...(rows.get(k) || []), s]); });
  const fh = rcHits({ test: s => cols.has(rcCol(s)) });
  const has = (h, r) => h.s.key === r.key || (!h.s.toz && h.s.z === r.z && (h.s.k || []).some(k => (r.k || []).includes(k)));
  const list = [...rows].sort((a, b) => rcName(a[1][0]).localeCompare(rcName(b[1][0])));
  if (!list.length) return `<div class="rc-sum"><b>Nessun formato</b> <span>a listino per ${what}</span></div>`;
  return `<div class="rc-sum"><b>${list.length} ${list.length === 1 ? 'colore' : 'colori'}</b> <span>· tutti i formati a listino per ${what}</span></div>
    <div class="rc-list">${list.slice(0, MAX).map(([k, rs]) => {
      const s0 = rs[0], hs = fh.filter(h => rcCol(h.s) === k), ncl = new Set(hs.map(h => h.cl.id)).size, toz = hs.filter(h => h.s.toz);
      rs.sort((a, b) => srBySize(a.z, b.z) || String(a.z).localeCompare(String(b.z)) || String((a.f || [])[0] || '').localeCompare(String((b.f || [])[0] || '')));
      return `<div class="card rc-card" data-k="${esc(k)}"><div class="rc-h" onclick="${rcSerie(s0)}" title="Apri la serie"><i class="sw" style="${swatchStyle(s0)}"></i>
        <div class="t"><span class="br">${esc(s0.b)}</span><b>${esc(rcName(s0))}</b><span>${rs.length} ${rs.length === 1 ? 'formato' : 'formati'} · ${ncl ? `${ncl} ${ncl === 1 ? 'cliente' : 'clienti'}` : 'nessun cliente'}</span></div></div>
        ${rs.map(r => { const hit = m.codes && (r.k || []).some(c => m.codes.includes(String(c).toUpperCase()));
          const who = hs.filter(h => has(h, r));
          return `<div class="rc-fr${hit ? ' hit' : ''}${who.length ? ' own' : ''}"><b>${esc(rcLabel(r))}</b><span>${esc([(r.f || []).join(' / '), (r.t || []).length ? r.t.join(' / ') + ' mm' : ''].filter(Boolean).join(' · '))}</span>
            <code>${esc((r.k || []).join(' '))}</code>${rcWho(who)}</div>`; }).join('')}
        ${toz.length ? `<div class="rc-fr own"><b>Tozzetto</b><span></span><code></code>${rcWho(toz)}</div>` : ''}</div>`; }).join('')}</div>
    ${list.length > MAX ? `<div class="rc-none">E altri ${list.length - MAX} colori: scrivi qualcosa in più per restringere.</div>` : ''}`;
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
  if (rcBy === 'formati') { el.innerHTML = rcFormats(m, new Set(all.keys()), what); return; }
  let html = hits.length ? `<div class="rc-sum"><b>${nCl} ${nCl === 1 ? 'cliente' : 'clienti'}</b> <span>· ${nEs} ${nEs === 1 ? 'espositore' : 'espositori'} · ${hits.length} ${hits.length === 1 ? 'campione' : 'campioni'} · ${had.size} ${had.size === 1 ? 'colore' : 'colori'} per ${what}</span></div>`
    : `<div class="rc-sum"><b>Nessun cliente</b> <span>ha ${all.size ? (all.size === 1 ? 'questo campione' : 'questi campioni') : 'campioni per ' + what}${all.size ? '' : ' (non è nel listino)'}</span>
      ${all.size ? `<button class="btn" onclick="rcGoFmt()"><svg class="ic"><use href="#i-tiles"/></svg> Tutti i formati</button>` : ''}</div>`;
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
    html += `<div class="rc-list">${list.slice(0, MAX).map(g => `<div class="card rc-card" data-k="${esc(rcCol(g.s))}">
      <div class="rc-h" onclick="${rcSerie(g.s)}" title="Apri la serie"><i class="sw" style="${swatchStyle(g.s)}"></i>
        <div class="t"><span class="br">${esc(g.s.b)}</span><b>${esc(rcName(g.s))}</b><span>${g.cls.size} ${g.cls.size === 1 ? 'cliente' : 'clienti'}</span></div>
        <button class="btn" onclick="event.stopPropagation(); rcGoFmt(this.closest('.rc-card').dataset.k)" title="Tutti i formati a listino di questo colore, con chi li ha"><svg class="ic"><use href="#i-tiles"/></svg> Tutti i formati</button></div>
      ${[...g.cls.values()].sort((a, b) => a.cl.name.localeCompare(b.cl.name)).map(o => `<div class="rc-row">
        <div class="who"><a onclick="go('#/cliente/${o.cl.id}')">${esc(o.cl.name)}</a>${o.cl.city ? `<span>${esc(o.cl.city)}</span>` : ''}</div>
        ${rcChips(o)}${rcEs(o)}</div>`).join('')}</div>`).join('')}</div>`;
    if (list.length > MAX) html += `<div class="rc-none">E altri ${list.length - MAX} colori: scrivi qualcosa in più per restringere.</div>`;
  }
  if (none.length && hits.length) html += `<div class="rc-none"><b>Non ce l'ha nessun cliente:</b> ${none.length > 40 ? `${none.length} colori` : none.map(s => esc(rcName(s))).join(', ')}</div>`;
  el.innerHTML = html;
}
