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
/* il piano della scena (trasparente, a metà profondità del box) non deve coprire i tocchi sulla metà dietro: fondo e mobili */
body[data-studio="box"] #scene, body[data-studio="box"] #scene .sw-root { pointer-events: none; }
body[data-studio="box"] #scene .bx { pointer-events: auto; }
/* arredo bagno */
.bxf { cursor: grab; }
.bxf.on > .bx:not(.fp) { box-shadow: inset 0 0 0 .9px rgba(200,16,46,.9); }
.bxtools .fsw { width: 12px; height: 12px; border-radius: 50%; border: 1px solid rgba(0,0,0,.18); flex: none; }
.bxtools input.rg { width: 130px; padding: 0; border: none; background: none; accent-color: var(--red); }
.bxmenu .hd { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--mid); padding: 6px 10px 4px; }
.bxmenu small { margin-left: auto; padding-left: 14px; color: var(--mid); font-weight: 500; font-size: 11.5px; }
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
  const cl = clients[c.client], b = boxOf(c), names = DISP[c.disp].slotNames || [], n = c.slots.filter(k => SAMPLE[k]).length, nf = ((c.box && c.box.furn) || []).length;
  const surf = c.slots.map((k, i) => { const s = SAMPLE[k]; return s ? `<div><i style="${swatchStyle(s)}"></i><span><small>${esc(names[i] || '')}</small> · ${esc(s.s)} ${esc(s.c)} <small>${esc(fmt(s.z))}</small></span></div>` : ''; }).join('');
  return `<div class="card ccard bx-card" onclick="bxOpen('${c.id}')">
    <div class="bx-th">${bxThumb(c)}</div>
    <div class="in"><h3>${esc(c.name)}</h3>
      <div class="sub">${cl ? esc(cl.name) : 'Senza cliente'} · ${b.L}×${b.H} cm · ${n} di ${c.slots.length} superfici${nf ? ` · ${nf} ${nf === 1 ? 'arredo' : 'arredi'}` : ''}</div>
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
      <button class="tb" onclick="bxFurnMenu(this)" title="Arredo bagno: mobile lavabo, vasca, doccia, sanitari"><svg class="ic"><use href="#i-bath"/></svg><span class="lbl2"> Arredi</span></button>
      <button class="tb" onclick="pasteCodes()" title="Incolla i codici: vanno nelle superfici vuote (fondo, pavimento, sinistra, destra)"><svg class="ic"><use href="#i-paste"/></svg><span class="lbl2"> Incolla codici</span></button>
      <button class="tb" onclick="exportSchedaPDF()" title="Scheda PDF del box con i materiali"><svg class="ic"><use href="#i-download"/></svg><span class="lbl2"> Scheda PDF</span></button>
      <button class="tb on" onclick="compPlaceDialog()" title="Metti il box nella sala mostra di un cliente"><svg class="ic"><use href="#i-store"/></svg><span class="lbl2"> Metti in sala mostra</span></button>
      <button class="tb" onclick="bxPresent()" title="Vista a schermo intero"><svg class="ic"><use href="#i-maximize"/></svg></button>
      <button class="tb" onclick="bxMenu(this)" title="Altre azioni"><svg class="ic"><use href="#i-more"/></svg></button>`;
    bxF = null; bxDrawer(!c.slots[selSlot]);        // box nuovo: si parte scegliendo il materiale della parete di fondo
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
/* menu a comparsa sotto un pulsante della riga in alto: act riceve i data- del pulsante scelto */
function bxPop(btn, html, act) {
  document.querySelector('.bxmenu')?.remove();
  const m = document.createElement('div'); m.className = 'bxmenu'; m.innerHTML = html;
  document.body.appendChild(m);
  const r = btn.getBoundingClientRect();
  m.style.top = (r.bottom + 6) + 'px'; m.style.left = Math.max(8, Math.min(window.innerWidth - m.offsetWidth - 8, r.right - m.offsetWidth)) + 'px';
  const close = () => { m.remove(); document.removeEventListener('pointerdown', out, true); };
  const out = e => { if (!m.contains(e.target)) close(); };
  setTimeout(() => document.addEventListener('pointerdown', out, true), 0);
  m.onclick = e => { const b = e.target.closest('button'); if (!b) return; close(); act(b.dataset); };
}
function bxMenu(btn) {
  bxPop(btn, `<button data-a="copy"><svg class="ic"><use href="#i-copy"/></svg> Copia codici per l'ordine</button>
    <button data-a="pack"><svg class="ic"><use href="#i-box"/></svg> Aggiungi a un pacchetto</button>
    <button data-a="dup"><svg class="ic"><use href="#i-copy"/></svg> Duplica il box</button><hr>
    <button data-a="clear"><svg class="ic"><use href="#i-undo"/></svg> Togli tutti i materiali</button>
    <button data-a="del" class="red"><svg class="ic"><use href="#i-trash"/></svg> Elimina il box</button>`, async ({ a }) => {
    if (a === 'copy') copyCodes();
    if (a === 'pack') compToPackDialog();
    if (a === 'dup') { dupComp(); document.getElementById('bxHead').dataset.cid = ''; renderToolbar(); toast('Box duplicato: ora stai lavorando sulla copia'); }
    if (a === 'clear') clearComp();
    if (a === 'del' && await bxDel(comp().id)) { ui.returnTo = ui.returnTo || (ctxClient() ? '' : '#/box'); bxClose(); }
  });
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
  const studio = document.body.dataset.view === 'config' && document.body.dataset.studio === 'box' && !document.querySelector('.modal.open');
  if ((e.key === 'Delete' || e.key === 'Backspace') && studio && bxF && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); bxfDel(); return; }
  if (e.key !== 'Escape') return;
  const det = document.querySelector('.bxdet'); if (det) { det._close(); return; }
  if (studio && bxF) { bxfPick(null); return; }
  if (studio && document.body.classList.contains('bxpick')) bxDrawer(false);
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

