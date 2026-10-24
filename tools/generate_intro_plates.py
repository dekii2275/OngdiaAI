import os
from PIL import Image, ImageDraw

os.makedirs('web/assets/sau-con-mua/intro', exist_ok=True)

W, H = 1600, 900

bg = Image.open('web/assets/sau-con-mua/backgrounds/bg_school.webp').convert('RGBA')
bg = bg.resize((W, H), Image.Resampling.LANCZOS)

an = Image.open('web/assets/sau-con-mua/characters/an.png').convert('RGBA')
minh = Image.open('web/assets/sau-con-mua/characters/minh.png').convert('RGBA')
teacher = Image.open('web/assets/sau-con-mua/characters/teacher.png').convert('RGBA')

# 1. Shot 1 (V1): Establishing school courtyard in heavy rain (0-4s)
v1 = bg.copy()
rain_overlay = Image.new('RGBA', (W, H), (185, 196, 204, 30))
v1 = Image.alpha_composite(v1, rain_overlay)
v1.convert('RGB').save('web/assets/sau-con-mua/intro/intro_1.webp', 'WEBP', quality=88)

# 2. Shot 2 (V2): An and Minh standing beside Teacher under veranda (4-8s)
v2 = bg.copy()
crop_box = (0, 100, 1200, 775)
v2_crop = v2.crop(crop_box).resize((W, H), Image.Resampling.LANCZOS)
an_v2 = an.resize((int(512 * 0.9), int(768 * 0.9)), Image.Resampling.LANCZOS)
minh_v2 = minh.resize((int(512 * 0.9), int(768 * 0.9)), Image.Resampling.LANCZOS)
teacher_v2 = teacher.resize((int(512 * 0.95), int(768 * 0.95)), Image.Resampling.LANCZOS)

v2_comp = Image.new('RGBA', (W, H))
v2_comp.paste(v2_crop, (0, 0))
v2_comp.paste(an_v2, (380, 250), an_v2)
v2_comp.paste(minh_v2, (550, 250), minh_v2)
v2_comp.paste(teacher_v2, (760, 210), teacher_v2)
v2_comp.convert('RGB').save('web/assets/sau-con-mua/intro/intro_2.webp', 'WEBP', quality=88)

# 3. Shot 3 (V3): Teacher turning gently toward An & Minh (8-12s)
v3 = bg.copy()
crop_box3 = (200, 150, 1300, 768)
v3_crop = v3.crop(crop_box3).resize((W, H), Image.Resampling.LANCZOS)
an_v3 = an.resize((int(512 * 1.1), int(768 * 1.1)), Image.Resampling.LANCZOS)
minh_v3 = minh.resize((int(512 * 1.05), int(768 * 1.05)), Image.Resampling.LANCZOS)
teacher_v3 = teacher.resize((int(512 * 1.2), int(768 * 1.2)), Image.Resampling.LANCZOS)

v3_comp = Image.new('RGBA', (W, H))
v3_comp.paste(v3_crop, (0, 0))
v3_comp.paste(an_v3, (280, 180), an_v3)
v3_comp.paste(minh_v3, (470, 190), minh_v3)
v3_comp.paste(teacher_v3, (750, 120), teacher_v3)
v3_comp.convert('RGB').save('web/assets/sau-con-mua/intro/intro_3.webp', 'WEBP', quality=88)

# 4. Intro Poster (fallback plate)
poster = v2_comp.copy()
draw = ImageDraw.Draw(poster)
for y in range(H - 200, H):
    alpha = int(120 * (y - (H - 200)) / 200)
    draw.line([(0, y), (W, y)], fill=(20, 30, 35, alpha))
poster.convert('RGB').save('web/assets/sau-con-mua/intro/intro_poster.webp', 'WEBP', quality=90)

print("Generated 4 intro plates successfully!")
