#!/usr/bin/env python3
from PIL import Image
import numpy as np

m = np.asarray(Image.open('/home/z/my-project/public/brand/yoobante-mark.png'))
a = m[:, :, 3]
print('Alpha histogramme:')
for lo in [0, 50, 100, 150, 200, 250]:
    print(f'  alpha {lo}-{lo + 49}:', int(((a >= lo) & (a < lo + 50)).sum()))
print('alpha max:', a.max(), 'alpha moyen:', round(float(a.mean()), 1))
print('pixel bras gauche (100,150):', m[100, 150])
print('pixel colis (60,330):', m[60, 330])
