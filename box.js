'use strict';
/* ════════════════════════════════════════════════════════════
   BOX IN POSA (#/box) — sezione a parte, come Clienti, Espositori e Pacchetti: tutti i box (di un cliente o liberi),
   nuovo box, duplica, elimina. Un box è una composizione dell'espositore BOX (posti: parete di fondo, pavimento,
   parete sinistra, parete destra; misure e posa in c.box, vedi espositori3d.js).
   L'editor del box è il configuratore con una pagina sua (body[data-studio="box"]): la vista 3D grande, in alto una riga
   con nome e azioni, sotto una striscia sottile con misure e posa della superficie scelta (non copre il box), i materiali
   in un pannello che si apre solo per scegliere il materiale di una superficie, e "Dettaglio materiale": la mattonella
   (o la posa) a tutto schermo, da ingrandire e spostare (rotella, due dita, doppio clic).
   ════════════════════════════════════════════════════════════ */
(() => { const v = document.createElement('div'); v.id = 'viewBoxes'; v.className = 'view'; document.body.appendChild(v); })();
document.head.insertAdjacentHTML('beforeend', `<style>
body[data-view="boxes"] #viewBoxes { display: block; }
body[data-view="boxes"] .hbtn[data-nav="box"], body[data-view="config"][data-studio="box"] .hbtn[data-nav="box"] {
  background: rgba(255,255,255,.12); color: #fff; box-shadow: inset 0 -2px 0 var(--red); }
body[data-view="config"][data-studio="box"] .hbtn[data-nav="config"] { background: transparent; color: rgba(255,255,255,.78); box-shadow: none; }
/* ── elenco dei box ── */
.bx-intro { color: var(--mid); font-size: 13px; margin: -8px 0 16px; max-width: 760px; line-height: 1.5; }
.bx-grid { grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
.bx-card { padding: 0; overflow: hidden; gap: 0; }
.bx-th { position: relative; height: 210px; overflow: hidden; perspective: 1400px; perspective-origin: 50% 30%; pointer-events: none;
  background: radial-gradient(ellipse at 50% 30%, #fdfcfa 0%, #eeebe5 62%, #e0dcd4 100%); border-bottom: 1px solid var(--border); }
.bx-th .bx-mid { position: absolute; left: 50%; top: 0; width: 0; height: 0; transform-style: preserve-3d; }
.bx-th .sw-root { transition: none; }
.bx-th .bx-none { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--mid); font-size: 13px; font-weight: 600; }
.bx-th .bx-none .ic { width: 22px; height: 22px; }
.bx-card .in { padding: 12px 16px 14px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.bx-card h3 { font-size: 16px; }
.bx-card .sub { font-size: 12px; color: var(--mid); }
.bx-surf { display: flex; flex-direction: column; gap: 5px; margin: 2px 0 4px; }
.bx-surf div { display: grid; grid-template-columns: 22px minmax(0, 1fr); gap: 8px; align-items: center; font-size: 12px; }
.bx-surf i { width: 22px; height: 22px; border-radius: 5px; background: #eee center / cover no-repeat; border: 1px solid rgba(0,0,0,.08); }
.bx-surf span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bx-surf small { color: var(--mid); font-size: 11.5px; }
.bx-acts { display: flex; gap: 6px; margin-top: auto; }
.bx-acts .btn:first-child { flex: 1; justify-content: center; }
.bx-sel { height: 38px; max-width: 220px; }
#bxNewModal .bxnew { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 12px; }
#bxNewModal label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; font-weight: 700; color: var(--mid); }
#bxNewModal input, #bxNewModal select { border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; font: 500 14px var(--font-body); color: var(--dark); background: #fff; }
#bxNewModal .foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
/* ── editor del box ── */
.bxhead, .bxtools, .bxdraw-h { display: none; }
body[data-view="config"][data-studio="box"] .app { grid-template-columns: minmax(0, 1fr); grid-template-rows: 56px minmax(0, 1fr); height: 100vh; }
body[data-view="config"][data-studio="box"] aside.list, body[data-view="config"][data-studio="box"] main > .toolbar { display: none; }
body[data-view="config"][data-studio="box"] main { height: auto; transition: margin-right .25s ease; }
body[data-studio="box"] .bxhead { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--white); border-bottom: 1px solid var(--border); flex: none; min-width: 0; }
.bxhead .tb { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; padding: 7px 11px; }
.bxhead .nm { font: 700 18px var(--font-display); letter-spacing: -.02em; border: 1px solid transparent; border-radius: 8px; padding: 4px 8px; background: transparent; width: 250px; max-width: 30vw; min-width: 110px; color: var(--dark); }
.bxhead .nm:hover, .bxhead .nm:focus { border-color: var(--border); background: #fff; outline: none; }
.bxhead .who { font-size: 12px; color: var(--mid); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.bxhead .who b { color: var(--dark); font-weight: 650; }
.bxhead .sp { flex: 1; }
.bxmenu { position: fixed; z-index: 300; background: #fff; border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 16px 40px rgba(0,0,0,.16); padding: 6px; min-width: 230px; }
.bxmenu button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: none; padding: 9px 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-align: left; color: var(--dark); }
.bxmenu button:hover { background: var(--bg); }
.bxmenu button.red { color: var(--red); }
.bxmenu hr { border: none; border-top: 1px solid var(--border); margin: 4px 2px; }
/* striscia sottile: misure e posa della superficie scelta, fuori dalla vista */
body[data-studio="box"] .bxtools { display: flex; align-items: center; gap: 8px 14px; padding: 7px 14px; background: #fbfaf8; border-bottom: 1px solid var(--border);
  flex: none; flex-wrap: wrap; font-size: 12px; white-space: nowrap; }
.bxtools .g { display: flex; align-items: center; gap: 5px; }
.bxtools .l { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--mid); margin-right: 3px; }
.bxtools .l b { color: var(--red); font-weight: 800; }
.bxtools label { display: inline-flex; align-items: center; gap: 3px; font-weight: 700; color: var(--mid); }
.bxtools input { width: 56px; border: 1px solid var(--border); border-radius: 7px; padding: 4px 6px; font: 600 12px var(--font-body); background: #fff; color: var(--dark); }
.bxtools .x { color: #b5b1a8; }
.bxtools .em { color: var(--mid); font-style: italic; }
.bxtools .seg { display: inline-flex; background: var(--bg2); border-radius: 8px; padding: 2px; }
.bxtools .seg button, .bxtools .bt { border: none; background: transparent; padding: 4px 9px; border-radius: 6px; font: 650 12px var(--font-body); cursor: pointer; color: var(--dark); display: inline-flex; align-items: center; gap: 5px; }
.bxtools .seg button.on { background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.14); color: var(--red); }
.bxtools .bt { border: 1px solid var(--border); background: #fff; padding: 4px 10px; }
.bxtools .bt:hover { border-color: #cfcac0; }
.bxtools .bt.red { background: var(--red); border-color: var(--red); color: #fff; }
.bxtools .bt.dk { background: var(--dark); border-color: var(--dark); color: #fff; }
.bxtools .bt:disabled { opacity: .4; cursor: default; }
.bxtools .sep { width: 1px; height: 22px; background: var(--border); flex: none; }
.bxtools .sp { flex: 1; min-width: 8px; }
@media (max-width: 1320px) { .bxtools .t { display: none; } body[data-studio="box"] .bxtools { gap: 6px 10px; } }
/* vista */
body[data-studio="box"] .stage { background: radial-gradient(ellipse at 50% 30%, #fdfcfa 0%, #eeebe5 62%, #dfdbd3 100%); }
body[data-studio="box"] .stage .pageinfo { top: 10px; font-size: 11.5px; padding: 4px 11px; background: rgba(17,17,17,.62); }
body[data-studio="box"] .stage .ctrlbar { bottom: 12px; background: rgba(17,17,17,.72); backdrop-filter: blur(6px); }
body[data-studio="box"] .stage .ctrlbar button { font-size: 11.5px; padding: 6px 11px; }
.stage:fullscreen { background: radial-gradient(ellipse at 50% 30%, #fdfcfa 0%, #eeebe5 62%, #dfdbd3 100%); }
/* superfici */
body[data-studio="box"] .strip { padding: 8px 14px; }
body[data-studio="box"] .chip { width: 172px; border-radius: 10px; background: #fff; }
body[data-studio="box"] .chip .th { height: 40px; }
/* pannello dei materiali: si apre solo per scegliere (la vista si stringe e il box resta al centro) */
body[data-view="config"][data-studio="box"] aside.side { position: fixed; top: 56px; right: 0; bottom: 0; width: 390px; max-width: 100vw; max-height: none; z-index: 60;
  transform: translateX(102%); visibility: hidden; transition: transform .25s ease, visibility 0s linear .25s; box-shadow: -14px 0 36px rgba(20,18,15,.12); border-left: 1px solid var(--border); border-top: none; }
body[data-view="config"][data-studio="box"].bxpick aside.side { transform: none; visibility: visible; transition: transform .25s ease, visibility 0s; }
body[data-view="config"][data-studio="box"].bxpick main { margin-right: 390px; }
body[data-studio="box"] aside.side .tabs { display: none; }
body[data-studio="box"] .bxdraw-h { display: flex; align-items: center; gap: 8px; padding: 12px 12px 12px 16px; border-bottom: 1px solid var(--border); flex: none; }
.bxdraw-h b { font: 700 15px var(--font-display); letter-spacing: -.01em; flex: 1; }
.bxdraw-h button { width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
@media (max-width: 900px) {
  body[data-view="config"][data-studio="box"].bxpick main { margin-right: 0; }
}
@media (max-width: 720px) {
  body[data-view="config"][data-studio="box"] .app { height: auto; grid-template-rows: 56px auto; }
  body[data-studio="box"] .stage { height: 60vh; flex: none; }
  body[data-studio="box"] .bxtools { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
  body[data-studio="box"] .stage .pageinfo { max-width: calc(100% - 20px); overflow: hidden; text-overflow: ellipsis; display: block; }
  body[data-studio="box"] .stage .pageinfo .eyebtn { display: none; }
  body[data-studio="box"] .stage .ctrlbar { max-width: calc(100% - 16px); overflow-x: auto; scrollbar-width: none; gap: 2px; }
  body[data-studio="box"] .stage .ctrlbar button { padding: 6px 9px; font-size: 11px; }
  body[data-studio="box"] .bxhead { flex-wrap: wrap; padding: 8px 10px; }
  .bxhead .nm { width: 150px; max-width: 46vw; font-size: 15px; }
  .bxhead .who { display: none; }
  .bxhead .lbl2 { display: none; }
  body[data-view="config"][data-studio="box"] aside.side { top: auto; height: 80vh; width: 100%; border-radius: 16px 16px 0 0; transform: translateY(102%); }
}
/* dettaglio del materiale */
.bxdet { position: fixed; inset: 0; z-index: 400; background: #121214; display: flex; flex-direction: column; color: #fff; }
.bxdet .top { display: flex; align-items: center; gap: 12px; padding: 10px 14px 10px 18px; border-bottom: 1px solid rgba(255,255,255,.08); flex: none; }
.bxdet .ttl { flex: 1; min-width: 0; }
.bxdet .ttl b { display: block; font: 700 16px var(--font-display); letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bxdet .ttl small { display: block; color: #a9a9ae; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.bxdet .seg { display: inline-flex; background: rgba(255,255,255,.08); border-radius: 9px; padding: 3px; flex: none; }
.bxdet .seg button { border: none; background: transparent; color: #ccc; font: 650 12.5px var(--font-body); padding: 6px 12px; border-radius: 7px; cursor: pointer; }
.bxdet .seg button.on { background: #fff; color: #111; }
.bxdet .seg button:disabled { opacity: .35; cursor: default; }
.bxdet .cl { width: 36px; height: 36px; border-radius: 50%; border: none; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex: none; }
.bxdet .cl:hover { background: rgba(255,255,255,.18); }
.bxdet .vp { position: relative; flex: 1; overflow: hidden; cursor: grab; touch-action: none; }
.bxdet .vp.drag { cursor: grabbing; }
.bxdet .ct { position: absolute; left: 0; top: 0; transform-origin: 0 0; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.bxdet .ct.anim { transition: transform .22s ease; }
.bxdet .ct img, .bxdet .ct canvas { display: block; max-width: none; user-select: none; -webkit-user-drag: none; }
.bxdet .ct .bx { pointer-events: none; }
.bxdet .ld { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #888; font-size: 13px; }
.bxdet .zb { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 2px; background: rgba(34,34,37,.9); border-radius: 24px; padding: 5px; backdrop-filter: blur(6px); }
.bxdet .zb button { border: none; background: transparent; color: #eee; font: 700 13px var(--font-body); padding: 7px 13px; border-radius: 18px; cursor: pointer; }
.bxdet .zb button:hover { background: rgba(255,255,255,.1); }
.bxdet .zb span { min-width: 52px; text-align: center; font: 700 12px var(--font-body); color: #b9b9be; }
.bxdet .hint { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #8d8d93; white-space: nowrap; pointer-events: none; transition: opacity .4s; }
@media (max-width: 720px) { .bxdet .hint { display: none; } .bxdet .top { flex-wrap: wrap; } }
</style>`);
document.querySelector('aside.side')?.insertAdjacentHTML('afterbegin',
  `<div class="bxdraw-h"><b>Scegli il materiale</b><button onclick="bxDrawer(false)" title="Chiudi (Esc)"><svg class="ic"><use href="#i-x"/></svg></button></div>`);

