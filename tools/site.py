# Génère les pages du site lepourquoi.ai (dossier web/site/).
# Lancer : python3 tools/site.py   — puis pousser sur GitHub.
import os, datetime

ICI = os.path.dirname(os.path.abspath(__file__))
SORTIE = os.path.join(ICI, '..', 'web', 'site')
APP = 'https://app.lepourquoi.ai'
COURRIEL = 'bonjour@lepourquoi.ai'
MAJ = '25 novembre 2026'

SIMON = '''<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="22" fill="#f2c49b"/><g fill="#5a3a22"><circle cx="16" cy="22" r="8"/><circle cx="24" cy="14" r="9"/><circle cx="35" cy="12" r="9"/><circle cx="46" cy="17" r="8"/><circle cx="51" cy="26" r="6"/><circle cx="13" cy="30" r="5"/></g><circle cx="10.5" cy="37" r="4" fill="#f2c49b"/><circle cx="53.5" cy="37" r="4" fill="#f2c49b"/><g fill="none" stroke="#191714" stroke-width="2.4"><circle cx="24" cy="36" r="6.5"/><circle cx="40" cy="36" r="6.5"/><path d="M30.5 36h3"/></g><circle cx="24" cy="36.5" r="2" fill="#191714"/><circle cx="40" cy="36.5" r="2" fill="#191714"/><path d="M25 47q7 6 14 0" fill="none" stroke="#191714" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="45" r="2.6" fill="#e8462a" opacity=".35"/><circle cx="46" cy="45" r="2.6" fill="#e8462a" opacity=".35"/></svg>'''

PAGES = [('/', 'Accueil'), ('/comment-ca-marche', 'Comment ça marche'), ('/simon', 'Simon'), ('/questions', 'Questions')]

def page(chemin, titre, description, corps):
    nav = ''.join(f'<a href="{c}"{" aria-current=\"page\"" if c == chemin else ""}>{t}</a>' for c, t in PAGES[1:])
    return f'''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{titre}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://lepourquoi.ai{chemin}">
<meta name="theme-color" content="#ffd84d">
<link rel="icon" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700;800&family=Nunito+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/site.css">
</head>
<body>
<header class="nav"><div class="wrap">
  <a class="logo" href="/">{SIMON}Le Pourquoi</a>
  <nav class="liens" aria-label="Site">{nav}<a href="{APP}">Ouvrir l'app</a></nav>
</div></header>
<main>
{corps}
</main>
<footer><div class="wrap">
  <span>© {datetime.date.today().year} Le Pourquoi, une app de HoldingAI · Gratuite, avec ton compte HoldingAI</span>
  <nav aria-label="Pied de page"><a href="/questions">Questions</a><a href="/confidentialite">Confidentialité</a><a href="/conditions">Conditions</a><a href="mailto:{COURRIEL}">{COURRIEL}</a></nav>
</div></footer>
</body>
</html>
'''

SCHEMA = '''<svg class="schema" viewBox="0 0 400 200" role="img" aria-label="Exemple de dessin : une goutte de pluie qui sépare la lumière en couleurs">
<defs><marker id="f" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="#e23d3d"/></marker><marker id="j" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="#f5b700"/></marker></defs>
<circle cx="46" cy="40" r="20" fill="#f5b700" fill-opacity=".3" stroke="#f5b700" stroke-width="2.5"/>
<line x1="70" y1="50" x2="160" y2="80" stroke="#f5b700" stroke-width="3.5" marker-end="url(#j)"/>
<circle cx="220" cy="105" r="62" fill="#5fb3e8" fill-opacity=".28" stroke="#5fb3e8" stroke-width="2.5"/>
<line x1="160" y1="80" x2="276" y2="88" stroke="#e23d3d" stroke-width="3.5"/><line x1="160" y1="80" x2="270" y2="134" stroke="#7b4ddb" stroke-width="3.5"/>
<line x1="276" y1="88" x2="190" y2="158" stroke="#e23d3d" stroke-width="3.5"/><line x1="270" y1="134" x2="200" y2="164" stroke="#7b4ddb" stroke-width="3.5"/>
<line x1="190" y1="158" x2="80" y2="188" stroke="#e23d3d" stroke-width="3.5" marker-end="url(#f)"/>
<text x="46" y="80" text-anchor="middle" font-family="Nunito Sans,sans-serif" font-weight="700" font-size="13" fill="currentColor">Soleil</text>
<text x="335" y="110" text-anchor="middle" font-family="Nunito Sans,sans-serif" font-weight="700" font-size="13" fill="#e8462a">Les couleurs</text>
<text x="335" y="126" text-anchor="middle" font-family="Nunito Sans,sans-serif" font-weight="700" font-size="13" fill="#e8462a">s'écartent</text>
</svg>'''

