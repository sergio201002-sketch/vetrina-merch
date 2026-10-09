'use strict';
/* ════════════════════════════════════════════════════════════
   AMBIENTAZIONE — stanza 3D (muro bianco + pavimento) con più espositori.
   Unità: 1 px = 1 cm. Stanza: x 0…w (sinistra→destra), z 0 (muro di fondo)…d (davanti),
   y 0 = pavimento, valori negativi verso l'alto (come il resto del sito).
   Ogni espositore è un modello con origine al centro dell'ingombro a terra, fronte verso +z.
   ════════════════════════════════════════════════════════════ */

/* ── Modelli 3D degli espositori ── */
function parseDims(d) {
  const p = String(d.dims || '').replace(/,/g, '.').split('×').map(x => parseFloat((x.match(/[\d.]+/) || [0])[0]) || 0);
  return { L: p[0] || 100, P: p[1] || 50, H: p[2] || 100 };
}
const T = (x, y, z, tf) => `transform:translate3d(${x}px,${y}px,${z}px)${tf ? ' ' + tf : ''}`;
/* faccia di una piastrella (senza scritte); data-slot = posto, per aprirla in sala mostra */
let ROOM_RES = 2;   // in stanza 1 px = 1 cm: foto un po' ingrandite; il campione aperto si ridisegna nitido (sharpFace)
function rface(d, c, i, fw, fh, tiled, back) {
  const s = c && SAMPLE[c.slots[i]];
  const tf = back ? 'transform:rotateY(180deg);' : '';
  return s ? `<div class="rf" data-slot="${i}" style="${tf}">${photoLayer(s, fw, fh, tiled, ROOM_RES)}</div>` : `<div class="rf empty" data-slot="${i}" style="${tf}"></div>`;
}
const rplain = (cls, back) => `<div class="rf ${cls}" style="${back ? 'transform:rotateY(180deg)' : ''}"></div>`;
/* contenitore di una piastrella; con i (posto) diventa animabile (classe ttile, data-t) */
const tileDiv = (w, h, tf, inner, i) => `<div class="bx${i != null ? ' ttile' : ''}"${i != null ? ` data-t="${i}" data-slot="${i}"` : ''} style="width:${w}px;height:${h}px;${tf};transform-style:preserve-3d">${inner}</div>`;
const B = (x, y, z, w, h, dd) => box3d(x, y, z, w, h, dd, METAL);
const sizeOfSlot = (c, i, def) => { const s = c && SAMPLE[c.slots[i]]; return s && !s.toz ? sorted2(parseSize(s.z)) : def; };
const tr = (x, y, z, r) => `translate3d(${x}px,${y}px,${z}px)${r ? ' ' + r : ''}`;

/* Ogni modello: (d, c, op) con op = posto aperto in sala mostra (-1 = tutto chiuso).
   Restituisce html (chiuso), L, P, H e, se op >= 0: after = [[selettore, transform]] da animare dopo il disegno,
   focus = { x, y, z, w, h, yaw, tilt } (centro del campione aperto, coordinate dell'espositore) per la telecamera. */
