"""
Genera data.js per la Vetrina Merch:
 - ESPOSITORI: sistemi del catalogo "Emilgroup Cat. Showroom Displays 2026.01"
   (capienza e formati ammessi trascritti dalle schede del PDF)
 - CAMPIONI: fondi del Listino Emilgroup 2026 (../index.html, const PRODUCTS)
Copia anche le foto degli espositori da ../catalogo-prodotti/images in ./img

Rilanciare dopo aver aggiornato il listino:  python build_data.py
"""
import json, os, re, shutil, unicodedata, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LISTINO = os.path.join(ROOT, 'index.html')
CAT_DIR = os.path.join(ROOT, 'catalogo-prodotti')

# ── Espositori ──────────────────────────────────────────────────────────────
# mode:   swing   = girevoli: il portapannello scorre fuori e si ribalta a tavolo (lato B)
#         (geo dei girevoli, dalle schede: w = lato lungo il fronte delle lastre, d = profondità della fila
#          di portapannelli, h = altezza, ext = larghezza con una lastra estratta; misure in cm)
#         book    = pannelli sfogliabili (Fly, Flipper, slabs)
#         drawers = cassettiere
#         rack    = piastrelle in fila su culla/carrello/base
#         wall    = lastra singola fronte (lavagna, totem)
#         teca    = mobile a 3 ripiani con tozzetti in piedi
#         slide   = lastre su pannelli affiancati che scorrono in avanti (opening = DX o SX)
#         culla   = culla modulare: moduli in fila (variants = posti totali, perModule posti per modulo)
#         cassettiera = mobile 100×45×104 con 2 cassetti estraibili da 5 incavi (rows) × cols pezzi
#         colonna = mobile colonna 50×45×104 per cataloghi (nessun campione)
# mirror: id della versione speculare (SX <-> DX), per cambiarla sul posto nell'ambientazione
# system: moduli del Sistema Materia (a parete, si impilano: inferiore + superiore); side: teca DX / SX
#         (tozzetti in diagonale verso destra / sinistra); sided: versione SX / DX scelta nella stanza;
# codes: codice d'ordine per posizione ('inf' / 'sup') e/o lato ('SX' / 'DX')
#         shelf   = mensola bassa con tozzetti in piedi negli incavi (angle = inclinazione, bar = L×H×P cm)
# variants: numero di posti selezionabile; variantFaces/variantLabels: formato e nome per variante
#         grid    = tozzetti / piccoli formati
# face:   dimensioni (cm) della faccia/slot [larghezza, altezza]
# accept: {"sizes": [...]}       formati esatti
#         {"fit": [w, h]}        qualsiasi formato che sta nel pannello (posa)
#         {"tozzetto": [w, h]}   qualsiasi serie, tagliata a tozzetto
#         {"small": n}           piccoli formati (lato max <= n cm)
#         "thick": [...]         filtra per spessore (mm)
DISPLAYS = [
  # GIREVOLI
  dict(id='PLY', code='00000PLY', name='Espositore girevole 60×120', family='Girevoli', mode='swing',
       slots=16, sides=2, face=[60, 120], geo={'w': 97, 'd': 103, 'h': 150, 'ext': 169}, accept={'sizes': ['60x120']},
       dims='L103 × P97 × H150 cm', price=913, spec='16 pezzi 60×120 cm (8 per lato)'),
  dict(id='PLZ', code='00000PLZ', name='Espositore girevole 120×120', family='Girevoli', mode='swing',
       slots=10, sides=2, face=[120, 120], geo={'w': 157, 'd': 67, 'h': 150, 'ext': 289}, accept={'sizes': ['120x120']},
       dims='L67/289 × P157 × H150 cm', price=702,
       spec='10 pezzi 120×120 (solo formato 120×120)'),
  dict(id='PC3', code='00000PC3', name='Espositore girevole 100×100', family='Girevoli', mode='swing',
       slots=16, sides=2, face=[100, 100], geo={'w': 136.5, 'd': 103, 'h': 130, 'ext': 248}, accept={'sizes': ['100x100']},
       dims='L103 × P136,5 × H130 cm', price=1024, spec='16 pezzi 100×100 cm'),
  dict(id='PXT', code='00000PXT', name='Espositore girevole 160×160', family='Girevoli', mode='swing',
       slots=8, sides=2, face=[160, 160], geo={'w': 187.2, 'd': 50.7, 'h': 168.4, 'ext': 357}, accept={'sizes': ['160x160']},
       dims='L187,2/357 × P50,7 × H168,4 cm', price=1118, spec='8 pezzi 160×160 (5 piastrelle + 3 forex)'),
  # PANNELLI / SLABS
  dict(id='PMF', code='00000PMF', name='Fly', family='Pannelli e slabs', mode='book',
       slots=14, sides=1, face=[100, 200], accept={'fit': [100, 200]},
       dims='L230 × P125 × H234 cm', price=1701, spec='14 pannelli 100×200 cm (posa di qualsiasi formato che ci sta)'),
  dict(id='PM0', code='00000PM0', name='Megaesp Fly', family='Pannelli e slabs', mode='book',
       slots=12, sides=1, face=[120, 240], accept={'fit': [120, 240]},
       dims='L260 × P115,2 × H239 cm', price=2084, spec='12 pannelli 120×220/240 cm'),
  dict(id='PMH', code='00000PMH', name='Flipper', family='Pannelli e slabs', mode='book',
       slots=10, sides=1, face=[100, 200], accept={'fit': [100, 200]},
       dims='L64 × P124 × H234 cm', price=1204, spec='10 pannelli 100×200 cm'),
  # 5 carrelli a due lati (SX e DX): si estraggono solo verso di sé, sempre in verticale (niente posizione a tavolo)
  dict(id='PGM', code='00000PGM', name='Espositore slabs 120×278', family='Pannelli e slabs', mode='swing',
       slots=10, sides=2, face=[120, 278], geo={'w': 139, 'd': 82, 'h': 287, 'ext': 266}, noTable=True, sideNames=['SX', 'DX'],
       accept={'sizes': ['120x278']},
       dims='L82 × P139 × H287 cm', price=1004, spec='10 lastre stuoiate 120×278 cm su 5 carrelli a due lati (SX e DX), estraibili verso di sé'),
  dict(id='ILEC', code='0000ILEC', name='Espositore Fly slabs', family='Pannelli e slabs', mode='book',
       slots=12, sides=1, face=[120, 278], accept={'sizes': ['120x278']},
       dims='L264 × P105 × H293 cm', price=2307, spec='12 lastre 120×278 (10 + 2 sulla schiena)'),
  dict(id='ILEF', code='0000ILEF', name='Espositore Slide DX', family='Pannelli e slabs', mode='slide',
       slots=10, face=[120, 278], opening='DX', side='DX', mirror='ILEG', accept={'sizes': ['120x278']},
       dims='L144 × P120 × H290,2 cm', price=1109,
       spec='10 lastre 120×278 montate su pannello, apertura DX (retro del pannello grigio chiaro)'),
  dict(id='ILEG', code='0000ILEG', name='Espositore Slide SX', family='Pannelli e slabs', mode='slide',
       slots=10, face=[120, 278], opening='SX', side='SX', mirror='ILEF', accept={'sizes': ['120x278']},
       dims='L144 × P120 × H290,2 cm', price=1109,
       spec='10 lastre 120×278 montate su pannello, apertura SX (retro del pannello grigio chiaro)'),
  dict(id='PMU', code='00000PMU', name='Totem slabs 120×278', family='Pannelli e slabs', mode='wall',
       slots=2, sides=2, face=[120, 278], accept={'sizes': ['120x278']},
       dims='L120 × P49 × H279 cm', price=380, spec='2 lastre stuoiate 120×278 (fronte / retro)'),
  dict(id='PWA', code='00000PWA', name='Lavagna 160×160', family='Pannelli e slabs', mode='wall',
       slots=1, sides=1, face=[160, 160], accept={'sizes': ['160x160']},
       dims='L160 × P51,4 × H191,3 cm', price=935, spec='1 piastrella 160×160 cm'),
  # CASSETTIERE
  dict(id='PMV', code='00000PMV', name='Cassettiera 60×120', family='Cassettiere', mode='drawers',
       slots=18, face=[120, 60], accept={'sizes': ['60x120']},
       dims='L131,8 × P68 × H104 cm', price=1250, spec='18 piastrelle 60×120 cm'),
  dict(id='PMI', code='00000PMI', name='Cassettiera 120×120', family='Cassettiere', mode='drawers',
       slots=11, face=[120, 120], accept={'sizes': ['120x120']},
       dims='L136 × P190 × H94,5 cm', price=1932, spec='11 pannelli o piastrelle 120×120 cm'),
  dict(id='PMJ', code='00000PMJ', name='Cassettiera 120×240', family='Cassettiere', mode='drawers',
       slots=11, face=[240, 120], accept={'fit': [120, 240]},
       dims='L256 × P190 × H94,5 cm', price=2457, spec='11 pannelli 120×240 cm'),
  # CARRELLATI, CUBO, CULLE, BASI
  dict(id='OYQ', code='00000OYQ', name='Espositore carrellato 60×120 / 60×60', family='Carrellati, cubo e culle', mode='rack',
       slots=10, face=[60, 120], accept={'sizes': ['60x120', '60x60']},
       dims='L76 × P62 × H170 cm', price=293, spec='10 pezzi 60×120 o 60×60 cm'),
  dict(id='PEX', code='00000PEX', name='Espositore carrellato 100×100', family='Carrellati, cubo e culle', mode='rack',
       slots=10, face=[100, 100], accept={'sizes': ['100x100']},
       dims='L76 × P102 × H186 cm', price=357, spec='10 pezzi 100×100 cm'),
  dict(id='PMK', code='00000PMK', name='Espositore cubo', family='Carrellati, cubo e culle', mode='rack',
       slots=15, face=[60, 60], accept={'sizes': ['60x60']},
       dims='L62,3 × P59 × H95 cm', price=199, spec='5 incavi e 15 alloggi per piastrelle 60×60'),
  dict(id='PUB', code='00000PUB/PUD/PUE · PUF/PUG/PUH', name='Culla modulare 35° (SX / DX)', family='Carrellati, cubo e culle', mode='culla',
       slots=42, perModule=14, variants=[14, 28, 42, 56, 70], variantDefault=42,
       variantLabels={'14': '1 modulo', '28': '2 moduli · Start + Closing', '42': '3 moduli · Start + Middle + Closing',
                      '56': '4 moduli · Start + 2 Middle + Closing', '70': '5 moduli · Start + 3 Middle + Closing'},
       moduleCodes={'SX': ['00000PUB', '00000PUD', '00000PUE'], 'DX': ['00000PUF', '00000PUG', '00000PUH']},
       face=[60, 120], accept={'sizes': ['60x120', '80x80', '60x60']},
       dims='L94,5 × P57,9 × H35,6 cm (per modulo)', price=115,
       spec='Base 35° prespaziata per pezzi sfusi 60×120 / 80×80 / 60×60 (modulo inizio, centrale, chiusura)'),
  dict(id='PP2', code='00000PP2', name='Culla base legni 20×120', family='Carrellati, cubo e culle', mode='rack',
       slots=10, face=[20, 120], accept={'sizes': ['20x120']},
       dims='L120 × P35 × H5 cm', price=47, spec='10 piastrelle 20×120 cm'),
  dict(id='PL5', code='00000PL5 / PL6 / PL7', name='Base culla inclinata CARB/E05', family='Carrellati, cubo e culle', mode='rack',
       slots=8, variants=[4, 6, 8], face=[60, 60], accept={'sizes': ['60x60', '30x60', '60x120']},
       dims='L60 × P73 × H28 cm', price=49,
       spec='4 / 6 / 8 incavi. Il catalogo non indica il formato: mostrati 60×60, 30×60, 60×120 (base larga 60) — da verificare'),
  dict(id='PL8', code='00000PL8 / PL9 / PLA', name='Base culla piana CARB/E05', family='Carrellati, cubo e culle', mode='rack',
       slots=8, variants=[4, 6, 8], face=[60, 60], accept={'sizes': ['60x60', '30x60', '60x120']},
       dims='L60 × P73 × H5 cm', price=43,
       spec='4 / 6 / 8 incavi. Il catalogo non indica il formato: mostrati 60×60, 30×60, 60×120 (base larga 60) — da verificare'),
  dict(id='PJR', code='00000PJR', name='Base piana 6 incavi 100×100 (20 mm)', family='Carrellati, cubo e culle', mode='rack',
       slots=6, face=[100, 100], accept={'sizes': ['100x100'], 'thick': ['20']},
       dims='L100 × P99,1 × H20 cm', price=129, spec='6 piastrelle 100×100 spessore 20 mm'),
  dict(id='PJT', code='00000PJT', name='Base piana 6 incavi 120×120 (20 mm)', family='Carrellati, cubo e culle', mode='rack',
       slots=6, face=[120, 120], accept={'sizes': ['120x120'], 'thick': ['20']},
       dims='L119,5 × P99,1 × H20 cm', price=133, spec='6 piastrelle 120×120 spessore 20 mm'),
  dict(id='PJU', code='00000PJU', name='Base piana 6 incavi 60×60 / 80×80 / 60×120 (20 mm)', family='Carrellati, cubo e culle', mode='rack',
       slots=6, face=[60, 60], accept={'sizes': ['60x60', '80x80', '60x120'], 'thick': ['20']},
       dims='L59,5 × P99,1 × H14,9 cm', price=71, spec='6 piastrelle spessore 20 mm 60×60, 80×80 e 60×120'),
  # TOZZETTI
  dict(id='PLT', code='00000PLS / 00000PLU', name='Mobile teca DX', family='Mobili e tozzetti', mode='teca', side='DX', mirror='PLTSX',
       system=True, codes={'inf': '00000PLS', 'sup': '00000PLU'},
       slots=42, rows=3, cols=14, face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5]},
       dims='L100 × P45 × H104 cm', price=461,
       spec='42 tozzetti 19,5×29,5 in diagonale rivolti verso destra, su 3 ripiani (14 per ripiano). Inferiore 00000PLS, superiore 00000PLU'),
  dict(id='PLTSX', code='00000PLT / 00000PLV', name='Mobile teca SX', family='Mobili e tozzetti', mode='teca', side='SX', mirror='PLT',
       system=True, codes={'inf': '00000PLT', 'sup': '00000PLV'},
       slots=42, rows=3, cols=14, face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5]},
       dims='L100 × P45 × H104 cm', price=461,
       spec='42 tozzetti 19,5×29,5 in diagonale rivolti verso sinistra, su 3 ripiani (14 per ripiano). Inferiore 00000PLT, superiore 00000PLV'),
  dict(id='PGE', code='00000PGE / 00000PGF', name='Mobile colonna (inferiore / superiore)', family='Mobili e tozzetti', mode='colonna',
       system=True, codes={'inf': '00000PGE', 'sup': '00000PGF'}, slots=0, face=[1, 1], accept={},
       dims='L50 × P45 × H104 cm', price=308,
       spec='Per cataloghi e folder (non contiene campioni). Inferiore 00000PGE, superiore 00000PGF. Fissaggio a parete obbligatorio'),
  dict(id='PGI', code='00000PGI', name='Mensola lineare', family='Mobili e tozzetti', mode='shelf',
       slots=8, variants=[5, 8], angle=0, bar=[100, 9, 7], face=[10, 20],
       variantFaces={'5': [19.5, 29.5], '8': [10, 20]},
       variantLabels={'5': '5 tozzetti 19,5×29,5', '8': '8 tozzetti 10×20'},
       accept={'tozzetto': [19.5, 29.5]},
       dims='L100 × P7 × H9 cm', price=181, spec='5 tozzetti 19,5×29,5 (oppure 8 tozzetti 10×20)'),
  dict(id='PGG', code='00000PGG', name='Mensola obliqua SX', family='Mobili e tozzetti', mode='shelf', side='SX', mirror='PGH',
       slots=9, angle=-32, bar=[100, 8, 9], face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5], 'noThick': ['20']},
       dims='L100 × P9 × H8 cm', price=189, spec='9 tozzetti 19,5×29,5 in diagonale rivolti verso sinistra (tutte le serie tranne lo spessore 20 mm)'),
  dict(id='PGH', code='00000PGH', name='Mensola obliqua DX', family='Mobili e tozzetti', mode='shelf', side='DX', mirror='PGG',
       slots=9, angle=32, bar=[100, 8, 9], face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5], 'noThick': ['20']},
       dims='L100 × P9 × H8 cm', price=189, spec='9 tozzetti 19,5×29,5 in diagonale rivolti verso destra (tutte le serie tranne lo spessore 20 mm)'),
  dict(id='PGD', code='00000PGD', name='Mobile cassettiera tozzetti', family='Mobili e tozzetti', mode='cassettiera',
       system=True, slots=40, drawers=2, rows=5, cols=4, face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5]},
       dims='L100 × P45 × H104 cm', price=553,
       spec='2 cassetti estraibili da 5 incavi per piccoli formati e tozzetti 19,5×29,5 (4 pezzi per incavo = 40). Fissaggio a parete obbligatorio'),
  dict(id='PU8', code='00000PU8', name='Mobile cassettiera tozzetti 20 mm', family='Mobili e tozzetti', mode='cassettiera',
       system=True, slots=50, drawers=2, rows=5, cols=5, face=[20, 20], accept={'tozzetto': [20, 20], 'thick': ['20']},
       dims='L100 × P45 × H104 cm', price=553,
       spec='2 cassetti estraibili da 5 incavi per tozzetti 10×20 / 20×20 spessore 20 mm (5 pezzi per incavo = 50). Fissaggio a parete obbligatorio'),
  dict(id='PL0', code='00000PL0', name='Espositore da banco 6,5 mm', family='Mobili e tozzetti', mode='grid',
       slots=15, cols=5, face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5], 'thick': ['6,5']},
       dims='L43 × P25 × H7 cm', price=31, spec='5 incavi per 15 tozzetti spessore 6,5 mm'),
  dict(id='PL3', code='00000PL3', name='Espositore da banco 20 mm', family='Mobili e tozzetti', mode='grid',
       slots=15, cols=5, face=[19.5, 29.5], accept={'tozzetto': [19.5, 29.5], 'thick': ['20']},
       dims='L36 × P25 × H7 cm', price=31, spec='5 incavi per 15 tozzetti spessore 20 mm'),
  dict(id='PL1', code='00000PL1', name='Espositore da banco piccoli formati', family='Mobili e tozzetti', mode='grid',
       slots=15, cols=5, face=[20, 20], accept={'small': 30, 'thick': ['9', '9,5']},
       dims='L43 × P25 × H7 cm', price=32, spec='5 incavi per pezzi sfusi piccoli formati (esagone, brick, maioliche…) spessore 9 / 9,5 mm'),
]

