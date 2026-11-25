// Prépare une fiche du Pourquoi avec Claude.
// - { mode: "jour" } : la surprise du jour, la même pour tout le monde, sans compte.
// - { question, niveau } : une fiche à la demande. L'app est gratuite et sans compte.
// Variables : ANTHROPIC_API_KEY, MODELE (facultatif), LIMITE_JOUR (25 nouvelles fiches par appareil et par 24 h),
// LIMITE_GLOBALE (1500 nouvelles fiches par 24 h pour toute l'app), SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (fournies par Supabase).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const MODELE = Deno.env.get("MODELE") || "claude-sonnet-5-5";
const LIMITE_JOUR = Number(Deno.env.get("LIMITE_JOUR") || 25);
const LIMITE_GLOBALE = Number(Deno.env.get("LIMITE_GLOBALE") || 1500);
const FUSEAU = "America/Toronto";

const POOL = ["un arc-en-ciel","le tonnerre","un four à micro-ondes","le Wi-Fi","un frigo","le GPS","un avion qui vole","les marées","un vaccin","l'inflation","une éolienne","un panneau solaire","la photosynthèse","un écran tactile","le café décaféiné","une batterie","la bourse","le décalage horaire","un aimant","la levure dans le pain","un code QR","l'effet de serre","les saisons","un thermos","le Bluetooth","une montgolfière","le hoquet","les bulles du champagne","un sous-marin","la chaîne de blocs","un taux d'intérêt","les nuages","un écho","le sel sur la route en hiver","l'immunité collective","l'odeur de la pluie","les aurores boréales","un ascenseur","la mémoire","un barrage hydroélectrique","une puce électronique","le réveil des ours","la pâte qui lève","un moteur électrique","la carte de crédit","les vagues","la marée noire","le sirop d'érable","la neige","un laser"];

const NIVEAUX: Record<string, string> = {
  simple: "simple, pour tout le monde : mots de tous les jours, aucun jargon, phrases courtes",
  pousse: "poussé : plus de détails sur le mécanisme, le vrai vocabulaire expliqué au passage, un ou deux chiffres clés",
  avance: "avancé, pour un connaisseur : termes techniques justes, chiffres et ordres de grandeur, nuances et exceptions, toujours clair",
};
const niv = (v: unknown) => (({ normal: "simple", pro: "avance" } as any)[String(v)] || (String(v) in NIVEAUX ? String(v) : "simple"));

const COULEURS = ["sun","sky","blue","red","orange","violet","green","brown","gray","pink","coral","ink"];
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const consigne = (niveau: string) => `Tu es Simon, le personnage de l'app Le Pourquoi : un curieux sympathique qui adore savoir comment tout marche. Tu fais comprendre une notion en une minute, par l'image, à un adulte curieux, au niveau demandé.
Niveau : ${NIVEAUX[niveau]}.
Réponds dans la langue de la notion (français du Québec par défaut, tutoiement). Sois exact ; si la notion est floue, prends le sens le plus courant. Si la demande n'est pas une notion à expliquer ou vise à nuire, explique plutôt une notion voisine inoffensive.
Rends UNIQUEMENT un objet JSON valide, sans texte autour :
{"titre":"nom court","concept":"L'IDÉE CLÉ en une phrase frappante de 15 mots max","phrase":"définition simple, 2 phrases max","analogie":"une image du quotidien, une phrase",
"scene":[ ...éléments du dessin... ],
"etapes":[{"titre":"3 à 5 mots","texte":"2 phrases max"}],
"curseur":{"question":"Et si on change … ?","variable":"facteur qui varie","etats":[{"label":"valeur courte","effet":"ce qui se passe, 1 à 2 phrases"}]},
"verif":{"question":"question de compréhension","choix":["…","…","…"],"bonne":0,"pourquoi":"1 à 2 phrases"},
"suites":["question liée, courte", "…"]}
"suites" : 2 à 4 questions que la personne voudra sûrement poser ensuite, formulées comme elle les taperait. Si la notion a un côté pratique, mets-le en premier (comment le choisir, le conserver, l'utiliser, le servir, éviter les erreurs, combien ça coûte…) ; sinon, des questions pour creuser ou des notions voisines. Exemple pour le champagne : « Comment conserver le champagne ? », « Comment bien servir le champagne ? », « Champagne ou mousseux : quelle différence ? ».
Si la question elle-même est pratique (comment faire, conserver, choisir…), les étapes sont les gestes à suivre, dans l'ordre, et le dessin les montre.
LE DESSIN (scene) est essentiel : un schéma simple et reconnaissable du mécanisme, sur une toile de 400 de large par 260 de haut (origine en haut à gauche).
Chaque élément a "t" (type), "c" (couleur, entre guillemets, parmi ${COULEURS.map((c) => `"${c}"`).join(", ")}) et "step" (index de l'étape où il apparaît ; 0 = visible dès le début).
Types : {"t":"circle","x","y","r"} ; {"t":"rect","x","y","w","h"} (x,y = coin haut gauche) ; {"t":"ellipse","x","y","rx","ry"} ; {"t":"poly","pts":[[x,y],…]} pour une forme fermée ; {"t":"line","x1","y1","x2","y2"} ; {"t":"arrow","x1","y1","x2","y2"} pour un flux ou un mouvement ; {"t":"text","x","y","s":"étiquette de 1 à 3 mots"} (x = centre du texte, environ 7 unités de large par lettre).
Règles du dessin : 12 à 28 éléments ; objets du réel dessinés par formes simples (une maison, un soleil, une batterie, une goutte…) ; des flèches pour ce qui circule ; chaque étape ajoute 2 à 6 éléments qui montrent ce qu'elle dit ; étiquette les pièces principales ; tout reste entre x 10 et 390, y 14 et 250 ; aucune étiquette ne chevauche une autre, ne déborde de la toile ni ne se pose sur une flèche ; laisse de l'air.
Autres contraintes : 3 à 5 étapes dans l'ordre du mécanisme, et les "step" vont de 0 au nombre d'étapes moins 1 ; 3 à 5 états du curseur du plus faible au plus fort ; exactement 3 choix, varie la position de la bonne réponse.`;

