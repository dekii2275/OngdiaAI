# Game giải đố cốt truyện 2D — Cơn Mưa Lớn & Sau Cơn Mưa (Trọn vẹn 5 Chương)

**Toàn bộ 5 Chương hành trình sinh tồn và phân đoạn Sau Cơn Mưa đã được tích hợp hoàn chỉnh và đồng bộ 100% về mỹ thuật 2D canvas, cốt truyện liên tục và tích hợp AI Google Gemini thời gian thực.**

Chơi trực tiếp tại `http://localhost:4173`:
- **Chương 01:** Lớp 4B trong giờ ra chơi mưa lớn (`web/index.html`)
- **Chương 02:** Ba con đường sơ tán (`web/chapter02.html`)
- **Chương 03:** Vết nứt sườn đồi — Bộ đàm cứu hộ AI (`web/chapter03.html`)
- **Chương 04:** Chia cắt & Cứu bạn học — Đối thoại thuyết phục AI (`web/chapter04.html`)
- **Chương 05:** Đỉnh đồi an toàn — Tổng kết 5 chương & Cấp chứng nhận (`web/chapter05.html`)
- **Phân đoạn "Sau Cơn Mưa":** Dành cho học sinh tiểu học Lớp 3–5 (`web/sau-con-mua.html`)

---

## 📻 Hệ Thống Bộ Đàm Cứu Hộ AI (Emergency AI Radio Walkie-Talkie)

Hệ thống Bộ đàm AI thời gian thực kết nối trực tiếp với **Google Gemini API** (`gemini-3.5-flash-lite`), cho phép học sinh tương tác tự do với các nhân vật chỉ huy và tiền trạm:

### 1. Cách Mở & Sử Dụng Bộ Đàm
- **Phím tắt nhanh:** Bấm phím `R` trên bàn phím ở bất kỳ thời điểm nào trong Chương 3, 4, 5.
- **Nút HUD:** Bấm icon `[📶 BỘ ĐÀM AI R]` ở góc trên bên phải hoặc thanh điều hướng chân trang.
- **Đèn LED [⚡ AI ONLINE]:** Báo hiệu kết nối trực tiếp tới mô hình ngôn ngữ lớn Google Gemini.

### 2. Các Kênh Vô Tuyến Khẩn Cấp (Channels & Personas)
- **Kênh 1: Trưởng làng Minh Anh (`minh_anh`):** Vị chỉ huy điềm đạm, am hiểu địa hình núi rừng, túc trực tại trạm chỉ huy đỉnh đồi, hướng dẫn các em học sinh di tản an toàn tránh xa vết nứt taluy.
- **Kênh 2: Bác Mạnh (`manh`):** Thợ điện kiêm đội phó dân phòng dũng cảm, đi tiền trạm thực địa, báo cáo tình hình bùn nhão, đá lăn, cột điện gãy và cống tràn.
- **Kênh 3: Cô Thảo (`thao`):** Cô giáo chủ nhiệm ấm áp, ân cần nhắc nhở các em giữ chặt tay nhau, không tách đoàn, ưu tiên tính mạng con người là số một.
- **Kênh 4: Bạn Minh (`minh`):** Học sinh mắc kẹt ở xóm dưới, ban đầu hoảng sợ và tiếc bức tranh kỷ niệm của mẹ; người chơi trò chuyện thuyết phục Minh hiểu "tính mạng là vô giá" để chịu di tản.

### 3. Cơ Chế An Toàn Kỹ Thuật (Zero Crash / Zero Hang)
- Tích hợp `AbortController` timeout 3500ms.
- Tự động nạp bộ câu trả lời fallback an toàn nếu mất mạng hoặc quá tải API.
- Đảm bảo 100% không bao giờ làm treo hay đơ tiến trình chơi game.

---

## 🗺️ Tóm Tắt Trọn Vẹn Hành Trình 5 Chương (Full Journey)

1. **Chương 01: Lớp 4B Trong Mưa Lớn (`index.html`)**
   - 09:00 sáng. Chuông báo động mưa lũ vang lên.
   - Quan sát dấu hiệu nước ngập cửa sổ, lấy ba lô khẩn cấp, đưa ra quyết định có lấy gấu bông của Duyên hay ưu tiên sơ tán cùng Cô Thảo ra cổng sau.
2. **Chương 02: Ba Con Đường Sơ Tán (`chapter02.html`)**
   - Đứng trước 3 con đường: Tuyến A (chân đồi dốc), Tuyến B (cầu treo rung lắc), Tuyến C (đường vòng phía Bắc 650m).
   - Kiểm tra kỹ 13 dấu hiệu thực địa cùng Bác Mạnh. Nhận ra "đường gần nhất chưa chắc là an toàn nhất". Vượt Cầu Bắc an toàn.
3. **Chương 03: Vết Nứt Sườn Đồi (`chapter03.html`)**
   - Đoạn đường men dốc xuất hiện vết nứt hình vòng cung D1, bụi tre nghiêng bật rễ và nước đùn sủi tăm.
   - Bấm `R` gọi Bộ đàm AI cho Trưởng làng Minh Anh để xin chỉ đạo.
   - Nhận diện nguy cơ bão hòa áp lực nước lỗ rỗng, giải câu đố chọn lối mòn sống đá gốc vòng qua tảng đá chắn đường.
4. **Chương 04: Chia Cắt & Cứu Bạn Học (`chapter04.html`)**
   - Xóm đồi phía dưới bị nước lũ chia cắt. Tìm thấy bạn Minh đang khóc đòi quay lại trường tìm bức tranh vẽ tặng mẹ.
   - Đàm thoại AI thuyết phục bạn: "Mẹ chỉ cần Minh an toàn trở về. Tranh có thể vẽ lại sau."
   - Gia cố thanh giằng và tổ chức đội hình qua cầu tre dã chiến an toàn.
5. **Chương 05: Đỉnh Đồi An Toàn (`chapter05.html`)**
   - Hội quân trọn vẹn đoàn 5 người tại Nhà văn hóa thôn trên đỉnh đồi cùng Trưởng làng Minh Anh.
   - Bàn giao tọa độ các điểm nguy hiểm trên đường đi.
   - Vượt qua Bài trắc nghiệm tổng hợp 5 chương và nhận **Chứng Nhận Chiến Sĩ Nhí An Toàn Phòng Chống Thiên Tai**.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Server

### 1. Cài đặt và cấu hình
```powershell
# Cài đặt dependencies (nếu chưa có)
npm install

# Kiểm tra file .env tại thư mục gốc:
# GEMINI_API_KEY=your_gemini_api_key
```

### 2. Khởi động server
```powershell
npm start
```
Truy cập: `http://localhost:4173`

---

## 🧪 Chạy Kiểm Thử Tự Động (Full Regression Test Suite)

Chạy toàn bộ bộ test kiểm thử tự động xuyên suốt từ Chương 1 đến Chương 5 và phân đoạn Sau Cơn Mưa:
```powershell
npm test
```
Tất cả các bài kiểm thử đều chạy trên nền Node.js test runner tiêu chuẩn với thời gian thực thi cực nhanh và độ tin cậy tuyệt đối.
