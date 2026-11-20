"""Foto e novità messe dal sito (salvate nel tuo account) pubblicate per tutti: le vede anche chi entra senza account.

Nel sito: Foto campioni -> «Foto e novità per il sito» scarica vetrina-merch-per-il-sito-AAAA-MM-GG.json (le tue foto,
anche quelle salvate online da un altro dispositivo, e le novità; niente clienti né composizioni).
Questo script legge quel file (il più recente in Download, o quello dato come argomento) e scrive:
  foto/sito/*.webp   le foto (max 1600 px)
  sito.js            window.NOVITA_SITO (le novità) e window.FOTO_SITO (chiave del campione -> foto)
Poi si pubblica con pubblica.sh. Con l'account si vedono sempre le tue foto e novità; queste valgono per chi non le ha.
"""
import base64, glob, hashlib, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'foto', 'sito')


def newest_export():
    files = glob.glob(os.path.join(os.path.expanduser('~'), 'Downloads', 'vetrina-merch-per-il-sito-*.json'))
    return max(files, key=os.path.getmtime) if files else None


def file_name(key):
    """nome del file dalla chiave (Emilceramica|MAPIERRE|Blanc Ancienne -> Emilceramica_MAPIERRE_Blanc_Ancienne_1a2b3c.webp)"""
    safe = re.sub(r'[^A-Za-z0-9]+', '_', key).strip('_')[:80]
    return safe + '_' + hashlib.md5(key.encode('utf-8')).hexdigest()[:6] + '.webp'


def main():
    from PIL import Image
    sys.stdout.reconfigure(errors='replace')        # finestra nera di Windows: i caratteri che non sa scrivere diventano ?
    src = sys.argv[1] if len(sys.argv) > 1 else newest_export()
    if not src or not os.path.isfile(src):
        sys.exit('Non trovo il file: nel sito apri Foto campioni e premi «Foto e novità per il sito»')
    d = json.load(open(src, encoding='utf-8'))
    if d.get('app') != 'vetrina-merch' or d.get('kind') != 'sito':
        sys.exit('Non è il file «Foto e novità per il sito»: ' + src)
    os.makedirs(OUT, exist_ok=True)
    fotos, bad = {}, []
    for key, data in sorted((d.get('images') or {}).items()):
        try:
            raw = base64.b64decode(data.split(',', 1)[1])
            name = file_name(key)
            with Image.open(io.BytesIO(raw)) as im:
                im = im.convert('RGB')
                im.thumbnail((1600, 1600))
                im.save(os.path.join(OUT, name), 'WEBP', quality=84)
            fotos[key] = 'foto/sito/' + name
        except Exception as e:
            bad.append(f'{key} ({e})')
    for fn in os.listdir(OUT):                       # via le foto tolte dal sito
        if 'foto/sito/' + fn not in fotos.values():
            os.remove(os.path.join(OUT, fn))
    novita = d.get('novita') or {}
    with open(os.path.join(HERE, 'sito.js'), 'w', encoding='utf-8') as f:
        f.write('// Generato da build_sito.py (foto e novità messe dal sito, pubblicate per tutti) — non modificare a mano\n')
        f.write('window.NOVITA_SITO = ' + json.dumps(novita, ensure_ascii=False, separators=(',', ':')) + ';\n')
        f.write('window.FOTO_SITO = ' + json.dumps(fotos, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'{os.path.basename(src)} del {str(d.get("date"))[:10]}: {len(fotos)} foto, {len(novita)} novità -> sito.js')
    for key in fotos:
        print('  ', key.replace('|', ' · '))
    if bad:
        print('Foto non lette:', bad)


if __name__ == '__main__':
    main()
