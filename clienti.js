'use strict';
/* ════════════════════════════════════════════════════════════
   CLIENTI — home, scheda cliente, inventario campioni, router
   Usa lo stato globale di index.html: clients, comps, scenes, ui, DISP, SAMPLE…
   ════════════════════════════════════════════════════════════ */

/* Contenitori delle viste (sopra il configuratore, sotto la barra in alto) */
['viewHome', 'viewClient', 'viewRoom'].forEach(id => {
  const v = document.createElement('div'); v.id = id; v.className = 'view'; document.body.appendChild(v);
});

/* ── Router: #/  ·  #/cliente/ID  ·  #/ambiente/ID  ·  #/espositori ── */
function go(h) { if (location.hash === h) route(); else location.hash = h; }
window.addEventListener('hashchange', route);
/* campioni rinominati (es. UNIQUE BOURGOGNE diviso per grafica Variée/Minimal/Pointes): le composizioni salvate passano al nome nuovo */
function fixSampleAlias() {
  const A = window.SAMPLE_ALIAS || {};
  Object.values(comps).forEach(c => (c.slots || []).forEach((k, i) => { if (k && !SAMPLE[k] && A[k]) c.slots[i] = A[k]; }));
  migrateA4();
  // culla modulare: prima 14 posti per modulo, ora 13/26/40/54/68 (3 moduli = 40): si toglie un posto vuoto in fondo
  Object.values(comps).forEach(c => {
    const d = DISP[c.disp]; if (!d || !d.oldVariants || !c.slots) return;
    const k = d.oldVariants.indexOf(c.slots.length); if (k < 0) return;
    const v = d.variants[k]; c.variant = v;
    for (let j = c.slots.length - 1; j >= 0 && c.slots.length > v; j--) if (!c.slots[j]) c.slots.splice(j, 1);
    while (c.slots.length > v) { const extra = c.slots.pop(); const e = c.slots.indexOf(null); if (e >= 0) c.slots[e] = extra; }
  });
  // espositori che hanno più posti di prima (es. cassettiera 60×120 da 18 a 21 cassetti): le composizioni salvate si allungano
  Object.values(comps).forEach(c => { const d = DISP[c.disp]; if (d && !d.variants && c.slots && c.slots.length < d.slots) while (c.slots.length < d.slots) c.slots.push(null); });
}
function route() {
  fixSampleAlias();
  document.body.classList.remove('showlist');                       // lista espositori a tutto schermo (telefono) chiusa cambiando pagina
  window.scrollTo(0, 0);
  if (window.closeG2Full) closeG2Full();
  const [, a, id, sub] = (location.hash || '#/').split('/');
  if (a === 'cliente' && clients[id]) { document.body.dataset.view = 'client'; renderClient(id); return; }
  if (a === 'galleria2') { closeGalleryFull(); closeG2Full(); document.body.dataset.view = 'gallery2'; renderGallery2Home(); return; }
  if (a === 'g2' && clients[id]) { closeG2Full(); document.body.dataset.view = 'gallery2'; renderGallery2(id, sub); return; }
  if (a === 'galleria') return go('#/galleria2');   // la vecchia Galleria è stata sostituita dalla Galleria+
  if (a === 'campioni' && clients[id]) return go('#/g2/' + id + (sub && sub !== 'tutti' ? '/' + sub : ''));
  if (a === 'pacchetti') { document.body.dataset.view = 'packs'; renderPacks(id); return; }
  if (a === 'novita') { document.body.dataset.view = 'novita'; renderNovita(); return; }
  if (a === 'ambiente' && scenes[id]) { document.body.dataset.view = 'room'; openRoom(id); return; }
  if (a === 'salamostra' && clients[id]) {
    const rooms = showRooms(id), last = (ui.showRoom || {})[id];
    const s = rooms.find(r => r.id === sub) || rooms.find(r => r.id === last) || rooms[0];
    if (s) { ui.showRoom = Object.assign({}, ui.showRoom, { [id]: s.id }); saveUI(); document.body.dataset.view = 'show'; openRoom(s.id, 'show'); return; }
    return go('#/cliente/' + id);
  }
  if (a === 'espositori') {
    document.body.dataset.view = 'config';
    if (!DISP[ui.disp]) ui.disp = DISPLAYS[0].id;
    renderList(); renderAll();
    return;
  }
  document.body.dataset.view = 'home'; renderHome();
}

/* ── Utilità ── */
const clientComps = cid => Object.values(comps).filter(c => c.client === cid);
const visibleComps = cid => clientComps(cid).filter(c => c.explicit || c.slots.some(Boolean))
  .sort((a, b) => (DISP[a.disp] ? DISPLAYS.indexOf(DISP[a.disp]) : 99) - (DISP[b.disp] ? DISPLAYS.indexOf(DISP[b.disp]) : 99) || a.name.localeCompare(b.name));
const clientScenes = cid => Object.values(scenes).filter(s => s.client === cid && !s.showroom).sort((a, b) => b.upd - a.upd);
const clientShowroom = cid => { const s = clients[cid] && scenes[clients[cid].showroom]; return s && s.client === cid ? s : (showRooms(cid)[0] || null); };
/* la sala mostra di un cliente può avere più stanze: tutte le ambientazioni del cliente segnate come sala mostra */
const showRooms = cid => Object.values(scenes).filter(s => s.client === cid && s.showroom)
  .sort((a, b) => (a.order ?? (clients[cid] && clients[cid].showroom === a.id ? -1 : 0)) - (b.order ?? (clients[cid] && clients[cid].showroom === b.id ? -1 : 0)) || (a.created || 0) - (b.created || 0) || a.name.localeCompare(b.name));
const filledOf = c => c.slots.filter(k => k && SAMPLE[k]).length;
const dateIt = t => t ? new Date(t).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
const jsq = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/* Apre una composizione nel configuratore (ricorda da dove si arriva) */
function openComp(id, returnTo) {
  const c = comps[id]; if (!c || !DISP[c.disp]) return;
  ui.client = c.client || ''; ui.disp = c.disp; ui.returnTo = returnTo || '';
  current[curKey(DISP[c.disp])] = id; saveComps(); saveUI();
  selSlot = 0; bookPage = 0; swing = { holder: 0, pose: 'in', side: 'A' }; searchQ = ''; brandFilter = '';
  go('#/espositori');
}
function openFreeCatalog() { ui.client = ''; ui.returnTo = ''; saveUI(); go('#/espositori'); }
function leaveConfig() {
  const back = ui.returnTo; ui.returnTo = ''; saveUI();
  if (back && back.startsWith('#/ambiente/') && scenes[back.split('/')[2]]) return go(back);
  if (back && back.startsWith('#/salamostra/') && clients[back.split('/')[2]]) return go(back);
  if (back && back.startsWith('#/pacchetti/') && scenes[back.split('/')[2]]) return go(back);
  if (back === '#/novita') return go(back);
  go(ctxClient() ? '#/cliente/' + ctxClient() : '#/');
}