BRAND_NAMES = {'EMILCERAMICA': 'Emilceramica', 'ERGON': 'Ergon', 'PROVENZA': 'Provenza', 'VIVA': 'Viva'}


def load_products():
    """Prodotti dal listino Emilgroup sul PC; ne tiene una copia in prodotti.json, così il sito
    si ricostruisce anche dove il listino non c'è (es. sessione cloud collegata a GitHub)."""
    copia = os.path.join(HERE, 'prodotti.json')
    if not os.path.isfile(LISTINO):
        return json.load(open(copia, encoding='utf-8'))
    s = open(LISTINO, encoding='utf-8-sig').read()
    i = s.index('const PRODUCTS = ') + len('const PRODUCTS = ')
    products, _ = json.JSONDecoder().raw_decode(s, i)
    # il repository è pubblico: nella copia niente prezzi, solo i campi che servono alla vetrina
    keep = ('brand', 'series', 'type', 'size', 'finish', 'code', 'color', 'thickness', 'subseries')
    with open(copia, 'w', encoding='utf-8') as f:
        json.dump([{k: p.get(k) for k in keep} for p in products], f, ensure_ascii=False, separators=(',', ':'))
    return products


def build_samples(products):
    """Un campione = marca + serie + colore + formato (finiture e codici raggruppati)."""
    groups = {}
    # decori con lo stesso colore/formato del fondo liscio (es. PIETRA ESSENZA Cotone 60x120 "DUNE"):
    # diventano un campione a parte ("Cotone Dune"), così non si confondono con il liscio
    plain = {(p.get('series'), (p.get('color') or '').strip(), p.get('size')) for p in products
             if p.get('type') == 'fondo' and not p.get('subseries')}
    for p in products:
        if p.get('type') != 'fondo':
            continue
        brand = BRAND_NAMES.get(p['brand'], p['brand'].title())
        series = (p.get('series') or '').strip()
        color = (p.get('color') or '').strip()
        size = (p.get('size') or '').strip()
        sub = (p.get('subseries') or '').strip()
        if sub and (p.get('series'), color, p.get('size')) in plain and sub.lower() not in color.lower():
            color = (color + ' ' + sub.title()).strip()
        if not series or not size:
            continue
        key = '|'.join([brand, series, color, size])
        g = groups.setdefault(key, dict(b=brand, s=series, c=color, z=size, f=[], k=[], t=[]))
        fin = (p.get('finish') or '').strip()
        if fin and fin not in g['f']:
            g['f'].append(fin)
        if p.get('code') and p['code'] not in g['k']:
            g['k'].append(p['code'])
        th = (p.get('thickness') or '').replace('MM', '').strip()
        if th and th not in g['t']:
            g['t'].append(th)
    return sorted(groups.values(), key=lambda g: (g['b'], g['s'], g['c'], g['z']))


