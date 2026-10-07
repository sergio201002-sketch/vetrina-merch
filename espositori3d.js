'use strict';
/* ════════════════════════════════════════════════════════════
   ESPOSITORI 3D REALISTICI, costruiti sulle schede del catalogo (misure reali, 1 px = 1 cm):
   • Fly / Megaesp Fly / Fly slabs  → due ali di pagine appese a una colonna centrale, che si sfogliano
   • Flipper / Espositore slabs     → pila di pagine che girano come un libro attorno a un montante
   • Lavagna / Totem                → lastra su base nera (lavagna inclinata, totem fronte e retro)
   • Cassettiere 60×120 / 120×120 / 120×240 e cubo → cassetti con la lastra distesa, che si estraggono
   • Carrellati, basi culla, basi piane 20 mm, culla legni → piastrelle in piedi negli incavi
   • Espositori da banco            → vassoio nero con i tozzetti in piedi
   Ogni modello usa la stessa firma dei modelli della stanza: (d, c, op) → { html, L, P, H, after, focus }.
   Lo stesso modello disegna anche il configuratore (renderModel3D) e la sala mostra.
   ════════════════════════════════════════════════════════════ */

const bx3 = (x, y, z, w, h, dd) => box3d(x, y, z, w, h, dd, METAL);
/* piastrella con faccia (senza scritte) e spessore; i = posto → animabile e cliccabile */
const tileOf = (d, c, i, w, h, tiled, tf, extra) =>
  tileDiv(w, h, tf + (extra || ''), rface(d, c, i, w, h, tiled) + tileBody(d, c, i, w, h, tiled, 1), i);
const rn = n => Math.round(n * 100) / 100;

/* ── Fly, Megaesp Fly, Fly slabs: due ali di pagine appese, colonna al centro ──
   Chiuso: le pagine sono una dietro l'altra, parallele al muro. Aperto sul posto N: le pagine davanti
   alla N, della stessa ala, si aprono di 90° attorno alla colonna e si vede la N di fronte. */
function bookWings(d, c, op) {
  const { L: L0, P: P0, H: H0 } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
  const half = Math.ceil(n / 2), L = Math.max(L0, 2 * fw + 24), P = Math.max(P0, 70), H = Math.max(H0, fh + 28);
  const GAP = 3, yb = 12, zf = P / 2 - 16, pitch = Math.min(8, (P - 40) / Math.max(1, half - 1));
  const left = i => i < half, jOf = i => left(i) ? i : i - half;
  const zOf = i => zf - jOf(i) * pitch, xOf = i => left(i) ? -GAP - fw : GAP;
  const closedT = i => tr(xOf(i), -yb - fh, zOf(i));
  const openT = i => tr(xOf(i), -yb - fh, zOf(i), left(i) ? 'rotateY(90deg)' : 'rotateY(-90deg)');
  let h = bx3(-L / 2, -8, P / 2, L, 8, P);                                           // base
  h += bx3(-L / 2, -H, -P / 2 + 4, L, H - 8, 3);                                     // pannello posteriore (fissaggio a muro)
  h += bx3(-L / 2, -H, P / 2 - 6, 6, H - 8, P - 8) + bx3(L / 2 - 6, -H, P / 2 - 6, 6, H - 8, P - 8);   // fianchi
  h += bx3(-L / 2, -H, P / 2 - 6, L, 5, P - 8);                                       // cielo
  h += bx3(-1.5, -H + 5, zf + 8, 3, H - 13, zf + 8 + P / 2 - 8);                       // colonna delle cerniere
  for (let i = 0; i < n; i++) h += tileOf(d, c, i, fw, fh, true, 'transform:' + closedT(i), left(i) ? ';transform-origin:100% 0' : '');
  const m = { html: h, L, P, H, fitW: L };
  if (op >= 0) {
    const wing = left(op), jo = jOf(op);
    m.after = [];
    for (let i = 0; i < n; i++) if (left(i) === wing && jOf(i) < jo) m.after.push([`.ttile[data-t="${i}"]`, openT(i)]);
    m.focus = { x: xOf(op) + fw / 2, y: -yb - fh / 2, z: zOf(op), w: fw, h: fh, yaw: 0, tilt: 4 };
  }
  return m;
}

