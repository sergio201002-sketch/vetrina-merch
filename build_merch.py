"""
Genera merch_data.js per la sezione "Culle e pannelli" della Vetrina Merch, dai cataloghi Merchandising
(fonti/merchandising/*.pdf, privati): per ogni serie culle dedicate, espositori, pannelli sinottici e posati,
testate fotografiche, cornici per pedane, scatole/cofanetti/valigette, cataloghi e cartelle architetti,
con codici, prezzi, misure e l'immagine ritagliata dalla pagina (merch/), più le pagine intere (merch/p/).

Rilanciare dopo aver messo un catalogo nuovo in fonti/merchandising:  python build_merch.py
"""
import io, json, os, re, sys, unicodedata
import fitz
from PIL import Image, ImageChops, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'fonti', 'merchandising')
OUT = os.path.join(HERE, 'merch')
BRANDS = {'Ergon': 'E', 'Provenza': 'P', 'Emilceramica': 'C'}
DPI = 200
SC = DPI / 72
CODE = r'\b(?=[0-9A-Z]{8}\b)0{3,}[0-9A-Z]+\b'
# serie del catalogo -> serie del listino (quando il nome non coincide)
SERIES_ALIAS = {'SLEEKWOOD': 'SLEEK WOOD', 'UNIQUE INTENSITY': 'UNIQUE INTENSITY STONE'}
CATS = [  # (id, prefisso del titolo della sezione)
    ('culle', ('CULLA',)), ('espositori', ('ESPOSITORE',)),
    ('sinottici', ('PANNELLI SINOTTICI', 'PANNELLO SINOTTICO')), ('posati', ('PANNELLI POSATI',)),
    ('testate', ('TESTATE FOTOGRAFICHE',)), ('cornici', ('CORNICI',)),
    ('scatole', ('SCATOLA', 'COFANETTO', 'VALIGETTA', 'BOX')),
    ('cataloghi', ('CATALOGHI', 'CATALOGO', 'CARTELLA ARCHITETTI')),
]


def cat_of(h):
    for c, pre in CATS:
        if any(h.startswith(p) for p in pre): return c
    return None


def nice(t):
    """CULLA TELE DI MARMO CRYSTAL -> Culla Tele di Marmo Crystal"""
    small = {'di', 'da', 'e', 'per', 'a', 'con'}
    w = re.sub(r'\s+', ' ', t.strip()).lower().split(' ')
    out = []
    for i, x in enumerate(w):
        if i and x in small: out.append(x)
        elif re.fullmatch(r'[\d,.]+x[\d,.]+(h)?|\d+mm', x): out.append(x)
        elif re.fullmatch(r'vers\.', x): out.append('vers.')
        else: out.append(re.sub(r'(^|[-–])(\w)', lambda m: m.group(1) + m.group(2).upper(), x))
    return ' '.join(out).replace('I-Wood', 'I-Wood').replace('W-Circles', 'W-Circles')


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().upper()
    return re.sub(r'[^A-Z0-9]', '', s)


class Line:
    def __init__(self, bbox, size, font, text, spans):
        self.x0, self.y0, self.x1, self.y1 = bbox
        self.size, self.font, self.text, self.spans = size, font, text, spans
        self.used = False

    @property
    def bold(self): return 'Bold' in self.font

    def __repr__(self): return f'<{self.x0:.0f},{self.y0:.0f} {self.text!r}>'


def page_lines(pg):
    out = []
    for b in pg.get_text('dict')['blocks']:
        if b['type']: continue
        for l in b['lines']:
            sp = [s for s in l['spans'] if s['text'].strip()]
            if not sp: continue
            t = re.sub(r'\s+', ' ', ' '.join(s['text'] for s in sp)).strip()
            out.append(Line(l['bbox'], max(s['size'] for s in sp), sp[0]['font'], t, sp))
    return out


def read_index(doc):
    """indice a pagina 3: [(serie, pagina iniziale)]"""
    seg = [s.strip() for s in doc[2].get_text().split('\n') if s.strip()]
    res = []
    for a, b in zip(seg, seg[1:]):
        if b.isdigit() and not a.isdigit() and 'INDICE' not in a: res.append((a, int(b)))
    return sorted(res, key=lambda r: r[1])


def money(t):
    m = re.search(r'€\s*([\d.,]+)', t)
    return m.group(1) if m else ''


def codes_in(t): return re.findall(CODE, t)


