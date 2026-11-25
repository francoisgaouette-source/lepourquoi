// Réglages de l'app. Tant que supabaseUrl est vide, l'app roule en mode démonstration :
// elle montre quelques fiches toutes prêtes, sans appel à Claude.
// L'app est gratuite; elle se connecte avec le compte HoldingAI (le même pour toutes les apps HoldingAI).
window.TT_CONFIG = {
  nom: "Le Pourquoi",
  slogan: "C'est quoi, et comment ça marche ?",
  supabaseUrl: "https://lpqjhxnnvasjhliywgpt.supabase.co",  // projet Supabase « Le Pourquoi »
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcWpoeG5udmFzamhsaXl3Z3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NTM4MTIsImV4cCI6MjExMTEyOTgxMn0.ldAERDiPmqqUPGDZaTKDkw7WOEpFSSR_7dQ0YBkMra0" // clé publique : la sécurité vient des règles de la base
};

// Compte HoldingAI (compte.holdingai.app) : client OAuth « Le Pourquoi » dans le projet HoldingAI Compte
window.APP_CONFIG = { HOLDINGAI: { clientId: "a72e202f-c8fb-4364-86ac-eadcb71c666b", app: "le-pourquoi", retour: "https://app.lepourquoi.ai/" } };
