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
document.head.insertAdjacentHTML('beforeend', `<style>
.boxghost { border: 2px dashed rgba(200,16,46,.55); background: rgba(255,255,255,.55); display: flex; align-items: center; justify-content: center; text-align: center; cursor: pointer; box-sizing: border-box; }
.boxghost span { font: 800 13px var(--font-body); color: #8a8780; line-height: 1.3; }
.boxghost small { font-weight: 600; font-size: 11px; }
.boxbar label { display: inline-flex; align-items: center; gap: 3px; color: #ddd; font-size: 11.5px; font-weight: 700; }
.boxbar input { width: 54px; padding: 3px 5px; border-radius: 6px; border: none; font: 700 12px var(--font-body); }
</style>`);
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
function cassettiera60(d, c, op, o) {
  const { L, P, H } = parseDims(d), [fw, fh] = d.face, n = c.slots.length, flat = o && o.flat;
  // il cassetto esce del tutto (la lastra intera fuori dal mobile), così alzandosi non tocca il cassetto di sopra
  const t = 4.5, top = 4.5, plinth = 4, Wi = L - 2 * t, zf = P / 2 - 1.5, pitch = (H - plinth - top - 2) / n, pull = flat ? fh - 4 : fh + 6;   // dall'alto: il cassetto esce come nella realtà e la lastra resta dentro, distesa
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
      // distesa, perno sul bordo davanti (transform-origin in basso): alzandosi gira su quel bordo
      h += tileDiv(fw, fh, `transform:${tr(-fw / 2, yf - fh, zf - 1, 'rotateX(90deg)')};transform-origin:50% 100%;transform-style:preserve-3d`, rface(d, c, i, fw, fh, true) + tileBody(d, c, i, fw, fh, true, 1), i);
      h += `<div class="bx cedge" data-e="${i}" style="width:${fw}px;height:${T}px;${faceBg(s, fw, T * 2, false)}transform:translate3d(${-fw / 2}px,${yf}px,${zf - 0.95}px)"></div>`;   // bordo della lastra, del suo colore
    }
    h += `</div>`;
  }
  const m = { html: h, L, P, H };
  if (op >= 0 && op < n) {
    // il cassetto esce tutto, poi la lastra si alza in piedi girando sul bordo davanti (appena inclinata indietro):
    // così si vede tutta la 60×120 di fronte. Vista "dall'alto": resta distesa nel cassetto
    const y = yb(op), T = Math.max(1, tileThickCm(d, c, op)), yf = y - 0.6 - T, a = 10, ra = a * Math.PI / 180;
    m.after = [[`.drawer3d[data-dr="${op}"]`, `translate3d(0,0,${pull}px)`]];
    if (flat) {
      m.focus = { x: 0, y: yf, z: zf - 1 - fh / 2 + pull, w: fw, h: fh, yaw: 0, tilt: 80 };
      m.overview = { x: 0, y: (yf - H) / 2, z: (zf + pull - P / 2) / 2, w: L + 10, d: P + pull, h: H };   // inquadratura dall'alto: mobile + cassetto aperto
    }
    else {
      m.after.push([`.ttile[data-t="${op}"]`, tr(-fw / 2, yf - fh, zf - 1, `rotateX(${a}deg)`), 560],
                   [`.cedge[data-e="${op}"]`, `translate3d(${-fw / 2}px,${yf}px,${zf - 0.95}px) scale3d(0,0,0)`, 560]);
      m.focus = { x: 0, y: yf - fh / 2 * Math.cos(ra), z: zf - 1 + pull - fh / 2 * Math.sin(ra), w: fw, h: fh, yaw: 0, tilt: 6 };
    }
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
MODELS.drawers = (d, c, op, o) => (d.id === 'PMV' ? cassettiera60 : drawerCabinet)(d, c, op, o);
/* ── Carrellati 60×120 / 60×60 (OYQ) e 100×100 (PEX), come nella foto del catalogo: pannello nero alto dietro,
   piastrelle in piedi una accanto all'altra (di taglio verso chi guarda,
   la faccia verso sinistra). Ogni piastrella sta nel suo carrellino con una rotellina davanti: staccata da terra 1,5 cm.
   Aperto: il carrellino scorre in avanti (senza girare) e la piastrella si vede intera di lato. */
function cartHolders(d, c, op) {
  const { L, P: P0, H: H0 } = parseDims(d), n = c.slots.length;
  const sizes = (d.accept.sizes || [d.face.join('x')]).map(parseSize).map(sorted2);
  const P = Math.max(P0, sizes[0][0] + 2), lift = 1.5, guard = 3, prof = 1.2, back = 3;
  const pitch = (L - guard - 4) / n, xOf = i => -L / 2 + guard + 1 + pitch * (i + 0.5), z0 = P / 2 - 1;
  let h = bx3(-L / 2, -H0, -P / 2 + back, L, H0, back);                                 // pannello alto dietro
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
    m.focus = { x: xOf(op), y: -lift - th / 2, z: z0 - w / 2 + pull, w, h: th, yaw: 72, tilt: 6 };   // dal lato delle facce (non dal retro)
  }
  return m;
}

