# Bộ nhân vật 2D — Cơn Mưa Lớn

Tạo bằng công cụ ImageGen tích hợp (skill imagegen), mỗi asset là một PNG độc lập có alpha trong suốt. Ảnh trong map/ chỉ làm tham chiếu diện mạo/phong cách; không cắt hoặc trích xuất ô từ atlas. Tất cả file được lưu trong project tại `web/assets/characters/`.

Xem bộ nhân vật tại `http://localhost:4173/web/characters.html` sau khi chạy `npm start`.

Đây là bộ model hiển thị 2D (ảnh toàn thân, chân dung, tư thế). Nhân vật chính có hai tư thế bước, Duyên có tư thế ôm gấu; không phải model 3D hoặc bộ rig xương. Game dùng các PNG trực tiếp, giữ alpha gốc. `web/js/characters.js` khai báo ảnh, chiều cao và mốc đầu/chân tính theo tỷ lệ toàn ảnh; `game.js` vẽ toàn bộ PNG, không cắt vùng nhân vật hay xử lý xóa nền.

## Thư mục

```text
web/assets/characters/
├── ban/       idle.png · portrait.png · walk-1.png · walk-2.png
├── duyen/     idle.png · portrait.png · bear.png
├── thao/      idle.png · portrait.png
├── minh-anh/  idle.png · portrait.png
└── manh/      idle.png · portrait.png
```

Minh Anh và Mạnh xuất hiện qua chân dung bộ đàm trong Scene 1 theo kịch bản. Ảnh toàn thân của họ đã sẵn để dùng trong scene tiếp theo.

## Font