const MODELS = {
  /* girevoli: lo stesso disegno del configuratore. Il fronte (uscita dei carrelli) guarda verso la stanza:
     il modello è girato di 90°, con la fila dei portapannelli lungo il muro. Aperto: il carrello esce verso la stanza. */
  swing(d, c, op) {
    const g = swingDims(d, c, 1), L = g.L;
    const holderT = (i, p) => `translate3d(${-g.w / 2 + (p === 'in' ? 0 : g.travel)}px,0,${swingZ(g, i)}px)`;
    const inner = swingModelHTML(g, holderT, () => 'rotateX(0deg)', () => 'in', 'A', (i, back, tf) => {
      const s = SAMPLE[c.slots[i]];
      return s ? `<div class="rf" data-slot="${i}" style="transform:${tf}">${photoLayer(s, g.fw, g.fh, true, ROOM_RES)}</div>` : `<div class="rf empty" data-slot="${i}" style="transform:${tf}"></div>`;
    });
    const m = { html: `<div class="bx" style="transform:rotateY(-90deg);transform-style:preserve-3d">${inner}</div>`, L: g.D, P: g.W, H: g.Ht };
    if (op >= 0) {
      const h0 = op % L, side = op >= L ? 'B' : 'A';
      m.after = [[`.holder[data-h="${h0}"]`, holderT(h0, 'out')]];
      // dentro il modello girato di -90°: (x, z) -> (-z, x)
      m.focus = { x: -swingZ(g, h0), y: -(g.yb + g.h / 2), z: g.travel, w: g.w, h: g.h, yaw: side === 'A' ? 72 : -72, tilt: 6 };
    }
    return m;
  },
  /* Fly, Flipper, Megaesp, slabs: pannelli appesi in fila sotto un telaio */
  book(d, c, op) {
    const { L: L0, P: P0, H } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
    const L = Math.max(L0, fw + 24), P = Math.max(P0, 60), gap = (P - 20) / n, top = -Math.max(H, fh + 30);
    let h = '';
    for (let i = 0; i < n; i++) h += tileDiv(fw, fh, T(-fw / 2, top + 10, P / 2 - 10 - i * gap), rface(d, c, i, fw, fh, true) + rplain('metal', true), i);
    h += B(-fw / 2 - 10, top, P / 2 - 2, 5, -top, 5) + B(fw / 2 + 5, top, P / 2 - 2, 5, -top, 5);
    h += B(-fw / 2 - 10, top, -P / 2 + 7, 5, -top, 5) + B(fw / 2 + 5, top, -P / 2 + 7, 5, -top, 5);
    h += B(-fw / 2 - 10, top, P / 2 - 2, fw + 20, 6, P - 4);
    h += B(-fw / 2 - 10, -6, P / 2 - 2, fw + 20, 6, P - 4);
    const m = { html: h, L, P, H: -top };
    if (op >= 0) {   // il pannello scelto scorre in avanti
      m.after = [[`.ttile[data-t="${op}"]`, tr(-fw / 2, top + 10, P / 2 + 30)]];
      m.focus = { x: 0, y: top + 10 + fh / 2, z: P / 2 + 30, w: fw, h: fh, yaw: 0, tilt: 4 };
    }
    return m;
  },
  /* Slide: lastre affiancate viste di taglio; DX faccia verso sinistra, SX verso destra; retro grigio.
     Aperto: la lastra scorre in avanti come un cassetto */
  slide(d, c, op) {
    const { L: BW } = parseDims(d), [fw, fh] = d.face, n = c.slots.length, P = fw, dx = (d.opening || 'DX') === 'DX';
    const pitch = (BW - 16) / Math.max(1, n - 1), OUT = P * 1.02;
    const xOf = i => -BW / 2 + (dx ? 8 + i * pitch : BW - 8 - i * pitch);
    const slabT = (i, out) => dx ? tr(xOf(i), -9 - fh, -P / 2 + (out ? OUT : 0), 'rotateY(-90deg)') : tr(xOf(i), -9 - fh, P / 2 + (out ? OUT : 0), 'rotateY(90deg)');
    let h = B(-BW / 2, -9, P / 2, BW, 9, P);
    for (let i = 0; i < n; i++) h += tileDiv(fw, fh, 'transform:' + slabT(i, false), rface(d, c, i, fw, fh, true) + rplain('grey', true), i);
    const m = { html: h, L: BW, P, H: fh + 9 };
    if (op >= 0) {
      m.after = [[`.ttile[data-t="${op}"]`, slabT(op, true)]];
      m.focus = { x: xOf(op), y: -(9 + fh / 2), z: dx ? -P / 2 + OUT + fw / 2 : P / 2 + OUT - fw / 2, w: fw, h: fh, yaw: dx ? 72 : -72, tilt: 6 };
    }
    return m;
  },
  /* Mobile cassettiera tozzetti: lo stesso disegno del configuratore. Aperto: il cassetto esce e il tozzetto si alza */
  cassettiera(d, c, op) {
    const g = cassGeo(d, c, 1);
    const m = { html: cassModelHTML(g, () => false, -1, i => rface(d, c, i, g.tw, g.th, true) + tileBody(d, c, i, g.tw, g.th, true, 1)), L: g.W, P: g.D, H: g.Hh };
    if (op >= 0) {
      const p = cassPos(g, op);
      m.after = [[`.drawer3d[data-dr="${p.dr}"]`, `translate3d(0,${g.trayY[p.dr]}px,${g.open}px)`], [`.ttile[data-t="${op}"]`, cassTileT(g, op, true)]];
      const x = -((g.cols - 1) * g.colPitch + g.tw) / 2 + p.col * g.colPitch + g.tw / 2;
      m.focus = { x, y: g.trayY[p.dr] - 2 - g.th / 2 - g.lift, z: g.D / 2 - 6 - p.r * g.rowPitch + g.open, w: g.tw, h: g.th, yaw: 0, tilt: 16 };
    }
    return m;
  },
  /* Mobile colonna per cataloghi (nessun campione) */
  colonna() { return { html: colonnaModelHTML(1), L: 50, P: 45, H: 104 }; },
  /* Mobile teca: 3 ripiani con tozzetti in piedi visti di sbieco. Aperto: il tozzetto esce davanti e si gira di fronte */
  teca(d, c, op) {
    const n = c.slots.length, rows = d.rows || 3, cols = d.cols || Math.ceil(n / rows), [tw, th] = d.face;
    const CW = 100, CH = 104, CD = 45, plinth = 8, t = 2, rowH = (CH - plinth - t) / rows, ox = -CW / 2, oz = CD / 2;
    const step = (CW - 2 * t - 8 - tw * 0.31) / Math.max(1, cols - 1), sx = d.side === 'SX';
    const posOf = i => { const r = Math.floor(i / cols), j = i % cols; return { x: t + 4 + j * step, bottom: -plinth - (rows - 1 - r) * rowH }; };
    let h = B(ox, -CH, oz - CD + t, CW, CH, t) + B(ox, -CH, oz, t, CH, CD) + B(ox + CW - t, -CH, oz, t, CH, CD) + B(ox, -CH, oz, CW, t, CD) + B(ox, -plinth, oz, CW, plinth, CD);
    for (let r = 1; r < rows; r++) h += B(ox + t, -plinth - r * rowH - t / 2, oz, CW - 2 * t, t, CD);
    for (let i = 0; i < n; i++) {
      const { x, bottom } = posOf(i), cs = Math.cos(72 * Math.PI / 180) * tw, sn = Math.sin(72 * Math.PI / 180) * tw;
      const tf = sx ? T(ox + CW - x - cs, bottom - th, oz - 3 - sn, 'rotateY(-72deg)') : T(ox + x, bottom - th, oz - 3, 'rotateY(72deg)');
      h += tileDiv(tw, th, tf, rface(d, c, i, tw, th, true) + tileBody(d, c, i, tw, th, true, 1), i);
    }
    const m = { html: h, L: CW, P: CD, H: CH };
    if (op >= 0) {
      const { x, bottom } = posOf(op), xo0 = Math.max(2, Math.min(CW - tw - 2, x - tw / 2)), xo = sx ? CW - xo0 - tw : xo0;
      m.after = [[`.ttile[data-t="${op}"]`, tr(ox + xo, bottom - th - 3, oz + 24, 'rotateY(0deg)')]];
      m.focus = { x: ox + xo + tw / 2, y: bottom - 3 - th / 2, z: oz + 24, w: tw, h: th, yaw: 0, tilt: 6 };
    }
    return m;
  },
  /* Mensole a parete: il modello parte da 0, l'altezza da terra è it.y (di serie 95 cm). Aperto: il tozzetto si alza di fronte */
  shelf(d, c, op) {
    const n = c.slots.length, [tw, th] = faceOf(d, c), [BW, BH, BD] = d.bar || [100, 8, 9], ang = d.angle == null ? -32 : d.angle, M = 0;
    const cos = Math.cos(ang * Math.PI / 180), lift = Math.max(8, th * 0.55);
    const step = ang ? (BW - 4 - tw * cos) / Math.max(1, n - 1) : (BW - 2 - tw) / Math.max(1, n - 1);
    const xOf = i => -BW / 2 + (ang ? 2 : 1) + i * step;
    let h = B(-BW / 2, -M - BH, BD / 2, BW, BH, BD);
    for (let i = 0; i < n; i++) {
      h += tileDiv(tw, th, T(xOf(i), -M - BH + 3 - th, 0.5 - i * 0.05 + (ang > 0 ? tw * Math.sin(ang * Math.PI / 180) : 0), `rotateY(${ang}deg)`), rface(d, c, i, tw, th, true) + tileBody(d, c, i, tw, th, true, 1), i);
    }
    const m = { html: h, L: BW, P: BD, H: BH + th - 3 };
    if (op >= 0) {
      const xo = Math.max(-BW / 2, Math.min(BW / 2 - tw, xOf(op)));
      m.after = [[`.ttile[data-t="${op}"]`, tr(xo, -BH + 3 - th - lift, BD / 2 + 6, 'rotateY(0deg)')]];
      m.focus = { x: xo + tw / 2, y: -BH + 3 - lift - th / 2, z: BD / 2 + 6, w: tw, h: th, yaw: 0, tilt: 6 };
    }
    return m;
  },
  /* Culla modulare: moduli in fila, piastrelle in piedi negli incavi. Aperto: la piastrella esce davanti alla fila */
  culla(d, c, op) {
    const n = c.slots.length, mods = cullaMods(d, n), ML = 94.5, MD = 57.9, BH = 5, RAIL = 35.6;
    const len = mods * ML, pitch = (len - 8) / n, ox = -len / 2, oz = MD / 2, dx = c.side === 'DX';
    const xOf = i => { const x = 4 + i * pitch; return ox + (dx ? x + pitch : len - x - pitch); };   // SX: Start a destra; DX: a sinistra
    let h = '';
    for (let mm = 0; mm < mods; mm++) {
      const x0 = ox + mm * ML;
      h += B(x0 + 0.3, -BH, oz, ML - 0.6, BH, MD) + B(x0 + 0.3, -RAIL, oz - MD + 6, ML - 0.6, 7, 5);
      h += B(x0 + 1, -RAIL + 7, oz - MD + 7, 2.5, RAIL - 7 - BH, 2.5) + B(x0 + ML - 3.5, -RAIL + 7, oz - MD + 7, 2.5, RAIL - 7 - BH, 2.5);
    }
    for (let i = 0; i < n; i++) {
      if (!c.slots[i]) continue;
      const [w, th] = sizeOfSlot(c, i, [60, 60]);
      h += tileDiv(w, th, dx ? T(xOf(i) - w, -BH + 2 - th, oz - 2, 'rotateY(-74deg)') + ';transform-origin:100% 0' : T(xOf(i), -BH + 2 - th, oz - 2, 'rotateY(74deg)'), rface(d, c, i, w, th, false) + tileBody(d, c, i, w, th, false, 1), i);
    }
    const m = { html: h, L: len, P: MD, H: RAIL };
    if (op >= 0 && c.slots[op]) {   // esce lungo la scanalatura (in diagonale) e poi, fuori dalla culla, si raddrizza verso di te
      const [w, th] = sizeOfSlot(c, op, [60, 60]), D = w + 10, C = Math.cos(74 * Math.PI / 180), S = Math.sin(74 * Math.PI / 180);
      const x0 = dx ? xOf(op) - w + C * D : xOf(op) - C * D, z0 = oz - 2 + S * D, sel = `.ttile[data-t="${op}"]`;
      m.after = [[sel, tr(x0, -BH + 2 - th, z0, `rotateY(${dx ? -74 : 74}deg)`)], [sel, tr(x0, -BH - th - 2, z0, 'rotateY(0deg)'), 580]];
      m.focus = { x: x0 + w / 2, y: -BH - 2 - th / 2, z: z0, w, h: th, yaw: 0, tilt: 6 };
    }
    return m;
  },
  /* Cassettiere: mobile nero con cassetti; il primo è aperto e mostra il campione */
  drawers(d, c, op) {
    const { L, P, H } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
    let h = B(-L / 2, -H, P / 2, L, H, P);
    const dh = (H - 12) / n;
    h += `<div class="bx" style="width:${L - 8}px;height:${H - 12}px;${T(-L / 2 + 4, -H + 6, P / 2 + 0.4)};background:repeating-linear-gradient(180deg, rgba(255,255,255,.0) 0 ${dh - 1.5}px, rgba(255,255,255,.18) ${dh - 1.5}px ${dh}px)"></div>`;
    const tw = Math.min(fw, L - 12), th = Math.min(fh, P - 6), i0 = op >= 0 ? op : 0;
    h += tileDiv(tw, th, T(-tw / 2, -H + 8, P / 2 + th * 0.55 - th, 'rotateX(90deg)'), rface(d, c, i0, fw, fh, true));
    const m = { html: h, L, P, H };
    if (op >= 0) m.focus = { x: 0, y: -H + 8, z: P / 2 + th * 0.05, w: tw, h: th, yaw: 0, tilt: 55 };
    return m;
  },
  /* Carrellati, cubo, culla legni, basi: piattaforma con piastrelle in piedi in fila. Aperto: la piastrella esce davanti */
  rack(d, c, op) {
    const { L: L0, P: P0, H } = parseDims(d), n = c.slots.length;
    const sizes = (d.accept.sizes || [d.face.join('x')]).map(parseSize).map(sorted2);
    const maxH = Math.max(...sizes.map(s => s[1])), maxW = Math.max(...sizes.map(s => s[0]));
    const L = Math.max(L0, 40), P = Math.max(P0, maxW * 0.97 + 4), plat = Math.max(6, Math.min(H - maxH, 90));
    const pitch = (L - 10) / Math.max(1, n);
    let h = B(-L / 2, -plat, P / 2, L, plat, P);
    for (let i = 0; i < n; i++) {
      if (!c.slots[i]) continue;
      const [w, th] = sizeOfSlot(c, i, sizes[0]);
      h += tileDiv(w, th, T(-L / 2 + 5 + i * pitch, -plat + 2 - th, P / 2 - 2, 'rotateY(74deg)'), rface(d, c, i, w, th, false) + rplain('', true), i);
    }
    const m = { html: h, L, P, H: plat + maxH };
    if (op >= 0 && c.slots[op]) {
      const [w, th] = sizeOfSlot(c, op, sizes[0]), xo = Math.max(-L / 2 - 10, Math.min(L / 2 - w + 10, -L / 2 + 5 + op * pitch - w / 2));
      m.after = [[`.ttile[data-t="${op}"]`, tr(xo, -plat - th - 4, P / 2 + 25, 'rotateY(0deg)')]];
      m.focus = { x: xo + w / 2, y: -plat - 4 - th / 2, z: P / 2 + 25, w, h: th, yaw: 0, tilt: 6 };
    }
    return m;
  },
  /* Lavagna / totem: lastra frontale (totem: fronte e retro) */
  wall(d, c, op) {
    const { L: L0, P, H } = parseDims(d), [fw, fh] = d.face, n = c.slots.length, L = Math.max(L0, fw + 8);
    const top = -Math.max(H, fh + 10);
    let h = B(-L / 2, -8, P / 2, L, 8, P);
    h += tileDiv(fw, fh, T(-fw / 2, top + 4, 0), rface(d, c, 0, fw, fh, true) + (n > 1 ? rface(d, c, 1, fw, fh, true, true) : rplain('metal', true)));
    h += B(-fw / 2 - 4, top, 2, 4, -top - 8, 4) + B(fw / 2, top, 2, 4, -top - 8, 4) + B(-fw / 2 - 4, top, 2, fw + 8, 4, 4);
    const m = { html: h, L, P, H: -top };
    if (op >= 0) m.focus = { x: 0, y: top + 4 + fh / 2, z: 0, w: fw, h: fh, yaw: op === 1 ? 180 : 0, tilt: 4 };
    return m;
  },
  /* Mobili e banchi tozzetti: mobile con i tozzetti in piedi sul piano */
  grid(d, c, op) {
    const { L, P, H } = parseDims(d), n = c.slots.length, cols = d.cols || 5, rows = Math.ceil(n / cols), [fw, fh] = faceOf(d, c);
    const cw = Math.min(fw, (L - 6) / cols - 1), chh = cw * fh / fw, rz = (P - 6) / rows;
    const xOf = i => -L / 2 + 3 + (i % cols) * (cw + 1), zOf = i => P / 2 - 3 - Math.floor(i / cols) * rz;
    let h = B(-L / 2, -H, P / 2, L, H, P);
    for (let i = 0; i < n; i++) h += tileDiv(cw, chh, T(xOf(i), -H - chh + 1, zOf(i), 'rotateX(-12deg)'), rface(d, c, i, fw, fh, true) + rplain('', true), i);
    const m = { html: h, L, P, H: H + chh };
    if (op >= 0) {
      m.after = [[`.ttile[data-t="${op}"]`, tr(xOf(op), -H - chh - 8, P / 2 + 8, 'rotateX(0deg)')]];
      m.focus = { x: xOf(op) + cw / 2, y: -H - 8 - chh / 2, z: P / 2 + 8, w: cw, h: chh, yaw: 0, tilt: 8 };
    }
    return m;
  },
};
function roomModel(it) {
  const d = DISP[it.disp]; if (!d) return { html: '', L: 50, P: 50, H: 50 };
  const c = comps[it.comp] || { slots: Array(d.variants ? defVariant(d) : d.slots).fill(null) };
  const op = roomMode === 'show' && showSel && showSel.item === it.id ? showSel.slot : -1;
  LITE3D = true;                                   // modello leggero per la stanza
  let m; try { m = (MODELS[d.mode] || MODELS.grid)(d, c, op); } finally { LITE3D = false; }
  if (!m.H) m.H = parseDims(d).H;
  if (d.sided && sideOf(it) === 'SX') m.html = `<div class="bx" style="transform:scaleX(-1);transform-style:preserve-3d">${m.html}</div>`;
  if (op >= 0 && !m.focus) m.focus = { x: 0, y: -m.H / 2, z: m.P / 2, w: Math.min(m.L, 120), h: m.H, yaw: 0, tilt: 8 };
  return m;
}