/* ── Megastone 45° DX / SX: 10 lastre 120×278 parallele, a 45° rispetto al fronte, una dietro l'altra e spostate
   di lato (come un mazzo di carte aperto), su una base nera a parallelogramma. Aperto sul posto N: la lastra N scorre
   in avanti lungo la sua diagonale (con una ruota sotto la punta) e si vede tutta.
   DX: le lastre guardano a sinistra e escono verso destra; SX speculare. L'ingombro della scheda (L323 × P175)
   comprende la lastra tirata fuori: la pila sta dietro, sul lato opposto all'uscita. */
function megaSlide(d, c, op) {
  const { L, P, H: H0 } = parseDims(d), [fw, fh] = d.face, n = c.slots.length, R = Math.SQRT1_2;
  const dx = d.side !== 'SX', s = dx ? 1 : -1, fp = fw * R, m = 8, e = 3, pt = 3;
  const yb = Math.max(6, H0 - fh);                                    // piede delle lastre (H289 − 278)
  const p = Math.max(6, (L - P) / Math.max(1, n - 1)), q = p * R;     // passo lungo il fronte; q = lo stesso lungo e attraverso la lastra
  const OUT = Math.max(fw - q + 4, (P - m - fp) / R);                 // corsa: la lastra esce tutta dalla pila
  // le lastre stanno in un riquadro girato di 45°: x lungo la lastra (verso l'uscita), z verso chi le guarda
  const O = { x: -s * (L / 2 - m), z: -P / 2 + m };
  const xOf = i => dx ? i * q : -i * q - fw, zOf = i => -i * q;
  const slabT = (i, out) => tr(xOf(i) + (out ? s * OUT : 0), -yb - fh, zOf(i));
  const glob = (lx, lz) => ({ x: O.x + lx * R - lz * s * R, z: O.z + lx * s * R + lz * R });
  const clips = x => [0.26, 0.5, 0.74].map(f => `<div class="bx" style="width:1.4px;height:3.2px;background:#1a1a1c;transform:translate3d(${rn(x - 0.7)}px,${rn(fh * f - 1.6)}px,0.6px)"></div>`).join('');
  let slabs = '';
  for (let i = 0; i < n; i++) {
    const face = rface(d, c, i, fw, fh, true);
    if (LITE3D && !face) continue;                                  // posto vuoto in sala mostra: niente lastra
    slabs += tileDiv(fw, fh, 'transform:' + slabT(i, false), face + tileBody(d, c, i, fw, fh, true, 1) + clips(0) + clips(fw) +
      `<div class="bx" style="width:${fw}px;height:${yb - pt}px;background:#1d1d20;transform:translate3d(0,${fh}px,0)"></div>` +   // carrello
      bx3(dx ? fw - 7 : 2, fh + yb - 7, 2.5, 5, 7, 5), i);                                                                        // ruota sotto la punta
  }
  // base: parallelogramma basso sotto la pila (lati lungo il fronte e lungo le lastre)
  const Wp = (n - 1) * p + 2 * e * Math.SQRT2, Hp = fp + 2 * e, zb = O.z - e, xa = -L / 2 + m - e - e * Math.SQRT2;
  const x0 = dx ? xa : -(xa + Wp), xf = dx ? xa + Hp : -(xa + Wp + Hp), col = 'background:#1d1d20;';
  const plane = (w, h, tf) => `<div class="bx" style="width:${rn(w)}px;height:${rn(h)}px;${col}transform:${tf}"></div>`;
  let h = plane(Wp, Hp, `${tr(x0, -pt, zb)} rotateX(90deg) skewX(${s * 45}deg)`);
  h += plane(Wp, pt, tr(x0, -pt, zb)) + plane(Wp, pt, tr(xf, -pt, zb + Hp));
  (dx ? [xa, xa + Wp] : [-(xa + Wp), -xa]).forEach(x => { h += plane(Hp * Math.SQRT2, pt, tr(x, -pt, zb, `rotateY(${dx ? -45 : -135}deg)`)); });
  h += `<div class="bx" style="transform:${tr(O.x, 0, O.z, `rotateY(${-s * 45}deg)`)};transform-style:preserve-3d">${slabs}</div>`;
  const mm = { html: h, L, P, H: yb + fh, fitW: L };
  // scheda PDF: come nella foto del catalogo, l'ultima lastra piena tirata fuori
  const last = c.slots.map((k, i) => k && SAMPLE[k] ? i : -1).filter(i => i >= 0).pop();
  if (last != null) mm.pose = [[`.ttile[data-t="${last}"]`, slabT(last, true)]];
  if (op >= 0) {
    const g = glob(xOf(op) + s * OUT + fw / 2, zOf(op));
    mm.after = [[`.ttile[data-t="${op}"]`, slabT(op, true)]];
    mm.focus = { x: g.x, y: -(yb + fh / 2), z: g.z, w: fw, h: fh, yaw: 28 * s, flatYaw: 45 * s, tilt: 6 };
  }
  return mm;
}
MODELS.slide45 = megaSlide;