def display_images():
    prods = json.load(open(os.path.join(CAT_DIR, 'products.json'), encoding='utf-8'))
    by_code = {p['code']: p for p in prods if p['brand'] == 'Emilgroup'}
    os.makedirs(os.path.join(HERE, 'img'), exist_ok=True)
    for d in DISPLAYS:
        code = d['code'].split()[0].split('/')[0]
        p = by_code.get(code)
        if not p:
            continue
        src = os.path.join(CAT_DIR, p['image'])
        page = os.path.join(CAT_DIR, p['page_image'].replace('_full', '_page'))
        name = 'esp_' + d['id'] + '.jpg'
        shutil.copyfile(src, os.path.join(HERE, 'img', name))
        d['img'] = 'img/' + name
        if os.path.exists(page):
            pname = 'scheda_' + d['id'] + '.jpg'
            shutil.copyfile(page, os.path.join(HERE, 'img', pname))
            d['sheet'] = 'img/' + pname


IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp', '.avif')


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')
    return ' ' + re.sub(r'[^a-z0-9]+', ' ', s).strip() + ' '


def match_photos(samples):
    """Foto in ./foto abbinate a marca|serie|colore: prima per codice prodotto nel nome del file
    (es. EKPJ_ONYX_GREEN.avif), poi per serie + colore (es. 'Tele di Marmo Onyx Onyx Green.jpg').
    Il codice prodotto è di un formato preciso: la foto vale anche per quel formato (found_z),
    così ogni formato di una serie può avere la sua (es. PIGMENTO 60×120 cardboard e lastra 120×278)."""
    folder = os.path.join(HERE, 'foto')
    if not os.path.isdir(folder):
        return {}, {}, []
    by_code = {}
    keys = {}
    for s in samples:
        ik = '|'.join([s['b'], s['s'], s['c']])
        keys[ik] = (norm(s['s']), norm(s['c']).strip(), norm(s['b']))
        for k in s['k']:
            by_code[k.upper()] = (ik, '|'.join([s['b'], s['s'], s['c'], s['z']]), s['k'].index(k))
    found, unmatched, dec_of = {}, [], {}
    found_z, dec_z = {}, {}
    for fn in sorted(os.listdir(folder)):
        if not fn.lower().endswith(IMG_EXT):
            continue
        stem = os.path.splitext(fn)[0]
        toks = re.split(r'[^A-Za-z0-9]+', stem.upper())
        toks += [stem.lstrip('_').upper()[:4]]        # codice attaccato al resto del nome (es. EMLZ20PS20PURE...)
        hit = next((by_code[t] for t in toks if t in by_code), None)
        ik, zkey, cidx = hit if hit else (None, None, 99)
        if not ik:
            name = norm(urllib.parse.unquote(stem))      # "White%20Concrete" -> "White Concrete"
            hits = [(len(se) + len(co), k) for k, (se, co, br) in keys.items()
                    if se in name and (not co or ' ' + co + ' ' in name)]
            hits.sort(reverse=True)
            if hits and (len(hits) == 1 or hits[0][0] > hits[1][0]):
                ik = hits[0][1]
        if ik:
            # se per lo stesso colore/formato c'è anche la foto liscia, il decoro (es. "Dec Metalriddle", "3D") non la sostituisce
            is_dec = bool(re.search(r'(^|[^A-Za-z])dec(oro)?([^A-Za-z]|$)', stem, re.I) or re.search(r'3D', stem.replace('%20', ' ')))
            # a parità di campione vince la foto liscia e, tra le lisce, quella col codice che viene prima nel listino
            rank = (is_dec, cidx)
            if zkey and (zkey not in found_z or rank < dec_z[zkey]):
                found_z[zkey] = 'foto/' + fn
                dec_z[zkey] = rank
            if ik not in found or rank < dec_of[ik]:
                found[ik] = 'foto/' + fn
                dec_of[ik] = rank
        else:
            unmatched.append(fn)
    return found, found_z, unmatched