/* ── Sistema Materia: altezza da terra, aggancio sopra / al muro / di fianco, codici d'ordine ── */
const isSystem = it => !!(DISP[it.disp] && DISP[it.disp].system);                 // mobili che si impilano
const isWallItem = it => isSystem(it) || (DISP[it.disp] && DISP[it.disp].mode === 'shelf');
const sideOf = it => it.side || 'DX';
const elevY = it => it.y != null ? it.y : (DISP[it.disp] && DISP[it.disp].mode === 'shelf' ? 95 : 0);
function extOf(it) {
  const m = roomModels[it.id] || (roomModels[it.id] = roomModel(it));
  const r = Math.round((it.rot || 0) / 90) % 2 !== 0;
  return { hx: (r ? m.P : m.L) / 2, hz: (r ? m.L : m.P) / 2, H: m.H || 100 };
}
/* Distanze: dal muro 1 cm (0 per teche, mobili del sistema e mensole, che si fissano a parete);
   tra espositori accostati 1 cm (0 tra teche / mobili del sistema / mensole) */
const WALL_GAP = 1, SIDE_GAP = 1;
const wallGap = it => isWallItem(it) ? 0 : WALL_GAP;
const pairGap = (a, b) => isWallItem(a) && isWallItem(b) ? 0 : SIDE_GAP;
/* posizione "agganciata": prima sopra un altro mobile, poi al muro, poi accostata ai vicini */
function snapItem(it, skip) {
  const S = 18, e = extOf(it), others = room.items.filter(o => o !== it && !(skip && skip.has(o.id)));
  if (isSystem(it)) {
    let base = null, top = -1;
    others.forEach(o => {
      if (!isSystem(o) || Math.abs(o.x - it.x) > 30 || Math.abs(o.z - it.z) > 30 || (o.rot || 0) !== (it.rot || 0)) return;
      const t = elevY(o) + extOf(o).H; if (t > top) { top = t; base = o; }
    });
    if (base) { it.x = base.x; it.z = base.z; it.y = top; return 'sopra'; }
    it.y = 0;
  }
  // a filo muro: teche/mobili del sistema e mensole attaccati, gli altri espositori a 1 cm.
  // "Staccato dal muro" (it.free): resta dove lo metti nella stanza, dentro i muri
  const wg = wallGap(it);
  if (it.free) it.z = Math.max(e.hz, Math.min(room.d - e.hz, it.z));
  else it.z = e.hz + wg;
  if (room.wallL && it.x - e.hx < S) it.x = e.hx + wg;
  if (room.wallR && room.w - (it.x + e.hx) < S) it.x = room.w - e.hx - wg;
  let best = null;
  others.forEach(o => {
    const eo = extOf(o), g = pairGap(it, o);
    if (Math.abs((o.z - eo.hz) - (it.z - e.hz)) > 25) return;            // stesso filo di fondo (tutti al muro)
    [o.x + eo.hx + e.hx + g, o.x - eo.hx - e.hx - g].forEach(cx => { const dd = Math.abs(cx - it.x); if (dd < S && (!best || dd < best.d)) best = { d: dd, x: cx }; });
  });
  if (best) it.x = best.x;
  if (it.free) {
    let bz = null;
    others.forEach(o => {
      const eo = extOf(o), g = pairGap(it, o), ov = Math.min(it.x + e.hx, o.x + eo.hx) - Math.max(it.x - e.hx, o.x - eo.hx);
      if (ov < Math.min(e.hx, eo.hx)) return;                                  // non sono uno davanti all'altro
      const cz = it.z >= o.z ? o.z + eo.hz + e.hz + g : o.z - eo.hz - e.hz - g, dd = Math.abs(cz - it.z);
      if (dd < S + 6 && (!bz || dd < bz.d)) bz = { d: dd, z: cz, x: Math.abs(o.x - it.x) < S ? o.x : it.x };
    });
    if (bz) { it.z = bz.z; it.x = bz.x; }                                       // attaccati schiena a schiena, allineati
  }
  return '';
}
/* dopo uno spostamento: un mobile rimasto "in aria" scende sopra quello sotto o a terra */
function settleStacks() {
  room.items.filter(isSystem).sort((a, b) => elevY(a) - elevY(b)).forEach(it => {
    if (elevY(it) <= 0) return;
    let top = 0;
    room.items.forEach(o => { if (o !== it && isSystem(o) && Math.abs(o.x - it.x) < 1 && Math.abs(o.z - it.z) < 1 && elevY(o) < elevY(it)) top = Math.max(top, elevY(o) + extOf(o).H); });
    it.y = top;
  });
}
const stackedAbove = it => isSystem(it) ? room.items.filter(o => o !== it && isSystem(o) && Math.abs(o.x - it.x) < 1 && Math.abs(o.z - it.z) < 1 && elevY(o) > elevY(it)) : [];
const isUpper = it => isSystem(it) && elevY(it) > 1;
function itemCode(it) {
  const d = DISP[it.disp]; if (!d) return '';
  if (d.moduleCodes) { const c = comps[it.comp]; return d.moduleCodes[c && c.side === 'DX' ? 'DX' : 'SX'].join('/'); }
  let c = d.codes;
  if (!c) return d.code;
  if (c.inf) c = c[isUpper(it) ? 'sup' : 'inf'];
  if (c && typeof c === 'object') c = c[sideOf(it)];
  return c || d.code;
}
function itemLabel(it) {
  const d = DISP[it.disp]; if (!d) return '';
  const lv = d.codes && d.codes.inf ? (isUpper(it) ? ' superiore' : ' inferiore') : '';
  return d.name.replace(/\s*\(.*\)\s*$/, '') + lv + (d.sided ? ' ' + sideOf(it) : '');
}

/* ════════════════════════════════════════════════════════════
   EDITOR
   ════════════════════════════════════════════════════════════ */
let room = null, roomSel = null, cam = { yaw: -22, tilt: 14, zoom: 1 }, roomModels = {};
const ROOM_VIEWS = { front: { yaw: 0, tilt: 8 }, persp: { yaw: -24, tilt: 14 }, persp2: { yaw: 24, tilt: 14 }, top: { yaw: 0, tilt: 62 } };

