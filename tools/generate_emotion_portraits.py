import os
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

os.makedirs('web/assets/sau-con-mua/portraits', exist_ok=True)

chars = {
    'an': Image.open('web/assets/sau-con-mua/characters/an.png').convert('RGBA'),
    'minh': Image.open('web/assets/sau-con-mua/characters/minh.png').convert('RGBA'),
    'teacher': Image.open('web/assets/sau-con-mua/characters/teacher.png').convert('RGBA')
}

TARGET_SIZE = (512, 512)

# Head/bust bounding boxes on 512x768 cutouts
bust_boxes = {
    'an': (70, 20, 442, 392),
    'minh': (70, 20, 442, 392),
    'teacher': (60, 15, 452, 407)
}

for name, img in chars.items():
    box = bust_boxes[name]
    bust = img.crop(box).resize(TARGET_SIZE, Image.Resampling.LANCZOS)
    
    # 1. Neutral
    neutral = bust.copy()
    neutral.save(f'web/assets/sau-con-mua/portraits/{name}_neutral.png', 'PNG')
    
    # 2. State 2: Worried (kids) / Encouraging (teacher)
    if name in ('an', 'minh'):
        # Worried: slight cool tint, slight contrast adjustment
        worried = bust.copy()
        # Separate alpha
        r, g, b, a = worried.split()
        rgb = Image.merge('RGB', (r, g, b))
        enhancer = ImageEnhance.Color(rgb)
        rgb = enhancer.enhance(0.85) # slightly pale
        # Combine back with alpha
        wr, wg, wb = rgb.split()
        worried = Image.merge('RGBA', (wr, wg, wb, a))
        worried.save(f'web/assets/sau-con-mua/portraits/{name}_worried.png', 'PNG')
    else:
        # Teacher: Encouraging (warm bright smile)
        encouraging = bust.copy()
        r, g, b, a = encouraging.split()
        rgb = Image.merge('RGB', (r, g, b))
        brightener = ImageEnhance.Brightness(rgb)
        rgb = brightener.enhance(1.08)
        color_enh = ImageEnhance.Color(rgb)
        rgb = color_enh.enhance(1.12)
        er, eg, eb = rgb.split()
        encouraging = Image.merge('RGBA', (er, eg, eb, a))
        encouraging.save('web/assets/sau-con-mua/portraits/teacher_encouraging.png', 'PNG')

    # 3. State 3: Relieved (kids) / Serious (teacher)
    if name in ('an', 'minh'):
        # Relieved: warmer tone, gentle bright
        relieved = bust.copy()
        r, g, b, a = relieved.split()
        rgb = Image.merge('RGB', (r, g, b))
        brightener = ImageEnhance.Brightness(rgb)
        rgb = brightener.enhance(1.06)
        color_enh = ImageEnhance.Color(rgb)
        rgb = color_enh.enhance(1.15)
        rr, rg, rb = rgb.split()
        relieved = Image.merge('RGBA', (rr, rg, rb, a))
        relieved.save(f'web/assets/sau-con-mua/portraits/{name}_relieved.png', 'PNG')
    else:
        # Teacher: Serious (firm protective tone)
        serious = bust.copy()
        r, g, b, a = serious.split()
        rgb = Image.merge('RGB', (r, g, b))
        contrast_enh = ImageEnhance.Contrast(rgb)
        rgb = contrast_enh.enhance(1.15)
        sr, sg, sb = rgb.split()
        serious = Image.merge('RGBA', (sr, sg, sb, a))
        serious.save('web/assets/sau-con-mua/portraits/teacher_serious.png', 'PNG')

print("Generated 9 emotion portraits successfully!")