ACCUEIL = f'''<section class="hero"><div class="wrap">
  <div>
    <h1>C'est quoi, et comment ça marche&nbsp;?</h1>
    <p class="lead">Tape une chose qui t'intrigue. Simon te l'explique en une minute, avec un dessin qui se construit sous tes yeux, et il te le lit à voix haute.</p>
    <div class="actions"><a class="btn plein" href="{APP}">Ouvrir l'app</a><a class="btn clair" href="/comment-ca-marche">Comment ça marche</a></div>
  </div>
  <div class="carte" aria-label="Exemple de fiche">
    <span class="tag">Surprise du jour</span>
    <h3>Un arc-en-ciel</h3>
    <div class="dit">{SIMON}<div class="bulle"><small>Simon t'explique le concept</small>Chaque goutte de pluie trie la lumière par couleur et te la renvoie.</div></div>
    {SCHEMA}
  </div>
</div></section>

<section class="bande"><div class="wrap">
  <h2>Une minute, et tu as compris</h2>
  <div class="grille">
    <div class="bloc"><div class="num">Le concept</div><h3>L'idée clé d'abord</h3><p>Une phrase claire qui dit ce que c'est vraiment, avant tout le reste.</p></div>
    <div class="bloc"><div class="num">Le dessin</div><h3>Ça se construit sous tes yeux</h3><p>Un schéma qui s'ajoute étape par étape : tu vois le mécanisme au lieu de l'imaginer.</p></div>
    <div class="bloc"><div class="num">La voix</div><h3>Simon te le raconte</h3><p>Appuie sur « Écouter Simon » : il lit la fiche et fait avancer les étapes. Pas besoin de lire.</p></div>
    <div class="bloc"><div class="num">Et si…?</div><h3>Joue avec la notion</h3><p>Un curseur montre ce qui change quand on modifie un facteur, puis une petite question vérifie que c'est clair.</p></div>
  </div>
</div></section>

<section class="bande teinte"><div class="wrap">
  <div class="grille">
    <div><h2>À ton niveau</h2><p>Choisis comment Simon t'explique : tout simplement, plus en détail, ou comme à un connaisseur.</p><div class="niveaux"><span>Simple</span><span>Poussé</span><span>Avancé</span></div></div>
    <div><h2>Pour aller plus loin</h2><p>Chaque fiche se termine par les questions qu'on se pose ensuite. Le champagne&nbsp;? Simon te propose aussi comment le conserver et comment bien le servir.</p></div>
    <div><h2>Une surprise chaque jour</h2><p>En ouvrant l'app, une nouvelle notion t'attend : le tonnerre, les marées, la pâte qui lève, le sirop d'érable…</p></div>
  </div>
</div></section>

<section class="bande"><div class="wrap narrow" style="text-align:center">
  <h2>Gratuit, sur ton téléphone</h2>
  <p>Ouvre l'app dans ton navigateur et ajoute-la à ton écran d'accueil. Tu entres avec ton compte HoldingAI, le même pour toutes nos apps. Rien à payer.</p>
  <p><a class="btn plein" href="{APP}">Essayer Le Pourquoi</a></p>
</div></section>'''

