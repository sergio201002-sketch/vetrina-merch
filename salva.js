'use strict';
/* ════════════════════════════════════════════════════════════
   SALVATAGGIO — due modi, scelti da soli all'avvio:
   • sul PC (AVVIA VETRINA.bat): ogni modifica viene scritta da server.py in dati/vetrina.json,
     versioni precedenti in dati/backup/;
   • online sul sito (GitHub Pages): si accede con Google e ogni modifica va su Firebase (Firestore),
     uguale su PC e telefono; versioni precedenti nella raccolta "backup"; foto caricate nella raccolta "foto";
   • online come pagina su claude.ai: stesso schema, nel database della pagina.
   Il browser tiene solo una copia di lavoro. Senza nessuno dei due, l'indicatore in alto lo dice.
   ════════════════════════════════════════════════════════════ */
const PARTS = ['clients', 'comps', 'scenes', 'current'];
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyChf_3YvySt6Y01j8xY9gP_hRPQRBjRt3k',
  authDomain: 'vetrina-merch.firebaseapp.com',
  projectId: 'vetrina-merch',
  storageBucket: 'vetrina-merch.firebasestorage.app',
  messagingSenderId: '705335581673',
  appId: '1:705335581673:web:d37dbdf0b15d48114d8978',
};
const FB_V = '10.13.2', FB_URL = m => `https://www.gstatic.com/firebasejs/${FB_V}/firebase-${m}.js`;
/* Firestore con le stesse chiamate del database della pagina claude.ai (doc/collection/get/set/delete/onSnapshot):
   i dati stanno sotto vetrine/<id Google>/… e solo quell'account li legge e scrive (regole Firestore) */
function fireStore(F, fdb, uid) {
  const ref = p => F.doc(fdb, 'vetrine', uid, ...p.split('/'));
  const wrap = sn => ({ id: sn.id, exists: sn.exists(), data: () => sn.data(), metadata: sn.metadata });
  const store = {
    doc: p => ({ get: async () => wrap(await F.getDoc(ref(p))), set: d => F.setDoc(ref(p), d), delete: () => F.deleteDoc(ref(p)),
                 onSnapshot: (cb, err) => F.onSnapshot(ref(p), sn => cb(wrap(sn)), err) }),
    collection: c => ({ get: async () => ({ docs: (await F.getDocs(F.collection(fdb, 'vetrine', uid, c))).docs.map(wrap) }), doc: id => store.doc(c + '/' + id) }),
  };
  return store;
}
const fotoDocId = ik => 'foto/' + encodeURIComponent(ik).replace(/\./g, '%2E');
const AUTO_BACKUP_MS = 10 * 60 * 1000, KEEP_BACKUPS = 120;

