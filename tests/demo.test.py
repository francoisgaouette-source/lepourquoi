# Test de bout en bout du mode démonstration, et du mode branché avec un serveur simulé.
# Lancer : python3 tests/demo.test.py   (Playwright requis)
import http.server, threading, functools, json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'web')
OUT = os.path.dirname(os.path.abspath(__file__))
SUPA_UMD = os.environ.get('SUPA_UMD')
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8765), functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
ok = True
import subprocess
FRIGO = json.loads(subprocess.check_output(['node','-e','global.window={};eval(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(JSON.stringify(window.TT_DEMO[1]))',os.path.join(ROOT,'demo.js')]))
# Compte obligatoire : on simule une personne déjà connectée (sinon l'app part vers compte.letabli.ai).
FAUX_COMPTE = 'window.HoldingAI={demarrer:async()=>({session:{nom:"Test"},erreur:null,redirection:false}),deconnexion(){}};'
def connecte(pg):
    pg.route('**/holdingai.js', lambda r: r.fulfill(content_type='text/javascript', body=FAUX_COMPTE))
    pg.route('https://compte.letabli.ai/**', lambda r: r.fulfill(content_type='text/javascript', body=''))
def check(c, m):
    global ok
    print(('OK   ' if c else 'ÉCHEC ') + m); ok = ok and c
with sync_playwright() as p:
    b = p.chromium.launch()
    # ---- Mode démonstration
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); connecte(pg)
    pg.route('**/supabase.min.js', lambda r: r.fulfill(body='', content_type='text/javascript'))
    pg.route('**/config.js', lambda r: r.fulfill(content_type='text/javascript', body='window.TT_CONFIG={nom:"Le Pourquoi",supabaseUrl:"",essaiJours:30};'))
    pg.goto('http://127.0.0.1:8765/'); pg.wait_for_timeout(600)
    check('Un arc-en-ciel' in pg.inner_text('#card h2'), 'fiche d\'exemple affichée')
    check(pg.locator('#scene .el:not(.hide)').count() == 5, 'étape 1 : 5 éléments du dessin visibles')
    pg.screenshot(path=f'{OUT}/mobile-1.png', full_page=True)
    for _ in range(3): pg.click('#next')
    pg.wait_for_timeout(600)
    check(pg.locator('#scene .el:not(.hide)').count() == 17, 'étape 4 : dessin complet')
    pg.click('.chip[data-q="un frigo"]'); pg.wait_for_timeout(300)
    check('Un frigo' in pg.inner_text('#card h2'), 'puce « un frigo »')
    pg.fill('#q', 'GPS'); pg.click('#go'); pg.wait_for_timeout(300)
    check('Le GPS' in pg.inner_text('#card h2'), 'question tapée « GPS »')
    pg.fill('#q', 'les trous noirs'); pg.click('#go'); pg.wait_for_timeout(200)
    check('démonstration' in pg.inner_text('#err'), 'question inconnue en démo : message clair')
    pg.fill('#q', ''); pg.click('#go')
    check('Tape d' in pg.inner_text('#err'), 'question vide refusée')
    pg.click('.opt[data-i="2"]'); check('Exact' in pg.inner_text('#why'), 'bonne réponse du GPS reconnue')
    pg.click('#surp'); pg.wait_for_timeout(200); check('Surprise' in pg.inner_text('#card .tag'), 'Surprends-moi')
    for _ in range(3): pg.click('#next')
    pg.wait_for_timeout(600); pg.screenshot(path=f'{OUT}/mobile-2.png', full_page=True)
    check(pg.evaluate('document.documentElement.scrollWidth') <= 390, 'aucun débordement horizontal à 390 px')
    check(not errs, 'aucune erreur JavaScript ' + str(errs))
    pg.close()
    # ---- Mode branché, serveur simulé
    if True:
        pg = b.new_page(viewport={'width': 1100, 'height': 900}, color_scheme='dark')
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); connecte(pg)
        pg.route('**/config.js', lambda r: r.fulfill(content_type='text/javascript', body='window.TT_CONFIG={nom:"Le Pourquoi",supabaseUrl:"https://faux.supabase.co",supabaseAnonKey:"cle"};'))
        calls = []
        def fiche(route):
            body = json.loads(route.request.post_data or '{}'); calls.append(body)
            route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'},
                body=json.dumps({'fiche': {**FRIGO, 'q': 'un frigo', 'kind': 'daily', 'level': 'normal'}}))
        pg.route('https://faux.supabase.co/functions/v1/fiche', lambda r: r.fulfill(status=200, headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*'}) if r.request.method=='OPTIONS' else fiche(r))
        pg.route('https://faux.supabase.co/**', lambda r: r.fulfill(status=200, content_type='application/json', body='{}', headers={'Access-Control-Allow-Origin':'*'}) if 'functions' not in r.request.url else r.fallback())
        pg.goto('http://127.0.0.1:8765/'); pg.wait_for_timeout(1500)
        check(calls and calls[0].get('mode') == 'jour', 'surprise du jour demandée toute seule au démarrage')
        check('Surprise du jour' in pg.inner_text('#card'), 'surprise du jour affichée')
        pg.screenshot(path=f'{OUT}/desktop-dark.png')
        pg.fill('#q', 'les marées'); pg.click('#go'); pg.wait_for_timeout(500)
        check(calls[-1].get('question') == 'les marées', 'question envoyée à Emma')
        check(pg.locator('#hl button').count() == 1, 'fiche ajoutée à l\'historique de l\'appareil')
        check(not errs, 'aucune erreur JavaScript (mode branché) ' + str(errs))
    # ---- Sans session : l'app demande le compte (obligatoire) et passe la main à la page du compte
    pg = b.new_page()
    pg.route('**/holdingai.js', lambda r: r.fulfill(content_type='text/javascript',
        body='window.HoldingAI={demarrer:async(o)=>{window.__opts=o;return{session:null,erreur:null,redirection:true}},deconnexion(){}};'))
    pg.route('https://compte.letabli.ai/**', lambda r: r.fulfill(content_type='text/javascript', body=''))
    pg.goto('http://127.0.0.1:8765/'); pg.wait_for_timeout(600)
    check(pg.evaluate('window.__opts && window.__opts.obligatoire === true'), 'compte obligatoire demandé au démarrage')
    pg.close()
    b.close()
srv.shutdown()
sys.exit(0 if ok else 1)
