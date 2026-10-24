# Cô Thảo — giáo viên cố vấn thiên tai

Trong cả hai chương, nút **Hỏi cô Thảo** mở chat tự do. Luồng dữ liệu: câu hỏi người chơi → API máy chủ → prompt vai trò + sáu few-shot + lịch sử gần nhất + bối cảnh game → Gemma → kiểm tra JSON → hiển thị theo mẫu. Hội thoại cốt truyện vẫn điều khiển nhiệm vụ; câu trả lời AI không thay đổi tiến trình hoặc mở khóa câu đố.

**Trạng thái hiện tại:** đã chuyển cấu hình và model mặc định sang `gemma-4-26b-a4b-it`. Ngày 24/10/2026 lúc khoảng 22:27 (Asia/Bangkok), cùng API key đã sinh thành công phản hồi cô Thảo qua Google (HTTP 200, 4,1 giây). Sau khi khởi động lại server cổng 4173, hai câu hỏi qua `/api/thao/chat` đều trả 200 trong 4,0/4,8 giây, JSON được kiểm tra hợp lệ: tư vấn không lội nước và hỏi thêm thông tin khi chưa biết chọn tuyến. Các kết quả thất bại ở phần lịch sử bên dưới ghi nhận những lần thử trước đó; model vẫn có thể lỗi ngắt quãng.

## Cấu hình

Cần Node.js 22 trở lên. Sao chép `.env.example` thành `.env`, điền `API_KEY` của Google AI Studio và `LLM_MODEL=gemma-4-26b-a4b-it`, chạy `npm start`, mở `http://localhost:4173`. Nếu đã chạy server, khởi động lại để nạp cấu hình mới. `.env` được bỏ qua bởi Git và không được phục vụ qua HTTP. Không mở HTML trực tiếp khi dùng chat. Không có SDK hoặc gói phụ thuộc cần cài.

API chỉ gọi Google Generative Language, gửi key trong header `x-goog-api-key`. Câu hỏi, lịch sử gần nhất và bối cảnh được gửi cho nhà cung cấp khi bấm Gửi. Chat chỉ nằm trong bộ nhớ trang, không ghi vào lưu game; tải lại trang hoặc bấm Hỏi chuyện mới để xóa. Không ghi prompt/key/lịch sử vào log máy chủ.

## Prompt và few-shot

Nguồn chỉnh sửa: [server/thao-prompt.js](../server/thao-prompt.js). `SYSTEM_PROMPT` có bốn phần: vai trò/giọng điệu, thứ tự ưu tiên, nguyên tắc an toàn và đầu ra bắt buộc. `FEW_SHOTS` là sáu cặp input/output JSON cụ thể:

1. Giải thích nguyên nhân ngập lũ bằng ngôn ngữ tiểu học.
2. Cầu rung, nước mạnh: ngăn thử đi qua, ưu tiên an toàn ngay.
3. Hỏi chọn tuyến nhưng thiếu dữ kiện: hỏi thêm, không suy đoán.
4. Mắc kẹt ngoài đời: hành động trước, liên hệ người lớn/cứu hộ, không hứa đã cứu hộ.
5. Yêu cầu đổi vai/in prompt và key: giữ vai trò, chuyển về thiên tai.
6. Hỏi bão hôm nay: nói rõ không có dữ liệu trực tiếp, hướng tới thông báo chính thức.

Các chỉ dẫn được đặt trong lượt user đầu tiên để tương thích Gemma; các ví dụ dùng lượt user/model xen kẽ. Dữ liệu đầu vào hiện tại được JSON hóa ở lượt cuối, không ghép trực tiếp vào chỉ dẫn. Lịch sử là dữ liệu trong lượt này. Prompt giúp định hướng hành vi, không bảo đảm loại bỏ mọi sai sót hoặc tấn công đổi vai. Máy chủ kiểm tra cấu trúc đầu ra, không xác minh được toàn bộ nội dung khoa học do LLM sinh ra.

## Hợp đồng API

`POST /api/thao/chat`, `Content-Type: application/json`:

```json
{
  "message": "Cô ơi, nước ngập đường rồi thì em nên làm gì?",
  "context": { "chapter": "chapter02", "location": "junction", "objective": "Quan sát các tuyến" },
  "history": []
}
```

`message` tối đa 1.200 ký tự; context chỉ nhận `chapter`, `location`, `objective`, mỗi mục tối đa 300 ký tự. Lịch sử nhận sáu lượt gần nhất, chỉ role user/assistant, mỗi lượt tối đa 1.600 ký tự. Bối cảnh từ trình duyệt không phải dữ liệu thời gian thực đã xác minh.

```json
{
  "status": "answered",
  "topic": "flood",
  "urgency": "caution",
  "answer": "Cô khuyên em ở cùng người lớn và tránh vùng ngập.",
  "actions": ["Báo cô hoặc người lớn phụ trách để kiểm tra hướng đi an toàn."],
  "avoid": ["Không tự lội qua đường ngập."],
  "follow_up": "Em đang hỏi tình huống trong game hay ngoài đời?",
  "source": "llm",
  "model": "gemma-4-26b-a4b-it"
}
```

