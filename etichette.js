'use strict';
/* ════════════════════════════════════════════════════════════
   ETICHETTE (#/etichette) — le etichette dei campioni, 40 × 20 mm come quella di esempio: in alto a sinistra il logo
   del marchio (Emilceramica, Ergon, Provenza, Viva; un altro marchio il nome scritto), in alto a destra il codice, sotto la serie
   e la descrizione (formato in mm, colore, finitura abbreviata: "600X1200 ROSSO SIENA SK R").
   Scrivi o incolla i codici (anche più per riga, anche le righe d'ordine 00XXXX01), controlli l'anteprima, correggi serie e
   descrizione se serve (la correzione resta ricordata per quel codice) e crei il PDF: una pagina 40 × 20 mm per etichetta,
   da stampare con la stampante di etichette. Loghi: loghi/<marchio>.png, neri su trasparente.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewEtichette'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="etichette"] #viewEtichette { display: block; }
.et-intro { color: var(--mid); font-size: 13px; margin: -8px 0 16px; max-width: 760px; line-height: 1.5; }
.et-in { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: end; max-width: 760px; margin-bottom: 14px; }
.et-in textarea { width: 100%; min-height: 64px; box-sizing: border-box; font: 600 14px ui-monospace, Menlo, Consolas, monospace; padding: 10px 12px; border: 1px solid #ddd8cf; border-radius: 10px; resize: vertical; text-transform: uppercase; }
.et-miss { max-width: 760px; margin: 0 0 14px; padding: 10px 12px; border-radius: 10px; background: #fff4f2; border: 1px solid #f0cdc8; font-size: 13px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.et-miss b { font-family: ui-monospace, Menlo, Consolas, monospace; }
.et-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin: 4px 0 14px; font-size: 13.5px; }
.et-bar span { color: var(--mid); }
.et-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
.et-card { padding: 12px; display: flex; flex-direction: column; gap: 7px; }
.et-card canvas { width: 100%; aspect-ratio: 2 / 1; display: block; background: #fff; border: 1px solid #e3dfd7; border-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,.08); margin-bottom: 4px; }
.et-card label { display: grid; grid-template-columns: 78px minmax(0, 1fr); align-items: center; gap: 8px; font-size: 12px; color: var(--mid); }
.et-card input, .et-card select { font: 600 13px var(--font-body); padding: 6px 8px; border: 1px solid #ddd8cf; border-radius: 8px; min-width: 0; background: #fff; color: #1d1d20; }
.et-card input[data-f] { text-transform: uppercase; }
.et-card .row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--mid); }
.et-card .src { flex: 1; min-width: 0; font-size: 11.5px; line-height: 1.35; }
.et-card .row input { width: 56px; text-align: center; }
.et-card .row .btn { padding: 6px 8px; }
.et-card.man { border-color: #e7b8b8; }
</style>`);

const ET_W = 40, ET_H = 20, ET_X = 3, ET_BRANDS = ['Emilceramica', 'Ergon', 'Provenza', 'Viva'];
const ET_LOGO = { Emilceramica: 'loghi/emilceramica.png', Ergon: 'loghi/ergon.png', Provenza: 'loghi/provenza.png', Viva: 'loghi/viva.png' };
let etList = (ui.etList || []).map(e => Object.assign({}, e)), etMissing = [];   // etichette da creare: { code, b, s, d, n, src, man }
const etImgs = {};
const etLogo = b => etImgs[b] || (etImgs[b] = ET_LOGO[b] ? schLoadImg(ET_LOGO[b]) : Promise.resolve(null));

/* descrizione come sulle scatole: formato in mm, colore, finitura abbreviata (Silktech R10 Rett. = SK R) */
const etMM = z => { const p = parseSize(z); return p ? p.map(v => Math.round(v * 10)).join('X') : String(z || '').toUpperCase(); };
const ET_FIN = [[/silktech plus/i, 'SK+'], [/silktech/i, 'SK'], [/full lappato/i, 'FULL LAP'], [/lappato antique/i, 'LAP ANT'], [/lappato/i, 'LAP'],
  [/natural/i, 'NAT'], [/tecnica/i, 'TEC'], [/bocciardato/i, 'BOC'], [/strutturato/i, 'STR'], [/antislip/i, 'ANTISLIP'], [/matt/i, 'MATT'], [/soft/i, 'SOFT'], [/lux/i, 'LUX']];