const txt = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const nb = (v: unknown, lo: number, hi: number, d: number) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n * 10) / 10)) : d; };

// Garde seulement les champs attendus, de la bonne forme et de la bonne taille.
function propre(d: any) {
  if (!d || typeof d !== "object") return null;
  const etapes = (Array.isArray(d.etapes) ? d.etapes : []).slice(0, 6).map((e: any) => ({ titre: txt(e?.titre, 60), texte: txt(e?.texte, 320) })).filter((e: any) => e.texte);
  const n = etapes.length;
  const scene = (Array.isArray(d.scene) ? d.scene : []).slice(0, 40).map((e: any) => {
    const t = ["circle","rect","ellipse","poly","line","arrow","text"].includes(e?.t) ? e.t : null;
    if (!t) return null;
    const o: any = { t, c: COULEURS.includes(e.c) ? e.c : "ink", step: Math.min(Math.max(0, n - 1), nb(e.step, 0, 9, 0)) };
    for (const k of ["x","y","x1","y1","x2","y2"]) if (k in e) o[k] = nb(e[k], 0, k.startsWith("x") ? 400 : 260, 0);
    for (const k of ["r","w","h","rx","ry"]) if (k in e) o[k] = nb(e[k], 1, 400, 10);
    if (t === "poly") o.pts = (Array.isArray(e.pts) ? e.pts : []).slice(0, 40).filter(Array.isArray).map((p: any) => [nb(p[0], 0, 400, 0), nb(p[1], 0, 260, 0)]);
    if (t === "text") { o.s = txt(e.s, 40); if (e.size) o.size = nb(e.size, 10, 20, 13); if (!o.s) return null; }
    return o;
  }).filter(Boolean);
  const etats = (Array.isArray(d.curseur?.etats) ? d.curseur.etats : []).slice(0, 6).map((e: any) => ({ label: txt(e?.label, 40), effet: txt(e?.effet, 280) })).filter((e: any) => e.label);
  const choix = (Array.isArray(d.verif?.choix) ? d.verif.choix : []).slice(0, 4).map((c: any) => txt(c, 200)).filter(Boolean);
  const f = {
    titre: txt(d.titre, 80), concept: txt(d.concept, 200), phrase: txt(d.phrase, 400), analogie: txt(d.analogie, 260),
    scene, etapes,
    curseur: { question: txt(d.curseur?.question, 120), variable: txt(d.curseur?.variable, 60), etats },
    verif: { question: txt(d.verif?.question, 220), choix, bonne: nb(d.verif?.bonne, 0, Math.max(0, choix.length - 1), 0), pourquoi: txt(d.verif?.pourquoi, 300) },
    suites: (Array.isArray(d.suites) ? d.suites : []).slice(0, 4).map((x: any) => txt(x, 90)).filter((x: string) => x.length > 3),
  };
  if (!f.titre || !f.concept || scene.length < 3 || n < 2 || etats.length < 2 || choix.length < 2) {
    console.error("Fiche rejetée", JSON.stringify({ titre: !!f.titre, concept: !!f.concept, scene: scene.length, etapes: n, etats: etats.length, choix: choix.length, cles: Object.keys(d) }));
    return null;
  }
  return f;
}

