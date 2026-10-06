# Cơn Mưa Lớn — Hành trình Chương 01 → 02

## Chơi từ đầu tới cuối

1. Chạy `npm start`, mở **http://localhost:4173** và chọn **Bắt đầu câu chuyện**.
2. Hoàn thành Chương 01: khám phá lớp, quyết định về gấu bông, rời lớp và đi cùng cô Thảo.
3. Ở phần kết, chọn **Ra cổng trường · Chương 02**. Game vào thẳng cảnh cổng phụ; không yêu cầu bắt đầu lại ở màn hình tiêu đề Chương 02.
4. Khảo sát ba tuyến, giải tám câu đố khu vực, đi qua cầu Bắc và lên đường cao.
5. Nếu thoát giữa chừng, mở trang đầu và chọn **Tiếp tục hành trình · Chương 02**. Chương 01 vẫn có điểm lưu riêng để xem lại.

## Những cải tiến đã triển khai

| Điểm trước đây | Trải nghiệm mới |
| --- | --- |
| Hai chương chỉ nối bằng một link | Nút đi tiếp vào thẳng câu chuyện; nếu đúng hành trình đang lưu thì tiếp tục đúng vị trí |
| Kết Chương 01 mô tả một ngã rẽ và cầu thang chưa khớp cổng phụ | Kết ở cuối hành lang, phía đông bị chặn, Mạnh hướng dẫn ra cổng phụ để khảo sát đường làng |
| Chương 02 không biết gấu bông đã được lấy hay chưa | Duyên dùng dáng ôm gấu hoặc dáng không gấu đúng với lựa chọn Chương 01 |
| Hội thoại mở đầu giống nhau ở mọi lượt chơi | Duyên và Thảo nhớ lựa chọn về gấu; người đã đọc sơ đồ nhận ra tuyến đông cũ không còn dùng được |
| Sổ tay chỉ ghi dấu hiệu của Chương 02 | Thêm phần lựa chọn và thông tin nhóm mang từ Chương 01 |
| Cài đặt mỗi chương tách biệt | Âm thanh và giảm chuyển động được mang theo khi bắt đầu Chương 02 |
| Tải lại có thể mất vị trí vừa đi | Chương 02 lưu khi dừng và khoảng 1,5 giây một lần khi di chuyển |
| Chuyển map tức thời | Chuyển cảnh dịu hơn; tắt hiệu ứng khi chọn giảm chuyển động |
| Chơi lại Chương 01 có thể dẫn tới một save Chương 02 của lượt cũ | Mỗi lượt mới có mã hành trình; nút tiếp tục kiểm tra sự tương ứng trước khi đề xuất Chương 02 |

Chương 02 vẫn có thể chơi riêng qua `web/chapter02.html`. Khi không có Chương 01 đã hoàn thành, game không tự bịa các lựa chọn trước đó. Câu đố và đường đi vẫn hoạt động đầy đủ.

## Lưu và tính liên tục

- `ongdia.scene1.v1`: điểm lưu Chương 01, thêm `runId` cho lượt mới.
- `ongdia.chapter02.v2`: điểm lưu Chương 02, có `origin` chứa ảnh chụp lựa chọn lúc chuyển chương.
- `journey.js`: kiểm tra nguồn, mang lựa chọn/cài đặt sang và chọn đúng hành trình để tiếp tục.

Ngữ cảnh Chương 02 được lưu cùng tiến trình của nó, vì vậy khi tải lại không bị thay đổi theo một lượt Chương 01 khác. Save Chương 01 cũ không có `runId` vẫn đọc được bằng mã ngữ cảnh legacy. Dữ liệu hai chương không ghi đè lẫn nhau.

## Kiểm chứng

`npm test` kiểm tra model, đồ thị map, câu đố, font và việc mang lựa chọn xuyên chương.

`npm run test:browser` chơi các nhánh Chương 01, chuyển thật sang Chương 02 với/không với gấu bông, kiểm tra cài đặt được giữ, sổ tay và nút tiếp tục từ trang đầu.

`npm run test:chapter02` chơi đủ Chương 02 với ngữ cảnh mang từ Chương 01, kiểm tra tám câu đố, khóa đi tiếp, qua cầu hai chiều, lưu/tải lại, hover/touch và desktop/mobile.

Ảnh bàn giao:

- `output/qa/map/handoff-with-bear.png`
- `output/qa/map/handoff-without-bear.png`
- `output/qa/chapter02/`

Xem [triển khai Chương 01](Scene01-implementation.md) và [triển khai Chương 02](Chapter02-implementation.md).
