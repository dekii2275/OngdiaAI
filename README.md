# Game giải đố cốt truyện 2D — Cơn Mưa Lớn & Sau Cơn Mưa

**Toàn bộ các phân đoạn và chương truyện đã được tích hợp hoàn chỉnh.** Chơi từ `http://localhost:4173`:
- **Chương 01:** Lớp 4B trong giờ ra chơi mưa lớn (`web/index.html`)
- **Chương 02:** Ba con đường sơ tán (`web/chapter02.html`)
- **Phân đoạn "Sau Cơn Mưa":** Kỹ năng phòng tránh sạt lở & sơ tán an toàn dành cho học sinh tiểu học Lớp 3–5 (`web/sau-con-mua.html`)

---

## 🌧️ Phân Đoạn "Sau Cơn Mưa" (Tiểu Học Lớp 3–5)

Phân đoạn được xây dựng chuyên biệt theo chuẩn sư phạm phòng chống rủi ro thiên tai (UNICEF & Chữ thập đỏ), trang bị cho học sinh phản xạ nhận diện nguy cơ sạt lở đất sau mưa lũ và kỹ năng tuân thủ hiệu lệnh sơ tán.

### 1. Cách Khởi Động & Chơi Game
1. Chạy server cục bộ:
   ```powershell
   npm start
   ```
