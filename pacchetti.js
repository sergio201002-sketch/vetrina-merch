'use strict';
/* ════════════════════════════════════════════════════════════
   PACCHETTI (#/pacchetti · #/pacchetti/ID) — archivio delle mie proposte di esposizione per i prossimi clienti.
   Un pacchetto = uno o più espositori (composizioni senza cliente), con i campioni che scelgo io.
   Da un pacchetto, o da un espositore della sezione Espositori: "Metti in sala mostra" di un cliente a scelta
   (si copiano gli espositori nel cliente e si mettono nella stanza scelta, uno accanto all'altro).
   Dati: il pacchetto è una "scena" con pack: true e senza cliente (così si salva e si sincronizza come le altre);
   i suoi espositori sono composizioni senza cliente con pack = id del pacchetto.
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewPacks'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="packs"] #viewPacks { display: block; }
body[data-view="packs"] .hbtn[data-nav="packs"] { background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 -2px 0 var(--red); }
.pk-intro { color: var(--mid); font-size: 13px; margin: -8px 0 16px; max-width: 760px; line-height: 1.5; }
.pk-card { padding: 0; overflow: hidden; }
.pk-thumbs { display: flex; gap: 6px; padding: 12px 12px 0; height: 92px; }
.pk-thumbs span { flex: 1; border-radius: 10px; background: #f3f1ec center/contain no-repeat; border: 1px solid #ece9e2; }
.pk-card .in { padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 6px; }
.pk-card .note { font-size: 12px; color: var(--mid); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.pk-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.pk-head input.pk-name { font: 700 24px var(--font-display); letter-spacing: -.03em; border: 1px solid transparent; border-radius: 10px; padding: 4px 8px; background: transparent; flex: 1; min-width: 200px; }
.pk-head input.pk-name:hover, .pk-head input.pk-name:focus { border-color: var(--border); background: #fff; outline: none; }
.pk-note { width: 100%; min-height: 54px; border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 13px; resize: vertical; background: #fff; margin-bottom: 18px; }
.pk-items { display: flex; flex-direction: column; gap: 10px; }
.pk-it { display: grid; grid-template-columns: 74px 1fr auto; gap: 14px; align-items: center; padding: 10px 14px 10px 10px; }
.pk-it img { width: 74px; height: 74px; object-fit: contain; background: #fff; border-radius: 10px; border: 1px solid #ece9e2; }
.pk-it .t { font: 600 15px var(--font-display); letter-spacing: -.01em; }
.pk-it .t input { font: inherit; border: 1px solid transparent; border-radius: 8px; padding: 2px 6px; margin-left: -6px; background: transparent; width: min(340px, 100%); }
.pk-it .t input:hover, .pk-it .t input:focus { border-color: var(--border); background: #fff; outline: none; }
.pk-it .s { font-size: 12px; color: var(--mid); margin-top: 2px; }
.pk-dots { display: flex; gap: 3px; margin-top: 7px; flex-wrap: wrap; }
.pk-dots i { width: 18px; height: 18px; border-radius: 4px; background: #e9e6df center/cover; display: block; }
.pk-it .acts { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.pk-add { display: flex; gap: 8px; align-items: center; margin-top: 14px; flex-wrap: wrap; }
.pk-add select { padding: 8px 10px; border: 1px solid var(--border); border-radius: 10px; font: inherit; font-size: 13px; background: #fff; min-width: 260px; }
.pk-dlg label { display: block; font-size: 12px; font-weight: 700; color: var(--mid); margin: 12px 0 5px; }
.pk-dlg select, .pk-dlg input { width: 100%; padding: 9px 10px; border: 1px solid var(--border); border-radius: 10px; font: inherit; font-size: 14px; background: #fff; }
.pk-dlg .what { background: #f6f4f0; border-radius: 10px; padding: 9px 12px; font-size: 13px; }
@media (max-width: 720px) { .pk-it { grid-template-columns: 56px 1fr; } .pk-it img { width: 56px; height: 56px; } .pk-it .acts { grid-column: 1 / -1; justify-content: flex-start; } }
</style>`);

const packList = () => Object.values(scenes).filter(s => s.pack).sort((a, b) => (b.upd || 0) - (a.upd || 0));
const packComps = p => (p.items || []).map(i => comps[i.comp]).filter(Boolean);
const packFilled = c => c.slots.filter(Boolean).length;
const dispImg = d => d && d.img ? d.img : '';
function packTouch(p) { p.upd = Date.now(); saveScenes(); }

/* ── elenco / scheda ── */
function renderPacks(id) {
  const v = document.getElementById('viewPacks'), p = id && scenes[id] && scenes[id].pack ? scenes[id] : null;
  if (id && !p) return go('#/pacchetti');
  if (!p) {
    const list = packList();
    v.innerHTML = `<div class="vwrap">
      <div class="vhead"><h2>Pacchetti espositori</h2>
        <button class="btn red" onclick="packNew()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo pacchetto</button></div>
      <div class="pk-intro">Le tue proposte di esposizione pronte: un espositore, o più espositori insieme, con i campioni che scegli tu.
        Quando trovi il cliente giusto, <b>Metti in sala mostra</b> e il pacchetto va nella sua sala mostra.</div>
      <div class="cgrid">${list.map(x => {
        const cc = packComps(x), pcs = cc.reduce((n, c) => n + packFilled(c), 0), tot = cc.reduce((n, c) => n + c.slots.length, 0);
        return `<div class="card ccard pk-card" onclick="go('#/pacchetti/${x.id}')">
          <div class="pk-thumbs">${(cc.length ? cc.slice(0, 4) : [null]).map(c => `<span style="${c && dispImg(DISP[c.disp]) ? `background-image:url('${esc(dispImg(DISP[c.disp]))}')` : ''}"></span>`).join('')}</div>
          <div class="in"><h3>${esc(x.name)}</h3>
            ${x.note ? `<div class="note">${esc(x.note)}</div>` : ''}
            <div class="stats"><div><b>${cc.length}</b>espositori</div><div><b>${pcs}</b>campioni</div><div><b>${tot ? Math.round(pcs / tot * 100) : 0}%</b>pieno</div></div></div></div>`;
      }).join('')}
        <div class="card ccard newcard" onclick="packNew()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo pacchetto</div></div>
    </div>`;
    return;
  }
  const cc = packComps(p), famOrder = [...new Set(DISPLAYS.map(d => d.family))];
  v.innerHTML = `<div class="vwrap">
    <div class="pk-head">
      <button class="btn" onclick="go('#/pacchetti')"><svg class="ic"><use href="#i-left"/></svg> Pacchetti</button>
      <input class="pk-name" value="${esc(p.name)}" onchange="scenes['${p.id}'].name = this.value.trim() || 'Pacchetto'; packTouch(scenes['${p.id}'])">
      <button class="btn red" ${cc.length ? '' : 'disabled'} onclick="packPlaceDialog('${p.id}')"><svg class="ic"><use href="#i-store"/></svg> Metti in sala mostra</button>
      <button class="btn" onclick="packDup('${p.id}')" title="Duplica il pacchetto"><svg class="ic"><use href="#i-copy"/></svg></button>
      <button class="btn" onclick="packDel('${p.id}')" title="Elimina il pacchetto"><svg class="ic"><use href="#i-trash"/></svg></button>
    </div>
    <textarea class="pk-note" placeholder="Note: per che tipo di cliente, idea, prezzo…" onchange="scenes['${p.id}'].note = this.value; packTouch(scenes['${p.id}'])">${esc(p.note || '')}</textarea>
    <div class="pk-items">${cc.map(c => {
      const d = DISP[c.disp], n = packFilled(c), mini = c.slots.filter(Boolean).slice(0, 24).map(k => { const s = SAMPLE[k], u = s && IMG[photoKey(s)]; return u ? ((window.FOTO_MINI || {})[u] || u) : ''; });
      return `<div class="card pk-it"><img src="${esc(dispImg(d))}" alt="">
        <div><div class="t"><input value="${esc(c.name)}" onchange="comps['${c.id}'].name = this.value.trim() || '${esc(d ? d.name : 'Espositore').replace(/'/g, "\\'")}'; comps['${c.id}'].upd = Date.now(); saveComps()"></div>
          <div class="s">${esc(d ? d.name : '')} · ${n} di ${c.slots.length} campioni${d && d.dims ? ' · ' + esc(d.dims) : ''}</div>
          ${mini.length ? `<div class="pk-dots">${mini.map(u => `<i style="${u ? `background-image:url('${esc(u)}')` : ''}"></i>`).join('')}</div>` : ''}</div>
        <div class="acts"><button class="btn dark" onclick="packOpenComp('${p.id}','${c.id}')"><svg class="ic"><use href="#i-pencil"/></svg> ${n ? 'Modifica i campioni' : 'Scegli i campioni'}</button>
          <button class="btn" onclick="packCopyItem('${p.id}','${c.id}')" title="Duplica questo espositore nel pacchetto"><svg class="ic"><use href="#i-copy"/></svg></button>
          <button class="btn" onclick="packRemoveItem('${p.id}','${c.id}')" title="Togli dal pacchetto"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>`;
    }).join('') || '<div class="empty-note">Il pacchetto è vuoto: aggiungi un espositore qui sotto.</div>'}</div>
    <div class="pk-add"><select id="pkAddSel"><option value="">Aggiungi un espositore…</option>
      ${famOrder.map(f => `<optgroup label="${esc(f)}">${DISPLAYS.filter(d => d.family === f).map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</optgroup>`).join('')}</select>
      <button class="btn" onclick="packAddDisp('${p.id}', document.getElementById('pkAddSel').value)"><svg class="ic"><use href="#i-plus"/></svg> Aggiungi</button></div>
  </div>`;
}

/* ── operazioni sul pacchetto ── */
async function packNew() {
  const name = await ask('Nome del nuovo pacchetto', { text: 'Pacchetto ' + (packList().length + 1), ok: 'Crea' });
  if (!name) return;
  const p = { id: uid(), pack: true, client: '', name: name.trim(), note: '', items: [], created: Date.now(), upd: Date.now() };
  scenes[p.id] = p; saveScenes(); go('#/pacchetti/' + p.id);
  return p;
}
function packNewComp(p, d, from) {
  const c = { id: uid(), disp: d.id, name: from ? from.name : d.name, slots: from ? from.slots.slice() : Array(d.variants ? defVariant(d) : d.slots).fill(null), upd: Date.now(), pack: p.id, explicit: true };
  if (d.variants) c.variant = from && from.variant || defVariant(d);
  comps[c.id] = c; p.items.push({ id: uid(), comp: c.id }); return c;
}
function packAddDisp(pid, dispId) {
  const p = scenes[pid], d = DISP[dispId]; if (!p || !d) return toast('Scegli prima un espositore');
  packNewComp(p, d); saveComps(); packTouch(p); renderPacks(pid); toast(`${d.name} aggiunto: ora scegli i campioni`);
}
function packCopyItem(pid, cid) { const p = scenes[pid], c = comps[cid]; if (!p || !c) return; const x = packNewComp(p, DISP[c.disp], c); x.name = c.name + ' (copia)'; saveComps(); packTouch(p); renderPacks(pid); }
async function packRemoveItem(pid, cid) {
  const p = scenes[pid], c = comps[cid]; if (!p || !c) return;
  if (!await ask(`Togliere "${c.name}" dal pacchetto?`, { ok: 'Togli' })) return;
  p.items = p.items.filter(i => i.comp !== cid); delete comps[cid]; saveComps(); packTouch(p); renderPacks(pid);
}
function packDup(pid) {
  const p = scenes[pid]; if (!p) return;
  const x = { id: uid(), pack: true, client: '', name: p.name + ' (copia)', note: p.note || '', items: [], created: Date.now(), upd: Date.now() };
  scenes[x.id] = x; packComps(p).forEach(c => packNewComp(x, DISP[c.disp], c)); saveComps(); saveScenes(); go('#/pacchetti/' + x.id); toast('Pacchetto duplicato');
}
async function packDel(pid) {
  const p = scenes[pid]; if (!p) return;
  if (!await ask(`Eliminare il pacchetto "${p.name}" con i suoi espositori?\n\nLe sale mostra dove l'hai già messo non cambiano.`, { ok: 'Elimina' })) return;
  packComps(p).forEach(c => delete comps[c.id]); delete scenes[pid]; saveComps(); saveScenes(); go('#/pacchetti'); toast('Pacchetto eliminato');
}
/* apre l'espositore nel configuratore per scegliere i campioni; "← Pacchetto" riporta qui */
function packOpenComp(pid, cid) {
  const c = comps[cid]; if (!c) return;
  ui.client = ''; ui.disp = c.disp; ui.returnTo = '#/pacchetti/' + pid; current[c.disp] = c.id; saveUI(); saveComps(); go('#/espositori');
}

/* ── metti in sala mostra (da pacchetto o da un espositore) ── */
function placeDialog(title, what, onOk) {
  const cls = Object.values(clients).sort((a, b) => a.name.localeCompare(b.name));
  if (!cls.length) return say('Non hai ancora clienti: crea prima il cliente dalla pagina Clienti.');
  let m = document.getElementById('pkDlg'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="pkDlg"><div class="mbox pk-dlg" style="max-width:460px;width:calc(100vw - 32px)">
    <div class="mhead"><h3><svg class="ic"><use href="#i-store"/></svg> ${esc(title)}</h3></div>
    <div style="padding:6px 18px 18px">
      <div class="what">${what}</div>
      <label>Cliente</label><select id="pkCl">${cls.map(c => `<option value="${c.id}" ${c.id === ui.lastPlaceClient ? 'selected' : ''}>${esc(c.name)}${c.city ? ' · ' + esc(c.city) : ''}</option>`).join('')}</select>
      <label>Stanza della sala mostra</label><select id="pkRoom"></select>
      <div class="askbtns"><button class="btn" id="pkNo">Annulla</button><button class="btn red" id="pkOk"><svg class="ic"><use href="#i-store"/></svg> Metti in sala mostra</button></div>
    </div></div></div>`);
  m = document.getElementById('pkDlg');
  const cs = document.getElementById('pkCl'), rs = document.getElementById('pkRoom');
  const fillRooms = () => { const rr = showRooms(cs.value); rs.innerHTML = rr.map(r => `<option value="${r.id}">${esc(r.name)} · ${r.items.length} espositori</option>`).join('') + `<option value="__new">＋ Nuova stanza</option>`; };
  cs.onchange = fillRooms; fillRooms();
  document.getElementById('pkNo').onclick = () => m.remove();
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.getElementById('pkOk').onclick = () => { const cid = cs.value, rid = rs.value; ui.lastPlaceClient = cid; saveUI(); m.remove(); onOk(cid, rid); };
}
/* copia gli espositori nel cliente e li mette nella stanza, uno accanto all'altro lungo il muro di fondo */
function placeComps(list, cid, rid, pack) {
  let r = rid !== '__new' && scenes[rid];
  if (!r) {
    const rooms = showRooms(cid), n = rooms.length + 1;
    r = { id: uid(), client: cid, name: rooms.length ? 'Stanza ' + n : 'Sala mostra', showroom: true, order: n - 1, created: Date.now(), w: 600, d: 420, h: 300, wallL: true, wallR: false, grid: true, swingFront: true, items: [], upd: Date.now() };
    scenes[r.id] = r; if (!clients[cid].showroom) clients[cid].showroom = r.id;
  }
  // primo posto libero: a destra dell'ultimo espositore a terra
  let x = 20;
  r.items.forEach(it => { const m = roomModel(it), w = (Math.round((it.rot || 0) / 90) % 2 ? m.P : m.L); x = Math.max(x, it.x + w / 2 + 10); });
  list.forEach(c => {
    const d = DISP[c.disp]; if (!d) return;
    const nc = { id: uid(), disp: c.disp, name: c.name, slots: c.slots.slice(), client: cid, explicit: true, upd: Date.now() };
    if (c.variant) nc.variant = c.variant;
    if (pack) nc.fromPack = pack.id;
    comps[nc.id] = nc;
    const it = { id: uid(), comp: nc.id, disp: c.disp, x: 0, z: 0, rot: 0 }, m = roomModel(it);
    it.x = Math.round(x + m.L / 2); it.z = Math.round(m.P / 2 + 1); x += m.L + 10;
    r.items.push(it);
  });
  r.w = Math.max(r.w, Math.ceil((x + 20) / 10) * 10); r.upd = Date.now(); clients[cid].upd = Date.now();
  saveComps(); saveScenes(); saveClients();
  return r;
}
function packPlaceDialog(pid) {
  const p = scenes[pid], cc = packComps(p);
  placeDialog('Metti in sala mostra', `<b>${esc(p.name)}</b> · ${cc.length} espositor${cc.length === 1 ? 'e' : 'i'}, ${cc.reduce((n, c) => n + packFilled(c), 0)} campioni`, (cid, rid) => {
    const r = placeComps(cc, cid, rid, p);
    toast(`"${p.name}" messo nella sala mostra di ${clients[cid].name}: sistemalo dove vuoi`);
    go('#/ambiente/' + r.id);
  });
}
/* dalla sezione Espositori: l'espositore aperto */
function compPlaceDialog() {
  const c = comp(); if (!c) return;
  placeDialog('Metti in sala mostra', `<b>${esc(c.name)}</b> · ${esc(DISP[c.disp].name)} · ${packFilled(c)} campioni`, (cid, rid) => {
    const r = placeComps([c], cid, rid);
    toast(`Messo nella sala mostra di ${clients[cid].name}: sistemalo dove vuoi`);
    go('#/ambiente/' + r.id);
  });
}
function compToPackDialog() {
  const c = comp(); if (!c) return;
  const list = packList();
  let m = document.getElementById('pkDlg'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="pkDlg"><div class="mbox pk-dlg" style="max-width:460px;width:calc(100vw - 32px)">
    <div class="mhead"><h3><svg class="ic"><use href="#i-box"/></svg> Aggiungi a un pacchetto</h3></div>
    <div style="padding:6px 18px 18px">
      <div class="what"><b>${esc(c.name)}</b> · ${esc(DISP[c.disp].name)} · ${packFilled(c)} campioni</div>
      <label>Pacchetto</label><select id="pkSel">${list.map(p => `<option value="${p.id}">${esc(p.name)} · ${packComps(p).length} espositori</option>`).join('')}<option value="__new" ${list.length ? '' : 'selected'}>＋ Nuovo pacchetto</option></select>
      <div id="pkNewW" ${list.length ? 'hidden' : ''}><label>Nome del nuovo pacchetto</label><input id="pkNewN" value="Pacchetto ${list.length + 1}"></div>
      <div class="askbtns"><button class="btn" id="pkNo">Annulla</button><button class="btn red" id="pkOk"><svg class="ic"><use href="#i-plus"/></svg> Aggiungi</button></div>
    </div></div></div>`);
  m = document.getElementById('pkDlg');
  const sel = document.getElementById('pkSel');
  sel.onchange = () => { document.getElementById('pkNewW').hidden = sel.value !== '__new'; };
  document.getElementById('pkNo').onclick = () => m.remove();
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.getElementById('pkOk').onclick = () => {
    let p = scenes[sel.value];
    if (!p || !p.pack) { p = { id: uid(), pack: true, client: '', name: (document.getElementById('pkNewN').value || '').trim() || 'Pacchetto', note: '', items: [], created: Date.now(), upd: Date.now() }; scenes[p.id] = p; }
    packNewComp(p, DISP[c.disp], c); saveComps(); packTouch(p); m.remove();
    toast(`Aggiunto al pacchetto "${p.name}"`);
  };
}
