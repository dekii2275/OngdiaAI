# Sau Cơn Mưa — Art Bible & Reusable Artifacts

## 1. Phong Cách & Triết Lý Mỹ Thuật
- **Thể loại:** 2D minh họa sách tranh (storybook illustration), phong cách màu nước mềm mại, thân thiện với học sinh tiểu học (Lớp 3–5).
- **Tone màu chủ đạo:** Mưa rào vùng cao, mộc mạc, bình dị, không gây sợ hãi hoảng loạn.
- **Bảng màu chuẩn (Palette):**
  - Nền kem ấm: `#F6F0DF`
  - Cây cỏ sườn đồi: `#648264`
  - Áo đồng phục học sinh & bầu trời: `#557EAD`
  - Đất sỏi bùn đỏ: `#A7805A`
  - Mây mưa xám nhạt: `#B9C4CC`

## 2. Bảng Kê Khai 9 Asset Độc Lập

| File Asset | Loại | Kích thước | Mô tả & Cách sử dụng |
|---|---|---|---|
| `bg_school.webp` | Background | 1600x900 (16:9) | Khung nhìn S0, S1, S2 (sân trường, hàng rào tre ngăn cách ở x=0.70) |
| `bg_route.webp` | Background | 1600x900 (16:9) | Khung nhìn S3, S4 (tuyến đường sơ tán dốc sỏi sườn đồi) |
| `bg_assembly.webp` | Background | 1600x900 (16:9) | Khung nhìn S5 (nhà văn hóa tập kết an toàn trên đồi cao) |
| `an.png` | Character Cutout | 512x768 (PNG alpha) | Bạn An (nhân vật chính người chơi), áo trắng cổ xanh, balo xanh |
| `minh.png` | Character Cutout | 512x768 (PNG alpha) | Bạn Minh (bạn học), áo trắng, balo vàng, nét mặt lo âu tiếc tranh |
| `teacher.png` | Character Cutout | 512x768 (PNG alpha) | Cô Hương (giáo viên chủ nhiệm), áo xanh nhạt thanh lịch, ân cần |
| `cue_crack.webp` | Cue Crop | 800x600 | Vết nứt đất bùn nhão ngoài hàng rào (D1 chính) |
| `cue_tree.webp` | Cue Crop | 800x600 | Cây ven dốc nghiêng bất thường sau mưa (D1 phụ) |
| `cue_stream.webp` | Cue Crop | 800x600 | Dòng suối xa xa cuộn sóng đỏ đục ngầu phù sa (D1 phụ) |

## 3. Bảng Tọa độ anchor chuẩn hóa trên Viewport 16:9 (0.0 đến 1.0)
- **School View:**
  - An: `x = 0.35, y = 0.70`
  - Minh: `x = 0.46, y = 0.70`
  - Cô Hương: `x = 0.61, y = 0.67`
  - Vết nứt đất (`cue_crack`): `x = 0.77, y = 0.43`
  - Cây nghiêng (`cue_tree`): `x = 0.85, y = 0.28`
  - Nước suối (`cue_stream`): `x = 0.90, y = 0.58`
  - Ranh giới cấm vượt qua: `x = 0.70`

- **Route View:**
  - Nhóm di chuyển: `x = 0.25, y = 0.68`
  - Bảng mốc sơ tán: `x = 0.58, y = 0.52`
  - Tuyến A (guided): Điểm nối [(0.25, 0.68), (0.48, 0.68), (0.68, 0.61), (0.83, 0.55)]

- **Assembly View:**
  - Cô Hương: `x = 0.55, y = 0.66`
  - An: `x = 0.40, y = 0.72`
  - Minh: `x = 0.47, y = 0.72`
  - Bảng điểm danh: `x = 0.68, y = 0.38`
