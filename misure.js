'use strict';
/* ════════════════════════════════════════════════════════════
   MISURE degli espositori nella sala mostra / ambientazione (pulsante "Misure").
   - sopra ogni espositore: le misure del catalogo Merch (L × P × H; girevoli chiuso / aperto)
   - pannello: scegli quali espositori (tutti, uno, alcuni) → ingombro a terra complessivo, altezza massima, superficie
   Le misure vengono dal catalogo (campo "dims" di ogni espositore); la posizione e la rotazione da come sono messi nella stanza.
   ════════════════════════════════════════════════════════════ */
document.head.insertAdjacentHTML('beforeend', `<style>
.misanc { position: absolute; width: 1px; height: 1px; pointer-events: none; }
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
/* misure del catalogo: L × P × H (la prima cifra se ce ne sono due, es. girevole chiuso / aperto) */
function misCat(d) {
  const raw = String(d.dims || '');
  const parts = raw.replace(/cm.*$/i, '').split('×').map(t => t.trim());
  const nums = parts.map(t => (t.replace(/,/g, '.').match(/[\d.]+/g) || []).map(Number));
  return { raw: raw.replace(/\s*\(per modulo\)/i, ''), L: (nums[0] || [])[0] || 0, Lopen: (nums[0] || [])[1] || 0, P: (nums[1] || [])[0] || 0, H: (nums[2] || [])[0] || 0, perMod: /per modulo/i.test(raw) };
}
/* ingombro dell'espositore come è disegnato nella stanza (L lungo la parete, P in profondità), con le misure del catalogo */
function misSize(it) {
  const d = DISP[it.disp], m = roomModels[it.id] || (roomModels[it.id] = roomModel(it)), c = misCat(d || {});
  if (!d || c.perMod || !c.L || !c.P) return { L: m.L, P: m.P, H: c.H && !c.perMod ? c.H : m.H || 0 };
  // il catalogo a volte scrive L e P al contrario rispetto al fronte: li abbino al modello
  const swap = Math.abs(m.L - c.P) + Math.abs(m.P - c.L) < Math.abs(m.L - c.L) + Math.abs(m.P - c.P);
  return { L: swap ? c.P : c.L, P: swap ? c.L : c.P, H: c.H || m.H };
}
/* versione breve per l'etichetta: 103 × 97 · h 150 */
function misShort(it) {
  const c = misCat(DISP[it.disp] || {}), sz = misSize(it);
  if (c.perMod) return `${misFmt(sz.L)} × ${misFmt(sz.P)} · h ${misFmt(c.H || sz.H)}`;
  return `${misFmt(c.L || sz.L)}${c.Lopen ? '/' + misFmt(c.Lopen) : ''} × ${misFmt(c.P || sz.P)} · h ${misFmt(c.H || sz.H)}`;
}
const misFmt = v => (Math.round(v * 10) / 10).toLocaleString('it-IT');
function misLabel(it) {
  const d = DISP[it.disp], c = misCat(d || {}), comp = comps[it.comp];
  let main = c.raw || `L${misFmt(misSize(it).L)} × P${misFmt(misSize(it).P)} × H${misFmt(misSize(it).H)} cm`;
  if (c.perMod) { const s = misSize(it), n = cullaMods(d, (comp && comp.slots || []).length || defVariant(d)); main = `${n} modul${n > 1 ? 'i' : 'o'} · L${misFmt(s.L)} × P${misFmt(s.P)} × H${misFmt(c.H || s.H)} cm`; }
  if (c.Lopen) main = main.replace(/L([\d,.]+)\/([\d,.]+)/, 'L$1 (aperto $2)');
  return { main, name: comp ? comp.name : d ? d.name : '' };
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
  layer.innerHTML = all.map(it => { const l = misLabel(it);
    if (partial && !ids.has(it.id)) return '';   // con una scelta: etichette solo sui scelti
    return `<div class="mislbl${partial ? ' sel' : ''}" data-id="${it.id}" title="${esc(l.name + ' · ' + l.main)} — tocca per toglierlo dal totale"><b>${esc(misShort(it))}</b><small>${esc(l.name)}</small></div>`; }).join('');
  layer.querySelectorAll('.mislbl').forEach(el => { el.onpointerdown = e => e.stopPropagation(); el.onclick = e => { e.stopPropagation(); misToggleItem(el.dataset.id); }; });
  const b = misBox(chosen);
  panel.classList.toggle('min', misPanelMin);
  panel.innerHTML = `<div class="mh"><b>Misure espositori</b>
      <button onclick="misOnly(null)">Tutti</button><button onclick="misNone()">Nessuno</button>
      <button onclick="misPanelMin = !misPanelMin; misRefresh()" title="${misPanelMin ? 'Apri' : 'Riduci'}">${misPanelMin ? '<svg class="ic"><use href="#i-cup"/></svg>' : '<svg class="ic"><use href="#i-cdown"/></svg>'}</button>
      <button onclick="toggleMisure()" title="Chiudi"><svg class="ic"><use href="#i-x"/></svg></button></div>
    <div class="mt">${b ? `<div class="k">${chosen.length === all.length ? 'Tutti gli espositori' : chosen.length === 1 ? 'Espositore scelto' : chosen.length + ' espositori scelti'} · ingombro a terra</div>
      <div class="big">${misFmt(b.L)} × ${misFmt(b.P)} cm</div>
      <div class="row2"><span><span class="k">Altezza max</span><br><b>${misFmt(b.H)} cm</b></span><span><span class="k">Superficie occupata</span><br><b>${misFmt(b.area / 10000)} m²</b></span>
        <span><span class="k">Rettangolo a terra</span><br><b>${misFmt(b.L * b.P / 10000)} m²</b></span></div>` : '<div class="k">Scegli uno o più espositori per vedere l\'ingombro.</div>'}</div>
    <div class="ml">${all.map(it => { const l = misLabel(it);
      return `<label><input type="checkbox" ${ids.has(it.id) ? 'checked' : ''} onchange="misToggleItem('${it.id}')"><span><span class="n">${esc(l.name)}</span><br><span class="d">${esc(l.main)}</span></span></label>`; }).join('') || '<div style="padding:10px;color:#777">Nessun espositore nella stanza.</div>'}</div>`;
  misPlan(b);
  cancelAnimationFrame(misRaf); misLast = '';
  const tick = () => { misPlace(); if (misOn() && document.body.contains(layer)) misRaf = requestAnimationFrame(tick); };
  tick();
}
/* posiziona le etichette sopra gli espositori (segue la vista mentre giri o zoomi) */
let misLast = '';
function misPlace() {
  const box = document.getElementById('room3d'), layer = box && box.querySelector('.mislayer'); if (!layer) return;
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
