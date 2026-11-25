# Le Pourquoi

« C'est quoi, et comment ça marche ? » Simon explique une notion en une minute : le concept en une phrase, un dessin qui se construit étape par étape, un curseur « Et si… ? » et une question pour vérifier. Une surprise du jour apparaît toute seule à l'ouverture.

App **gratuite et sans compte** de HoldingAI. Adresse : https://app.lepourquoi.ai

## Ce qu'il y a dedans

| Dossier | Rôle |
|---|---|
| `web/` | L'app installable : `index.html`, `app.js`, `app.css`, `config.js`, `demo.js` (3 fiches d'exemple), `sw.js` (cache et mises à jour), `manifest.webmanifest`, `icons/` |
| `worker/`, `wrangler.jsonc` | Le Worker Cloudflare qui sert `web/` à app.lepourquoi.ai |
| `supabase/migrations/` | Tables : `cache_fiches` (une question n'est générée qu'une fois), `surprises` (une par jour), `demandes` (compteur anonyme pour les limites) |
| `supabase/functions/fiche` | Appelle Claude pour préparer une fiche, avec les limites de coût |
| `tests/` | Test Playwright de l'app (`python3 tests/demo.test.py`) |

## En place

- Projet Supabase **Le Pourquoi** (`lpqjhxnnvasjhliywgpt`, Canada), secret `ANTHROPIC_API_KEY`, fonction `fiche` déployée.
- App inscrite dans HoldingAI Compte (`le-pourquoi`, personnage Simon, https://app.lepourquoi.ai).

## Mise en ligne (automatique)

Cloudflare Pages, projet **le-pourquoi**, est relié à ce dépôt : chaque `git push` sur `main` publie l'app (dossier `web/`, aucune commande de build) sur https://app.lepourquoi.ai et https://le-pourquoi.pages.dev.
Pour que les gens voient la mise à jour, changer `VERSION` dans `web/sw.js` : l'app affiche alors « Nouvelle version du Pourquoi · Mettre à jour ».

La fonction serveur se déploie à part : `supabase functions deploy fiche --no-verify-jwt` (projet `lpqjhxnnvasjhliywgpt`).
`wrangler.jsonc` et `worker/` restent seulement en solution de rechange (Worker Cloudflare) ; ils ne servent pas pour la mise en ligne actuelle.

## Coûts

Une nouvelle fiche, c'est un appel à Claude. Les limites (réglables dans les secrets Supabase) : `LIMITE_JOUR` = 25 nouvelles fiches par appareil par 24 h, `LIMITE_GLOBALE` = 1 500 pour toute l'app. Une question déjà posée par quelqu'un est servie depuis le cache, sans frais. Le modèle se règle avec `MODELE` (par défaut `claude-sonnet-5-5`).