DECOR_WORDS = {'onde', 'ritmo', 'dune', 'cardboard', 'rilievi', 'decoro', 'kalco', 'mural', 'trame', 'splitstone',
               'metalriddle', 'acanto', 'pointes', 'roma', 'magna', 'slim', 'opus', 'rebus', 'breccia', 'brecciato', 'brecc', 'ligne'}
# parole che devono coincidere: un "Dark Grey" non presta a un "Grey", un effetto legno non presta a un effetto cemento
COLOR_WORDS = {'white', 'bianco', 'blanc', 'beige', 'greige', 'grey', 'gray', 'gris', 'grigio', 'black', 'noir', 'nero', 'sand', 'sabbia',
               'sale', 'ivory', 'avorio', 'cream', 'crema', 'taupe', 'brown', 'chocolate', 'anthracite', 'antracite', 'smoke', 'blue', 'blu',
               'green', 'verde', 'pink', 'rosa', 'cenere', 'basalto', 'perla', 'cotone', 'mandorla', 'terracotta', 'ocra', 'rosato', 'naturel',
               'silver', 'gold', 'oro', 'talc', 'talco', 'ash', 'lead', 'piombo', 'corda', 'cappuccino', 'salvia', 'amaranto', 'avio', 'calamine',
               'steel', 'dark', 'light', 'cielo', 'polvere', 'siena', 'rosso', 'red', 'malva', 'miele', 'giada', 'turchese', 'azure', 'ambra'}
