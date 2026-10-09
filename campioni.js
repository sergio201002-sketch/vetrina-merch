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
.cs-shared { font-size: 12px; background: #fff6e0; border: 1px solid #f0d58a; border-radius: 8px; padding: 6px 8px; margin: 2px 0 8px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; max-width: 640px; }
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
.cslot.cut::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--dark); z-index: 1; }
.cslot.at { box-shadow: inset 0 0 0 3px var(--red); }
.cs-join { font-size: 12px; margin: 0 0 6px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.cs-join .btn.on { background: #1e6fd9; color: #fff; border-color: #1e6fd9; }
.cslot.picked { box-shadow: inset 0 0 0 3px #1e6fd9; }
.cslot.picked .ck { position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; background: #1e6fd9; color: #fff; font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; }
.cs-selmode .cslot.empty { cursor: copy; }
.cs-selbar { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); z-index: 5; background: #1e2a3a; color: #fff; border-radius: 12px; padding: 8px 10px 8px 14px;
  display: flex; gap: 8px; align-items: center; box-shadow: 0 10px 30px rgba(0,0,0,.3); font-size: 13px; max-width: calc(100vw - 24px); flex-wrap: wrap; }
.cs-selbar[hidden] { display: none; }
.cs-selbar .btn { padding: 6px 10px; }
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

let csDrag = null, csPickAt = null, csQ = '', csGroup = '', csDir = 1, csList = [];
/* "Seleziona per spostare": si scelgono più campioni e si spostano tutti insieme */
let csSelMode = false, csSel = [], csArm = false;
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
      <div class="cs-hint">Trascina per spostare o scambiare (telefono: tieni premuto e trascina) · tocca un posto per inserire, cambiare o togliere: dopo ogni campione passa da solo al posto accanto (partendo dall'ultimo a destra va verso sinistra, ⇄ cambia verso) · Invio nella ricerca mette il campione se ne è rimasto uno solo · ☐ Seleziona per spostare: scegli più campioni e spostali insieme · con − e + vedi più o meno quadratini.</div>
      <div class="cs-tabs" id="csTabs"></div>
      <div class="cs-body" id="csBody"></div>
      <div class="cs-selbar" id="csSelBar" hidden></div>
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
  csSelMode = false; csSel = []; csArm = false;
  document.getElementById('csModal').classList.remove('open');
  document.getElementById('csPick').hidden = true; csPickAt = null;
  roomModels = {}; showSel = null; cam.focus = null;
  const rs = document.getElementById('roomScene'); if (rs) rs.style.display = '';
  renderRoom(); renderRoomSide(); if (typeof applyCam === 'function') applyCam();
}
function slotTile(cid, i, d, c, label, cut) {
  const s = SAMPLE[c.slots[i]], p = esc(label || slotName(d, i, c.slots.length)), at = csPickAt && csPickAt.cid === cid && csPickAt.i === i ? ' at' : '', k = (cut ? ' cut' : '') + at;
  const sel = csSel.indexOf(cid + ':' + i), ck = sel >= 0 ? `<span class="ck">${sel + 1}</span>` : '';
  if (!s) return `<div class="cslot empty${k}" data-c="${cid}" data-i="${i}"><span class="p">${p}</span></div>`;
  return `<div class="cslot${k}${sel >= 0 ? ' picked' : ''}" data-c="${cid}" data-i="${i}" style="${swatchStyle(s)}"><span class="p">${p}</span>${ck}
    <span class="n"><b>${esc(s.s)}</b>${esc(s.c)}${s.toz ? '' : ' · ' + esc(fmt(s.z))}</span></div>`;
}
/* girevoli uguali attaccati, ognuno con i suoi campioni: nel pannello diventano un espositore unico
   (un lato A lungo e un lato B lungo, da sinistra a destra); "Vedi separati" li rimette uno per uno */
const csRowKey = cs => cs.map(c => c.id).sort().join('+');
function csJoinRows(areas) {
  const used = new Set(), out = [];
  areas.forEach(a => {
    if (used.has(a)) return;
    const two = a.d.mode === 'swing' && a.d.sides === 2;
    const row = two && a.items.length === 1 && typeof swingRow === 'function' ? swingRow(a.items[0]) : [];
    const members = row.map(it => areas.find(b => b.items.length === 1 && b.items[0] === it && !used.has(b)));
    if (row.length > 1 && members.every(Boolean) && new Set(members.map(b => b.c.id)).size === members.length) {
      const key = csRowKey(members.map(b => b.c));
      members.forEach(b => used.add(b));
      if ((ui.csSplit || []).includes(key)) { members.forEach(b => out.push(Object.assign({}, b, { joinable: key }))); return; }
      out.push({ row: members, key, d: a.d });
      return;
    }
    used.add(a); out.push(a);
  });
  return out;
}
function csToggleJoin(key) {
  const l = ui.csSplit || []; ui.csSplit = l.includes(key) ? l.filter(k => k !== key) : l.concat(key); saveUI(); renderSampleBoard();
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
  const shown = csJoinRows(areas), joinedOnce = new Set();
  body.innerHTML = shown.length ? shown.map(({ c, d, items, row, key, joinable }) => {
    if (row) {   // fila unita
      const L = Math.ceil(row[0].c.slots.length / 2), [a, b] = d.sideNames || ['A', 'B'], tot = row.reduce((t, m) => t + m.c.slots.length, 0);
      const side = (sd, nm) => `<div class="cs-side">Lato ${esc(nm)}</div><div class="cs-grid" style="--cols:${L * row.length}">${row.map((m, u) =>
        Array.from({ length: L }, (_, h) => slotTile(m.c.id, h + sd * L, d, m.c, (d.sideNames ? nm + ' ' : nm) + (u * L + h + 1), u > 0 && h === 0)).join('')).join('')}</div>`;
      return `<div class="cs-sec"><h4>${row.map(m => esc(m.c.name)).join(' + ')}</h4>
        <div class="cs-join">${row.length} ${esc(d.name)} attaccati, visti come uno solo · <button class="btn" onclick="csToggleJoin('${key}')">Vedi separati</button>${csSelBtn()}</div>
        <div class="s">${row.reduce((t, m) => t + filledOf(m.c), 0)}/${tot} posti · ${esc(acceptLabel(d, row[0].c).slice(0, 3).join(' · '))}</div>
        ${side(0, a)}${side(1, b)}</div>`;
    }
    const joinBtn = joinable && !joinedOnce.has(joinable) ? (joinedOnce.add(joinable), `<div class="cs-join">Attaccato ad altri ${esc(d.name)} · <button class="btn" onclick="csToggleJoin('${joinable}')">Vedi uniti</button>${csSelBtn()}</div>`)
      : `<div class="cs-join">${csSelBtn()}</div>`;
    const n = c.slots.length, two = d.mode === 'swing' && d.sides === 2, L = Math.ceil(n / 2), [a, b] = d.sideNames || ['A', 'B'];
    const cols = two ? L : Math.min(n, d.cols && d.cols * 2 <= 12 ? d.cols * 2 : 10);
    const grid = (from, to) => `<div class="cs-grid" style="--cols:${cols}">${Array.from({ length: to - from }, (_, k) => slotTile(c.id, from + k, d, c)).join('')}</div>`;
    return `<div class="cs-sec"><h4>${esc(c.name)}${items.length > 1 ? ` <span style="color:var(--mid);font-weight:600">×${items.length}</span>` : ''}</h4>
      ${items.length > 1 ? `<div class="cs-shared">Questi ${items.length} espositori hanno gli <b>stessi campioni</b> (sono collegati: cambiandone uno cambiano tutti).
        <button class="btn dark" onclick="splitShared('${c.id}')">Separa: ognuno con i suoi campioni</button></div>` : ''}
      ${joinBtn}<div class="s">${esc(d.name)} · ${filledOf(c)}/${n} posti · ${esc(acceptLabel(d, c).slice(0, 3).join(' · '))}</div>
      ${two ? `<div class="cs-side">Lato ${esc(a)}</div>${grid(0, L)}<div class="cs-side">Lato ${esc(b)}</div>${grid(L, n)}` : grid(0, n)}</div>`;
  }).join('') : `<div class="empty-note">In questa sala mostra non ci sono ancora espositori con posti per i campioni.</div>`;
  body.scrollTop = top;
  body.classList.toggle('cs-selmode', csSelMode);
  renderSelBar();
}

/* espositori della sala che condividono la stessa composizione: ognuno riceve la sua copia (stessi campioni, poi indipendenti) */
function splitShared(cid) {
  const items = room.items.filter(it => it.comp === cid).sort((a, b) => a.x - b.x || elevY(a) - elevY(b));
  if (items.length < 2) return;
  const c = comps[cid], base = c.name;
  items.slice(1).forEach((it, k) => { it.comp = cloneCompFor(it, k + 2); });
  c.name = base + ' (1)'; c.upd = Date.now();
  saveComps(); room.upd = Date.now(); saveRoom();
  renderSampleBoard();
  toast(`Separati: ${items.length} espositori, ognuno con i suoi campioni`);
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
      if (t && t !== d.el) {
        if (csSelMode && csSel.includes(d.el.dataset.c + ':' + d.el.dataset.i)) csMoveGroup(t.dataset.c, +t.dataset.i);   // trascini il gruppo
        else moveSample(d.el.dataset.c, +d.el.dataset.i, t.dataset.c, +t.dataset.i);
      }
    } else if (!d.moved && e.type === 'pointerup' && csSelMode) {   // selezione: tocco = scegli / togli, oppure posto di arrivo
      if (csArm) csMoveGroup(d.el.dataset.c, +d.el.dataset.i);
      else csToggleSel(d.el);
    } else if (!d.moved && e.type === 'pointerup') {   // tocco = scegli il campione
      const g = csGridPos(d.el.dataset.c, +d.el.dataset.i);
      if (g) { if (g.col === g.rowLen - 1 && g.rowLen > 1) csDir = -1; else if (g.col === 0) csDir = 1; }   // dall'ultimo a destra si va verso sinistra, dal primo verso destra
      openSlotPicker(d.el.dataset.c, +d.el.dataset.i);
    }
  };
  window.addEventListener('pointerup', e => { if (csDrag && e.pointerId === csDrag.id) end(e); });
  window.addEventListener('pointercancel', e => { if (!csDrag || e.pointerId !== csDrag.id) return; if (csDrag.on) { csDrag.ghost.remove(); csDrag.el.classList.remove('src'); clearOver(); csDrag = null; } else end(e); });
  body.addEventListener('contextmenu', e => { if (e.target.closest('.cslot')) e.preventDefault(); });
}

/* ── seleziona per spostare ── */
/* incolla codici in un espositore (o in una fila unita): i posti vuoti nell'ordine in cui li vedi */
async function csPaste(btn) {
  const sec = btn.closest('.cs-sec'), tiles = [...sec.querySelectorAll('.cslot')], name = sec.querySelector('h4').textContent;
  const r = await pasteDialog(`Incolla i codici per ${name}: uno per riga. Vanno nei posti vuoti, da sinistra a destra.`);
  if (!r || !r.text.trim()) return;
  const o = fillWithCodes(tiles.map(t => ({ cid: t.dataset.c, i: +t.dataset.i })), r.text, r.all);
  renderSampleBoard(); pasteReport(o);
}
function csSelBtn() {
  return `<button class="btn" onclick="csPaste(this)" title="Incolla un elenco di codici (uno per riga)">📋 Incolla codici</button>` + `<button class="btn${csSelMode ? ' on' : ''}" onclick="csToggleSelMode()" title="Scegli più campioni e spostali tutti insieme">${csSelMode ? '✓ Selezione attiva' : '☐ Seleziona per spostare'}</button>`;
}
function csToggleSelMode() {
  csSelMode = !csSelMode; csSel = []; csArm = false;
  document.getElementById('csPick').hidden = true; csPickAt = null;
  renderSampleBoard();
}
function csToggleSel(el) {
  const id = el.dataset.c + ':' + el.dataset.i, k = csSel.indexOf(id);
  if (k >= 0) csSel.splice(k, 1);
  else if (SAMPLE[comps[el.dataset.c].slots[+el.dataset.i]]) csSel.push(id);
  else { toast('Posto vuoto: scegli i campioni da spostare'); return; }
  renderSampleBoard();
}
function renderSelBar() {
  const bar = document.getElementById('csSelBar'); if (!bar) return;
  bar.hidden = !csSelMode;
  if (!csSelMode) return;
  const n = csSel.length;
  bar.innerHTML = csArm
    ? `<span>Tocca il posto dove mettere il <b>primo</b>: gli altri seguono verso destra</span><button class="btn" onclick="csArm=false; renderSelBar()">Indietro</button>`
    : `<span>${n ? `<b>${n}</b> selezionat${n === 1 ? 'o' : 'i'}` : 'Tocca i campioni da spostare'}</span>
       ${n ? `<button class="btn dark" onclick="csArm=true; renderSelBar()">Sposta…</button><button class="btn" onclick="csSel=[]; renderSampleBoard()">Deseleziona</button>` : ''}
       <button class="btn" onclick="csToggleSelMode()">Fine</button>`;
}
/* sposta i selezionati (nell'ordine in cui li vedi) nei posti consecutivi a partire da quello toccato;
   i campioni che erano lì vanno nei posti lasciati liberi */
function csMoveGroup(cid, i) {
  const order = [...document.querySelectorAll('#csBody .cslot')].map(e => e.dataset.c + ':' + e.dataset.i);
  const src = csSel.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(id => { const [c, j] = id.split(':'); return { cid: c, i: +j }; });
  const id = o => o.cid + ':' + o.i, keys = src.map(o => comps[o.cid].slots[o.i]);
  const dest = [{ cid, i }], dir = csDir; csDir = 1;
  while (dest.length < src.length) { const nx = csNextSlot(dest[dest.length - 1].cid, dest[dest.length - 1].i); if (!nx) break; dest.push({ cid: nx.cid, i: nx.i }); }
  csDir = dir;
  if (dest.length < src.length) { toast(`Da qui non ci sono ${src.length} posti di fila: scegli un posto più indietro`); return; }
  const srcIds = new Set(src.map(id)), destIds = new Set(dest.map(id));
  const displaced = dest.filter(o => !srcIds.has(id(o))).map(o => comps[o.cid].slots[o.i]).filter(Boolean);
  const freed = src.filter(o => !destIds.has(id(o)));
  for (let j = 0; j < keys.length; j++) {
    const s = SAMPLE[keys[j]], c = comps[dest[j].cid];
    if (s && !acceptsIn(c, s)) { toast(`${s.s} ${s.c} (${fmt(s.z)}) non entra in ${c.name}`); return; }
  }
  for (let j = 0; j < displaced.length; j++) {
    const s = SAMPLE[displaced[j]], c = comps[freed[j].cid];
    if (s && !acceptsIn(c, s)) { toast(`Spostamento non possibile: ${s.s} ${s.c} non entra in ${c.name}`); return; }
  }
  src.forEach(o => { comps[o.cid].slots[o.i] = null; });
  dest.forEach((o, j) => { comps[o.cid].slots[o.i] = keys[j]; });
  freed.forEach((o, j) => { if (j < displaced.length) comps[o.cid].slots[o.i] = displaced[j]; });
  const now = Date.now(); new Set([...src, ...dest].map(o => o.cid)).forEach(c => { comps[c].upd = now; });
  saveComps();
  csSel = dest.map(id); csArm = false;     // restano selezionati: puoi spostarli ancora
  renderSampleBoard();
  toast(`${keys.length} campion${keys.length === 1 ? 'e spostato' : 'i spostati'}` + (displaced.length ? ` · ${displaced.length} scambiat${displaced.length === 1 ? 'o' : 'i'}` : ''));
}

/* ── inserire / cambiare / togliere ── */
/* posizione di un posto nella griglia mostrata (riga, colonna) e il posto accanto nella direzione scelta:
   finita una riga passa alla riga sotto, ripartendo dallo stesso lato */
function csGridPos(cid, i) {
  const el = document.querySelector(`#csBody .cslot[data-c="${cid}"][data-i="${i}"]`), grid = el && el.parentElement; if (!grid) return null;
  const tiles = [...grid.children], pos = tiles.indexOf(el), cols = +getComputedStyle(grid).getPropertyValue('--cols') || tiles.length;
  const row = Math.floor(pos / cols), rowLen = r => Math.min(cols, tiles.length - r * cols);
  return { tiles, pos, cols, row, col: pos - row * cols, rowLen: rowLen(row), rowLenOf: rowLen };
}
function csNextSlot(cid, i) {
  const g = csGridPos(cid, i); if (!g) return null;
  let r = g.row, c = g.col + csDir;
  if (c < 0 || c >= g.rowLen) { r++; if (r * g.cols >= g.tiles.length) return null; c = csDir > 0 ? 0 : g.rowLenOf(r) - 1; }
  const t = g.tiles[r * g.cols + c]; return t ? { cid: t.dataset.c, i: +t.dataset.i, label: t.querySelector('.p').textContent } : null;
}
function openSlotPicker(cid, i) {
  csPickAt = { cid, i }; csQ = '';
  document.querySelectorAll('#csBody .cslot.at').forEach(e => e.classList.remove('at'));
  const tEl = document.querySelector(`#csBody .cslot[data-c="${cid}"][data-i="${i}"]`);
  if (tEl) { tEl.classList.add('at'); tEl.scrollIntoView({ block: 'nearest' }); }
  const lab = tEl ? tEl.querySelector('.p').textContent : null;
  const c = comps[cid], d = DISP[c.disp], s = SAMPLE[c.slots[i]], box = document.getElementById('csPick');
  box.hidden = false;
  box.innerHTML = `<div class="pkh"><div class="t">Posto ${esc(lab || slotName(d, i, c.slots.length))} · ${esc(c.name)} <span style="color:var(--mid);font-weight:600">· poi ${csDir > 0 ? 'a destra →' : '← a sinistra'}</span></div>
      <button class="btn" onclick="csDir=-csDir; openSlotPicker('${cid}', ${i})" title="Cambia direzione">⇄</button>
      ${s ? `<button class="btn" onclick="setBoardSlot(null)">Togli</button>` : ''}
      <button class="btn" onclick="document.getElementById('csPick').hidden=true">Chiudi</button>
      <input id="csSearch" placeholder="Cerca serie, colore, codice… (${esc(acceptLabel(d, c).slice(0, 2).join(' · '))})" oninput="csQ=this.value; renderSlotPicker()" onkeydown="if(event.key==='Enter'){event.preventDefault(); csPickOnly()}" enterkeyhint="done"></div>
    <div class="pl" id="csList"></div>`;
  renderSlotPicker();
  const inp = document.getElementById('csSearch'); if (inp) try { inp.focus({ preventScroll: true }); } catch (e) {}   // si scrive subito il prossimo codice
}
function csPickOnly() {
  const q = normTxt(csQ || '').trim().toUpperCase();
  const exact = q && csList.filter(s => (s.k || []).some(k => k.toUpperCase() === q));
  const one = csList.length === 1 ? csList[0] : exact && exact.length === 1 ? exact[0] : null;
  if (one) setBoardSlot(one.key);
  else toast(csList.length ? `${csList.length} campioni trovati: scrivi di più o toccane uno` : 'Nessun campione trovato');
}
function renderSlotPicker() {
  if (!csPickAt) return;
  const c = comps[csPickAt.cid], d = DISP[c.disp];
  const inRoom = new Set(); csItems().forEach(a => a.c.slots.forEach(k => k && inRoom.add(k)));
  const q = normTxt(csQ || '').trim().split(/\s+/).filter(Boolean);
  let list = compatibleFor(c).filter(s => { if (!q.length) return true; const h = normTxt([s.b, s.s, s.c, s.z, ...(s.k || [])].join(' ')); return q.every(w => h.includes(w)); });
  list.sort((a, b) => (hasPhoto(b) - hasPhoto(a)) || a.s.localeCompare(b.s) || a.c.localeCompare(b.c));
  csList = list;
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
  // dopo l'inserimento passa subito al posto accanto (verso destra o verso sinistra, da dove sei partito), anche sull'espositore attaccato
  const next = key ? csNextSlot(csPickAt.cid, csPickAt.i) : null;
  if (next) { openSlotPicker(next.cid, next.i); toast('Inserito · ora il posto ' + next.label); }
  else { document.getElementById('csPick').hidden = true; csPickAt = null; toast(key ? 'Campione inserito' : 'Posto svuotato'); }
}
