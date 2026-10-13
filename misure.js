'use strict';
/* ════════════════════════════════════════════════════════════
   MISURE degli espositori nella sala mostra / ambientazione (pulsante "Misure").
   - sopra ogni espositore: le misure del catalogo Merch (L × P × H; girevoli chiuso / aperto)
   - pannello: scegli quali espositori (tutti, uno, alcuni) → ingombro a terra complessivo, altezza massima, superficie
   Le misure vengono dal catalogo (campo "dims" di ogni espositore); la posizione e la rotazione da come sono messi nella stanza.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
.misanc { position: absolute; width: 1px; height: 1px; pointer-events: none; }
.misanchors { position: absolute; left: 0; top: 0; width: 0; height: 0; transform-style: preserve-3d; pointer-events: none; }
.misanchors .misanc { left: 0; top: 0; }
.mislayer { position: absolute; inset: 0; pointer-events: none; z-index: 4; overflow: hidden; }
.mislbl { position: absolute; transform: translate(-50%, -100%); transition: opacity .15s; background: rgba(255,255,255,.95); border: 1px solid #ddd8cf; border-radius: 10px; padding: 5px 9px 6px;
  font-size: 11.5px; line-height: 1.25; color: #222; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,.12); pointer-events: auto; cursor: pointer; text-align: center; }
.mislbl b { display: block; font-size: 12.5px; font-weight: 700; letter-spacing: -.01em; }
.mislbl small { display: block; color: #777; font-size: 10.5px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.mislbl::after { content: ''; position: absolute; left: 50%; bottom: -6px; width: 10px; height: 10px; background: inherit; border: inherit; border-top: 0; border-left: 0; transform: translateX(-50%) rotate(45deg); }
.mislbl.sel { border-color: var(--red); box-shadow: 0 0 0 2px rgba(192,16,42,.25), 0 4px 14px rgba(0,0,0,.14); }
.mislbl.off { opacity: .55; }
.mispanel { position: absolute; right: 10px; bottom: 10px; z-index: 6; width: min(340px, calc(100% - 20px)); max-height: 58%; display: flex; flex-direction: column;
  background: rgba(255,255,255,.97); border: 1px solid var(--border); border-radius: 14px; box-shadow: 0 12px 34px rgba(0,0,0,.18); font-size: 12.5px; overflow: hidden; }
.mispanel .mh { display: flex; align-items: center; gap: 6px; padding: 10px 12px 8px; border-bottom: 1px solid #eee; }
.mispanel .mh b { flex: 1; font-size: 13px; }
.mispanel .mh button.on { background: var(--red); border-color: var(--red); color: #fff; }
.mispanel .mh button { border: 1px solid var(--border); background: #fff; border-radius: 8px; padding: 4px 8px; font: 600 11.5px var(--font-body); cursor: pointer; }
.mispanel .ml { overflow: auto; padding: 4px 6px; flex: 1 1 auto; min-height: 60px; }
.mispanel label { display: grid; grid-template-columns: 18px 1fr; gap: 6px; padding: 6px; border-radius: 8px; cursor: pointer; align-items: start; }
.mispanel label:hover { background: #f6f5f2; }
.mispanel label input { margin: 2px 0 0; }
.mispanel label .n { font-weight: 600; }
.mispanel label .d { color: #666; font-size: 11.5px; }
.mispanel .mt { border-bottom: 1px solid #eee; padding: 10px 12px 12px; background: #faf9f6; }
.mispanel .mt .big { font: 700 18px var(--font-display); letter-spacing: -.02em; }
.mispanel .mt .k { color: #666; font-size: 11.5px; }
.mispanel .mt .row2 { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 6px; }
.mispanel.min .ml, .mispanel.min .mt .row2 { display: none; }
svg.mislines { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.misdim { position: absolute; transform: translate(-50%, -100%); margin-top: -3px; font: 700 11.5px var(--font-body); padding: 2px 6px; border-radius: 6px; white-space: nowrap; color: #fff; pointer-events: none; }
.misdim.t1 { background: #1d1d20; } .misdim.t2 { background: var(--red); } .misdim.t3 { background: #1f5fbf; } .misdim.gap { background: #fff; color: #555; border: 1px dashed #999; }
.misfp { position: absolute; border: 2px dashed var(--red); border-radius: 3px; pointer-events: none; z-index: 3; }
.misfp span { position: absolute; left: 50%; top: -20px; transform: translateX(-50%); background: var(--red); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; white-space: nowrap; }
@media (max-width: 720px) { .mispanel { max-height: 48%; } .mislbl { font-size: 10.5px; padding: 4px 7px; } .mislbl small { display: none; } }
</style>`);

let misSel = null;   // id degli espositori scelti (null = tutti)
const misOn = () => !!ui.roomMis;
function toggleMisure() {
  ui.roomMis = !ui.roomMis; saveUI();
  document.querySelectorAll('.rMis').forEach(b => b.classList.toggle('on', misOn()));
  misRefresh();
}
/* misure del catalogo: L × P × H (se c'è "67/289" la prima è da chiuso) */
function misCat(d) {
  const raw = String(d.dims || '');
  const parts = raw.replace(/cm.*$/i, '').split('×').map(t => t.trim());
  const nums = parts.map(t => (t.replace(/,/g, '.').match(/[\d.]+/g) || []).map(Number));
  return { L: (nums[0] || [])[0] || 0, P: (nums[1] || [])[0] || 0, H: (nums[2] || [])[0] || 0, perMod: /per modulo/i.test(raw) };
}
/* ingombro come è messo nella stanza: L = larghezza (lungo la parete), P = profondità, H = altezza; valori del catalogo.
   Il catalogo non scrive sempre L e P nello stesso verso (es. girevole 160×160): li abbino al disegno dell'espositore.
   Girevoli: "aperto" = quando giri fuori una piastrella a tavolo, sul lato dove scorre la piastrella (dai disegni del catalogo). */