COMMENT = f'''<section class="bande"><div class="wrap narrow prose">
  <h1>Comment ça marche</h1>
  <p>Le Pourquoi transforme une question en une fiche courte et visuelle. Voici ce qui se passe quand tu demandes « le GPS » ou « une éolienne ».</p>
  <div class="grille" style="margin:28px 0">
    <div class="bloc"><div class="num">1</div><h3>Tu demandes</h3><p>Tape une chose qui t'intrigue, touche une suggestion ou appuie sur « Surprends-moi ». Choisis ton niveau : Simple, Poussé ou Avancé.</p></div>
    <div class="bloc"><div class="num">2</div><h3>Simon prépare la fiche</h3><p>En quelques secondes : le concept, une définition simple, une image du quotidien, les étapes du mécanisme et un dessin.</p></div>
    <div class="bloc"><div class="num">3</div><h3>Tu regardes ou tu écoutes</h3><p>Avance étape par étape, ou laisse Simon tout te lire pendant que le dessin se complète.</p></div>
    <div class="bloc"><div class="num">4</div><h3>Tu vas plus loin</h3><p>Le curseur « Et si…? », la question de vérification, puis les questions liées pour continuer.</p></div>
  </div>
  <h2>Installer l'app</h2>
  <p><strong>iPhone</strong> : ouvre <a href="{APP}">app.lepourquoi.ai</a> dans Safari, touche le bouton Partager, puis « Sur l'écran d'accueil ».</p>
  <p><strong>Android</strong> : ouvre l'adresse dans Chrome, puis le menu ⋮ et « Installer l'application ».</p>
  <p><strong>Ordinateur</strong> : dans Chrome ou Edge, clique sur l'icône d'installation dans la barre d'adresse.</p>
  <h2>D'où viennent les explications&nbsp;?</h2>
  <p>Les fiches sont rédigées par une intelligence artificielle (Claude, d'Anthropic), guidée pour être exacte, claire et adaptée au niveau choisi. Une notion déjà demandée par quelqu'un est servie telle quelle, ce qui garde l'app rapide et gratuite. Comme toute explication courte, une fiche simplifie : pour une décision importante (santé, argent, droit), vérifie auprès d'une source spécialisée.</p>
  <p><a class="btn plein" href="{APP}">Ouvrir l'app</a></p>
</div></section>'''

SIMON_PAGE = f'''<section class="bande"><div class="wrap">
  <div class="simon-grand">{SIMON}<div class="prose">
    <h1>Voici Simon</h1>
    <p>Simon est le personnage du Pourquoi. C'est un curieux sympathique qui adore savoir comment tout marche : pourquoi le pain lève, comment le frigo fait du froid, d'où vient le tonnerre.</p>
    <p>Son truc : aller droit à l'idée qui fait « ah, c'est donc ça&nbsp;! », puis le montrer avec un dessin plutôt qu'un long texte. Il tutoie, il parle simplement, et il peut tout te lire à voix haute.</p>
    <p>Simon fait partie de la famille des personnages HoldingAI, avec Rosalie du Commis, Gaston du Tiroir, Colette du Plumeau et les autres.</p>
    <p><a class="btn plein" href="{APP}">Poser une question à Simon</a></p>
  </div></div>
</div></section>'''