/* ── Flipper (100×200) ed Espositore slabs (120×278): pagine in pila che girano come un libro ──
   Chiuso: pagine di taglio lungo la profondità (si vedono i bordi). Aperto sul posto N: le pagine 0…N
   si aprono davanti attorno al montante anteriore, la N resta in primo piano di fronte. */
function bookStack(d, c, op) {
  const { L: L0, P: P0, H: H0 } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
  const L = Math.max(L0, 40), P = Math.max(P0, fw + 8), H = Math.max(H0, fh + 28), yb = 12;
  const pitch = (L - 14) / Math.max(1, n), zf = P / 2 - 4, xs = -L / 2 + 6;
  const xOf = j => xs + (n - 1 - j) * pitch;
  const closedT = j => tr(xOf(j), -yb - fh, zf, 'rotateY(90deg)');
  const openT = j => tr(xOf(j), -yb - fh, zf + j * 0.7, 'rotateY(0deg)');
  let h = bx3(-L / 2, -10, P / 2, L, 10, P);                                         // base
  h += bx3(-L / 2, -H, -P / 2 + 4, L, H - 10, 3);                                    // schienale
  h += bx3(-L / 2, -H, P / 2, 4, H - 10, P);                                          // fianco sinistro (copertina nera)
  h += bx3(-L / 2, -H, P / 2, L, 4, P);                                               // cielo
  h += bx3(L / 2 - 3, -H + 4, -P / 2 + 6, 3, 14, P - 8);                              // traversa destra in alto
  for (let j = 0; j < n; j++) h += tileOf(d, c, j, fw, fh, true, 'transform:' + closedT(j));
  const m = { html: h, L, P, H, fitW: L + fw };
  if (op >= 0) {
    m.after = [];
    for (let j = 0; j <= op; j++) m.after.push([`.ttile[data-t="${j}"]`, openT(j)]);
    m.focus = { x: xOf(op) + fw / 2, y: -yb - fh / 2, z: zf + op * 0.7, w: fw, h: fh, yaw: 0, tilt: 4 };
  }
  return m;
}

/* ── Lavagna 160×160 e Totem slabs 120×278 ── */
function wallBoard(d, c, op) {
  const { L: L0, P, H: H0 } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
  if (d.id === 'PWA') {   // lavagna: lastra appoggiata, inclinata all'indietro, su base nera con labbro anteriore
    const L = Math.max(L0, fw + 4), BH = 14, tilt = 8, zs = P / 2 - 12;
    let h = bx3(-L / 2, -BH, P / 2, L, BH, P);
    h += bx3(-L / 2, -BH - 11, P / 2, L, 11, 4);                                      // labbro che trattiene la lastra
    const plane = (x, w, hh, col, z, ex) => `<div class="bx" style="width:${w}px;height:${hh}px;background:${col};transform-origin:0 100%;transform:translate3d(${x}px,${-BH - hh}px,${z}px) rotateX(${tilt}deg)${ex || ''}"></div>`;
    h += plane(-fw / 2 - 4, fw + 8, fh + 10, METAL.front, zs - 4);                      // telaio posteriore nero
    h += tileDiv(fw, fh, `transform:translate3d(${-fw / 2}px,${-BH - fh}px,${zs}px) rotateX(${tilt}deg);transform-origin:0 100%`, rface(d, c, 0, fw, fh, true) + tileBody(d, c, 0, fw, fh, true, 1), 0);
    const m = { html: h, L, P, H: Math.max(H0, fh + BH + 8) };
    if (op >= 0) m.focus = { x: 0, y: -BH - fh / 2, z: zs, w: fw, h: fh, yaw: 0, tilt: 4 };
    return m;
  }
  // totem: lastra in piedi, con profilo nero sui lati e piastra di base; fronte e retro
  const L = Math.max(L0, fw + 8), top = -Math.max(H0, fh + 10), zz = 0;
  let h = bx3(-L / 2, -8, P / 2, L, 8, P);
  h += bx3(-fw / 2 - 3, top, zz + 3, 3, -top - 8, 6) + bx3(fw / 2, top, zz + 3, 3, -top - 8, 6);   // profili laterali
  h += bx3(-fw / 2 - 3, top, zz + 3, fw + 6, 3, 6);                                                  // testata
  h += tileDiv(fw, fh, T(-fw / 2, top + 3, zz + 1.5), rface(d, c, 0, fw, fh, true) + (n > 1 ? rface(d, c, 1, fw, fh, true, true) : rplain('metal', true)), 0);
  const m = { html: h, L, P, H: -top };
  if (op >= 0) m.focus = { x: 0, y: top + 3 + fh / 2, z: zz + 1.5, w: fw, h: fh, yaw: op === 1 ? 180 : 0, tilt: 4 };
  return m;
}

