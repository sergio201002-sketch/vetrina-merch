"""codici.js: per ogni codice d'ordine dei prodotti con più codici, la sua finitura e il suo spessore.

Nei campioni (data.js) finiture, codici e spessori sono elenchi separati: se due codici dello stesso
prodotto hanno la stessa finitura (es. CORNERSTONE EVOLUTION Slate Black 60x120 Naturale R10:
E7KY 9,5 mm ed EKDE 6,5 mm) non si capisce più quale codice è quale. Con codici.js il sito fa
un campione per codice, con la finitura e lo spessore giusti, e un codice incollato sceglie
sempre quello giusto.

Uso: python build_codici.py   (legge prodotti.json, la copia del listino, e i campioni di data.js;
lo lancia anche build_data.py alla fine)
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    products = json.load(open(os.path.join(HERE, 'prodotti.json'), encoding='utf-8'))
    info = {}
    for p in products:
        if p.get('type') != 'fondo' or not p.get('code'):
            continue
        th = (p.get('thickness') or '').replace('MM', '').strip()
        info[p['code']] = [(p.get('finish') or '').strip(), th]
    # i codici dei campioni del sito (data.js) che ne hanno più di uno
    s = open(os.path.join(HERE, 'data.js'), encoding='utf-8').read()
    i = s.index('window.CAMPIONI = ') + len('window.CAMPIONI = ')
    campioni, _ = json.JSONDecoder().raw_decode(s, i)
    keep = {c: info[c] for x in campioni if len(x.get('k') or []) > 1 for c in x['k'] if c in info}
    out = os.path.join(HERE, 'codici.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('// generato da build_codici.py: codice -> [finitura, spessore mm] (solo prodotti con più codici)\n')
        f.write('window.CODE_INFO = ' + json.dumps(keep, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ';\n')
    print(f'codici.js: {len(keep)} codici')


if __name__ == '__main__':
    main()