/* ── Box in posa: parete di fondo con la mattonella posata e, se le scegli, pavimento e pareti laterali ──
   Posti: 0 parete di fondo, 1 pavimento, 2 parete sinistra, 3 parete destra (posto vuoto = quella superficie non c'è;
   nel configuratore resta tratteggiata per sceglierla). Pezzi in griglia con la fuga, tagliati ai bordi, posati da terra
   e dall'angolo. La grafica di ogni pezzo è girata o specchiata in modo diverso dai vicini: la posa non sembra fatta
   di pezzi tutti uguali (c.box.seed cambia la disposizione). Misure in c.box: L, P, H (altezza della posa). */
const BOX_T = 10, BOX_BAND = 20, BOX_GAP = 0.3;    // spessore delle pareti, fascia bianca sopra la posa, fuga (cm)
const BOX_WHITE = { front: '#f3f2ee', top: '#e8e6e1', side: '#e2e0da' };
const BOX_VAR = ['', 'rotate(180deg)', 'scaleX(-1)', 'scaleY(-1)'];
const BOX_VAR_SQ = BOX_VAR.concat(['rotate(90deg)', 'rotate(270deg)', 'rotate(90deg) scaleX(-1)', 'rotate(90deg) scaleY(-1)']);
// le stesse trasformazioni come matrici 2×2 [a, b, c, d] (x' = a x + b y, y' = c x + d y; y verso il basso come nel CSS)
const BOX_M = { '': [1, 0, 0, 1], 'rotate(180deg)': [-1, 0, 0, -1], 'scaleX(-1)': [-1, 0, 0, 1], 'scaleY(-1)': [1, 0, 0, -1], 'rotate(90deg)': [0, -1, 1, 0],
  'rotate(270deg)': [0, 1, -1, 0], 'rotate(90deg) scaleX(-1)': [0, -1, -1, 0], 'rotate(90deg) scaleY(-1)': [0, 1, 1, 0] };
