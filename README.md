# Game Giải Đố Cốt Truyện 2D — Cơn Mưa Lớn & Sau Cơn Mưa (Trọn Vẹn 5 Chương)

**Phiên bản Nâng Cấp Toàn Diện (Creative & Interactive Architecture): Tích hợp Voice TTS 6 nhân vật, Dynamic FX, Mini-sequence WASD tình huống và 4 Bộ Router AI Google Gemini thông minh.**

Dự án giáo dục tương tác 2D trên nền Canvas & HTML5/CSS3 hiện đại, hướng dẫn học sinh và thanh thiếu niên kỹ năng sống còn, sơ tán phòng tránh lũ quét, sạt lở đất và cứu hộ khẩn cấp tại miền núi Việt Nam.

Chơi trực tiếp tại `http://localhost:4173`:
- **Chương 01:** Lớp 4B trong giờ ra chơi mưa lớn (`web/index.html`)
- **Chương 02:** Ba con đường sơ tán (`web/chapter02.html`)
- **Chương 03:** Vết nứt sườn đồi — Cứu hộ địa chất & Bộ đàm AI (`web/chapter03.html`)
- **Chương 04:** Chia cắt & Cứu bạn học — Phác đồ cầu tre & Đàm thoại tâm lý (`web/chapter04.html`)
- **Chương 05:** Đỉnh đồi an toàn — Tác chiến cứu nạn, Y tế sau bão & Cấp chứng nhận (`web/chapter05.html`)
- **Phân đoạn "Sau Cơn Mưa":** Hành trình sư phạm dành cho học sinh Lớp 3–5 (`web/sau-con-mua.html`)

---

## 🌟 Các Trụ Cột Nâng Cấp Kiến Trúc (Core Innovations)

### 1. 🎙️ Động Cơ Giọng Đọc Phân Vai Voice TTS (Voice TTS Engine)
Tích hợp Web Speech Synthesis API với cấu hình âm điệu (`pitch`) và tốc độ (`rate`) thiết kế riêng cho **6 nhân vật**, mang lại trải nghiệm thoại nhập vai sống động:
- **Cô giáo Thảo (`thao`):** Giọng ấm áp, điềm tĩnh, chuẩn mực nhà giáo (`rate: 0.95`, `pitch: 1.05`).
- **Bác Mạnh cựu chiến binh (`manh`):** Trầm ấm, dứt khoát, phong thái người lính can trường (`rate: 0.9`, `pitch: 0.8`).
- **Trưởng làng Minh Anh (`minh_anh`):** Uy nghiêm, rành rọt, chỉ đạo quyết đoán (`rate: 0.95`, `pitch: 0.9`).
- **Bạn Minh (`minh`):** Hơi hoảng loạn, gấp gáp, cảm xúc trẻ thơ (`rate: 1.05`, `pitch: 1.2`).
- **Bạn Duyên (`duyen`):** Nhỏ nhẹ, lo lắng, cần sự chở che (`rate: 1.0`, `pitch: 1.3`).
- **Nhân vật người chơi (`ban`):** Đĩnh đạc, rõ ràng, dũng cảm (`rate: 1.0`, `pitch: 1.0`).
- **Điều khiển trực quan:** Nút HUD toggle âm thanh `[🔊 Giọng đọc: BẬT/TẮT]` hiện diện xuyên suốt 5 chương, lưu trạng thái tự động vào `localStorage`.