MUST_MATCH = {'dark', 'light', 'extra', 'super', 'superwhite', 'wood', 'brick', 'majolica', 'concrete', 'cement'}


def borrow_photos(samples, photos):
    """Colori senza foto: prendono quella di un colore della stessa serie con lo stesso colore di base
    (es. MATERA STONE Neutra White -> Sassi White, GEMMASTONE Sale Gemma Fine -> Sale Gemma Giant).
    Conta di più la parola che distingue il colore (White, Sale...) di quella comune a molti (Neutra, Gemma...).
    Mai da un decoro e mai per un decoro, così il liscio non si confonde con il decorato (es. i Dune)."""
    import math
    by_series = {}
    for s in samples:
        if s.get('toz'):
            continue
        by_series.setdefault((s['b'], s['s']), set()).add(s['c'])
    tok = lambda c: {t for t in re.findall(r'[a-z0-9]+', norm(c)) if len(t) > 1}   # niente lettere singole (Peonia A / Carioca A)
    decor = lambda c: bool(tok(c) & DECOR_WORDS)
    out, orig = {}, dict(photos)                     # si presta solo da foto vere, mai a catena
    for (b, ser), cols in by_series.items():
        n = len(cols)
        df = {}
        for c in cols:
            for t in tok(c):
                df[t] = df.get(t, 0) + 1
        for c in sorted(cols):
            ik = '|'.join([b, ser, c])
            if ik in photos or decor(c):
                continue
            best = None
            for o in cols:
                oik = '|'.join([b, ser, o])
                if o == c or oik not in orig or decor(o):
                    continue
                if (tok(c) ^ tok(o)) & MUST_MATCH:
                    continue
                if (tok(c) - COLOR_WORDS) != (tok(o) - COLOR_WORDS):   # grafiche diverse (Neutra/Sassi/Ritmo, Gemma Fine/Giant) = prodotti diversi: niente prestito
                    continue
                cw = tok(c) & COLOR_WORDS
                if cw and not cw <= tok(o):              # se il nome dice il colore, deve essere lo stesso (Grey Rock non da Blue Rock)
                    continue
                shared = tok(c) & tok(o)
                score = sum(math.log(n / df[t]) for t in shared if df[t] < n)
                if score > 0 and (best is None or score > best[0]):
                    best = (score, oik)
            if best:
                photos[ik] = orig[best[1]]
                out[ik] = best[1]
    return out


