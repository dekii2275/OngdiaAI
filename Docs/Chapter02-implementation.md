# Chương 02 — Ba con đường

Màn chơi 2D cốt truyện trên trình duyệt, triển khai từ [Chapter02.md](Chapter02.md). Mỹ thuật theo hướng điện ảnh: làng miền núi trong mưa, sắc xanh xám, ánh đèn vàng, giao diện tối và typography tiếng Việt local. Đây là chương chơi hoàn chỉnh trong nền tảng web hiện tại; chưa phải game 3D hoặc bản sản xuất AAA thương mại.

## Chạy màn chơi

Chạy `npm start`, mở **http://localhost:4173/web/chapter02.html**. Có thể vào từ màn hình đầu Chương 01 hoặc nút tiếp tục ở phần kết Chương 01. Hai chương lưu tiến trình riêng, không ghi đè nhau.

| Điều khiển | Hành động |
| --- | --- |
| WASD / mũi tên | Đi trong vùng quan sát của cảnh |
| Bấm dấu hiệu / điểm nối | Nhân vật đi tới vị trí quan sát rồi tương tác |
| E | Tương tác điểm gần nhất |
| Enter / Space | Đọc tiếp hội thoại |
| M / J | Bản đồ / sổ tay |
| Giữ Space hoặc giữ nút | Theo nhóm qua cầu phía Bắc |
| Esc | Đóng bảng hoặc mở cài đặt |

Điện thoại có nút di chuyển và tương tác. Bản đồ trong bảng có thể kéo ngang ở màn hình hẹp. Cài đặt hỗ trợ giảm chuyển động; game cũng tôn trọng thiết lập giảm chuyển động của hệ điều hành.

## Địa lý và các điểm nối

```text
Cổng trường ↔ Ngã ba ↔ Đường chân đồi (A)
                  ↕
              Cầu treo (B)
                  ↕ qua ngã ba
              Đường Bắc (C) ↔ Cầu Bắc ↔ Đường cao ↔ Sườn điểm tập kết
```

Ngã ba nối trực tiếp tới cả A, B và C. A và B kết thúc tại khu quan sát, không có đường tắt tới điểm tập kết. Người chơi có thể khảo sát C trước rồi quay về khảo sát A/B; không bắt buộc thứ tự. Mọi kết nối đều có chiều quay lại. Qua cầu Bắc theo cả nhóm ở cả hai chiều.

| ID | Khu vực | Nền riêng | Nội dung |
| --- | --- | --- | --- |
| `gate` | Cổng trường phía sau | `gate.png` | Mở đầu, bộ đàm cảnh báo đường đông |
| `junction` | Ngã ba trong mưa | `junction.png` | Ba tuyến, khoảng cách 450 / 200 / 650 m |
| `hill` | Đường men sườn đồi | `hill.png` | Đá rơi, cây nghiêng, nước rỉ, vết nứt |
| `suspension` | Bờ cầu treo | `suspension.png` | Nước xiết, vật trôi, mực nước cao |
| `north` | Đường phía Bắc | `road.png` | Mặt đường, khoảng cách với đồi, biển, Mạnh |
| `concrete` | Bờ gần cầu Bắc | `north.png` | Mặt cầu, mực nước, dòng chảy quanh trụ |
| `highroad` | Bờ xa và đường cao | `highroad.png` | Đi cùng nhóm; có điểm nối quay lại cầu |
| `refuge` | Sườn đồi điểm tập kết | `refuge.png` | Hồi tưởng, radio và cliffhanger |

Khoảng cách trên biển là khoảng cách trong câu chuyện, không phải tỷ lệ pixel hay quãng đường thực tế của sprite. Di chuyển trong từng cảnh giới hạn ở vùng quan sát tiền cảnh; các đoạn đường dài được nén qua chuyển cảnh.

## Tiến trình và điều kiện

### Mũi tên và câu đố mở đường

Điểm chuyển cảnh dùng mũi tên tròn. Rê chuột hoặc đưa focus bằng bàn phím lên mũi tên sẽ hiện tên map đến và trạng thái mở đường. Trên điện thoại, chạm lần đầu để hiện nơi đến, chạm lần hai để di chuyển. Mũi tên nét đứt biểu thị đường còn khóa; bấm sẽ mở câu đố hoặc cho biết manh mối còn thiếu.

| Map | Câu đố | Điều kiện mở đường |
| --- | --- | --- |
| Cổng trường | Xếp ba chỉ dẫn bộ đàm | Kiểm tra nhóm → xác nhận đường đông bị ngập → đi cùng cô tới ngã ba |
| Ngã ba | Ghép khoảng cách với ba tuyến | A: 450 m, B: 200 m, C: 650 m; mở cả ba nhánh |
| Đường đồi | Ghép dấu hiệu để đánh giá địa hình | Quan sát đủ bốn dấu hiệu, chọn lý do tránh sườn bất ổn |
| Cầu treo | Suy luận từ nước và kết cấu | Quan sát đủ ba dấu hiệu, tránh tuyến vì tác động hiện tại của nước/vật trôi |
| Đường Bắc | Ghép quan sát với ý nghĩa | Đủ ba quan sát, trao đổi với Mạnh, ghép đúng ba quan hệ |
| Cầu Bắc | Sắp đội hình qua cầu | Quan sát đủ ba điểm, có Mạnh; đội hình Mạnh → Thảo → Bạn → Duyên |
| Đường cao | Nối các mốc chỉ đường | Nghe chỉ dẫn tại mốc: cọc sơ tán → đường cao → mái đèn vàng; bỏ lối xuống làng |
| Sườn điểm tập kết | Hồi tưởng ba quyết định | Giải đúng ba câu hỏi để mở đoạn kết và hoàn thành chương |