// Petites erreurs de format fréquentes : couleur ou type sans guillemets ("c":brown), virgule en trop.
const reparer = (j: string) => j
  .replace(/"(c|t)"\s*:\s*([a-z]+)(?=\s*[,}])/g, '"$1":"$2"')
  .replace(/,\s*([}\]])/g, "$1");

// Format pour couper la réflexion du modèle : il a changé d'un jour à l'autre, on retient celui qui marche.
let modeSansReflexion = 0;
const SANS_REFLEXION = [{ type: "between_tools" }, { type: "disabled" }, null];

async function generer(question: string, niveau: string) {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY manquante");
  for (let essai = 0; essai < 4; essai++) {
    const thinking = SANS_REFLEXION[modeSansReflexion];
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODELE, max_tokens: 8000, ...(thinking ? { thinking } : {}), system: consigne(niveau),
        messages: [{ role: "user", content: `Notion : « ${question} »` }],
      }),
    });
    if (!r.ok) {
      const err = await r.text();
      console.error("Anthropic", r.status, err.slice(0, 300));
      if (r.status === 400 && /thinking/i.test(err) && modeSansReflexion < SANS_REFLEXION.length - 1) { modeSansReflexion++; continue; }
      if (essai >= 1) break; else continue;
    }
    const data = await r.json();
    const t = (data.content || []).filter((c: any) => c.type === "text").map((c: any) => c.text || "").join("");
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    if (a < 0 || b < a) { console.error("Pas de JSON", data.stop_reason, t.slice(0, 300)); continue; }
    try { const f = propre(JSON.parse(reparer(t.slice(a, b + 1)))); if (f) return f; }
    catch (e) { console.error("JSON illisible", data.stop_reason, String(e), t.slice(0, 200), t.slice(-200)); }
  }
  throw new Error("fiche invalide");
}

const jourLocal = () => new Intl.DateTimeFormat("en-CA", { timeZone: FUSEAU, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const cle = (q: string, niveau: string) => niveau + ":" + q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ erreur: "Méthode non permise." }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  let body: any = {};
  try { body = await req.json(); } catch (_) { return json({ erreur: "Requête illisible." }, 400); }

  try {
    // Surprise du jour : générée une seule fois par jour, puis servie à tout le monde.
    if (body.mode === "jour") {
      const jour = jourLocal();
      const { data: deja } = await admin.from("surprises").select("question,contenu").eq("jour", jour).maybeSingle();
      if (deja) return json({ fiche: { ...deja.contenu, q: deja.question, kind: "daily", level: "simple" } });
      const n = [...jour].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7);
      const question = POOL[Math.abs(n) % POOL.length];
      const contenu = await generer(question, "simple");
      await admin.from("surprises").insert({ jour, question, contenu });
      const { data: final } = await admin.from("surprises").select("question,contenu").eq("jour", jour).single();
      return json({ fiche: { ...final!.contenu, q: final!.question, kind: "daily", level: "simple" } });
    }

    // Fiche à la demande : gratuite et sans compte, avec une limite par appareil et une limite globale.
    const question = txt(body.question, 160);
    const niveau = niv(body.niveau);
    if (question.length < 2) return json({ code: "question", erreur: "Tape une notion." }, 400);

    const k = cle(question, niveau);
    const cache = (await admin.from("cache_fiches").select("contenu").eq("cle", k).maybeSingle()).data?.contenu;
    if (cache) return json({ fiche: { ...cache, q: question, level: niveau } });

    // Les limites ne comptent que les nouvelles fiches (celles qui coûtent un appel à Claude).
    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "inconnu";
    const empreinte = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + (Deno.env.get("SEL") || "le-pourquoi")))))
      .map((x) => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
    const depuis = new Date(Date.now() - 864e5).toISOString();
    const { count: parAppareil } = await admin.from("demandes").select("id", { count: "exact", head: true }).eq("empreinte", empreinte).gte("cree_le", depuis);
    if ((parAppareil || 0) >= LIMITE_JOUR) return json({ code: "limite", erreur: "Limite quotidienne atteinte." }, 429);
    const { count: total } = await admin.from("demandes").select("id", { count: "exact", head: true }).gte("cree_le", depuis);
    if ((total || 0) >= LIMITE_GLOBALE) return json({ code: "pause", erreur: "Trop de demandes aujourd'hui." }, 503);

    await admin.from("demandes").insert({ empreinte });
    const contenu = await generer(question, niveau);
    await admin.from("cache_fiches").upsert({ cle: k, contenu });
    return json({ fiche: { ...contenu, q: question, level: niveau } });
  } catch (e) {
    console.error(e);
    return json({ code: "erreur", erreur: "La fiche n'a pas pu être préparée. Réessaie dans un moment." }, 502);
  }
});
