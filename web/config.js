// Réglages de l'app. Tant que supabaseUrl est vide, l'app roule en mode démonstration :
// elle montre quelques fiches toutes prêtes, sans appel à Claude.
// L'app est gratuite et sans compte : l'historique reste sur l'appareil.
window.TT_CONFIG = {
  nom: "Le Pourquoi",
  slogan: "C'est quoi, et comment ça marche ?",
  supabaseUrl: "https://lpqjhxnnvasjhliywgpt.supabase.co",  // projet Supabase « Le Pourquoi »
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcWpoeG5udmFzamhsaXl3Z3B0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NTM4MTIsImV4cCI6MjExMTEyOTgxMn0.ldAERDiPmqqUPGDZaTKDkw7WOEpFSSR_7dQ0YBkMra0" // clé publique : la sécurité vient des règles de la base
};
