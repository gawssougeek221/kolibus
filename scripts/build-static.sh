#!/bin/bash
# ============================================================
# YOOBANTÉ — Build statique isolé de la vitrine
# Produit : /home/z/my-project/download/yoobante-vitrine-statique.zip
# (n'imprime aucun sous-repertoire source ni rien de serveur)
# ============================================================
set -e
BASE=/home/z/my-project
TMP=$BASE/export-tmp

rm -rf "$TMP"
mkdir -p "$TMP"

# 1. Copier le strict nécessaire (sans la route API serveur)
cp -r "$BASE/src" "$TMP/src"
rm -rf "$TMP/src/app/api"
cp -r "$BASE/public" "$TMP/public"
cp "$BASE/package.json" "$BASE/tsconfig.json" "$BASE/postcss.config.mjs" "$TMP/"
[ -f "$BASE/tailwind.config.ts" ] && cp "$BASE/tailwind.config.ts" "$TMP/"

# 2. node_modules en lien symbolique (aucune réinstallation)
ln -s "$BASE/node_modules" "$TMP/node_modules"

# 3. Config de build : export 100 % statique
cat > "$TMP/next.config.ts" << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};

export default nextConfig;
EOF

# 4. Build statique
cd "$TMP"
npx next build

# 5. Vérifier la sortie
test -f out/index.html
echo "=== OUT OK ==="
ls out | head -10
du -sh out

# 6. Zip final dans download/
mkdir -p "$BASE/download"
cd "$TMP/out"
rm -f "$BASE/download/yoobante-vitrine-statique.zip"
zip -qr "$BASE/download/yoobante-vitrine-statique.zip" .
echo "=== ZIP OK ==="
du -sh "$BASE/download/yoobante-vitrine-statique.zip"
