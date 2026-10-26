'use strict';
/* ════════════════════════════════════════════════════════════
   NOVITÀ (#/novita) — prodotti nuovi non ancora a listino: foto, formati e, per ogni formato, le finiture (con il codice
   se c'è già). Diventano campioni come gli altri (etichetta NOVITÀ): compaiono nei "Campioni compatibili" degli
   espositori che accettano quel formato e si possono campionare, incollare col codice, mettere nelle schede PDF…
   Dati: novita = { id: { id, b, s, c, note, fmts: [{ z, t, fins: [{ f, k }] }], upd } } — si salva e si sincronizza
   come clienti e composizioni (salva.js); la foto è una foto caricata con chiave "NEW|id" (come quelle dei campioni).
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewNovita'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="novita"] #viewNovita { display: block; }
.nv-intro { color: var(--mid); font-size: 13px; margin: -8px 0 16px; max-width: 760px; line-height: 1.5; }
.nv-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
.nv-ph { aspect-ratio: 4 / 3; background: #f3f1ec center / cover no-repeat; position: relative; display: flex; align-items: center; justify-content: center; color: var(--mid); font-size: 12.5px; font-weight: 600; gap: 6px; }
.nv-ph .nwb { position: absolute; left: 10px; top: 10px; }
.nv-card .in { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.nv-card .br { font: 700 10.5px var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: var(--red); }
.nv-card h3 { margin: 0; font-size: 15.5px; }
.nv-card .fm { font-size: 12.5px; line-height: 1.45; }
.nv-card .fm b { font-weight: 700; }
.nv-card .fm span { color: var(--mid); }
.nv-card .where { font-size: 11.5px; color: var(--mid); }
.nv-card .acts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: auto; padding-top: 6px; }
.nwb { display: inline-block; background: #1f8a4c; color: #fff; font: 800 9.5px var(--font-body); letter-spacing: .1em; padding: 2px 6px; border-radius: 5px; vertical-align: 1px; }
#novModal .mbox { max-width: 620px; width: calc(100vw - 32px); }
#novModal .nv-body { padding: 6px 18px 18px; display: flex; flex-direction: column; gap: 12px; max-height: calc(100vh - 130px); overflow: auto; }
#novModal .nv-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
#novModal label.f { display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; font-weight: 700; color: var(--mid); }
#novModal input, #novModal textarea { padding: 8px 10px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 14px; background: #fff; width: 100%; box-sizing: border-box; min-width: 0; }
#novModal textarea { min-height: 52px; resize: vertical; }
#novModal .nv-photo { display: flex; gap: 12px; align-items: center; }
#novModal .nv-photo .pv { width: 96px; height: 72px; border-radius: 10px; background: #f3f1ec center / cover no-repeat; border: 1px solid #ece9e2; flex: none; }
#novModal .nv-fmt { border: 1px solid var(--border); border-radius: 12px; padding: 10px; display: flex; flex-direction: column; gap: 8px; background: #faf9f6; }
#novModal .nv-fmt .hd { display: grid; grid-template-columns: 1fr 110px auto; gap: 8px; align-items: end; }
#novModal .nv-fin { display: grid; grid-template-columns: 1fr 120px auto; gap: 6px; align-items: center; }
#novModal .x { border: 1px solid var(--border); background: #fff; border-radius: 8px; width: 34px; height: 34px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
#novModal .t2 { font: 700 11px var(--font-body); letter-spacing: .1em; text-transform: uppercase; color: var(--mid); }
#novModal .foot { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
@media (max-width: 560px) { #novModal .nv-row { grid-template-columns: 1fr; } #novModal .nv-fmt .hd { grid-template-columns: 1fr 80px auto; } #novModal .nv-fin { grid-template-columns: 1fr 90px auto; } }
</style>`);

const nvZ = z => String(z || '').toLowerCase().replace(/[×*]/g, 'x').replace(/\s+/g, '').replace(/\./g, ',');   // "60 × 120" → "60x120"
const nvIk = id => 'NEW|' + id;
function saveNovita() { LS.set('vm_novita_v1', novita); applyNovita(); markDirty(); }

/* i prodotti nuovi diventano campioni (uno per formato; con più finiture, una variante per finitura come quelli del listino) */
function applyNovita() {
  for (let i = SAMPLES.length - 1; i >= 0; i--) if (SAMPLES[i].nuovo) SAMPLES.splice(i, 1);
  Object.keys(SAMPLE).forEach(k => { if (k.startsWith('NEW|')) delete SAMPLE[k]; });
  Object.keys(FIN_VAR).forEach(k => { if (k.startsWith('NEW|')) delete FIN_VAR[k]; });
  Object.values(novita || {}).forEach(p => (p.fmts || []).forEach(fm => {
    const z = nvZ(fm.z); if (!parseSize(z)) return;
    const fins = (fm.fins || []).filter(x => x.f && x.f.trim()).map(x => ({ f: x.f.trim(), k: String(x.k || '').trim().toUpperCase() }));
    const key = `NEW|${p.id}|${z}`;
    const s = { b: p.b || 'Novità', s: String(p.s || '').trim().toUpperCase(), c: String(p.c || '').trim(), z, f: fins.map(x => x.f), k: fins.map(x => x.k).filter(Boolean),
      t: fm.t ? [String(fm.t).trim().replace('.', ',')] : [], key, ik: nvIk(p.id), nuovo: true };
    SAMPLES.push(s); SAMPLE[key] = s;
    if (fins.length > 1) FIN_VAR[key] = fins.map((x, i) => { const v = Object.assign({}, s, { f: [x.f], k: x.k ? [x.k] : [], key: key + '#' + (x.k || 'f' + i), base: key, pkey: key, fv: true }); SAMPLE[v.key] = v; return v; });
  }));
  if (typeof CODE_IDX !== 'undefined') CODE_IDX = null;   // i codici delle novità si possono incollare
}
applyNovita();