/* mode 'edit' = editor (pianta, comandi); 'show' = sala mostra: solo da guardare, clic su un espositore = lo apre */
let roomMode = 'edit', showSel = null;            // showSel = { item, slot }: campione aperto in sala mostra
function openRoom(id, mode) {
  room = scenes[id]; roomSel = null; roomModels = {}; roomMode = mode || 'edit'; showSel = null; cam.focus = null;
  if (ui.client !== room.client) { ui.client = room.client; saveUI(); }
  const v = document.getElementById('viewRoom');
  const clName = esc(clients[room.client] ? clients[room.client].name : 'Cliente');
  v.classList.remove('present');
  if (roomMode === 'show') {
    v.innerHTML = `
    <aside class="room-side">
      <div class="sec"><button class="btn" onclick="go('#/cliente/${room.client}')">← ${clName}</button></div>
      <div class="sec"><h4>Stanze</h4><div class="roomtabs">${showRooms(room.client).map(r => `<button class="${r.id === room.id ? 'on' : ''}" onclick="go('#/salamostra/${room.client}/${r.id}')">${esc(r.name)}</button>`).join('')}
        <button class="add" onclick="addShowRoom('${room.client}')" title="Aggiungi una stanza alla sala mostra">＋ Stanza</button></div></div>
      <div class="sec"><h4>Sala mostra · ${esc(room.name)}</h4><div style="font-weight:800;font-size:17px;font-family:var(--font-display)">${clName}</div>
        <div style="font-size:12px;color:var(--mid);margin:6px 0 10px">Clicca un espositore (qui sotto o nella stanza) per aprirlo: sfogli i girevoli, apri i cassetti, tiri fuori i tozzetti e guardi i campioni.</div>
        <button class="btn dark" onclick="openSampleBoard()" style="width:100%;margin-bottom:6px">🧩 Sistema i campioni</button>
        <button class="btn" onclick="roomPaste()" style="width:100%;margin-bottom:6px" title="Incolla un elenco di codici e scegli in quali espositori metterli">📥 Incolla codici</button>
        <button class="btn" onclick="go('#/ambiente/${room.id}')" style="width:100%">✎ Modifica disposizione</button></div>
      <div class="sec"><h4 id="roomItemsTitle">Espositori</h4><div class="addlist layers" id="roomItemList"></div></div>
    </aside>
    <div class="room-main">
      <div class="room-3d" id="room3d">
        <div class="room-scene" id="roomScene"></div>
        ${showRooms(room.client).length > 1 ? `<div class="roomtabs float">${showRooms(room.client).map(r => `<button class="${r.id === room.id ? 'on' : ''}" onclick="event.stopPropagation(); go('#/salamostra/${room.client}/${r.id}')">${esc(r.name)}</button>`).join('')}</div>` : ''}
        <div class="camctl">
          <button data-v="front">Frontale</button><button data-v="persp">Prospettiva ↙</button><button data-v="persp2">Prospettiva ↘</button>
          <button id="rZoom" class="${ui.roomZoom ? 'on' : ''}" onclick="event.stopPropagation(); toggleRoomZoom()" title="Campione aperto: dritto di fronte e da vicino">🔍 Zoom</button>
          <button id="rPresent">⛶ Presenta</button><button onclick="event.stopPropagation(); renderRealistic()" title="Immagine realistica con luce e ombre di questa vista">📸 Render</button></div>
        <div class="roomhint">Trascina per girare la vista · rotella per lo zoom · clicca un campione per aprirlo</div>
        <div class="showcard" id="showCard" hidden></div>
      </div>
    </div>`;
    v.querySelectorAll('.camctl [data-v]').forEach(b => b.onclick = ev => { ev.stopPropagation(); Object.assign(cam, ROOM_VIEWS[b.dataset.v]); cam.zoom = 1; applyCam(true); });
    document.getElementById('rPresent').onclick = ev => { ev.stopPropagation(); v.classList.toggle('present'); ev.target.classList.toggle('on'); requestAnimationFrame(() => applyCam()); };
    bindOrbit(document.getElementById('room3d'));
    renderRoom();
    return;
  }
  v.innerHTML = `
    <aside class="room-side">
      <div class="sec" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <button class="btn" onclick="go('#/cliente/${room.client}')">← ${clName}</button>
        ${room.showroom ? `<button class="btn red" onclick="go('#/salamostra/${room.client}/${room.id}')">▶ Vedi sala mostra</button>` : ''}</div>
      <div class="sec"><h4>${room.showroom ? 'Sala mostra (disposizione reale)' : 'Ambientazione'}</h4>
        <input class="search" id="roomName" value="${esc(room.name)}">
        <div class="row" style="margin-top:10px">Larghezza <input type="number" id="rW" min="200" max="2000" step="10" value="${room.w}"> cm</div>
        <div class="row">Profondità <input type="number" id="rD" min="200" max="2000" step="10" value="${room.d}"> cm</div>
        <div class="row">Altezza parete <input type="number" id="rH" min="200" max="500" step="10" value="${room.h}"> cm</div>
        <div class="row"><label><input type="checkbox" id="rWL" ${room.wallL ? 'checked' : ''}> Parete sinistra</label>
          <label><input type="checkbox" id="rWR" ${room.wallR ? 'checked' : ''}> Parete destra</label></div>
        <div class="row"><label><input type="checkbox" id="rG" ${room.grid !== false ? 'checked' : ''}> Griglia 50 cm sul pavimento</label></div>
      </div>
      <div class="sec selbox" id="roomSelBox"></div>

      <div class="sec"><h4 id="roomItemsTitle">Espositori nella stanza</h4><div class="addlist layers" id="roomItemList"></div></div>
      <div class="sec"><h4>Altri espositori del cliente</h4><div class="addlist" id="roomAddList"></div></div>
      <div class="sec"><h4>Distinta</h4>
        <div style="font-size:12px;color:var(--mid);margin-bottom:6px">Codici d'ordine di tutti gli espositori della stanza (inferiore / superiore e SX / DX in base a come li hai montati).</div>
        <button class="btn" onclick="copyDistinta()" style="width:100%">📋 Copia distinta</button></div>
      <div class="sec"><h4>Aggiungi dal catalogo</h4>
        <select class="tb" id="roomAddCat" style="width:100%"><option value="">Scegli un espositore…</option>
          ${[...new Set(DISPLAYS.map(d => d.family))].map(f => `<optgroup label="${esc(f)}">${DISPLAYS.filter(d => d.family === f).map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</optgroup>`).join('')}
        </select>
        <div style="font-size:11px;color:var(--mid);margin-top:6px">Crea un nuovo espositore per il cliente e lo mette nella stanza: poi aprilo per inserire i campioni.</div></div>
    </aside>
    <div class="room-main">
      <div class="room-3d" id="room3d">
        <div class="room-scene" id="roomScene"></div>
        <div class="camctl">
          <button data-v="front">Frontale</button><button data-v="persp">Prospettiva ↙</button><button data-v="persp2">Prospettiva ↘</button><button data-v="top">Dall'alto</button>
          <button id="rPresent">⛶ Presenta</button><button onclick="event.stopPropagation(); renderRealistic()" title="Immagine realistica con luce e ombre di questa vista">📸 Render</button></div>
        <div class="roomhint">Trascina per girare la vista · rotella per lo zoom · clicca un espositore per selezionarlo</div>
      </div>
      <div class="room-plan" id="roomPlan"></div>
    </div>`;
  const num = (id, f, min, max) => document.getElementById(id).addEventListener('change', e => {
    room[f] = Math.max(min, Math.min(max, Math.round(+e.target.value || room[f]))); e.target.value = room[f];
    room.items.forEach(it => { it.x = Math.min(it.x, room.w); it.z = Math.min(it.z, room.d); }); saveRoom(); renderRoom();
  });
  num('rW', 'w', 200, 2000); num('rD', 'd', 200, 2000); num('rH', 'h', 200, 500);
  document.getElementById('roomName').addEventListener('input', e => { room.name = e.target.value || 'Ambientazione'; saveRoom(); });
  [['rWL', 'wallL'], ['rWR', 'wallR'], ['rG', 'grid']].forEach(([id, f]) => document.getElementById(id).addEventListener('change', e => { room[f] = e.target.checked; saveRoom(); renderRoom(); }));
  document.getElementById('roomAddCat').addEventListener('change', e => { if (e.target.value) addCatalogItem(e.target.value); e.target.value = ''; });
  v.querySelectorAll('.camctl [data-v]').forEach(b => b.onclick = ev => { ev.stopPropagation(); Object.assign(cam, ROOM_VIEWS[b.dataset.v]); cam.zoom = 1; applyCam(true); });
  document.getElementById('rPresent').onclick = ev => { ev.stopPropagation(); v.classList.toggle('present'); ev.target.classList.toggle('on'); requestAnimationFrame(() => { applyCam(); renderPlan(); }); };
  bindOrbit(document.getElementById('room3d'));
  // le vecchie mensole oblique impostate "SX" nella stanza erano disegnate specchiate (tozzetti verso destra):
  // ora sono la mensola obliqua DX; le altre restano la SX (00000PGG), con lo stesso aspetto di prima
  room.items.forEach(it => {
    if (it.disp === 'PGG' && it.side === 'SX' && DISP.PGH) {
      it.disp = 'PGH'; delete it.side;
      const c = comps[it.comp]; if (c && c.disp === 'PGG') { c.disp = 'PGH'; saveComps(); }
      saveRoom();
    } else if (it.disp === 'PGG' && it.side) { delete it.side; saveRoom(); }
  });
  // le vecchie teche impostate "SX" diventano il mobile teca SX (ora sono due espositori diversi)
  room.items.forEach(it => {
    if (it.disp === 'PLT' && it.side === 'SX' && DISP.PLTSX) {
      it.disp = 'PLTSX'; delete it.side;
      const c = comps[it.comp]; if (c && c.disp === 'PLT') { c.disp = 'PLTSX'; saveComps(); }
      saveRoom();
    }
  });
  // una volta sola: i girevoli già presenti vengono girati con il fronte (uscita dei carrelli) verso la stanza
  if (!room.swingFront) {
    room.items.forEach(it => { if (DISP[it.disp] && DISP[it.disp].mode === 'swing') it.rot = 0; });
    room.swingFront = true; roomModels = {}; saveRoom();
  }
  // regola del muro anche per gli espositori già presenti (gli impilati seguono quello sotto)
  room.items.forEach(it => { if (!isUpper(it) && !it.free) { const e = extOf(it); it.z = e.hz + wallGap(it); } });
  room.items.filter(isUpper).forEach(it => { const b = room.items.find(o => o !== it && isSystem(o) && Math.abs(o.x - it.x) < 1 && elevY(o) < elevY(it)); if (b) it.z = b.z; });
  renderRoom();
}
function saveRoom() { room.upd = Date.now(); saveScenes(); }

/* ── disegno ── */
function renderRoom() {
  if (!room) return;
  const { w, d, h } = room;
  let html = `<div class="rfloor${room.grid !== false ? ' grid' : ''}" style="width:${w}px;height:${d}px;transform:rotateX(90deg)"></div>`;
  html += `<div class="rwall" data-wall="b" style="width:${w}px;height:${h}px;transform:translate3d(0,${-h}px,0)"></div>`;
  if (room.wallL) html += `<div class="rwall side" data-wall="l" style="width:${d}px;height:${h}px;transform:translate3d(0,${-h}px,0) rotateY(-90deg)"></div>`;
  if (room.wallR) html += `<div class="rwall side" data-wall="r" style="width:${d}px;height:${h}px;transform:translate3d(${w}px,${-h}px,0) rotateY(-90deg)"></div>`;
  room.items.forEach(it => {
    const m = roomModels[it.id] = roomModel(it);
    const fp = it.id === roomSel ? `<div class="bx fp" style="width:${m.L + 10}px;height:${m.P + 10}px;transform:translate3d(${-m.L / 2 - 5}px,-0.6px,${-m.P / 2 - 5}px) rotateX(90deg)"></div>` : '';
    html += `<div class="ritem" data-id="${it.id}" style="transform:${itemT(it)}">${fp}${m.html}</div>`;
  });
  document.getElementById('roomScene').innerHTML = html;
  showOpen = null; showHi = null;
  room.items.forEach(it => { const m = roomModels[it.id]; if (m && m.after) applyOpen(it.id, m.after, 0); });
  if (showSel) sharpFace(showSel.item, showSel.slot);
  applyCam(); renderPlan(); renderRoomSide();
}
const itemT = it => `translate3d(${it.x}px,${-elevY(it)}px,${it.z}px) rotateY(${it.rot || 0}deg)`;
function applyCam(animate) {
  const box = document.getElementById('room3d'), sc = document.getElementById('roomScene'); if (!box || !sc || !room) return;
  const W = box.clientWidth, H = box.clientHeight, { w, d, h } = room;
  const t = cam.tilt * Math.PI / 180, y = Math.abs(cam.yaw) * Math.PI / 180;
  const spanW = w * Math.cos(y) + d * Math.sin(y), spanH = h * Math.cos(t) + d * Math.sin(t);
  const s = cam.zoom * Math.min(W * 0.9 / spanW, H * 0.86 / spanH);
  sc.style.transition = animate ? 'transform .7s cubic-bezier(.4,.1,.2,1)' : 'none';
  if (cam.focus) {
    const f = cam.focus, fs = cam.zoom * (ui.roomZoom ? Math.min(W * 0.86 / Math.max(20, f.w), H * 0.80 / Math.max(20, f.h)) : Math.min(W * 0.42 / Math.max(25, f.w), H * 0.62 / Math.max(25, f.h)));
    sc.style.transform = `translate3d(${W / 2}px,${H * 0.48}px,0) scale(${fs.toFixed(4)}) rotateX(${-cam.tilt}deg) rotateY(${cam.yaw}deg) translate3d(${-f.x}px,${-f.y}px,${-f.z}px)`;
  } else
  sc.style.transform = `translate3d(${W / 2}px,${H * (0.5 + 0.12 * Math.cos(t))}px,0) scale(${s.toFixed(4)}) rotateX(${-cam.tilt}deg) rotateY(${cam.yaw}deg) translate3d(${-w / 2}px,${h * 0.35}px,${-d / 2}px)`;
  hideBlockers();
  // pareti laterali visibili solo dal lato giusto (non devono coprire la stanza)
  const sy = Math.sin(cam.yaw * Math.PI / 180);
  sc.querySelectorAll('[data-wall="l"]').forEach(e => e.style.display = sy < 0.05 ? '' : 'none');
  sc.querySelectorAll('[data-wall="r"]').forEach(e => e.style.display = sy > -0.05 ? '' : 'none');
  sc.querySelectorAll('[data-wall="b"]').forEach(e => e.style.display = Math.cos(cam.yaw * Math.PI / 180) > -0.05 ? '' : 'none');
}
/* campione aperto: resta solo l'espositore che si sta guardando, gli altri si nascondono (da qualsiasi lato
   lo guardi nessuno si mette in mezzo); chiudendo il campione ricompaiono */
function hideBlockers() {
  const open = cam.focus && showSel ? showSel.item : null;
  // si nascondono gli altri espositori, ma non quelli attaccati nella stessa fila (girevoli uniti): si vedono come un unico espositore
  const it = open && room.items.find(i => i.id === open), keep = new Set(it ? swingRow(it).map(o => o.id) : []);
  document.querySelectorAll('#roomScene .ritem').forEach(e => { e.style.visibility = open && e.dataset.id !== open && !keep.has(e.dataset.id) ? 'hidden' : ''; });
}
let orbitMoved = false;
function bindOrbit(el) {
  let st = null;
  el.addEventListener('pointerdown', e => { if (e.target.closest('.camctl') || e.target.closest('.showcard') || e.target.closest('.roomtabs')) return;   // comandi e scheda campione: non sono clic sulla stanza
    st = { x: e.clientX, y: e.clientY, yaw: cam.yaw, tilt: cam.tilt }; orbitMoved = false; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!st) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) orbitMoved = true;
    if (!orbitMoved) return;
    cam.yaw = cam.focus ? st.yaw + dx * 0.25 : Math.max(-75, Math.min(75, st.yaw + dx * 0.25));
    cam.tilt = Math.max(0, Math.min(70, st.tilt + dy * 0.2));
    applyCam();
  });
  el.addEventListener('pointerup', e => {
    // clic senza trascinare: l'espositore sotto il puntatore (la cattura del puntatore nasconde il vero bersaglio)
    if (st && !orbitMoved && !(e.target.closest && e.target.closest('.camctl'))) {
      const hit = document.elementFromPoint(e.clientX, e.clientY), ri = hit && hit.closest('.ritem');
      if (ri && roomMode === 'show') {
        const se = hit.closest('[data-slot]') || hit.closest('[data-t]'), ho = hit.closest('.holder');
        const slot = se ? +(se.dataset.slot != null ? se.dataset.slot : se.dataset.t) : ho ? +ho.dataset.h : null;
        openSample(ri.dataset.id, slot);
      } else if (ri) selectItem(ri.dataset.id);
      else if (roomMode === 'show') { if (showSel) closeSample(); }
      else selectItem(null);
    }
    st = null; setTimeout(() => orbitMoved = false, 0);
  });
  el.addEventListener('wheel', e => { e.preventDefault(); cam.zoom = Math.max(0.5, Math.min(4, cam.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1))); applyCam(); }, { passive: false });
}

