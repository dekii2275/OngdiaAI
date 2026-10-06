# Scene 1 — bản chơi trình duyệt

Nguồn yêu cầu: [Chapter01.md](Chapter01.md), **Cơn Mưa Lớn**. Kịch bản nguồn được giữ nguyên. Bản chơi là game phiêu lưu 2D theo cảnh, hoàn thành từ mở đầu tới tổng kết; Scene 2 hiện chỉ có đoạn giới thiệu như cuối kịch bản.

## Chạy

Nhấp đúp `start-game.cmd`. Hoặc trong thư mục project:

```powershell
npm start
```

Mở http://localhost:4173. Không cần cài package hay Unity. Server chỉ lắng nghe trên máy hiện tại. Dừng bằng Ctrl+C trong cửa sổ server.

Có thể mở `web/index.html` trực tiếp. Một số trình duyệt hạn chế font và localStorage khi dùng `file://`; nên chạy qua server để tải font và lưu tự động ổn định.

## Đối chiếu với kịch bản

| Phần kịch bản | Triển khai |
| --- | --- |
| 1–4: bối cảnh, nhân vật, state, thời gian an toàn | Lớp 4B, giờ 09:00; Bạn, Duyên, Thảo; Minh Anh/Mạnh qua bộ đàm; đủ các cờ chính; ba chấm, không có HP |
| 5–8: mở đầu, lớp học, loa, tutorial | Ngoại cảnh dùng ảnh làng, mưa động; chuyển vào lớp; hội thoại, sấm/chớp, loa cảnh báo; hướng dẫn WASD/E và chạm |
| 9–14: Duyên, tủ, khóa, lựa chọn | Hội thoại về gấu; khóa bốn hướng; hai lựa chọn A/B. A chỉ thử một lần rồi đi nếu sai |
| 15–19: khám phá, vật giả | Đồng hồ 09:00, tổ 3 trực nhật, bản đồ Việt Nam, thời khóa biểu. Kiểm tra vật giả không bật cờ manh mối |
| 20–21: sơ đồ, đọc tuyến | Poster gần cửa; bốn đoạn đọc theo thứ tự; nút bắt đầu từ 4B; chỉ hiện mũi tên đoạn đang chọn; bật ClueBoardFound và RouteUnderstood đúng lúc |
| 22–30: thử khóa, đúng/sai, nhắc manh mối | Nhập bốn hướng, xóa, nút giữa, xác nhận, rời đi. Cho phép đoán trước khi xem sơ đồ. Sai chỉ mất thời gian khi xác nhận đủ bốn hướng |
| 31–37: quyết định cuối, bỏ gấu, can thiệp an toàn | Khi còn một chấm, chọn thử cuối hoặc rời đi. Ba lần sai gọi cô Thảo và khóa puzzle; không chết/Game Over. Hội thoại khác nhau khi lấy gấu, để lại hoặc cần can thiệp |
| 38–42: nguyên tắc, bộ đàm, rời lớp | Xác nhận ba nguyên tắc; Minh Anh giới thiệu Mạnh; cảnh báo đường đông ngập; lời giải thích sơ đồ phải được cập nhật theo tình hình thực tế |
| 43–47: hành lang, hội thoại, ngã rẽ, hoàn thành | Đoạn đi theo cô; giới hạn khoảng cách; chặn quay lại; hội thoại theo nhánh gấu; ngã rẽ có dây cảnh báo; Mạnh tìm được lối khác; màn tổng kết |
| 48–49: đánh giá, thành tích | Bốn nhóm Quan sát/Suy luận/Bình tĩnh/An toàn; thành tích Nhà quan sát, Giải mã, An toàn trước tiên, Không thử đại |
| 50: hint | Bốn mức; mức 2 làm sáng nhẹ poster nếu chưa tìm; mức 3 mở sơ đồ; mức 4 cần lựa chọn xem gợi ý rõ hơn. Không hiện sẵn chuỗi đáp án |
| 51–52: diễn tiến môi trường, không đếm ngược | Mưa/ánh sáng diễn tiến theo thời gian chơi độc lập với đáp án; sai tăng nhạc căng thẳng và đối thoại về sự chậm trễ; hết thời gian phát còi và buộc đi |
| 53–57: lời giải, ý nghĩa, full flow, hook | Mã bốn hướng từ sơ đồ; lấy hay bỏ gấu đều hoàn thành; kết thúc bằng preview “Con đường bị chặn” |