QR = [
 ("C'est vraiment gratuit ?", "Oui. Le Pourquoi est gratuit; tu entres avec ton compte HoldingAI, le même pour toutes les apps HoldingAI. Pour garder l'app gratuite, il y a une limite raisonnable de nouvelles fiches par jour et par appareil ; les notions déjà demandées par d'autres ne comptent pas."),
 ("Dois-je créer un compte ?", "Non. Ouvre l'app et pose ta question. Ton historique reste sur ton appareil."),
 ("Comment faire parler Simon ?", "Sur une fiche, appuie sur le bouton « Écouter Simon ». Il utilise la voix française installée sur ton téléphone ou ton ordinateur. Après la première fois, il lit automatiquement les nouvelles fiches. Si tu n'entends rien, vérifie que le son de l'appareil est activé."),
 ("Quelle différence entre Simple, Poussé et Avancé ?", "Simple : des mots de tous les jours, aucun jargon. Poussé : plus de détails et le vrai vocabulaire expliqué. Avancé : les termes techniques, des chiffres et les nuances, pour un connaisseur. Ton choix est retenu."),
 ("Les explications sont-elles fiables ?", "Elles sont rédigées par une intelligence artificielle guidée pour être exacte, mais une fiche d'une minute simplifie forcément et peut contenir une erreur. Pour la santé, l'argent ou le droit, vérifie auprès d'un professionnel ou d'une source officielle."),
 ("Est-ce que je peux poser n'importe quelle question ?", "Toute chose qu'on peut expliquer : un objet, un phénomène, une notion d'économie ou de science, un geste pratique (conserver, choisir, utiliser). Simon ne répond pas aux demandes qui visent à nuire."),
 ("Ça marche sans Internet ?", "L'app s'ouvre hors ligne et garde tes dernières fiches, mais une nouvelle question demande une connexion."),
 ("Comment vous joindre ?", f"Écris-nous à {COURRIEL}."),
]
QUESTIONS = '<section class="bande"><div class="wrap narrow"><h1>Questions</h1>' + ''.join(f'<details><summary>{q}</summary><p>{r}</p></details>' for q, r in QR) + f'<p style="margin-top:24px"><a class="btn plein" href="{APP}">Ouvrir l\'app</a></p></div></section>'

CONFID = f'''<section class="bande"><div class="wrap narrow prose">
  <h1>Confidentialité</h1>
  <p class="maj">Dernière mise à jour : {MAJ}</p>
  <p>Le Pourquoi est conçu pour fonctionner avec le moins de données possible.</p>
  <h2>Ton compte HoldingAI</h2>
  <p>Tu entres dans Le Pourquoi avec ton compte HoldingAI, le même pour toutes les apps HoldingAI. Nous recevons l'identifiant de ce compte et le numéro de cellulaire qui y est associé, pour te reconnaître. Tes fiches ne sont pas reliées à ton compte.</p>
  <h2>Ce que nous ne recueillons pas</h2>
  <ul><li>Aucun nom ni courriel dans les fiches.</li><li>Aucun témoin publicitaire ni pistage d'une app à l'autre.</li><li>Aucune adresse IP conservée.</li></ul>
  <h2>Ce qui passe par nos serveurs</h2>
  <ul>
    <li><strong>Ta question et le niveau choisi</strong>, pour préparer la fiche. Les fiches sont gardées sans aucun lien avec toi, afin de servir la même notion aux autres sans la régénérer. N'écris donc pas de renseignements personnels dans une question.</li>
    <li><strong>Une empreinte anonyme</strong> calculée à partir de ton adresse IP (l'adresse elle-même n'est pas gardée), avec l'heure de la demande, uniquement pour appliquer la limite quotidienne. Ces traces servent à compter les demandes des dernières 24 heures.</li>
  </ul>
  <h2>Ce qui reste sur ton appareil</h2>
  <p>Ton historique de fiches, ton niveau préféré et ta préférence pour la voix de Simon sont gardés dans ton navigateur. Tu peux les effacer en effaçant les données du site dans ton navigateur.</p>
  <h2>La voix de Simon</h2>
  <p>La lecture à voix haute utilise la synthèse vocale de ton appareil. Le texte lu ne nous est pas envoyé pour cette lecture.</p>
  <h2>Nos fournisseurs</h2>
  <ul><li><strong>Anthropic</strong> (Claude) rédige les fiches à partir de ta question.</li><li><strong>Supabase</strong> héberge la base de données et la fonction serveur, au Canada (région ca-central-1).</li><li><strong>Cloudflare</strong> sert le site et l'app.</li></ul>
  <p>Certains de ces fournisseurs peuvent traiter des données hors du Québec. Nous leur transmettons seulement ce qui est décrit plus haut.</p>
  <h2>Tes droits</h2>
  <p>Comme nous ne gardons aucun renseignement qui t'identifie, il n'y a pas de dossier à ton nom. Pour toute question sur la protection des renseignements personnels (Loi 25), écris à <a href="mailto:{COURRIEL}">{COURRIEL}</a>.</p>
</div></section>'''