const Sync = {
  mode: null,              // 'disk' | 'cloud' | null (solo nel browser)
  provider: null,          // con mode 'cloud': 'fire' = Firebase (sito), 'claude' = pagina claude.ai
  fb: null, user: null, needLogin: false,
  online: false, pending: false, busy: false, again: false, error: false, timer: null, lastSaved: null,
  db: null, assets: null, sent: {}, lastBackup: 0, lastCounts: null, fotoMap: {},

  snapshot() { return { app: 'vetrina-merch', v: 3, clients, comps, scenes, current }; },
  counts(d) { return { clients: Object.keys(d.clients || {}).length, comps: Object.keys(d.comps || {}).length, scenes: Object.keys(d.scenes || {}).length }; },

  /* all'avvio: i dati salvati (disco o online) sono quelli buoni; la prima volta ci porta quelli del browser */
  async init() {
    if (window.claude && typeof window.claude.use === 'function') return this.initCloud();
    let d;
    try {
      const r = await fetch('/api/data', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      d = await r.json(); this.online = true; this.mode = 'disk';
    } catch (e) { return this.initFire(); }               // niente server del PC: sito online con Firebase
    const hasDisk = d && d.app === 'vetrina-merch' && d.comps;
    this.adopt(hasDisk ? d : null, 'vm_disk_v1');
    this.lastSaved = hasDisk ? d.saved : null;
    this.badge();
  },
  /* unisce: alla prima connessione di questo browser porta anche quello che c'è solo qui (niente va perso) */
  adopt(d, flag) {
    if (d) {
      if (!localStorage.getItem(flag)) {
        const add = (dst, src) => Object.keys(src || {}).forEach(k => { if (!dst[k] || (src[k].upd || 0) > (dst[k].upd || 0)) dst[k] = src[k]; });
        add(d.clients = d.clients || {}, clients); add(d.comps = d.comps || {}, comps); add(d.scenes = d.scenes || {}, scenes);
        d.current = Object.assign({}, current, d.current || {});
        this.apply(d); this.dirty();
      } else this.apply(d);
    } else this.dirty();                      // ancora vuoto: ci salva i dati del browser
    try { localStorage.setItem(flag, '1'); } catch (e) {}
  },
  apply(d) {
    clients = d.clients || {}; comps = d.comps || {}; scenes = d.scenes || {}; current = d.current || {};
    LS.set('vm_clients_v1', clients); LS.set('vm_comps_v1', comps); LS.set('vm_scenes_v1', scenes); LS.set('vm_current_v1', current);
  },
  dirty() {
    this.pending = true; this.badge();
    clearTimeout(this.timer); this.timer = setTimeout(() => this.saveNow(), 600);
  },
  async saveNow() {
    if (!this.online) { this.badge(); return; }
    if (this.busy) { this.again = true; return; }
    this.busy = true; this.pending = false;
    try {
      if (this.mode === 'cloud') await this.saveCloud();
      else {
        const r = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.snapshot()) });
        const j = await r.json(); if (!j.ok) throw new Error(j.error || 'errore');
        this.lastSaved = j.saved;
      }
      this.error = false;
    } catch (e) { console.warn('Salvataggio non riuscito', e); this.error = true; this.pending = true; setTimeout(() => this.saveNow(), 4000); }   // riprova da solo
    this.busy = false;
    if (this.again) { this.again = false; this.saveNow(); }
    this.badge();
  },
  /* se un'altra finestra ha salvato qualcosa di più nuovo, lo ricarica (solo se qui non ci sono modifiche in corso) */
  async refreshIfNewer() {
    if (!this.online || this.pending || this.busy) return;
    if (this.mode === 'cloud') return this.pullCloud();
    try {
      const m = await (await fetch('/api/meta', { cache: 'no-store' })).json();
      if (m.saved && m.saved !== this.lastSaved) {
        const d = await (await fetch('/api/data', { cache: 'no-store' })).json();
        this.apply(d); this.lastSaved = d.saved; route();
      }
    } catch (e) {}
  },

  /* ── online: database della pagina ── */
  async initCloud() {
    let db = null;
    try { db = await window.claude.use('db'); } catch (e) {}
    if (!db) { this.online = false; this.badge(); return; }
    this.db = db; this.provider = 'claude';
    try { this.assets = await window.claude.use('assets'); } catch (e) {}
    return this.loadCloud('vm_cloud_v1');
  },
  /* ── online sul sito: Firebase, con accesso Google ── */
  async initFire() {
    this.provider = 'fire';
    try {
      const [App, A, F] = await Promise.all([import(FB_URL('app')), import(FB_URL('auth')), import(FB_URL('firestore'))]);
      const app = App.initializeApp(FIREBASE_CONFIG);
      let fdb;
      try { fdb = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) }); }
      catch (e) { fdb = F.getFirestore(app); }
      this.fb = { A, F, auth: A.getAuth(app), fdb };
    } catch (e) { console.warn('Firebase non raggiungibile', e); this.online = false; this.badge(); return; }
    const { A, auth } = this.fb;
    try { await A.getRedirectResult(auth); } catch (e) {}
    const user = await new Promise(res => { const un = A.onAuthStateChanged(auth, u => { un(); res(u); }); });
    if (!user) { this.needLogin = true; this.badge(); return; }   // finché non accedi, i dati restano in questo browser
    await this.startFire(user);
  },
  async startFire(user) {
    this.user = user; this.needLogin = false;
    this.db = fireStore(this.fb.F, this.fb.fdb, user.uid);
    await this.loadCloud('vm_fire_v1_' + user.uid);
  },
  async login() {
    if (!this.fb) { toast('Collegamento a Firebase non riuscito: controlla la connessione e ricarica'); return; }
    const { A, auth } = this.fb, prov = new A.GoogleAuthProvider();
    prov.setCustomParameters({ prompt: 'select_account' });
    try {
      const r = await A.signInWithPopup(auth, prov);
      await this.startFire(r.user);
      if (typeof loadImages === 'function') await loadImages();
      route(); toast('Accesso fatto: ' + (r.user.email || ''));
    } catch (e) {
      // telefono: se la finestra di Google non si può aprire, si va alla pagina di Google e poi si torna qui
      if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) await A.signInWithRedirect(auth, prov);
      else if (e.code !== 'auth/popup-closed-by-user') say('Accesso non riuscito: ' + (e.message || e.code));
    }
  },
  async logout() {
    if (!this.fb) return;
    if (this.pending) await this.saveNow();
    await this.fb.A.signOut(this.fb.auth); location.reload();
  },
  badgeClick() { if (this.needLogin) this.login(); else openVersions(); },
  async loadCloud(flag) {
    let d = null, meta = null;
    try {
      meta = await this.read('stato/meta');
      if (meta) { d = { app: 'vetrina-merch' }; for (const k of PARTS) d[k] = (await this.read('stato/' + k) || {}).v || {}; }
      if (this.provider === 'claude') this.fotoMap = (await this.read('stato/foto') || {}).v || {};
    } catch (e) {
      console.warn('Database non raggiungibile', e); this.online = false; this.badge();
      if (this.provider === 'fire') say('Non riesco a leggere i dati online (' + (e.code || e.message) + '). Controlla le regole di Firestore.');
      return;
    }
    this.online = true; this.mode = 'cloud';
    const db = this.db;
    if (d) PARTS.forEach(k => { this.sent[k] = JSON.stringify(d[k]); });
    this.lastSaved = meta ? meta.saved : null;
    this.lastCounts = d ? this.counts(d) : null;
    this.lastBackup = Date.now();
    this.adopt(d, flag);
    // modifiche fatte da un altro dispositivo: arrivano da sole
    db.doc('stato/meta').onSnapshot(s => {
      const m = s.exists ? s.data() : null;
      if (m && m.saved && m.saved !== this.lastSaved && !s.metadata.hasPendingWrites) this.pullCloud();
    }, () => {});
    this.badge();
  },
  async read(path) { const s = await this.db.doc(path).get(); return s.exists ? s.data() : null; },
  async pullCloud() {
    if (this.pending || this.busy) return;
    try {
      const meta = await this.read('stato/meta'); if (!meta || meta.saved === this.lastSaved) return;
      const d = {}; for (const k of PARTS) d[k] = (await this.read('stato/' + k) || {}).v || {};
      if (this.pending || this.busy) return;               // nel frattempo si è modificato qualcosa qui: vince il salvataggio di qui
      PARTS.forEach(k => { this.sent[k] = JSON.stringify(d[k]); });
      this.apply(d); this.lastSaved = meta.saved; this.lastCounts = this.counts(d); this.badge(); route();
    } catch (e) {}
  },
  async saveCloud() {
    const snap = this.snapshot(), now = this.counts(snap), was = this.lastCounts;
    const fewer = was && (now.clients < was.clients || now.comps < was.comps || now.scenes < was.scenes);
    if (fewer) await this.backup('prima-di-eliminare', this.lastData || null);
    else if (Date.now() - this.lastBackup > AUTO_BACKUP_MS) await this.backup('auto', snap);
    for (const k of PARTS) {
      const txt = JSON.stringify(snap[k]);
      if (txt === this.sent[k]) continue;
      if (txt.length > (this.provider === 'fire' ? 900000 : 240000)) throw new Error('Troppi dati in ' + k);
      await this.db.doc('stato/' + k).set({ v: snap[k] });
      this.sent[k] = txt;
    }
    const saved = new Date().toISOString();
    await this.db.doc('stato/meta').set({ saved, counts: now });
    this.lastSaved = saved; this.lastCounts = now;
    this.lastData = JSON.parse(JSON.stringify(snap));
  },
  /* copia di sicurezza: una ogni 10 minuti di lavoro e sempre prima di un'eliminazione */
  async backup(why, data) {
    if (!data) {   // prima di un'eliminazione: la situazione com'era prima, quella ancora salvata online
      data = { app: 'vetrina-merch' };
      for (const k of PARTS) data[k] = (await this.read('stato/' + k) || {}).v || {};
    }
    const t = new Date(), p = n => String(n).padStart(2, '0');
    const id = `${t.getFullYear()}${p(t.getMonth() + 1)}${p(t.getDate())}-${p(t.getHours())}${p(t.getMinutes())}${p(t.getSeconds())}-${why}`;
    const body = { why, when: t.toISOString(), counts: this.counts(data) };
    PARTS.forEach(k => { body[k] = data[k] || {}; });
    await this.db.collection('backup').doc(id).set(body);
    this.lastBackup = Date.now();
    try {   // tiene le ultime KEEP_BACKUPS
      const all = (await this.db.collection('backup').get()).docs.map(d => d.id).sort();
      for (const old of all.slice(0, Math.max(0, all.length - KEEP_BACKUPS))) await this.db.collection('backup').doc(old).delete();
    } catch (e) {}
  },
  async download(filename, blob) {
    if (this.provider === 'fire') { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); return; }
    let dl = null; try { dl = await window.claude.use('downloads'); } catch (e) {}
    if (!dl) { toast('Il salvataggio del file non è disponibile qui'); return; }
    try { await dl.save({ filename, data: blob }); } catch (e) { if (e && e.code !== 'cancelled') toast('File non salvato'); }
  },

  badge() {
    const el = document.getElementById('saveBadge'); if (!el) return;
    const where = this.mode === 'cloud' ? 'online' + (this.user && this.user.email ? ' (' + this.user.email + ')' : '') : 'su disco';
    let txt, cls, tip;
    if (this.connecting && !this.online && !this.needLogin) { txt = '… Collegamento'; cls = 'busy'; tip = 'Collegamento al salvataggio in corso'; }
    else if (this.needLogin) { txt = '🔑 Accedi con Google'; cls = 'warn'; tip = 'Accedi per salvare tutto online, uguale su PC e telefono'; }
    else if (!this.online) {
      txt = '⚠ Solo nel browser'; cls = 'warn';
      tip = window.claude ? 'Il database della pagina non risponde: le modifiche restano in questo browser' : 'Apri la vetrina con "AVVIA VETRINA.bat" per salvare tutto su disco';
    }
    else if (this.error) { txt = '⚠ Non salvato, riprovo…'; cls = 'warn'; tip = 'Il salvataggio non risponde: le modifiche restano nel browser e vengono salvate appena possibile'; }
    else if (this.pending || this.busy) { txt = '… Salvataggio'; cls = 'busy'; tip = ''; }
    else { txt = '✓ Salvato'; cls = 'ok'; tip = 'Tutto salvato ' + where + (this.lastSaved ? ' · ' + new Date(this.lastSaved).toLocaleString('it-IT') : ''); }
    el.textContent = txt; el.className = 'savebadge ' + cls; el.title = tip; el.dataset.i = Array.from(txt)[0];
  },
};
window.Sync = Sync;
/* chiudendo la pagina con modifiche non ancora scritte: le manda subito */
window.addEventListener('beforeunload', () => {
  if (Sync.mode === 'disk' && Sync.online && (Sync.pending || Sync.busy)) navigator.sendBeacon('/api/data', new Blob([JSON.stringify(Sync.snapshot())], { type: 'application/json' }));
  else if (Sync.mode === 'cloud' && Sync.pending) Sync.saveNow();
});
window.addEventListener('focus', () => Sync.refreshIfNewer());