### 2. ⚡ Hiệu Ứng Đồ Họa Cảm Xúc (Dynamic FX & Atmosphere)
Mỗi phân cảnh đều được tăng cường hiệu ứng thị giác điện ảnh CSS/Canvas:
- **Screen Shake (Rung Chấn Địa Chấn):** Rung lắc khung nhìn mạnh mẽ khi xảy ra tiếng nổ sườn đồi, đá tảng sạt trượt chặn lối hoặc đá lăn nguy hiểm.
- **Bridge Sway & Flood Currents (Cầu Tre Đu Đưa & Dòng Lũ Xoáy):** Dòng xoáy nước lũ cuộn bọt đỏ ngầu dưới chân cầu kết hợp mô phỏng con lắc vật lý khiến nhịp cầu tre dao động lắc lư liên tục.
- **Sunrise Glow (Rạng Đông Hy Vọng):** Vầng hào quang bình minh tỏa sáng ấm áp trên đỉnh đồi xua tan đêm mưa bão kinh hoàng.
- **Hearth Fire (Ngọn Lửa Sưởi Ấm):** Ánh lửa bập bùng sinh động bên trong Nhà văn hóa cộng đồng, lan tỏa hơi ấm và niềm tin cho các nạn nhân được cứu sống.

### 3. 🕹️ Cơ Chế Di Chuyển WASD Tình Huống (Situational WASD Traversal)
Học sinh trực tiếp điều khiển nhân vật vượt qua các thử thách sinh tồn độc đáo ở từng chương:
- **Chương 1:** Điều khiển bước chân luồn lách qua các dãy bàn ghế nghiêng đổ và hành lang ngập nước.
- **Chương 2:** Dò từng phiến đá bước dã chiến băng qua dòng nước tràn ngập đường liên thôn.
- **Chương 3:** Dùng phím điều hướng kết hợp **Gậy Dò Đường** bước trên gờ đá kiên cố để né bùn nhão hút chân.
- **Chương 4 — Mini-sequence Vượt Cầu Tre Rung Lắc:** Giữ thăng bằng cho bạn Minh bằng phím `A`/`D` (nghiêng người) trong vùng an toàn (33% – 67%) đồng thời nhấn giữ `W`/`Space` để bước tới thận trọng.
- **Chương 5 — Dẫn Đầu Đội Ngũ An Toàn:** Cầm nhịp bước chân đưa toàn bộ đoàn di tản 5 người vững vàng tiến qua cổng Trạm chỉ huy đỉnh đồi.

### 4. 🧠 Bộ Tứ Router AI Google Gemini Thông Minh (AI Backend Handlers)
Hệ thống kết nối trực tiếp mô hình **Google Gemini 2.5/3.5 Flash Lite** (kèm bộ Fallback chuẩn quân sự bảo đảm Zero-Hang / Không bao giờ treo game):
1. **Khảo Hạch AI Vấn Đáp Cuối Mỗi Chương (`/api/debrief/evaluate`):**
   - Đánh giá câu trả lời tự luận của người chơi về bài học sinh tồn của chương.
   - Khắt khe từ chối các câu trả lời liều mạng (quay lại lấy tiền bạc, trèo qua đá lăn, lội qua nước sâu) và cấp thẻ **PASS CHƯƠNG** khi học sinh hiểu thấu đáo nguyên tắc "Tính mạng là trên hết".
2. **Phác Đồ Cầu Tre Chiến Thuật (`/api/tactical/bridge-blueprint`):**
   - Giám định 3 điểm dị thường (mối mộc đầu cầu, thân tre trơn trượt giữa dòng, mố đá sạt trượt bờ đối diện).
   - Xuất phác đồ phân bổ phân khu nguy hiểm và quy tắc bước đi an toàn.
3. **Biên Tập Bức Điện Quân Báo Cứu Nạn (`/api/tactical/incident-dispatch`):**
   - Tổng hợp toàn bộ hiểm họa thực địa trên toàn tuyến (sạt taluy âm, đứt gãy điện lực, chia cắt cô lập).
   - Soạn thảo bức điện khẩn cấp chuẩn nghi thức quốc phòng gửi Ban Chỉ huy Tìm kiếm Cứu nạn Huyện.