COND = f'''<section class="bande"><div class="wrap narrow prose">
  <h1>Conditions d'utilisation</h1>
  <p class="maj">Dernière mise à jour : {MAJ}</p>
  <h2>Le service</h2>
  <p>Le Pourquoi, une app de HoldingAI, explique des notions à l'aide de fiches rédigées par une intelligence artificielle. L'app est offerte gratuitement, telle quelle, et peut changer ou s'interrompre.</p>
  <h2>Des explications, pas des conseils</h2>
  <p>Les fiches servent à comprendre. Elles simplifient et peuvent contenir des erreurs. Elles ne remplacent pas l'avis d'un professionnel de la santé, du droit, de la finance ou de la sécurité. N'utilise pas une fiche pour prendre une décision importante sans vérifier.</p>
  <h2>Utilisation raisonnable</h2>
  <p>Pour garder l'app gratuite, le nombre de nouvelles fiches par jour est limité. Il est interdit d'automatiser des demandes, de contourner les limites ou d'utiliser l'app pour obtenir des contenus visant à nuire.</p>
  <h2>Contenu</h2>
  <p>Tu peux partager les fiches pour un usage personnel ou éducatif. Le nom Le Pourquoi, le personnage de Simon et le design de l'app appartiennent à HoldingAI.</p>
  <h2>Responsabilité</h2>
  <p>Dans la mesure permise par la loi, HoldingAI n'est pas responsable des dommages découlant de l'utilisation des fiches. Ces conditions sont régies par les lois du Québec.</p>
  <h2>Nous joindre</h2>
  <p><a href="mailto:{COURRIEL}">{COURRIEL}</a></p>
</div></section>'''

INTROUVABLE = f'''<section class="bande"><div class="wrap narrow" style="text-align:center">
  <div style="width:120px;margin:0 auto 12px">{SIMON}</div>
  <h1>Même Simon ne trouve pas cette page</h1>
  <p>Elle a peut-être changé d'adresse. Mais tu peux toujours lui poser ta question.</p>
  <p><a class="btn plein" href="{APP}">Ouvrir l'app</a> <a class="btn clair" href="/">Retour à l'accueil</a></p>
</div></section>'''

FICHIERS = {
  'index.html': page('/', "Le Pourquoi : c'est quoi, et comment ça marche ?", "Simon t'explique n'importe quelle notion en une minute, avec un dessin qui se construit et sa voix. Gratuit.", ACCUEIL),
  'comment-ca-marche.html': page('/comment-ca-marche', "Comment ça marche · Le Pourquoi", "Une question, une fiche d'une minute : le concept, le dessin étape par étape et la voix de Simon. Installer l'app.", COMMENT),
  'simon.html': page('/simon', "Simon · Le Pourquoi", "Simon, le curieux sympathique qui t'explique comment tout marche.", SIMON_PAGE),
  'questions.html': page('/questions', "Questions · Le Pourquoi", "Gratuit, compte HoldingAI, voix de Simon, niveaux, fiabilité : les réponses aux questions fréquentes.", QUESTIONS),
  'confidentialite.html': page('/confidentialite', "Confidentialité · Le Pourquoi", "Compte HoldingAI, sans adresse IP conservée : ce que Le Pourquoi fait de tes données.", CONFID),
  'conditions.html': page('/conditions', "Conditions · Le Pourquoi", "Conditions d'utilisation de l'app gratuite Le Pourquoi.", COND),
  '404.html': page('/404', "Page introuvable · Le Pourquoi", "Cette page n'existe pas.", INTROUVABLE),
}
for nom, html in FICHIERS.items():
    with open(os.path.join(SORTIE, nom), 'w', encoding='utf-8') as f:
        f.write(html)
print('pages :', ', '.join(FICHIERS))