Lời giải được lưu riêng theo map trong `solved`. Câu đố có gợi ý, làm lại và phản hồi khi sai. Không trừ tiến trình. Đường quay lại không bị khóa bởi câu đố; A/B là nhánh quan sát, hai nhận định của chúng là điều kiện đi tiếp qua cầu Bắc. Save từ bản trước được chuyển sang trạng thái câu đố tương ứng với hành trình đã hoàn thành.

1. Nhóm rời cổng trường, nhận hướng dẫn không đi qua nước chảy.
2. Người chơi khảo sát A/B/C theo thứ tự bất kỳ. Dấu hiệu được lưu vào sổ tay theo ID.
3. Tuyến A cần đủ bốn dấu hiệu; tuyến B cần đủ ba dấu hiệu để mở đánh giá. Nhận định đúng dựa trên tổ hợp dấu hiệu hiện tại.
4. Ở tuyến C, kiểm tra ba dấu hiệu và trao đổi với bác Mạnh.
5. Kiểm tra đủ ba điểm cầu Bắc và giải câu đố đội hình. Chỉ mở đoạn qua cầu sau khi đủ 13 dấu hiệu, đánh giá A/B và xác nhận của Mạnh.
6. Giữ điều khiển để đi theo nhóm qua cầu. Tiến độ dựa trên thời gian, không phụ thuộc tần số màn hình.
7. Theo đường cao, hồi tưởng ba quyết định và nghe thông báo có biến ở dưới làng. Kết chương trước phần sự cố tiếp theo.

Không có đếm ngược, chết nhân vật hoặc mất manh mối khi quay lại. Bảng đánh giá cho phản hồi và cho thử lại; phản hồi phân biệt tình trạng hiện tại với kết luận chung về mọi cây cầu hoặc mọi đường cao.

## Những chỗ đã chỉnh từ kịch bản

| Điểm trong bản gốc | Cách triển khai |
| --- | --- |
| Cô Thảo cho nhóm tiến thêm vào sườn đã có nhiều dấu hiệu bất ổn | Chặn ở khu quan sát; tiếng đất đá và phản ứng NPC xác nhận nguy cơ từ khoảng cách an toàn |
| Cho học sinh thử đi 3–4 m lên cầu đang chịu tác động của lũ | Chặn ngay trên bờ; vẫn giữ lựa chọn sai và hội thoại giải thích |
| “Quan sát thêm” chưa có điều kiện rõ | ID dấu hiệu và khóa đánh giá bảo đảm người chơi đã xem đủ thông tin |
| Tuyến C có thể được hiểu là an toàn vì cầu bê tông | Mạnh xác nhận điều kiện hiện tại; bắt buộc ba kiểm tra, tránh kết luận từ vật liệu |
| Các đoạn trình bày theo thứ tự tuyến | Đồ thị địa điểm cho phép đi cả ba tuyến theo thứ tự bất kỳ |
| Chương kết nhưng mục tiêu chưa tới hẳn bên trong điểm tập kết | Kết ở đường cao, sườn điểm tập kết; cliffhanger vẫn dành cho chương tiếp theo |

## Mỹ thuật và font

Tám nền được tạo bằng công cụ ImageGen tích hợp, lưu trong `web/assets/chapter02/`. Prompt được ghi ở [Chapter02-art-prompts.md](Chapter02-art-prompts.md). Không có chữ sinh trong ảnh; nhãn, biển khoảng cách và hội thoại do HTML render để tránh lỗi dấu tiếng Việt.

Nhân vật dùng PNG trong suốt hiện có. Mưa là canvas, âm mưa/bộ đàm/nhạc nền được tổng hợp bằng Web Audio. Hai họ font Be Vietnam Pro và Lora dùng file local có đủ bộ ký tự tiếng Việt, không phụ thuộc CDN.

## Mã nguồn và kiểm chứng

| File | Trách nhiệm |
| --- | --- |
| `web/chapter02.html` | Khung màn chơi, HUD, hội thoại và bảng tương tác |
| `web/chapter02.css` | Mỹ thuật, responsive, thứ tự lớp và giảm chuyển động |
| `web/js/chapter02-data.js` | Đồ thị tám cảnh, manh mối, khóa qua cầu, kiểm tra dữ liệu lưu |
| `web/js/chapter02-puzzles.js` | Câu đố thứ tự/ghép cặp và kiểm tra lời giải |
| `web/js/chapter02.js` | Di chuyển, tương tác, hội thoại, lưu, bản đồ, sổ tay và kết chương |
| `tests/chapter02.test.cjs` | Liên thông hai chiều, khóa cầu, dữ liệu lưu và thứ tự khám phá |
| `tests/chapter02-browser.cjs` | Chơi toàn bộ hành trình trên Chrome headless, ảnh desktop/mobile |

Chạy `npm test` cho kiểm thử logic của cả hai chương. Chạy `npm run test:chapter02` cho kiểm tra hành trình trên trình duyệt; cần Chrome cài sẵn và server đang chạy. Bộ kiểm tra dùng profile riêng, không sử dụng dữ liệu trình duyệt cá nhân.

Ảnh kiểm tra nằm tại `output/qa/chapter02/`: màn hình đầu, tám khu vực chính, sổ tay, bản đồ, kết quả và giao diện điện thoại. Kiểm tra gồm lỗi JavaScript, ảnh/font HTTP, font tiếng Việt, tràn ngang, giới hạn bảng trên mobile, lưu/tải lại, lựa chọn nguy hiểm và qua cầu hai chiều.