/* ── pianta vista dall'alto: trascina per spostare ── */
let planS = 1;
function renderPlan() {
  const box = document.getElementById('roomPlan'); if (!box || !room) return;
  const W = box.clientWidth, H = box.clientHeight, pad = 22, top = 40;
  planS = Math.min((W - pad * 2) / room.w, (H - top - pad) / room.d);
  const ox = (W - room.w * planS) / 2, oz = top + (H - top - pad - room.d * planS) / 2;
  let h = `<div class="plan-legend">Pianta ${room.w}×${room.d} cm · muro in alto · trascina per spostare · ▼ = fronte</div>
    <div class="plan-room wall-b${room.wallL ? ' wall-l' : ''}${room.wallR ? ' wall-r' : ''}" style="left:${ox}px;top:${oz}px;width:${room.w * planS}px;height:${room.d * planS}px;background-size:${50 * planS}px ${50 * planS}px;box-sizing:content-box;margin-left:${room.wallL ? -6 : 0}px;margin-top:-6px"></div>`;
  room.items.slice().sort((a, b) => elevY(a) - elevY(b)).forEach(it => {
    const m = roomModels[it.id] || (roomModels[it.id] = roomModel(it));
    const c = comps[it.comp], d = DISP[it.disp], y = elevY(it), up = isUpper(it);
    h += `<div class="pitem${it.id === roomSel ? ' sel' : ''}${up ? ' up' : ''}${y > 0 && !isSystem(it) ? ' wallup' : ''}" data-id="${it.id}" style="left:${ox + it.x * planS}px;top:${oz + it.z * planS}px;width:${m.L * planS}px;height:${m.P * planS}px;transform:translate(-50%,-50%) rotate(${-(it.rot || 0)}deg)">
      <span>${esc(c ? c.name : d ? d.name : '')}${up ? ' ▲ sopra' : y > 0 ? ' · h ' + y : ''}</span></div>`;
  });
  box.innerHTML = h;
  box.querySelectorAll('.pitem').forEach(el => bindPlanDrag(el, ox, oz));
  box.onpointerdown = e => { if (!e.target.closest('.pitem')) selectItem(null); };
}
function bindPlanDrag(el, ox, oz) {
  el.addEventListener('pointerdown', e => {
    e.stopPropagation(); const it = room.items.find(i => i.id === el.dataset.id); if (!it) return;
    if (roomSel !== it.id) { roomSel = it.id; renderRoom(); }
    const carry = stackedAbove(it), skip = new Set(carry.map(o => o.id));
    const st = { x: e.clientX, y: e.clientY, ix: it.x, iz: it.z, iy: elevY(it), kids: carry.map(o => ({ o, dx: o.x - it.x, dz: o.z - it.z, dy: elevY(o) - elevY(it) })) };
    const place = o => {
      const pel = document.querySelector(`#roomPlan .pitem[data-id="${o.id}"]`), rel = document.querySelector(`#roomScene .ritem[data-id="${o.id}"]`);
      if (pel) { pel.style.left = (ox + o.x * planS) + 'px'; pel.style.top = (oz + o.z * planS) + 'px'; }
      if (rel) rel.style.transform = itemT(o);
    };
    let moved = false;
    const move = ev => {
      if (Math.abs(ev.clientX - st.x) + Math.abs(ev.clientY - st.y) > 3) moved = true;
      if (!moved) return;
      it.x = Math.round(Math.max(0, Math.min(room.w, st.ix + (ev.clientX - st.x) / planS)) / 5) * 5;
      it.z = Math.round(Math.max(0, Math.min(room.d, st.iz + (ev.clientY - st.y) / planS)) / 5) * 5;
      if (!isSystem(it)) it.y = st.iy;
      snapItem(it, skip);
      st.kids.forEach(k => { k.o.x = it.x + k.dx; k.o.z = it.z + k.dz; k.o.y = elevY(it) + k.dy; place(k.o); });
      place(it);
    };
    const up = () => {
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up);
      if (moved) { settleStacks(); saveRoom(); renderRoom(); }
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  });
}