/* ── Cassettiere (PMV 60×120, PMI 120×120, PMJ 120×240) e cubo (PMK) ──
   Ogni cassetto ha frontale nero, fondo e la lastra distesa. PMI/PMJ hanno il fronte a gradoni. */
function drawerCabinet(d, c, op) {
  const { L, P, H } = parseDims(d), [fw0, fh0] = d.face, n = c.slots.length;
  const cube = d.id === 'PMK', wide = d.id === 'PMI' || d.id === 'PMJ';
  const t = 2.5, plinth = cube ? 14 : 7, top = 3;
  const area = H - plinth - top, pitch = area / n, frontH = cube ? 0 : Math.max(2.5, pitch - 1);
  const step = wide ? 5 : 0;
  const yBot = i => -plinth - (n - 1 - i) * pitch;                       // fondo del cassetto i (0 = in alto)
  const zFront = i => P / 2 - (n - 1 - i) * step;
  const pull = Math.min(P * 0.9, fh0 + 24);
  const tileT = i => tr(-fw0 / 2, yBot(i) - 1.8, zFront(i) - 3 - fh0, 'rotateX(90deg)');
  var fw = Math.min(fw0, L - 2 * t - 4);
  let h = bx3(-L / 2, -H, -P / 2 + 3, L, H - plinth + 1, 3);                     // schienale
  if (!step) h += bx3(-L / 2, -H, P / 2, t, H - plinth, P) + bx3(L / 2 - t, -H, P / 2, t, H - plinth, P);   // fianchi
  else for (let i = 0; i < n; i++) {                                              // fianchi a gradoni
    h += bx3(-L / 2, yBot(i) - pitch, zFront(i), t, pitch, zFront(i) + P / 2 - 3) + bx3(L / 2 - t, yBot(i) - pitch, zFront(i), t, pitch, zFront(i) + P / 2 - 3);
  }
  h += bx3(-L / 2, -H, zFront(0), L, top, zFront(0) + P / 2 - 3);                   // piano
  h += bx3(-L / 2 + 4, -plinth, P / 2 - 3, L - 8, plinth, P - 8);                   // zoccolo
  if (cube) h += bx3(-L / 2, -plinth, P / 2, L, plinth - 2, 2);                      // pannello frontale del basamento
  for (let i = 0; i < n; i++) {
    const zf = zFront(i), y = yBot(i), dep = zf + P / 2 - 5;
    h += `<div class="bx drawer3d" data-dr="${i}" style="transform:translate3d(0,0,0);transform-style:preserve-3d">`;
    h += bx3(-(L - 2 * t) / 2, y - 1.5, zf - 1, L - 2 * t, 1.5, dep);                // fondo
    if (!cube) {
      h += `<div class="bx rf metal" data-slot="${i}" style="width:${L - 2 * t}px;height:${frontH}px;transform:translate3d(${-(L - 2 * t) / 2}px,${y - frontH}px,${zf + 0.4}px)"></div>`;   // frontale
      h += bx3(-(L - 2 * t) / 2, y - 4, zf - 1, 1.2, 2.5, dep) + bx3((L - 2 * t) / 2 - 1.2, y - 4, zf - 1, 1.2, 2.5, dep);    // sponde basse
    }
    h += tileDiv(fw0, fh0, tileT(i).replace(/^/, 'transform:') + ';transform-style:preserve-3d', rface(d, c, i, fw0, fh0, true) + tileBody(d, c, i, fw0, fh0, true, 1), i);
    h += `</div>`;
  }
  const m = { html: h, L, P, H };
  if (op >= 0 && op < n) {
    m.after = [[`.drawer3d[data-dr="${op}"]`, `translate3d(0,0,${pull}px)`]];
    m.focus = { x: 0, y: yBot(op) - 2, z: zFront(op) - 3 - fh0 / 2 + pull, w: fw0, h: fh0 * 0.9, yaw: 0, tilt: 52 };
  }
  return m;
}