def make_medium():
    """Foto medie (max 1600 px, webp) in foto/medie/: le usa il telefono. Le foto originali sono AVIF fino a
    1920 px: alcuni iPhone non leggono l'AVIF e con tante foto grandi il browser del telefono ne lascia alcune vuote."""
    from PIL import Image
    folder, med, out = os.path.join(HERE, 'foto'), os.path.join(HERE, 'foto', 'medie'), {}
    os.makedirs(med, exist_ok=True)
    for fn in sorted(os.listdir(folder)):
        src = os.path.join(folder, fn)
        if not (os.path.isfile(src) and fn.lower().endswith(IMG_EXT)):
            continue
        name = os.path.splitext(fn)[0] + '.webp'
        dst = os.path.join(med, name)
        if not os.path.isfile(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            try:
                with Image.open(src) as im:
                    im = im.convert('RGB')
                    im.thumbnail((1600, 1600))
                    im.save(dst, "WEBP", quality=84)
            except Exception:
                continue
        out['foto/' + fn] = 'foto/medie/' + name
    for fn in os.listdir(med):
        if 'foto/medie/' + fn not in out.values():
            os.remove(os.path.join(med, fn))
    return out


def make_thumbs():
    """Miniature (max 240 px, webp) delle foto in foto/mini/: le usano i quadratini e gli elenchi,
    così non si caricano centinaia di foto grandi (lento soprattutto sul telefono). Rifà solo quelle cambiate."""
    from PIL import Image
    folder, mini, out = os.path.join(HERE, 'foto'), os.path.join(HERE, 'foto', 'mini'), {}
    os.makedirs(mini, exist_ok=True)
    for fn in sorted(os.listdir(folder)):
        src = os.path.join(folder, fn)
        if not (os.path.isfile(src) and fn.lower().endswith(IMG_EXT)):
            continue
        name = os.path.splitext(fn)[0] + '.webp'
        dst = os.path.join(mini, name)
        if not os.path.isfile(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
            try:
                with Image.open(src) as im:
                    im = im.convert('RGB')
                    im.thumbnail((240, 240))
                    im.save(dst, 'WEBP', quality=72)
            except Exception:
                continue
        out['foto/' + fn] = 'foto/mini/' + name
    for fn in os.listdir(mini):                      # toglie le miniature di foto non più presenti
        if 'foto/mini/' + fn not in out.values():
            os.remove(os.path.join(mini, fn))
    return out


def photo_sizes():
    """Larghezza e altezza di ogni foto: il sito sa subito se è verticale o orizzontale e la gira
    con il CSS, senza aprire tutte le foto all'avvio (sul telefono è troppo pesante e la pagina si chiude)."""
    from PIL import Image
    folder, out = os.path.join(HERE, 'foto'), {}
    for fn in sorted(os.listdir(folder)):
        if fn.lower().endswith(IMG_EXT):
            try:
                with Image.open(os.path.join(folder, fn)) as im:
                    out['foto/' + fn] = list(im.size)
            except Exception:
                pass
    return out


def main():
    samples = build_samples(load_products())
    display_images()
    photos, photos_z, unmatched = match_photos(samples)
    borrowed = borrow_photos(samples, photos)
    out = os.path.join(HERE, 'data.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('// Generato da build_data.py — non modificare a mano\n')
        f.write('window.ESPOSITORI = ' + json.dumps(DISPLAYS, ensure_ascii=False) + ';\n')
        f.write('window.CAMPIONI = ' + json.dumps(samples, ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('window.FOTO = ' + json.dumps(photos, ensure_ascii=False) + ';\n')
        f.write('window.FOTO_Z = ' + json.dumps(photos_z, ensure_ascii=False) + ';\n')
        f.write('window.FOTO_WH = ' + json.dumps(photo_sizes(), ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('window.FOTO_MINI = ' + json.dumps(make_thumbs(), ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('window.FOTO_MED = ' + json.dumps(make_medium(), ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(len(DISPLAYS), 'espositori,', len(samples), 'campioni,', len(photos), 'colori con foto,', len(photos_z), 'formati con la loro foto ->', out)
    for ik, path in photos.items():
        print('  ', path, '->', ik.replace('|', ' · '))
    if borrowed:
        print('Colori senza foto propria, con la foto di un colore uguale della stessa serie:')
        for ik, src in sorted(borrowed.items()):
            print('   ', ik.split('|', 1)[1], '<-', src.split('|')[2])
    if unmatched:
        print('Foto NON abbinate (metti il codice prodotto o "Serie Colore" nel nome):', unmatched)
    missing = [d['id'] for d in DISPLAYS if 'img' not in d]
    if missing:
        print('Senza foto:', missing)


if __name__ == '__main__':
    main()