/* ── pannello laterale: selezione e aggiunta ── */
function selectItem(id) { roomSel = id; renderRoom(); }
function renderRoomSide() {
  if (roomMode === 'show') {                       // sala mostra: solo l'elenco, clic = apre l'espositore
    const items = room.items.slice().sort((a, b) => a.x - b.x || elevY(a) - elevY(b));
    document.getElementById('roomItemsTitle').textContent = `Espositori (${items.length})`;
    document.getElementById('roomItemList').innerHTML = items.length ? items.map(it => {
      const c = comps[it.comp], d = DISP[it.disp];
      return `<button onclick="exploreItem('${it.id}')"><img src="${d ? d.img : ''}" alt="">
        <span><b>${esc(c ? c.name : d ? d.name : '')}</b><br><span style="color:var(--mid)">${esc(itemLabel(it))}${d && d.slots ? ' · ' + (c ? filledOf(c) : 0) + ' campioni' : ''}</span></span></button>`;
    }).join('') : `<div style="font-size:12px;color:var(--mid)">La sala mostra è vuota: premi "Modifica disposizione" per mettere gli espositori.</div>`;
    return;
  }
  const sel = room.items.find(i => i.id === roomSel), box = document.getElementById('roomSelBox');
  if (!sel) box.innerHTML = `<h4>Espositore selezionato</h4><div style="font-size:12px;color:var(--mid)">Clicca un espositore nella vista 3D o nella pianta.</div>`;
  else {
    const c = comps[sel.comp], d = DISP[sel.disp], m = roomModels[sel.id];
    const y = elevY(sel), shelf = d.mode === 'shelf';
    box.innerHTML = `<h4>Espositore selezionato</h4>
      <div class="t">${esc(c ? c.name : d.name)}</div>
      <div class="s">${esc(itemLabel(sel))} · cod. <b>${esc(itemCode(sel))}</b><br>${Math.round(m.L)}×${Math.round(m.P)} cm${d.slots ? (c ? ` · ${filledOf(c)} campioni` : ' · <span style="color:var(--red)">senza campioni</span>') : ''}
        ${isSystem(sel) ? `<br>${isUpper(sel) ? '▲ agganciato sopra un altro mobile (' + y + ' cm da terra)' : 'a terra'}` : ''}</div>
      ${shelf ? `<div class="row"><b>Altezza da terra</b> <input type="number" step="5" min="10" max="${room.h - 20}" value="${y}" onchange="setItemY(this.value)"> cm
        <button class="btn" onclick="nudgeY(5)">▲</button><button class="btn" onclick="nudgeY(-5)">▼</button></div>` : ''}
      ${d.mirror && DISP[d.mirror] ? `<div class="row"><b>Versione</b> ${[d, DISP[d.mirror]].sort((a, b) => (a.side || '').localeCompare(b.side || '') * -1).map(v =>
          `<button class="btn ${v.id === d.id ? 'dark' : ''}" onclick="switchVersion('${v.id}')">${esc(v.side || v.name)}</button>`).join('')}
          <span style="color:var(--mid)">· resta nello stesso posto</span></div>` : ''}
      ${d.mode === 'culla' && c ? cullaOptsHTML(d, c) : ''}
      ${d.sided ? `<div class="btns"><button class="btn ${sideOf(sel) === 'SX' ? 'dark' : ''}" onclick="setSide('SX')">SX</button><button class="btn ${sideOf(sel) === 'DX' ? 'dark' : ''}" onclick="setSide('DX')">DX</button></div>` : ''}
      <div class="btns"><button class="btn" onclick="rotItem(-90)">⟲ 90°</button><button class="btn" onclick="rotItem(-15)">⟲ 15°</button>
        <button class="btn" onclick="rotItem(15)">⟳ 15°</button><button class="btn" onclick="rotItem(90)">⟳ 90°</button></div>
      <div class="row"><b>Rotazione</b> <input type="number" step="5" value="${sel.rot || 0}" style="width:70px" onchange="setRot(this.value)"> °
        <button class="btn ${!(sel.rot || 0) ? 'dark' : ''}" onclick="setRot(0)">0°</button><button class="btn ${(sel.rot || 0) === 90 ? 'dark' : ''}" onclick="setRot(90)">90°</button>
        <button class="btn ${(sel.rot || 0) === 180 ? 'dark' : ''}" onclick="setRot(180)" title="Girato: il fronte guarda verso il muro (per metterlo schiena a schiena con un altro)">180°</button><button class="btn ${(sel.rot || 0) === 270 ? 'dark' : ''}" onclick="setRot(270)">270°</button></div>
      ${isUpper(sel) ? '' : `<div class="btns"><button class="btn ${sel.free ? '' : 'dark'}" onclick="setFree(false)" title="Appoggiato al muro di fondo">📌 Attaccato al muro</button>
        <button class="btn ${sel.free ? 'dark' : ''}" onclick="setFree(true)" title="Si può mettere in qualsiasi punto della stanza, anche in mezzo">↔ Staccato dal muro</button></div>`}
      <div class="btns"><button class="btn" onclick="toWall()" title="Lo appoggia al muro di fondo, girato verso la stanza">⇡ Al muro</button>
        <button class="btn" onclick="dupItem()">⧉ Duplica</button><button class="btn" onclick="removeItem()">🗑 Togli</button></div>
      ${d.slots ? `<div class="btns"><button class="btn dark" onclick="editItem()" style="flex:1">✎ Apri e modifica i campioni</button></div>` : ''}
      <div class="row" style="margin-top:4px">X <input type="number" step="5" value="${sel.x}" onchange="setItemPos('x', this.value)"> cm
        ${sel.free ? `· dal muro <input type="number" step="5" value="${Math.round(sel.z - m.P / 2)}" onchange="setItemPos('z', +this.value + ${m.P / 2})"> cm` : '<span style="color:var(--mid)">· a filo muro</span>'}</div>`;
  }
  // elenco "livelli": tutto quello che c'è nella stanza; clic = seleziona
  const items = room.items.slice().sort((a, b) => a.x - b.x || elevY(a) - elevY(b));
  document.getElementById('roomItemsTitle').textContent = `Espositori nella stanza (${items.length})`;
  document.getElementById('roomItemList').innerHTML = items.length ? items.map(it => {
    const c = comps[it.comp], d = DISP[it.disp], y = elevY(it);
    const where = isUpper(it) ? '▲ sopra' : y > 0 ? `h ${y} cm` : 'a terra';
    return `<button class="${it.id === roomSel ? 'sel' : ''}" onclick="selectItem('${it.id}')"><img src="${d ? d.img : ''}" alt="">
      <span><b>${esc(c ? c.name : d ? d.name : '')}</b><br><span style="color:var(--mid)">${esc(itemLabel(it))} · ${esc(itemCode(it))} · ${where}${d && d.slots && c ? ' · ' + filledOf(c) + ' campioni' : ''}</span></span></button>`;
  }).join('') : `<div style="font-size:12px;color:var(--mid)">La stanza è vuota: metti un espositore del cliente o uno dal catalogo.</div>`;
  const inRoom = new Set(room.items.map(i => i.comp));
  const cc = visibleComps(room.client).filter(c => !inRoom.has(c.id));
  document.getElementById('roomAddList').innerHTML = cc.length ? cc.map(c => `<div class="addrow"><img src="${DISP[c.disp].img}" alt="">
      <span><b>${esc(c.name)}</b><br><span style="color:var(--mid)">${filledOf(c)} campioni</span></span>
      <button class="btn" onclick="addCompItem('${c.id}')">＋ Metti</button></div>`).join('')
    : `<div style="font-size:12px;color:var(--mid)">Tutti gli espositori del cliente sono già nella stanza.</div>`;
}
/* ── Sala mostra: il campione si apre dentro la stanza (carrello che esce, tozzetto, cassetto, lastra) ── */
function exploreItem(id) { openSample(id, null); }
function openSample(id, slot) {
  const it = room.items.find(i => i.id === id); if (!it) return;
  const d = DISP[it.disp], c = comps[it.comp];
  if (!d || !d.slots) { toast(d ? d.name + ': mobile per cataloghi, senza campioni' : 'Espositore non trovato'); return; }
  if (!c || !c.slots.some(Boolean)) { toast('Questo espositore non ha ancora campioni'); return; }
  if (slot == null || slot >= c.slots.length || !c.slots[slot]) {
    const first = slot != null && slot < c.slots.length ? c.slots.findIndex((k, i) => k && i >= slot) : -1;
    slot = first >= 0 ? first : c.slots.findIndex(Boolean);
  }
  if (!showSel) cam.back = { yaw: cam.yaw, tilt: cam.tilt, zoom: cam.zoom };
  showSel = { item: id, slot };
  // niente ridisegno della stanza: si muovono solo i pezzi, come negli Espositori
  const root = itemEl(id);
  if (!root) renderRoom();
  else {
    const m = roomModels[id] = roomModel(it);
    const targets = (m.after || []).map(([sel]) => root.querySelector(sel)).filter(Boolean);
    let closed = false;
    if (showOpen) { showOpen.els.forEach(el => { if (!targets.includes(el)) { closeEl(el); closed = true; } }); showOpen = null; }
    applyOpen(id, m.after, closed ? 600 : 0);              // prima rientra quello aperto, poi esce il nuovo
  }
  sharpFace(id, slot);
  focusCam(true);
  renderShowCard();
}
/* telecamera sul campione aperto: vista di sbieco, oppure con lo Zoom dritta di fronte e a tutto schermo */
function focusCam(animate) {
  if (!showSel) return;
  const it = room.items.find(i => i.id === showSel.item), m = it && roomModels[it.id]; if (!m || !m.focus) return;
  const f = m.focus, r = (it.rot || 0) * Math.PI / 180, y0 = elevY(it);
  cam.focus = { x: it.x + f.x * Math.cos(r) + f.z * Math.sin(r), y: f.y - y0, z: it.z - f.x * Math.sin(r) + f.z * Math.cos(r), w: f.w, h: f.h };
  let fy = f.yaw, ft = f.tilt || 6;
  if (ui.roomZoom) { fy = Math.abs(f.yaw) > 45 ? Math.sign(f.yaw) * 90 : 0; ft = ft > 30 ? 86 : 0; }   // dritto di fronte (dall'alto per le lastre distese)
  let yaw = fy - (it.rot || 0); yaw = ((yaw + 540) % 360) - 180;
  cam.yaw = yaw; cam.tilt = ft; cam.zoom = 1;
  applyCam(animate);
}
function toggleRoomZoom() {
  ui.roomZoom = !ui.roomZoom; saveUI();
  const b = document.getElementById('rZoom'); if (b) b.classList.toggle('on', !!ui.roomZoom);
  if (showSel) focusCam(true); else toast(ui.roomZoom ? 'Zoom attivo: apri un campione per vederlo dritto e da vicino' : 'Zoom spento');
}
function closeSample() {
  showSel = null; cam.focus = null; ++showToken;
  if (showOpen) { showOpen.els.forEach(closeEl); showOpen = null; }   // rientra con l'animazione
  restoreFace();
  if (cam.back) Object.assign(cam, cam.back);
  applyCam(true); renderShowCard();
}
/* pezzi spostati per il campione aperto (carrello, cassetto, pagina...) con la loro posizione di partenza */
let showOpen = null, showToken = 0, showHi = null;
const itemEl = id => document.querySelector(`#roomScene .ritem[data-id="${id}"]`);
function applyOpen(id, after, delay) {
  const root = itemEl(id); if (!root || !after || !after.length) return;
  const tok = ++showToken;
  // passi: [selettore, transform, ritardo]; più passi sullo stesso pezzo = movimento in due tempi (es. culla: esce, poi si raddrizza)
  const steps = after.map(([sel, tf, dl]) => { const el = root.querySelector(sel); if (el && el.dataset.t0 == null) el.dataset.t0 = el.style.transform; return [el, tf, dl || 0]; }).filter(([el]) => el);
  const els = [...new Set(steps.map(st => st[0]))];
  els.forEach(el => { const own = steps.filter(st => st[0] === el); if (own.length > 1) el.dataset.mid = own[0][1]; else delete el.dataset.mid; });
  showOpen = { item: id, els };
  const run = () => {
    if (tok !== showToken) return;
    steps.forEach(([el, tf, dl]) => { el._closeTok = null; if (!dl) el.style.transform = tf; else setTimeout(() => { if (tok === showToken) el.style.transform = tf; }, dl); });
  };
  if (delay) setTimeout(run, delay); else requestAnimationFrame(() => requestAnimationFrame(run));
}
/* rimette a posto un pezzo; se si era aperto in due tempi, torna indietro passando per la posizione intermedia */
function closeEl(el) {
  if (!el.dataset.mid) { el.style.transform = el.dataset.t0; return; }
  const tok = el._closeTok = {};
  el.style.transform = el.dataset.mid;
  setTimeout(() => { if (el._closeTok === tok) el.style.transform = el.dataset.t0; }, 580);
}
/* la piastrella aperta si ridisegna ad alta risoluzione (da vicino nitida come negli Espositori); le altre restano leggere */
function sharpFace(id, slot) {
  restoreFace();
  const it = room.items.find(i => i.id === id), d = DISP[it.disp], c = comps[it.comp], s = c && SAMPLE[c.slots[slot]], root = itemEl(id);
  if (!s || !root) return;
  const hi = LOWMEM ? 11 : 14, tiled = !['rack', 'culla'].includes(d.mode);
  root.querySelectorAll(`.rf[data-slot="${slot}"]`).forEach(el => {
    const w = el.offsetWidth, h = el.offsetHeight; if (!w || !h) return;
    showHi = showHi || [];
    showHi.push([el, el.innerHTML]);
    el.innerHTML = photoLayer(s, w, h, tiled, hi);
  });
}
function restoreFace() { if (showHi) showHi.forEach(([el, html]) => { el.innerHTML = html; }); showHi = null; }
/* Girevoli uguali messi uno accanto all'altro (stessa fila, attaccati): si sfogliano come un unico espositore.
   Restituisce gli elementi della fila da sinistra a destra (un solo elemento se è staccato dagli altri). */