/* ── Cassettiera 60×120 (PMV), come nella foto del catalogo: mobile nero con fianchi e cielo spessi,
   davanti nessun frontale: si vedono i bordi delle 18 lastre una sopra l'altra. Ogni cassetto è un vassoio
   grigio sottile con due piccole maniglie nere agli angoli; il cassetto scelto esce con la lastra sopra. */
const TRAY = { front: 'linear-gradient(180deg,#a9a9ab,#8e8e90)', top: '#b9b9bb', side: '#7d7d80' };
function cassettiera60(d, c, op) {
  const { L, P, H } = parseDims(d), [fw, fh] = d.face, n = c.slots.length;
  const t = 4.5, top = 4.5, plinth = 4, Wi = L - 2 * t, zf = P / 2 - 1.5, pitch = (H - plinth - top - 2) / n, pull = fh - 2;
  const yb = i => -plinth - 1 - (n - 1 - i) * pitch;                         // piano del vassoio i (0 = in alto)
  let h = bx3(-L / 2, -H, -P / 2 + 2, L, H, 2);                              // schienale
  h += bx3(-L / 2, -H, P / 2, t, H, P) + bx3(L / 2 - t, -H, P / 2, t, H, P); // fianchi
  h += bx3(-L / 2, -H, P / 2, L, top, P) + bx3(-L / 2, -plinth, P / 2, L, plinth, P);   // cielo e base
  for (let i = 0; i < n; i++) {
    const y = yb(i), s = SAMPLE[c.slots[i]], T = Math.max(1, tileThickCm(d, c, i)), yf = y - 0.6 - T;
    h += `<div class="bx drawer3d" data-dr="${i}" data-slot="${i}" style="transform:translate3d(0,0,0);transform-style:preserve-3d">`;
    h += box3d(-Wi / 2 + 0.5, y - 0.6, zf, Wi - 1, 0.6, fh + 4, TRAY);                                     // vassoio
    h += bx3(-Wi / 2 + 1, y - 2.2, zf + 2, 5, 1.6, 2.5) + bx3(Wi / 2 - 6, y - 2.2, zf + 2, 5, 1.6, 2.5);   // maniglie
    if (s) {
      h += tileDiv(fw, fh, `transform:${tr(-fw / 2, yf, zf - 1 - fh, 'rotateX(90deg)')};transform-style:preserve-3d`, rface(d, c, i, fw, fh, true) + tileBody(d, c, i, fw, fh, true, 1), i);
      h += `<div class="bx cedge" data-e="${i}" style="width:${fw}px;height:${T}px;${faceBg(s, fw, T * 2, false)}transform:translate3d(${-fw / 2}px,${yf}px,${zf - 0.95}px)"></div>`;   // bordo della lastra, del suo colore
    }
    h += `</div>`;
  }
  const m = { html: h, L, P, H };
  if (op >= 0 && op < n) {
    // il cassetto esce, poi la lastra si alza in piedi sul bordo del vassoio (appena inclinata indietro):
    // così si vede tutta la 60×120 di fronte e non solo il suo spessore
    const y = yb(op), T = Math.max(1, tileThickCm(d, c, op)), yf = y - 0.6 - T, a = 10, ra = a * Math.PI / 180, zb = zf - 2;
    const up = tr(-fw / 2, yf - fh * Math.cos(ra), zb - fh * Math.sin(ra), `rotateX(${a}deg)`);
    m.after = [[`.drawer3d[data-dr="${op}"]`, `translate3d(0,0,${pull}px)`], [`.ttile[data-t="${op}"]`, up, 560], [`.cedge[data-e="${op}"]`, `translate3d(${-fw / 2}px,${yf}px,${zf - 0.95}px) scale3d(0,0,0)`, 560]];
    m.focus = { x: 0, y: yf - fh / 2, z: zb + pull - 5, w: fw, h: fh, yaw: 0, tilt: 6 };
  }
  return m;
}