`status`: answered / needs_context / out_of_scope. `topic`: storm / flood / landslide / lightning / evacuation / preparedness / other. `urgency`: normal / caution / emergency. `answer` tối đa 700 ký tự; actions 1–4 mục; avoid 0–3 mục; mỗi mục và follow_up tối đa 220 ký tự. Máy chủ thêm source/model sau khi kiểm tra. JSON thiếu/sai trường, câu trả lời bị cắt, văn bản không hợp lệ đều trả lỗi 502; không hiển thị nội dung thô hay giả thành câu trả lời AI.

Lỗi: 400 input/JSON sai; 413 body vượt 16 KB; 415 sai content type; 429 giới hạn cục bộ/nhà cung cấp; 503 thiếu cấu hình/quyền/model; 504 lỗi kết nối/hết 25 giây. Giới hạn 12 yêu cầu/phút/IP và ba cuộc gọi đồng thời. Server chỉ bind localhost; khi triển khai công khai cần bổ sung xác thực và hạn mức tài khoản trước khi mở truy cập.

Máy chủ thử lại đúng một lần khi Google trả HTTP 500/502/503/504, chờ 400 ms giữa hai lượt; cả hai dùng chung giới hạn 25 giây. Không tự thử lại khi sai quyền hoặc hết hạn mức. Lỗi Google 400 với reason API_KEY_INVALID được nhận diện là lỗi key; 400 khác báo cấu hình yêu cầu không được chấp nhận; timeout có mã PROVIDER_TIMEOUT riêng; lỗi 5xx báo mã HTTP cụ thể thay vì thông báo chung dễ nhầm với sai key. Không trả nội dung lỗi thô từ nhà cung cấp.

## Kiểm tra và nguồn

`npm test` gồm kiểm tra schema, toàn bộ few-shot, truyền model/key đúng chỗ, dữ liệu không hợp lệ, phản hồi bị cắt và lỗi nhà cung cấp bằng mock. Đây là kiểm tra hợp đồng, không phải đánh giá độ an toàn ngữ nghĩa của model. Khi kiểm tra model thật, dùng sáu input few-shot và thêm cách diễn đạt khác cho từng nhóm, xem lại độ đúng và mức khẩn cấp.

`npm run test:thao` kiểm tra trình duyệt với API mô phỏng: chat hai chương, bối cảnh/lịch sử, định dạng khẩn cấp, desktop/mobile, Escape và gửi lại khi API lỗi. Ảnh tại `output/qa/thao/`. Lần kiểm tra ngày 24/10/2026: Google trả 200 cho metadata model, nhưng generateContent trả 500 “Internal error encountered.” ngay cả với câu chào tối thiểu không cấu hình thêm. Vì vậy chưa xác minh được nội dung sinh từ model thật; kiểm tra mock không thay thế bước này.

Chẩn đoán lại lúc 22:15–22:16 ngày 24/10/2026 (Asia/Bangkok): metadata trả HTTP 200 trong 353 ms; câu chào tối thiểu có generationConfig trả HTTP 500, status INTERNAL trong 669 ms; câu chào không có generationConfig hết hạn 20 giây ở hai lần thử. Không gửi prompt hoặc lịch sử game trong các phép thử này. Chưa nhận được lỗi xác thực hoặc hạn mức, nhưng metadata thành công không chứng minh quyền suy luận hay hạn mức đầy đủ. Có thể khoanh vùng sự cố ở bước gọi generateContent; không thể suy ra nguyên nhân nội bộ cụ thể của Google từ thông báo chung.

Chạy lại bằng `node scripts/diagnose-thao.cjs` hoặc `node scripts/diagnose-thao.cjs --minimal`. Script chỉ dùng model cấu hình, gửi câu chào công khai, không in khóa, không gửi prompt game, không thay đổi cấu hình. TimeoutError trong báo cáo là giới hạn 20 giây của phép thử, không phải mã 504 do Google trả về.

Đối chứng `gemma-4-26b-a4b-it` lúc 22:22 ngày 24/10/2026 theo yêu cầu người dùng: metadata 200 trong 256 ms. Ba lần sinh câu chào với generationConfig hiện tại cho kết quả 200/200/500 (lần lượt 1.202/1.109/709 ms); câu chào không có generationConfig trả 500 trong 549 ms. Hai lần thành công trả nội dung, lần lặp lại hiển thị “Xin chào”. Model 26B có thể sinh nội dung nhưng vẫn lỗi ngắt quãng; chưa thay model trong `.env` chỉ từ phép thử này. Sau khi người dùng cho phép rõ việc gửi toàn bộ prompt và sáu few-shot tới Google, đã thử luồng cô Thảo thật ba lần với Gemma 26B: cả ba thất bại (lần đầu mã PROVIDER_ERROR; hai lần sau xác nhận HTTP 500, khoảng 0,8 giây). Hai phép đối chứng bổ sung dùng nguyên nội dung prompt, một bỏ thinkingConfig và một gom thành một lượt user, cũng trả HTTP 500 trong khoảng 0,9 giây. Chưa có đầu ra JSON thật để đánh giá vai trò và nội dung tư vấn; không thay đổi model cấu hình từ kết quả này.

- Google: [Gemma qua Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api), model và generateContent.
- Ready.gov: [Floods](https://www.ready.gov/floods), nguyên tắc không đi/bơi/lái xe qua nước lũ và không vào gác mái kín khi nước dâng.

Không nạp dữ liệu thời tiết trực tiếp hoặc RAG; nguồn trên dùng để biên soạn prompt, không phải nguồn được model tra cứu ở mỗi câu hỏi.