## Hình ảnh và âm thanh

- Năm nhân vật có PNG toàn thân và chân dung được vẽ mới riêng trong `web/assets/characters/`. Game tải ảnh trong suốt trực tiếp, không cắt atlas hoặc xóa nền giấy. Minh Anh và Mạnh dùng chân dung qua bộ đàm theo kịch bản; ảnh toàn thân đã sẵn cho các scene tiếp theo.
- Bạn có hai dáng bước riêng; Duyên có thêm dáng ôm gấu khi mở tủ. Khai báo nhân vật trong `web/js/characters.js`, prompt tạo ảnh trong [character-assets.md](character-assets.md).
- Font Be Vietnam Pro và Lora có bộ ký tự tiếng Việt đầy đủ, được lưu cục bộ ở `web/assets/fonts/` kèm giấy phép OFL. `web/typography.css` thống nhất font và giãn dòng, bao gồm chữ trong SVG.
- `map/background + nhà.png` là ngoại cảnh làng/trường ở đoạn mở đầu.
- Nền mới: `web/assets/classroom.png` và `web/assets/hallway.png`, tạo bằng công cụ ImageGen tích hợp. Prompt gốc lưu ở [asset-prompts.md](asset-prompts.md).
- Các poster, sơ đồ và khóa là HTML/SVG để chữ luôn đọc được và các đoạn có thể bấm/chạm.
- Sơ đồ sơ tán mới dùng toàn bộ `map/background + nhà.png`: cổng trường → đầu cầu → bờ bên kia → đường lên núi → sân tập kết. Bốn chặng chính được nối theo đường trong tranh, có bốn điểm vàng, nhãn địa điểm và la bàn. Người chơi bấm tuyến, điểm nối hoặc các nút chặng; chỉ hiện hướng của chặng đang đọc. Có phóng to 100–300%, kéo bản đồ và xem toàn cảnh. Bản đồ mở rộng theo màn hình; trên điện thoại phần đọc tuyến nằm bên dưới.
- Xem bản đồ độc lập ở `web/evacuation-map.html`. Mật mã và cờ câu chuyện được giữ nguyên; bốn hướng là hướng chính của bốn chặng trên bản đồ, các đường cong mô tả đường làng thực tế trong tranh. Tọa độ theo ảnh 1536×1024 nằm trong `evacuation-map.js`; không sửa tranh nguồn.
- Mưa, nhạc nền, sấm, bộ đàm, âm khóa và còi được tổng hợp bằng Web Audio, không tải âm thanh bên ngoài. Hội thoại là chữ, chưa có lồng tiếng.
- Cutscene là chuyển cảnh, lời dẫn, chân dung và hiệu ứng 2D; chuyển động nhân vật là di chuyển sprite với nhịp bước nhẹ.

## Chỉnh sửa trải nghiệm khám phá

- Đồ vật hòa vào tranh nền: chữ và giấy cũ được thu nhỏ, giảm độ sáng; không có dấu chấm than hoặc đèn gợi ý trên tủ khi chưa mở.
- Rê chuột chỉ hiện “Quan sát” hoặc “Nói chuyện”. Tên đồ vật xuất hiện sau khi đã kiểm tra; không tự hiện tên vật từ xa chỉ vì đứng cùng trục ngang.
- Bấm đồ vật để nhân vật đi tới vị trí đứng phù hợp rồi mới tương tác. Bấm vào sàn để đi; WASD có thể ngắt đường đi đang chọn.
- `navigation.js` giới hạn sàn trống theo phối cảnh, tìm đường quanh góc bàn và chân nhân vật; WASD dừng/trượt ở vật cản.
- Sprite bước đi sử dụng các ảnh dáng bước độc lập. Nhân vật nhỏ hơn khi đi sâu vào phòng, có bóng chân, sắp thứ tự theo độ sâu và bị bàn phía trước che đúng lớp.
- Duyên đứng tại vị trí trong câu chuyện, đi tới tủ bằng chuyển động mượt. Ở hành lang, cô Thảo dẫn trước, bạn đi theo và Duyên theo phía sau.
- Màn chơi giữ tỷ lệ tranh gốc 3:2 trên máy tính và camera cuộn mượt trên điện thoại. Các ô nhiệm vụ và thời gian đã thu gọn.

