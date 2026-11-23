#!/usr/bin/env bash
# Génère les images des pages du poly utilisées par le site (dossier cours/).
# Usage : ./outils/extraire_pages.sh "chemin/vers/Poly Cours Sys.pdf"
# Besoin de pdftoppm (Fedora : sudo dnf install poppler-utils).
set -euo pipefail
PDF="${1:?Donne le chemin du PDF du poly de cours}"
cd "$(dirname "$0")/.."
PAGES=$(grep -ho 'cours: *\[[0-9, ]*\]' qcm/*.js | grep -o '[0-9]\+' | sort -nu)
mkdir -p cours
for p in $PAGES; do
  if [ ! -f "cours/p-$p.jpg" ]; then
    pdftoppm -f "$p" -l "$p" -r 110 -jpeg -jpegopt quality=82 -singlefile "$PDF" "cours/p-$p"
    echo "page $p"
  fi
done
echo "Terminé : $(ls cours/*.jpg | wc -l) pages dans cours/. Pense à git add cours && git commit && git push."