/* ════════════════════════════════════════════════════════════
   HOME — elenco clienti
   ════════════════════════════════════════════════════════════ */
let homeQ = '', homeNew = false;
function renderHome() {
  const q = homeQ.trim().toLowerCase();
  const list = Object.values(clients).filter(c => !q || (c.name + ' ' + (c.city || '') + ' ' + (c.contact || '')).toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
  const free = Object.values(comps).filter(c => !c.client && c.slots.some(Boolean)).length;
  const v = document.getElementById('viewHome');
  v.innerHTML = `<div class="vwrap">
    <div class="vhead"><h2>Clienti</h2>
      <input class="search" id="homeSearch" placeholder="Cerca cliente o città…" value="${esc(homeQ)}">
      <button class="btn red" onclick="homeNew=true; renderHome(); document.getElementById('nc_name').focus()"><svg class="ic"><use href="#i-plus"/></svg> Nuovo cliente</button>
    </div>
    ${homeNew ? `<div class="card" style="margin-bottom:14px"><div class="form">
        <label>Nome cliente *<input id="nc_name" placeholder="es. Ceramiche Rossi"></label>
        <label>Città<input id="nc_city"></label>
        <label>Referente<input id="nc_contact"></label>
        <label>Telefono<input id="nc_phone"></label>
        <div class="full" style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn" onclick="homeNew=false; renderHome()">Annulla</button>
          <button class="btn red" onclick="createClient()">Crea cliente</button></div>
      </div></div>` : ''}
    <div class="cgrid">
      ${list.map(c => {
        const cc = visibleComps(c.id), pcs = cc.reduce((n, x) => n + filledOf(x), 0);
        return `<div class="card ccard" onclick="go('#/cliente/${c.id}')">
          <h3>${esc(c.name)}</h3><div class="sub">${esc([c.city, c.contact].filter(Boolean).join(' · ') || '—')}</div>
          <div class="stats"><div><b>${cc.length}</b>espositori</div><div><b>${pcs}</b>campioni</div><div><b>${clientScenes(c.id).length}</b>ambientazioni</div></div>
        </div>`;
      }).join('')}
      ${!list.length && !q ? `<div class="card ccard newcard" onclick="homeNew=true; renderHome(); document.getElementById('nc_name').focus()"><svg class="ic"><use href="#i-plus"/></svg> Crea il primo cliente</div>` : ''}
    </div>
    ${!list.length && q ? `<div class="empty-note">Nessun cliente trovato per "${esc(homeQ)}".</div>` : ''}
    <div class="vhead" style="margin-top:28px"><h2 style="font-size:18px">Strumenti</h2></div>
    <div class="cgrid">
      <div class="card ccard" onclick="openFreeCatalog()"><h3><svg class="ic"><use href="#i-panels"/></svg> Catalogo espositori</h3>
        <div class="sub">Prova gli espositori senza cliente${free ? ` · ${free} composizioni libere` : ''}</div></div>
      <div class="card ccard" onclick="go('#/pacchetti')"><h3><svg class="ic"><use href="#i-box"/></svg> Pacchetti espositori</h3>
        <div class="sub">Le tue proposte di esposizione pronte da mettere nella sala mostra di un cliente</div></div>
      <div class="card ccard" onclick="go('#/novita')"><h3><svg class="ic"><use href="#i-sparkles"/></svg> Novità</h3>
        <div class="sub">${Object.keys(novita).length ? `${Object.keys(novita).length} prodotti nuovi non ancora a listino` : 'Prodotti nuovi non ancora a listino: foto, formati e finiture, da campionare'}</div></div>
      <div class="card ccard" onclick="openVersions()"><h3><svg class="ic"><use href="#i-history"/></svg> Versioni salvate</h3>
        <div class="sub">Tutto si salva da solo su disco. Qui puoi tornare a una versione precedente.</div></div>
      <div class="card ccard" onclick="openImages()"><h3><svg class="ic"><use href="#i-camera"/></svg> Foto campioni</h3>
        <div class="sub">${IMG_KEYS.filter(k => IMG[k]).length} foto su ${IMG_KEYS.length} serie/colori</div></div>
    </div>
  </div>`;
  const s = document.getElementById('homeSearch');
  s.addEventListener('input', e => { homeQ = e.target.value; const pos = e.target.selectionStart; renderHome(); const n = document.getElementById('homeSearch'); n.focus(); n.setSelectionRange(pos, pos); });
  const nm = document.getElementById('nc_name');
  if (nm) nm.addEventListener('keydown', e => { if (e.key === 'Enter') createClient(); });
}
function createClient() {
  const name = document.getElementById('nc_name').value.trim();
  if (!name) { document.getElementById('nc_name').focus(); toast('Scrivi il nome del cliente'); return; }
  const c = { id: uid(), name, city: document.getElementById('nc_city').value.trim(), contact: document.getElementById('nc_contact').value.trim(),
    phone: document.getElementById('nc_phone').value.trim(), note: '', upd: Date.now() };
  clients[c.id] = c; saveClients(); homeNew = false;
  go('#/cliente/' + c.id);
}

/* ════════════════════════════════════════════════════════════
   SCHEDA CLIENTE — espositori, inventario, ambientazioni
   ════════════════════════════════════════════════════════════ */
let clientTab = 'show', addingDisp = false, invQ = '';
function renderClient(cid) {
  const cl = clients[cid]; if (!cl) return go('#/');
  if (ui.client !== cid) { ui.client = cid; saveUI(); }
  const cc = visibleComps(cid), inv = inventory(cid), sc = clientScenes(cid);
  const pcs = inv.reduce((n, r) => n + r.n, 0);
  const v = document.getElementById('viewClient');
  v.innerHTML = `<div class="vwrap">
    <div class="vhead">
      <button class="btn" onclick="go('#/')"><svg class="ic"><use href="#i-left"/></svg>Clienti</button>
      <h2>${esc(cl.name)}</h2>
      <button class="btn" onclick="deleteClient('${cid}')" title="Elimina cliente"><svg class="ic"><use href="#i-trash"/></svg> Elimina</button>
    </div>
    <div class="card"><div class="form">
      <label>Nome cliente<input value="${esc(cl.name)}" oninput="updClient('${cid}','name',this.value)"></label>
      <label>Città<input value="${esc(cl.city || '')}" oninput="updClient('${cid}','city',this.value)"></label>
      <label>Referente<input value="${esc(cl.contact || '')}" oninput="updClient('${cid}','contact',this.value)"></label>
      <label>Telefono<input value="${esc(cl.phone || '')}" oninput="updClient('${cid}','phone',this.value)"></label>
      <label class="full">Note<textarea oninput="updClient('${cid}','note',this.value)" placeholder="Note sul cliente, sullo showroom, sugli spazi…">${esc(cl.note || '')}</textarea></label>
    </div></div>
    <div class="ctabs">
      <button class="${clientTab === 'show' ? 'on' : ''}" onclick="clientTab='show'; renderClient('${cid}')"><svg class="ic"><use href="#i-store"/></svg> Sala mostra</button>
      <button class="${clientTab === 'esp' ? 'on' : ''}" onclick="clientTab='esp'; renderClient('${cid}')">Espositori<span class="n">${cc.length}</span></button>
      <button class="${clientTab === 'inv' ? 'on' : ''}" onclick="clientTab='inv'; renderClient('${cid}')">Inventario campioni<span class="n">${pcs}</span></button>
      <button class="${clientTab === 'amb' ? 'on' : ''}" onclick="clientTab='amb'; renderClient('${cid}')">Ambientazioni<span class="n">${sc.length}</span></button>
    </div>
    <div id="clientTabBody">${clientTab === 'show' ? showroomHTML(cid) : clientTab === 'inv' ? invHTML(cid, inv) : clientTab === 'amb' ? scenesHTML(cid, sc) : espHTML(cid, cc)}</div>
  </div>`;
  const iq = document.getElementById('invSearch');
  if (iq) iq.addEventListener('input', e => { invQ = e.target.value; const pos = e.target.selectionStart; renderClient(cid); const n = document.getElementById('invSearch'); n.focus(); n.setSelectionRange(pos, pos); });
}
let updT;
function updClient(cid, f, val) {
  clients[cid][f] = f === 'name' ? (val.trim() || 'Senza nome') : val; clients[cid].upd = Date.now();
  clearTimeout(updT); updT = setTimeout(saveClients, 300);
  if (f === 'name') document.querySelector('#viewClient .vhead h2').textContent = clients[cid].name;
}
async function deleteClient(cid) {
  const cl = clients[cid], cc = clientComps(cid), sc = Object.values(scenes).filter(s => s.client === cid);   // anche la sala mostra
  if (!await ask(`Eliminare il cliente "${cl.name}"?\n\nVerranno eliminati anche ${cc.length} espositori/composizioni e ${sc.length} ambientazioni.\nL'operazione non si può annullare.`)) return;
  cc.forEach(c => delete comps[c.id]); sc.forEach(s => delete scenes[s.id]);
  Object.keys(current).forEach(k => { if (k.startsWith(cid + '|')) delete current[k]; });
  delete clients[cid]; if (ui.client === cid) ui.client = '';
  saveComps(); saveScenes(); saveClients(); saveUI(); go('#/');
}

/* ── Espositori del cliente ── */
function espHTML(cid, cc) {
  const free = Object.values(comps).filter(c => !c.client && c.slots.some(Boolean) && DISP[c.disp]);
  return `
    <div class="vhead"><h2 style="font-size:17px">Espositori del cliente</h2>
      <span style="display:flex;gap:6px;flex-wrap:wrap">${cc.some(x => x.slots.some(Boolean)) ? `<button class="btn" onclick="openCodesByFormat('${cid}')" title="Tutti i codici divisi per formato, per ordinarli"><svg class="ic"><use href="#i-clipboard"/></svg> Codici per formato</button>` : ''}
      ${cc.some(x => x.slots.some(Boolean)) ? `<button class="btn" onclick="exportSchedeCliente('${cid}')" title="Un PDF con la scheda di ogni espositore: render, dati e prodotti"><svg class="ic"><use href="#i-download"/></svg> Schede PDF di tutti</button>` : ''}
      <button class="btn" onclick="pasteIntoComps(visibleComps('${cid}'), null, () => renderClient('${cid}'))" title="Incolla un elenco di codici e scegli in quali espositori metterli"><svg class="ic"><use href="#i-paste"/></svg> Incolla codici</button>
      <button class="btn red" onclick="addingDisp=!addingDisp; renderClient('${cid}')">${addingDisp ? 'Chiudi' : '<svg class="ic"><use href="#i-plus"/></svg> Aggiungi espositore'}</button></span></div>
    ${addingDisp ? `<div class="card" style="margin-bottom:12px">${dispPickerHTML(`addCompTo('${cid}', '%ID%')`)}</div>` : ''}
    ${cc.length ? `<div style="display:flex;flex-direction:column;gap:8px">${cc.map(c => compCardHTML(c, cid)).join('')}</div>`
      : `<div class="card empty-note">Nessun espositore per questo cliente.<br>Premi <b><svg class="ic"><use href="#i-plus"/></svg> Aggiungi espositore</b> e scegli quello che ha (o che gli proponi), poi inserisci i campioni.</div>`}
    ${free.length ? `<div class="vhead" style="margin-top:24px"><h2 style="font-size:15px;color:var(--mid)">Composizioni del catalogo libero (senza cliente)</h2></div>
      <div style="display:flex;flex-direction:column;gap:8px">${free.map(c => `<div class="card ecard"><img src="${DISP[c.disp].img}" alt="">
        <div class="info"><div class="t">${esc(c.name)}</div><div class="s">${esc(DISP[c.disp].name)} · ${filledOf(c)}/${c.slots.length} campioni</div></div>
        <div class="acts"><button class="btn" onclick="assignComp('${c.id}','${cid}')">Assegna a questo cliente</button></div></div>`).join('')}</div>` : ''}`;
}
function compCardHTML(c, cid) {
  const d = DISP[c.disp]; if (!d) return '';
  const f = filledOf(c), shown = c.slots.filter(k => k && SAMPLE[k]).slice(0, 14);
  return `<div class="card ecard"><img src="${d.img}" alt="">
    <div class="info"><div class="t">${esc(c.name)}</div>
      <div class="s">${esc(d.name)} · cod. ${esc(d.code)} · <b>${f}</b>/${c.slots.length} campioni</div>
      <div class="sws">${shown.map(k => `<span style="${swatchStyle(SAMPLE[k])}" title="${esc(SAMPLE[k].s + ' ' + SAMPLE[k].c)}"></span>`).join('')}${f > shown.length ? `<span style="display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--mid)">+${f - shown.length}</span>` : ''}</div></div>
    <div class="acts">
      <button class="btn dark" onclick="openComp('${c.id}')">Apri</button>
      ${f ? `<button class="btn" onclick="exportSchedaPDF('${c.id}')" title="Scheda PDF di questo espositore"><svg class="ic"><use href="#i-download"/></svg> Scheda PDF</button>` : ''}
      <button class="btn" onclick="renameCompUI('${c.id}','${cid}')" title="Rinomina"><svg class="ic"><use href="#i-pencil"/></svg></button>
      <button class="btn" onclick="dupCompFor('${c.id}','${cid}')" title="Duplica"><svg class="ic"><use href="#i-copy"/></svg></button>
      <button class="btn" onclick="delCompFor('${c.id}','${cid}')" title="Elimina"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>`;
}
function dispPickerHTML(action) {
  const fams = [...new Set(DISPLAYS.map(d => d.family))];
  return `<div class="dpick">${fams.map(f => `<div class="fam">${esc(f)}</div>` + DISPLAYS.filter(d => d.family === f).map(d =>
    `<button onclick="${action.replace('%ID%', d.id)}"><img src="${d.img}" alt=""><span>${esc(d.name)}<br><span style="font-weight:500;color:var(--mid)">${d.variants ? d.variants.join('/') : d.slots} posti</span></span></button>`).join('')).join('')}</div>`;
}
function addCompTo(cid, dispId) {
  const prev = ui.client; ui.client = cid;
  const d = DISP[dispId], n = clientComps(cid).filter(x => x.disp === dispId).length;
  const c = makeComp(d, d.name + (n ? ' ' + (n + 1) : '')); c.explicit = true;
  saveComps(); addingDisp = false; ui.client = prev;
  openComp(c.id);
  return c;
}
function assignComp(compId, cid) { comps[compId].client = cid; comps[compId].explicit = true; saveComps(); renderClient(cid); toast('Composizione assegnata al cliente'); }
async function renameCompUI(id, cid) { const c = comps[id]; const v = await askText('Nome dell\'espositore:', c.name); if (v && v.trim()) { c.name = v.trim(); c.upd = Date.now(); saveComps(); renderClient(cid); } }
function dupCompFor(id, cid) {
  const c = comps[id]; const x = Object.assign({}, c, { id: uid(), name: c.name + ' (copia)', slots: c.slots.slice(), upd: Date.now(), explicit: true });
  comps[x.id] = x; saveComps(); renderClient(cid); toast('Espositore duplicato');
}
async function delCompFor(id, cid) {
  const c = comps[id]; if (!await ask(`Eliminare "${c.name}" e i suoi ${filledOf(c)} campioni?`)) return;
  delete comps[id];
  clientScenes(cid).forEach(s => { s.items.forEach(it => { if (it.comp === id) it.comp = null; }); });
  saveComps(); saveScenes(); renderClient(cid);
}

/* ── Inventario campioni: tutti i campioni negli espositori del cliente ── */
function inventory(cid) {
  const rows = {};
  clientComps(cid).forEach(c => {
    const d = DISP[c.disp]; if (!d) return;
    c.slots.forEach((k, i) => {
      const s = SAMPLE[k]; if (!s) return;
      const r = rows[k] || (rows[k] = { s, n: 0, where: [] });
      r.n++; r.where.push({ c, d, slot: slotName(d, i, c.slots.length) });
    });
  });
  return Object.values(rows).sort((a, b) => a.s.b.localeCompare(b.s.b) || a.s.s.localeCompare(b.s.s) || a.s.c.localeCompare(b.s.c) || a.s.z.localeCompare(b.s.z));
}
const invFmt = s => s.toz ? 'tozzetto' + tozFrom(s) : fmt(s.z);
function invHTML(cid, inv) {
  const q = invQ.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const rows = inv.filter(r => q.every(w => (r.s.b + ' ' + r.s.s + ' ' + r.s.c + ' ' + r.s.z + ' ' + r.s.k.join(' ')).toLowerCase().includes(w)));
  const pcs = inv.reduce((n, r) => n + r.n, 0), series = new Set(inv.map(r => r.s.b + r.s.s)).size;
  const noPhoto = inv.filter(r => !hasPhoto(r.s)).length;
  if (!inv.length) return `<div class="card empty-note">Ancora nessun campione: aggiungi un espositore al cliente e inserisci i campioni.</div>`;
  let lastB = '', body = '';
  rows.forEach(r => {
    if (r.s.b !== lastB) { lastB = r.s.b; body += `<tr class="grp"><td colspan="6">${esc(lastB)}</td></tr>`; }
    const wh = {};
    r.where.forEach(w => { (wh[w.c.id] = wh[w.c.id] || { c: w.c, d: w.d, slots: [] }).slots.push(w.slot); });
    body += `<tr><td><div class="sw" style="${swatchStyle(r.s)}"></div></td>
      <td><b>${esc(r.s.s)}</b><br>${esc(r.s.c)}${hasPhoto(r.s) ? '' : ' <span style="color:var(--red);font-size:11px">· senza foto</span>'}</td>
      <td>${esc(invFmt(r.s))}<br><span class="where">${esc(r.s.t.map(t => t + ' mm').join('/'))}</span></td>
      <td class="where">${esc(r.s.k.join(' / '))}<br>${esc(r.s.f.join(', '))}</td>
      <td class="q">${r.n}</td>
      <td class="where">${Object.values(wh).map(x => `<a onclick="openComp('${x.c.id}')">${esc(x.c.name)}</a> · posti ${esc(x.slots.join(', '))}`).join('<br>')}</td></tr>`;
  });
  return `
    <div class="kpis">
      <div class="card"><b>${pcs}</b><span>campioni (pezzi)</span></div>
      <div class="card"><b>${inv.length}</b><span>referenze diverse</span></div>
      <div class="card"><b>${series}</b><span>serie</span></div>
      <div class="card"><b>${visibleComps(cid).length}</b><span>espositori</span></div>
      ${noPhoto ? `<div class="card"><b style="color:var(--red)">${noPhoto}</b><span>referenze senza foto</span></div>` : ''}
    </div>
    <div class="vhead"><input class="search" id="invSearch" placeholder="Cerca serie, colore, formato, codice…" value="${esc(invQ)}" style="flex:1">
      <button class="btn" onclick="invMailAsk('${cid}')" title="Prepara una mail con i campioni di tutti gli espositori o di quelli che scegli"><svg class="ic"><use href="#i-mail"/></svg> Mail</button>
      <button class="btn" onclick="copyInventory('${cid}')"><svg class="ic"><use href="#i-clipboard"/></svg> Copia</button>
      <button class="btn dark" onclick="exportInventoryCSV('${cid}')"><svg class="ic"><use href="#i-download"/></svg> Excel (CSV)</button></div>
    <div class="card" style="overflow-x:auto"><table class="inv">
      <thead><tr><th></th><th>Serie / colore</th><th>Formato</th><th>Codici / finiture</th><th style="text-align:center">Pezzi</th><th>Dove si trova</th></tr></thead>
      <tbody>${body || `<tr><td colspan="6" class="empty-note">Nessun campione per "${esc(invQ)}".</td></tr>`}</tbody></table></div>`;
}
function invRows(cid) {
  return inventory(cid).map(r => [r.s.b, r.s.s, r.s.c, r.s.toz ? 'tozzetto' + tozFrom(r.s) : r.s.z, r.s.t.map(t => t + ' mm').join('/'), r.s.k.join(' / '), r.s.f.join(' / '), r.n,
    r.where.map(w => `${w.c.name} [${w.slot}]`).join('; ')]);
}
const INV_HEAD = ['Marca', 'Serie', 'Colore', 'Formato', 'Spessore', 'Codici', 'Finiture', 'Pezzi', 'Espositore [posto]'];
function copyInventory(cid) {
  const txt = [`Inventario campioni — ${clients[cid].name}`, '', INV_HEAD.join('\t'), ...invRows(cid).map(r => r.join('\t'))].join('\n');
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Inventario copiato: incollalo in Excel o in una mail'), () => showCopy('Copia l\'inventario:', txt));
}
/* ── Mail con i campioni: di tutti gli espositori o di quelli scelti; si controlla il testo e si apre nella mail ── */
document.head.insertAdjacentHTML('beforeend', `<style>
#invMail .im-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
#invMail .im-seg .btn { justify-content: center; }
#invMail .im-seg .btn.on { background: var(--red); border-color: var(--red); color: #fff; }
#invMail .im-list { display: flex; flex-direction: column; gap: 6px; max-height: 46vh; overflow: auto; }
#invMail .im-list label { display: flex; gap: 10px; align-items: center; border: 1px solid var(--border); border-radius: 10px; padding: 8px 10px; cursor: pointer; }
#invMail .im-list label:has(input:checked) { border-color: var(--red); background: #fff5f5; }
#invMail .im-list input { width: 18px; height: 18px; accent-color: var(--red); flex: none; }
#invMail .im-list small { color: var(--mid); }
#invMail .im-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
#invMail textarea { width: 100%; min-height: 42vh; font: 13px/1.45 var(--font-body); border: 1px solid var(--border); border-radius: 10px; padding: 10px; resize: vertical; box-sizing: border-box; }
#invMail input.subj { width: 100%; font: 600 14px var(--font-body); border: 1px solid var(--border); border-radius: 10px; padding: 9px 10px; box-sizing: border-box; }
</style>`);
function invMailAsk(cid) {
  const cc = visibleComps(cid).filter(c => DISP[c.disp] && c.slots.some(k => k && SAMPLE[k]));
  if (!cc.length) return toast('Nessun espositore con campioni');
  let m = document.getElementById('invMail'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="invMail" style="z-index:280"><div class="mbox" style="max-width:560px;width:calc(100vw - 32px)">
    <div class="mhead"><h3><svg class="ic"><use href="#i-mail"/></svg> Mail campioni · ${esc(clients[cid].name)}</h3></div>
    <div class="im-body" style="padding:6px 18px 18px;display:flex;flex-direction:column;gap:12px"></div></div></div>`);
  m = document.getElementById('invMail');
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  let mode = 'all';
  const sel = new Set();
  const step1 = () => {
    const b = m.querySelector('.im-body');
    b.innerHTML = `<div class="im-seg"><button class="btn${mode === 'all' ? ' on' : ''}" data-m="all">Tutti gli espositori</button><button class="btn${mode === 'sel' ? ' on' : ''}" data-m="sel">Scelgo io</button></div>
      ${mode === 'sel' ? `<div class="im-list">${cc.map(c => `<label><input type="checkbox" value="${c.id}"${sel.has(c.id) ? ' checked' : ''}><span><b>${esc(c.name)}</b><br><small>${esc(DISP[c.disp].name)} · ${filledOf(c)} campioni</small></span></label>`).join('')}</div>`
        : `<div style="color:var(--mid);font-size:13px">${cc.length} espositori · ${cc.reduce((n, c) => n + filledOf(c), 0)} campioni</div>`}
      <div class="im-row"><button class="btn" id="imNo">Annulla</button><button class="btn red" id="imGo"${mode === 'sel' && !sel.size ? ' disabled' : ''}><svg class="ic"><use href="#i-mail"/></svg> Crea la mail</button></div>`;
    b.querySelectorAll('[data-m]').forEach(x => x.onclick = () => { mode = x.dataset.m; step1(); });
    b.querySelectorAll('.im-list input').forEach(x => x.onchange = () => { if (x.checked) sel.add(x.value); else sel.delete(x.value); b.querySelector('#imGo').disabled = !sel.size; });
    b.querySelector('#imNo').onclick = () => m.remove();
    b.querySelector('#imGo').onclick = () => step2(mode === 'all' ? cc : cc.filter(c => sel.has(c.id)));
  };
  const step2 = list => {
    const { subject, body } = invMailText(cid, list), b = m.querySelector('.im-body');
    const open = list.reduce((n, c) => n + c.slots.filter(k => { const s = k && SAMPLE[k]; return s && !s.a4 && (s.f || []).length > 1; }).length, 0);
    b.innerHTML = `${open ? `<div style="background:#fff7e0;border:1px solid #f5d27a;border-radius:10px;padding:8px 10px;font-size:12.5px"><b>${open} ${open === 1 ? 'campione ha' : 'campioni hanno'} la finitura non scelta:</b> nella mail trovi le finiture e i codici possibili separati da «/». Puoi correggere qui sotto, oppure sceglierla in Sistema i campioni → Visualizza finitura.</div>` : ''}
      <input class="subj" value="${esc(subject)}"><textarea>${esc(body)}</textarea>
      <div class="im-row"><button class="btn" id="imBack"><svg class="ic"><use href="#i-left"/></svg> Indietro</button>
        <button class="btn" id="imCopy"><svg class="ic"><use href="#i-copy"/></svg> Copia</button>
        ${navigator.share ? `<button class="btn" id="imShare" title="Gmail, Outlook, WhatsApp…"><svg class="ic"><use href="#i-upload"/></svg> Condividi</button>` : ''}
        <button class="btn red" id="imOpen"><svg class="ic"><use href="#i-mail"/></svg> Apri nella mail</button></div>`;
    const subj = () => b.querySelector('.subj').value, txt = () => b.querySelector('textarea').value;
    b.querySelector('#imBack').onclick = step1;
    b.querySelector('#imCopy').onclick = () => {
      const all = subj() + '\n\n' + txt();
      (navigator.clipboard ? navigator.clipboard.writeText(all) : Promise.reject()).then(() => toast('Mail copiata: incollala dove vuoi'), () => showCopy('Copia la mail:', all));
    };
    const sh = b.querySelector('#imShare');
    if (sh) sh.onclick = () => navigator.share({ title: subj(), text: txt() }).catch(() => {});
    b.querySelector('#imOpen').onclick = () => { location.href = 'mailto:?subject=' + encodeURIComponent(subj()) + '&body=' + encodeURIComponent(txt().replace(/\r?\n/g, '\r\n')); };
  };
  step1();
}
/* testo della mail (come il modello d'ordine):
   "Ordinare i seguenti campioni per CLIENTE," poi per ogni espositore
   "Campioni per espositore girevole 120x120 (20 pezzi) (00000PLZ):" e una riga per campione, in ordine di posto:
   "MAPIERRE Blanc Noble Naturale R10 Rett. 120x120 - EM5J" */
function invMailText(cid, list) {
  const cl = clients[cid], x = t => String(t || '').replace(/×/g, 'x');
  const fin = s => s.a4 ? s.v : (FIN_VAR[s.key] ? FIN_VAR[s.key].map(v => v.f[0]) : s.f || []).join(' / ');   // finitura non scelta: le possibili (come i codici), separate da /
  // espositori dello stesso tipo (es. girevole 120×120 DX + SX) in un solo blocco, pezzi sommati
  const groups = new Map(), boxes = list.filter(c => DISP[c.disp].mode === 'box' && c.slots.some(Boolean));
  list.forEach(c => { if (DISP[c.disp].mode === 'box') return; const g = groups.get(c.disp) || groups.set(c.disp, []).get(c.disp); c.slots.forEach(k => { const s = k && SAMPLE[k]; if (s) g.push({ s, c }); }); });
  // box in posa: per ogni superficie il prodotto, i metri quadri e i pezzi (contati anche quelli tagliati)
  const boxParts = boxes.map(c => { const b = boxOf(c), d = DISP[c.disp]; return [`Materiale per ${/^box/i.test(c.name) ? x(c.name) : 'box in posa ' + x(c.name)} (${b.L}x${b.H} cm):`, ``,
    ...c.slots.map((k, i) => { const s = k && SAMPLE[k]; if (!s) return null; const [W, H] = boxSurf(c, i), l = boxLay(c, i), n = boxPieces(W, H, l.tw, l.th, l.off).length;
      return `${slotName(d, i, c.slots.length)}: ${s.nuovo ? '[NOVITÀ] ' : ''}${s.s} ${s.c}${fin(s) ? ' ' + fin(s) : ''} ${x(s.z)} - ${(s.k || []).join(' / ') || 'codice da definire'} · ${(W * H / 10000).toLocaleString('it-IT', { maximumFractionDigits: 2 })} m² (${n} ${n === 1 ? 'pezzo' : 'pezzi'})`; }).filter(Boolean)].join('\n'); });
  const parts = [...groups].map(([did, rows]) => {
    const d = DISP[did], nm = d.name.charAt(0).toLowerCase() + d.name.slice(1);
    const ord = new Map(); rows.forEach(r => { if (!ord.has(r.s.b + '|' + r.s.s)) ord.set(r.s.b + '|' + r.s.s, ord.size); });   // righe raggruppate per serie
    rows = rows.map((r, i) => [r, i]).sort((a, b) => ord.get(a[0].s.b + '|' + a[0].s.s) - ord.get(b[0].s.b + '|' + b[0].s.s) || a[1] - b[1]).map(a => a[0]);
    return [`Campioni per ${x(nm)} (${rows.length} ${rows.length === 1 ? 'pezzo' : 'pezzi'}) (${d.code}):`, ``,
      ...rows.map(({ s, c }) => `${s.nuovo ? '[NOVITÀ] ' : ''}${s.s} ${s.c}${fin(s) ? ' ' + fin(s) : ''} ${x(s.toz ? tozFmt(d, c) : s.z)} - ${(s.k || []).join(' / ') || 'codice da definire'}`)].join('\n');
  });
  return {
    subject: `Ordine campioni — ${cl.name}`,
    body: [`Ordinare i seguenti campioni per ${cl.name},`, ``, parts.concat(boxParts).join('\n\n')].join('\n')
  };
}
function exportInventoryCSV(cid) {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const csv = '﻿' + [INV_HEAD, ...invRows(cid)].map(r => r.map(q).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'inventario-' + clients[cid].name.replace(/[^\w\-]+/g, '_') + '-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

/* ── Sala mostra: lo showroom reale del cliente, da esplorare ── */
function showroomHTML(cid) {
  const s = clientShowroom(cid), cl = clients[cid];
  if (!s) {
    const others = clientScenes(cid);
    return `<div class="card" style="padding:22px">
      <h3 style="font-size:18px;margin-bottom:6px">Sala mostra di ${esc(cl.name)}</h3>
      <div style="font-size:14px;color:var(--mid);margin-bottom:14px">Ricrea lo showroom vero del cliente con i suoi espositori e i suoi campioni: poi potrai entrarci,
        cliccare un espositore e aprirlo (sfogliare i girevoli, aprire i cassetti, tirare fuori i tozzetti).</div>
      <button class="btn red" onclick="createShowroom('${cid}')"><svg class="ic"><use href="#i-plus"/></svg> Crea la sala mostra</button>
      ${others.length ? `<div style="margin-top:16px;font-size:13px;color:var(--mid)">Oppure usa un'ambientazione che hai già:
        ${others.map(o => `<button class="btn" style="margin:4px 4px 0 0" onclick="useAsShowroom('${cid}','${o.id}')">${esc(o.name)}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  const rooms = showRooms(cid), fill = r => r.items.reduce((n, it) => n + (comps[it.comp] ? filledOf(comps[it.comp]) : 0), 0);
  const tot = rooms.reduce((n, r) => n + fill(r), 0), nEsp = rooms.reduce((n, r) => n + r.items.length, 0);
  return `<div class="card" style="padding:22px">
    <h3 style="font-size:18px;margin-bottom:6px"><svg class="ic"><use href="#i-store"/></svg> Sala mostra di ${esc(cl.name)}</h3>
    <div class="stats" style="margin:10px 0 16px"><div><b>${rooms.length}</b>${rooms.length === 1 ? 'stanza' : 'stanze'}</div><div><b>${nEsp}</b>espositori</div><div><b>${tot}</b>campioni esposti</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn red" style="font-size:14px;padding:10px 16px" onclick="go('#/salamostra/${cid}')"><svg class="ic"><use href="#i-play"/></svg> Entra nella sala mostra</button>
      <button class="btn dark" style="font-size:14px;padding:10px 16px" onclick="go('#/g2/${cid}')"><svg class="ic"><use href="#i-sparkles"/></svg> Galleria+</button>
      <button class="btn" onclick="addShowRoom('${cid}')"><svg class="ic"><use href="#i-plus"/></svg> Aggiungi una stanza</button>
      <button class="btn" onclick="pasteShowroom('${cid}')" title="Incolla un elenco di codici e scegli in quali espositori della sala mostra metterli"><svg class="ic"><use href="#i-paste"/></svg> Incolla codici</button></div>
    <div class="roomlist">${rooms.map(r => `<div class="roomrow">
      <div class="info"><b>${esc(r.name)}</b><div class="meta">${r.items.length} espositori · ${fill(r)} campioni · ${r.w}×${r.d} cm</div></div>
      <button class="btn dark" onclick="go('#/salamostra/${cid}/${r.id}')"><svg class="ic"><use href="#i-play"/></svg> Entra</button>
      <button class="btn" onclick="go('#/ambiente/${r.id}')"><svg class="ic"><use href="#i-pencil"/></svg> Modifica</button>
      ${rooms.length > 1 ? `<button class="btn" title="Elimina questa stanza" onclick="delShowRoom('${r.id}')"><svg class="ic"><use href="#i-trash"/></svg></button>` : ''}</div>`).join('')}</div>
  </div>`;
}
/* incolla codici negli espositori della sala mostra (tutte le stanze, da sinistra a destra) */
function pasteShowroom(cid) {
  const seen = new Set(), list = [];
  showRooms(cid).forEach(r => r.items.slice().sort((a, b) => a.x - b.x).forEach(it => { const c = comps[it.comp]; if (c && !seen.has(c.id)) { seen.add(c.id); list.push(c); } }));
  pasteIntoComps(list, null, () => renderClient(cid));
}
/* nuova stanza della sala mostra (si apre subito per mettere gli espositori) */
function addShowRoom(cid) {
  const rooms = showRooms(cid), n = rooms.length + 1;
  const s = { id: uid(), client: cid, name: 'Stanza ' + n, showroom: true, order: n - 1, created: Date.now(), w: 600, d: 420, h: 300, wallL: true, wallR: false, grid: true, swingFront: true, items: [], upd: Date.now() };
  rooms.forEach((r, i) => { if (r.order == null) r.order = i; });
  scenes[s.id] = s; if (!clients[cid].showroom) clients[cid].showroom = s.id;
  saveScenes(); saveClients(); go('#/ambiente/' + s.id); toast(`${s.name} creata: metti gli espositori, poi "Vedi sala mostra"`);
}
async function delShowRoom(sid) {
  const s = scenes[sid]; if (!s) return;
  if (!await ask(`Eliminare la stanza "${s.name}" della sala mostra?\n\nGli espositori e i loro campioni restano nel cliente: si toglie solo la stanza.`, { ok: 'Elimina' })) return;
  const cid = s.client; delete scenes[sid];
  if (clients[cid] && clients[cid].showroom === sid) { const r = showRooms(cid)[0]; clients[cid].showroom = r ? r.id : ''; saveClients(); }
  saveScenes(); renderClient(cid); toast('Stanza eliminata');
}
function createShowroom(cid) {
  const s = { id: uid(), client: cid, name: 'Sala mostra', showroom: true, order: 0, created: Date.now(), w: 600, d: 420, h: 300, wallL: true, wallR: false, grid: true, swingFront: true, items: [], upd: Date.now() };
  scenes[s.id] = s; clients[cid].showroom = s.id; saveScenes(); saveClients(); go('#/ambiente/' + s.id);
}
function useAsShowroom(cid, sid) {
  const s = scenes[sid]; if (!s) return;
  s.showroom = true; s.upd = Date.now(); clients[cid].showroom = sid; saveScenes(); saveClients(); renderClient(cid);
  toast(`"${s.name}" ora è la sala mostra`);
}

/* ── Ambientazioni del cliente ── */
function scenesHTML(cid, sc) {
  return `<div class="vhead"><h2 style="font-size:17px">Ambientazioni</h2>
      <button class="btn red" onclick="newScene('${cid}')"><svg class="ic"><use href="#i-plus"/></svg> Nuova ambientazione</button></div>
    ${sc.length ? `<div class="cgrid">${sc.map(s => `<div class="card ccard" onclick="go('#/ambiente/${s.id}')">
        <h3>${esc(s.name)}</h3><div class="sub">Stanza ${s.w}×${s.d} cm · aggiornata ${dateIt(s.upd)}</div>
        <div class="stats"><div><b>${s.items.length}</b>espositori</div></div>
        <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
          <button class="btn" onclick="dupScene('${s.id}')"><svg class="ic"><use href="#i-copy"/></svg> Duplica</button>
          <button class="btn" onclick="delScene('${s.id}')"><svg class="ic"><use href="#i-trash"/></svg></button></div></div>`).join('')}</div>`
      : `<div class="card empty-note">Crea un'ambientazione: una stanza con muro bianco e pavimento dove sistemare gli espositori per mostrare al cliente come verrà lo showroom.</div>`}`;
}
function newScene(cid) {
  const n = clientScenes(cid).length + 1;
  const s = { id: uid(), client: cid, name: 'Ambientazione ' + n, w: 600, d: 420, h: 300, wallL: true, wallR: false, grid: true, items: [], upd: Date.now() };
  scenes[s.id] = s; saveScenes(); go('#/ambiente/' + s.id);
}
function dupScene(id) {
  const s = scenes[id]; const x = JSON.parse(JSON.stringify(s)); x.id = uid(); x.name += ' (copia)'; x.upd = Date.now();
  x.items.forEach(it => it.id = uid()); scenes[x.id] = x; saveScenes(); renderClient(s.client);
}
async function delScene(id) {
  const s = scenes[id]; if (!await ask(`Eliminare l'ambientazione "${s.name}"?`)) return;
  delete scenes[id]; saveScenes(); renderClient(s.client);
}

/* Tozzetti: i vecchi tozzetti "ricavati" nelle teche, mensole e cassettiere passano al tozzetto A4 ufficiale dello stesso colore
   (prima Naturale e spessore normale; nel banco 6,5 mm quello da 6,5). Se il colore non ha un tozzetto A4 resta com'era. */
function migrateA4() {
  if (typeof TOZ_A4 === 'undefined' || !TOZ_A4.length) return;
  let n = 0, miss = 0;
  Object.values(comps).forEach(c => {
    const d = DISP[c.disp]; if (c.a4 || !d || !c.slots || !usesA4(d, c)) return;
    const thin = (d.accept.thick || []).includes('6,5');
    c.slots = c.slots.map(k => {
      const s = k && SAMPLE[k]; if (!s || !s.toz || s.a4) return k;
      const same = TOZ_A4.filter(x => x.b === s.b && x.s === s.s && x.c === s.c && x.st !== 'OBSOLETO');
      const rank = x => (thin ? (x.t[0] === '6,5' ? 0 : 5) : (x.t[0] === '6,5' ? 5 : 0)) + (/^Naturale/.test(x.v) ? 0 : 1) + (/Plus/.test(x.v) ? 0.5 : 0);
      const best = same.sort((a, b) => rank(a) - rank(b))[0];
      if (best) { n++; return best.key; }
      miss++; return k;
    });
    c.a4 = 1; c.upd = Date.now();
  });
  if (n || miss) { saveComps(); toast(`Tozzetti aggiornati ai codici A4 ufficiali: ${n}` + (miss ? ` · ${miss} senza tozzetto A4 (restano com'erano)` : '')); }
}

/* ════ CODICI PER FORMATO (per ordinare): tutti i campioni degli espositori scelti, divisi per formato,
   con codice, serie, colore, finitura, pezzi ed espositori. Copia (tutto o un formato) ed Excel. ════ */
let cfSel = null;
function cfComps(cid) { return visibleComps(cid).filter(c => c.slots.some(k => k && SAMPLE[k])); }
function cfData(cid) {
  const list = cfComps(cid).filter(c => !cfSel || cfSel.has(c.id)), groups = new Map();
  list.forEach(c => c.slots.forEach(k => {
    const s = k && SAMPLE[k]; if (!s) return;
    const fz = s.toz ? 'Tozzetti 19,5×29,5' : fmt(s.z), g = groups.get(fz) || groups.set(fz, new Map()).get(fz);
    const multi = (s.k || []).length > 1 && !s.a4;
    const fin = s.a4 ? s.v : (s.f || []).map(f => f.replace(/\s*Rett\.?$/, '')).join(' / ');
    const rk = s.key, r = g.get(rk) || { code: (s.k || []).join(' / '), s: glTitle(s.s), c: glTitle(s.c), b: s.b, fin: multi ? 'finitura da scegliere: ' + fin : fin, n: 0, where: new Set(), multi };
    r.n++; r.where.add(c.name); g.set(rk, r);
  }));
  const area = z => { const p = parseSize(z.replace('×', 'x')); return p ? p[0] * p[1] : 0; };
  return [...groups.entries()].sort((a, b) => (a[0].startsWith('Tozzetti') ? 1 : 0) - (b[0].startsWith('Tozzetti') ? 1 : 0) || area(a[0]) - area(b[0]))
    .map(([z, m]) => ({ z, rows: [...m.values()].sort((a, b) => a.b.localeCompare(b.b) || a.s.localeCompare(b.s) || a.c.localeCompare(b.c)) }));
}
function openCodesByFormat(cid) {
  cfSel = null;
  let m = document.getElementById('cfDlg'); if (m) m.remove();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal open" id="cfDlg" style="z-index:270"><div class="mbox" style="max-width:860px;width:calc(100vw - 24px);max-height:calc(100vh - 24px);display:flex;flex-direction:column">
    <div class="mhead"><h3><svg class="ic"><use href="#i-clipboard"/></svg> Codici per formato · ${esc(clients[cid].name)}</h3>
      <button class="btn" onclick="cfCopy('${cid}')"><svg class="ic"><use href="#i-copy"/></svg> Copia tutto</button>
      <button class="btn" onclick="cfCSV('${cid}')"><svg class="ic"><use href="#i-download"/></svg> Excel</button>
      <button class="btn dark" onclick="document.getElementById('cfDlg').remove()">Chiudi</button></div>
    <div id="cfBody" style="overflow:auto;padding:12px 18px 18px"></div></div></div>`);
  m = document.getElementById('cfDlg'); m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  cfRender(cid);
}
function cfRender(cid) {
  const all = cfComps(cid), data = cfData(cid), tot = data.reduce((n, g) => n + g.rows.reduce((a, r) => a + r.n, 0), 0);
  document.getElementById('cfBody').innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <span style="font-size:12px;font-weight:700;color:var(--mid);margin-right:4px">ESPOSITORI</span>
      <button class="g2-chip ${!cfSel ? 'on' : ''}" onclick="cfSel = null; cfRender('${cid}')">Tutti</button>
      ${all.map(c => `<button class="g2-chip ${cfSel && cfSel.has(c.id) ? 'on' : ''}" onclick="cfToggle('${cid}','${c.id}')">${esc(c.name)}</button>`).join('')}</div>
    <div style="font-size:13px;color:var(--mid);margin-bottom:10px"><b style="color:#1d1d20">${tot}</b> pezzi in <b style="color:#1d1d20">${data.length}</b> formati</div>
    ${data.map((g, gi) => `<div style="margin-bottom:18px">
      <div style="display:flex;align-items:center;gap:10px;border-bottom:2px solid #1d1d20;padding-bottom:4px;margin-bottom:6px">
        <b style="font:700 16px var(--font-display);flex:1">${esc(g.z)}</b><span style="font-size:12px;color:var(--mid)">${g.rows.reduce((a, r) => a + r.n, 0)} pezzi · ${g.rows.length} codici</span>
        <button class="btn" onclick="cfCopy('${cid}', ${gi})"><svg class="ic"><use href="#i-copy"/></svg> Copia ${esc(g.z)}</button></div>
      <table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <tr style="color:var(--mid);text-align:left"><th style="padding:4px 6px">Codice</th><th style="padding:4px 6px">Serie · colore</th><th style="padding:4px 6px">Finitura</th><th style="padding:4px 6px;text-align:right">Pezzi</th><th style="padding:4px 6px">Espositori</th></tr>
        ${g.rows.map(r => `<tr style="border-top:1px solid #eee"><td style="padding:5px 6px;font-weight:700;white-space:nowrap">${esc(r.code)}</td>
          <td style="padding:5px 6px">${esc(r.s)} <b>${esc(r.c)}</b><br><small style="color:var(--mid)">${esc(r.b)}</small></td>
          <td style="padding:5px 6px;${r.multi ? 'color:#b07400' : ''}">${esc(r.fin)}</td><td style="padding:5px 6px;text-align:right;font-weight:700">${r.n}</td>
          <td style="padding:5px 6px;color:var(--mid);font-size:11.5px">${esc([...r.where].join(', '))}</td></tr>`).join('')}
      </table></div>`).join('') || '<div class="empty-note">Nessun campione negli espositori scelti.</div>'}`;
}
function cfToggle(cid, id) {
  const all = cfComps(cid).map(c => c.id); if (!cfSel) cfSel = new Set();
  if (cfSel.has(id)) cfSel.delete(id); else cfSel.add(id);
  if (!cfSel.size || cfSel.size === all.length) cfSel = null;
  cfRender(cid);
}
function cfText(cid, gi) {
  const data = cfData(cid), pick = gi == null ? data : [data[gi]];
  return [`Codici per formato — ${clients[cid].name}`, ''].concat(pick.flatMap(g => [`${g.z} (${g.rows.reduce((a, r) => a + r.n, 0)} pezzi)`,
    ...g.rows.map(r => `${r.code}\t${r.s} ${r.c}\t${r.fin}\t${r.n} pz`), ''])).join('\n');
}
async function cfCopy(cid, gi) {
  const txt = cfText(cid, gi);
  try { await navigator.clipboard.writeText(txt); toast(gi == null ? 'Codici copiati' : 'Codici del formato copiati'); }
  catch (e) { ask('Copia il testo:', { text: txt, readOnly: true, alert: true }); }
}
function cfCSV(cid) {
  const q = v => '"' + String(v).replace(/"/g, '""') + '"';
  const rows = [['Formato', 'Codice', 'Marca', 'Serie', 'Colore', 'Finitura', 'Pezzi', 'Espositori']];
  cfData(cid).forEach(g => g.rows.forEach(r => rows.push([g.z, r.code, r.b, r.s, r.c, r.fin, r.n, [...r.where].join(', ')])));
  const csv = '﻿' + rows.map(r => r.map(q).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'codici-per-formato-' + clients[cid].name.replace(/[^\w\-]+/g, '_') + '-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
