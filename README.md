# SysCom (SIS) : entraînement aux QCM

Site statique (HTML, CSS, JS, aucune dépendance) pour refaire les QCM de Signaux et systèmes autant de fois que l'on veut.

- Choix des QCM sur l'accueil (on peut en combiner plusieurs), questions et réponses mélangées à chaque lancement.
- Correction seulement après « Terminer le QCM » : 1 point si exactement les bonnes réponses sont cochées.
- Bouton **Aide** : un indice et une animation interactive (convolution glissante, rectangles, superposition).
- Bouton **Cours** : la ou les pages du poly liées à la question.
- Questions issues des QCM + questions marquées « Créée par IA avec le cours » (désactivables, valeurs tirées au hasard).
- Mode clair / sombre. Aucun cookie, rien n'est enregistré.

## Ajouter un QCM

1. Copier `qcm/_modele.js` en `qcm/mon-qcm.js` et le remplir (le modèle explique chaque champ).
2. Ajouter `<script src="qcm/mon-qcm.js"></script>` dans `index.html`, avant `js/app.js`.

Le QCM apparaît alors automatiquement sur l'accueil.

## Ajouter les pages du poly

Le site cherche les images dans `cours/p-<numéro>.jpg`. Pour les générer depuis le PDF du cours :

```bash
sudo dnf install poppler-utils        # une seule fois (Fedora)
./outils/extraire_pages.sh "chemin/vers/Poly Cours Sys.pdf"
git add cours && git commit -m "Pages du poly" && git push
```

Le script lit les numéros de pages dans `qcm/*.js` et ne génère que les pages manquantes. Tant qu'une image manque, le site affiche le numéro de page à ouvrir.

## Publier

Settings → Pages → Source : *Deploy from a branch* → `main` / `/ (root)`.

## Organisation

```
index.html          page unique
css/style.css       styles (thèmes clair et sombre)
js/core.js          outils, registre des QCM, graphiques
js/anim.js          animations de l'aide
js/app.js           accueil, QCM, correction
qcm/*.js            un fichier par QCM (_modele.js = modèle, non chargé)
cours/              images des pages du poly
outils/             script d'extraction des pages
```

## Licence

Le code du site est sous licence [MIT](LICENSE).
Les questions issues des QCM et les pages du poly (`cours/`) appartiennent à leurs auteurs (cours « Signaux et systèmes », Chantal Muller, INSA Lyon) et ne sont pas couvertes par cette licence.
