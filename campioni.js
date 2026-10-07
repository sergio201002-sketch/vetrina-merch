'use strict';
/* ════════════════════════════════════════════════════════════
   SISTEMA I CAMPIONI — pannello rapido della sala mostra.
   Tutti gli espositori della sala con i loro posti come quadratini (foto, posto, nome).
   • trascina un quadratino su un altro posto (anche di un altro espositore): sposta o scambia
     (sul telefono: tieni premuto un attimo, poi trascina; un tocco veloce scorre la pagina)
   • tocca un posto: elenco dei campioni compatibili per inserirlo o cambiarlo, oppure toglierlo
   Si rispettano i formati: un campione che non entra in un espositore non ci va.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
.cs-modal { padding: 0; }
.cs-modal .mbox { width: 100vw; height: 100vh; height: 100dvh; max-height: none; border-radius: 0; position: relative; }
.cs-modal .mhead { padding: 8px 14px; }
.cs-size { display: flex; align-items: center; gap: 4px; font-size: 12px; color: var(--mid); }
.cs-size .btn { min-width: 34px; font-size: 16px; padding: 3px 8px; }
@media (max-height: 640px) { .cs-hint { display: none; } }
.cs-hint { padding: 6px 14px; font-size: 12px; color: var(--mid); border-bottom: 1px solid var(--border); }
.cs-tabs { display: flex; gap: 6px; padding: 8px 14px; border-bottom: 1px solid var(--border); overflow-x: auto; flex: none; }
.cs-tabs button { flex: none; border: 1px solid var(--border); background: var(--white); border-radius: 999px; padding: 6px 12px; font-size: 12.5px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.cs-tabs button .k { color: var(--mid); font-weight: 600; margin-left: 4px; }
.cs-tabs button.on { background: var(--dark); color: #fff; border-color: var(--dark); }
.cs-tabs button.on .k { color: #ccc; }
.cs-body { overflow-y: auto; padding: 10px 14px 80px; flex: 1; -webkit-overflow-scrolling: touch; display: flex; flex-wrap: wrap; gap: 6px 26px; align-content: flex-start; }
.cs-sec { flex: none; margin: 4px 0 10px; max-width: 100%; }
.cs-sec h4 { margin: 0 0 2px; font-size: 14px; }
.cs-sec .s { font-size: 11.5px; color: var(--mid); margin-bottom: 6px; }
.cs-side { font-size: 10.5px; font-weight: 800; color: var(--mid); text-transform: uppercase; letter-spacing: .05em; margin: 6px 0 4px; }
.cs-grid { display: grid; grid-template-columns: repeat(var(--cols, 8), var(--t, 70px)); gap: 4px; max-width: 100%; overflow-x: auto; }
.cslot { position: relative; width: var(--t, 70px); height: calc(var(--t, 70px) * 1.22); border-radius: 8px; background: #e9e6df; background-size: cover; background-position: center; overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); cursor: grab; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.cslot.empty { background: repeating-linear-gradient(45deg, #f7f6f2 0 8px, #efede7 8px 16px); box-shadow: inset 0 0 0 1.5px #cfcbc2; cursor: pointer; }
.cslot.empty::after { content: '+'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #b5b0a5; font-weight: 300; }
.cslot .p { position: absolute; top: 3px; left: 3px; background: rgba(17,17,17,.78); color: #fff; font-size: calc(var(--t, 70px) * .13); font-weight: 800; padding: 1px 5px; border-radius: 4px; }
.cslot .n { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(transparent, rgba(0,0,0,.78)); color: #fff; font-size: calc(var(--t, 70px) * .13); line-height: 1.15; padding: 10px 4px 3px; overflow: hidden; }
.cs-small .cslot .n b { display: none; }
.cslot .n b { display: block; font-size: calc(var(--t, 70px) * .12); text-transform: uppercase; letter-spacing: .02em; }
.cslot.src { opacity: .35; }
.cslot.over { box-shadow: inset 0 0 0 3px var(--red); }
.cslot.bad { box-shadow: inset 0 0 0 3px #999; filter: grayscale(.6); }
.cs-ghost { position: fixed; z-index: 400; width: 84px; height: 102px; border-radius: 8px; pointer-events: none; background-size: cover; background-position: center;
  box-shadow: 0 10px 24px rgba(0,0,0,.35); transform: translate(-50%, -60%) rotate(-3deg); opacity: .95; }
.cs-pick { position: absolute; left: 0; right: 0; bottom: 0; height: 72%; background: var(--white); border-top: 1px solid var(--border); box-shadow: 0 -10px 30px rgba(0,0,0,.18);
  display: flex; flex-direction: column; border-radius: 14px 14px 0 0; }
.cs-pick[hidden] { display: none; }
.cs-pick .pkh { flex: none; position: relative; z-index: 1; background: var(--white); border-radius: 14px 14px 0 0; display: flex; gap: 8px; align-items: center; padding: 10px 14px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
.cs-pick .pkh .t { flex: 1; font-weight: 800; font-size: 14px; min-width: 160px; }
.cs-pick input { width: 100%; padding: 9px 10px; border: 1px solid var(--border); border-radius: 8px; font: inherit; }
.cs-pick .pl { overflow-y: auto; flex: 1 1 auto; min-height: 0; }
@media (max-height: 560px) { .cs-pick { height: 88%; } }
</style>`);

let csDrag = null, csPickAt = null, csQ = '', csGroup = '';
/* gruppi di espositori tra cui i campioni si possono spostare: stesso formato accettato (es. tutti i 60×120), tutti i tozzetti */
const csKey = d => d.accept.tozzetto ? 'toz' : d.accept.sizes ? 'z:' + d.accept.sizes.map(z => sorted2(parseSize(z)).join('x')).sort().join('+') : d.accept.fit ? 'fit:' + sorted2(d.accept.fit).join('x') : 'd:' + d.id;
const csLabel = d => d.accept.tozzetto ? 'Tozzetti' : d.accept.sizes ? d.accept.sizes.map(fmt).join(' / ') : d.accept.fit ? 'Pannelli fino a ' + fmt(d.accept.fit.join('x')) : d.name;
const csItems = () => {   // un'area per composizione (due girevoli con la stessa composizione = una sola area)
  const seen = new Map();
  room.items.slice().sort((a, b) => a.x - b.x || elevY(a) - elevY(b)).forEach(it => {
    const d = DISP[it.disp], c = comps[it.comp];
    if (!d || !d.slots || !c) return;
    if (!seen.has(c.id)) seen.set(c.id, { c, d, items: [] });
    seen.get(c.id).items.push(it);
  });
  return [...seen.values()];
};

