"""
Tozzetti A4 19,5×29,5 ufficiali (fonti/tozzetti_A4.xlsx, foglio "Export") -> tozzetti.js (window.TOZ_A4).
Ogni tozzetto: codice vero (0000IL..), marca, serie e colore abbinati al listino (per le foto), finitura, spessore, stato.
Rilanciare quando arriva un elenco nuovo:  python build_tozzetti.py
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'fonti', 'tozzetti_A4.xlsx')

BRANDS = {'EMIL': 'Emilceramica', 'ERGON': 'Ergon', 'PROVENZA': 'Provenza', 'VIVA': 'Viva'}
FINISH = [('SILKTECH PLUS', 'Silktech Plus'), ('SILKTECH', 'Silktech'), ('FULL LAPPATO', 'Full Lappato'),
          ('LAPPATO ANTIQUE', 'Lappato Antique'), ('LAPPATO', 'Lappato'), ('LAP', 'Lappato'), ('TECNICA', 'Tecnica'), ('NAT', 'Naturale'),
          ('NATURALE', 'Naturale'), ('STRUTTURATO', 'Strutturato'), ('GRIP', 'Grip')]
SERIES_ALIAS = {'UNIQUE BOURG': 'UNIQUE BOURGOGNE', 'EVERSTONE': 'EVER–STONE', 'FORNACE PROVENZA': 'FORNACE'}


def load_campioni():
    s = open(os.path.join(HERE, 'data.js'), encoding='utf-8').read()
    i = s.index('window.CAMPIONI = ') + len('window.CAMPIONI = ')
    j = s.index(';\n', i)
    return json.loads(s[i:j])


def toks(t):
    import unicodedata
    t = unicodedata.normalize('NFKD', t.upper().replace('–', ' ').replace('-', ' ').replace("'", ''))
    t = ''.join(ch for ch in t if not unicodedata.combining(ch))
    return [w for w in re.split(r'[^A-Z0-9]+', t) if w and w != 'DECORO']


def tok_in(w, words):
    # parola uguale, o abbreviata (MICHEL = MICHELANGELO)
    return any(x == w or (len(w) >= 4 and len(x) >= 4 and (x.startswith(w) or w.startswith(x))) for x in words)


def main():
    try:
        import openpyxl
    except ImportError:
        sys.exit('Serve openpyxl:  pip install openpyxl')
    if not os.path.exists(SRC):
        sys.exit('Manca ' + SRC)
    wb = openpyxl.load_workbook(SRC, data_only=True)
    rows = list(wb['Export'].iter_rows(min_row=2, values_only=True))
    camp = load_campioni()
    for x in camp:
        x['ik'] = '|'.join([x['b'], x['s'], x['c']]); x['key'] = x['ik'] + '|' + x['z']
    # un candidato per colore del listino (marca, serie, colore, grafica)
    cand = {}
    for x in camp:
        k = (x['b'], x['s'], x['c'], x.get('g', ''))
        cand.setdefault(k, []).append(x)
    out, unmatched = [], []
    for r in rows:
        if not r or not r[4]:
            continue
        brand = BRANDS.get(str(r[0]).split(' (')[0].strip(), str(r[0]).split(' (')[0].title())
        series = str(r[1]).split(' (')[0].strip()
        series = SERIES_ALIAS.get(series, series)
        code, desc, status, launch = str(r[4]).strip(), str(r[6] or r[5]), str(r[8] or ''), str(r[15] or '')
        d = re.sub(r'^195X295\s+', '', desc.upper())
        d = d.split(' CON FOREX')[0]
        thick = '6,5' if re.search(r'6,5\s*MM', d) else ''
        d = re.sub(r'\b6,5\s*MM\b', ' ', d)
        fin = ''
        for a, b in FINISH:
            if re.search(r'\b' + a + r'\b', d):
                fin = b
                d = re.sub(r'\b' + a + r'\b', ' ', d)
                break
        words = toks(d)
        # abbina al colore del listino: tutte le parole del colore (e la prima della serie) nella descrizione
        best, bscore = None, -1
        for (b, s, c, g), lst in cand.items():
            if b != brand:
                continue
            st = toks(s)
            if not (tok_in(st[0], words) or s == series):
                continue
            ct = toks(c)
            if not ct or not all(tok_in(w, words) for w in ct):
                continue
            extra = [w for w in words if not tok_in(w, ct + st)]
            score = len(ct) * 10 + sum(tok_in(w, words) for w in st) * 3 - len(extra) * 2 + (5 if s == series else 0)
            # grafica (3D Slats, Playtangram, Modula…): vale solo se il suo nome è nella descrizione
            if g:
                gt = toks(g)
                score += 15 if gt and all(tok_in(w, words) for w in gt) else -15
            if score > bscore:
                best, bscore = (b, s, c, g, lst), score
        if best:
            b, s, c, g, lst = best
            ref = next((x for x in lst if x['z'] == '60x120'), lst[0])
            if not thick:
                ts = [t for x in lst for t in x.get('t', []) if t not in ('6,5', '20')]
                thick = ts[0] if ts else ''
            item = {'k': code, 'b': b, 's': s, 'c': c, 'g': g, 'gi': ref.get('gi', 0), 'dec': ref.get('dec', 0),
                    'ik': ref['ik'], 'pkey': ref['key'], 'fin': fin, 't': thick, 'st': status, 'l': launch}
        else:
            name = ' '.join(w.title() for w in words if not tok_in(w, toks(series) + toks(str(r[1]).split(' (')[0])))
            item = {'k': code, 'b': brand, 's': series, 'c': name or desc, 'g': '', 'gi': 0, 'dec': 0,
                    'ik': brand + '|' + series + '|' + (name or desc), 'pkey': '', 'fin': fin, 't': thick or '9,5', 'st': status, 'l': launch}
            unmatched.append(code + ' ' + desc)
        out.append(item)
    with open(os.path.join(HERE, 'tozzetti.js'), 'w', encoding='utf-8') as f:
        f.write('// Generato da build_tozzetti.py (fonti/tozzetti_A4.xlsx) — non modificare a mano\n')
        f.write('window.TOZ_A4 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(len(out), 'tozzetti A4 ->', os.path.join(HERE, 'tozzetti.js'))
    print(len(out) - len(unmatched), 'abbinati al listino;', len(unmatched), 'senza colore del listino (senza foto):')
    for u in unmatched:
        print('   ', u)


if __name__ == '__main__':
    main()