function misSize(it) {
  const d = DISP[it.disp], m = roomModels[it.id] || (roomModels[it.id] = roomModel(it)), c = misCat(d || {});
  let L = m.L, P = m.P, H = m.H || 0;
  if (d && !c.perMod && c.L && c.P) {
    const swap = Math.abs(m.L - c.P) + Math.abs(m.P - c.L) < Math.abs(m.L - c.L) + Math.abs(m.P - c.P);
    L = swap ? c.P : c.L; P = swap ? c.L : c.P; H = c.H || H;
  } else if (c.perMod && c.H) H = c.H;
  let openL = 0, openP = 0;
  if (d && d.mode === 'swing' && d.geo && d.geo.ext) { if (Math.abs(P - d.geo.w) <= Math.abs(L - d.geo.w)) openP = d.geo.ext; else openL = d.geo.ext; }
  return { L, P, H, openL, openP, Hmodel: Math.max(H, m.H || 0) };
}
const misFmt = v => (Math.round(v * 10) / 10).toLocaleString('it-IT');
/* etichetta breve: 103 × 97 · h 150 (aperto 169) */
function misShort(it) {
  const s = misSize(it);
  return `${misFmt(s.L)} × ${misFmt(s.P)} · h ${misFmt(s.H)}`;
}
function misLabel(it) {
  const d = DISP[it.disp], c = misCat(d || {}), comp = comps[it.comp], s = misSize(it);
  let main = `L ${misFmt(s.L)} × P ${misFmt(s.P)} × H ${misFmt(s.H)} cm`;
  if (c.perMod) { const n = cullaMods(d, (comp && comp.slots || []).length || defVariant(d)); main = `${n} modul${n > 1 ? 'i' : 'o'} · ` + main; }
  const open = s.openP ? `aperto: profondità ${misFmt(s.openP)} cm` : s.openL ? `aperto: larghezza ${misFmt(s.openL)} cm` : '';
  return { main, open, name: comp ? comp.name : d ? d.name : '' };
}
/* rettangolo a terra di un gruppo di espositori (con rotazioni qualsiasi) */
function misBox(items) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, H = 0, area = 0;
  items.forEach(it => {
    const s = misSize(it), a = (it.rot || 0) * Math.PI / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
    const hx = (cs * s.L + sn * s.P) / 2, hz = (sn * s.L + cs * s.P) / 2;
    x0 = Math.min(x0, it.x - hx); x1 = Math.max(x1, it.x + hx); z0 = Math.min(z0, it.z - hz); z1 = Math.max(z1, it.z + hz);
    H = Math.max(H, elevY(it) + s.H);
    if (!isUpper(it)) area += s.L * s.P;
  });
  return items.length ? { L: x1 - x0, P: z1 - z0, H, area, x0, z0 } : null;
}
function misItems() { return room ? room.items.filter(it => DISP[it.disp]) : []; }
function misChosen() { const all = misItems(); return misSel ? all.filter(it => misSel.has(it.id)) : all; }
function misToggleItem(id) {
  const all = misItems(); if (!misSel) misSel = new Set(all.map(i => i.id));
  if (misSel.has(id)) misSel.delete(id); else misSel.add(id);
  if (misSel.size === all.length) misSel = null;
  misRefresh();
}
function misOnly(id) { misSel = id ? new Set([id]) : null; misRefresh(); }
function misNone() { misSel = new Set(); misRefresh(); }