function openSampleBoard() {
  let m = document.getElementById('csModal');
  if (!m) {
    document.body.insertAdjacentHTML('beforeend', `<div class="modal cs-modal" id="csModal"><div class="mbox">
      <div class="mhead"><h3>🧩 Sistema i campioni</h3>
        <div class="cs-size">Grandezza <button class="btn" onclick="csZoom(-1)" title="Quadratini più piccoli: ne vedi di più">−</button><button class="btn" onclick="csZoom(1)" title="Quadratini più grandi">+</button></div>
        <button class="btn dark" onclick="closeSampleBoard()">Fatto</button></div>
      <div class="cs-hint">Trascina per spostare o scambiare (telefono: tieni premuto e trascina) · tocca un posto per inserire, cambiare o togliere · con − e + vedi più o meno quadratini.</div>
      <div class="cs-tabs" id="csTabs"></div>
      <div class="cs-body" id="csBody"></div>
      <div class="cs-pick" id="csPick" hidden></div></div></div>`);
    m = document.getElementById('csModal');
    bindBoardDrag(document.getElementById('csBody'));
  }
  m.classList.add('open');
  const rs = document.getElementById('roomScene'); if (rs) rs.style.display = 'none';   // la sala 3D si ferma mentre sistemi i campioni (niente rallentamenti)
  renderSampleBoard();
}
const CS_SIZES = [44, 52, 60, 70, 82, 96, 112, 130];
function csSize() { const t = ui.csT || (innerWidth < 700 ? 60 : 70); return CS_SIZES.includes(t) ? t : 70; }
function csZoom(dir) {
  const i = CS_SIZES.indexOf(csSize()), t = CS_SIZES[Math.max(0, Math.min(CS_SIZES.length - 1, i + dir))];
  ui.csT = t; saveUI(); renderSampleBoard();
}
function closeSampleBoard() {
  document.getElementById('csModal').classList.remove('open');
  document.getElementById('csPick').hidden = true; csPickAt = null;
  roomModels = {}; showSel = null; cam.focus = null;
  const rs = document.getElementById('roomScene'); if (rs) rs.style.display = '';
  renderRoom(); renderRoomSide(); if (typeof applyCam === 'function') applyCam();
}
function slotTile(cid, i, d, c) {
  const s = SAMPLE[c.slots[i]], p = esc(slotName(d, i, c.slots.length));
  if (!s) return `<div class="cslot empty" data-c="${cid}" data-i="${i}"><span class="p">${p}</span></div>`;
  return `<div class="cslot" data-c="${cid}" data-i="${i}" style="${swatchStyle(s)}"><span class="p">${p}</span>
    <span class="n"><b>${esc(s.s)}</b>${esc(s.c)}${s.toz ? '' : ' · ' + esc(fmt(s.z))}</span></div>`;
}
function renderSampleBoard() {
  const body = document.getElementById('csBody'); if (!body) return;
  const top = body.scrollTop, all = csItems();
  // schede: Tutti + una per gruppo di formato (solo quelli presenti in sala)
  const groups = new Map();
  all.forEach(a => { const k = csKey(a.d); if (!groups.has(k)) groups.set(k, { label: csLabel(a.d), n: 0, names: new Set() }); const g = groups.get(k); g.n++; g.names.add(a.d.name); });
  if (csGroup && !groups.has(csGroup)) csGroup = '';
  document.getElementById('csTabs').innerHTML = `<button class="${csGroup ? '' : 'on'}" onclick="csGroup=''; renderSampleBoard()">Tutti<span class="k">${all.length}</span></button>` +
    [...groups].map(([k, g]) => `<button class="${csGroup === k ? 'on' : ''}" title="${esc([...g.names].join(', '))}" onclick="csGroup='${k}'; document.getElementById('csBody').scrollTop=0; renderSampleBoard()">${esc(g.label)}<span class="k">${g.n}</span></button>`).join('');
  const areas = csGroup ? all.filter(a => csKey(a.d) === csGroup) : all;
  const t = csSize(); body.style.setProperty('--t', t + 'px'); body.classList.toggle('cs-small', t < 60);
  body.innerHTML = areas.length ? areas.map(({ c, d, items }) => {
    const n = c.slots.length, two = d.mode === 'swing' && d.sides === 2, L = Math.ceil(n / 2), [a, b] = d.sideNames || ['A', 'B'];
    const cols = two ? L : Math.min(n, d.cols && d.cols * 2 <= 12 ? d.cols * 2 : 10);
    const grid = (from, to) => `<div class="cs-grid" style="--cols:${cols}">${Array.from({ length: to - from }, (_, k) => slotTile(c.id, from + k, d, c)).join('')}</div>`;
    return `<div class="cs-sec"><h4>${esc(c.name)}${items.length > 1 ? ` <span style="color:var(--mid);font-weight:600">×${items.length}</span>` : ''}</h4>
      <div class="s">${esc(d.name)} · ${filledOf(c)}/${n} posti · ${esc(acceptLabel(d, c).slice(0, 3).join(' · '))}</div>
      ${two ? `<div class="cs-side">Lato ${esc(a)}</div>${grid(0, L)}<div class="cs-side">Lato ${esc(b)}</div>${grid(L, n)}` : grid(0, n)}</div>`;
  }).join('') : `<div class="empty-note">In questa sala mostra non ci sono ancora espositori con posti per i campioni.</div>`;
  body.scrollTop = top;
}

