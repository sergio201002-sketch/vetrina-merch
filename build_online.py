"""Prepara la copia ONLINE della vetrina (pagina su claude.ai) nella cartella online/.
I file restano quelli del sito; cambiano solo:
- index.html senza le righe <html>/<head>/<body> (le aggiunge claude.ai);
- foto con nomi senza spazi o simboli (e data.js aggiornato con i nuovi nomi).
Dopo averlo lanciato si ripubblica la cartella online/."""
import os, re, shutil, json

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'online')


def safe(name):
    stem, ext = os.path.splitext(name)
    stem = re.sub(r'[^A-Za-z0-9._-]+', '_', stem.replace('%20', '_')).strip('_') or 'foto'
    return stem + ext.lower()


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(os.path.join(OUT, 'foto'))
    shutil.copytree(os.path.join(HERE, 'img'), os.path.join(OUT, 'img'))

    data = open(os.path.join(HERE, 'data.js'), encoding='utf-8').read()
    used, ren = set(), {}
    for fn in sorted(os.listdir(os.path.join(HERE, 'foto'))):
        src = os.path.join(HERE, 'foto', fn)
        if not os.path.isfile(src):
            continue
        new, n = safe(fn), 1
        while new.lower() in used:
            n += 1
            new = os.path.splitext(safe(fn))[0] + f'_{n}' + os.path.splitext(fn)[1].lower()
        used.add(new.lower())
        ren[fn] = new
        shutil.copy2(src, os.path.join(OUT, 'foto', new))
    for old, new in ren.items():
        data = data.replace('"foto/' + old + '"', '"foto/' + new + '"')
    open(os.path.join(OUT, 'data.js'), 'w', encoding='utf-8').write(data)

    for f in ('salva.js', 'clienti.js', 'ambiente.js', 'espositori3d.js'):
        shutil.copy2(os.path.join(HERE, f), os.path.join(OUT, f))

    html = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
    for tag in ('<!DOCTYPE html>', '<html lang="it">', '<head>', '</head>', '<body>', '</body>', '</html>'):
        html = html.replace(tag + '\n', '', 1).replace(tag, '', 1)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html.lstrip())

    left = [m for m in re.findall(r'"foto/([^"]+)"', data) if not os.path.isfile(os.path.join(OUT, 'foto', m))]
    size = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
    print(len(ren), 'foto,', round(size / 1e6, 1), 'MB ->', OUT)
    if left:
        print('ATTENZIONE foto non trovate:', left[:10])


if __name__ == '__main__':
    main()