/* ── Carrellati (OYQ, PEX), basi culla (PL5 inclinata, PL8 piana), basi piane 20 mm (PJR, PJT, PJU) ──
   Piastrelle in piedi negli incavi, una dietro l'altra, leggermente inclinate all'indietro. */
function rackStack(d, c, op) {
  const { L, P: P0, H: H0 } = parseDims(d), n = c.slots.length;
  const sizes = (d.accept.sizes || [d.face.join('x')]).map(parseSize).map(sorted2);
  const maxH = Math.max(...sizes.map(s => s[1]));
  const cart = d.id === 'OYQ' || d.id === 'PEX', wedge = d.id === 'PL5';
  const P = Math.max(P0, 30), tilt = wedge ? 18 : cart ? 7 : 6;
  const plat = cart ? 22 : Math.max(5, H0);
  const pitch = (P - 10) / Math.max(1, n), zOf = i => P / 2 - 6 - i * pitch;
  const baseY = i => wedge ? 8 + Math.min(3, Math.floor(((P / 2 - zOf(i)) / P) * 4)) * 6.7 : plat;       // la base inclinata sale verso il retro
  let h = '';
  if (cart) {
    h += bx3(-L / 2, -plat, P / 2, L, plat - 8, P);                                      // vasca con gli incavi
    [[-L / 2 + 5, P / 2 - 7], [L / 2 - 10, P / 2 - 7], [-L / 2 + 5, -P / 2 + 12], [L / 2 - 10, -P / 2 + 12]].forEach(([x, z]) => { h += bx3(x, -8, z, 5, 8, 5); });   // ruote
    h += bx3(-L / 2, -plat - 55, P / 2, 3, 55, P) + bx3(L / 2 - 3, -plat - 55, P / 2, 3, 55, P);       // fianchi laterali
    h += bx3(-L / 2, -H0, -P / 2 + 5, 3, H0 - plat, 4) + bx3(L / 2 - 3, -H0, -P / 2 + 5, 3, H0 - plat, 4) + bx3(-L / 2, -H0, -P / 2 + 5, L, 3, 4);   // telaio con maniglia
  } else if (wedge) {
    for (let k = 0; k < 4; k++) h += bx3(-L / 2, -(8 + k * 6.7), P / 2 - k * P / 4, L, 8 + k * 6.7, P / 4);
  } else h += bx3(-L / 2, -plat, P / 2, L, plat, P);
  const openZ = P / 2 + 12;
  let pos = [];
  for (let i = 0; i < n; i++) {
    const [w, th] = sizeOfSlot(c, i, sizes[0]), by = baseY(i);
    h += tileOf(d, c, i, w, th, false, `transform:${tr(-w / 2, -by - th, zOf(i), `rotateX(${tilt}deg)`)};transform-origin:0 100%`);
    pos[i] = { w, th, by };
  }
  const m = { html: h, L, P, H: (cart ? H0 : plat + maxH) };
  if (op >= 0 && pos[op]) {
    const { w, th, by } = pos[op];
    m.after = [[`.ttile[data-t="${op}"]`, tr(-w / 2, -by - th - 6, openZ, 'rotateX(0deg)')]];
    m.focus = { x: 0, y: -by - 6 - th / 2, z: openZ, w, h: th, yaw: 0, tilt: 6 };
  }
  return m;
}