/* ── spostare / scambiare ── */
function moveSample(fromC, fromI, toC, toI) {
  if (fromC === toC && fromI === toI) return;
  const c1 = comps[fromC], c2 = comps[toC], d1 = DISP[c1.disp], d2 = DISP[c2.disp];
  const k1 = c1.slots[fromI], k2 = c2.slots[toI], s1 = SAMPLE[k1], s2 = SAMPLE[k2];
  if (s1 && !acceptsIn(c2, s1)) { toast(`${s1.s} ${s1.c} (${fmt(s1.z)}) non entra in ${c2.name}`); return; }
  if (s2 && !acceptsIn(c1, s2)) { toast(`Scambio non possibile: ${s2.s} ${s2.c} non entra in ${c1.name}`); return; }
  c1.slots[fromI] = k2 || null; c2.slots[toI] = k1 || null;
  c1.upd = c2.upd = Date.now(); saveComps();
  renderSampleBoard();
  toast(s2 ? 'Campioni scambiati' : 'Campione spostato');
}
function bindBoardDrag(body) {
  const tileAt = (x, y) => { const el = document.elementFromPoint(x, y); return el && el.closest('.cslot'); };
  const clearOver = () => body.querySelectorAll('.cslot.over,.cslot.bad').forEach(e => e.classList.remove('over', 'bad'));
  const start = e => {
    const t = csDrag.el, s = SAMPLE[comps[t.dataset.c].slots[+t.dataset.i]];
    csDrag.on = true; t.classList.add('src');
    try { body.setPointerCapture(csDrag.id); } catch (er) {}   // il rilascio arriva qui anche fuori dal pannello
    csDrag.ghost = document.createElement('div'); csDrag.ghost.className = 'cs-ghost';
    csDrag.ghost.setAttribute('style', swatchStyle(s)); document.body.appendChild(csDrag.ghost);
    moveGhost(e.clientX, e.clientY);
    if (navigator.vibrate) try { navigator.vibrate(15); } catch (er) {}
  };
  const moveGhost = (x, y) => {
    csDrag.ghost.style.left = x + 'px'; csDrag.ghost.style.top = y + 'px';
    clearOver();
    const t = tileAt(x, y);
    if (t && t !== csDrag.el) {
      const s1 = SAMPLE[comps[csDrag.el.dataset.c].slots[+csDrag.el.dataset.i]], c2 = comps[t.dataset.c], s2 = SAMPLE[c2.slots[+t.dataset.i]];
      const ok = acceptsIn(c2, s1) && (!s2 || acceptsIn(comps[csDrag.el.dataset.c], s2));
      t.classList.add(ok ? 'over' : 'bad');
    }
    const r = body.getBoundingClientRect();              // scorre da solo vicino ai bordi
    csDrag.scroll = y < r.top + 50 ? -14 : y > r.bottom - 50 ? 14 : 0;
  };
  const tick = () => { if (csDrag && csDrag.on) { if (csDrag.scroll) body.scrollTop += csDrag.scroll; requestAnimationFrame(tick); } };
  body.addEventListener('pointerdown', e => {
    const t = e.target.closest('.cslot'); if (!t || e.button > 0) return;
    csDrag = { el: t, x: e.clientX, y: e.clientY, id: e.pointerId, touch: e.pointerType !== 'mouse', on: false, filled: !t.classList.contains('empty') };
    if (csDrag.touch && csDrag.filled) csDrag.timer = setTimeout(() => { if (csDrag && !csDrag.moved) { start(csDrag.last || e); tick(); } }, 280);   // tenere premuto
  });
  window.addEventListener('pointermove', e => {
    if (!csDrag || e.pointerId !== csDrag.id) return;
    csDrag.last = e;
    const far = Math.hypot(e.clientX - csDrag.x, e.clientY - csDrag.y) > 8;
    if (!csDrag.on) {
      if (!far) return;
      if (csDrag.touch) { csDrag.moved = true; clearTimeout(csDrag.timer); csDrag = null; return; }   // dito che scorre la pagina
      if (!csDrag.filled) return;
      start(e); tick();
    }
    if (!csDrag.raf) csDrag.raf = requestAnimationFrame(() => { if (!csDrag) return; csDrag.raf = 0; if (csDrag.on && csDrag.last) moveGhost(csDrag.last.clientX, csDrag.last.clientY); });   // un aggiornamento per fotogramma
  });
  // durante il trascinamento col dito la pagina non deve scorrere
  body.addEventListener('touchmove', e => { if (csDrag && csDrag.on) e.preventDefault(); }, { passive: false });
  const end = e => {
    if (!csDrag) return;
    clearTimeout(csDrag.timer);
    const d = csDrag; csDrag = null;
    if (d.on) {
      d.ghost.remove(); d.el.classList.remove('src'); clearOver();
      const t = tileAt(e.clientX, e.clientY);
      if (t && t !== d.el) moveSample(d.el.dataset.c, +d.el.dataset.i, t.dataset.c, +t.dataset.i);
    } else if (!d.moved && e.type === 'pointerup') openSlotPicker(d.el.dataset.c, +d.el.dataset.i);   // tocco = scegli il campione
  };
  window.addEventListener('pointerup', e => { if (csDrag && e.pointerId === csDrag.id) end(e); });
  window.addEventListener('pointercancel', e => { if (!csDrag || e.pointerId !== csDrag.id) return; if (csDrag.on) { csDrag.ghost.remove(); csDrag.el.classList.remove('src'); clearOver(); csDrag = null; } else end(e); });
  body.addEventListener('contextmenu', e => { if (e.target.closest('.cslot')) e.preventDefault(); });
}

