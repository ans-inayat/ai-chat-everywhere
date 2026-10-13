#!/usr/bin/env bash
# Build the Chrome Web Store upload package.
set -euo pipefail

cd "$(dirname "$0")"
VERSION=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
OUT="dist/ai-chat-everywhere-v${VERSION}.zip"

rm -rf _metadata dist
mkdir -p dist

zip -r "$OUT" \
  manifest.json \
  background.js \
  popup.html popup.js \
  category.html prompts.html \
  style.css \
  sidepanel.html sidepanel.css sidepanel.js \
  rules.json \
  icon.png icon-32.png \
  pages \
  -x "*.DS_Store" "*_metadata*" "*.git*"

echo "Built $OUT"
unzip -l "$OUT"