/* ── elenco ── */
let bxQ = '', bxCl = '';
const bxAll = () => Object.values(comps).filter(c => DISP[c.disp] && DISP[c.disp].mode === 'box' && !c.pack && (c.explicit || c.slots.some(Boolean)));
function renderBoxes() {
  const v = document.getElementById('viewBoxes'), all = bxAll();
  const cls = [...new Set(all.map(c => c.client).filter(id => id && clients[id]))].sort((a, b) => clients[a].name.localeCompare(clients[b].name));
  if (bxCl && bxCl !== '-' && !cls.includes(bxCl)) bxCl = '';
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><h2>Box in posa</h2>
      <input class="search" id="bxQ" placeholder="Cerca box, cliente, materiale…" value="${esc(bxQ)}">
      <select class="tb bx-sel" id="bxCl"><option value="">Tutti i clienti</option><option value="-"${bxCl === '-' ? ' selected' : ''}>Senza cliente</option>
        ${cls.map(id => `<option value="${id}"${bxCl === id ? ' selected' : ''}>${esc(clients[id].name)}</option>`).join('')}</select>
      <button class="btn red" onclick="bxNew()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo box</button></div>
    <div class="bx-intro">La mattonella posata come in negozio: parete di fondo, pavimento e, se vuoi, le pareti laterali.
      Apri un box per sceglierne materiali e posa, guardarlo da ogni lato e avvicinarti al materiale.</div>
    <div class="cgrid bx-grid" id="bxGrid"></div></div>`;
  document.getElementById('bxQ').oninput = e => { bxQ = e.target.value; renderBoxGrid(); };
  document.getElementById('bxCl').onchange = e => { bxCl = e.target.value; renderBoxGrid(); };
  renderBoxGrid();
}
function renderBoxGrid() {
  const q = bxQ.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const txt = c => [c.name, clients[c.client] ? clients[c.client].name : 'senza cliente', ...c.slots.map(k => SAMPLE[k] ? `${SAMPLE[k].s} ${SAMPLE[k].c} ${SAMPLE[k].z}` : '')].join(' ').toLowerCase();
  const list = bxAll().filter(c => (!bxCl || (bxCl === '-' ? !clients[c.client] : c.client === bxCl)) && q.every(w => txt(c).includes(w)))
    .sort((a, b) => (b.upd || 0) - (a.upd || 0));
  document.getElementById('bxGrid').innerHTML = list.map(bxCardHTML).join('') +
    `<div class="card ccard newcard" onclick="bxNew()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo box</div>`;
}
function bxCardHTML(c) {
  const cl = clients[c.client], b = boxOf(c), names = DISP[c.disp].slotNames || [], n = c.slots.filter(k => SAMPLE[k]).length;
  const surf = c.slots.map((k, i) => { const s = SAMPLE[k]; return s ? `<div><i style="${swatchStyle(s)}"></i><span><small>${esc(names[i] || '')}</small> · ${esc(s.s)} ${esc(s.c)} <small>${esc(fmt(s.z))}</small></span></div>` : ''; }).join('');
  return `<div class="card ccard bx-card" onclick="bxOpen('${c.id}')">
    <div class="bx-th">${bxThumb(c)}</div>
    <div class="in"><h3>${esc(c.name)}</h3>
      <div class="sub">${cl ? esc(cl.name) : 'Senza cliente'} · ${b.L}×${b.H} cm · ${n} di ${c.slots.length} superfici</div>
      <div class="bx-surf">${surf || '<div><i></i><span><small>Ancora nessun materiale</small></span></div>'}</div>
      <div class="bx-acts"><button class="btn red" onclick="event.stopPropagation(); bxOpen('${c.id}')">Apri</button>
        <button class="btn" title="Duplica il box" onclick="event.stopPropagation(); bxDup('${c.id}')"><svg class="ic"><use href="#i-copy"/></svg></button>
        <button class="btn" title="Elimina il box" onclick="event.stopPropagation(); bxDel('${c.id}')"><svg class="ic"><use href="#i-trash"/></svg></button></div></div></div>`;
}
/* anteprima: lo stesso box del configuratore, leggero (come in sala mostra), visto dal lato aperto */
function bxThumb(c) {
  if (!c.slots.some(k => SAMPLE[k])) return `<div class="bx-none"><svg class="ic"><use href="#i-boxroom"/></svg> Box ancora vuoto</div>`;
  const was = LITE3D; let m;
  LITE3D = true; try { m = boxModel(DISP[c.disp], c, -1); } finally { LITE3D = was; }
  const W = 290, H = 210, k = Math.min(H * 0.7 / m.H, W * 0.64 / m.fitW), l = !!SAMPLE[c.slots[2]], r = !!SAMPLE[c.slots[3]];
  const yaw = l && r ? 0 : l ? 26 : -26, tilt = l && r ? 9 : 12;
  return `<div class="scene"><div class="bx-mid"><div class="sw-root room-scene" style="transform:translate3d(0,${rn(H * 0.86)}px,0) rotateX(${-tilt}deg) rotateY(${yaw}deg) scale3d(${k.toFixed(4)},${k.toFixed(4)},${k.toFixed(4)})">${m.html}</div></div></div>`;
}
function bxOpen(id) { document.body.classList.remove('bxpick'); openComp(id, '#/box'); }
function bxNew() {
  document.getElementById('bxNewModal')?.remove();
  const cls = Object.values(clients).sort((a, b) => a.name.localeCompare(b.name));
  const m = document.createElement('div'); m.className = 'modal open'; m.id = 'bxNewModal'; m.style.zIndex = 270;
  m.innerHTML = `<div class="mbox" style="width:min(440px,100%)"><div class="mhead"><h3>Nuovo box</h3></div>
    <div class="bxnew"><label>Nome<input id="bxNewName" value="Box ${bxAll().length + 1}"></label>
      <label>Cliente<select id="bxNewCl"><option value="">Nessuno: una proposta libera</option>
        ${cls.map(c => `<option value="${c.id}"${bxCl === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <div class="foot"><button class="btn" id="bxNewNo">Annulla</button><button class="btn red" id="bxNewOk">Crea e apri</button></div></div></div>`;
  document.body.appendChild(m);
  const name = m.querySelector('#bxNewName');
  setTimeout(() => { name.focus(); name.select(); }, 30);
  m.onclick = e => { if (e.target === m) m.remove(); };
  m.querySelector('#bxNewNo').onclick = () => m.remove();
  const ok = () => {
    const prev = ui.client; ui.client = m.querySelector('#bxNewCl').value;
    const c = makeComp(DISP.BOX, name.value.trim() || 'Box'); c.explicit = true;
    ui.client = prev; saveComps(); m.remove(); bxOpen(c.id);
  };
  m.querySelector('#bxNewOk').onclick = ok;
  name.onkeydown = e => { if (e.key === 'Enter') ok(); if (e.key === 'Escape') m.remove(); };
}
function bxDup(id) {
  const c = comps[id], x = JSON.parse(JSON.stringify(c));
  Object.assign(x, { id: uid(), name: c.name + ' (copia)', upd: Date.now(), explicit: true });
  comps[x.id] = x; saveComps(); renderBoxGrid(); toast('Box duplicato');
}
async function bxDel(id) {
  const c = comps[id]; if (!c || !await ask(`Eliminare il box "${c.name}"?`)) return false;
  delete comps[id]; Object.keys(current).forEach(k => { if (current[k] === id) delete current[k]; });
  saveComps(); if (document.body.dataset.view === 'boxes') renderBoxGrid(); toast('Box eliminato');
  return true;
}

/* ── editor del box ── */
/* riga in alto: si costruisce quando si apre un box, poi si aggiornano solo i testi (il nome che scrivi non si perde) */
function renderBoxHead() {
  const h = document.getElementById('bxHead'), c = comp(), cl = clients[ctxClient()], b = boxOf(c), rt = ui.returnTo || '';
  if (h.dataset.cid !== c.id || !h.firstChild) {
    h.dataset.cid = c.id;
    h.innerHTML = `<button class="tb" id="bxBack" onclick="bxClose()"></button>
      <input class="nm" id="bxName" title="Nome del box" oninput="renameComp(this.value)">
      <span class="who" id="bxWho"></span><span class="sp"></span>
      <button class="tb" onclick="bxDrawer(!document.body.classList.contains('bxpick'))" title="Materiali della superficie scelta"><svg class="ic"><use href="#i-tiles"/></svg><span class="lbl2"> Materiali</span></button>
      <button class="tb" onclick="pasteCodes()" title="Incolla i codici: vanno nelle superfici vuote (fondo, pavimento, sinistra, destra)"><svg class="ic"><use href="#i-paste"/></svg><span class="lbl2"> Incolla codici</span></button>
      <button class="tb" onclick="exportSchedaPDF()" title="Scheda PDF del box con i materiali"><svg class="ic"><use href="#i-download"/></svg><span class="lbl2"> Scheda PDF</span></button>
      <button class="tb on" onclick="compPlaceDialog()" title="Metti il box nella sala mostra di un cliente"><svg class="ic"><use href="#i-store"/></svg><span class="lbl2"> Metti in sala mostra</span></button>
      <button class="tb" onclick="bxPresent()" title="Vista a schermo intero"><svg class="ic"><use href="#i-maximize"/></svg></button>
      <button class="tb" onclick="bxMenu(this)" title="Altre azioni"><svg class="ic"><use href="#i-more"/></svg></button>`;
    bxDrawer(!c.slots[selSlot]);                    // box nuovo: si parte scegliendo il materiale della parete di fondo
  }
  const back = rt === '#/box' ? 'Box' : rt.startsWith('#/salamostra/') ? 'Sala mostra' : rt.startsWith('#/ambiente/') ? 'Ambientazione'
    : rt.startsWith('#/pacchetti/') ? 'Pacchetto' : cl ? cl.name : 'Box';
  document.getElementById('bxBack').innerHTML = `<svg class="ic"><use href="#i-left"/></svg>${esc(back)}`;
  const nm = document.getElementById('bxName'); if (document.activeElement !== nm) nm.value = c.name;
  document.getElementById('bxWho').innerHTML = `${cl ? `Cliente <b>${esc(cl.name)}</b>` : 'Senza cliente'} · ${b.L}×${b.H} cm · ${c.slots.filter(k => SAMPLE[k]).length} di ${c.slots.length} superfici`;
}
function bxClose() {
  document.body.classList.remove('bxpick');
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  if (!ui.returnTo && !ctxClient()) ui.returnTo = '#/box';
  leaveConfig();
}
function bxDrawer(open) {
  document.body.classList.toggle('bxpick', !!open);
  if (open && ui.tab !== 'pick') setTab('pick');
}
function bxMenu(btn) {
  document.querySelector('.bxmenu')?.remove();
  const m = document.createElement('div'); m.className = 'bxmenu';
  m.innerHTML = `<button data-a="copy"><svg class="ic"><use href="#i-copy"/></svg> Copia codici per l'ordine</button>
    <button data-a="pack"><svg class="ic"><use href="#i-box"/></svg> Aggiungi a un pacchetto</button>
    <button data-a="dup"><svg class="ic"><use href="#i-copy"/></svg> Duplica il box</button><hr>
    <button data-a="clear"><svg class="ic"><use href="#i-undo"/></svg> Togli tutti i materiali</button>
    <button data-a="del" class="red"><svg class="ic"><use href="#i-trash"/></svg> Elimina il box</button>`;
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  m.style.top = (r.bottom + 6) + 'px'; m.style.left = Math.max(8, Math.min(window.innerWidth - m.offsetWidth - 8, r.right - m.offsetWidth)) + 'px';
  const close = () => { m.remove(); document.removeEventListener('pointerdown', out, true); };
  const out = e => { if (!m.contains(e.target)) close(); };
  setTimeout(() => document.addEventListener('pointerdown', out, true), 0);
  m.onclick = async e => {
    const a = e.target.closest('button')?.dataset.a; if (!a) return; close();
    if (a === 'copy') copyCodes();
    if (a === 'pack') compToPackDialog();
    if (a === 'dup') { dupComp(); document.getElementById('bxHead').dataset.cid = ''; renderToolbar(); toast('Box duplicato: ora stai lavorando sulla copia'); }
    if (a === 'clear') clearComp();
    if (a === 'del' && await bxDel(comp().id)) { ui.returnTo = ui.returnTo || (ctxClient() ? '' : '#/box'); bxClose(); }
  };
}
function bxPresent() {
  const st = document.getElementById('stage');
  if (document.fullscreenElement) return document.exitFullscreen().catch(() => {});
  if (!st.requestFullscreen) return toast('Schermo intero non disponibile su questo dispositivo');
  st.requestFullscreen().catch(() => toast('Schermo intero non disponibile su questo dispositivo'));
}
document.addEventListener('fullscreenchange', () => { if (document.body.dataset.studio === 'box') setTimeout(renderStage, 60); });
/* il pannello dei materiali stringe la vista: il box si ridisegna al centro dello spazio che resta */
(() => {
  const st = document.getElementById('stage'); if (!st || !window.ResizeObserver) return;
  let t, last = '';
  new ResizeObserver(() => {
    if (document.body.dataset.view !== 'config' || document.body.dataset.studio !== 'box') return;
    const k = st.clientWidth + 'x' + st.clientHeight; if (k === last) return; last = k;
    clearTimeout(t); t = setTimeout(renderStage, 60);
  }).observe(st);
})();
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  const det = document.querySelector('.bxdet'); if (det) { det._close(); return; }
  if (document.body.dataset.view === 'config' && document.body.dataset.studio === 'box' && document.body.classList.contains('bxpick') && !document.querySelector('.modal.open')) bxDrawer(false);
});

/* ── dettaglio del materiale: la mattonella (la foto vera, nitida) o la posa della superficie, da ingrandire ── */
function openBoxDetail(i) {
  const d = disp(), c = comp(), s = SAMPLE[c.slots[i]]; if (!s) return;
  const url = hasPhoto(s) ? IMG[photoKey(s)] : null;
  const o = document.createElement('div'); o.className = 'bxdet';
  const info = [slotName(d, i, c.slots.length), s.b, fmt(s.z), s.f.join(', '), s.t.length ? s.t.join('/') + ' mm' : '', s.k.length ? 'cod. ' + s.k.join(', ') : ''].filter(Boolean).join(' · ');
  o.innerHTML = `<div class="top"><div class="ttl"><b>${s.nuovo ? '<span class="nwb">NOVITÀ</span> ' : ''}${esc(s.s)} ${esc(s.c)}</b><small>${esc(info)}</small></div>
      <span class="seg"><button data-m="pezzo"${url ? '' : ' disabled title="Questo campione non ha ancora la foto"'}>La mattonella</button><button data-m="posa">La posa</button></span>
      <button class="cl" title="Chiudi (Esc)"><svg class="ic"><use href="#i-x"/></svg></button></div>
    <div class="vp"><div class="ct"></div><div class="ld">Carico la foto…</div>
      <div class="hint">Rotella o due dita per ingrandire · trascina per spostarti · doppio clic per avvicinarti</div>
      <div class="zb"><button data-z="-" title="Allontana">−</button><span></span><button data-z="+" title="Avvicina">+</button><button data-z="fit" title="Tutta la mattonella">Adatta</button></div></div>`;
  document.body.appendChild(o);
  const vp = o.querySelector('.vp'), ct = o.querySelector('.ct'), ld = o.querySelector('.ld'), lab = o.querySelector('.zb span');
  let nw = 0, nh = 0, fit = 1, sc = 1, tx = 0, ty = 0, sMax = 10, mode = '';
  const vr = () => vp.getBoundingClientRect();
  const apply = anim => { ct.classList.toggle('anim', !!anim); ct.style.transform = `translate(${tx}px,${ty}px) scale(${fit * sc})`; lab.textContent = Math.round(sc * 100) + '%'; };
  const B = 64;                                   // spazio sotto per la barra dello zoom
  const clampPan = () => {
    const r = vr(), w = nw * fit * sc, h = nh * fit * sc;
    tx = w <= r.width ? (r.width - w) / 2 : Math.min(0, Math.max(r.width - w, tx));
    ty = h <= r.height - B ? (r.height - B - h) / 2 + 6 : Math.min(0, Math.max(r.height - h, ty));
  };
  const refit = () => { const r = vr(); if (!nw) return; fit = Math.min(r.width * 0.92 / nw, (r.height - B - 20) / nh); clampPan(); apply(); };
  const zoomAt = (ns, mx, my, anim) => { ns = Math.max(1, Math.min(sMax, ns)); const k = ns / sc; tx = mx - (mx - tx) * k; ty = my - (my - ty) * k; sc = ns; clampPan(); apply(anim); };
  const show = m => {
    mode = m; sc = 1; o.querySelectorAll('.seg button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    if (m === 'pezzo') {
      ct.innerHTML = ''; ct.style.width = ct.style.height = ''; ld.style.display = ''; const img = new Image();
      // il pezzo come è posato nel box (es. 60×120 in verticale): la foto girata se serve e ritagliata a quella forma, senza ingrandirla
      img.onload = () => {
        if (mode !== 'pezzo') return;
        const { tw, th } = boxLay(c, i), turn = photoTurn(photoKey(s), th > tw), A = tw / th;
        const sw = turn ? img.naturalHeight : img.naturalWidth, sh = turn ? img.naturalWidth : img.naturalHeight;
        const cw = Math.round(sw / sh > A ? sh * A : sw), ch = Math.round(sw / sh > A ? sh : sw / A);
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        const g = cv.getContext('2d'); g.translate(cw / 2, ch / 2); if (turn) g.rotate(Math.PI / 2);
        g.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        nw = cw; nh = ch; ld.style.display = 'none'; ct.appendChild(cv); refit(); sMax = Math.max(4, Math.min(14, 5 / fit));
      };
      img.onerror = () => { ld.textContent = 'Foto non disponibile'; };
      img.src = url;
    } else {
      const [W, H] = boxSurf(c, i), [bottom, right] = [[true, false], [false, false], [true, true], [true, false]][i];
      ct.innerHTML = boxSurfaceHTML(c, i, W, H, 'none', bottom, right, false);
      ct.style.width = W + 'px'; ct.style.height = H + 'px';
      nw = W; nh = H; ld.style.display = 'none'; refit(); sMax = 14;
    }
  };
  // rotella: ingrandisce dove c'è il mouse; un dito trascina, due dita ingrandiscono; doppio clic si avvicina (o torna)
  vp.addEventListener('wheel', e => { e.preventDefault(); o.querySelector('.hint').style.opacity = 0; const r = vr(); zoomAt(sc * Math.exp(-e.deltaY * 0.0016), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  const pts = new Map(); let pan = null, pinch = null;
  vp.addEventListener('pointerdown', e => {
    if (e.target.closest('.zb')) return;
    vp.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    o.querySelector('.hint').style.opacity = 0;
    if (pts.size === 1) { pan = { x: e.clientX, y: e.clientY, tx, ty }; vp.classList.add('drag'); }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), sc }; pan = null; }
  });
  vp.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) { const [a, b] = [...pts.values()], r = vr(); zoomAt(pinch.sc * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); }
    else if (pan) { tx = pan.tx + e.clientX - pan.x; ty = pan.ty + e.clientY - pan.y; clampPan(); apply(); }
  });
  const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { pan = null; vp.classList.remove('drag'); } };
  vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
  vp.addEventListener('dblclick', e => { const r = vr(); zoomAt(sc < 2.5 ? sc * 3 : 1, e.clientX - r.left, e.clientY - r.top, true); });
  o.querySelector('.zb').onclick = e => {
    const z = e.target.closest('button')?.dataset.z, r = vr(); if (!z) return;
    if (z === 'fit') { sc = 1; clampPan(); apply(true); } else zoomAt(sc * (z === '+' ? 1.6 : 1 / 1.6), r.width / 2, r.height / 2, true);
  };
  o.querySelectorAll('.seg button').forEach(b => b.onclick = () => { if (!b.disabled && b.dataset.m !== mode) show(b.dataset.m); });
  const onResize = () => refit();
  window.addEventListener('resize', onResize);
  o._close = () => { window.removeEventListener('resize', onResize); o.remove(); };
  o.querySelector('.cl').onclick = o._close;
  show(url ? 'pezzo' : 'posa');
}