const mmul = (A, B) => [A[0] * B[0] + A[1] * B[2], A[0] * B[1] + A[1] * B[3], A[2] * B[0] + A[3] * B[2], A[2] * B[1] + A[3] * B[3]];
/* posa di un posto: o = 'v' (lato lungo in verticale) / 'h'; off = sfalsamento tra le file (0, 1/2, 1/3);
   tw × th = il pezzo come sta sulla superficie (larghezza × altezza; sul pavimento: lungo la larghezza × verso il fronte) */
function boxLay(c, i) {
  const s = SAMPLE[c.slots[i]], l = ((c.box || {}).lay || {})[i] || {};
  const [a, z] = s && parseSize(s.z) ? sorted2(parseSize(s.z)) : [60, 60];
  const o = l.o || (i !== 1 && z >= 200 ? 'v' : 'h');
  const off = l.off != null ? l.off : i === 1 && z / a >= 4 ? 1 / 3 : 0;   // listoni a pavimento: sfalsati di un terzo
  return { o, off, tw: o === 'v' ? a : z, th: o === 'v' ? z : a, sq: Math.abs(a - z) < 0.5 };
}
/* misure del box: finché non le cambi seguono la mattonella della parete (pezzi interi: 120×278 → 240 × 278) */
function boxOf(c) {
  const b = (c && c.box) || {};
  if (b.fit === false) return { L: b.L, P: b.P, H: b.H, seed: b.seed || 1, fit: false };
  let L = 240, H = 278;
  if (c && SAMPLE[c.slots[0]]) { const { tw, th } = boxLay(c, 0); L = tw * Math.max(1, Math.round(240 / tw)); H = th > 280 ? th : th * Math.max(1, Math.floor(280 / th)); }
  return { L, P: b.P || 150, H, seed: b.seed || 1, fit: true };
}
/* larghezza × altezza di ogni superficie */
const boxSurf = (c, i) => { const { L, P, H } = boxOf(c); return [[L, H], [L, P], [P, H], [P, H]][i]; };
/* pezzi della posa su una superficie W×H: file da sotto (bottom) o da sopra, colonne da destra (right) o da sinistra */
function boxPieces(W, H, tw, th, off, bottom, right) {
  const out = [], rows = Math.ceil(H / th - 1e-6);
  for (let r = 0; r < rows; r++) {
    const y0 = bottom ? H - (r + 1) * th : r * th, y1 = y0 + th, sh = off ? ((r * off) % 1) * tw : 0;
    for (let k = 0, x = -sh; x < W - 0.01; k++, x += tw) {
      let a = Math.max(0, x), b = Math.min(W, x + tw);
      const c0 = Math.max(0, y0), c1 = Math.min(H, y1);
      if (b - a < 0.3 || c1 - c0 < 0.3) continue;
      if (right) [a, b] = [W - b, W - a];
      out.push({ r, k, x: a, y: c0, w: b - a, h: c1 - c0, full: b - a > tw - 0.05 && c1 - c0 > th - 0.05 });
    }
  }
  return out;
}
/* una superficie posata: contenitore (colore della fuga) con i pezzi; tf = dove sta nel box */
function boxSurfaceHTML(c, i, W, H, tf, bottom, right, sel) {
  const s = SAMPLE[c.slots[i]], { L } = boxOf(c);
  const box = (cls, inner, st) => `<div class="bx${cls}" data-slot="${i}" style="width:${rn(W)}px;height:${rn(H)}px;transform:${tf};transform-style:preserve-3d;${st || ''}">${inner}</div>`;
  const ring = sel ? `<div class="bx" style="width:${rn(W)}px;height:${rn(H)}px;box-shadow:inset 0 0 0 ${Math.max(2, L / 90)}px #c8102e;transform:translateZ(0.5px)"></div>` : '';
  if (!s) return LITE3D ? '' : box(' empty boxghost', `<span>${esc(slotName(DISP.BOX || {}, i, 4))}<br><small>scegli la mattonella</small></span>${ring}`);
  const lay = boxLay(c, i), { tw, th } = lay, k = photoKey(s), url = hasPhoto(s) ? imgFor(k) : null;
  const t = backTint(s), grout = t ? `rgb(${t.split(',').map(v => Math.round(v * 0.72)).join(',')})` : '#a9a49b';
  const turn = !!url && photoTurn(k, th > tw), r = LITE3D ? ROOM_RES : FACE_RES, g = BOX_GAP / 2;
  const seed = boxOf(c).seed, hash = (a, b) => { let x = Math.imul(a + 1, 73856093) ^ Math.imul(b + 1, 19349663) ^ Math.imul(seed * 7 + i + 1, 83492791); x = Math.imul(x ^ (x >>> 13), 1274126177); return (x ^ (x >>> 16)) >>> 0; };
  let ps = boxPieces(W, H, tw, th, lay.off, bottom, right);
  if (ps.length > 600) return box('', '', `background-color:${grout};${faceBg(s, W, H, true)}`);   // formati piccolissimi: posa ripetuta, senza variare i pezzi
  // ogni pezzo: mai uguale al pezzo accanto e a quello della fila prima, e mai il loro specchio sulla fuga in comune
  // (si vedrebbe la "V" delle venature che si specchiano); conta come appare davvero (anche la foto girata di 90°)
  const got = new Map(), out = [], TM = BOX_M[turn ? 'rotate(90deg)' : ''];
  ps.forEach(p => {
    const vars = p.full && lay.sq ? BOX_VAR_SQ : BOX_VAR, lf = got.get(p.r + '|' + (p.k - 1)), dn = got.get((p.r - 1) + '|' + p.k), bad = new Set();
    if (lf) bad.add(lf.join()).add(mmul(BOX_M['scaleX(-1)'], lf).join());
    if (dn) bad.add(dn.join()).add(mmul(BOX_M['scaleY(-1)'], dn).join());
    let v = hash(p.r, p.k) % vars.length;
    for (let n = 0; n < vars.length && bad.has(mmul(TM, BOX_M[vars[v]]).join()); n++) v = (v + 1) % vars.length;
    got.set(p.r + '|' + p.k, mmul(TM, BOX_M[vars[v]]));
    const w = p.w - 2 * g, h = p.h - 2 * g, fx = p.w / tw, fy = p.h / th;
    const [ew, eh, sx, sy] = turn ? [h, w, fy, fx] : [w, h, fx, fy];     // foto girata di 90°: il pezzo si disegna coricato e si gira
    const bg = url ? `background-image:url(${url});background-size:${rn(100 / sx)}% ${rn(100 / sy)}%;background-position:0 0;background-repeat:no-repeat;background-color:${grout}`
      : `background:${rgb(placeholderRGB(s), (hash(p.k, p.r) % 15) - 7)}`;
    out.push(`<div class="bx" style="width:${rn(ew * r)}px;height:${rn(eh * r)}px;${bg};transform:translate3d(${rn(p.x + g)}px,${rn(p.y + g)}px,0.1px) scale(${(1 / r).toFixed(5)}) translate(${rn(w * r / 2)}px,${rn(h * r / 2)}px)${turn ? ' rotate(90deg)' : ''} ${vars[v]} translate(${rn(-ew * r / 2)}px,${rn(-eh * r / 2)}px)"></div>`);
  });
  return box('', out.join('') + ring, `background-color:${grout}`);
}
function boxModel(d, c, op) {
  const { L, P, H } = boxOf(c), t = BOX_T, WH = H + BOX_BAND, has = i => !!SAMPLE[c.slots[i]];
  const wl = has(2), wr = has(3), x0 = wl ? -t : 0, x1 = L + (wr ? t : 0), cx = (x0 + x1) / 2, cz = (P - t) / 2;
  const X = x => x - cx, Z = z => z - cz, sel = i => !LITE3D && op === i;
  // muri bianchi del box (con la fascia sopra la posa)
  let h = box3d(X(x0), -WH, Z(0), x1 - x0, WH, t, BOX_WHITE);
  if (wl) h += box3d(X(-t), -WH, Z(P), t, WH, P, BOX_WHITE);
  if (wr) h += box3d(X(L), -WH, Z(P), t, WH, P, BOX_WHITE);
  if (has(1)) h += box3d(X(0), -1.2, Z(P), L, 1.2, P, { front: '#cdcac3', top: '#d9d6d0', side: '#c8c5be' });   // pedana del pavimento
  // superfici posate: parete di fondo e laterali da terra e dall'angolo in fondo, pavimento dal fondo a sinistra
  h += boxSurfaceHTML(c, 0, L, H, tr(X(0), -H, Z(0) + 0.1), true, false, sel(0));
  h += boxSurfaceHTML(c, 1, L, P, tr(X(0), has(1) ? -1.3 : -0.3, Z(0), 'rotateX(90deg)'), false, false, sel(1));
  h += boxSurfaceHTML(c, 2, P, H, tr(X(0) + 0.1, -H, Z(P), 'rotateY(90deg)'), true, true, sel(2));
  h += boxSurfaceHTML(c, 3, P, H, tr(X(L) - 0.1, -H, Z(0), 'rotateY(-90deg)'), true, false, sel(3));
  const m = { html: h, L: x1 - x0, P: P + t, H: WH, fitW: x1 - x0 };
  if (op >= 0) m.focus = [
    { x: X(L / 2), y: -H / 2, z: Z(0), w: L, h: H, yaw: 0, tilt: 6 },
    { x: X(L / 2), y: -1, z: Z(P / 2), w: L, h: P, yaw: 0, tilt: 50, flatTilt: 86 },
    { x: X(0), y: -H / 2, z: Z(P / 2), w: P, h: H, yaw: -60, flatYaw: -90, tilt: 6 },
    { x: X(L), y: -H / 2, z: Z(P / 2), w: P, h: H, yaw: 60, flatYaw: 90, tilt: 6 },
  ][op];
  return m;
}
MODELS.box = boxModel;
/* configuratore del box: misure, posa del posto scelto, grafiche rimescolate */
function boxEdit(fn) { const c = comp(), cur = boxOf(c); c.box = Object.assign({}, c.box); fn(c.box, cur); touch(); renderStage(); }
function setBoxDim(k, v) { boxEdit((b, cur) => { Object.assign(b, { fit: false, L: cur.L, P: cur.P, H: cur.H }); b[k] = Math.max(20, Math.min(1500, Math.round(+v) || cur[k])); }); }
function fitBox() { boxEdit(b => { b.fit = true; delete b.L; delete b.H; }); toast('Misure adattate alla mattonella della parete: solo pezzi interi'); }
function setBoxLay(i, k, v) { boxEdit(b => { b.lay = Object.assign({}, b.lay); b.lay[i] = Object.assign({}, b.lay[i], { [k]: v }); }); }
function shuffleBox() { boxEdit(b => { b.seed = (b.seed || 1) + 1; }); toast('Grafiche dei pezzi girate in un altro modo'); }
function boxBar(d, c, st, op) {
  const b = boxOf(c), s = SAMPLE[c.slots[op]], lay = boxLay(c, op);
  const btn = (txt, on, fn, tip) => `<button class="${on ? 'on' : ''}" title="${esc(tip || '')}" onclick="event.stopPropagation(); ${fn}">${txt}</button>`;
  const num = (k, lbl, tip) => `<label title="${tip}">${lbl} <input type="number" min="20" max="1500" step="1" value="${b[k]}" onclick="event.stopPropagation()" onchange="setBoxDim('${k}', this.value)"></label>`;
  const bar = document.createElement('div'); bar.className = 'cullabar boxbar';
  bar.innerHTML = `<span class="g"><span class="l">Misure cm</span>${num('L', 'L', 'Larghezza della parete posata')}${num('H', 'H', 'Altezza della posa (sopra resta una fascia bianca)')}${num('P', 'P', 'Profondità del pavimento e delle pareti laterali')}
      ${b.fit ? '' : btn('Adatta', false, 'fitBox()', 'Misure con solo pezzi interi della mattonella della parete')}</span>
    ${s ? `<span class="g"><span class="l">${esc(slotName(d, op, c.slots.length))}</span>${lay.sq ? '' : btn('Verticale', lay.o === 'v', `setBoxLay(${op},'o','v')`, op === 1 ? 'Lato lungo verso il fronte' : 'Lato lungo in verticale') + btn('Orizzontale', lay.o === 'h', `setBoxLay(${op},'o','h')`, op === 1 ? 'Lato lungo lungo la parete' : 'Lato lungo in orizzontale')}
      ${btn('Dritta', !lay.off, `setBoxLay(${op},'off',0)`, 'Fughe allineate')}${btn('Sfalsata ½', lay.off === 0.5, `setBoxLay(${op},'off',0.5)`, 'Ogni fila spostata di mezzo pezzo')}${btn('⅓', Math.abs(lay.off - 1 / 3) < 0.01, `setBoxLay(${op},'off',${1 / 3})`, 'Ogni fila spostata di un terzo')}</span>` : ''}
    <span class="g">${btn('<svg class="ic"><use href="#i-sync"/></svg> Gira le grafiche', false, 'shuffleBox()', 'Ogni pezzo con la grafica girata in un altro modo')}</span>`;
  st.appendChild(bar);
}

