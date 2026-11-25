// Le Pourquoi : compte HoldingAI obligatoire (norme commune à toutes les apps HoldingAI).
// Démarrage commun (holdingai.js) : retour de chez Albert, puis le compte suit. Sans session : barrière d'Albert (porte.js).
(async () => {
  "use strict";
  const dep = await HoldingAI.demarrer({ obligatoire: true });
  if (dep.redirection) return;
  window.HOLDINGAI_PORTE = {
    app: "le-pourquoi", nomApp: "Le Pourquoi", personnage: "Simon",
    connecte: !!dep.session, prenom: dep.session ? dep.session.nom : "",
    surDeconnexion: () => { HoldingAI.deconnexion(); location.reload(); },
  };
  if (!dep.session) {
    window.HOLDINGAI_PORTE.barriere = true;
    if (window.HoldingAIPorte) HoldingAIPorte.barriere();
  }
})();