/* ── inserire / cambiare / togliere ── */
function openSlotPicker(cid, i) {
  csPickAt = { cid, i }; csQ = '';
  const c = comps[cid], d = DISP[c.disp], s = SAMPLE[c.slots[i]], box = document.getElementById('csPick');
  box.hidden = false;
  box.innerHTML = `<div class="pkh"><div class="t">Posto ${esc(slotName(d, i, c.slots.length))} · ${esc(c.name)}</div>
      ${s ? `<button class="btn" onclick="setBoardSlot(null)">Togli</button>` : ''}
      <button class="btn" onclick="document.getElementById('csPick').hidden=true">Chiudi</button>
      <input id="csSearch" placeholder="Cerca serie, colore, codice… (${esc(acceptLabel(d, c).slice(0, 2).join(' · '))})" oninput="csQ=this.value; renderSlotPicker()"></div>
    <div class="pl" id="csList"></div>`;
  renderSlotPicker();
}
function renderSlotPicker() {
  if (!csPickAt) return;
  const c = comps[csPickAt.cid], d = DISP[c.disp];
  const inRoom = new Set(); csItems().forEach(a => a.c.slots.forEach(k => k && inRoom.add(k)));
  const q = normTxt(csQ || '').trim().split(/\s+/).filter(Boolean);
  let list = compatibleFor(c).filter(s => { if (!q.length) return true; const h = normTxt([s.b, s.s, s.c, s.z, ...(s.k || [])].join(' ')); return q.every(w => h.includes(w)); });
  list.sort((a, b) => (hasPhoto(b) - hasPhoto(a)) || a.s.localeCompare(b.s) || a.c.localeCompare(b.c));
  const more = list.length > 150; list = list.slice(0, 150);
  document.getElementById('csList').innerHTML = list.map(s => `<div class="srow${inRoom.has(s.key) ? ' used' : ''}" onclick="setBoardSlot('${s.key.replace(/'/g, "\\'")}')">
      <span class="sw" style="${swatchStyle(s)}"></span>
      <div class="info"><div class="brand">${esc(s.b)}</div><div class="ser">${esc(s.s)}</div><div class="col">${esc(s.c)} · ${esc(s.toz ? 'tozzetto' + tozFrom(s) : fmt(s.z))}</div>
      <div class="meta">${esc((s.k || []).join(' / '))}${hasPhoto(s) ? '' : ' · senza foto'}</div></div>${inRoom.has(s.key) ? '<span title="già in sala">✓</span>' : ''}</div>`).join('')
    + (more ? `<div class="empty-note">Altri risultati: scrivi qualche lettera in più per trovarli.</div>` : '')
    + (list.length ? '' : `<div class="empty-note">Nessun campione compatibile trovato.</div>`);
}
function setBoardSlot(key) {
  if (!csPickAt) return;
  const c = comps[csPickAt.cid]; c.slots[csPickAt.i] = key; c.upd = Date.now(); saveComps();
  renderSampleBoard();
  // dopo l'inserimento passa al prossimo posto vuoto dello stesso espositore, così si riempie in fretta
  const next = key ? c.slots.findIndex((k, j) => j > csPickAt.i && !k) : -1;
  if (next >= 0) { openSlotPicker(csPickAt.cid, next); toast('Inserito · ora il posto ' + slotName(DISP[c.disp], next, c.slots.length)); }
  else { document.getElementById('csPick').hidden = true; csPickAt = null; toast(key ? 'Campione inserito' : 'Posto svuotato'); }
}