- `web/assets/fonts/BeVietnamPro-Regular.ttf` và `BeVietnamPro-SemiBold.ttf`: giao diện, hội thoại, nhãn và chữ SVG.
- `web/assets/fonts/Lora-Variable.ttf`: tiêu đề và tên người nói.
- Font tải từ [Google Fonts — Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro) và [Google Fonts — Lora](https://github.com/google/fonts/tree/main/ofl/lora), có giấy phép SIL Open Font License lưu cùng thư mục.
- `web/typography.css` dùng font local; không cần internet lúc chơi. Server trả TTF với MIME `font/ttf`. Sau khi cập nhật server.js, khởi động lại server và tải lại trang bằng Ctrl+Shift+R.

## Prompt cuối cho từng asset

### ban/idle.png

Đường dẫn: `web/assets/characters/ban/idle.png`

```text
Create one newly drawn production-ready 2D full-body game character PNG with genuine transparent alpha background. The attached sheet is only an art-direction and identity reference; do NOT cut, extract, reuse or reproduce any cell from it. Draw a fresh polished illustration of the Vietnamese primary school boy protagonist, age 10, tousled dark brown hair, warm brown eyes, warm light skin, cream-white short-sleeve button school shirt, red pioneer neckerchief, high-waisted navy trousers, worn dark brown leather school shoes, brown leather backpack on both shoulders. Gentle attentive expression, relaxed standing pose, one hand loosely holding a backpack strap. Face and torso in near-front three-quarter view, feet planted at one baseline. Refined hand-painted anime adventure-game style: fine dark warm outlines, soft gouache shading, restrained desaturated ivory/navy/red palette, subtle cloth folds, natural child anatomy about 5.5 heads tall; NOT chibi, not glossy 3D. Readable silhouette to match a rainy rural Vietnamese classroom painting. Exactly ONE character, full head to both soles visible, no other pose, no inset, no portrait, no text, no frame, no scenery, no ground, no cast shadow. Tall portrait composition, figure fills 90% of image height and is centered with a little clear padding around silhouette. Preserve transparency between arms and body. Deliver a standalone character, not a sprite sheet.
```

### ban/walk-1.png

Đường dẫn: `web/assets/characters/ban/walk-1.png`

```text
Create a standalone alternate animation pose of the EXACT boy character in the reference, freshly drawn, genuine transparent PNG. Preserve his face, messy dark brown hair, age 10 child proportions, white short-sleeve school shirt, red pioneer scarf, navy trousers, brown backpack with brass buckles and brown shoes, warm fine linework and soft painterly anime shading. This image is ONE full-body walking contact pose moving to the RIGHT in a readable near-side three-quarter view. Left leg extends forward toward screen-right, heel touching the floor, right leg extends behind toward screen-left, rear heel raised. Left arm swings backward and right arm forward naturally, neither hand grips a strap during walking. Subtle determined expression, head level, slight forward lean, backpack on both shoulders. Normal walking, not running; keep torso and overall proportions consistent with idle. Tall portrait image centered, whole hair and BOTH shoes visible, feet along the baseline at 97% height, crown about 3% height. Figure fully separated on transparent alpha, no ground/shadow/halo/background scenery. Exactly ONE walking boy, no montage, grid, sheet, inset or text. This is animation frame 1, a separate illustration, not a cutout or crop.
```

### ban/walk-2.png

Đường dẫn: `web/assets/characters/ban/walk-2.png`

```text
Draw an obviously DIFFERENT WALKING PASSING POSE for the exact boy in the attached idle reference. One newly illustrated full-body 2D game PNG on TRUE transparent alpha. Same warm painterly anime style, same age-10 face, messy brown hair, white short-sleeve shirt, red scarf, navy trousers, brown backpack and brown shoes. Face and torso turned toward screen RIGHT in near-side three-quarter view. Gait is a mid-stride PASSING POSE: one supporting leg is nearly VERTICAL straight down beneath the hip with foot flat on the floor; the other leg is BENT AT THE KNEE, lifted, lower leg folded back behind him, sole visible. Legs close together beneath pelvis, NOT spread in a wide stride, NOT two straight diagonal legs. Arms hang near his torso in the neutral passing part of a walking swing. Head level, normal walking pace. The image should visibly look like the narrow midpoint between long strides. Tall portrait framing, full figure head to both complete shoes, same 5.5-head child body proportions, hair around 3% height, grounded supporting sole at 97% height. Exactly ONE pose, no grids/sheets/extra views/text/insets/background/floor/shadow/halo. Preserve pure transparency around silhouette.
```

### ban/portrait.png

Đường dẫn: `web/assets/characters/ban/portrait.png`

```text
Newly illustrate a standalone dialogue portrait of the EXACT boy from the reference, not an image crop. Preserve identity, age 10, tousled dark brown hair, warm brown eyes, ivory short-sleeve shirt, red pioneer neckerchief and brown backpack straps, fine warm anime linework, soft gouache shading, muted palette. One head-and-upper-chest bust, near-front three-quarter, attentive gentle expression looking toward the viewer, face large and clearly readable in a small dialogue window. Square portrait PNG, head centered, complete hair with 5% transparent padding above and sides, shoulders and upper chest visible down to the neckerchief knot and tie ends; body continues cleanly to the bottom edge. Exactly one portrait, no full-body, extra heads, montage, sheet, text, border, background color, halo or scenery. Genuine transparent alpha around silhouette. Draw a fresh high-detail bust asset consistent with reference instead of resizing/cutting the full-body source.
```

### duyen/idle.png

Đường dẫn: `web/assets/characters/duyen/idle.png`

```text
Create a newly drawn standalone 2D full-body game character PNG with genuine transparent alpha background. Reference 1 is an identity guide only, never extract a cell. Reference 2 is the new boy sprite and defines the exact art style, line weight, lighting and level of detail for this game's cast. Draw Duyên, a Vietnamese primary school girl age 10: warm brown eyes, long dark brown hair with soft straight bangs and a small white flower hairclip at the side, cream-white short-sleeve school shirt, red pioneer neckerchief, navy knee-length pleated skirt, white mid-calf socks, dark brown school shoes, small charcoal school backpack. Gentle slightly worried attentive expression; relaxed standing pose facing near-front three-quarter, hands loosely held together in front of waist with space to later hold a toy. Natural child proportions about 5.5 heads tall; refined hand-painted anime, warm fine outlines, soft gouache shading, restrained desaturated colors. One complete character only, from head to soles, feet on same baseline. Tall portrait framing, 90% height, centered, clear margins. No teddy yet. No other pose, inset, portrait, sheet, scenery, ground, cast shadow, text, borders or background color. Preserve truly transparent space around and within the silhouette. Newly illustrate, not a crop.
```

### duyen/bear.png

Đường dẫn: `web/assets/characters/duyen/bear.png`

```text
Create a newly drawn alternate full-body pose of EXACT Duyên from the reference on genuine transparent alpha. Preserve her exact face, long dark brown hair, white flower hairclip, age-10 natural proportions, white school shirt, red pioneer scarf, navy pleated knee-length skirt, white mid-calf socks, brown shoes and charcoal backpack. Same near-front three-quarter camera, fine warm painterly anime outlines, soft gouache shading, muted palette and complete full-body tall portrait composition. CHANGE the hands and expression: Duyên now hugs a small worn honey-brown stuffed teddy bear at her chest with BOTH hands visibly wrapped around the toy; relieved gentle smile. Bear has soft rounded ears, little stitched nose, simple button eyes, slightly worn cloth fur, about one-third her torso height, clearly nestled in arms, not floating. Keep head/crown and both foot soles at same positions and scale as reference, full hair to both shoes visible, feet grounded near 98% height. Exactly one girl carrying one teddy, no extra poses, portraits, sheets, grids, labels, text, borders, floor, shadows, halo, scenery or background color. Single complete new standalone pose PNG, not an extracted cell.
```

### duyen/portrait.png

Đường dẫn: `web/assets/characters/duyen/portrait.png`

```text
Newly draw a standalone head-and-upper-chest dialogue portrait of EXACT Duyên from the reference, not a crop. Keep the same Vietnamese girl age 10, warm brown eyes, long dark brown hair, soft bangs, white flower hairclip at side, cream school shirt, red pioneer scarf and charcoal backpack straps. Same fine warm outlines, soft hand-painted anime gouache shading and muted colors. Near-front three-quarter bust, gentle slightly concerned but attentive expression, looking toward viewer, large clear face for small dialogue panel. Square portrait canvas, centered head with all hair visible and 5% transparent top/side padding; shoulders and chest visible to bottom edge including scarf knot and ends, hair naturally extends around shoulders. Exactly one new portrait on genuine transparent alpha, no fullbody, other expressions, grid, inset, sheet, text, label, border, background, halo or scenery. Draw this bust as its own high-detail asset; preserve the reference character identity.
```

### thao/idle.png

Đường dẫn: `web/assets/characters/thao/idle.png`

```text
Newly draw ONE standalone full-body 2D game character, genuine transparent PNG. Reference 1 is the Vietnamese teacher identity and costume guide, reference 2 the NEW boy sprite establishes fine warm outlines, painterly gouache anime shading, restrained colors and detail. Never extract/crop a sheet cell; draw a new illustration. Cô Thảo, Vietnamese woman teacher age 28, long dark brown hair, small white flower hair clip, warm brown eyes, kind but composed face. Clearly adult proportions about 7 heads tall, a mature face distinct from the children. Pale blush-pink traditional áo dài with darker coral pink side panels and a few tasteful coral and muted gold floral motifs, ivory long trousers visible beneath the tunic, brown low-heel closed shoes. Holding a muted teal book with both hands at waist, standing near-front three-quarter, relaxed balanced stance, complete hands and both shoes visible. Hand-painted adventure game sprite with softly modeled fabric and thin clean outlines, suitable for rainy rural Vietnam classroom. Tall portrait canvas, centered figure taking 90% of height, slight transparent padding. Exactly one entire character head to soles, no alternate views, portraits, grids, text, borders, scenery, floor, ground shadow or background fill. Transparent space around hair, sleeves and tunic slit.
```

### thao/portrait.png

Đường dẫn: `web/assets/characters/thao/portrait.png`

```text
Newly draw a standalone dialogue portrait of EXACT adult teacher cô Thảo in the reference, not a crop of her full-body image. Preserve long dark brown hair, little white flower hairclip, warm brown eyes, mature Vietnamese face age 28, pale blush pink áo dài with coral collar/panels and subtle coral/gold flowers. She must read as an adult teacher, distinct from the child Duyên. Same fine warm hand-painted anime outlines, soft gouache shading and muted palette. Kind composed attentive expression, near-front three-quarter head and upper chest bust, looking toward viewer. Square transparent PNG, head centered, all hair crown visible with 5% clear padding, shoulders and upper chest to bottom edge, pink high collar and floral motifs readable. One fresh high-detail portrait only, no full-body, extra expression, sheet, grid, inset, text, borders, halo, scenery, floor or background color. Genuine transparent alpha around the silhouette. Match the exact character identity and consistent game art direction.
```

### minh-anh/idle.png

Đường dẫn: `web/assets/characters/minh-anh/idle.png`

```text
Newly illustrate one complete standalone 2D game character PNG, truly transparent background. First reference is village chief Minh Anh's identity/costume guide ONLY, never cut a cell from it. Second reference new boy sprite sets the same fine warm outline and hand-painted anime/gouache adventure-game art direction. Draw Minh Anh, Vietnamese male village chief about 52, slightly wavy short charcoal hair with a little gray at temples, tidy black moustache, warm brown eyes, lightly weathered mature face, calm responsible expression. Ivory long-sleeve button shirt with sleeves rolled to forearms, pen in breast pocket, charcoal trousers with dark leather belt and brass buckle, brown leather shoes, modest wristwatch. Holding a thin brown document folder at one side, other hand naturally relaxed, balanced near-front three-quarter standing pose. Mature proportions about 7 heads tall, not chibi. Muted warm neutral colors, soft subtle shading and cloth folds, consistent cast style. Exactly ONE new full-body character, head to both soles visible, tall portrait composition centered taking 90% height, clear transparent margins. No extra pose, sheet, grid, inset, portrait, text, labels, border, scenery, floor, cast shadow or colored background.
```

### minh-anh/portrait.png

Đường dẫn: `web/assets/characters/minh-anh/portrait.png`

```text
Newly illustrate a standalone dialogue bust portrait of EXACT village chief Minh Anh from the reference, not a crop. Vietnamese mature man age 52, wavy short charcoal hair with gray temples, tidy dark moustache, kind brown eyes, lightly weathered face, ivory button shirt with pen in breast pocket. Calm responsible expression, near-front three-quarter looking toward viewer. Keep exact identity, fine warm hand-painted anime outlines, muted colors and soft gouache shading. Square PNG with genuine transparent alpha, head-and-upper-chest composition, face large, all hair visible with 5% top/side transparent padding, shoulders and shirt to bottom edge. One fresh high-detail portrait only. No other expressions, fullbody, grid, sheet, inset, text, labels, border, colored background, halo or scenery. Designed for small game dialogue panel.
```

### manh/idle.png

Đường dẫn: `web/assets/characters/manh/idle.png`

```text
Draw a NEW complete standalone 2D full-body character PNG with genuine transparent alpha. First reference only guides the identity and workwear of bác Mạnh; do NOT extract any sheet cell. Second reference new boy defines the fine warm outlines, soft hand-painted anime gouache shading, muted palette and consistent cast style. Mạnh is a Vietnamese male construction worker/engineer age 40, short tousled charcoal hair, kind brown eyes, faint stubble, alert dependable expression. Cream safety helmet with a small simple dark teal safety cross, gray rolled-sleeve work shirt and gray cargo trousers, muted yellow reflective safety vest/harness, brown utility belt with a radio and small tool pouch, rugged dark brown lace-up work boots, dark wristwatch. Holding a charcoal clipboard naturally at one side; free hand relaxed. Front three-quarter balanced standing pose, adult proportions about 7 heads tall, clearly older and sturdier than boy. Crisp readable silhouette, subtle fabric folds, coherent lighting. Exactly ONE complete character from helmet to both soles, tall centered portrait framing, 90% of image height, slight clear margins. No other characters, views, poses, insets, grid, text, labels, frame, background fill, floor, scenery or ground shadow. Newly illustrated standalone actor, not a crop.
```

### manh/portrait.png

Đường dẫn: `web/assets/characters/manh/portrait.png`

```text
Newly illustrate a standalone dialogue bust portrait of EXACT construction worker bác Mạnh from the reference, not a crop. Vietnamese adult man age 40, short tousled dark hair, kind brown eyes, faint stubble, cream safety helmet with small dark teal safety cross, gray work shirt and muted yellow reflective safety straps. Alert dependable calm expression, near-front three-quarter looking toward viewer. Preserve the exact identity, clothing, helmet, fine warm hand-painted anime linework, soft gouache shading and muted colors. Square PNG on genuine transparent alpha, head and upper chest portrait, face large and clear, COMPLETE helmet visible with 5% transparent padding above and at sides, shoulders and vest to bottom edge. One newly drawn high-detail portrait only. No fullbody, extra expressions, sheets, grids, insets, text, labels, frame, colored background, halo or scenery. Game dialogue window asset.
```