2. Mở trình duyệt tại: **[http://localhost:4173/web/sau-con-mua.html](http://localhost:4173/web/sau-con-mua.html)**
   *(Hoặc truy cập trang chủ `http://localhost:4173` và bấm "Phân đoạn Sau Cơn Mưa (Lớp 3–5) →")*

### 2. Cấu Hình Tích Hợp AI Google Gemini
Trò chơi sử dụng mô hình ngôn ngữ lớn (Gemini) để phân loại ý định người chơi khi trò chuyện với bạn Minh ở bước D3.
1. Mở file `.env` tại thư mục gốc của dự án.
2. Thêm khóa API:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. Mô hình sử dụng: `gemini-2.0-flash-lite` (hoặc `gemini-1.5-flash`).
4. **Cơ chế An toàn Sư phạm (Safety Fallback):**
   - Phản hồi từ AI được ánh xạ nghiêm ngặt vào whitelist 5 câu thoại duyệt sẵn của NPC Minh (`minh_accept`, `minh_regret`, `minh_worried`, `minh_ask_teacher`, `minh_redirect`).
   - Thời gian chờ tối đa 3000ms. Nếu mạng mất kết nối, quá thời gian hoặc API lỗi, hệ thống tự động fallback về `minh_accept` an toàn. Game không bao giờ bị nghẽn (zero softlock).

### 3. Quy Tắc Sư Phạm & Thiết Kế Thân Thiện Trẻ Em
- **Quy tắc hạt nhân:** *"Engine quyết định chân lý, hành động và đánh giá; AI chỉ tham gia vào việc hỗ trợ hội thoại."*
- **Giao diện:** Canvas tỉ lệ chuẩn 16:9, nút bấm lớn tối thiểu `48x48px`, font chữ rõ ràng, có nút đọc lại lời thoại, nút trợ giúp cô giáo (`btn-teacher-help`), không có đồng hồ đếm ngược gây căng thẳng.
- **Hệ thống đánh giá Rubric (0–8 điểm):**
  - Độc lập (chọn đúng ở lần đầu, không cần trợ giúp): **2 điểm**.
  - Có hỗ trợ (sau gợi ý hoặc chọn lại): **1 điểm**.
  - 3 Thẻ thành tích định tính: **Báo người lớn** (D1), **Ưu tiên an toàn** (D3), **Đi cùng nhóm** (D4).

### 4. Chạy Toàn Bộ Bộ Kiểm Thử (Full Regression Test)
Chạy tất cả 66 tests (bao gồm 25 tests cũ của Chương 1/2 và 41 tests mới của Sau Cơn Mưa):
```powershell
npm test
```

---

## Chơi Scene 1 ngay, không cần Unity

Scene **Cơn Mưa Lớn** đã được triển khai bằng HTML, CSS và JavaScript thuần, bám theo [kịch bản chương 1](Docs/Chapter01.md).

- Nhấp đúp `start-game.cmd`, hoặc chạy `npm start` rồi mở **http://localhost:4173**.
- Không cần `npm install`. Máy cần Node.js để chạy server.
- WASD / phím mũi tên để di chuyển, E để tương tác; cũng có thể bấm hoặc chạm trực tiếp. Enter / Space để đọc tiếp. I mở túi đồ, J mở sổ tay, Esc mở cài đặt hoặc đóng cửa sổ.
- Có lưu tự động, tiếp tục lần trước, âm thanh tổng hợp, điều khiển chạm, giảm chuyển động và hiển thị vùng tương tác.

Xem [hướng dẫn chỉnh scene và đối chiếu yêu cầu](Docs/Scene01-implementation.md). Ảnh kiểm tra giao diện ở `output/qa/`.

Bộ nhân vật 2D được vẽ mới riêng từng người, gồm 13 PNG trong suốt. Xem tại **http://localhost:4173/web/characters.html**; ảnh nằm ở `web/assets/characters/`, cấu hình trong `web/js/characters.js`, prompt trong [character-assets.md](Docs/character-assets.md). Game dùng font tiếng Việt local trong `web/assets/fonts/`.

Bản đồ sơ tán hoàn chỉnh: **http://localhost:4173/web/evacuation-map.html**.

```text
web/
├── index.html           # Khung giao diện chính (Hub điều hướng)
├── sau-con-mua.html     # Giao diện phân đoạn Sau Cơn Mưa (Lớp 3–5)
├── sau-con-mua.css      # CSS giao diện 16:9 và nút bấm lớn
├── characters.html      # Xem bộ nhân vật và tư thế riêng
├── evacuation-map.html  # Xem và tương tác bản đồ làng đầy đủ
├── evacuation-map.css   # Giao diện bản đồ trên máy tính/điện thoại
├── styles.css           # Giao diện, bố cục, điện thoại
├── typography.css       # Font tiếng Việt local và giãn dòng
├── assets/              # Nền, characters/, cues/ và fonts/
│   └── sau-con-mua/     # 9 assets mỹ thuật cho Sau Cơn Mưa
└── js/
    ├── sau-con-mua-loader.js    # Xác thực schema scenario
    ├── sau-con-mua-engine.js    # State machine & reducer S0-S5
    ├── sau-con-mua-telemetry.js # Telemetry đơn điệu & Rubric 0-8đ
    ├── sau-con-mua-ui.js        # Controller giao diện & modal
    ├── characters.js            # Model 2D độc lập và điểm đặt chân
    ├── evacuation-map.js        # Tuyến theo tranh gốc, điểm nối, zoom/kéo
    ├── story.js                 # Hội thoại, lời dẫn, nhánh câu chuyện
    ├── model.js                 # Trạng thái, khóa, tiến trình, thành tích
    ├── navigation.js            # Vùng sàn, va chạm, tìm đường tránh bàn ghế
    ├── game.js                  # Tương tác, điều khiển, sơ đồ, lưu
    └── audio.js                 # Mưa, sấm, bộ đàm, âm khóa, nhạc nền
```

---

## Chương 02 — Ba con đường

Chơi tại **http://localhost:4173/web/chapter02.html** sau khi chạy `npm start`, hoặc chọn Chương 02 từ màn hình đầu / phần kết Chương 01. Tám cảnh có nền riêng và điểm nối hai chiều; ba tuyến cho phép khám phá theo thứ tự bất kỳ, có 13 dấu hiệu, tám câu đố khu vực, mũi tên hiện nơi đến khi rê chuột, sổ tay, bản đồ, hội thoại, khóa kiểm tra cầu Bắc và lưu tự động.

---

## Tài Liệu & Kế Hoạch Đã Triển Khai
- **Master Plan:** `docs/superpowers/plans/2026-10-24-sau-con-mua-master-plan.md`
- **Art Bible & Assets Artifacts:** `Docs/sau-con-mua-art-artifacts.md`
- **5 Task Granular Plans:** `docs/superpowers/plans/task-1-*.md` đến `task-5-*.md`
- **QA Specification:** `plan/sau-con-mua/docs/08_QA_AND_HANDOFF.md`
