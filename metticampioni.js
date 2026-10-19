'use strict';
/* ════════════════════════════════════════════════════════════
   METTI CAMPIONI (sezione Espositori): scegli l'espositore, poi la serie, poi i colori a quadratini e "Inserisci".
   Sui quadratini:  • puntino verde in alto a destra = il cliente ha già quel colore (in qualsiasi espositore e formato)
                    • lineette sotto il puntino = superficie: 3 per R11 / Tecnica; sui marmi (di solito lappati, lucidi)
                      1 lineetta quando sono opachi (Silktech, R9, R10). R10 normale e marmi lappati: niente.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
#mcDlg .mbox { width: min(1180px, calc(100vw - 24px)); max-width: none; height: min(860px, calc(100vh - 24px)); display: flex; flex-direction: column; }
.mc-top { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.mc-top h3 { margin: 0; font: 700 17px var(--font-display); letter-spacing: -.02em; flex: 1; min-width: 180px; display: flex; align-items: center; gap: 8px; }
.mc-top label { font-size: 11px; font-weight: 700; color: var(--mid); display: flex; flex-direction: column; gap: 3px; }
.mc-top select { padding: 7px 9px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 13px; background: #fff; max-width: 260px; }
.mc-body { flex: 1; min-height: 0; display: grid; grid-template-columns: 290px minmax(0, 1fr); }
.mc-side { border-right: 1px solid var(--border); display: flex; flex-direction: column; min-height: 0; background: #fff; }
.mc-side input { margin: 10px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 13px; }
.mc-ser { overflow-y: auto; flex: 1; padding-bottom: 12px; }
.mc-ser button { display: flex; align-items: baseline; gap: 8px; width: 100%; border: 0; border-left: 3px solid transparent; background: none; text-align: left; font: inherit; padding: 8px 12px; cursor: pointer; }
.mc-ser button:hover { background: #f8f7f4; }
.mc-ser button.on { background: #f4f1ec; border-left-color: var(--red); }
.mc-ser .n { flex: 1; font: 600 13.5px var(--font-display); }
.mc-ser .n small { display: block; font: 500 11px var(--font-body); color: var(--mid); }
.mc-ser .k { font-size: 11.5px; color: #555; white-space: nowrap; }
.mc-ser .k i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #2f9e57; margin-right: 3px; }
.mc-main { overflow-y: auto; padding: 14px 18px 30px; min-height: 0; background: #fbfaf8; }
/* gruppi uno dopo l'altro, separati da una righina verticale con il nome sopra: si va a capo solo a riga piena */
.mc-grps { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 14px 0; margin-top: 12px; }
.mc-grp { display: flex; flex-direction: column; padding: 0 12px; border-left: 1.5px solid #ddd8cf; max-width: 100%; }
.mc-grp:first-child { padding-left: 0; border-left: 0; }
.mc-main h4 { margin: 0 0 6px; font: 700 11.5px var(--font-body); display: flex; gap: 6px; align-items: center; white-space: nowrap; text-transform: uppercase; letter-spacing: .06em; color: #444; }
.mc-main h4 span { font-weight: 500; color: var(--mid); }
.mc-sws { display: flex; flex-wrap: wrap; gap: 8px; }
.mc-sw { position: relative; width: 98px; border-radius: 10px; background: #fff; border: 1px solid #ece9e2; padding: 5px 5px 6px; font-size: 11px; line-height: 1.2; cursor: pointer; text-align: left; }
.mc-sw .im { display: block; aspect-ratio: 1; border-radius: 7px; background: #ddd center/cover; margin-bottom: 5px; }
.mc-sw b { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 11.5px; font-weight: 600; }
.mc-sw small { display: block; color: #8d887f; font-size: 10px; margin-top: 1px; }
.mc-sw .im { position: relative; overflow: hidden; }
.mc-sw .has { position: absolute; bottom: 6px; right: 6px; width: 13px; height: 13px; border-radius: 50%; background: #2f9e57; box-shadow: 0 0 0 2px #fff, 0 1px 4px rgba(0,0,0,.35); }
.mc-sw .ln { position: absolute; top: 0; right: 0; width: 46%; aspect-ratio: 1; pointer-events: none; }
.mc-sw .ln svg { width: 100%; height: 100%; display: block; }
.mc-sw .ln line { stroke: #e0202b; stroke-width: 2.4; stroke-linecap: round; }
.mc-sw.sel { border-color: var(--red); box-shadow: 0 0 0 2px var(--red); }
.mc-sw.sel::after { content: ''; position: absolute; left: 10px; top: 10px; width: 20px; height: 20px; border-radius: 50%; background: var(--red) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E") center/13px no-repeat; }
.mc-sw.in { opacity: .45; cursor: default; }
.mc-sw.in small.inn { color: var(--red); font-weight: 700; }
.mc-foot { display: flex; gap: 10px; align-items: center; padding: 10px 16px; border-top: 1px solid var(--border); flex-wrap: wrap; background: #fff; }
.mc-foot .lg { flex: 1; display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--mid); align-items: center; }
.mc-foot .lg span { display: inline-flex; gap: 5px; align-items: center; }
.mc-foot .lg i.d { width: 9px; height: 9px; border-radius: 50%; background: #2f9e57; display: inline-block; }
.mc-foot .lg i.l { display: inline-block; width: 18px; height: 18px; }
.mc-foot .lg i.l svg { width: 18px; height: 18px; display: block; }
.mc-foot .lg i.l line { stroke: #e0202b; stroke-width: 2.4; stroke-linecap: round; }
.mc-empty { color: var(--mid); padding: 40px 10px; text-align: center; }
.mc-pickw { position: relative; align-self: flex-end; }
.mc-pickw > .btn { white-space: nowrap; }
.mc-pickw > .btn.on { background: var(--red); border-color: var(--red); color: #fff; }
.mc-pick { position: absolute; top: calc(100% + 6px); left: 0; z-index: 30; width: 340px; max-height: 60vh; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 18px 50px rgba(0,0,0,.22); }
.mc-pick .pt { display: flex; gap: 6px; flex-wrap: wrap; padding: 10px 10px 6px; }
.mc-pick .pt .btn { padding: 5px 9px; font-size: 11.5px; }
.mc-pick input[type=search] { margin: 0 10px 6px; padding: 7px 9px; border: 1px solid var(--border); border-radius: 9px; font: inherit; font-size: 13px; }
.mc-pick .pl { overflow-y: auto; padding: 0 6px 8px; }
.mc-pick label { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 8px; cursor: pointer; font-size: 13px; flex-direction: row; color: inherit; font-weight: 500; }
.mc-pick label:hover { background: #f6f4f0; }
.mc-pick label span { flex: 1; }
.mc-pick label small { color: var(--mid); font-size: 11px; }
.mc-cnt { display: flex; gap: 6px; flex-wrap: wrap; }
.mc-cnt span { background: #f3f1ec; border-radius: 999px; padding: 5px 10px; font-size: 12px; color: #444; white-space: nowrap; }
.mc-cnt span b { color: #1d1d20; }
.mc-cnt span.hl { background: #fdecee; color: #8e1016; }
.mc-ser .k .in { color: var(--red); font-weight: 700; margin-left: 4px; }
@media (max-width: 760px) {
  .mc-body { grid-template-columns: 1fr; grid-template-rows: 34% 1fr; }
  .mc-side { border-right: 0; border-bottom: 1px solid var(--border); }
  .mc-sw { width: calc((100vw - 24px - 36px - 24px) / 4); }
  .mc-grp { padding: 0 8px; }
}
</style>`);

let mc = null;   // { compId, client, series, sel: Set(keys), q }
/* lineette diagonali nell'angolo (3 = R11 / Tecnica, 1 = marmo opaco) */
const mcLinesSVG = n => `<svg viewBox="0 0 46 46">${(n === 3 ? [14, 22, 30] : [22]).map(x => `<line x1="${x}" y1="-1" x2="47" y2="${47 - x}"/>`).join('')}</svg>`;
const mcIsMarble = s => /MARMO|MARBLE|ONYX/i.test(s.s);
/* lineette: 3 = R11 / Tecnica; 1 = marmo non lappato (Silktech, R9, R10); 0 = niente */
function mcLines(s) {
  const fs = s.a4 ? [s.f[0]] : (s.f || []);
  const lv = fs.map(f => /\bR11\b|Tecnica/i.test(f) ? 3 : mcIsMarble(s) && !/lappat|lucid|lux/i.test(f) ? 1 : 0);
  if (!lv.length) return 0;
  return lv.every(x => x === lv[0]) ? lv[0] : 0;   // più finiture diverse nello stesso campione: niente segno
}
/* colori che il cliente ha già: marca|serie|grafica|colore, in tutti i suoi espositori e formati */
function mcOwned(cid) {
  const set = new Set(); if (!cid) return set;
  // negli ALTRI espositori del cliente (quello che sto riempiendo non conta: lì si vede "già in questo espositore")
  Object.values(comps).filter(c => c.client === cid && (!mc || c.id !== mc.compId)).forEach(c => c.slots.forEach(k => { const s = k && SAMPLE[k]; if (s) set.add(s.b + '|' + s.s + '|' + glCid(s)); }));
  return set;
}
const mcOwnKey = s => s.b + '|' + s.s + '|' + glCid(s);

function openMettiCampioni() {
  const c = comp(); if (!c) return;
  mc = { compId: c.id, client: c.client || ui.mcClient || '', series: null, sel: new Set(), q: '', added: 0, pickOpen: false, pq: '' };
  let m = document.getElementById('mcDlg'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="mcDlg"><div class="mbox"><div id="mcIn" style="display:flex;flex-direction:column;height:100%"></div></div></div>`);
  m = document.getElementById('mcDlg'); m.addEventListener('click', e => { if (e.target === m) mcClose(); });
  // tendina delle serie: si chiude anche toccando fuori
  m.addEventListener('pointerdown', e => { if (mc && mc.pickOpen && !e.target.closest('.mc-pickw')) { mc.pickOpen = false; mcRender(); } });
  mcRender(true);
}
function mcClose() { const m = document.getElementById('mcDlg'); if (m) m.remove(); renderAll(); renderList(); }
function mcTarget() { return comps[mc.compId]; }
function mcList() { const c = mcTarget(); return c ? compatibleFor(c) : []; }
function mcSeriesList() {
  const own = mcOwned(mc.client), map = new Map();
  mcList().forEach(s => {
    const k = s.b + '|' + s.s, e = map.get(k) || { b: s.b, s: s.s, n: new Set(), has: new Set() };
    e.n.add(mcOwnKey(s)); if (own.has(mcOwnKey(s))) e.has.add(mcOwnKey(s)); map.set(k, e);
  });
  return [...map.values()].sort((a, b) => (b.has.size ? 1 : 0) - (a.has.size ? 1 : 0) || a.b.localeCompare(b.b) || a.s.localeCompare(b.s));
}
function mcRender(full) {
  const box = document.getElementById('mcIn'); if (!box) return;
  const c = mcTarget(), d = DISP[c.disp];
  const ctx = c.client || '', choices = Object.values(comps).filter(x => (x.client || '') === ctx && DISP[x.disp] && !x.pack === !c.pack && (x.explicit || x.slots.some(Boolean) || x.id === c.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  const free = c.slots.filter(k => !k).length;
  if (full) {
    box.innerHTML = `<div class="mc-top"><h3><svg class="ic"><use href="#i-grid"/></svg> Metti campioni</h3>
        <label>Espositore<select id="mcComp">${choices.map(x => `<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${esc(x.name)} · ${esc(DISP[x.disp].name)}</option>`).join('')}</select></label>
        <div class="mc-pickw"><button class="btn" id="mcPickBtn" onclick="mc.pickOpen = !mc.pickOpen; mcRender()"></button><div class="mc-pick" id="mcPick" hidden></div></div>
        <label>Confronta con il cliente<select id="mcCl" ${c.client ? 'disabled' : ''}><option value="">— nessuno —</option>${Object.values(clients).sort((a, b) => a.name.localeCompare(b.name)).map(x => `<option value="${x.id}" ${x.id === mc.client ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <button class="btn" onclick="mcClose()"><svg class="ic"><use href="#i-x"/></svg></button></div>
      <div class="mc-body"><aside class="mc-side"><input id="mcQ" placeholder="Cerca serie…" value="${esc(mc.q)}"><div class="mc-ser" id="mcSer"></div></aside>
        <main class="mc-main" id="mcMain"></main></div>
      <div class="mc-foot"><div class="lg"><span><i class="d"></i> il cliente ce l'ha già (in altri espositori)</span><span><i class="l">${mcLinesSVG(3)}</i> R11 / Tecnica</span><span><i class="l">${mcLinesSVG(1)}</i> marmo opaco (Silktech, R9, R10)</span><span id="mcFree"></span></div>
        <button class="btn" onclick="mc.sel.clear(); mcRender()">Deseleziona</button>
        <button class="btn red" id="mcGo" onclick="mcInsert()"></button></div>`;
    document.getElementById('mcComp').onchange = e => { mc.compId = e.target.value; mc.sel.clear(); mc.series = null; if (comps[mc.compId].client) mc.client = comps[mc.compId].client; mcRender(true); };
    document.getElementById('mcCl').onchange = e => { mc.client = e.target.value; ui.mcClient = mc.client; saveUI(); mcRender(); };
    document.getElementById('mcQ').addEventListener('input', e => { mc.q = e.target.value; mcRender(); });
  }
  // serie
  const picked = mcPicked(), allSers = mcSeriesList();
  const q = normTxt(mc.q).trim(), sers = allSers.filter(x => (!picked.size || picked.has(x.b + '|' + x.s)) && (!q || normTxt(x.s + ' ' + x.b).includes(q)));
  const inBySer = {}; c.slots.forEach(k => { const x = k && SAMPLE[k]; if (x) inBySer[x.b + '|' + x.s] = (inBySer[x.b + '|' + x.s] || 0) + 1; });
  // tendina "Serie da campionare"
  const pb = document.getElementById('mcPickBtn');
  pb.className = 'btn' + (picked.size ? ' on' : '');
  pb.innerHTML = `<svg class="ic"><use href="#i-select"/></svg> Serie da campionare${picked.size ? ` (${picked.size})` : ''} <svg class="ic"><use href="#i-cdown"/></svg>`;
  const pk = document.getElementById('mcPick'), oldPl = pk.querySelector('.pl'), keepTop = oldPl ? oldPl.scrollTop : 0;
  pk.hidden = !mc.pickOpen; pk.style.display = mc.pickOpen ? '' : 'none';   // (lo stile flex vince su hidden)
  if (mc.pickOpen) {
    const pq = normTxt(mc.pq).trim();
    pk.innerHTML = `<div class="pt"><button class="btn" onclick="mcPickSet('own')">Quelle che ha il cliente</button><button class="btn" onclick="mcPickSet('all')">Tutte</button><button class="btn" onclick="mcPickSet('none')">Nessuna</button><button class="btn dark" onclick="mc.pickOpen = false; mcRender()">Fatto</button></div>
      <input type="search" id="mcPq" placeholder="Cerca…" value="${esc(mc.pq)}">
      <div class="pl">${allSers.filter(x => !pq || normTxt(x.s + ' ' + x.b).includes(pq)).map(x => `<label><input type="checkbox" ${picked.has(x.b + '|' + x.s) ? 'checked' : ''} data-k="${esc(x.b + '|' + x.s)}" onchange="mcPickToggle(this.dataset.k)">
        <span>${esc(glTitle(x.s))} <small>${esc(x.b)}</small></span><small>${x.has.size ? '● ' + x.has.size + '/' : ''}${x.n.size}</small></label>`).join('')}</div>`;
    pk.querySelector('.pl').scrollTop = keepTop;   // resta dove sei, non torna in cima
    const pin = document.getElementById('mcPq');
    pin.addEventListener('input', e => { mc.pq = e.target.value; const pos = e.target.selectionStart; mcRender(); const n = document.getElementById('mcPq'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } });
  }
  if (!mc.series || !sers.some(x => x.b + '|' + x.s === mc.series)) mc.series = sers[0] ? sers[0].b + '|' + sers[0].s : null;
  const serEl = document.getElementById('mcSer'), serTop = serEl.scrollTop;
  serEl.innerHTML = sers.map(x => `<button class="${mc.series === x.b + '|' + x.s ? 'on' : ''}" data-k="${esc(x.b + '|' + x.s)}" onclick="mc.series = this.dataset.k; mcRender(); document.getElementById('mcMain').scrollTop = 0">
      <span class="n">${esc(glTitle(x.s))}<small>${esc(x.b)}</small></span><span class="k">${x.has.size ? `<i></i>${x.has.size}/` : ''}${x.n.size}${inBySer[x.b + '|' + x.s] ? `<span class="in" title="già in questo espositore">▣ ${inBySer[x.b + '|' + x.s]}</span>` : ''}</span></button>`).join('') || '<div class="mc-empty">Nessuna serie.</div>';
  serEl.scrollTop = serTop;
  // colori della serie, per tipo
  const main = document.getElementById('mcMain'), mainTop = main.scrollTop;
  if (!mc.series) main.innerHTML = '<div class="mc-empty">Questo espositore non accetta campioni.</div>';
  else {
    const [b, s] = mc.series.split('|'), own = mcOwned(mc.client), inComp = new Set(c.slots.filter(Boolean));
    const list = mcList().filter(x => x.b === b && x.s === s);
    main.innerHTML = `<div style="display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap"><div style="flex:1"><div style="font:700 10.5px var(--font-body);letter-spacing:.14em;text-transform:uppercase;color:#b0101a">${esc(b)}</div>
        <div style="font:700 24px var(--font-display);letter-spacing:-.03em">${esc(glTitle(s))}</div></div>
        <button class="btn" onclick="mcSelAll()">Seleziona tutti quelli che non ha</button></div>` +
      '<div class="mc-grps">' + mcGroups(list).map(gr => `<div class="mc-grp"><h4>${esc(glTitle(gr.name))} <span>${gr.items.length}</span></h4><div class="mc-sws">${gr.items.map(x => {
        const u = IMG[photoKey(x)], mi = u && ((window.FOTO_MINI || {})[u] || u), ln = mcLines(x), isIn = inComp.has(x.key);
        const gw = x.g ? x.g.toLowerCase().split(' ') : [], nm = gr.tint && gr.tint[x.c] ? gr.tint[x.c] : gw.length ? (x.c.split(' ').filter(w => !gw.includes(w.toLowerCase())).join(' ') || x.c) : x.c;   // nelle grafiche il nome senza la grafica
        const sub = x.a4 ? x.v : (x.toz ? 'tozzetto' : fmt(x.z)) + (x.f.length ? ' · ' + x.f.join(', ').replace(/\s*Rett\.?/g, '') : '');
        return `<button class="mc-sw${mc.sel.has(x.key) ? ' sel' : ''}${isIn ? ' in' : ''}" data-k="${esc(x.key)}" ${isIn ? 'disabled' : `onclick="mcToggle(this.dataset.k)"`} title="${esc(x.c + ' · ' + sub)}">
          <span class="im" style="${mi ? `background-image:url('${esc(mi)}')` : ''}">${ln ? `<span class="ln" title="${ln === 3 ? 'R11 / Tecnica' : 'marmo opaco'}">${mcLinesSVG(ln)}</span>` : ''}${own.has(mcOwnKey(x)) ? '<span class="has" title="Il cliente ce l\'ha già"></span>' : ''}</span>
          <b>${esc(glTitle(nm))}</b><small>${esc(sub)}</small>${isIn ? '<small class="inn">già in questo espositore</small>' : ''}</button>`;
      }).join('')}</div></div>`).join('') + '</div>';
  }
  const filled = c.slots.length - free;
  main.scrollTop = mainTop;
  document.getElementById('mcFree').innerHTML = `<span class="mc-cnt"><span class="${mc.sel.size ? 'hl' : ''}">Selezionati <b>${mc.sel.size}</b></span><span>Messi ora <b>${mc.added}</b></span>
    <span>Nell'espositore <b>${filled}</b> / ${c.slots.length}</span><span>Posti liberi <b>${free}</b></span></span>`;
  const go = document.getElementById('mcGo'); go.disabled = !mc.sel.size || !free;
  go.innerHTML = `<svg class="ic"><use href="#i-plus"/></svg> Inserisci ${mc.sel.size ? `(${Math.min(mc.sel.size, free)})` : ''}`;
}
/* gruppi come nei Dettagli: fondi (anche in famiglie, es. Neutra / Sassi), poi le grafiche nell'ordine del listino */
function mcGroups(list) {
  const fondi = list.filter(x => !x.g), names = [...new Set(fondi.map(x => x.c))], groups = [];
  const fam = names.length >= 4 && typeof g2Families === 'function' ? g2Families(names) : null;
  if (fam) {
    const pl = fondi.filter(x => fam.plain.includes(x.c)); if (pl.length) groups.push({ name: 'Fondi', items: pl });
    fam.groups.forEach(g => groups.push({ name: g.name, items: fondi.filter(x => g.names.includes(x.c)), tint: g.tint }));
  } else if (fondi.length) groups.push({ name: 'Fondi', items: fondi });
  const gr = new Map(); list.filter(x => x.g).forEach(x => { if (!gr.has(x.g)) gr.set(x.g, { name: x.g, items: [], gi: x.gi || 0 }); gr.get(x.g).items.push(x); });
  [...gr.values()].sort((a, b) => a.gi - b.gi).forEach(g => groups.push(g));
  // nel gruppo: prima i colori con la foto, poi per nome e finitura
  // nel gruppo: prima i Lappati, poi i Silktech (R10), poi gli altri R10 / R9, per ultimi gli R11; poi con la foto prima, per nome
  groups.forEach(g => g.items.sort((a, b) => mcFinRank(a) - mcFinRank(b) || (hasPhoto(b) ? 1 : 0) - (hasPhoto(a) ? 1 : 0) || a.c.localeCompare(b.c)
    || (a.t[0] === '6,5') - (b.t[0] === '6,5') || (a.v || a.z).localeCompare(b.v || b.z)));
  return groups;
}
function mcFinRank(s) {
  const one = f => /\bR11\b|Tecnica/i.test(f) ? 3 : /lappat|lucid|lux/i.test(f) ? 0 : /silktech/i.test(f) ? 1 : 2;
  const fs = s.a4 ? [s.f[0]] : (s.f || []);
  return fs.length ? Math.min(...fs.map(one)) : 2;
}
const mcPicked = () => new Set(((ui.mcPick || {})[mc.compId]) || []);
function mcSetPicked(set) { ui.mcPick = Object.assign({}, ui.mcPick, { [mc.compId]: [...set] }); saveUI(); }
function mcPickToggle(k) { const p = mcPicked(); if (p.has(k)) p.delete(k); else p.add(k); mcSetPicked(p); mcRender(); }
function mcPickSet(mode) {
  const all = mcSeriesList();
  mcSetPicked(new Set(mode === 'all' ? all.map(x => x.b + '|' + x.s) : mode === 'own' ? all.filter(x => x.has.size).map(x => x.b + '|' + x.s) : []));
  mcRender();
}
function mcToggle(k) { if (mc.sel.has(k)) mc.sel.delete(k); else mc.sel.add(k); mcRender(); }
function mcSelAll() {
  const [b, s] = mc.series.split('|'), own = mcOwned(mc.client), inComp = new Set(mcTarget().slots.filter(Boolean));
  // un solo campione per colore: la finitura preferita (Lappato > Silktech > R10 > R11), spessore normale prima del 6,5
  const pick = new Map();
  mcList().filter(x => x.b === b && x.s === s && !own.has(mcOwnKey(x)) && !inComp.has(x.key))
    .sort((x, y) => mcFinRank(x) - mcFinRank(y) || (x.t[0] === '6,5') - (y.t[0] === '6,5'))
    .forEach(x => { if (!pick.has(mcOwnKey(x))) pick.set(mcOwnKey(x), x); });
  pick.forEach(x => mc.sel.add(x.key));
  mcRender();
}
function mcInsert() {
  const c = mcTarget(); if (!c || !mc.sel.size) return;
  const keys = [...mc.sel].filter(k => !c.slots.includes(k)); let n = 0;
  c.slots = c.slots.map(k => k || (keys[n] ? keys[n++] : null));
  c.upd = Date.now(); saveComps();
  const left = keys.length - n;
  mc.sel = new Set(keys.slice(n));
  mc.added += n;
  toast(`Inseriti ${n} campioni in ${c.name}` + (left ? ` · ${left} non ci stanno (posti finiti)` : ''));
  mcRender();
}