let misRaf = 0, misPanelMin = false;
function misRefresh() {
  const box = document.getElementById('room3d'); if (!box) return;
  let layer = box.querySelector('.mislayer'), panel = box.querySelector('.mispanel');
  if (!misOn() || !room) { if (layer) layer.remove(); if (panel) panel.remove(); cancelAnimationFrame(misRaf); misPlan(); return; }
  if (!layer) { layer = document.createElement('div'); layer.className = 'mislayer'; box.appendChild(layer); }
  if (!panel) { panel = document.createElement('div'); panel.className = 'mispanel'; box.appendChild(panel); ['pointerdown', 'wheel', 'touchstart'].forEach(ev => panel.addEventListener(ev, e => e.stopPropagation(), { passive: true })); }
  const all = misItems(), chosen = misChosen(), ids = new Set(chosen.map(i => i.id)), partial = chosen.length < all.length;
  misAnchors(ui.misLines ? chosen : null);
  if (ui.misLines) layer.innerHTML = '<svg class="mislines"></svg>';
  else layer.innerHTML = all.map(it => { const l = misLabel(it);
    if (partial && !ids.has(it.id)) return '';   // con una scelta: etichette solo sui scelti
    return `<div class="mislbl${partial ? ' sel' : ''}" data-id="${it.id}" title="${esc(l.name + ' · ' + l.main + (l.open ? ' · ' + l.open : ''))} — tocca per toglierlo dal totale"><b>${esc(misShort(it))}</b>${l.open ? `<small>${esc(l.open)}</small>` : ''}<small>${esc(l.name)}</small></div>`; }).join('');
  layer.querySelectorAll('.mislbl').forEach(el => { el.onpointerdown = e => e.stopPropagation(); el.onclick = e => { e.stopPropagation(); misToggleItem(el.dataset.id); }; });
  const b = misBox(chosen);
  panel.classList.toggle('min', misPanelMin);
  panel.innerHTML = `<div class="mh"><b>Misure espositori</b>
      <button class="mlbtn ${ui.misLines ? 'on' : ''}" onclick="ui.misLines = !ui.misLines; saveUI(); misRefresh()" title="Quote: ogni espositore, i gruppi attaccati, gli spazi tra loro e il totale">Linee misure</button>
      <button onclick="misOnly(null)">Tutti</button><button onclick="misNone()">Nessuno</button>
      <button onclick="misPanelMin = !misPanelMin; misRefresh()" title="${misPanelMin ? 'Apri' : 'Riduci'}">${misPanelMin ? '<svg class="ic"><use href="#i-cup"/></svg>' : '<svg class="ic"><use href="#i-cdown"/></svg>'}</button>
      <button onclick="toggleMisure()" title="Chiudi"><svg class="ic"><use href="#i-x"/></svg></button></div>
    <div class="mt">${b ? `<div class="k">${chosen.length === all.length ? 'Tutti gli espositori' : chosen.length === 1 ? 'Espositore scelto' : chosen.length + ' espositori scelti'} · ingombro a terra</div>
      <div class="big">${misFmt(b.L)} × ${misFmt(b.P)} cm</div>
      <div class="row2"><span><span class="k">Altezza max</span><br><b>${misFmt(b.H)} cm</b></span><span><span class="k">Superficie occupata</span><br><b>${misFmt(b.area / 10000)} m²</b></span>
        <span><span class="k">Rettangolo a terra</span><br><b>${misFmt(b.L * b.P / 10000)} m²</b></span></div>` : '<div class="k">Scegli uno o più espositori per vedere l\'ingombro.</div>'}</div>
    <div class="ml">${all.map(it => { const l = misLabel(it);
      return `<label><input type="checkbox" ${ids.has(it.id) ? 'checked' : ''} onchange="misToggleItem('${it.id}')"><span><span class="n">${esc(l.name)}</span><br><span class="d">${esc(l.main)}${l.open ? '<br>' + esc(l.open) : ''}</span></span></label>`; }).join('') || '<div style="padding:10px;color:#777">Nessun espositore nella stanza.</div>'}</div>`;
  misPlan(b);
  cancelAnimationFrame(misRaf); misLast = '';
  const tick = () => { misPlace(); if (misOn() && document.body.contains(layer)) misRaf = requestAnimationFrame(tick); };
  tick();
}
/* posiziona le etichette sopra gli espositori (segue la vista mentre giri o zoomi) */
let misLast = '';
function misPlace() {
  const box = document.getElementById('room3d'), layer = box && box.querySelector('.mislayer'); if (!layer) return;
  if (ui.misLines) { misDrawLines(box, layer); return; }
  const r0 = box.getBoundingClientRect(); let key = '';
  const pos = [...layer.children].map(el => {
    const a = document.querySelector(`#roomScene .ritem[data-id="${el.dataset.id}"] > .misanc`); if (!a) return null;
    const r = a.getBoundingClientRect(); const p = [Math.round(r.left - r0.left), Math.round(r.top - r0.top)]; key += p.join(',') + ';'; return p;
  });
  if (key === misLast) return; misLast = key;
  const els = [...layer.children], placed = [];
  els.forEach((el, i) => { const p = pos[i]; el.style.display = p && p[0] > -50 && p[0] < r0.width + 50 ? '' : 'none'; });
  els.map((el, i) => ({ el, p: pos[i], w: el.offsetWidth, h: el.offsetHeight })).filter(o => o.p && o.el.style.display !== 'none')
    .sort((a, b) => b.p[1] - a.p[1]).forEach(o => {   // dal basso verso l'alto
      let y = o.p[1];
      for (let k = 0; k < 30; k++) { const hit = placed.find(q => Math.abs(q.x - o.p[0]) < (q.w + o.w) / 2 + 4 && Math.abs(q.y - y) < (q.h + o.h) / 2 + 3); if (!hit) break; y = hit.y - hit.h - 4; }
      placed.push({ x: o.p[0], y, w: o.w, h: o.h });
      o.el.style.left = o.p[0] + 'px'; o.el.style.top = Math.max(o.h + 4, y) + 'px';
    });
}
/* nella pianta (modifica disposizione): rettangolo tratteggiato dell'ingombro scelto */
function misPlan(b) {
  const plan = document.getElementById('roomPlan'); if (!plan) return;
  plan.querySelectorAll('.misfp').forEach(e => e.remove());
  if (!b || !misOn() || typeof planS === 'undefined') return;
  const pr = plan.querySelector('.plan-room'); if (!pr) return;
  const ox = parseFloat(pr.style.left), oz = parseFloat(pr.style.top);
  plan.insertAdjacentHTML('beforeend', `<div class="misfp" style="left:${ox + b.x0 * planS}px;top:${oz + b.z0 * planS}px;width:${b.L * planS}px;height:${b.P * planS}px"><span>${misFmt(b.L)} × ${misFmt(b.P)} cm</span></div>`);
}