# ── immagini ──────────────────────────────────────────────────────────────
def render(pg):
    pix = pg.get_pixmap(dpi=DPI)
    return Image.open(io.BytesIO(pix.tobytes('png'))).convert('RGB')


def autocrop(im, pad=10):
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert('L').point(lambda v: 255 if v > 14 else 0)
    bb = diff.getbbox()
    if not bb: return None
    x0, y0, x1, y1 = bb
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def crop(img, rect, blank=(), trim=True):
    """rect in punti PDF; blank = righe di testo da sbiancare prima del ritaglio"""
    x0, y0, x1, y1 = rect
    if x1 - x0 < 8 or y1 - y0 < 8:
        print('    ritaglio vuoto', [round(v) for v in rect]); return None
    im = img.copy() if blank else img
    if blank:
        d = ImageDraw.Draw(im)
        for l in blank: d.rectangle([l.x0 * SC - 3, l.y0 * SC - 3, l.x1 * SC + 3, l.y1 * SC + 3], fill='white')
    c = im.crop((int(max(0, x0) * SC), int(max(0, y0) * SC), int(min(595, x1) * SC), int(min(842, y1) * SC)))
    return autocrop(c) if trim else c


DRY = '-n' in sys.argv


def save(im, name, big=1100, small=420):
    if DRY: return name if im is not None else ''
    if im is None or im.width < 20 or im.height < 20: return ''
    for sub, mx in (('', big), ('m', small)):
        x = im.copy(); x.thumbnail((mx, mx), Image.LANCZOS)
        d = os.path.join(OUT, sub); os.makedirs(d, exist_ok=True)
        x.save(os.path.join(d, name + '.avif'), quality=62 if sub else 58)
    return name


# ── sezioni della pagina ─────────────────────────────────────────────────
def headings(lines):
    hs = []
    for l in lines:
        big = [s for s in l.spans if s['size'] >= 15 and 'Gotham-Bold' in s['font']]
        if not big or l.y0 > 790: continue
        h = re.sub(r'\s+', ' ', ' '.join(s['text'] for s in big)).strip()
        if h in ('MERCHANDISING', 'INDICE - INDEX') or re.fullmatch(r'[\d.]+', h): continue
        c = cat_of(h)
        if not c: print('  ? titolo sconosciuto', h); continue
        rest = ' '.join(s['text'] for s in l.spans if s not in big).strip()
        l.used = True
        hs.append(dict(line=l, h=h, cat=c, sub=rest))
    # regione: fino al titolo successivo sotto (o al fondo), larghezza fino al titolo accanto
    for h in hs:
        l = h['line']
        side = [o['line'] for o in hs if o is not h and abs(o['line'].y0 - l.y0) < 6 and o['line'].x0 > l.x0]
        x1 = min([o.x0 - 4 for o in side], default=595)
        below = [o['line'].y0 for o in hs if o['line'].y0 > l.y0 + 6 and o['line'].x0 < x1]
        h['rect'] = (l.x0 - 6, l.y0 - 2, x1, min(below, default=836) - 10)
    return hs


def inside(l, r, m=2): return l.x0 >= r[0] - m and l.x1 <= r[2] + 40 and l.y0 >= r[1] - m and l.y1 <= r[3] + m


def columns(ls, tol=12):
    xs = []
    for l in sorted(ls, key=lambda l: l.x0):
        if not xs or l.x0 - xs[-1][-1] > tol: xs.append([l.x0])
        else: xs[-1].append(l.x0)
    return [min(x) for x in xs]


def col_bounds(starts, x0, x1, i):
    return (starts[i] - 6, (starts[i + 1] - 6) if i + 1 < len(starts) else x1)