## Muốn sửa gì, mở file nào?

| Thay đổi | File |
| --- | --- |
| Lời thoại, lời dẫn, tên các đoạn | `web/js/story.js` |
| Các cờ, số lần thử, mã khóa, thành tích | `web/js/model.js` |
| Điểm bấm, vị trí nhân vật, bản đồ, hint, kết nối các đoạn | `web/js/game.js` |
| Tuyến trên bản đồ làng, điểm nối và nhãn địa điểm | `web/js/evacuation-map.js` |
| Bố cục bản đồ, màu tuyến, phóng to và điện thoại | `web/evacuation-map.css` |
| Vùng sàn đi được, va chạm, tìm đường | `web/js/navigation.js` |
| Màu, kích thước, bố cục, giao diện điện thoại | `web/styles.css` |
| Font tiếng Việt và giãn dòng | `web/typography.css` |
| Ảnh và điểm đặt chân của từng nhân vật | `web/js/characters.js`, `web/assets/characters/` |
| Nhạc/âm thanh tổng hợp | `web/js/audio.js` |
| Nền lớp học/hành lang | `web/assets/` |

Mã khóa khai báo trong `SceneModel.CODE`; nếu sửa mã, cũng phải sửa các hướng chính trong `SceneEvacuationMap.segments` và đường vẽ cho khớp.

## Lưu tiến trình

localStorage key: `ongdia.scene1.v1`. Lưu cờ câu chuyện, lượt thử, bốn hướng đang nhập, tiến trình đọc sơ đồ, hội thoại và chỉ số dòng, vị trí nhân vật, tiến trình hành lang, cài đặt. Tải lại giữa lúc nhập mã có thể tiếp tục từ mã đang nhập. Chơi lại sẽ thay thế bản lưu hiện tại.

## Kiểm tra

```powershell
npm test
```

Mười hai kiểm tra: các nhánh câu chuyện, tải lại mã nhập dở, dữ liệu lưu không hợp lệ, giới hạn sàn, tìm đường quanh góc bàn, tránh chân nhân vật, đủ bộ PNG độc lập và đầy đủ dấu tiếng Việt trong cả hai font.

Khi server đang chạy, máy có Chrome:

```powershell
npm run test:browser
```

Browser QA dùng Chrome headless trong hồ sơ thử riêng ở `tmp/`, không dùng hồ sơ cá nhân. Có thể đặt `CHROME_PATH` nếu Chrome ở đường dẫn khác và `GAME_URL` nếu server dùng cổng khác.

Đã kiểm tra thực tế toàn luồng: mở tủ bằng bàn phím, bỏ gấu ở một chấm, sai ba lần, lựa chọn an toàn ban đầu chỉ thử một lần, lưu/tải lại giữa mã, vật giả, desktop 1440×1050 và điện thoại 390×844. Ảnh chụp lưu trong `output/qa/`.

Bản kiểm tra sau chỉnh giao diện thêm click thật vào NPC (không nhảy vị trí hoặc mở hội thoại trước khi tới), WASD dừng tại bàn và ảnh dáng bước. Ảnh mới lưu ở `output/qa/refined/`.

Bản cập nhật nhân vật và font kiểm tra thêm 13 PNG với góc ảnh thực sự trong suốt, cả năm chân dung hội thoại, font custom thực tế được Chrome sử dụng và MIME TTF. Ảnh mới ở `output/qa/characters/`; trang xem bộ nhân vật là `web/characters.html`.