const etFin = f => { const m = ET_FIN.find(([re]) => re.test(f || '')); return [m ? m[1] : '', /rett/i.test(f || '') ? 'R' : ''].filter(Boolean).join(' '); };
/* il campione di un codice (anche il codice d'ordine 00XXXX01): il prodotto, se no il tozzetto */
function etFind(t) {
  const idx = codeIndex(), k = idx[t] ? t : /^00[A-Z0-9]{6}$/.test(t) && idx[t.slice(2, 6)] ? t.slice(2, 6) : null;
  return k ? { code: k, s: idx[k].find(x => !x.toz) || idx[k][0] } : null;
}
function etFrom(code, s) {
  const fin = (s.f || [])[0] || s.v || '', mine = (ui.etTxt || {})[code] || {};
  return { code, b: s.b, n: 1, s: mine.s || String(s.s || '').toUpperCase(),
    d: mine.d || [etMM(s.z), String(s.c || '').toUpperCase(), etFin(fin)].filter(Boolean).join(' '),
    src: [s.c, fmt(String(s.z || '').replace(/\s*tozzetto/i, '')) + (s.toz ? ' tozzetto' : ''), fin].filter(Boolean).join(' · ') };
}
const etSave = () => { ui.etList = etList; saveUI(); };

/* impaginazione in mm, come l'etichetta di esempio: logo in alto a sinistra (al massimo 7,3 mm di altezza), codice in alto
   a destra, serie e descrizione in grassetto spaziato. Un testo lungo si stringe (prima la spaziatura, poi il carattere);
   una descrizione che non ci sta nemmeno così va su due righe */
