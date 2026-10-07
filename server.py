"""
Server della Vetrina Merch: serve il sito e SALVA TUTTO SU DISCO.

  dati/vetrina.json          clienti, espositori/composizioni, ambientazioni e sale mostra (salvato a ogni modifica)
  dati/backup/*.json         versioni precedenti: una ogni 10 minuti e sempre prima di un'eliminazione (ne tiene 300)
  foto/caricate/*.jpg        foto dei campioni caricate dal browser
  dati/foto_caricate.json    elenco di quelle foto (campione -> file)

Avvio:  python server.py   (oppure doppio clic su "AVVIA VETRINA.bat")  ->  http://localhost:3460
"""
import json, os, re, shutil, sys, threading, time, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, 'dati')
BACKUP = os.path.join(DATA, 'backup')
DB = os.path.join(DATA, 'vetrina.json')
FOTO_DIR = os.path.join(HERE, 'foto', 'caricate')
FOTO_MAN = os.path.join(DATA, 'foto_caricate.json')
KEEP_BACKUPS = 300
AUTO_BACKUP_EVERY = 600          # secondi
PORT = int(os.environ.get('PORT', '3460'))

for p in (DATA, BACKUP, FOTO_DIR):
    os.makedirs(p, exist_ok=True)
lock = threading.Lock()
last_auto_backup = [0.0]


def read_json(path, default):
    try:
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def write_atomic(path, obj):
    """Scrive prima su un file temporaneo e poi lo sostituisce: il file non resta mai a metà."""
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def counts(o):
    return {k: len((o or {}).get(k) or {}) for k in ('clients', 'comps', 'scenes')}


def make_backup(reason):
    if not os.path.exists(DB):
        return None
    name = 'vetrina-%s-%s.json' % (time.strftime('%Y%m%d-%H%M%S'), reason)
    shutil.copy2(DB, os.path.join(BACKUP, name))
    files = sorted(f for f in os.listdir(BACKUP) if f.endswith('.json'))
    for old in files[:-KEEP_BACKUPS]:
        try:
            os.remove(os.path.join(BACKUP, old))
        except OSError:
            pass
    return name


def now_iso():
    t = time.time()
    return time.strftime('%Y-%m-%dT%H:%M:%S', time.localtime(t)) + '.%03d' % int((t % 1) * 1000)


SAFE_BACKUP = re.compile(r'^vetrina-\d{8}-\d{6}-[a-z\-]+\.json$')


def slug(s):
    s = re.sub(r'[^A-Za-z0-9]+', '_', s).strip('_')
    return s[:120] or 'foto'


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HERE, **k)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '/api/' in (args[0] if args else ''):
            return                                   # niente rumore per i salvataggi
        super().log_message(fmt, *args)

    def send_json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        return self.rfile.read(n) if n else b''

    # ── lettura ──
    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        if u.path == '/api/data':
            return self.send_json(read_json(DB, {}))
        if u.path == '/api/meta':
            d = read_json(DB, {})
            return self.send_json({'saved': d.get('saved'), 'counts': counts(d)})
        if u.path == '/api/foto':
            return self.send_json(read_json(FOTO_MAN, {}))
        if u.path == '/api/backups':
            out = []
            for f in sorted(os.listdir(BACKUP), reverse=True):
                if SAFE_BACKUP.match(f):
                    st = os.stat(os.path.join(BACKUP, f))
                    out.append({'file': f, 'size': st.st_size})
            return self.send_json(out)
        if u.path == '/api/backup':
            f = (q.get('f') or [''])[0]
            if not SAFE_BACKUP.match(f):
                return self.send_json({'error': 'nome non valido'}, 400)
            d = read_json(os.path.join(BACKUP, f), None)
            return self.send_json({'file': f, 'counts': counts(d), 'saved': (d or {}).get('saved')} if d else {'error': 'non trovato'})
        return super().do_GET()

    # ── scrittura ──
    def do_POST(self):
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        try:
            if u.path == '/api/data':
                obj = json.loads(self.body().decode('utf-8'))
                if obj.get('app') != 'vetrina-merch':
                    return self.send_json({'error': 'dati non validi'}, 400)
                with lock:
                    old = read_json(DB, None)
                    if old:
                        oc, nc = counts(old), counts(obj)
                        if any(nc[k] < oc[k] for k in oc):
                            make_backup('prima-di-eliminare')
                        elif time.time() - last_auto_backup[0] > AUTO_BACKUP_EVERY:
                            make_backup('auto')
                            last_auto_backup[0] = time.time()
                    obj['saved'] = now_iso()
                    write_atomic(DB, obj)
                return self.send_json({'ok': True, 'saved': obj['saved']})
            if u.path == '/api/restore':
                f = (q.get('f') or [''])[0]
                src = os.path.join(BACKUP, f)
                if not SAFE_BACKUP.match(f) or not os.path.exists(src):
                    return self.send_json({'error': 'versione non trovata'}, 400)
                with lock:
                    make_backup('prima-del-ripristino')
                    d = read_json(src, {})
                    d['saved'] = now_iso()
                    write_atomic(DB, d)
                return self.send_json({'ok': True, 'saved': d['saved']})
            if u.path == '/api/foto':
                ik = (q.get('ik') or [''])[0]
                data = self.body()
                if not ik or not data:
                    return self.send_json({'error': 'foto mancante'}, 400)
                name = slug(ik) + '.jpg'
                with open(os.path.join(FOTO_DIR, name), 'wb') as f:
                    f.write(data)
                with lock:
                    man = read_json(FOTO_MAN, {})
                    man[ik] = 'foto/caricate/%s?v=%d' % (name, int(time.time()))
                    write_atomic(FOTO_MAN, man)
                return self.send_json({'ok': True, 'url': man[ik]})
            if u.path == '/api/foto-del':
                ik = (q.get('ik') or [''])[0]
                with lock:
                    man = read_json(FOTO_MAN, {})
                    path = man.pop(ik, None)
                    write_atomic(FOTO_MAN, man)
                if path:
                    fp = os.path.join(HERE, path.split('?')[0].replace('/', os.sep))
                    if os.path.exists(fp):
                        os.remove(fp)
                return self.send_json({'ok': True})
        except Exception as e:                       # mai far cadere il server
            return self.send_json({'error': str(e)}, 500)
        self.send_json({'error': 'sconosciuto'}, 404)


if __name__ == '__main__':
    srv = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print('Vetrina Merch su http://localhost:%d  -  i dati si salvano in %s' % (PORT, DATA))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