/* ── arredo bagno: mobili in 3D, in scala vera (cm), appoggiati a una parete del box (c.box.furn) ──
   Ogni pezzo: { id, t, wall (0 fondo, 2 sinistra, 3 destra), u (centro lungo la parete: da sinistra sul fondo, dal fondo sulle
   laterali), w × d (larghezza lungo la parete × sporgenza), f (finitura), mir (specchio del lavabo), side (lato del vetro della doccia) }.
   Si aggiunge dal pulsante "Arredi", si sceglie toccandolo e si sposta trascinandolo lungo la parete. Anche in sala mostra. */
let bxF = null, bxShowF = (() => { try { return localStorage.getItem('vm_bx_arredi') !== '0'; } catch (e) { return true; } })();
const BXF = {
  // rw / rd: larghezza e profondità libere (da, a) in cm
  lavabo: { n: 'Mobile lavabo', sub: 'sospeso, con specchio', sz: [[60, 46], [80, 46], [100, 46], [120, 46]], rw: [50, 240], fins: ['bianco', 'rovere', 'noce', 'grigio', 'nero'], f: 'rovere', at: 'c' },
  vasca: { n: 'Vasca', sub: 'a parete', sz: [[160, 75], [170, 75], [180, 80]], rw: [140, 200], at: 'l' },
  doccia: { n: 'Doccia', sub: 'piatto e box in vetro', sz: [[90, 90], [120, 80], [140, 90]], rw: [70, 200], rd: [70, 140], fins: ['bianco', 'grigio', 'nero'], f: 'bianco', at: 'r' },
  wc: { n: 'WC sospeso', sub: 'con placca', sz: [[36, 54]], fins: ['bianco', 'nero'], f: 'bianco', at: 'c' },
  bidet: { n: 'Bidet sospeso', sub: 'con miscelatore', sz: [[36, 52]], fins: ['bianco', 'nero'], f: 'bianco', at: 'c' },
  termo: { n: 'Scaldasalviette', sub: 'a parete', sz: [[50, 6]], fins: ['bianco', 'nero', 'cromo'], f: 'bianco', at: 'c' },
};
const BXF_FIN = {
  bianco: ['Bianco', { front: '#f3f1ec', top: '#f9f8f5', side: '#dfdcd5' }],
  rovere: ['Rovere', { front: 'linear-gradient(90deg,#c8a87d,#b8966a 22%,#c9aa80 47%,#b28e62 74%,#c4a378)', top: '#cdae85', side: '#a6845b' }],
  noce: ['Noce', { front: 'linear-gradient(90deg,#7c5b40,#684a33 30%,#80603f 58%,#634630)', top: '#856546', side: '#57402c' }],
  grigio: ['Grigio', { front: '#a3a19b', top: '#b1afa9', side: '#8d8b85' }],
  nero: ['Nero', { front: '#2c2c2e', top: '#3a3a3d', side: '#1f1f21' }],
  cromo: ['Cromo', { front: 'linear-gradient(90deg,#9aa0a5,#eef0f2 45%,#a5aaaf)', top: '#d8dbde', side: '#8e9398' }],
};
const BXF_CER = { front: '#fbfbfa', top: '#ffffff', side: '#e5e4e0' }, BXF_CER_N = { front: '#303032', top: '#3d3d40', side: '#242426' };
const BXF_CHR = { front: 'linear-gradient(90deg,#8f959a,#f1f3f4 50%,#9ba1a6)', top: '#e2e4e6', side: '#8a9095' };
const BXF_MIR = { front: 'linear-gradient(155deg,#dfe7ea 0%,#c9d4d8 36%,#f2f6f7 50%,#c4cfd3 100%)', top: '#c2c8cb', side: '#a9afb2' };
const bxB = (x, y, z, w, h, d, col) => box3d(rn(x), rn(y), rn(z), rn(w), rn(h), rn(d), col);
const bxP = (x, y, z, w, h, css, tf) => `<div class="bx" style="width:${rn(w)}px;height:${rn(h)}px;${css};transform:translate3d(${rn(x)}px,${rn(y)}px,${rn(z)}px)${tf ? ' ' + tf : ''}"></div>`;
/* il box come lo disegna boxModel: centro, filo del pavimento, altezza dei muri */
function bxfFrame(c) {
  const { L, P, H } = boxOf(c), t = BOX_T, has = i => !!SAMPLE[c.slots[i]];
  const x0 = has(2) ? -t : 0, x1 = L + (has(3) ? t : 0), cx = (x0 + x1) / 2, cz = (P - t) / 2;
  return { L, P, WH: H + BOX_BAND, X: x => x - cx, Z: z => z - cz, yF: has(1) ? -1.35 : -0.35 };
}
const bxfLen = (c, wall) => { const { L, P } = boxOf(c); return wall === 0 ? L : P; };
const bxfU = (c, it) => Math.max(it.w / 2, Math.min(bxfLen(c, it.wall) - it.w / 2, it.u));
/* il pezzo si disegna con la schiena sul muro (z = 0 sul muro, z = d il davanti) e poi si porta sulla sua parete */
function bxfTf(c, it, fr) {
  fr = fr || bxfFrame(c); const u = bxfU(c, it), y = rn(fr.yF);
  if (it.wall === 2) return `translate3d(${rn(fr.X(0) + 0.3)}px,${y}px,${rn(fr.Z(u + it.w / 2))}px) rotateY(90deg)`;
  if (it.wall === 3) return `translate3d(${rn(fr.X(fr.L) - 0.3)}px,${y}px,${rn(fr.Z(u - it.w / 2))}px) rotateY(-90deg)`;
  return `translate3d(${rn(fr.X(u - it.w / 2))}px,${y}px,${rn(fr.Z(0) + 0.3)}px)`;
}
/* lati del pezzo (sinistro e destro, guardandolo di fronte) contro un muro del box: lì la doccia non ha il vetro */
function bxfSides(c, it) {
  const { L } = boxOf(c), has = i => !!SAMPLE[c.slots[i]], u = bxfU(c, it), back = u - it.w / 2 <= 1;
  if (it.wall === 2) return [false, back];          // sulla parete sinistra il lato destro è quello verso il fondo
  if (it.wall === 3) return [back, false];
  return [back && has(2), u + it.w / 2 >= L - 1 && has(3)];
}
function bxfParts(it, WH, sd) {
  const { w, d } = it, fin = (BXF_FIN[it.f] || BXF_FIN.bianco)[1], cer = it.f === 'nero' ? BXF_CER_N : BXF_CER;
  if (it.t === 'lavabo') {            // cassettone sospeso, top in ceramica con il lavabo, miscelatore, specchio sopra
    const bw = Math.min(w - 16, 56), mt = Math.min(190, WH - 6), mw = Math.round(w * 0.9);
    return bxB(0.5, -73, d - 1.5, w - 1, 41, d - 2, fin)
      + bxP(1.5, -53, d - 1.45, w - 3, 0.6, 'background:rgba(0,0,0,.32)') + bxP(1.5, -72.6, d - 1.45, w - 3, 1.6, 'background:rgba(0,0,0,.2)')
      + bxB(0, -85, d, w, 12, d, BXF_CER)
      + bxP((w - bw) / 2, -85.05, d - 6, bw, 31, 'background:radial-gradient(ellipse at 50% 45%,#c3c9cc,#dce0e2 55%,#eceeef);border-radius:8px', 'rotateX(-90deg)')
      + bxB(w / 2 - 1.3, -100, 7, 2.6, 15, 2.6, BXF_CHR) + bxB(w / 2 - 1, -100, 16, 2, 2, 9, BXF_CHR)
      + (it.mir !== false && mt - 98 >= 25 ? bxB((w - mw) / 2, -mt, 2.5, mw, mt - 98, 2, BXF_MIR) : '');
  }
  if (it.t === 'vasca') return bxB(0, -56, d, w, 56, d, BXF_CER)
    + bxP(7, -56.05, d - 7, w - 14, d - 14, 'background:linear-gradient(180deg,#cdd2d5,#e4e7e9 55%,#dbdfe1);border-radius:18px', 'rotateX(-90deg)')
    + bxB(w / 2 - 4, -74, 1.6, 8, 8, 1.6, BXF_CHR) + bxB(w / 2 - 1.2, -71, 15, 2.4, 2.4, 13.4, BXF_CHR);
  if (it.t === 'doccia') {           // piatto e box doccia in vetro a misura del piatto: davanti il vetro fisso e la porta scorrevole,
                                     // sui lati il vetro dove non c'è un muro (sd); profili neri, piletta, miscelatore e soffione
    const tray = { grigio: { front: '#a9a7a2', top: '#b9b7b2', side: '#96948f' }, nero: BXF_CER_N }[it.f] || BXF_CER, PR = BXF_FIN.nero[1];
    const gh = Math.min(200, WH - 8), top = -4 - gh, hh = Math.min(205, WH - 14), [wl, wr] = sd || [false, false], m = w / 2, dl = it.side === 'l';
    // vetro: non prende i tocchi, così si tocca quello che c'è dietro
    const GL = 'background:linear-gradient(115deg,rgba(210,230,236,.30),rgba(255,255,255,.10) 42%,rgba(200,222,230,.32));border:1px solid rgba(120,140,148,.5);box-sizing:border-box;pointer-events:none';
    let h = bxB(0, -4, d, w, 4, d, tray)
      + bxP(m - 14, -4.05, 13, 28, 2.6, 'background:linear-gradient(90deg,#8d9398,#c9cdd1,#8d9398)', 'rotateX(-90deg)')
      + bxB(m - 4.5, -112, 2.2, 9, 9, 2.2, BXF_CHR)
      + bxB(m - 1, -hh, 32, 2, 2, 32, BXF_CHR) + bxB(m - 13, -hh + 2, 45, 26, 1.2, 26, BXF_CHR);
    // davanti: metà vetro fisso e metà porta (che scorre un po' più avanti), si sovrappongono di 4 cm; binario sopra, maniglia sulla porta
    h += (dl ? bxP(m - 2, top, d - 1.6, w - 1.2 - (m - 2), gh, GL) + bxP(1.2, top, d - 0.4, m + 2 - 1.2, gh, GL)
             : bxP(1.2, top, d - 1.6, m + 2 - 1.2, gh, GL) + bxP(m - 2, top, d - 0.4, w - 1.2 - (m - 2), gh, GL))
      + bxB(0, top - 1.6, d + 0.4, w, 1.6, 2.8, PR)
      + bxB(dl ? m - 5 : m + 3.8, top + gh * 0.4, d + 1.2, 1.2, 34, 1.4, PR)
      + bxB(0, top, d + 0.4, 1.2, gh, 2.8, PR) + bxB(w - 1.2, top, d + 0.4, 1.2, gh, 2.8, PR);
    // lati senza muro: vetro dal muro al davanti, con il profilo sopra
    if (!wl) h += bxP(0.6, top, d - 1.6, d - 1.6, gh, GL, 'rotateY(90deg)') + bxB(0, top - 1.6, d - 1.6, 1.2, 1.6, d - 1.6, PR);
    if (!wr) h += bxP(w - 0.6, top, d - 1.6, d - 1.6, gh, GL, 'rotateY(90deg)') + bxB(w - 1.2, top - 1.6, d - 1.6, 1.2, 1.6, d - 1.6, PR);
    return h;
  }
  if (it.t === 'wc' || it.t === 'bidet') {
    const h = bxB(0, -40, d, w, 15, d, cer) + bxB(5, -25, d - 8, w - 10, 7, d - 14, cer);
    if (it.t === 'wc') {
      const pt = Math.min(110, WH - 22);
      return h + bxB(0.3, -41.6, d - 0.3, w - 0.6, 1.6, d - 3, it.f === 'nero' ? { front: '#3a3a3d', top: '#454548', side: '#2c2c2e' } : { front: '#fdfdfc', top: '#ffffff', side: '#eceae6' })
        + bxP(w / 2 - 11, -pt, 0.7, 22, 15, `background:${it.f === 'nero' ? '#2c2c2e' : 'linear-gradient(180deg,#fafafa,#e6e6e6)'};box-shadow:inset 0 0 0 1px rgba(0,0,0,.14);border-radius:1.5px`)
        + bxP(w / 2 - 0.3, -pt + 2, 0.75, 0.6, 11, 'background:rgba(120,120,120,.5)');
    }
    return h + bxP(5, -40.05, d - 5, w - 10, d - 18, `background:${it.f === 'nero' ? 'radial-gradient(ellipse at 50% 55%,#1b1b1d,#2a2a2c 70%)' : 'radial-gradient(ellipse at 50% 55%,#c4c9cc,#dce0e2 60%,#eceeef)'};border-radius:10px`, 'rotateX(-90deg)')
      + bxB(w / 2 - 1.2, -48, 7, 2.4, 8, 2.4, BXF_CHR) + bxB(w / 2 - 1, -48, 12, 2, 2, 5, BXF_CHR);
  }
  const th = Math.max(40, Math.min(120, WH - 40)), y0 = -20 - th;     // scaldasalviette: due montanti e i tubi
  let h = bxB(0, y0, 6, 3, th, 3, fin) + bxB(w - 3, y0, 6, 3, th, 3, fin);
  for (let y = y0 + 4; y < -23; y += 9) h += bxB(3, y, 5.5, w - 6, 1.8, 2, fin);
  return h;
}
/* chiamata da boxModel: nel configuratore il pezzo scelto ha i bordi rossi e l'impronta tratteggiata a terra */
function boxFurnHTML(c) {
  const fs = (c.box && c.box.furn) || []; if (!fs.length || (!LITE3D && !bxShowF)) return '';
  const fr = bxfFrame(c);
  return fs.filter(it => BXF[it.t]).map(it => {
    const on = !LITE3D && it.id === bxF;
    const fp = on ? bxP(-1, -0.2, it.d + 1, it.w + 2, it.d + 1, 'border:1.6px dashed rgba(200,16,46,.95);background:rgba(200,16,46,.08);border-radius:3px;box-sizing:border-box', 'rotateX(-90deg)').replace('class="bx"', 'class="bx fp"') : '';
    return `<div class="bx bxf${on ? ' on' : ''}" data-f="${it.id}" style="transform:${bxfTf(c, it, fr)};transform-style:preserve-3d">${bxfParts(it, fr.WH, bxfSides(c, it))}${fp}</div>`;
  }).join('');
}
/* posto libero lungo le pareti (o solo su quella data): angolo per vasca e doccia, centro per gli altri; i mobili delle pareti
   accanto occupano l'angolo con la loro sporgenza */