MODELS.rack = (d, c, op) => (d.id === 'PP2' ? rackPlanks : d.id === 'PMK' ? drawerCabinet : d.id === 'OYQ' || d.id === 'PEX' ? cartHolders : rackStack)(d, c, op);
MODELS.grid = benchTray;

/* ════════════════════════════════════════════════════════════
   CONFIGURATORE: lo stesso modello della sala mostra, con telecamera trascinabile
   ════════════════════════════════════════════════════════════ */
let gcam = { yaw: -30, tilt: 14, zoom: 1 }, gToken = 0;
/* viste a pulsante (come nel girevole): [id, nome, yaw, tilt]; trascinando si gira liberamente */
const GVIEWS = {
  OYQ: [['A', 'Lato A', 62, 8], ['B', 'Lato B', -62, 8]],
  PEX: [['A', 'Lato A', 62, 8], ['B', 'Lato B', -62, 8]],
  PMV: [['front', 'Di fronte', -14, 16], ['top', "Dall'alto", 0, 88]],
  Q8T: [['front', 'Di fronte', 45, 6], ['side', 'Di sbieco', 16, 14]],
  Q8U: [['front', 'Di fronte', -45, 6], ['side', 'Di sbieco', -16, 14]],
  BOX: [['front', 'Di fronte', 0, 6], ['pl', 'Da sinistra', -32, 16], ['pr', 'Da destra', 32, 16], ['alto', "Dall'alto", 0, 64]],
};
function setGView(id) {
  const v = (GVIEWS[gcam.mode] || []).find(x => x[0] === id); if (!v) return;
  gcam.view = id; gcam.yaw = v[2]; gcam.tilt = v[3]; renderStage();
}
function renderModel3D(d, c, sc, W, H, st) {
  const n = c.slots.length, op = Math.max(0, Math.min(n - 1, selSlot)), views = GVIEWS[d.id];
  if (gcam.mode !== d.id) {
    gcam.mode = d.id; gcam.view = views ? views[0][0] : null;
    gcam.yaw = views ? views[0][2] : -30; gcam.tilt = views ? views[0][3] : { drawers: 34, grid: 30, rack: 17 }[d.mode] || 14;   // inclinazione di partenza: dall'alto per i cassetti
  }
  const m = MODELS[d.mode](d, c, op, { flat: gcam.view === 'top' });
  const k = gcam.zoom * Math.min((H * 0.62) / Math.max(30, m.H), (W * 0.56) / Math.max(40, m.fitW || m.L));
  const fw = (m.L || 100) + 80, fd = (m.P || 60) + 80, f = views && ui.zoom && m.focus;   // zoom: dritto davanti alla piastrella aperta (di lato per i carrellati)
  // anche la profondità in scala (con scale() i mobili sembravano schiacciati); con lo Zoom la telecamera va sul campione aperto
  const ov = !f && gcam.view === 'top' && m.overview, ta = gcam.tilt * Math.PI / 180;
  const camT = () => ov
    ? (kz => `translate3d(${W / 2}px,${H * 0.4}px,0) rotateX(${-gcam.tilt}deg) rotateY(${gcam.yaw}deg) scale3d(${kz},${kz},${kz}) translate3d(${-ov.x}px,${-ov.y}px,${-ov.z}px)`)
        ((gcam.zoom * Math.min(W * 0.8 / ov.w, H * 0.8 / (ov.d * Math.sin(ta) + ov.h * Math.cos(ta)))).toFixed(4))
    : f
    ? (kz => `translate3d(${W / 2}px,${H * 0.5}px,0) rotateX(${f.flatTilt != null ? -f.flatTilt : gcam.view === 'top' ? -88 : -4}deg) rotateY(${f.flatYaw != null ? f.flatYaw : Math.abs(f.yaw) > 45 ? (gcam.yaw < 0 ? -88 : 88) : 0}deg) scale3d(${kz},${kz},${kz}) translate3d(${-f.x}px,${-f.y}px,${-f.z}px)`)(Math.min(H * 0.8 / f.h, W * 0.8 / f.w).toFixed(4))
    : `translate3d(${W / 2}px,${H * 0.86}px,0) rotateX(${-gcam.tilt}deg) rotateY(${gcam.yaw}deg) scale3d(${k.toFixed(4)},${k.toFixed(4)},${k.toFixed(4)})`;
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
      s.moved = true; window._dragMoved = true; gcam.view = null;
      gcam.yaw = Math.max(-80, Math.min(80, s.yaw + dx * 0.4)); gcam.tilt = Math.max(0, Math.min(90, s.tilt + dy * 0.3));
      const r = root(); if (r) { r.style.transition = 'none'; r.style.transform = r.style.transform.replace(/rotateX\([^)]*\) rotateY\([^)]*\)/, `rotateX(${-gcam.tilt}deg) rotateY(${gcam.yaw}deg)`); }
    });
    const end = () => { s = null; setTimeout(() => { window._dragMoved = false; }, 0); };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    st.addEventListener('wheel', e => { if (!['book', 'drawers', 'rack', 'wall', 'grid', 'slide45', 'box'].includes(disp().mode)) return; e.preventDefault(); gcam.zoom = Math.max(0.6, Math.min(2.4, gcam.zoom * (e.deltaY < 0 ? 1.1 : 0.9))); renderStage(); }, { passive: false });
  }
  const sm = SAMPLE[c.slots[op]], info = document.createElement('div'); info.className = 'pageinfo';
  info.textContent = `${slotName(d, op, n)} · ${sm ? sm.s + ' ' + sm.c : 'vuoto'} — trascina per girare`;
  st.appendChild(info);
  st.append(navBtn('l', '‹', op === 0, () => selectSlot(op - 1)), navBtn('r', '›', op >= n - 1, () => selectSlot(op + 1)));
  if (views) {
    const bar = document.createElement('div'); bar.className = 'ctrlbar';
    views.forEach(([id, t]) => {
      const b = document.createElement('button'); b.textContent = t; b.className = gcam.view === id ? 'on' : '';
      b.onclick = e => { e.stopPropagation(); setGView(id); }; bar.appendChild(b);
    });
    const z = document.createElement('button'); z.innerHTML = '<svg class="ic"><use href="#i-zoom"/></svg> Zoom'; z.className = 'zoom' + (ui.zoom ? ' on' : '');
    z.title = 'Primo piano sulla piastrella aperta';
    z.onclick = e => { e.stopPropagation(); ui.zoom = !ui.zoom; saveUI(); renderStage(); };
    bar.appendChild(z); st.appendChild(bar);
  }
  if (d.mode === 'box') boxBar(d, c, st, op);
}
