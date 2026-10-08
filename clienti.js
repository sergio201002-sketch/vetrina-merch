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
  // espositori che hanno più posti di prima (es. cassettiera 60×120 da 18 a 21 cassetti): le composizioni salvate si allungano
  Object.values(comps).forEach(c => { const d = DISP[c.disp]; if (d && !d.variants && c.slots && c.slots.length < d.slots) while (c.slots.length < d.slots) c.slots.push(null); });
}
function route() {
  fixSampleAlias();
  document.body.classList.remove('showlist');                       // lista espositori a tutto schermo (telefono) chiusa cambiando pagina
  window.scrollTo(0, 0);
  const [, a, id, sub] = (location.hash || '#/').split('/');
  if (a === 'cliente' && clients[id]) { document.body.dataset.view = 'client'; renderClient(id); return; }
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
      <button class="btn red" onclick="homeNew=true; renderHome(); document.getElementById('nc_name').focus()">＋ Nuovo cliente</button>
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
      ${!list.length && !q ? `<div class="card ccard newcard" onclick="homeNew=true; renderHome(); document.getElementById('nc_name').focus()">＋ Crea il primo cliente</div>` : ''}
    </div>
    ${!list.length && q ? `<div class="empty-note">Nessun cliente trovato per "${esc(homeQ)}".</div>` : ''}
    <div class="vhead" style="margin-top:28px"><h2 style="font-size:18px">Strumenti</h2></div>
    <div class="cgrid">
      <div class="card ccard" onclick="openFreeCatalog()"><h3>🗂 Catalogo espositori</h3>
        <div class="sub">Prova gli espositori senza cliente${free ? ` · ${free} composizioni libere` : ''}</div></div>
      <div class="card ccard" onclick="openVersions()"><h3>🕘 Versioni salvate</h3>
        <div class="sub">Tutto si salva da solo su disco. Qui puoi tornare a una versione precedente.</div></div>
      <div class="card ccard" onclick="openImages()"><h3>📷 Foto campioni</h3>
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
      <button class="btn" onclick="go('#/')">← Clienti</button>
      <h2>${esc(cl.name)}</h2>
      <button class="btn" onclick="deleteClient('${cid}')" title="Elimina cliente">🗑 Elimina</button>
    </div>
    <div class="card"><div class="form">
      <label>Nome cliente<input value="${esc(cl.name)}" oninput="updClient('${cid}','name',this.value)"></label>
      <label>Città<input value="${esc(cl.city || '')}" oninput="updClient('${cid}','city',this.value)"></label>
      <label>Referente<input value="${esc(cl.contact || '')}" oninput="updClient('${cid}','contact',this.value)"></label>
      <label>Telefono<input value="${esc(cl.phone || '')}" oninput="updClient('${cid}','phone',this.value)"></label>
      <label class="full">Note<textarea oninput="updClient('${cid}','note',this.value)" placeholder="Note sul cliente, sullo showroom, sugli spazi…">${esc(cl.note || '')}</textarea></label>
    </div></div>
    <div class="ctabs">
      <button class="${clientTab === 'show' ? 'on' : ''}" onclick="clientTab='show'; renderClient('${cid}')">🏬 Sala mostra</button>
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
      <button class="btn red" onclick="addingDisp=!addingDisp; renderClient('${cid}')">${addingDisp ? 'Chiudi' : '＋ Aggiungi espositore'}</button></div>
    ${addingDisp ? `<div class="card" style="margin-bottom:12px">${dispPickerHTML(`addCompTo('${cid}', '%ID%')`)}</div>` : ''}
    ${cc.length ? `<div style="display:flex;flex-direction:column;gap:8px">${cc.map(c => compCardHTML(c, cid)).join('')}</div>`
      : `<div class="card empty-note">Nessun espositore per questo cliente.<br>Premi <b>＋ Aggiungi espositore</b> e scegli quello che ha (o che gli proponi), poi inserisci i campioni.</div>`}
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
      <button class="btn" onclick="renameCompUI('${c.id}','${cid}')" title="Rinomina">✎</button>
      <button class="btn" onclick="dupCompFor('${c.id}','${cid}')" title="Duplica">⧉</button>
      <button class="btn" onclick="delCompFor('${c.id}','${cid}')" title="Elimina">🗑</button></div></div>`;
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
      <button class="btn" onclick="copyInventory('${cid}')">📋 Copia</button>
      <button class="btn dark" onclick="exportInventoryCSV('${cid}')">⬇ Excel (CSV)</button></div>
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
      <button class="btn red" onclick="createShowroom('${cid}')">＋ Crea la sala mostra</button>
      ${others.length ? `<div style="margin-top:16px;font-size:13px;color:var(--mid)">Oppure usa un'ambientazione che hai già:
        ${others.map(o => `<button class="btn" style="margin:4px 4px 0 0" onclick="useAsShowroom('${cid}','${o.id}')">${esc(o.name)}</button>`).join('')}</div>` : ''}
    </div>`;
  }
  const rooms = showRooms(cid), fill = r => r.items.reduce((n, it) => n + (comps[it.comp] ? filledOf(comps[it.comp]) : 0), 0);
  const tot = rooms.reduce((n, r) => n + fill(r), 0), nEsp = rooms.reduce((n, r) => n + r.items.length, 0);
  return `<div class="card" style="padding:22px">
    <h3 style="font-size:18px;margin-bottom:6px">🏬 Sala mostra di ${esc(cl.name)}</h3>
    <div class="stats" style="margin:10px 0 16px"><div><b>${rooms.length}</b>${rooms.length === 1 ? 'stanza' : 'stanze'}</div><div><b>${nEsp}</b>espositori</div><div><b>${tot}</b>campioni esposti</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
      <button class="btn red" style="font-size:14px;padding:10px 16px" onclick="go('#/salamostra/${cid}')">▶ Entra nella sala mostra</button>
      <button class="btn" onclick="addShowRoom('${cid}')">＋ Aggiungi una stanza</button></div>
    <div class="roomlist">${rooms.map(r => `<div class="roomrow">
      <div class="info"><b>${esc(r.name)}</b><div class="meta">${r.items.length} espositori · ${fill(r)} campioni · ${r.w}×${r.d} cm</div></div>
      <button class="btn dark" onclick="go('#/salamostra/${cid}/${r.id}')">▶ Entra</button>
      <button class="btn" onclick="go('#/ambiente/${r.id}')">✎ Modifica</button>
      ${rooms.length > 1 ? `<button class="btn" title="Elimina questa stanza" onclick="delShowRoom('${r.id}')">🗑</button>` : ''}</div>`).join('')}</div>
  </div>`;
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
      <button class="btn red" onclick="newScene('${cid}')">＋ Nuova ambientazione</button></div>
    ${sc.length ? `<div class="cgrid">${sc.map(s => `<div class="card ccard" onclick="go('#/ambiente/${s.id}')">
        <h3>${esc(s.name)}</h3><div class="sub">Stanza ${s.w}×${s.d} cm · aggiornata ${dateIt(s.upd)}</div>
        <div class="stats"><div><b>${s.items.length}</b>espositori</div></div>
        <div style="display:flex;gap:6px" onclick="event.stopPropagation()">
          <button class="btn" onclick="dupScene('${s.id}')">⧉ Duplica</button>
          <button class="btn" onclick="delScene('${s.id}')">🗑</button></div></div>`).join('')}</div>`
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