function bxfPlace(c, it, only) {
  const { L } = boxOf(c), has = i => !!SAMPLE[c.slots[i]], all = ((c.box && c.box.furn) || []).filter(o => o.id !== it.id);
  const walls = only != null ? [only] : [0, 2, 3].filter(w => w === 0 || has(w)), at = BXF[it.t].at;
  for (const wl of walls) {
    const len = bxfLen(c, wl); if (it.w > len) continue;
    const busy = all.filter(o => o.wall === wl).map(o => [bxfU(c, o) - o.w / 2 - 6, bxfU(c, o) + o.w / 2 + 6]);
    if (wl === 0) all.forEach(o => { if (o.wall !== 0 && bxfU(c, o) - o.w / 2 < it.d) busy.push(o.wall === 2 ? [-1, o.d + 4] : [L - o.d - 4, L + 1]); });
    else all.forEach(o => { if (o.wall === 0 && (wl === 2 ? bxfU(c, o) - o.w / 2 < it.d : bxfU(c, o) + o.w / 2 > L - it.d)) busy.push([-1, o.d + 4]); });
    const key = u => at === 'c' ? Math.abs(u - len / 2) : wl !== 0 || at === 'l' ? u : -u;
    const cands = [len / 2, len - it.w / 2]; for (let u = it.w / 2; u <= len - it.w / 2; u += 5) cands.push(u);
    const u = cands.sort((a, b) => key(a) - key(b)).find(u => busy.every(([a, b]) => u + it.w / 2 <= a || u - it.w / 2 >= b));
    if (u != null) { it.wall = wl; it.u = u; return true; }
  }
  if (only != null) { it.wall = only; it.u = bxfU(c, it); } else { it.wall = 0; it.u = L / 2; }
  return false;
}
/* i pezzi del box di adesso, copiati prima di cambiarli (un box duplicato non deve cambiare con questo) */
function bxfMine(c) { c.box = Object.assign({}, c.box); c.box.furn = ((c.box.furn) || []).map(o => Object.assign({}, o)); return c.box.furn; }
const bxfCur = c => ((c.box && c.box.furn) || []).find(o => o.id === bxF);
const bxfNewId = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
function bxfShow(on) { bxShowF = on; try { localStorage.setItem('vm_bx_arredi', on ? '1' : '0'); } catch (e) {} if (!on) bxF = null; renderStage(); }
function bxfPick(id) { bxF = id; if (id) document.body.classList.remove('bxpick'); renderStage(); }
function bxfAdd(t) {
  const c = comp(), T = BXF[t], [w, d] = T.sz[Math.min(1, T.sz.length - 1)];
  const it = { id: bxfNewId(), t, w, d, wall: 0, u: 0 }; if (T.f) it.f = T.f; if (t === 'doccia') it.side = 'r';
  const ok = bxfPlace(c, it); bxfMine(c).push(it);
  bxF = it.id; bxShowF = true; try { localStorage.setItem('vm_bx_arredi', '1'); } catch (e) {}
  document.body.classList.remove('bxpick'); touch(); renderStage();
  toast(ok ? `${T.n}: trascinalo per spostarlo lungo la parete` : `${T.n}: non c'era più spazio libero, l'ho messo al centro della parete di fondo`);
}
function bxfSet(k, v) {
  const c = comp(), it = bxfMine(c).find(o => o.id === bxF); if (!it) return;
  const len = bxfLen(c, it.wall), u0 = bxfU(c, it), atA = u0 - it.w / 2 <= 1, atB = u0 + it.w / 2 >= len - 1;   // era in un angolo?
  if (k === 'sz') { const [w, d] = v.split('x').map(Number); it.w = w; it.d = d; }
  else if (k === 'wall') { if (v !== it.wall && !bxfPlace(c, it, v)) toast('Su quella parete non c\'è un posto libero: spostalo tu dove vuoi'); }
  else if (k === 'w' || k === 'd') {           // misura libera: dentro i limiti del pezzo e della parete
    const [mn, mx] = BXF[it.t]['r' + k], lim = k === 'w' ? Math.min(mx, bxfLen(c, it.wall)) : mx, n = Math.round(+v) || it[k];
    it[k] = Math.max(mn, Math.min(lim, n)); if (it[k] !== n) toast(`${k === 'w' ? 'Larghezza' : 'Profondità'} possibile: da ${mn} a ${lim} cm`);
  }
  else if (k === 'u') it.u = +v;
  else it[k] = v;
  if (k === 'sz' || k === 'w') it.u = atA ? it.w / 2 : atB ? len - it.w / 2 : it.u;   // cambiando la larghezza resta nel suo angolo
  it.u = Math.round(bxfU(c, it)); touch(); renderStage();
}
/* cursore della posizione: il mobile si sposta subito, si salva quando lo lasci */
function bxfSlide(v) {
  const c = comp(), it = bxfCur(c); if (!it) return;
  const el = document.querySelector(`#m3d [data-f="${it.id}"]`); if (el) el.style.transform = bxfTf(c, Object.assign({}, it, { u: +v }));
}
function bxfDel() { const c = comp(); c.box = Object.assign({}, c.box, { furn: ((c.box && c.box.furn) || []).filter(o => o.id !== bxF) }); bxF = null; touch(); renderStage(); }
function bxfDup() {
  const c = comp(), o = bxfCur(c); if (!o) return;
  const it = Object.assign({}, o, { id: bxfNewId() });
  if (!bxfPlace(c, it, o.wall) && !bxfPlace(c, it)) toast('Non c\'era più spazio libero: spostalo dove vuoi');
  bxfMine(c).push(it); bxF = it.id; touch(); renderStage();
}
function bxFurnMenu(btn) {
  const n = ((comp().box || {}).furn || []).length;
  bxPop(btn, `<div class="hd">Arredo bagno</div>` + Object.entries(BXF).map(([t, T]) => `<button data-t="${t}"><svg class="ic"><use href="#i-plus"/></svg> ${T.n}<small>${T.sub}</small></button>`).join('')
    + (n ? `<hr><button data-a="show"><svg class="ic"><use href="#i-${bxShowF ? 'x' : 'check'}"/></svg> ${bxShowF ? 'Nascondi gli arredi' : 'Mostra gli arredi'}<small>per vedere la posa</small></button>
      <button data-a="clear" class="red"><svg class="ic"><use href="#i-trash"/></svg> Togli tutti gli arredi</button>` : ''), async ({ t, a }) => {
    if (t) bxfAdd(t);
    if (a === 'show') bxfShow(!bxShowF);
    if (a === 'clear' && await ask('Togliere tutti gli arredi da questo box?')) { const c = comp(); c.box = Object.assign({}, c.box, { furn: [] }); bxF = null; touch(); renderStage(); }
  });
}
/* striscia sottile del pezzo scelto (al posto di misure e posa): misura, parete, posizione, finitura */
function bxFurnBar(c, host) {
  const it = bxShowF && bxfCur(c); if (!it || !BXF[it.t]) { bxF = null; return false; }
  const T = BXF[it.t], has = i => !!SAMPLE[c.slots[i]], len = bxfLen(c, it.wall);
  const seg = items => `<span class="seg">${items.map(([txt, on, fn, tip, dis]) => `<button class="${on ? 'on' : ''}"${tip ? ` title="${esc(tip)}"` : ''}${dis ? ' disabled' : ''} onclick="${fn}">${txt}</button>`).join('')}</span>`;
  const walls = [[0, 'Fondo'], [2, 'Sinistra'], [3, 'Destra']].filter(([w]) => w === 0 || has(w) || it.wall === w);
  // misura: scritta a mano (larghezza, e profondità per la doccia) o una di quelle pronte
  const num = (k, lab, tip) => `<label title="${tip}">${lab}<input type="number" step="1" min="${T['r' + k][0]}" max="${T['r' + k][1]}" value="${it[k]}" onchange="bxfSet('${k}', this.value)"></label>`;
  host.innerHTML = `<span class="g"><span class="l"><b>${esc(T.n)}</b></span>${T.rw
      ? num('w', 'L', 'Larghezza in cm (scrivila tu)') + (T.rd ? `<span class="x">×</span>${num('d', 'P', 'Profondità in cm (scrivila tu)')}` : '') + ' cm'
        + seg(T.sz.map(([w, d]) => [it.t === 'doccia' ? `${w}×${d}` : `${w}`, it.w === w && it.d === d, `bxfSet('sz','${w}x${d}')`, `${w}×${d} cm`]))
      : `<span class="em">${it.w}×${it.d} cm</span>`}</span>
    <span class="sep"></span>
    <span class="g"><span class="l t">Parete</span>${seg(walls.map(([w, n]) => [n, it.wall === w, `bxfSet('wall',${w})`, w === 0 ? 'Parete di fondo' : 'Parete ' + n.toLowerCase(), it.w > bxfLen(c, w)]))}</span>
    <span class="g"><span class="l t">Posizione</span><input type="range" class="rg" min="${it.w / 2}" max="${Math.max(it.w / 2, len - it.w / 2)}" step="1" value="${bxfU(c, it)}" oninput="bxfSlide(this.value)" onchange="bxfSet('u', this.value)" title="Sposta lungo la parete (o trascina il mobile)"></span>
    ${T.fins ? `<span class="sep"></span><span class="g"><span class="l t">Finitura</span>${seg(T.fins.map(f => [`<i class="fsw" style="background:${BXF_FIN[f][1].front}"></i><span class="t">${BXF_FIN[f][0]}</span>`, it.f === f, `bxfSet('f','${f}')`, BXF_FIN[f][0]]))}</span>` : ''}
    ${it.t === 'lavabo' ? seg([['Con specchio', it.mir !== false, `bxfSet('mir',true)`, 'Specchio sopra il lavabo'], ['Senza', it.mir === false, `bxfSet('mir',false)`, 'Niente specchio: si vede tutta la posa']]) : ''}
    ${it.t === 'doccia' ? seg([['Porta a sinistra', it.side === 'l', `bxfSet('side','l')`, 'Porta scorrevole a sinistra'], ['a destra', it.side !== 'l', `bxfSet('side','r')`, 'Porta scorrevole a destra']]) : ''}
    <span class="sp"></span>
    <button class="bt" onclick="bxfDup()" title="Un altro uguale"><svg class="ic"><use href="#i-copy"/></svg><span class="t"> Duplica</span></button>
    <button class="bt" onclick="bxfDel()" title="Togli questo arredo (Canc)"><svg class="ic"><use href="#i-trash"/></svg><span class="t"> Togli</span></button>
    <button class="bt dk" onclick="bxfPick(null)" title="Torna alle superfici (Esc)"><svg class="ic"><use href="#i-check"/></svg> Fatto</button>`;
  const inf = document.querySelector('#stage .pageinfo');
  if (inf) inf.textContent = `${T.n} ${it.t === 'doccia' ? it.w + '×' + it.d : it.w} cm — trascinalo per spostarlo lungo la parete`;
  return true;
}
/* tocco su un mobile: lo sceglie; trascinandolo scorre lungo la sua parete (la direzione si misura sullo schermo, con la telecamera di adesso) */
(() => {
  const st = document.getElementById('stage'); if (!st) return;
  let dr = null;
  st.addEventListener('pointerdown', e => {
    const el = e.target.closest('.bxf'); if (!el || e.button > 0 || document.body.dataset.studio !== 'box') return;
    const c = comp(), it = ((c.box && c.box.furn) || []).find(o => o.id === el.dataset.f); if (!it) return;
    const u0 = bxfU(c, it), s = u0 + 10 <= bxfLen(c, it.wall) - it.w / 2 ? 10 : -10, t0 = el.style.transform, p0 = el.getBoundingClientRect();
    el.style.transform = bxfTf(c, Object.assign({}, it, { u: u0 + s })); const p1 = el.getBoundingClientRect(); el.style.transform = t0;
    let ax = (p1.left - p0.left) / s, ay = (p1.top - p0.top) / s;
    const k = +((document.getElementById('m3d') || {}).style.transform.match(/scale3d\(([\d.]+)/) || [0, 1])[1], mn = 0.35 * k, ln = Math.hypot(ax, ay);
    if (ln < mn) { if (ln < 1e-3) { ax = mn; ay = 0; } else { ax *= mn / ln; ay *= mn / ln; } }   // parete vista di taglio: si trascina comunque
    dr = { el, id: it.id, x: e.clientX, y: e.clientY, u0, ax, ay, moved: false };
  });
  st.addEventListener('pointermove', e => {
    if (!dr) return;
    const dx = e.clientX - dr.x, dy = e.clientY - dr.y;
    if (!dr.moved) { if (Math.hypot(dx, dy) < 4) return; dr.moved = true; window._dragMoved = true; bxfMine(comp()); try { st.setPointerCapture(e.pointerId); } catch (er) {} }
    const c = comp(), it = c.box.furn.find(o => o.id === dr.id); if (!it) return;
    it.u = bxfU(c, Object.assign({}, it, { u: dr.u0 + (dx * dr.ax + dy * dr.ay) / (dr.ax * dr.ax + dr.ay * dr.ay) }));
    dr.el.style.transform = bxfTf(c, it);
    const rg = document.querySelector('#bxTools .rg'); if (rg && bxF === dr.id) rg.value = it.u;
  });
  const end = () => {
    if (!dr) return; const d = dr; dr = null;
    if (d.moved) { const it = (comp().box.furn || []).find(o => o.id === d.id); if (it) it.u = Math.round(it.u); touch(); setTimeout(() => { window._dragMoved = false; }, 0); }
    bxF = d.id; document.body.classList.remove('bxpick'); renderStage();
  };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
})();