function swingRow(it) {
  const d = DISP[it.disp]; if (!d || d.mode !== 'swing') return [it];
  const same = room.items.filter(o => o.disp === it.disp && (o.rot || 0) === (it.rot || 0) && elevY(o) === elevY(it) && comps[o.comp]);
  const L = o => (roomModels[o.id] || roomModel(o)).L;
  const touch = (a, b) => Math.abs(a.z - b.z) <= 6 && Math.abs(Math.abs(a.x - b.x) - (L(a) + L(b)) / 2) <= 6;
  const row = [it], todo = [it];
  while (todo.length) { const a = todo.pop(); same.forEach(b => { if (!row.includes(b) && touch(a, b)) { row.push(b); todo.push(b); } }); }
  return row.sort((a, b) => a.x - b.x);
}
function stepSample(dir) {
  if (!showSel) return;
  const it = room.items.find(i => i.id === showSel.item), c = it && comps[it.comp]; if (!c) return;
  const row = swingRow(it);
  if (row.length > 1) {   // fila di girevoli attaccati: tutto il lato A della fila, poi tutto il lato B (in giro)
    const seq = [];
    for (const side of [0, 1]) row.forEach(o => {
      const cs = comps[o.comp].slots, L = Math.ceil(cs.length / 2);
      for (let h = 0; h < L; h++) { const s = h + side * L; if (s < cs.length && cs[s]) seq.push([o.id, s]); }
    });
    const k = seq.findIndex(([id, s]) => id === it.id && s === showSel.slot);
    if (seq.length && k >= 0) { const [id, s] = seq[(k + dir + seq.length) % seq.length]; openSample(id, s); return; }
  }
  let i = showSel.slot;
  for (let k = 0; k < c.slots.length; k++) { i = (i + dir + c.slots.length) % c.slots.length; if (c.slots[i]) break; }
  openSample(showSel.item, i);
}
function renderShowCard() {
  const box = document.getElementById('showCard'); if (!box) return;
  if (!showSel) { box.hidden = true; return; }
  const it = room.items.find(i => i.id === showSel.item), d = DISP[it.disp], c = comps[it.comp], s = SAMPLE[c.slots[showSel.slot]];
  box.hidden = false;
  const eye = `<button class="sc-eye" onclick="toggleShowMini()" title="${ui.showMini ? 'Mostra tutta la scheda' : 'Scheda ridotta: solo serie e colore'}">${ui.showMini
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7c2 0 3.8.7 5.3 1.7M22 12s-3.6 7-10 7c-2 0-3.8-.7-5.3-1.7"/><path d="M3 3l18 18"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'}</button>`;
  box.classList.toggle('mini', !!ui.showMini);
  if (ui.showMini) {   // scheda ridotta: solo serie + colore e le frecce, per non coprire la vista
    // frecce e occhio sempre fermi a sinistra; il nome dopo (la sua lunghezza non sposta i pulsanti); la X in fondo
    box.innerHTML = `<div class="sc-mini"><button class="btn" onclick="stepSample(-1)" title="Campione precedente">‹</button><button class="btn" onclick="stepSample(1)" title="Campione successivo">›</button>${eye}
      <div class="sc-name">${s ? `<b>${esc(s.s)}</b> ${esc(s.c)}` : 'Posto vuoto'}</div>
      <button class="btn sc-x" onclick="closeSample()" title="Chiudi">✕</button></div>`;
    return;
  }
  box.innerHTML = `${eye}<div class="sc-img" style="${s ? swatchStyle(s, true) : ''}"></div>
    <div class="sc-body">
      <div class="sc-pos">${esc(itemLabel(it))} · posto ${esc(slotName(d, showSel.slot, c.slots.length))}</div>
      ${s ? `<div class="sc-ser">${esc(s.s)}</div><div class="sc-col">${esc(s.c)}</div>
        <div class="sc-meta">${esc(s.b)} · ${esc(s.toz ? 'tozzetto ' + fmt(tozFmt(d, c)) + tozFrom(s) : fmt(s.z))} · ${esc(s.t.map(t => t + ' mm').join(' / '))}</div>
        ${s.f.length ? `<div class="sc-meta">${esc(s.f.join(', '))}</div>` : ''}
        ${s.k.length ? `<div class="sc-meta">Codici: <b>${esc(s.k.join(' / '))}</b></div>` : ''}
        ${hasPhoto(s) ? '' : '<div class="sc-meta" style="color:var(--red)">foto non ancora caricata</div>'}` : '<div class="sc-ser">Posto vuoto</div>'}
      <div class="sc-btns"><button class="btn" onclick="stepSample(-1)">‹</button><button class="btn" onclick="stepSample(1)">›</button>
        <button class="btn dark" onclick="closeSample()">✕ Chiudi</button></div>
    </div>`;
}
/* occhio della scheda campione: scheda completa ↔ solo serie e colore (resta così anche per i prossimi campioni) */
function toggleShowMini() { ui.showMini = !ui.showMini; saveUI(); renderShowCard(); }
function freeSpot(L, P) {
  // prova posizioni lungo il muro di fondo, poi più avanti
  for (let z = P / 2 + 10; z < room.d; z += 60)
    for (let x = L / 2 + 20; x < room.w - L / 2; x += 20) {
      const hit = room.items.some(it => { const m = roomModels[it.id]; return m && Math.abs(it.x - x) < (m.L + L) / 2 + 10 && Math.abs(it.z - z) < (m.P + P) / 2 + 10; });
      if (!hit) return { x: Math.round(x / 5) * 5, z: Math.round(z / 5) * 5 };
    }
  return { x: room.w / 2, z: room.d / 2 };
}
function addCompItem(compId) {
  const c = comps[compId]; const it = { id: uid(), comp: compId, disp: c.disp, x: 0, z: 0, rot: 0 };
  const m = roomModel(it), p = freeSpot(m.L, m.P); it.x = p.x; it.z = p.z;
  room.items.push(it); roomModels[it.id] = m; snapItem(it); roomSel = it.id; saveRoom(); renderRoom();
}
function addCatalogItem(dispId) {
  const d = DISP[dispId], cid = room.client, n = clientComps(cid).filter(x => x.disp === dispId).length;
  const prev = ui.client; ui.client = cid;
  const c = makeComp(d, d.name + (n ? ' ' + (n + 1) : '')); c.explicit = true; ui.client = prev; saveComps();
  addCompItem(c.id); toast('Espositore aggiunto: aprilo per inserire i campioni');
}
const selItem = () => room.items.find(i => i.id === roomSel);
function rotItem(a) { const it = selItem(); if (!it) return; setRot((it.rot || 0) + a); }
/* rotazione a scelta (gradi). Girato verso il muro (fra 135° e 225°) non può stare attaccato: si stacca e va avanti */
function setRot(deg) {
  const it = selItem(); if (!it) return; const r = ((Math.round(+deg || 0) % 360) + 360) % 360;
  [it, ...stackedAbove(it)].forEach(o => o.rot = r);
  delete roomModels[it.id];
  if (r > 135 && r < 225 && !it.free && !isUpper(it)) { it.free = true; it.z = Math.min(room.d - extOf(it).hz, it.z + 60); toast('Girato verso il muro: l\'ho staccato dal muro, trascinalo dove vuoi'); }
  snapItem(it); stackedAbove(it).forEach(o => { o.x = it.x; o.z = it.z; });
  saveRoom(); renderRoom();
}
/* Incolla codici in sala mostra: chiede in quali espositori (uno o più, nell'ordine da sinistra a destra) */
async function roomPaste() {
  const seen = new Set(), list = room.items.slice().sort((a, b) => a.x - b.x || elevY(a) - elevY(b)).filter(it => {
    const d = DISP[it.disp], c = comps[it.comp]; if (!d || !d.slots || !c || seen.has(c.id)) return false; seen.add(c.id); return true;
  });
  if (!list.length) { toast('In questa stanza non ci sono espositori con posti per i campioni'); return; }
  const open = showSel && room.items.find(i => i.id === showSel.item);
  const choices = list.map((it, k) => { const c = comps[it.comp]; return { id: c.id, label: c.name, sub: `${itemLabel(it)} · liberi ${c.slots.filter(x => !x).length}/${c.slots.length}`, on: open ? open.comp === c.id : k === 0 }; });
  const r = await pasteDialog('Incolla i codici: uno per riga (anche le righe intere dell\'ordine). Vanno nei posti vuoti, in ordine.', choices);
  if (!r || !r.text.trim()) return;
  const order = choices.map(c => c.id).filter(id => r.picks.includes(id));
  const o = fillWithCodes(order.flatMap(cid => comps[cid].slots.map((_, i) => ({ cid, i }))), r.text, r.all);
  roomModels = {}; renderRoom(); renderRoomSide();
  if (document.getElementById('csModal') && document.getElementById('csModal').classList.contains('open')) renderSampleBoard();
  pasteReport(o);
}
/* Culla modulare in sala mostra: quanti moduli, versione SX / DX (verso dove guardano i campioni), formato misto o unico */
function cullaOptsHTML(d, c) {
  const per = d.perModule || 1, n = c.slots.length, dx = c.side === 'DX';
  const b = (t, on, fn, tip) => `<button class="btn ${on ? 'dark' : ''}" title="${esc(tip || '')}" onclick="${fn}">${t}</button>`;
  return `<div class="row"><b>Moduli</b> ${(d.variants || [n]).map((v, k) => b(k + 1, v === n, `roomCulla('variant', ${v})`, (d.variantLabels || {})[v] + ' · ' + v + ' posti')).join('')}</div>
    <div class="row"><b>Versione</b> ${b('◄ SX', !dx, `roomCulla('side', 'SX')`, 'Campioni girati verso destra')}${b('DX ►', dx, `roomCulla('side', 'DX')`, 'Campioni girati verso sinistra')}</div>
    <div class="row"><b>Formato</b> ${b('Misti', !c.fmt, `roomCulla('fmt', '')`, 'Formati diversi insieme')}${(d.accept.sizes || []).map(z => b(fmt(z), c.fmt === z, `roomCulla('fmt', '${z}')`, 'Solo ' + fmt(z))).join('')}</div>`;
}
async function roomCulla(what, v) {
  const it = selItem(); if (!it) return; const c = comps[it.comp]; if (!c) return;
  if (what === 'variant') {
    const lost = c.slots.slice(v).filter(Boolean).length;
    if (lost && !await ask(`Con meno moduli ${lost} campioni restano fuori. Continuare?`)) return;
    c.variant = v; c.slots = c.slots.slice(0, v); while (c.slots.length < v) c.slots.push(null);
  } else if (what === 'side') c.side = v;
  else c.fmt = v || '';
  c.upd = Date.now(); saveComps();
  delete roomModels[it.id]; snapItem(it); saveRoom(); renderRoom();
  if (what === 'fmt' && v) { const other = c.slots.filter(k => k && SAMPLE[k] && !sameFmt(SAMPLE[k].z, v)).length; if (other) toast(`Solo ${fmt(v)} · ${other} campioni di altri formati sono ancora dentro`); }
}
/* attaccato al muro (normale) o staccato: libero in tutta la stanza; se lo stacchi va 60 cm più avanti per vederlo subito */
function setFree(on) {
  const it = selItem(); if (!it) return; const kids = stackedAbove(it);
  if (on && !it.free) it.z = Math.min(room.d - extOf(it).hz, it.z + 60);
  it.free = !!on; if (!on) delete it.free;
  snapItem(it); kids.forEach(o => { o.z = it.z; o.x = it.x; if (on) o.free = true; else delete o.free; });
  saveRoom(); renderRoom();
  toast(on ? 'Staccato dal muro: trascinalo nella pianta dove vuoi' : 'Attaccato al muro');
}
function toWall() {
  const it = selItem(); if (!it) return; const kids = stackedAbove(it);
  delete it.free; kids.forEach(o => delete o.free);
  it.rot = 0; it.z = roomModels[it.id].P / 2 + wallGap(it);
  kids.forEach(o => { o.rot = 0; o.z = it.z; o.x = it.x; });
  saveRoom(); renderRoom();
}
/* copia indipendente della composizione di un espositore (stessi campioni, ma da qui in poi separati) */
function cloneCompFor(it, n) {
  const c = comps[it.comp]; if (!c) return null;
  const x = Object.assign({}, c, { id: uid(), name: c.name + ' (' + n + ')', slots: c.slots.slice(), upd: Date.now(), explicit: true });
  comps[x.id] = x; return x.id;
}
function dupItem() {
  const it = selItem(); if (!it) return;
  const x = Object.assign({}, it, { id: uid() }); const m = roomModels[it.id], p = freeSpot(m.L, m.P); x.x = p.x; x.z = p.z;
  if (comps[it.comp]) { x.comp = cloneCompFor(it, room.items.filter(o => o.disp === it.disp).length + 1); saveComps(); }   // la copia ha i suoi campioni
  if (isSystem(x)) x.y = 0;
  room.items.push(x); roomModels[x.id] = m; snapItem(x); roomSel = x.id; saveRoom(); renderRoom();
}
function removeItem() { room.items = room.items.filter(i => i.id !== roomSel); roomSel = null; settleStacks(); saveRoom(); renderRoom(); }
function setItemY(v) { const it = selItem(); if (!it) return; it.y = Math.max(10, Math.min(room.h - 20, Math.round(+v || 0))); saveRoom(); renderRoom(); }
function nudgeY(dv) { const it = selItem(); if (!it) return; setItemY(elevY(it) + dv); }
function switchVersion(newId) {
  const it = selItem(), nd = DISP[newId]; if (!it || !nd) return;
  const od = DISP[it.disp], c = comps[it.comp];
  room.items.forEach(o => { if (o === it || (c && o.comp === it.comp)) { o.disp = newId; delete roomModels[o.id]; } });
  if (c) { c.disp = newId; if (c.name === od.name) c.name = nd.name; c.upd = Date.now(); saveComps(); }
  saveRoom(); renderRoom(); toast(`${od.name} → ${nd.name}`);
}
function setSide(sd) { const it = selItem(); if (!it) return; it.side = sd; delete roomModels[it.id]; saveRoom(); renderRoom(); }
function copyDistinta() {
  const cl = clients[room.client], rows = room.items.slice().sort((a, b) => a.x - b.x || elevY(a) - elevY(b));
  const lines = [`Distinta ambientazione "${room.name}" — ${cl ? cl.name : ''}`, ''];
  const tot = {};
  rows.forEach(it => {
    const c = comps[it.comp], code = itemCode(it);
    tot[code] = tot[code] || { n: 0, name: itemLabel(it) }; tot[code].n++;
    lines.push(`${code}\t${itemLabel(it)}\t${c ? c.name + (DISP[it.disp].slots ? ' · ' + filledOf(c) + ' campioni' : '') : ''}`);
  });
  lines.push('', 'Totale per codice:');
  Object.entries(tot).forEach(([code, t]) => lines.push(`${t.n}× ${code}\t${t.name}`));
  const txt = lines.join('\n');
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Distinta copiata'), () => showCopy('Copia la distinta:', txt));
}
function setItemPos(f, v) { const it = selItem(); if (!it) return; it[f] = Math.max(0, Math.min(f === 'x' ? room.w : room.d, Math.round(+v || 0))); settleStacks(); saveRoom(); renderRoom(); }
function editItem() {
  const it = selItem(); if (!it) return;
  if (!comps[it.comp]) {   // composizione eliminata: ne crea una nuova per il cliente
    const prev = ui.client; ui.client = room.client; const c = makeComp(DISP[it.disp], DISP[it.disp].name); c.explicit = true; ui.client = prev;
    it.comp = c.id; saveComps(); saveRoom();
  }
  openComp(it.comp, '#/ambiente/' + room.id);
}
document.addEventListener('keydown', e => {
  if (document.body.dataset.view !== 'room' || e.target.matches('input, select, textarea') || !selItem()) return;
  const it = selItem(), step = e.shiftKey ? 50 : 5;
  if (e.key === 'r' || e.key === 'R') rotItem(e.shiftKey ? -15 : 15);
  else if (e.key === 'Delete' || e.key === 'Backspace') removeItem();
  else if (e.key.startsWith('Arrow')) {
    e.preventDefault();
    if (e.key === 'ArrowLeft') it.x = Math.max(0, it.x - step); if (e.key === 'ArrowRight') it.x = Math.min(room.w, it.x + step);
    snapItem(it);
    saveRoom(); renderRoom();
  }
});
document.addEventListener('keydown', e => {
  if (document.body.dataset.view !== 'show' || !showSel || e.target.matches('input, select, textarea')) return;
  const board = document.getElementById('csModal'); if (board && board.classList.contains('open')) return;   // si sta sistemando i campioni
  if (e.key === 'Escape') closeSample();
  if (e.key === 'ArrowRight') stepSample(1);
  if (e.key === 'ArrowLeft') stepSample(-1);
});
window.addEventListener('resize', () => { if (['room', 'show'].includes(document.body.dataset.view)) { applyCam(); renderPlan(); } });