4. **Phản Biện Khủng Hoảng Y Tế Sau Bão (`/api/medical/triage-solver`):**
   - Giải quyết 3 ca khẩn cấp theo phác đồ y khoa hiện đại:
     * *Ca 1 — Hạ thân nhiệt:* Lau khô, ủ ấm nhiều lớp, uống nước gừng đường ấm, kiên quyết chống cạo gió hay hơ sát lửa bỏng.
     * *Ca 2 — Vết thương rách sâu nhiễm bẩn:* Rửa nước muối sinh lý, sát khuẩn povidone iodine, băng ép vô trùng cầm máu; loại trừ việc đắp lá cây/bùn đất hoại tử.
     * *Ca 3 — Ngạt khí than phòng kín (CO Hazard):* Khẩn cấp mở toang cửa sổ thông khí và dập tắt di chuyển lò than ra hiên thoáng.

### 5. 📜 Giấy Chứng Nhận Vinh Danh Cá Nhân Hóa (Personalized Certificate)
Sau khi vượt qua Khảo Hạch Tốt Nghiệp Toàn Khóa ở Chương 5:
- AI phân tích phong cách chỉ huy và các quyết định của người chơi để **khắc lời khen danh dự cá nhân hóa** trực tiếp lên Giấy Chứng Nhận.
- Lời khen được lưu trữ vĩnh viễn trong State Storage (`certPraise`), tự động hiển thị lại khi xem bằng khen hoặc tải lại trang.

---

## 🗺️ Tóm Tắt Trọn Vẹn 5 Chương Cốt Truyện

```
[Chương 1: Lớp 4B Trong Mưa Lớn]
       │
       ▼ (Bàn giao Handoff: Quyết định ba lô & gấu bông)
[Chương 2: Ba Con Đường Sơ Tán]
       │
       ▼ (Đánh giá dòng lũ & Vượt Cầu Bắc)
[Chương 3: Vết Nứt Sườn Đồi & Cứu Hộ Địa Chất]
       │
       ▼ (Bộ đàm AI kênh Trưởng làng & Can ngăn Bác Mạnh)
[Chương 4: Chia Cắt & Cứu Bạn Học]
       │
       ▼ (Thuyết phục Minh, Phác đồ cầu tre & WASD vượt cầu)
[Chương 5: Đỉnh Đồi An Toàn & Tổng Kết Toàn Tuyến]
       │
       ▼ (Điện báo Huyện, Xử lý Y tế 3 ca & Nhận Bằng Khen Khắc Tên)
[CHỨNG NHẬN CHIẾN SĨ AN TOÀN PHÒNG CHỐNG THIÊN TAI]
```

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài Đặt Môi Trường
Yêu cầu: Node.js phiên bản $\ge 18.0.0$.
```powershell
# Cài đặt dependencies
npm install

# Cấu hình khóa API Google Gemini trong file .env (nếu có):
# GEMINI_API_KEY=your_actual_gemini_api_key
```

*(Lưu ý: Hệ thống đã tích hợp sẵn cơ chế Safe Mock Fallback tự động nhận diện nếu chưa cấu hình API Key hoặc khi mạng gián đoạn, đảm bảo trải nghiệm chơi mượt mà 100%).*

### 2. Chạy Ứng Dụng
```powershell
npm start
```
Mở trình duyệt truy cập: `http://localhost:4173`

---

## 🧪 Hệ Thống Kiểm Thử Tự Động Toàn Diện (Full Test Suite)

Dự án sở hữu bộ kiểm thử tự động toàn diện với **160+ bài kiểm thử** (Node.js Test Runner tiêu chuẩn), bao quát:
- Tính hợp lệ của cấu trúc dữ liệu hành trình 5 chương (`journey.js`).
- Động cơ TTS phân vai 6 nhân vật và điều khiển phát âm thanh.
- Tính chính xác của cả 4 Router Backend AI (Gemini Live & Fallback).
- Kiểm tra toàn vẹn tài sản đồ họa (ảnh chân dung nhân vật, hình nền 2D WebP).
- Luồng kiểm thử hồi quy tích hợp E2E từ Chương 1 đến Chương 5 (`tests/full-5-chapters-regression.test.cjs`).

Chạy lệnh kiểm thử:
```powershell
npm test
```
Tất cả các bài kiểm thử đều đạt chuẩn 100% PASS, không lỗi, không hồi quy.