/* ── LINEE MISURE: quote come in un disegno tecnico, nella stanza 3D ──
   livello 1: ogni espositore (dall'inizio alla fine) + gli spazi vuoti tra gruppi staccati
   livello 2: ogni gruppo di espositori attaccati (es. una coppia)
   livello 3: dal primo all'ultimo (es. coppia + spazio + coppia)
   Le misure sono lungo la larghezza della stanza (parallele al muro di fondo), tutte alla stessa altezza per livello, davanti agli espositori. */
let misSegs = [];
function misLinesPlan(items) {
  const rows = items.filter(it => !isUpper(it) && elevY(it) < 50).map(it => {
    const s = misSize(it), a = (it.rot || 0) * Math.PI / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a));
    const hx = (cs * s.L + sn * s.P) / 2, hz = (sn * s.L + cs * s.P) / 2;
    return { it, x0: it.x - hx, x1: it.x + hx, zf: it.z + hz, top: elevY(it) + s.Hmodel };
  }).sort((a, b) => a.x0 - b.x0);
  if (!rows.length) return [];
  const groups = [];
  rows.forEach(r => { const g = groups[groups.length - 1]; if (g && r.x0 - g.x1 <= 3) { g.rows.push(r); g.x1 = Math.max(g.x1, r.x1); } else groups.push({ rows: [r], x0: r.x0, x1: r.x1 }); });
  const z = Math.max(...rows.map(r => r.zf)) + 4, base = Math.max(...rows.map(r => r.top)) + 15, step = 26;
  const segs = [];
  rows.forEach(r => segs.push({ t: 't1', x0: r.x0, x1: r.x1, y: base, ext: r.top + 3 }));
  for (let i = 1; i < groups.length; i++) segs.push({ t: 'gap', x0: groups[i - 1].x1, x1: groups[i].x0, y: base });
  const pairs = groups.filter(g => g.rows.length > 1);
  pairs.forEach(g => segs.push({ t: 't2', x0: g.x0, x1: g.x1, y: base + step, ext: base }));
  if (groups.length > 1) segs.push({ t: 't3', x0: groups[0].x0, x1: groups[groups.length - 1].x1, y: base + step * (pairs.length ? 2 : 1), ext: base });
  segs.forEach(sg => { sg.z = z; sg.len = sg.x1 - sg.x0; });
  return segs.filter(sg => sg.len > 0.5);
}
/* punti 3D nella stanza → elementi invisibili: il browser ci dà la posizione sullo schermo (funziona anche con il 3D veloce) */
function misAnchors(items) {
  const sc = document.getElementById('roomScene'); if (!sc) return;
  let host = sc.querySelector(':scope > .misanchors');
  if (!items) { if (host) host.remove(); misSegs = []; return; }
  misSegs = misLinesPlan(items);
  if (!host) { host = document.createElement('div'); host.className = 'misanchors'; sc.appendChild(host); }
  const pt = (x, y, z) => `<div class="misanc" style="transform:translate3d(${x}px,${-y}px,${z}px)"></div>`;
  host.innerHTML = misSegs.map(g => pt(g.x0, g.y, g.z) + pt(g.x1, g.y, g.z) + pt(g.x0, g.ext != null ? g.ext : g.y, g.z) + pt(g.x1, g.ext != null ? g.ext : g.y, g.z)).join('');
}
function misDrawLines(box, layer) {
  const host = document.querySelector('#roomScene > .misanchors'); if (!host) return;
  const r0 = box.getBoundingClientRect(), an = host.children; let key = '';
  const P = [...an].map(a => { const r = a.getBoundingClientRect(); const p = [r.left - r0.left, r.top - r0.top]; key += Math.round(p[0]) + ',' + Math.round(p[1]) + ';'; return p; });
  if (key === misLast) return; misLast = key;
  const col = { t1: '#1d1d20', t2: '#c0102a', t3: '#1f5fbf', gap: '#888' };
  let svg = '', html = '';
  misSegs.forEach((g, i) => {
    const [a, b, ea, eb] = [P[i * 4], P[i * 4 + 1], P[i * 4 + 2], P[i * 4 + 3]], c = col[g.t], dash = g.t === 'gap' ? ' stroke-dasharray="5 4"' : '';
    if (g.ext != null) svg += `<line x1="${ea[0]}" y1="${ea[1]}" x2="${a[0]}" y2="${a[1]}" stroke="${c}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/><line x1="${eb[0]}" y1="${eb[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/>`;
    svg += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${g.t === 'gap' ? 1.5 : 2}"${dash}/>`;
    // trattini a 45° alle estremità (come nei disegni tecnici)
    [a, b].forEach(p => { svg += `<line x1="${p[0] - 5}" y1="${p[1] + 5}" x2="${p[0] + 5}" y2="${p[1] - 5}" stroke="${c}" stroke-width="2"/>`; });
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, px = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const txt = misFmt(g.len) + ' cm';
    if (px > 18) html += `<div class="misdim ${g.t}" style="left:${mx}px;top:${my}px">${g.t === 'gap' ? 'spazio ' : ''}${txt}</div>`;
  });
  layer.innerHTML = `<svg class="mislines">${svg}</svg>${html}`;
}