# ── parser per categoria ─────────────────────────────────────────────────
def it_lines(ls):
    """righe 'Caratteristiche': prima l'italiano, poi l'inglese (stesso numero di righe, o separato da uno spazio)"""
    if len(ls) < 2: return [l.text for l in ls]
    gaps = [(b.y0 - a.y1, i) for i, (a, b) in enumerate(zip(ls, ls[1:]), 1)]
    g, i = max(gaps)
    if g > 4: return [l.text for l in ls[:i]]
    return [l.text for l in ls[:(len(ls) + 1) // 2]]


def parse_single(h, ls, img, imgs):
    l0 = h['line']
    it = dict(t=nice(h['h']), codes=[], info=[])
    note = re.sub(r'\s+', ' ', h['sub']).strip()
    m = re.search(r'IN FASE DI CODIFICA', h['h'])
    if m: it['t'] = nice(h['h'][:m.start()]); note = 'In fase di codifica'
    feats, mode, order = [], '', []
    for l in ls:
        t = l.text
        if re.match(r'PROCEDURA ORDINE|Per ordinare', t):
            order += codes_in(t); l.used = True; continue
        if re.match(r'(Sizes|Price|Indicative Price):|.* - Panels$', t): l.used = True; continue
        if t.startswith('Dimensioni:'): it['dims'] = re.sub(r'^Dimensioni:\s*', '', t).rstrip('.').replace('cm.', 'cm'); l.used = True; continue
        if t.startswith('Caratteristiche'): mode = 'f'; l.used = True; continue
        if t.startswith('Prezzo'):
            it['price'] = money(t); p = re.search(r'\(([^)]*)\)', t)
            if p: it['pn'] = p.group(1)
            mode = ''; l.used = True; continue
        cs = codes_in(t)
        if cs:   # "Cod. 0000IL56", "0000IJ3S € 37", "0000IG45 Medley White-Grey-Dark Grey € 35"
            l.used = True
            c = dict(c=cs[0])
            if money(t): c['p'] = money(t)
            ex = re.sub(r'Cod\.?|' + CODE + r'|€\s*[\d.,]+', '', t).strip(' ()')
            if re.fullmatch(r'\(?A ESAURIMENTO\)?', ex.strip()): note = 'A esaurimento'
            elif ex: c['l'] = ex
            if c['c'] not in [x['c'] for x in it['codes']]: it['codes'].append(c)
            continue
        if mode == 'f': feats.append(l); l.used = True; continue
        # testo della scheda: colonna di sinistra, corpo 8 (le didascalie dei render sono in altri font o più piccole)
        if l.size >= 7.5 and l.font.startswith('Gotham') and abs(l.x0 - l0.x0) < 12 and not re.fullmatch(r'\d+', t):
            it['info'].append(t); l.used = True
    if not it['codes']:   # il codice della procedura d'ordine (a volte ce n'è uno nascosto sotto: solo se manca)
        it['codes'] = [dict(c=c) for c in order[:1]]
    if len(it['codes']) == 1 and 'p' in it['codes'][0]: it.setdefault('price', it['codes'][0].pop('p'))
    if len(it['codes']) == 1 and 'l' in it['codes'][0]: note = (note + ' ' + it['codes'][0].pop('l')).strip()
    note = note.strip(' -')
    info = []
    for t in it_lines(feats) + it['info']:   # righe spezzate: "…con un brick," + "tre pezzi 10x10"
        if info and (info[-1].endswith(',') or (info[-1].isupper() and t.isupper())): info[-1] += ' ' + t
        else: info.append(t)
    it['info'] = info
    if note: it['note'] = note.capitalize() if note.isupper() else note
    r = h['rect']
    big = sorted([b for b in imgs if b[2] - b[0] > 60 and b[3] - b[1] > 60 and b[1] >= r[1] - 4 and b[3] <= r[3] + 40],
                 key=lambda b: -(b[2] - b[0]) * (b[3] - b[1]))
    txt = [l for l in ls if l.font.startswith('Gotham')]   # le misure scritte sul render restano
    pic = crop(img, big[0], blank=txt) if big else crop(img, (r[0], l0.y1 + 4, r[2], r[3]), blank=txt)
    return [(it, pic)]


def parse_cataloghi(h, ls, img, imgs):
    r = h['rect']; out = []
    ls = [l for l in ls if l.size >= 7.5 and not l.text.startswith('PROCEDURA')]
    for x in columns([l for l in ls if l.bold and not codes_in(l.text)]):
        col = sorted([l for l in ls if abs(l.x0 - x) < 14], key=lambda l: l.y0)
        it, lab, note = dict(t='', codes=[]), '', ''
        for l in col:
            cs = codes_in(l.text); l.used = True
            if cs:
                c = dict(l=nice(lab or 'Catalogo'), c=cs[0])
                if note: c['note'] = note
                it['codes'].append(c); lab = note = ''
            elif l.text.startswith('('): note = l.text.strip('() ')
            else: lab = (lab + ' ' + l.text).strip() if lab and not it['codes'] else l.text
        if not it['codes']: continue
        it['t'] = it['codes'][0]['l']
        if any('rchitett' in c['l'] for c in it['codes']): it['kit'] = 1
        if x - 100 > r[0]:   # copertina a sinistra del testo
            out.append((it, crop(img, (max(r[0], x - 122), r[1] + 30, x - 4, max(col[-1].y1, r[1] + 190) + 2))))
        else:                # copertina sopra il testo
            out.append((it, crop(img, (x - 6, r[1] + 30, min(r[2], x + 140), col[0].y0 - 2))))
    return out


def parse_grid(h, ls, img, imgs, cat):
    """sinottici e testate: nome sotto l'immagine, poi i codici (e No Logo) nella stessa colonna"""
    r = h['rect']; out = []
    # il logo della serie scritto sulla foto della testata è in un altro font
    ls = [l for l in ls if l.size >= 7 and l.font.startswith(('Gotham', 'FoundersGrotesk'))]
    for l in list(ls):   # "White   TESTATA 100X55" sulla stessa riga: nome + testata
        m = re.match(r'(.+?)\s+(TESTATA\s.*)$', l.text)
        if m and m.group(1)[0].islower(): l.text = m.group(2)   # "avorio  TESTATA 120x65": colore ripetuto
        elif m:
            t = Line((l.x0, l.y0 + .5, l.x1, l.y1), 8, 'Gotham-Book', m.group(2), [])
            l.text = m.group(1); ls.append(t)
    names = [l for l in ls if l.bold and l.font.startswith('Gotham') and not codes_in(l.text) and not l.text.startswith('No Logo')
             and not re.match(r'(TESTATA|Pannello|PROCEDURA|\d+$)', l.text)
             and (l.size >= 10.5 or any(o.text.startswith('TESTATA') and abs(o.x0 - l.x0) < 4 and 0 < o.y0 - l.y0 < 22 for o in ls))]
    for a in sorted(names, key=lambda l: (round(l.x0), l.y0)):   # nome su due righe (Playtangram / Light Oak)
        b = next((n for n in names if n is not a and abs(n.x0 - a.x0) < 4 and -4 <= n.y0 - a.y1 < 6), None)
        if b: a.text += ' ' + b.text; a.y1 = b.y1; b.used = True; names.remove(b); ls.remove(b)
    starts = columns(names, 20)
    for l in ls:
        m = re.search(r'generic[oa]\s+(?:Cod\.\s*)?(' + CODE + ')', l.text)
        if m: l.used = True
    for ci, x in enumerate(starts):
        cx0, cx1 = col_bounds(starts, r[0], r[2], ci)
        col_names = sorted([n for n in names if abs(n.x0 - x) < 20], key=lambda n: n.y0)
        top = r[1] + 26
        for ni, n in enumerate(col_names):
            nxt = col_names[ni + 1].y0 if ni + 1 < len(col_names) else r[3] + 2
            mine = sorted([l for l in ls if cx0 <= l.x0 < cx1 and n.y0 <= l.y0 < nxt - 2 and l is not n], key=lambda l: (round(l.y0), l.x0))
            it = dict(t=n.text, codes=[]); n.used = True
            lab, nl_next, last = '', False, top
            for l in mine:
                t = l.text; cs = codes_in(t); l.used = True
                if re.match(r'TESTATA', t):
                    m = re.match(r'TESTATA\s+([\dXx]+)\s*(\((.*)\))?', t)
                    lab = 'Testata ' + m.group(1).lower() if m else nice(t)
                    note = m.group(3) if m and m.group(3) else ''
                    it['codes'].append(dict(l=lab, note=note.strip())); continue
                if t == 'No Logo': nl_next = True; continue
                if re.match(r'PROCEDURA|\d+ - |Per (ordinare|pannelli)', t): continue
                m = re.match(r'No Logo\s+(0{3,}[0-9A-Z]{4})$', t)
                if m and not cs: cs = [m.group(1).zfill(8)]   # codice scritto con uno zero in meno
                if cs:
                    if 'No Logo' in t or nl_next:
                        tgt = it['codes'][-1] if it['codes'] else None
                        if tgt is None: tgt = dict(); it['codes'].append(tgt)
                        tgt['nl'] = cs[0]
                        if money(t): tgt['nlp'] = money(t)
                        nl_next = False
                    else:
                        if it['codes'] and 'c' not in it['codes'][-1]: it['codes'][-1]['c'] = cs[0]
                        else: it['codes'].append(dict(c=cs[0]))
                        if money(t): it['price'] = money(t)
                    last = max(last, l.y1); continue
                if l.size >= 7 and not re.fullmatch(r'\d+', t): it.setdefault('info', []).append(t)
            for c in it['codes']:
                if not c.get('note'): c.pop('note', None)
                if not c.get('l'): c.pop('l', None)
            pic = crop(img, (cx0, top, cx1, n.y0 - 1)) if n.y0 - top > 40 else None
            if pic is None:   # nome a destra del pannello
                pic = crop(img, (r[0], r[1] + 26, n.x0 - 3, max([n.y1, last])))
            out.append((it, pic))
            top = max(l.y1 for l in [n] + mine) + 2
    return out


def parse_posati(h, ls, img, imgs):
    r = h['rect']; out = []
    ls = [l for l in ls if l.size >= 6.5 or re.fullmatch(r'SC\d+', l.text)]
    fm = [l for l in ls if re.match(r'Formato\b', l.text, re.I)]
    starts = columns(fm, 25)
    for ci, x in enumerate(starts):
        cx0, cx1 = col_bounds(starts, r[0], r[2], ci)
        col = sorted([l for l in fm if abs(l.x0 - x) < 25], key=lambda l: l.y0)
        top = max([r[1] + 26] + [l.y1 + 2 for l in ls if l.text.startswith('Esempi') and l.y0 < r[1] + 40])
        for fi, f in enumerate(col):
            nxt = col[fi + 1].y0 - 40 if fi + 1 < len(col) else r[3]
            mine = sorted([l for l in ls if cx0 <= l.x0 < cx1 and f.y0 <= l.y0 < nxt and not re.fullmatch(r'SC\d+', l.text)
                           and not re.match(r'PROCEDURA|\d+ - |Per (ordinare|pannelli)', l.text) and not codes_in(l.text)], key=lambda l: l.y0)
            sc = [l for l in ls if cx0 <= l.x0 < cx1 and top <= l.y0 < f.y0 and re.fullmatch(r'SC\d+', l.text)]
            if any('Black' in l.font for l in sc):   # a volte sotto l'etichetta c'è un vecchio codice nascosto
                for l in sc: l.used = True
                sc = [l for l in sc if 'Black' in l.font]
            for l in mine + sc: l.used = True
            txt = [l.text for l in mine if l.text != '*']
            t = re.sub(r'^FORMATO', 'Formato', txt[0]); sub = []
            for x2 in txt[1:]:
                if re.match(r'posa\b', x2) and not sub: t += ' · ' + x2
                else: sub.append(x2)
            it = dict(t=t, codes=[dict(c=s.text) for s in sc])
            if sub: it['note'] = re.sub(r'\s+', ' ', ' '.join(sub)).replace(' :', ':')
            out.append((it, crop(img, (cx0, top, cx1, f.y0 - 1))))
            top = max(l.y1 for l in mine) + 2
    return out


def parse_cornici(h, ls, img, imgs):
    r = h['rect']; out = []
    heads = sorted([l for l in ls if re.match(r'CORNICE\s', l.text)], key=lambda l: l.y0)
    proc = [l.y0 for l in ls if l.text.startswith('PROCEDURA')]
    top = r[1] + 26     # lo schema può stare sopra il titolo della cornice
    for i, c in enumerate(heads):
        y1 = heads[i + 1].y0 - 4 if i + 1 < len(heads) else min(proc + [r[3]]) - 4
        mine = sorted([l for l in ls if c.y0 <= l.y0 < y1 and abs(l.x0 - c.x0) < 10], key=lambda l: l.y0)
        it = dict(t=nice(c.text), codes=[], info=[])
        for l in mine:
            l.used = True
            if l is c or l.text == 'SCHEMA DI POSA': continue
            cs = codes_in(l.text)
            if cs: it['codes'].append(dict(c=cs[0]))
            else: it['info'].append(l.text)
        out.append((it, crop(img, (r[0], top, r[2], y1), blank=mine)))
        top = y1
    return out


def generics(lines):
    """codici generici della pagina: pannello posato, sinottico, pannello per pedana (cornici);
    il codice può stare sulla riga dopo, uno per spessore"""
    g = {}
    ls = sorted(lines, key=lambda l: (round(l.y0), l.x0))
    for i, l in enumerate(ls):
        t = l.text
        if not re.search(r'generic[oa]', t, re.I): continue
        k = 'sinottici' if 'sinottico' in t.lower() else ('cornici' if 'pannello generico' in t.lower() else 'posati')
        q = re.search(r'sinottico\s+(.*?)\s*generico\s*(\w*)', t, re.I)   # "sinottico Chevron generico", "generico slabs"
        q = ' '.join(x for x in (q.groups() if q else ()) if x and x.lower() != 'cod')
        cs = [dict(c=c, n=q) if q else dict(c=c) for c in codes_in(t) if c.strip('0')]
        if not cs:
            for n in sorted([n for n in ls if 0 < n.y0 - l.y0 < 45 and abs(n.x0 - l.x0) < 12], key=lambda n: n.y0):
                m = re.match(r'(' + CODE + r')\s*(\((.*)\))?', n.text)
                if not m: break
                c = dict(c=m.group(1))
                if m.group(3): c['n'] = m.group(3)
                cs.append(c); n.used = True
        l.used = True
        if cs: g[k] = g.get(k, []) + [c for c in cs if c not in g.get(k, [])]
    return g


def main():
    os.makedirs(OUT, exist_ok=True)
    items, series, pages = [], {}, {}
    for brand, B in BRANDS.items():
        fn = [f for f in os.listdir(SRC) if f.lower().startswith(brand.lower()) and f.lower().endswith('.pdf')]
        if not fn: print('manca il catalogo', brand); continue
        doc = fitz.open(os.path.join(SRC, fn[0]))
        idx = read_index(doc)
        ed = re.search(r'(\d{4}\.\d{2})', fn[0]).group(1)
        print(brand, fn[0], doc.page_count, 'pagine,', len(idx), 'serie')
        for si, (sname, p0) in enumerate(idx):
            p1 = idx[si + 1][1] - 1 if si + 1 < len(idx) else doc.page_count - 2
            key = norm(SERIES_ALIAS.get(sname.upper(), sname))
            sk = f'{brand}|{sname}'
            S = series.setdefault(sk, dict(b=brand, n=sname, key=key, ed=ed, pages=[], gen={}))
            for pn in range(p0, p1 + 1):
                pg = doc[pn - 1]
                lines = page_lines(pg)
                if not lines and not pg.get_images(): continue
                img = render(pg)
                pid = f'{B}{pn}'
                S['pages'].append(pid)
                if not DRY:
                    for sub, box in (('p', (1240, 1754)), ('pm', (240, 340))):
                        x = img.copy(); x.thumbnail(box, Image.LANCZOS)
                        os.makedirs(os.path.join(OUT, sub), exist_ok=True)
                        x.save(os.path.join(OUT, sub, pid + '.avif'), quality=50)
                for k, v in generics(lines).items():
                    S['gen'][k] = S['gen'].get(k, []) + [c for c in v if c not in S['gen'].get(k, [])]
                imgs = [i['bbox'] for i in pg.get_image_info()]
                hs = headings(lines)
                letter = iter('abcdefghijklmnopqrstuvwxyz' * 3)
                for h in hs:
                    ls = [l for l in lines if not l.used and inside(l, h['rect']) and l is not h['line']]
                    c = h['cat']
                    if c in ('culle', 'espositori', 'scatole'): res = parse_single(h, ls, img, imgs)
                    elif c == 'cataloghi': res = parse_cataloghi(h, ls, img, imgs)
                    elif c in ('sinottici', 'testate'): res = parse_grid(h, ls, img, imgs, c)
                    elif c == 'posati': res = parse_posati(h, ls, img, imgs)
                    elif c == 'cornici': res = parse_cornici(h, ls, img, imgs)
                    for it, pic in res:
                        iid = pid + next(letter)
                        it = dict(id=iid, s=sk, cat=c, **it, pg=pid)
                        if c == 'sinottici' and 'SLABS' in h['h']: it['slabs'] = 1
                        it['img'] = save(pic, iid)
                        for k in ('info', 'codes'):
                            if k in it and not it[k]: del it[k]
                        items.append(it)
                left = [l for l in lines if not l.used and l.size >= 7.5 and not re.fullmatch(r'\d+|\*', l.text)
                        and not re.match(r'PROCEDURA|\d+ - |Per (ordinare|pannelli)|ATTENZIONE|Allegare|Pannello sinottico generico', l.text)]
                if hs and left and '-v' in sys.argv:
                    print('  ', pid, 'non usate:', [l.text for l in left][:12])
    data = dict(series=series, items=items)
    with open(os.path.join(HERE, 'merch_data.js'), 'w', encoding='utf-8') as f:
        f.write('// Generato da build_merch.py — non modificare a mano\nwindow.MERCH = ')
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        f.write(';\n')
    from collections import Counter
    print(len(series), 'serie,', len(items), 'articoli:', dict(Counter(i['cat'] for i in items)))


if __name__ == '__main__':
    main()