/* ── Culla base legni 20×120: doghe in piedi lungo la base, inclinate come in una culla ── */
function rackPlanks(d, c, op) {
  const { L, P, H } = parseDims(d), n = c.slots.length;
  const [w, th] = [20, 120], plat = Math.max(5, H), pitch = (L - 14) / Math.max(1, n);
  let h = bx3(-L / 2, -plat, P / 2, L, plat, P);
  h += bx3(-L / 2 + 2, -plat - 2, P / 2 - 1.5, L - 4, 2, 2) + bx3(-L / 2 + 2, -plat - 2, -P / 2 + 3, L - 4, 2, 2);   // guide degli incavi
  const xOf = i => -L / 2 + 7 + i * pitch;
  for (let i = 0; i < n; i++) h += tileOf(d, c, i, w, th, false, 'transform:' + tr(xOf(i), -plat - th, P / 2 - 8, 'rotateY(62deg)'));
  const m = { html: h, L, P, H: plat + th, fitW: L };
  if (op >= 0) {
    const xo = Math.max(-L / 2 - 5, Math.min(L / 2 - w + 5, xOf(op)));
    m.after = [[`.ttile[data-t="${op}"]`, tr(xo, -plat - th - 4, P / 2 + 20, 'rotateY(0deg)')]];
    m.focus = { x: xo + w / 2, y: -plat - 4 - th / 2, z: P / 2 + 20, w: w * 2.2, h: th, yaw: 0, tilt: 6 };
  }
  return m;
}

/* ── Espositori da banco 19,5×29,5 / 20×20: vassoio nero con bordo, file di tozzetti in piedi su gradini ── */
function benchTray(d, c, op) {
  const { L, P, H } = parseDims(d), n = c.slots.length, cols = d.cols || 5, rows = Math.ceil(n / cols), [fw, fh] = faceOf(d, c);
  const cw = Math.min(fw, (L - 6) / cols - 1), chh = cw * fh / fw, rz = (P - 6) / rows, rim = 1.5, riser = 1.6;
  const xOf = i => -L / 2 + 3 + (i % cols) * (cw + 1), r = i => Math.floor(i / cols);
  const zOf = i => P / 2 - 3 - r(i) * rz, yOf = i => -H - (rows - 1 - r(i)) * riser;
  let h = bx3(-L / 2, -H, P / 2, L, H, P);
  h += bx3(-L / 2, -H - rim, P / 2, L, rim, 1.5) + bx3(-L / 2, -H - rim, P / 2, 1.5, rim, P) + bx3(L / 2 - 1.5, -H - rim, P / 2, 1.5, rim, P);   // bordo
  for (let k = 0; k < rows; k++) h += bx3(-L / 2 + 1.5, -H - k * riser, P / 2 - 1.5 - k * rz, L - 3, k * riser + 0.1, 1);   // gradini di appoggio
  for (let i = 0; i < n; i++) h += tileOf(d, c, i, cw, chh, true, `transform:${tr(xOf(i), yOf(i) - chh, zOf(i), 'rotateX(-12deg)')};transform-origin:0 100%`);
  const m = { html: h, L, P, H: H + chh };
  if (op >= 0) {
    m.after = [[`.ttile[data-t="${op}"]`, tr(xOf(op), yOf(op) - chh - 10, P / 2 + 10, 'rotateX(0deg)')]];
    m.focus = { x: xOf(op) + cw / 2, y: yOf(op) - 10 - chh / 2, z: P / 2 + 10, w: cw * 2, h: chh, yaw: 0, tilt: 8 };
  }
  return m;
}

