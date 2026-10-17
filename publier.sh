#!/bin/zsh
# Met à jour le site GitHub Pages avec le dernier export web du jeu (dossier ../web).
set -e
cd "$(dirname "$0")"
cp ../web/index.js ../web/index.wasm ../web/index.pck ../web/index.audio.worklet.js ../web/index.audio.position.worklet.js .
P=$(stat -f %z index.pck); W=$(stat -f %z index.wasm)
V=$(date +%Y-%m-%d-%H%M)
sed -i '' -E "s/fileSizes: \{ \"index.pck\": [0-9]+, \"index.wasm\": [0-9]+ \}/fileSizes: { \"index.pck\": $P, \"index.wasm\": $W }/" index.html
sed -i '' -E "s/window.VERSION_JEU = \"[^\"]*\"/window.VERSION_JEU = \"$V\"/" index.html
git add -A
git commit -q -m "${1:-Mise à jour du jeu} ($V)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git push -q
echo "Publié : version $V"
