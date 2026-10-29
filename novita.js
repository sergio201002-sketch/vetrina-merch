'use strict';
/* ════════════════════════════════════════════════════════════
   NOVITÀ (#/novita) — serie nuove non ancora a listino. Una novità è una SERIE con più colori:
   - i formati (con spessore e finiture) si scrivono una volta per la serie e valgono per tutti i colori;
   - ogni colore ha la sua foto, il nome e, se serve, la variante (es. Matera Stone: "Sassi" e "Neutra");
     a un colore si può togliere un formato della serie o aggiungere un formato solo suo;
   - i codici (facoltativi) sono per colore, formato e finitura.
   Ogni colore × formato diventa un campione (etichetta NOVITÀ; con più finiture una variante per finitura, come il listino):
   compare nei "Campioni compatibili" degli espositori di quel formato e si campiona come gli altri.
   Dati: novita = { id: { id, b, s, note, fmts: [{ z, t, fins: [{ f }] }],
                          colors: [{ id, c, v, off: [formati tolti], extra: [{ z, t, fins }], codes: { 'z|finitura': codice } }], upd } }
   (le prime novità avevano un colore solo { c, fmts con i codici }: si leggono ancora). Foto: chiave "NEW|id|colore".
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewNovita'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="novita"] #viewNovita { display: block; }
.nv-intro { color: var(--mid); font-size: 13px; margin: -8px 0 16px; max-width: 760px; line-height: 1.5; }
.nv-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.nv-ph { background: #f3f1ec; position: relative; display: flex; flex-direction: column; gap: 2px; }
.nv-ph .pr { display: grid; grid-template-columns: repeat(var(--n, 1), 1fr); gap: 2px; height: var(--h, 170px); position: relative; }
.nv-ph .pr span { background: #ebe8e2 center / cover no-repeat; display: flex; align-items: center; justify-content: center; color: var(--mid); font-size: 12px; font-weight: 600; min-width: 0; }
.nv-ph .pr .vl { position: absolute; right: 6px; bottom: 6px; background: rgba(20,20,22,.78); color: #fff; font: 700 10.5px var(--font-body); padding: 2px 7px; border-radius: 6px; }
.nv-ph .nwb { position: absolute; left: 10px; top: 10px; z-index: 1; }
.nv-card .in { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.nv-card .br { font: 700 10.5px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: var(--red); }
.nv-card h3 { margin: 0; font-size: 15.5px; }
.nv-card .cols { font-size: 12.5px; line-height: 1.45; }
.nv-card .cols b { font-weight: 700; }
.nv-card .fm { font-size: 12px; line-height: 1.45; color: #333; }
.nv-card .where { font-size: 11.5px; color: var(--mid); }
.nv-card .acts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; }
.nwb { display: inline-block; background: #1f8a4c; color: #fff; font: 800 9.5px var(--font-body); letter-spacing: .1em; padding: 2px 6px; border-radius: 5px; vertical-align: 1px; }
#novModal .mbox { max-width: 680px; width: calc(100vw - 32px); }
#novModal .nv-body { padding: 6px 18px 18px; display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 130px); overflow: auto; }
#novModal .nv-row { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; }
#novModal .nv-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
#novModal label.f { display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; font-weight: 700; color: var(--mid); }
#novModal input, #novModal textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 14px; background: #fff; width: 100%; box-sizing: border-box; min-width: 0; }
#novModal textarea { min-height: 52px; resize: vertical; }
#novModal .nv-fmt { border: 1px solid var(--border); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; background: #faf9f6; }
#novModal .nv-fmt .hd { display: grid; grid-template-columns: 1fr 110px auto; gap: 8px; align-items: end; }
#novModal .nv-fin { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center; }
#novModal .x { border: 1px solid var(--border); background: #fff; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex: none; }
#novModal .t2 { font: 700 11px var(--font-body); letter-spacing: .1em; text-transform: uppercase; color: var(--mid); display: flex; align-items: center; gap: 8px; }
#novModal .t2 small { text-transform: none; letter-spacing: 0; font-weight: 500; }
#novModal .nv-col { border: 1px solid var(--border); border-radius: 14px; padding: 10px; display: flex; flex-direction: column; gap: 9px; background: #fff; }
#novModal .nv-col .ch { display: grid; grid-template-columns: 92px 1fr; gap: 10px; align-items: start; }
#novModal .nv-col .pv { width: 92px; height: 92px; border-radius: 10px; background: #f3f1ec center / cover no-repeat; border: 1px solid #ece9e2; display: flex; align-items: center; justify-content: center; color: var(--mid); cursor: pointer; }
#novModal .nv-col .cb { display: flex; gap: 6px; margin-top: 7px; flex-wrap: wrap; }
#novModal .cfm { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; font-size: 12px; }
#novModal .cfm .k { color: var(--mid); font-weight: 700; margin-right: 2px; }
#novModal .chip { border: 1px solid var(--border); background: #fff; border-radius: 14px; padding: 4px 10px; font: 600 12px var(--font-body); cursor: pointer; }
#novModal .chip.on { background: #1d1d20; border-color: #1d1d20; color: #fff; }
#novModal .chip.off { text-decoration: line-through; color: var(--mid); }
#novModal .btn.sm { padding: 4px 10px; font-size: 12px; }
#novModal details.cod { border-top: 1px dashed #e2ded6; padding-top: 6px; }
#novModal details.cod summary { cursor: pointer; font-size: 12px; font-weight: 700; color: var(--mid); }
#novModal .nv-code { display: grid; grid-template-columns: 1fr 120px; gap: 8px; align-items: center; font-size: 12.5px; margin-top: 5px; }
#novModal .foot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 560px) { #novModal .nv-row, #novModal .nv-row2 { grid-template-columns: 1fr; } #novModal .nv-fmt .hd { grid-template-columns: 1fr 80px auto; } #novModal .nv-col .ch { grid-template-columns: 72px 1fr; } #novModal .nv-col .pv { width: 72px; height: 72px; } }
</style>`);

const nvZ = z => String(z || '').toLowerCase().replace(/[×*]/g, 'x').replace(/\s+/g, '').replace(/\./g, ',');   // "60 × 120" → "60x120"
const nvIk = id => 'NEW|' + id;
const nvNewColor = () => ({ id: 'c' + Math.random().toString(36).slice(2, 8), c: '', v: '', off: [], extra: [], codes: {} });
/* colori di una novità (le prime avevano un colore solo: diventa il colore "c1", con la sua foto e i suoi codici) */
function nvColors(p) {
  if (p.colors) return p.colors;
  const codes = {};
  (p.fmts || []).forEach(fm => (fm.fins || []).forEach(x => { if (x.k) codes[nvZ(fm.z) + '|' + String(x.f || '').trim()] = x.k; }));
  return [{ id: 'c1', c: p.c || '', v: '', ik: nvIk(p.id), off: [], extra: [], codes }];
}
const nvColIk = (p, col) => col.ik || `NEW|${p.id}|${col.id}`;
const nvColName = col => ((col.v ? col.v.trim() + ' ' : '') + String(col.c || '').trim()).trim();
/* formati di un colore: quelli della serie (meno quelli tolti) + quelli solo suoi; un formato solo suo con la stessa misura
   di uno della serie lo sostituisce per quel colore (es. il Grey 60×120 ha una finitura sola) */