MODELS.book = (d, c, op) => (d.id === 'PMH' || d.id === 'PGM' ? bookStack : bookWings)(d, c, op);
MODELS.wall = wallBoard;
MODELS.drawers = (d, c, op) => (d.id === 'PMV' ? cassettiera60 : drawerCabinet)(d, c, op);
/* ── Carrellati 60×120 / 60×60 (OYQ) e 100×100 (PEX), come nella foto del catalogo: pannello nero alto dietro,
   base nera bassa sul lato sinistro che tocca terra, piastrelle in piedi una accanto all'altra (di taglio verso chi guarda,
   la faccia verso sinistra). Ogni piastrella sta nel suo carrellino con una rotellina davanti: staccata da terra 1,5 cm.
   Aperto: il carrellino scorre in avanti (senza girare) e la piastrella si vede intera di lato. */
function cartHolders(d, c, op) {
  const { L, P: P0, H: H0 } = parseDims(d), n = c.slots.length;
  const sizes = (d.accept.sizes || [d.face.join('x')]).map(parseSize).map(sorted2);
  const P = Math.max(P0, sizes[0][0] + 2), lift = 1.5, guard = 9, prof = 1.2, back = 3;
  const pitch = (L - guard - 4) / n, xOf = i => -L / 2 + guard + 1 + pitch * (i + 0.5), z0 = P / 2 - 1;
  let h = bx3(-L / 2, -H0, -P / 2 + back, L, H0, back);                                 // pannello alto dietro
  h += bx3(-L / 2, -34, P / 2, guard, 34, P - back);                                   // base bassa a sinistra (a terra)
  h += bx3(-L / 2, -1, P / 2, L, 1, 3);                                                 // traversa a terra davanti
  const pos = [];
  for (let i = 0; i < n; i++) {
    const [w, th] = sizeOfSlot(c, i, sizes[0]), x = xOf(i);
    pos[i] = { w, th };
    h += bx3(x - 1.2, -0.6, z0, 2.4, 0.6, P - back - 1);                               // binario a terra
    h += `<div class="bx drawer3d" data-dr="${i}" style="transform:translate3d(0,0,0);transform-style:preserve-3d">`;
    h += bx3(x - 1, -lift - 1, z0, 2, 1, w);                                            // telaio sotto la piastrella
    h += bx3(x - 1.4, -lift - 0.4, z0 - 0.5, 2.8, lift + 0.4, 3);                       // rotellina davanti
    h += bx3(x - prof / 2 - 0.6, -lift - th, z0 + prof, prof + 1.2, th, prof);          // profilo nero sul bordo davanti
    h += tileOf(d, c, i, w, th, false, `transform:${tr(x, -lift - th, z0 - w, 'rotateY(-90deg)')}`);
    h += `</div>`;
  }
  const m = { html: h, L, P, H: H0 };
  if (op >= 0 && pos[op]) {
    const { w, th } = pos[op], pull = w + 4;
    m.after = [[`.drawer3d[data-dr="${op}"]`, `translate3d(0,0,${pull}px)`]];
    m.focus = { x: xOf(op), y: -lift - th / 2, z: z0 - w / 2 + pull, w, h: th, yaw: -72, tilt: 6 };
  }
  return m;
}

MODELS.rack = (d, c, op) => (d.id === 'PP2' ? rackPlanks : d.id === 'PMK' ? drawerCabinet : d.id === 'OYQ' || d.id === 'PEX' ? cartHolders : rackStack)(d, c, op);
MODELS.grid = benchTray;

/* ════════════════════════════════════════════════════════════
   CONFIGURATORE: lo stesso modello della sala mostra, con telecamera trascinabile
   ════════════════════════════════════════════════════════════ */
