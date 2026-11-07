#!/usr/bin/env python3
"""Prépare les assets du logo Yoobanté à partir du fichier uploadé.
- Détourage : fond blanc -> transparent (seuil progressif, couleurs du dessin INTACTES)
- Auto-crop des marges
- Sorties : mark (Y + colis + lignes de vitesse) et full (mark + wordmark Yoobanté)
"""
from PIL import Image
import numpy as np
import os

SRC = "/home/z/my-project/upload/WhatsApp Image 2026-10-11 at 19.45.30.jpeg"
OUT_DIR = "/home/z/my-project/public/brand"
os.makedirs(OUT_DIR, exist_ok=True)

img = Image.open(SRC).convert("RGB")
arr = np.asarray(img).astype(np.int16)

# Distance au blanc : max(255-r, 255-g, 255-b)
dist = (255 - arr).max(axis=2).astype(np.int32)

# Alpha progressif : <30 -> 0 ; >120 -> 255 ; linéaire entre les deux (anti-aliasing)
# int32 obligatoire : (dist-30)*255 déborde int16
alpha = np.clip((dist - 30) * 255 // (120 - 30), 0, 255).astype(np.uint8)

# Démélange du blanc pour les pixels de bordure (alpha partiel) :
# récupère la couleur d'encre pure → bords propres même sur fond sombre
af = alpha.astype(np.float32)[..., None] / 255.0
rgb_f = arr.astype(np.float32)
unblend = (rgb_f - (1.0 - af) * 255.0) / np.maximum(af, 1e-6)
unblend = np.clip(unblend, 0, 255)
out_rgb = np.where(af < 0.999, unblend, rgb_f)
out_rgb = np.round(out_rgb).astype(np.uint8)

rgba = np.dstack([out_rgb, alpha])

# Bbox global (pixels visibles)
ys, xs = np.where(alpha > 10)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
print(f"Image source {img.size}, bbox contenu: x[{x0},{x1}] y[{y0},{y1}]")

# Trouver la séparation mark / wordmark : lignes entièrement vides
row_has_ink = (alpha > 10).any(axis=1)
gaps = []
run_start = None
for y in range(y0, y1 + 1):
    if not row_has_ink[y]:
        if run_start is None:
            run_start = y
    else:
        if run_start is not None:
            gaps.append((run_start, y - 1))
            run_start = None
if run_start is not None:
    gaps.append((run_start, y1))
gaps = [(a, b) for a, b in gaps if b - a >= 15]
print("Gaps verticaux détectés:", gaps)

full = Image.fromarray(rgba[y0:y1 + 1, x0:x1 + 1])
full.save(f"{OUT_DIR}/yoobante-full.png")

if gaps:
    split = gaps[0][0]  # fin du mark = début du premier grand gap
    mark_block = rgba[y0:split, x0:x1 + 1]
    mys, mxs = np.where(mark_block[:, :, 3] > 10)
    my0, my1, mx0, mx1 = mys.min(), mys.max(), mxs.min(), mxs.max()
    mark = Image.fromarray(mark_block[my0:my1 + 1, mx0:mx1 + 1])
    mark.save(f"{OUT_DIR}/yoobante-mark.png")
    print(f"mark: {mark.size}, full: {full.size}")
else:
    print("Pas de gap — mark non séparé, seul full est généré")

# Vérif : couleur moyenne des pixels opaques (ne doit pas changer vs source)
op = alpha > 200
src_px = arr[op]
print("Moyenne RGB pixels opaques:", src_px.mean(axis=0).round(1))
print("OK ->", OUT_DIR)
