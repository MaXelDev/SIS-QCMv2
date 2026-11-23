"use strict";
/* MODÈLE pour ajouter un QCM.
   1. Copie ce fichier dans qcm/ (ex. qcm/fourier.js) et remplis-le.
   2. Ajoute <script src="qcm/fourier.js"></script> dans index.html, avant js/app.js.
   Ce fichier-modèle n'est chargé nulle part : il ne s'affiche pas sur le site. */

QCM.ajouter({
  id: "mon-qcm",                       // identifiant unique, sans espace
  titre: "Titre affiché sur l'accueil",
  description: "Une phrase pour dire ce que couvre ce QCM.",
  questions: [

    /* Plusieurs réponses possibles : M(énoncé, [bonnes], [mauvaises], options) */
    {
      id: "exemple-multi",
      ...M("Énoncé de la question (HTML autorisé : <br>, <sub>, <sup>…)",
        ["Bonne réponse 1", "Bonne réponse 2"],
        ["Mauvaise réponse 1", "Mauvaise réponse 2"]),
      indice: "Indice affiché par le bouton Aide (facultatif).",
      anim: { type: "discret", x: [1, 2, 1], h: [1, -1] },   // facultatif : discret, rect ou superposition (voir js/anim.js)
      cours: [184, 185],                                      // pages du poly (facultatif)
      explication: "Texte affiché dans la correction (facultatif)."
    },

    /* Une seule réponse : U(énoncé, bonne, [mauvaises], options) */
    {
      id: "exemple-unique",
      ...U("Énoncé", "La bonne réponse", ["Fausse 1", "Fausse 2", "Fausse 3"]),
      cours: [120]
    },

    /* Question créée par IA, avec des valeurs tirées au hasard : une fonction qui renvoie la question */
    () => {
      const a = rnd(1, 5), b = rnd(1, 5);
      return { id: "exemple-ia", ai: true, ...U(`Combien vaut ${a} + ${b} ?`, String(a + b), [String(a + b + 1), String(a * b)]) };
    }

    /* Autres champs possibles :
       figure: () => figs(stemSVG([1,2,1], {titre:"x[n]"}), rectSVG([{a:0,b:1,A:1}], {titre:"y(t)"}))
       garderOrdre: true   → ne pas mélanger les réponses
       grille: true        → réponses sur deux colonnes (pratique pour des graphiques) */
  ]
});