/* ── Versioni salvate: ripristino di una copia precedente ── */
const WHY = { 'auto': 'salvataggio automatico', 'prima-di-eliminare': 'prima di un\'eliminazione', 'prima-del-ripristino': 'prima di un ripristino' };
async function listVersions() {
  if (Sync.mode === 'cloud') {
    const docs = (await Sync.db.collection('backup').get()).docs.map(d => ({ file: d.id, size: JSON.stringify(d.data()).length, counts: d.data().counts }));
    return docs.sort((a, b) => b.file.localeCompare(a.file));
  }
  return await (await fetch('/api/backups', { cache: 'no-store' })).json();
}
async function openVersions() {
  let list = [];
  try { list = await listVersions(); } catch (e) {}
  const m = document.getElementById('verModal'), body = document.getElementById('verList');
  const note = document.getElementById('verNote');
  if (note) note.innerHTML = (Sync.mode === 'cloud' ? 'Tutto si salva da solo <b>online</b>, uguale su tutti i tuoi dispositivi.' + (Sync.user ? ` Account: <b>${esc(Sync.user.email || '')}</b> · <a href="#" onclick="Sync.logout(); return false">Esci</a>.` : '') : 'Tutto si salva da solo su disco nella cartella <b>dati</b>.')
    + ' Qui ci sono le copie precedenti: una ogni 10 minuti di lavoro e sempre prima di un\'eliminazione. Ripristinandone una, quella attuale viene salvata comunque, così puoi tornare indietro.';
  const nice = f => { const x = f.match(/(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)(\d\d)-(.+?)(\.json)?$/); if (!x) return f;
    return `<b>${x[3]}/${x[2]}/${x[1]} ${x[4]}:${x[5]}</b> · ${WHY[x[7]] || x[7]}`; };
  body.innerHTML = !Sync.online ? `<div class="empty-note">Le versioni si salvano solo quando la vetrina salva su disco ("AVVIA VETRINA.bat") oppure online.</div>`
    : list.length ? list.map(v => `<div class="imgrow"><div class="info">${nice(v.file)}<div class="meta">${Math.round(v.size / 1024)} KB</div></div>
        <button class="btn" onclick="restoreVersion('${v.file}')">↺ Ripristina</button></div>`).join('')
    : `<div class="empty-note">Ancora nessuna versione precedente: la prima viene salvata dopo 10 minuti di lavoro o prima di un'eliminazione.</div>`;
  m.classList.add('open');
}
async function restoreVersion(f) {
  try {
    let c = {}, data = null;
    if (Sync.mode === 'cloud') { data = await Sync.read('backup/' + f); c = (data && data.counts) || {}; }
    else c = ((await (await fetch('/api/backup?f=' + encodeURIComponent(f), { cache: 'no-store' })).json()).counts) || {};
    if (!await ask(`Ripristinare questa versione?\n\n${c.clients || 0} clienti · ${c.comps || 0} composizioni · ${c.scenes || 0} ambientazioni/sale mostra\n\nLa situazione attuale viene comunque salvata tra le versioni, quindi puoi tornare indietro.`, { ok: 'Ripristina' })) return;
    if (Sync.mode === 'cloud') {
      if (!data) throw new Error('versione non trovata');
      await Sync.backup('prima-del-ripristino', Sync.snapshot());
      Sync.apply(data); Sync.lastCounts = null; Sync.dirty(); await Sync.saveNow();
    } else {
      const j = await (await fetch('/api/restore?f=' + encodeURIComponent(f), { method: 'POST' })).json();
      if (!j.ok) throw new Error(j.error);
      const d = await (await fetch('/api/data', { cache: 'no-store' })).json();
      Sync.apply(d); Sync.lastSaved = d.saved;
    }
    Sync.badge();
    document.getElementById('verModal').classList.remove('open');
    route(); toast('Versione ripristinata');
  } catch (e) { say('Ripristino non riuscito: ' + e.message); }
}

