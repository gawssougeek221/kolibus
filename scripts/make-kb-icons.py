from PIL import Image

src = Image.open('/home/z/my-project/public/brand/kolibus-banner.jpeg').convert('RGB')
W, H = src.size  # 850x270

# Recadrage du wordmark « KoliBus » (zone centrale haute)
crop = src.crop((255, 20, 595, 135))  # ~340x115

def make_icon(size, maskable=False):
    bg = Image.new('RGB', (size, size), (18, 61, 51))  # #123D33
    scale_w = int(size * (0.72 if maskable else 0.86))
    ratio = scale_w / crop.width
    icon = crop.resize((scale_w, int(crop.height * ratio)), Image.LANCZOS)
    bg.paste(icon, ((size - icon.width) // 2, (size - icon.height) // 2))
    bg.save(f'/home/z/my-project/public/brand/kb-icon-{size}{"-maskable" if maskable else ""}.png')
    print(f'kb-icon-{size}{"-maskable" if maskable else ""}.png OK')

make_icon(512)
make_icon(512, maskable=True)
make_icon(192)