let gcam = { yaw: -30, tilt: 14, zoom: 1 }, gToken = 0;
function renderModel3D(d, c, sc, W, H, st) {
  const n = c.slots.length, op = Math.max(0, Math.min(n - 1, selSlot));
  if (gcam.mode !== d.id) { gcam.mode = d.id; gcam.yaw = d.id === 'PMV' ? -14 : d.id === 'OYQ' || d.id === 'PEX' ? 45 : -30; gcam.tilt = d.id === 'OYQ' || d.id === 'PEX' ? 10 : d.id === 'PMV' ? 16 : { drawers: 34, grid: 30, rack: 17 }[d.mode] || 14; }   // inclinazione di partenza: dall'alto per i cassetti
  const m = MODELS[d.mode](d, c, op);
  const k = gcam.zoom * Math.min((H * 0.62) / Math.max(30, m.H), (W * 0.56) / Math.max(40, m.fitW || m.L));
  const fw = (m.L || 100) + 80, fd = (m.P || 60) + 80;
  const camT = () => `translate3d(${W / 2}px,${H * 0.86}px,0) rotateX(${-gcam.tilt}deg) rotateY(${gcam.yaw}deg) scale3d(${k.toFixed(4)},${k.toFixed(4)},${k.toFixed(4)})`;   // anche la profondità in scala (con scale() i mobili sembravano schiacciati)
  sc.innerHTML = `<div class="sw-root room-scene" id="m3d" style="transform:${camT()}">
    <div class="bx" style="width:${fw}px;height:${fd}px;background:radial-gradient(ellipse at 50% 50%, rgba(0,0,0,.26), rgba(0,0,0,0) 62%);transform:translate3d(${-fw / 2}px,0.5px,${fd / 2}px) rotateX(-90deg)"></div>${m.html}</div>`;
  const token = ++gToken;
  if (m.after) requestAnimationFrame(() => requestAnimationFrame(() => {
    if (token !== gToken) return;
    m.after.forEach(([sel, tf, dl]) => {   // dl = secondo tempo (es. cassettiera: esce il cassetto, poi si alza la lastra)
      const el = sc.querySelector(sel); if (!el) return;
      if (!dl) el.style.transform = tf; else setTimeout(() => { if (token === gToken) el.style.transform = tf; }, dl);
    });
  }));
  // telecamera: si trascina per girare, rotella per lo zoom
  if (!st._orbit) {
    st._orbit = true;
    let s = null;
    const root = () => document.getElementById('m3d');
    st.addEventListener('pointerdown', e => { if (e.target.closest('.nav,.pageinfo,.ctrlbar,.eyebtn')) return; s = { x: e.clientX, y: e.clientY, yaw: gcam.yaw, tilt: gcam.tilt, moved: false }; });
    st.addEventListener('pointermove', e => {
      if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (!s.moved && Math.hypot(dx, dy) < 5) return;
      s.moved = true; window._dragMoved = true;
      gcam.yaw = Math.max(-80, Math.min(80, s.yaw + dx * 0.4)); gcam.tilt = Math.max(0, Math.min(60, s.tilt + dy * 0.3));
      const r = root(); if (r) { r.style.transition = 'none'; r.style.transform = r.style.transform.replace(/rotateX\([^)]*\) rotateY\([^)]*\)/, `rotateX(${-gcam.tilt}deg) rotateY(${gcam.yaw}deg)`); }
    });
    const end = () => { s = null; setTimeout(() => { window._dragMoved = false; }, 0); };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    st.addEventListener('wheel', e => { if (!['book', 'drawers', 'rack', 'wall', 'grid'].includes(disp().mode)) return; e.preventDefault(); gcam.zoom = Math.max(0.6, Math.min(2.4, gcam.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); renderStage(); }, { passive: false });
  }
  const sm = SAMPLE[c.slots[op]], info = document.createElement('div'); info.className = 'pageinfo';
  info.textContent = `${slotName(d, op, n)} · ${sm ? sm.s + ' ' + sm.c : 'vuoto'} — trascina per girare`;
  st.appendChild(info);
  st.append(navBtn('l', '‹', op === 0, () => selectSlot(op - 1)), navBtn('r', '›', op >= n - 1, () => selectSlot(op + 1)));
}