function etLayout(e, img) {
  const W = ET_W - 2 * ET_X - 0.3, tw = (t, f, cs) => schTextW(t, f, true) + cs * Math.max(0, t.length - 1);
  const fit = (t, f, min) => {
    let cs = f * 0.3528 * 0.1;
    if (tw(t, f, cs) > W) cs = Math.max(0, (W - schTextW(t, f, true)) / Math.max(1, t.length - 1));
    if (tw(t, f, cs) > W) f = Math.max(min, f * W / schTextW(t, f, true));
    return { f, cs, ok: tw(t, f, cs) <= W + 0.05 };
  };
  const out = { texts: [], logo: null }, code = String(e.code || '').toUpperCase(), cf = 8.5, cw = schTextW(code, cf, true), cx = ET_W - 3.2 - cw;
  if (code) out.texts.push({ t: code, x: cx, y: 7, f: cf, cs: 0 });
  const maxW = Math.min(21, (code ? cx : ET_W - 3) - 2.5 - 2.5), maxH = 7.3;
  if (img) { const sc = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight), w = img.naturalWidth * sc, h = img.naturalHeight * sc; out.logo = { x: 2.5, y: 2.3 + (maxH - h) / 2, w, h }; }
  else if (e.b) { const f = fit(String(e.b).toUpperCase(), 9, 5); out.texts.push({ t: String(e.b).toUpperCase(), x: ET_X, y: 7, f: Math.min(f.f, 9), cs: f.cs }); }
  const s = String(e.s || '').toUpperCase().trim(), d = String(e.d || '').toUpperCase().trim();
  let dl = [d], df = fit(d, 6.2, 4.6);
  if (d && !df.ok) {   // due righe, spezzate tra le parole il più possibile a metà
    const ws = d.split(/\s+/); let best = null;
    for (let i = 1; i < ws.length; i++) { const a = ws.slice(0, i).join(' '), b = ws.slice(i).join(' '), m = Math.max(schTextW(a, 5, true), schTextW(b, 5, true)); if (!best || m < best.m) best = { m, l: [a, b] }; }
    if (best) { dl = best.l; df = dl.map(t => fit(t, 5.2, 3.8)).reduce((a, b) => (a.f < b.f ? a : b)); }
  }
  if (s) { const sf = fit(s, 6.2, 4.2); out.texts.push({ t: s, x: ET_X, y: dl.length > 1 ? 12.6 : 13.5, f: sf.f, cs: sf.cs }); }
  if (d) dl.forEach((t, i) => { const g = dl.length > 1 ? fit(t, df.f, df.f) : df; out.texts.push({ t, x: ET_X, y: dl.length > 1 ? [15.9, 18.2][i] : 17.75, f: g.f, cs: g.cs }); });
  return out;
}
/* anteprima: la stessa impaginazione disegnata su un canvas */
function etDraw(cv, e) {
  etLogo(e.b).then(img => {
    const S = 14 * (window.devicePixelRatio || 1), L = etLayout(e, img), g = cv.getContext('2d');
    cv.width = ET_W * S; cv.height = ET_H * S;
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    if (L.logo) g.drawImage(img, L.logo.x * S, L.logo.y * S, L.logo.w * S, L.logo.h * S);
    g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
    L.texts.forEach(t => {
      g.font = `bold ${t.f * 0.3528 * S}px Helvetica, Arial, sans-serif`;
      let x = t.x * S; for (const ch of t.t) { g.fillText(ch, x, t.y * S); x += g.measureText(ch).width + t.cs * S; }
    });
  });
}
function renderEtichette() {
  const v = document.getElementById('viewEtichette'), tot = etList.reduce((a, e) => a + (+e.n || 0), 0);
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><button class="btn" onclick="go('#/')"><svg class="ic"><use href="#i-left"/></svg> Clienti</button><h2>Etichette campioni</h2>
      ${etList.length ? `<button class="btn red" onclick="etPDF()"><svg class="ic"><use href="#i-printer"/></svg> Crea PDF</button>` : ''}</div>
    <div class="et-intro">Scrivi o incolla i codici dei campioni: ogni etichetta è 40 × 20 mm, con il logo del marchio, il codice, la serie e la descrizione.
      Se serve correggi serie e descrizione (la correzione resta ricordata per quel codice), poi <b>Crea PDF</b>: una pagina per etichetta, da stampare con la stampante di etichette.</div>
    <div class="et-in"><textarea id="etCodes" placeholder="ENM5  ENMK  ENME…   (anche separati da virgole o uno per riga)"></textarea>
      <button class="btn red" onclick="etAdd()"><svg class="ic"><use href="#i-plus"/></svg> Aggiungi</button></div>
    ${etMissing.length ? `<div class="et-miss">Non trovati nel listino: ${etMissing.map(t => `<b>${esc(t)}</b>`).join(', ')}
      <button class="btn" onclick="etManual()"><svg class="ic"><use href="#i-pencil"/></svg> Scrivili a mano</button><button class="btn" onclick="etMissing = []; renderEtichette()">Lascia stare</button></div>` : ''}
    ${etList.length ? `<div class="et-bar"><b>${tot} ${tot === 1 ? 'etichetta' : 'etichette'}</b><span>· ${etList.length} ${etList.length === 1 ? 'codice' : 'codici'}</span>
      <button class="btn" onclick="etClear()"><svg class="ic"><use href="#i-trash"/></svg> Svuota</button></div>` : ''}
    <div class="et-list">${etList.map((e, i) => `<div class="card et-card${e.man ? ' man' : ''}" data-i="${i}"><canvas></canvas>
      <label>Marchio<select data-k="b">${ET_BRANDS.concat(ET_BRANDS.includes(e.b) ? [] : [e.b]).map(b => `<option${b === e.b ? ' selected' : ''}>${esc(b)}</option>`).join('')}</select></label>
      ${e.man ? `<label>Codice<input data-f="code" value="${esc(e.code)}"></label>` : ''}
      <label>Serie<input data-f="s" value="${esc(e.s)}"></label>
      <label>Descrizione<input data-f="d" value="${esc(e.d)}"></label>
      <div class="row"><span class="src">${e.man ? 'Scritta a mano' : `<b>${esc(e.code)}</b> · ${esc(e.src || '')}`}</span>
        ${!e.man && (ui.etTxt || {})[e.code] ? `<button class="btn" title="Torna al testo del listino" onclick="etReset(${i})"><svg class="ic"><use href="#i-undo"/></svg></button>` : ''}
        Copie <input type="number" min="0" max="99" data-n value="${+e.n || 0}">
        <button class="btn" title="Togli" onclick="etDel(${i})"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>`).join('')}</div>
  </div>`;
  const ta = document.getElementById('etCodes');
  ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) etAdd(); });
  v.querySelectorAll('.et-card').forEach(card => {
    const e = etList[+card.dataset.i], cv = card.querySelector('canvas');
    etDraw(cv, e);
    card.querySelectorAll('input[data-f]').forEach(inp => inp.addEventListener('input', () => {
      e[inp.dataset.f] = inp.value.toUpperCase();
      if (!e.man && inp.dataset.f !== 'code') ui.etTxt = Object.assign({}, ui.etTxt, { [e.code]: { s: e.s, d: e.d } });   // ricordata per il codice
      etSave(); etDraw(cv, e);
    }));
    card.querySelector('select').addEventListener('change', ev => { e.b = ev.target.value; etSave(); etDraw(cv, e); });
    card.querySelector('input[data-n]').addEventListener('change', ev => { e.n = Math.max(0, Math.min(99, parseInt(ev.target.value, 10) || 0)); etSave(); renderEtichette(); });
  });
}
function etAdd() {
  const ta = document.getElementById('etCodes'), toks = ta.value.toUpperCase().split(/[^A-Z0-9]+/).filter(t => t.length >= 4 && t.length <= 10);
  let n = 0; const miss = [];
  toks.forEach(t => {
    const f = etFind(t);
    if (!f) { if ((t.length === 4 && /[A-Z]/.test(t) || /^00[A-Z0-9]{6}$/.test(t)) && !miss.includes(t)) miss.push(t); return; }
    const same = etList.find(e => !e.man && e.code === f.code);   // lo stesso codice due volte = due copie
    if (same) same.n = (+same.n || 0) + 1; else etList.push(etFrom(f.code, f.s));
    n++;
  });
  etMissing = miss; etSave(); renderEtichette();
  if (!n && !miss.length) toast('Scrivi uno o più codici, per esempio ENM5');
}
function etManual() {
  etMissing.forEach(t => etList.push({ code: t, b: 'Emilceramica', s: '', d: '', n: 1, man: true }));
  etMissing = []; etSave(); renderEtichette();
}
function etDel(i) { etList.splice(i, 1); etSave(); renderEtichette(); }
function etClear() { etList = []; etMissing = []; etSave(); renderEtichette(); }
function etReset(i) {
  const e = etList[i], f = etFind(e.code); if (!f) return;
  const t = Object.assign({}, ui.etTxt); delete t[e.code]; ui.etTxt = t;
  etList[i] = Object.assign(etFrom(f.code, f.s), { n: e.n, b: e.b }); etSave(); renderEtichette();
}
/* il PDF: una pagina 40 × 20 mm per etichetta (le copie una dopo l'altra), testi veri e logo nitido */
async function etPDF() {
  const list = etList.filter(e => (+e.n || 0) > 0);
  if (!list.length) return toast('Nessuna etichetta da stampare: metti almeno una copia');
  try { await loadPdfLibs(); } catch (e) { return toast('Non riesco a preparare il PDF: controlla la connessione'); }
  const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'mm', format: [ET_W, ET_H], compress: true });
  let first = true;
  for (const e of list) {
    const img = await etLogo(e.b), L = etLayout(e, img);
    for (let i = 0; i < e.n; i++) {
      if (!first) pdf.addPage([ET_W, ET_H], 'landscape'); first = false;
      if (L.logo) pdf.addImage(img, 'PNG', L.logo.x, L.logo.y, L.logo.w, L.logo.h, 'logo-' + e.b);
      pdf.setFont('helvetica', 'bold'); pdf.setTextColor(0, 0, 0);
      L.texts.forEach(t => { pdf.setFontSize(t.f); pdf.text(t.t, t.x, t.y, t.cs > 0.005 ? { charSpace: t.cs } : {}); });
    }
  }
  const tot = list.reduce((a, e) => a + e.n, 0);
  schDeliver(pdf, `etichette-${list.length === 1 ? list[0].code : tot + '-campioni'}.pdf`, tot === 1 ? 'Etichetta' : tot + ' etichette');
}