/* ── Foto dei campioni caricate dal browser: anche su disco (foto/caricate) o online (file della pagina) ── */
async function uploadPhotoToDisk(ik, blob) {
  if (!Sync.online) return null;
  try {
    if (Sync.provider === 'fire') {        // foto ridotta salvata dentro il documento (niente servizio a pagamento)
      const data = await blobToDataURL(blob);
      if (data.length > 950000) { toast('Foto troppo grande per il salvataggio online'); return null; }
      await Sync.db.doc(fotoDocId(ik)).set({ ik, data, upd: Date.now() });
      return data;
    }
    if (Sync.mode === 'cloud') {
      if (!Sync.assets) return null;
      const r = await Sync.assets.upload(blob, { type: blob.type || 'image/jpeg' });
      const old = Sync.fotoMap[ik];
      Sync.fotoMap[ik] = r.id; await Sync.db.doc('stato/foto').set({ v: Sync.fotoMap });
      if (old && old !== r.id) Sync.assets.delete(old).catch(() => {});
      return r.url;
    }
    const r = await fetch('/api/foto?ik=' + encodeURIComponent(ik), { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
    const j = await r.json(); return j.ok ? j.url : null;
  } catch (e) { return null; }
}
async function deletePhotoFromDisk(ik) {
  if (!Sync.online) return;
  try {
    if (Sync.provider === 'fire') { await Sync.db.doc(fotoDocId(ik)).delete(); return; }
    if (Sync.mode === 'cloud') {
      const id = Sync.fotoMap[ik]; if (!id) return;
      delete Sync.fotoMap[ik]; await Sync.db.doc('stato/foto').set({ v: Sync.fotoMap });
      if (Sync.assets) await Sync.assets.delete(id);
      return;
    }
    await fetch('/api/foto-del?ik=' + encodeURIComponent(ik), { method: 'POST' });
  } catch (e) {}
}
async function diskPhotos() {
  if (!Sync.online) return {};
  if (Sync.provider === 'fire') {
    const o = {};
    try { (await Sync.db.collection('foto').get()).docs.forEach(d => { const v = d.data(); if (v && v.ik && v.data) o[v.ik] = v.data; }); } catch (e) {}
    return o;
  }
  if (Sync.mode === 'cloud') { const o = {}; Object.entries(Sync.fotoMap).forEach(([k, id]) => { o[k] = '/_blob/' + id; }); return o; }
  try { return await (await fetch('/api/foto', { cache: 'no-store' })).json(); } catch (e) { return {}; }
}