const nvColFmts = (p, col) => {
  const own = (col.extra || []).map(fm => nvZ(fm.z));
  return [...(p.fmts || []).filter(fm => !(col.off || []).includes(nvZ(fm.z)) && !own.includes(nvZ(fm.z))), ...(col.extra || [])];
};
function saveNovita() { LS.set('vm_novita_v1', novita); applyNovita(); markDirty(); }

/* le novità diventano campioni: uno per colore e formato; con più finiture una variante per finitura, come il listino */
function applyNovita() {
  for (let i = SAMPLES.length - 1; i >= 0; i--) if (SAMPLES[i].nuovo) SAMPLES.splice(i, 1);
  Object.keys(SAMPLE).forEach(k => { if (k.startsWith('NEW|')) delete SAMPLE[k]; });
  Object.keys(FIN_VAR).forEach(k => { if (k.startsWith('NEW|')) delete FIN_VAR[k]; });
  Object.values(novita || {}).forEach(p => nvColors(p).forEach(col => nvColFmts(p, col).forEach(fm => {
    const z = nvZ(fm.z), name = nvColName(col); if (!parseSize(z) || !name) return;
    const fins = (fm.fins || []).filter(x => x.f && x.f.trim()).map(x => ({ f: x.f.trim(), k: String((col.codes || {})[z + '|' + x.f.trim()] || x.k || '').trim().toUpperCase() }));
    const key = `NEW|${p.id}|${col.id}|${z}`;
    const s = { b: p.b || 'Novità', s: String(p.s || '').trim().toUpperCase(), c: name, z, f: fins.map(x => x.f), k: fins.map(x => x.k).filter(Boolean),
      t: fm.t ? [String(fm.t).trim().replace('.', ',')] : [], key, ik: nvColIk(p, col), nuovo: true };
    if (SAMPLE[key]) return;                                    // stesso formato due volte nello stesso colore
    SAMPLES.push(s); SAMPLE[key] = s;
    if (fins.length > 1) FIN_VAR[key] = fins.map((x, i) => { const v = Object.assign({}, s, { f: [x.f], k: x.k ? [x.k] : [], key: key + '#' + (x.k || 'f' + i), base: key, pkey: key, fv: true }); SAMPLE[v.key] = v; return v; });
  })));
  // campioni messi con la prima versione (chiave NEW|id|formato): diventano del colore "c1"
  let moved = false;
  Object.values(comps || {}).forEach(c => (c.slots || []).forEach((k, i) => {
    const m = k && /^NEW\|([^|]+)\|(\d[^|#]*x[^|#]*)(#.*)?$/.exec(k);
    if (m && !SAMPLE[k]) { c.slots[i] = `NEW|${m[1]}|c1|${m[2]}${m[3] || ''}`; moved = true; }
  }));
  if (moved) LS.set('vm_comps_v1', comps);
  if (typeof CODE_IDX !== 'undefined') CODE_IDX = null;   // i codici delle novità si possono incollare
}
applyNovita();

const nvSamples = p => SAMPLES.filter(s => s.nuovo && s.key.startsWith('NEW|' + p.id + '|'));
/* in quali espositori entra (almeno un colore e formato) */
function nvWhere(p) {
  const ss = nvSamples(p);
  return DISPLAYS.filter(d => d.slots && !d.accept.tozzetto && ss.some(s => accepts(d, s))).map(d => d.name);
}

function renderNovita() {
  const v = document.getElementById('viewNovita');
  const list = Object.values(novita).sort((a, b) => (b.upd || 0) - (a.upd || 0));
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><button class="btn" onclick="go('#/')"><svg class="ic"><use href="#i-left"/></svg> Clienti</button><h2>Novità</h2>
      <button class="btn red" onclick="nvEdit()"><svg class="ic"><use href="#i-plus"/></svg> Nuova serie</button></div>
    <div class="nv-intro">Le serie nuove non ancora a listino: i formati e le finiture si scrivono una volta per la serie, poi aggiungi i colori con la loro foto
      (anche più foto insieme). Li trovi subito nei <b>Campioni compatibili</b> degli espositori di quel formato, con l'etichetta <span class="nwb">NOVITÀ</span>, e li campioni come gli altri.</div>
    <div class="cgrid">${list.map(p => {
      const cols = nvColors(p), wh = nvWhere(p);
      // colori raggruppati per variante (es. Venezia: Cotone, Avorio… · Fine: … · Maxi: …), nell'ordine in cui li hai messi
      const byV = new Map(); cols.forEach(col => { const k = (col.v || '').trim(); byV.set(k, [...(byV.get(k) || []), col]); });
      const fmts = [...new Set(cols.flatMap(col => nvColFmts(p, col).map(fm => nvZ(fm.z)).filter(z => parseSize(z))))];
      // foto: una riga per variante con i suoi colori (senza varianti: una riga, al massimo 6 colori)
      const rows = byV.size > 1 ? [...byV] : [['', cols.slice(0, 6)]], h = rows.length === 1 ? 170 : rows.length === 2 ? 110 : Math.max(64, Math.round(270 / rows.length));
      return `<div class="card nv-card">
        <div class="nv-ph">${rows.map(([vv, cc]) => `<div class="pr" style="--n:${Math.max(1, cc.length)};--h:${h}px">${(cc.length ? cc : [null]).map(col => { const u = col && IMG[nvColIk(p, col)];
          return `<span style="${u ? `background-image:url('${esc(u)}')` : ''}" title="${esc(col ? nvColName(col) : '')}">${u ? '' : '<svg class="ic"><use href="#i-camera"/></svg>'}</span>`; }).join('')}${vv ? `<i class="vl">${esc(vv)}</i>` : ''}</div>`).join('')}<span class="nwb">NOVITÀ</span></div>
        <div class="in"><div class="br">${esc(p.b || 'Novità')}</div><h3>${esc(String(p.s || '').toUpperCase())}</h3>
          <div class="cols">${[...byV].map(([vv, cc]) => `${vv ? `<b>${esc(vv)}</b>: ` : ''}${esc(cc.map(col => String(col.c || '').trim()).filter(Boolean).join(', ') || '—')}`).join('<br>')}</div>
          <div class="fm">${cols.length} ${cols.length === 1 ? 'colore' : 'colori'} · ${esc(fmts.map(fmt).join(', ') || 'formati da definire')}</div>
          ${p.note ? `<div class="where">${esc(p.note)}</div>` : ''}
          <div class="where">${wh.length ? 'Entra in: ' + esc(wh.slice(0, 4).join(', ')) + (wh.length > 4 ? ` e altri ${wh.length - 4}` : '') : 'Nessun espositore accetta questi formati'}</div>
          <div class="acts"><button class="btn red" onclick="nvCampiona('${p.id}')"${wh.length ? '' : ' disabled'}><svg class="ic"><use href="#i-grid"/></svg> Campiona</button>
            <button class="btn" onclick="nvEdit('${p.id}')"><svg class="ic"><use href="#i-pencil"/></svg> Modifica</button>
            <button class="btn" onclick="nvDel('${p.id}')" title="Elimina"><svg class="ic"><use href="#i-trash"/></svg></button></div></div></div>`;
    }).join('')}
      <div class="card ccard newcard" onclick="nvEdit()"><svg class="ic"><use href="#i-plus"/></svg> Nuova serie</div></div>
  </div>`;
}

/* colore (e variante) dal nome del file: "MATERA_SASSI_BEIGE_60x120.jpg" → "Sassi Beige" (senza serie e formato);
   "EP0D_ESSENZA20VENEZIA%20AVORIO_120x120_002.avif" → variante "Venezia" (se la serie ce l'ha già) e colore "Avorio":
   via il codice davanti e i numeri; i "20" attaccati alle parole dei file scaricati sono spazi (%20) */
function nvNameFromFile(name, p) {
  const sw = new Set(String(p.s || '').toLowerCase().split(/\s+/).filter(Boolean));
  const vs = new Map(p.colors.map(col => String(col.v || '').trim()).filter(Boolean).map(v => [v.toLowerCase(), v]));
  let s = name.replace(/\.[^.]+$/, '');
  try { s = decodeURIComponent(s); } catch (e) { s = s.replace(/%20/gi, ' '); }
  const ws = s.replace(/([a-z])20(?=[a-z])/gi, '$1 ').split(/[\s_\-.]+/).filter(Boolean);
  if (ws.length > 1 && /^(?=.*\d)(?=.*[a-z])[a-z0-9]{4,6}$/i.test(ws[0])) ws.shift();   // codice prodotto (EP0D_…)
  let v = '';
  const c = ws.filter(w => {
    const l = w.toLowerCase();
    if (!v && vs.has(l)) { v = vs.get(l); return false; }
    return !sw.has(l) && !/^\d+([,.]\d+)?x\d+([,.]\d+)?$/i.test(w) && !/^\d+$/.test(w) && !/^(copia|copy|ok|@\d*ok)$/i.test(w);
  }).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  return { c, v };
}
/* colore già scritto con quel nome e quella variante ("Siena" va anche su "Rosso Siena"): la foto va a lui, senza doppioni;
   prima quelli ancora senza foto. anyV: in qualunque variante (per prenderne il nome intero) */
function nvFindColor(p, { c, v }, taken, anyV) {
  const words = x => String(x || '').toLowerCase().split(/\s+/).filter(Boolean), fw = words(c);
  if (!fw.length) return null;
  const ok = p.colors.filter(col => { const cw = words(col.c);
    return !taken.has(col) && (anyV || String(col.v || '').trim().toLowerCase() === v.toLowerCase()) && fw.every(w => cw.includes(w)); });
  return ok.find(col => !IMG[nvColIk(p, col)]) || ok[0] || null;
}

/* scheda della serie: marca, serie, formati della serie, colori (foto, nome, variante, formati, codici) */
function nvEdit(id) {
  const orig = id && novita[id], isNew = !orig;
  const p = JSON.parse(JSON.stringify(orig || { id: uid(), b: '', s: '', note: '', fmts: [{ z: '', t: '', fins: [{ f: '' }] }] }));
  if (!p.colors) { p.colors = isNew ? [] : nvColors(p); delete p.c; }   // le prime novità (un colore solo) diventano una serie con un colore
  if (!p.colors.length) p.colors.push(nvNewColor());
  p.fmts.forEach(fm => { fm.fins = (fm.fins || []).map(x => ({ f: x.f || '' })); if (!fm.fins.length) fm.fins.push({ f: '' }); });   // i codici stanno nei colori
  const origIks = orig ? nvColors(orig).map(col => nvColIk(orig, col)) : [];
  const openCodes = new Set(p.colors.filter(col => Object.keys(col.codes || {}).length).map(col => col.id));
  let m = document.getElementById('novModal'); if (m) m.remove();
  const brands = [...new Set(SAMPLES.filter(s => !s.nuovo).map(s => s.b))];
  const sizes = [...new Set(SAMPLES.filter(s => !s.nuovo).map(s => s.z))].sort((a, b) => parseSize(a)[0] * parseSize(a)[1] - parseSize(b)[0] * parseSize(b)[1]);
  const fins = [...new Set(SAMPLES.filter(s => !s.nuovo).flatMap(s => s.f))].sort();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="novModal" style="z-index:270"><div class="mbox">
    <div class="mhead"><h3><span class="nwb">NOVITÀ</span> ${isNew ? 'Nuova serie' : 'Modifica serie'}</h3></div>
    <div class="nv-body"></div></div></div>
    <datalist id="nvBrands">${brands.map(b => `<option value="${esc(b)}">`).join('')}</datalist>
    <datalist id="nvSizes">${sizes.map(z => `<option value="${esc(z)}">`).join('')}</datalist>
    <datalist id="nvFins">${fins.map(f => `<option value="${esc(f)}">`).join('')}</datalist>`);
  m = document.getElementById('novModal');
  const lists = () => ['nvBrands', 'nvSizes', 'nvFins'].forEach(x => document.getElementById(x)?.remove());
  const iksNow = () => p.colors.map(col => nvColIk(p, col));
  const close = async () => {   // annulla: le foto dei colori nuovi (mai salvati) si tolgono
    for (const ik of iksNow()) if (!origIks.includes(ik) && IMG[ik]) await removeImage(ik);
    m.remove(); lists();
  };
  const fmtHTML = (fm, P, i) => `<div class="nv-fmt" data-p="${P}" data-i="${i}">
      <div class="hd"><label class="f">Formato (cm)<input data-fz list="nvSizes" value="${esc(fm.z)}" placeholder="es. 60x120"></label>
        <label class="f">Spessore mm<input data-ft value="${esc(fm.t || '')}" placeholder="es. 9" inputmode="decimal"></label>
        <button class="x" data-delf title="Togli il formato"><svg class="ic"><use href="#i-x"/></svg></button></div>
      ${fm.fins.map((x, j) => `<div class="nv-fin"><input data-fin="${j}" list="nvFins" value="${esc(x.f)}" placeholder="Finitura (es. Silktech R10 Rett.)">
        <button class="x" data-delfin="${j}" title="Togli la finitura"><svg class="ic"><use href="#i-x"/></svg></button></div>`).join('')}
      <div><button class="btn sm" data-addfin><svg class="ic"><use href="#i-plus"/></svg> Finitura</button></div></div>`;
  // parti di un colore che dipendono dai formati e dalle finiture scritte: si aggiornano da sole (refreshDeps) senza ridisegnare
  // le caselle (così il tocco sulla casella o sul pulsante dopo non va perso e quello che scrivi resta)
  const chipsHTML = col => p.fmts.filter(fm => parseSize(nvZ(fm.z))).map(fm => { const z = nvZ(fm.z), on = !(col.off || []).includes(z);
      return `<button class="chip${on ? ' on' : ' off'}" data-tog="${esc(z)}" title="${on ? 'Questo colore lo ha: tocca per toglierlo' : 'Tocca per rimetterlo'}">${esc(fmt(z))}</button>`; }).join('')
    || '<span style="color:var(--mid)">scrivi prima i formati della serie</span>';
  const codesHTML = col => {
    const combos = nvColFmts(p, col).filter(fm => parseSize(nvZ(fm.z))).flatMap(fm => fm.fins.filter(x => x.f && x.f.trim()).map(x => [nvZ(fm.z), x.f.trim()]));
    return combos.length ? `<details class="cod"${openCodes.has(col.id) ? ' open' : ''} data-cod="${col.id}"><summary>Codici (facoltativi)</summary>${combos.map(([z, f]) =>
      `<div class="nv-code"><span>${esc(fmt(z))} · ${esc(f)}</span><input data-code="${esc(z + '|' + f)}" value="${esc((col.codes || {})[z + '|' + f] || '')}" placeholder="Codice"></div>`).join('')}</details>` : '';
  };
  const colHTML = (col, ci) => {
    const u = IMG[nvColIk(p, col)];
    return `<div class="nv-col" data-ci="${ci}">
      <div class="ch"><div class="pv" data-cph title="${u ? 'Cambia foto' : 'Carica foto'}" style="${u ? `background-image:url('${esc(u)}')` : ''}">${u ? '' : '<svg class="ic"><use href="#i-camera"/></svg>'}</div>
        <div><div class="nv-row2"><label class="f">Colore *<input data-cc value="${esc(col.c || '')}" placeholder="es. Beige"></label>
          <label class="f">Variante<input data-cv value="${esc(col.v || '')}" placeholder="es. Sassi (facoltativa)"></label></div>
          <div class="cb"><button class="btn sm${u ? '' : ' red'}" data-cph><svg class="ic"><use href="#i-camera"/></svg> ${u ? 'Cambia foto' : 'Carica foto'}</button>
            <button class="btn sm" data-cdel title="Togli questo colore"><svg class="ic"><use href="#i-trash"/></svg> Togli colore</button></div></div></div>
      <div class="cfm"><span class="k">Formati:</span><span class="chips" style="display:contents">${chipsHTML(col)}</span>
        <button class="btn sm" data-addx><svg class="ic"><use href="#i-plus"/></svg> Formato solo per questo colore</button></div>
      ${(col.extra || []).map((fm, i) => fmtHTML(fm, 'C' + ci, i)).join('')}
      <div class="codw">${codesHTML(col)}</div>
    </div>`;
  };
  const bindDeps = (box, col) => {
    box.querySelectorAll('[data-tog]').forEach(x => x.onclick = () => {
      const z = x.dataset.tog; col.off = col.off || [];
      if (col.off.includes(z)) col.off = col.off.filter(q => q !== z); else col.off.push(z); refreshDeps();
    });
    box.querySelectorAll('[data-code]').forEach(x => x.oninput = () => { col.codes = col.codes || {}; const v = x.value.trim().toUpperCase(); if (v) col.codes[x.dataset.code] = v; else delete col.codes[x.dataset.code]; });
    const det = box.querySelector('details[data-cod]'); if (det) det.ontoggle = () => { if (det.open) openCodes.add(col.id); else openCodes.delete(col.id); };
  };
  const refreshDeps = () => m.querySelectorAll('.nv-col').forEach(box => {
    const col = p.colors[+box.dataset.ci]; if (!col) return;
    const ch = chipsHTML(col), cd = codesHTML(col), cs = box.querySelector('.chips'), cw = box.querySelector('.codw');
    if (cs.innerHTML !== ch) cs.innerHTML = ch;
    if (cw.dataset.h !== cd) { cw.innerHTML = cd; cw.dataset.h = cd; }
    bindDeps(box, col);
  });
  const fmOf = box => box.dataset.p === 'S' ? p.fmts[+box.dataset.i] : p.colors[+box.dataset.p.slice(1)].extra[+box.dataset.i];
  const listOf = box => box.dataset.p === 'S' ? p.fmts : p.colors[+box.dataset.p.slice(1)].extra;
  const pickPhotos = (multi, cb) => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = multi; inp.onchange = () => cb([...inp.files]); inp.click(); };
  const draw = () => {
    const keepTop = m.querySelector('.nv-body').scrollTop;
    m.querySelector('.nv-body').innerHTML = `
      <div class="nv-row"><label class="f">Marca<input data-k="b" list="nvBrands" value="${esc(p.b)}" placeholder="es. Emilceramica"></label>
        <label class="f">Serie *<input data-k="s" value="${esc(p.s)}" placeholder="es. Matera Stone"></label></div>
      <div class="t2">Formati della serie <small>valgono per tutti i colori</small></div>
      ${p.fmts.map((fm, i) => fmtHTML(fm, 'S', i)).join('')}
      <div><button class="btn sm" id="nvAddF"><svg class="ic"><use href="#i-plus"/></svg> Formato</button></div>
      <div class="t2">Colori (${p.colors.length})</div>
      ${p.colors.map(colHTML).join('')}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="nvAddC"><svg class="ic"><use href="#i-plus"/></svg> Colore</button>
        <button class="btn" id="nvAddPh"><svg class="ic"><use href="#i-camera"/></svg> Colori da foto (più foto insieme)</button></div>
      <label class="f">Note<textarea data-k="note" placeholder="es. disponibile da marzo, prezzo…">${esc(p.note || '')}</textarea></label>
      <div class="foot"><button class="btn" id="nvNo">Annulla</button><button class="btn red" id="nvOk"><svg class="ic"><use href="#i-check"/></svg> Salva</button></div>`;
    const b = m.querySelector('.nv-body'); b.scrollTop = keepTop;
    b.querySelectorAll('[data-k]').forEach(x => x.oninput = () => { p[x.dataset.k] = x.value; });
    // formati (della serie o solo di un colore): cambiando formato o finitura si aggiornano chip e codici
    b.querySelectorAll('.nv-fmt').forEach(box => {
      const fm = fmOf(box);
      box.querySelector('[data-fz]').oninput = e => { fm.z = e.target.value; };
      box.querySelector('[data-fz]').onchange = refreshDeps;
      box.querySelector('[data-ft]').oninput = e => { fm.t = e.target.value; };
      box.querySelectorAll('[data-fin]').forEach(x => { x.oninput = () => { fm.fins[+x.dataset.fin].f = x.value; }; x.onchange = refreshDeps; });
      box.querySelectorAll('[data-delfin]').forEach(x => x.onclick = () => { fm.fins.splice(+x.dataset.delfin, 1); if (!fm.fins.length) fm.fins.push({ f: '' }); draw(); });
      box.querySelector('[data-addfin]').onclick = () => { fm.fins.push({ f: '' }); draw(); };
      box.querySelector('[data-delf]').onclick = () => { const L = listOf(box); L.splice(+box.dataset.i, 1); if (box.dataset.p === 'S' && !L.length) L.push({ z: '', t: '', fins: [{ f: '' }] }); draw(); };
    });
    b.querySelector('#nvAddF').onclick = () => { const last = p.fmts[p.fmts.length - 1]; p.fmts.push({ z: '', t: last ? last.t || '' : '', fins: last ? last.fins.map(x => ({ f: x.f })) : [{ f: '' }] }); draw(); };
    // colori
    b.querySelectorAll('.nv-col').forEach(box => {
      const col = p.colors[+box.dataset.ci];
      box.querySelector('[data-cc]').oninput = e => { col.c = e.target.value; };
      box.querySelector('[data-cv]').oninput = e => { col.v = e.target.value; };
      box.querySelectorAll('[data-cph]').forEach(x => x.onclick = () => pickPhotos(false, async ([f]) => {
        if (!f) return; toast('Carico la foto…'); await setImage(nvColIk(p, col), f);
        if (!String(col.c || '').trim()) { const nm = nvNameFromFile(f.name, p); col.c = nm.c; if (!String(col.v || '').trim()) col.v = nm.v; }
        draw();
      }));
      box.querySelector('[data-cdel]').onclick = () => { p.colors.splice(+box.dataset.ci, 1); if (!p.colors.length) p.colors.push(nvNewColor()); draw(); };
      // formato solo per questo colore: parte con lo spessore e le finiture della serie, poi si cambia
      box.querySelector('[data-addx]').onclick = () => {
        col.extra = col.extra || []; const last = p.fmts[p.fmts.length - 1];
        col.extra.push({ z: '', t: last ? last.t || '' : '', fins: last && last.fins.some(x => x.f) ? last.fins.map(x => ({ f: x.f })) : [{ f: '' }] }); draw();
        setTimeout(() => { const zs = m.querySelectorAll(`.nv-fmt[data-p="C${box.dataset.ci}"] [data-fz]`); zs[zs.length - 1]?.focus(); }, 30);
      };
      bindDeps(box, col);
    });
    // nuovo colore: segue i formati della serie
    b.querySelector('#nvAddC').onclick = () => { p.colors.push(nvNewColor()); draw(); setTimeout(() => { const all = m.querySelectorAll('[data-cc]'); all[all.length - 1]?.focus(); }, 30); };
    // più foto insieme: ogni foto va sul colore che ha già quel nome (e variante), altrimenti diventa un colore nuovo
    // (nome dal nome del file, da correggere se serve)
    b.querySelector('#nvAddPh').onclick = () => pickPhotos(true, async files => {
      if (!files.length) return;
      toast(`Carico ${files.length} foto…`);
      const taken = new Set(); let found = 0;
      for (const f of files) {
        const nm = nvNameFromFile(f.name, p);
        let col = nvFindColor(p, nm, taken);
        if (col) found++;
        else {
          col = p.colors.find(x => !taken.has(x) && !String(x.c || '').trim() && !IMG[nvColIk(p, x)]);   // il primo colore ancora vuoto si riempie
          if (!col) { col = nvNewColor(); p.colors.push(col); }
          col.c = (nvFindColor(p, nm, new Set(), true) || nm).c; col.v = nm.v;   // "Siena" → "Rosso Siena" come nell'altra variante
        }
        taken.add(col);
        await setImage(nvColIk(p, col), f);
      }
      draw();
      if (found) toast(found === files.length ? `Foto messe sui loro colori (${found})` : `${found} foto sui colori che c'erano, ${files.length - found} colori nuovi`);
    });
    b.querySelector('#nvNo').onclick = close;
    b.querySelector('#nvOk').onclick = async () => {
      p.s = String(p.s || '').trim(); p.b = String(p.b || '').trim();
      if (!p.s) return say('Scrivi il nome della serie.');
      const cleanF = fm => ({ z: nvZ(fm.z), t: String(fm.t || '').trim(), fins: (fm.fins || []).filter(x => String(x.f || '').trim()).map(x => ({ f: x.f.trim() })) });
      p.fmts = p.fmts.map(cleanF).filter(fm => fm.z);
      p.colors = p.colors.filter(col => String(col.c || '').trim() || IMG[nvColIk(p, col)]);
      if (p.colors.some(col => !String(col.c || '').trim())) return say('Scrivi il nome di ogni colore (quelli con la foto).');
      if (!p.colors.length) return say('Aggiungi almeno un colore.');
      p.colors.forEach(col => {
        col.c = col.c.trim(); col.v = String(col.v || '').trim();
        col.extra = (col.extra || []).map(cleanF).filter(fm => fm.z);
        col.off = (col.off || []).filter(z => p.fmts.some(fm => fm.z === z));
        const ok = new Set(nvColFmts(p, col).flatMap(fm => fm.fins.map(x => fm.z + '|' + x.f)));
        col.codes = Object.fromEntries(Object.entries(col.codes || {}).filter(([k, v]) => v && ok.has(k)));
      });
      const bad = [...p.fmts, ...p.colors.flatMap(col => col.extra)].filter(fm => !parseSize(fm.z));
      if (bad.length) return say(`Formato non valido: ${bad.map(x => x.z).join(', ')}\nScrivilo come 60x120 (larghezza x altezza in cm).`);
      if (!p.colors.some(col => nvColFmts(p, col).length)) return say('Aggiungi almeno un formato (es. 60x120).');
      for (const ik of origIks) if (!iksNow().includes(ik) && IMG[ik]) await removeImage(ik);   // colori tolti: via anche la foto
      p.upd = Date.now(); novita[p.id] = p; saveNovita();
      m.remove(); lists(); renderNovita(); toast('Novità salvata: la trovi nei Campioni compatibili');
    };
  };
  draw();
}
async function nvDel(id) {
  const p = novita[id]; if (!p) return;
  const used = Object.values(comps).filter(c => c.slots.some(k => k && k.startsWith('NEW|' + id + '|'))).length;
  if (!await ask(`Eliminare la serie nuova "${p.s}" e i suoi ${nvColors(p).length} colori?${used ? `\n\nÈ campionata in ${used} espositor${used > 1 ? 'i' : 'e'}: quei posti torneranno vuoti.` : ''}`, { ok: 'Elimina' })) return;
  const iks = nvColors(p).map(col => nvColIk(p, col));
  delete novita[id]; saveNovita();
  for (const ik of iks) if (IMG[ik]) await removeImage(ik);
  renderNovita();
}
/* Campiona: apre gli Espositori con un espositore adatto e la ricerca già sulla serie */
function nvCampiona(id) {
  const p = novita[id]; if (!p) return;
  const ss = nvSamples(p);
  const d = (DISP[ui.disp] && ss.some(s => accepts(DISP[ui.disp], s)) ? DISP[ui.disp] : null) || DISPLAYS.find(d => d.slots && !d.accept.tozzetto && ss.some(s => accepts(d, s)));
  if (!d) return say('Nessun espositore accetta i formati di questa novità.');
  ui.client = ''; ui.returnTo = '#/novita'; ui.disp = d.id; saveUI();
  searchQ = String(p.s || ''); brandFilter = ''; fmtFilter = ''; surfFilter = ''; thickFilter = ''; onlyPhoto = false;
  go('#/espositori');
  setTimeout(() => toast(`${d.name}: i colori della novità sono nei Campioni compatibili. Puoi cambiare espositore dalla lista.`), 400);
}