/* in quali espositori entra (almeno un formato) */
function nvWhere(p) {
  const ss = SAMPLES.filter(s => s.nuovo && s.ik === nvIk(p.id));
  return DISPLAYS.filter(d => d.slots && !d.accept.tozzetto && ss.some(s => accepts(d, s))).map(d => d.name);
}

function renderNovita() {
  const v = document.getElementById('viewNovita');
  const list = Object.values(novita).sort((a, b) => (b.upd || 0) - (a.upd || 0));
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><button class="btn" onclick="go('#/')"><svg class="ic"><use href="#i-left"/></svg> Clienti</button><h2>Novità</h2>
      <button class="btn red" onclick="nvEdit()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo prodotto</button></div>
    <div class="nv-intro">I prodotti nuovi non ancora a listino: carica la foto, i formati e per ogni formato le finiture (e il codice, se c'è già).
      Li trovi subito nei <b>Campioni compatibili</b> degli espositori di quel formato, con l'etichetta <span class="nwb">NOVITÀ</span>, e li puoi campionare come gli altri.</div>
    <div class="cgrid">${list.map(p => {
      const u = IMG[nvIk(p.id)], wh = nvWhere(p);
      return `<div class="card nv-card">
        <div class="nv-ph" style="${u ? `background-image:url('${esc(u)}')` : ''}"><span class="nwb">NOVITÀ</span>${u ? '' : '<svg class="ic"><use href="#i-camera"/></svg> senza foto'}</div>
        <div class="in"><div class="br">${esc(p.b || 'Novità')}</div><h3>${esc(String(p.s || '').toUpperCase())} ${esc(p.c || '')}</h3>
          <div class="fm">${(p.fmts || []).filter(f => parseSize(nvZ(f.z))).map(f => `<b>${esc(fmt(nvZ(f.z)))}</b>${f.t ? ` <span>${esc(f.t)} mm</span>` : ''} · ${esc((f.fins || []).filter(x => x.f).map(x => x.f + (x.k ? ' (' + x.k + ')' : '')).join(', ') || 'finitura da definire')}`).join('<br>')}</div>
          ${p.note ? `<div class="where">${esc(p.note)}</div>` : ''}
          <div class="where">${wh.length ? 'Entra in: ' + esc(wh.slice(0, 4).join(', ')) + (wh.length > 4 ? ` e altri ${wh.length - 4}` : '') : 'Nessun espositore accetta questi formati'}</div>
          <div class="acts"><button class="btn red" onclick="nvCampiona('${p.id}')"${wh.length ? '' : ' disabled'}><svg class="ic"><use href="#i-grid"/></svg> Campiona</button>
            <button class="btn" onclick="nvEdit('${p.id}')"><svg class="ic"><use href="#i-pencil"/></svg> Modifica</button>
            <button class="btn" onclick="nvDel('${p.id}')" title="Elimina"><svg class="ic"><use href="#i-trash"/></svg></button></div></div></div>`;
    }).join('')}
      <div class="card ccard newcard" onclick="nvEdit()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo prodotto</div></div>
  </div>`;
}

/* scheda del prodotto: marca, serie, colore, foto, formati (formato, spessore, finiture con codice) */
function nvEdit(id) {
  const p = JSON.parse(JSON.stringify(id && novita[id] ? novita[id] : { id: uid(), b: '', s: '', c: '', note: '', fmts: [{ z: '', t: '', fins: [{ f: '', k: '' }] }] }));
  const isNew = !(id && novita[id]);
  let m = document.getElementById('novModal'); if (m) m.remove();
  const brands = [...new Set(SAMPLES.filter(s => !s.nuovo).map(s => s.b))];
  const sizes = [...new Set(SAMPLES.filter(s => !s.nuovo).map(s => s.z))].sort((a, b) => parseSize(a)[0] * parseSize(a)[1] - parseSize(b)[0] * parseSize(b)[1]);
  const fins = [...new Set(SAMPLES.filter(s => !s.nuovo).flatMap(s => s.f))].sort();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="novModal" style="z-index:270"><div class="mbox">
    <div class="mhead"><h3><span class="nwb">NOVITÀ</span> ${isNew ? 'Nuovo prodotto' : 'Modifica prodotto'}</h3></div>
    <div class="nv-body"></div></div></div>
    <datalist id="nvBrands">${brands.map(b => `<option value="${esc(b)}">`).join('')}</datalist>
    <datalist id="nvSizes">${sizes.map(z => `<option value="${esc(z)}">`).join('')}</datalist>
    <datalist id="nvFins">${fins.map(f => `<option value="${esc(f)}">`).join('')}</datalist>`);
  m = document.getElementById('novModal');
  const close = async () => { if (isNew && !novita[p.id] && IMG[nvIk(p.id)]) await removeImage(nvIk(p.id)); m.remove(); ['nvBrands', 'nvSizes', 'nvFins'].forEach(x => document.getElementById(x)?.remove()); };
  const draw = () => {
    const u = IMG[nvIk(p.id)];
    m.querySelector('.nv-body').innerHTML = `
      <div class="nv-row"><label class="f">Marca<input data-k="b" list="nvBrands" value="${esc(p.b)}" placeholder="es. Emilceramica"></label>
        <label class="f">Serie *<input data-k="s" value="${esc(p.s)}" placeholder="es. Pietra Nova"></label>
        <label class="f">Colore *<input data-k="c" value="${esc(p.c)}" placeholder="es. Sabbia"></label></div>
      <div class="nv-photo"><div class="pv" style="${u ? `background-image:url('${esc(u)}')` : ''}"></div>
        <div><button class="btn${u ? '' : ' red'}" id="nvPh"><svg class="ic"><use href="#i-camera"/></svg> ${u ? 'Cambia foto' : 'Carica foto'}</button>
        <div style="font-size:11.5px;color:var(--mid);margin-top:4px">Una foto del prodotto: la stessa per tutti i formati</div></div></div>
      <div class="t2">Formati e finiture</div>
      ${p.fmts.map((fm, i) => `<div class="nv-fmt" data-i="${i}">
        <div class="hd"><label class="f">Formato (cm)<input data-fk="z" list="nvSizes" value="${esc(fm.z)}" placeholder="es. 60x120"></label>
          <label class="f">Spessore mm<input data-fk="t" value="${esc(fm.t || '')}" placeholder="es. 9" inputmode="decimal"></label>
          <button class="x" data-delf="${i}" title="Togli il formato"><svg class="ic"><use href="#i-x"/></svg></button></div>
        ${fm.fins.map((x, j) => `<div class="nv-fin"><input data-fin="${j}" list="nvFins" value="${esc(x.f)}" placeholder="Finitura (es. Silktech R10 Rett.)">
          <input data-cod="${j}" value="${esc(x.k || '')}" placeholder="Codice (se c'è)">
          <button class="x" data-delfin="${j}" title="Togli la finitura"><svg class="ic"><use href="#i-x"/></svg></button></div>`).join('')}
        <div><button class="btn" data-addfin="${i}"><svg class="ic"><use href="#i-plus"/></svg> Finitura</button></div></div>`).join('')}
      <div><button class="btn" id="nvAddF"><svg class="ic"><use href="#i-plus"/></svg> Formato</button></div>
      <label class="f">Note<textarea data-k="note" placeholder="es. disponibile da marzo, prezzo…">${esc(p.note || '')}</textarea></label>
      <div class="foot"><button class="btn" id="nvNo">Annulla</button><button class="btn red" id="nvOk"><svg class="ic"><use href="#i-check"/></svg> Salva</button></div>`;
    const b = m.querySelector('.nv-body');
    b.querySelectorAll('[data-k]').forEach(x => x.oninput = () => { p[x.dataset.k] = x.value; });
    b.querySelectorAll('.nv-fmt').forEach(box => {
      const fm = p.fmts[+box.dataset.i];
      box.querySelectorAll('[data-fk]').forEach(x => x.oninput = () => { fm[x.dataset.fk] = x.value; });
      box.querySelectorAll('[data-fin]').forEach(x => x.oninput = () => { fm.fins[+x.dataset.fin].f = x.value; });
      box.querySelectorAll('[data-cod]').forEach(x => x.oninput = () => { fm.fins[+x.dataset.cod].k = x.value; });
      box.querySelectorAll('[data-delfin]').forEach(x => x.onclick = () => { fm.fins.splice(+x.dataset.delfin, 1); if (!fm.fins.length) fm.fins.push({ f: '', k: '' }); draw(); });
      box.querySelector('[data-addfin]').onclick = () => { fm.fins.push({ f: '', k: '' }); draw(); };
      box.querySelector('[data-delf]').onclick = () => { p.fmts.splice(+box.dataset.i, 1); if (!p.fmts.length) p.fmts.push({ z: '', t: '', fins: [{ f: '', k: '' }] }); draw(); };
    });
    b.querySelector('#nvAddF').onclick = () => { p.fmts.push({ z: '', t: p.fmts[p.fmts.length - 1].t || '', fins: p.fmts[p.fmts.length - 1].fins.map(x => ({ f: x.f, k: '' })) }); draw(); };
    b.querySelector('#nvPh').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = async () => { const f = inp.files[0]; if (!f) return; toast('Carico la foto…'); await setImage(nvIk(p.id), f); draw(); if (novita[p.id]) renderNovita(); };
      inp.click();
    };
    b.querySelector('#nvNo').onclick = close;
    b.querySelector('#nvOk').onclick = () => {
      p.s = String(p.s || '').trim(); p.c = String(p.c || '').trim(); p.b = String(p.b || '').trim();
      if (!p.s || !p.c) return say('Scrivi almeno la serie e il colore.');
      p.fmts = p.fmts.map(fm => ({ z: nvZ(fm.z), t: String(fm.t || '').trim(), fins: fm.fins.filter(x => String(x.f || '').trim()).map(x => ({ f: x.f.trim(), k: String(x.k || '').trim().toUpperCase() })) }))
        .filter(fm => fm.z);
      const bad = p.fmts.filter(fm => !parseSize(fm.z));
      if (!p.fmts.length || bad.length) return say(bad.length ? `Formato non valido: ${bad.map(x => x.z).join(', ')}\nScrivilo come 60x120 (larghezza x altezza in cm).` : 'Aggiungi almeno un formato (es. 60x120).');
      p.upd = Date.now(); novita[p.id] = p; saveNovita();
      m.remove(); ['nvBrands', 'nvSizes', 'nvFins'].forEach(x => document.getElementById(x)?.remove());
      renderNovita(); toast('Novità salvata: la trovi nei Campioni compatibili');
    };
  };
  draw();
}
async function nvDel(id) {
  const p = novita[id]; if (!p) return;
  const used = Object.values(comps).filter(c => c.slots.some(k => k && k.startsWith('NEW|' + id + '|'))).length;
  if (!await ask(`Eliminare la novità "${p.s} ${p.c}"?${used ? `\n\nÈ campionata in ${used} espositor${used > 1 ? 'i' : 'e'}: quei posti torneranno vuoti.` : ''}`, { ok: 'Elimina' })) return;
  delete novita[id]; saveNovita();
  if (IMG[nvIk(id)]) await removeImage(nvIk(id));
  renderNovita();
}
/* Campiona: apre gli Espositori con il primo espositore adatto e la ricerca già sul prodotto */
function nvCampiona(id) {
  const p = novita[id]; if (!p) return;
  const ss = SAMPLES.filter(s => s.nuovo && s.ik === nvIk(id));
  const d = (DISP[ui.disp] && ss.some(s => accepts(DISP[ui.disp], s)) ? DISP[ui.disp] : null) || DISPLAYS.find(d => d.slots && !d.accept.tozzetto && ss.some(s => accepts(d, s)));
  if (!d) return say('Nessun espositore accetta i formati di questa novità.');
  ui.client = ''; ui.returnTo = '#/novita'; ui.disp = d.id; saveUI();
  searchQ = String(p.s || '') + ' ' + String(p.c || ''); brandFilter = ''; fmtFilter = ''; surfFilter = ''; thickFilter = ''; onlyPhoto = false;
  go('#/espositori');
  setTimeout(() => toast(`${d.name}: la novità è nei Campioni compatibili. Puoi cambiare espositore dalla lista.`), 400);
}
