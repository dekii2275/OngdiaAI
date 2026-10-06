# FULL GAME SCRIPT
## SCENE 1 — CƠN MƯA LỚN

---

# 1. THÔNG TIN SCENE

**Tên Scene:** Cơn Mưa Lớn  
**Thời gian:** 09:00 sáng  
**Địa điểm:** Trường học trong làng — Lớp học và hành lang  
**Thời lượng mục tiêu:** 5–7 phút  
**Thể loại gameplay:** Narrative Adventure + Environmental Puzzle  
**Mức độ:** Tutorial / Easy

---

# 2. NHÂN VẬT

## [Bạn]

Nhân vật chính.

- Nam học sinh.
- Người chơi điều khiển.
- Bình tĩnh, quan sát tốt.
- Không phải “anh hùng cứu mọi người”, mà là một học sinh biết phối hợp với bạn bè và người lớn.

---

## [Duyên]

Bạn nữ cùng lớp.

- Thân thiện.
- Có phần tình cảm và dễ lo lắng.
- Gắn bó với con gấu bông của mình.
- Qua Scene 1 bắt đầu học được rằng trong tình huống khẩn cấp, an toàn quan trọng hơn đồ vật.

---

## [Thảo]

Cô giáo.

- Bình tĩnh.
- Nói ngắn gọn, rõ ràng.
- Là người chịu trách nhiệm dẫn học sinh sơ tán.

---

## [Minh Anh]

Trưởng làng.

- Nam lớn tuổi.
- Xuất hiện trước tiên qua bộ đàm.
- Điều phối tình hình từ bên ngoài.

---

## [Mạnh]

Bác công nhân.

- Nam trung niên.
- Chưa xuất hiện trực tiếp trong Scene 1.
- Được Minh Anh nhắc tới.
- Sẽ xuất hiện trong Scene 2.

---

# 3. GAME STATE

Các biến chính:

```text
SafeTime = 3

LockerOpened = false
EvacuatedWithoutBear = false

ClueBoardFound = false
RouteUnderstood = false

LockerAttempt = 0

Scene1Completed = false
```

---

# 4. HỆ THỐNG “THỜI GIAN AN TOÀN”

Không gọi là HP hay máu.

UI hiển thị:

# THỜI GIAN AN TOÀN

● ● ●

Mỗi lần nhập sai mật mã:

```text
SafeTime -= 1
```

Ý nghĩa:

Người chơi đã dành thêm thời gian tại chỗ thay vì chuẩn bị sơ tán.

Không diễn đạt rằng việc nhập sai khiến lũ mạnh lên.

Mưa và nước dâng là diễn biến đang xảy ra độc lập theo thời gian.

---

# 5. OPENING CUTSCENE

## SHOT 01 — BÊN NGOÀI TRƯỜNG

Màn hình đen.

Tiếng mưa bắt đầu vang lên.

Nhỏ.

Sau đó lớn dần.

**SFX**

> Mưa lớn.

> Gió.

> Sấm xa.

Fade in.

Camera toàn cảnh trường học.

Trời âm u.

Mưa phủ kín sân trường.

Nước mưa chảy mạnh theo rãnh thoát nước.

Một vài cành cây lay động trong gió.

Text xuất hiện:

# 09:00

## GIỜ RA CHƠI

Camera từ từ tiến về phía cửa sổ một lớp học.

---

# 6. TRONG LỚP

Camera chuyển vào lớp.

Một vài học sinh đang đi ra hành lang.

Một nhóm khác đang thu dọn đồ.

[Bạn] đứng bên bàn.

[Duyên] đang nhìn ra cửa sổ.

Gameplay chưa bắt đầu.

Duyên:

> Mưa vẫn chưa nhỏ đi nhỉ...

Bạn:

> Ừ.

Bạn nhìn ra ngoài.

> Từ sáng tới giờ vẫn mưa.

Một tia chớp lóe lên.

**SFX**

> RẦM!

Duyên hơi giật mình.

> Ui!

Bạn cười nhẹ.

> Sợ à?

Duyên:

> Không!

Dừng một nhịp.

> ...Chỉ hơi giật mình thôi.

---

# 7. LOA THÔNG BÁO

Đột nhiên loa trường vang lên.

**SFX**

> Rè...

Các học sinh ngừng nói chuyện.

Giọng phát thanh:

> "Thông báo khẩn cấp."

Nhạc nền dừng.

> "Do mưa lớn kéo dài, khu vực gần trường đang có nguy cơ xảy ra lũ quét."

Camera chuyển sang cửa sổ.

Mưa vẫn rất lớn.

Loa:

> "Tất cả học sinh giữ bình tĩnh."

> "Chuẩn bị di chuyển tới điểm tập kết theo hướng dẫn của giáo viên."

> "Không tự ý rời khỏi trường."

> "Không tách khỏi nhóm."

> "Không quay lại lấy đồ sau khi đã bắt đầu sơ tán."

Một nhịp.

> "Nhắc lại."

> "Tất cả học sinh chuẩn bị di chuyển tới điểm tập kết."

Loa tắt.

Không khí trong lớp im lặng.

Duyên nhìn [Bạn].

> Lũ quét sao...?

Bạn:

> Chắc cô Thảo sắp tới.

---

# 8. GAMEPLAY BẮT ĐẦU

UI xuất hiện.

# NHIỆM VỤ

**Chuẩn bị sơ tán cùng Duyên.**

Tutorial:

> WASD / Joystick — Di chuyển

> E / Chạm — Tương tác

Người chơi được quyền di chuyển trong phạm vi lớp học.

Duyên có icon:

**!**

---

# 9. TƯƠNG TÁC VỚI DUYÊN

Người chơi tới gần Duyên.

Nhấn tương tác.

Bạn:

> Duyên.

Duyên:

> Ừ?

Bạn:

> Mình ra cửa chờ cô Thảo đi.

Duyên:

> ...

Duyên quay lại nhìn về phía cuối lớp.

Bạn:

> Sao thế?

Duyên:

> Gấu của tớ.

Bạn:

> Gấu?

Duyên:

> Con gấu bông hôm qua tớ mang tới ấy.

> Tớ để nó trong tủ rồi.

Bạn:

> Vậy lấy nhanh đi.

Duyên chạy tới tủ.

Người chơi tự động đi theo.

---

# 10. TỦ CỦA DUYÊN

Duyên cầm tay nắm.

**SFX**

> Cạch.

Cô thử lần nữa.

> Cạch.

Duyên:

> Ơ...

Bạn:

> Sao vậy?

Duyên:

> Tớ khóa tủ mất rồi.

Bạn:

> Thì mở khóa đi.

Duyên:

> Nhưng...

Bạn:

> Nhưng gì?

Duyên quay sang.

> Tớ quên mật mã.

Bạn:

> ...

Duyên:

> Tớ nhớ hôm qua mình đổi mật mã.

> Vì tớ cứ quên mấy con số.

Bạn:

> Thế mật mã mới là gì?

Duyên nhìn chiếc khóa.

> Tớ chỉ nhớ...

> Nó liên quan tới một thứ trong lớp.

---

# 11. CAMERA PUZZLE REVEAL

Camera zoom vào khóa.

Không phải ổ khóa số.

Có năm nút:

```text
        ↑

    ←   ●   →

        ↓
```

Phía trên:

```text
○ ○ ○ ○
```

Bạn:

> Bốn hướng?

Duyên:

> Ừ...

Bạn:

> Cậu đặt mật mã kiểu này à?

Duyên:

> Chắc vậy...

Dừng một nhịp.

Duyên:

> Xin lỗi.

Bạn:

> Không sao.

> Tìm nhanh thôi.

---

# 12. QUYẾT ĐỊNH ĐẦU TIÊN

UI xuất hiện:

## BẠN NÊN LÀM GÌ?

### A
**"Để gấu lại, mình đi chờ cô."**

### B
**"Mình thử tìm mật mã thật nhanh."**

---

# 13. NHÁNH A — ƯU TIÊN RỜI ĐI

Nếu người chơi chọn A:

Bạn:

> Duyên.

> Nếu không mở được ngay thì để gấu lại đi.

Duyên nhìn tủ.

> Nhưng...

Bạn:

> Loa vừa bảo không được chậm trễ.

Duyên:

> ...

Cô nhìn tủ thêm một lần.

> Tớ biết.

Duyên bắt đầu bước về cửa.

Sau hai bước, cô quay lại.

> Khoan.

Bạn:

> Sao?

Duyên chỉ lên tường.

> Hôm qua lúc đổi mật mã...

> Tớ nhớ mình đang nhìn thứ gì đó trên tường.

Bạn nhìn theo.

Camera không highlight gì.

Bạn:

> Nếu tìm được ngay thì thử một lần.

> Không được thì mình đi.

Duyên:

> Ừ.

Puzzle bắt đầu.

---

# 14. NHÁNH B — TÌM MẬT MÃ

Nếu người chơi chọn B:

Bạn:

> Mình thử tìm nhanh.

> Nhưng khi cô Thảo tới thì phải đi ngay.

Duyên:

> Ừ!

Bạn:

> Không được quay lại nữa.

Duyên:

> Tớ hứa.

Puzzle bắt đầu.

---

# 15. PUZZLE MODE

UI:

# NHIỆM VỤ

**Tìm manh mối mở tủ của Duyên.**

Góc trên màn hình:

## THỜI GIAN AN TOÀN

● ● ●

Trong lớp có nhiều vật có thể tương tác.

Không phải vật nào cũng là manh mối.

---

# 16. VẬT TƯƠNG TÁC — ĐỒNG HỒ

Nếu player kiểm tra đồng hồ:

Camera zoom vào.

Đồng hồ chỉ:

**09:00**

Bạn:

> Chín giờ.

Một nhịp.

> Nhưng khóa đâu có số.

Camera trả lại gameplay.

Không đánh dấu là clue.

---

# 17. VẬT TƯƠNG TÁC — BẢNG TRỰC NHẬT

Player kiểm tra.

Trên bảng:

**HÔM NAY — TỔ 3**

Bạn:

> Hôm nay tổ 3 trực nhật.

> Không liên quan đến mấy nút hướng.

Return.

---

# 18. VẬT TƯƠNG TÁC — BẢN ĐỒ VIỆT NAM

Player kiểm tra.

Bạn:

> Bản đồ Việt Nam...

> Không có gì giống mật mã cả.

Return.

---

# 19. VẬT TƯƠNG TÁC — THỜI KHÓA BIỂU

Bạn:

> Toán...

> Tiếng Việt...

> Khoa học...

Duyên từ xa:

> Tớ chắc không lấy thời khóa biểu làm mật mã đâu.

Bạn:

> Ừ.

Return.

---

# 20. MANH MỐI CHÍNH — SƠ ĐỒ SƠ TÁN

Player tương tác với poster gần cửa.

Camera zoom.

Header:

# SƠ ĐỒ SƠ TÁN — LỚP 4B

Bên dưới là sơ đồ.

Ví dụ:

```text
                    ĐIỂM TẬP KẾT
                          ▲
                          │
                    ●─────●
                    │
              ●─────●
              │
              │
            [4B]
```

Đường sơ tán được đánh dấu rõ.

Bốn vị trí quan trọng có ký hiệu tròn màu vàng.

Player có thể rê/chạm từng điểm.

Bạn:

> Đây là đường từ lớp mình tới điểm tập kết.

Duyên bước tới.

> À...

Bạn:

> Sao?

Duyên:

> Tớ nhớ có nhìn cái này hôm qua.

Camera chuyển giữa poster và khóa tủ.

Bạn:

> Khóa của cậu có bốn ô.

> Sơ đồ cũng có bốn chỗ đổi hướng...

`ClueBoardFound = true`

---

# 21. MINI INTERACTION — ĐỌC TUYẾN

Player nhấn:

**BẮT ĐẦU TỪ LỚP 4B**

Điểm đầu sáng lên.

Game không tự điền đáp án.

Người chơi phải nhìn đường đi.

Tuyến hợp lệ:

### ↑ → ↑ →

Mỗi khi player click một đoạn trên sơ đồ:

Một mũi tên nhỏ xuất hiện.

Không ghi lại toàn bộ chuỗi cho người chơi.

Sau khi đi hết tuyến:

Bạn:

> Bốn hướng.

Duyên:

> Giống khóa tủ!

Bạn:

> Có thể đây chính là mật mã.

`RouteUnderstood = true`

UI:

# MANH MỐI ĐÃ TÌM THẤY

**Mật mã có liên quan tới tuyến sơ tán.**

Không hiển thị:

`↑ → ↑ →`

---

# 22. QUAY LẠI TỦ

Người chơi tương tác với tủ.

Camera zoom cận.

UI:

# KHÓA TỦ

```text
○ ○ ○ ○
```

```text
        ↑

    ←   ●   →

        ↓
```

Button phụ:

**XÓA**

**XÁC NHẬN**

**RỜI ĐI**

---

# 23. TRƯỜNG HỢP PLAYER CHƯA TÌM CLUE

Nếu player tới tủ trước khi xem sơ đồ:

Bạn:

> Mình chưa biết quy luật.

Duyên:

> Tớ chỉ nhớ lúc đổi mật mã...

> Hình như tớ đang nhìn thứ gì đó treo trên tường.

Player vẫn được phép nhập.

Điều này quan trọng:

Game không khóa cứng puzzle.

---

# 24. INPUT CORRECT

Mật mã:

# ↑ → ↑ →

Người chơi nhấn lần lượt.

Mỗi lần nhấn:

**SFX**

> Click.

UI:

```text
↑ ○ ○ ○
```

sau đó:

```text
↑ → ○ ○
```

sau đó:

```text
↑ → ↑ ○
```

sau đó:

```text
↑ → ↑ →
```

Player nhấn nút giữa.

Một nhịp im lặng.

**SFX**

> Beep.

Đèn chuyển xanh.

> CLICK!

Ổ khóa bật.

---

# 25. MỞ TỦ THÀNH CÔNG

Cánh tủ mở.

Bên trong:

- Một con gấu bông nhỏ.
- Một vài sách vở.
- Áo khoác.

Duyên:

> Gấu!

Cô nhanh chóng lấy gấu.

Ôm vào lòng.

> May quá...

Bạn:

> Đi thôi.

Duyên:

> Ừ.

`LockerOpened = true`

Chuyển đến phần:

**Cô Thảo xuất hiện.**

---

# 26. INPUT SAI LẦN 1

Nếu code không đúng:

Ví dụ:

```text
↑ → ↓ ←
```

Player nhấn xác nhận.

**SFX**

> Beep! Beep!

Đèn đỏ.

UI:

# CHƯA ĐÚNG

```text
SafeTime = 2
```

● ● ●

chuyển thành:

● ●

Không gian thay đổi nhẹ.

- Mưa lớn hơn.
- Một tiếng sấm.
- Ánh sáng tối hơn rất ít.

Duyên:

> Sai rồi...

Bạn:

> Đừng thử đại.

> Xem lại quy luật.

---

# 27. HINT 1

Sau lần sai đầu tiên:

Duyên:

> Tớ nhớ rồi một chút.

Bạn:

> Gì?

Duyên:

> Lúc đổi mật mã...

> Tớ đang nhìn thứ gì đó treo trên tường.

UI không highlight poster.

Gameplay tiếp tục.

---

# 28. PLAYER TƯƠNG TÁC POSTER SAU HINT

Nếu player xem sơ đồ:

Bạn:

> Thứ treo trên tường...

> Có thể là cái này.

Nếu `ClueBoardFound == false`:

Kích hoạt phần puzzle sơ đồ.

Nếu đã tìm rồi:

Bạn:

> Mình phải đọc đường từ lớp tới điểm tập kết.

---

# 29. INPUT SAI LẦN 2

Player nhập sai lần nữa.

**SFX**

> BEEP!

`SafeTime = 1`

UI:

●

Ngoài lớp có tiếng nước chảy mạnh hơn.

Camera hướng nhanh về cửa sổ.

Có thể thấy nước đang tràn mạnh qua rãnh ngoài sân.

Duyên:

> Nước nhiều hơn lúc nãy rồi.

Bạn nhìn ra ngoài.

> Mình không còn nhiều thời gian.

Nhạc tăng nhịp.

---

# 30. HINT 2

Duyên:

> Hình như mật mã không phải một hình...

> Mà là một đường đi.

Nếu player chưa phát hiện sơ đồ:

Poster bắt đầu có hiệu ứng ánh sáng rất nhẹ.

Không blink quá mạnh.

Nếu player đã nhìn thấy:

Bạn:

> Bắt đầu từ lớp 4B.

> Đi theo đường tới điểm tập kết...

---

# 31. LỰA CHỌN TRƯỚC LẦN CUỐI

UI xuất hiện:

# CHỈ CÒN ÍT THỜI GIAN

### A
**THỬ MỞ TỦ LẦN CUỐI**

### B
**BỎ LẠI GẤU VÀ ĐI**

---

# 32. NHÁNH B — BỎ LẠI GẤU

Nếu player chọn:

**BỎ LẠI GẤU VÀ ĐI**

Bạn:

> Duyên.

Duyên nhìn bạn.

> Mình phải đi rồi.

Duyên nhìn chiếc tủ.

Im lặng.

> ...

Bạn:

> Sau khi an toàn mình có thể nhờ người lớn quay lại.

Duyên:

> Nhưng Gấu...

Bạn:

> Gấu ở trong tủ.

> Cậu thì đang ở đây.

Duyên im lặng.

Sau đó gật đầu.

> Ừ.

Camera cận Duyên nhìn chiếc tủ một lần cuối.

> Mình đi.

`EvacuatedWithoutBear = true`

Không tính là thất bại.

Achievement:

# ƯU TIÊN AN TOÀN

**Bạn đã chọn rời đi thay vì tiếp tục mất thời gian vì đồ vật.**

Ngay sau đó:

Cô Thảo xuất hiện.

---

# 33. NHÁNH A — LẦN THỬ CUỐI

Nếu người chơi chọn:

**THỬ MỞ TỦ LẦN CUỐI**

Camera trở lại khóa.

Duyên:

> Đây là lần cuối thôi nhé.

Bạn:

> Ừ.

Nếu nhập:

**↑ → ↑ →**

→ thành công.

Nếu sai:

→ kích hoạt tình huống khẩn cấp.

---

# 34. NHẬP SAI LẦN 3

Player xác nhận mã sai.

**SFX**

> BEEP!

UI:

●

chuyển thành:

○

Một tiếng còi cảnh báo vang lên từ bên ngoài.

Duyên:

> !

Ngoài hành lang có tiếng người gọi nhau.

Loa:

> "Tất cả các lớp di chuyển ngay!"

Camera rung nhẹ.

Duyên:

> Mình phải đi!

Đúng lúc đó cô Thảo xuất hiện.

Không cho lũ tràn vào cuốn nhân vật.

---

# 35. CÔ THẢO XUẤT HIỆN — FAIL SAFE

Cô Thảo chạy vào.

> Hai em!

Duyên:

> Cô!

Thảo nhìn chiếc tủ.

> Bỏ lại đồ.

> Đi ngay với cô.

Duyên:

> Nhưng—

Thảo:

> Duyên.

Cô nói dứt khoát nhưng không quát.

> Đồ vật có thể lấy lại sau.

> Bây giờ chúng ta phải rời đi.

Duyên:

> ...

> Dạ.

Player không chết.

Không Game Over ngay.

Thay vào đó game đánh dấu:

**Puzzle Failed / Safety Intervention**

Sau Scene có thể trừ thành tích puzzle.

Điều này phù hợp hơn với game giáo dục.

---

# 36. CÔ THẢO XUẤT HIỆN — BẢN THÀNH CÔNG

Nếu player mở được tủ:

Tiếng bước chân ngoài hành lang.

**SFX**

> Chạy.

Cô Thảo xuất hiện.

Thảo:

> Hai em!

Duyên quay lại.

> Cô Thảo!

Thảo:

> Hai em ổn chứ?

Bạn:

> Dạ.

Duyên:

> Dạ.

Thảo:

> Tốt.

Cô nhìn con gấu Duyên đang ôm.

Thảo:

> Em vừa lấy nó à?

Duyên:

> Dạ...

Thảo nhìn Duyên.

Một nhịp.

> Được rồi.

> Nhưng từ bây giờ không quay lại lấy bất cứ thứ gì nữa.

Duyên:

> Dạ.

Thảo:

> Khi cô nói đi, hai em đi cùng cô.

Bạn:

> Dạ.

---

# 37. CÔ THẢO XUẤT HIỆN — NẾU BỎ GẤU

Nếu `EvacuatedWithoutBear == true`:

Thảo chạy vào.

> Hai em!

Bạn:

> Cô Thảo!

Thảo:

> Hai em chuẩn bị xong chưa?

Duyên nhìn chiếc tủ.

> Dạ...

> Gấu của em còn trong tủ.

Thảo:

> Em có mở được không?

Duyên:

> Không ạ.

Thảo:

> Vậy mình để lại.

> Khi khu vực an toàn, người lớn sẽ xử lý sau.

Duyên:

> Dạ.

Cô Thảo đặt tay nhẹ lên vai Duyên.

> Em quyết định đúng rồi.

Duyên nhìn [Bạn].

Sau đó gật đầu.

---

# 38. TUTORIAL SƠ TÁN

Cô Thảo:

> Trước khi đi, nghe cô nhé.

Gameplay freeze.

UI hiện lần lượt ba nguyên tắc.

---

## NGUYÊN TẮC 1

# ĐI CÙNG NGƯỜI LỚN

Thảo:

> Không tự ý đi một mình.

---

## NGUYÊN TẮC 2

# KHÔNG TÁCH NHÓM

Thảo:

> Luôn đi cùng cô và các bạn.

---

## NGUYÊN TẮC 3

# KHÔNG QUAY LẠI LẤY ĐỒ

Thảo:

> Khi đã bắt đầu sơ tán, không quay lại.

UI:

**ĐÃ HIỂU**

Player xác nhận.

---

# 39. GIỚI THIỆU MINH ANH

Ngay sau đó bộ đàm bên hông cô Thảo phát tiếng.

**SFX**

> Rè...

Giọng nam lớn tuổi:

> Cô Thảo.

> Cô Thảo nghe rõ không?

Thảo cầm bộ đàm.

> Tôi nghe rõ.

Giọng:

> Tôi là Minh Anh.

Name tag xuất hiện:

# [MINH ANH]
## TRƯỞNG LÀNG

Minh Anh:

> Nước ở con suối phía dưới đang lên nhanh.

> Các lớp phải di chuyển lên điểm tập kết phía đồi.

Thảo:

> Học sinh lớp tôi đã sẵn sàng.

Minh Anh:

> Tốt.

> Nhưng đường phía đông có thể không đi được.

Duyên nhìn [Bạn].

Minh Anh tiếp tục:

> Tôi đã bảo bác Mạnh kiểm tra lối đó.

> Chờ thông tin trước khi đi qua.

Thảo:

> Rõ.

---

# 40. GIỚI THIỆU MẠNH QUA RADIO

Một giọng nam trung niên chen vào.

**SFX**

> Radio crackle.

Mạnh:

> Trưởng làng Minh Anh.

Minh Anh:

> Tôi nghe.

Mạnh:

> Tôi đang ở hành lang phía đông.

> Nước đang tràn qua đoạn cầu nối.

> Không cho học sinh đi hướng này.

Minh Anh:

> Rõ.

> Cô Thảo nghe chưa?

Thảo:

> Tôi nghe rõ.

Mạnh:

> Tôi sẽ kiểm tra đường phía bắc.

> Nếu đi được tôi báo lại ngay.

Thảo:

> Cảm ơn bác Mạnh.

Radio tắt.

---

# 41. THIẾT LẬP MỤC TIÊU SCENE 2

Duyên:

> Vậy mình không đi đường phía đông nữa ạ?

Thảo:

> Đúng.

Bạn:

> Nhưng sơ đồ trong lớp chỉ đường qua phía đông mà cô?

Đây là payoff cho puzzle.

Thảo:

> Trong tình huống thật, đường sơ tán có thể thay đổi.

> Vì vậy sơ đồ giúp chúng ta biết hướng cơ bản...

> Nhưng phải nghe hướng dẫn mới nhất.

Đây là chi tiết quan trọng.

Không để trẻ hiểu rằng phải luôn cứng nhắc đi theo sơ đồ dù thực địa nguy hiểm.

Duyên:

> Vậy bây giờ mình đi đâu?

Thảo:

> Đi cùng cô.

> Khi tới chỗ rẽ, chúng ta sẽ quan sát.

---

# 42. RỜI KHỎI LỚP

Cô Thảo đi tới cửa.

Mở cửa.

**SFX**

> Cạch.

Âm thanh mưa lớn hơn.

Camera nhìn ra hành lang.

Một vài giáo viên khác đang dẫn học sinh đi.

Nước mưa hắt vào phía cuối hành lang.

Thảo quay lại.

> [Bạn].

> Duyên.

> Đi sát cô.

Bạn:

> Dạ.

Duyên:

> Dạ.

---

# 43. GAMEPLAY DI CHUYỂN NGẮN

Player được điều khiển trở lại.

Objective:

# ĐI THEO CÔ THẢO

Rule:

Nếu người chơi đi quá xa:

Thảo:

> Đừng tách khỏi nhóm.

Game giới hạn vùng di chuyển.

Nếu player quay lại phía tủ:

Bạn tự nói:

> Không.

> Phải đi cùng cô.

Nhân vật tự dừng.

Không cho player quay lại mở puzzle.

---

# 44. ĐOẠN HỘI THOẠI NHỎ KHI ĐI

Nếu LockerOpened:

Duyên ôm gấu.

> Lúc nãy tớ chỉ nghĩ tới Gấu thôi.

Bạn:

> Cậu lo cho nó mà.

Duyên:

> Ừ.

Duyên nhìn cô Thảo phía trước.

> Nhưng lần sau nếu cô bảo đi ngay...

> Tớ sẽ đi ngay.

Bạn:

> Ừ.

---

Nếu EvacuatedWithoutBear:

Duyên:

> Tớ vẫn lo cho Gấu.

Bạn:

> Nó đang ở trong tủ.

> Khi an toàn mình sẽ hỏi cô.

Duyên:

> Ừ.

Một nhịp.

> Ít nhất mình đang đi cùng nhau.

Bạn:

> Ừ.

---

# 45. CUỐI HÀNH LANG

Ba người tới một ngã rẽ.

Camera cinematic.

Bên trái:

Biển:

**LỐI PHÍA ĐÔNG**

Một phần hành lang phía xa có nước chảy qua.

Có dây cảnh báo.

Bên phải:

Một cầu thang dẫn lên khu nhà khác.

Cô Thảo dừng lại.

Duyên:

> Đây là đường trên sơ đồ...

Bạn:

> Nhưng bác Mạnh vừa bảo không đi.

Thảo:

> Đúng.

Cô nhìn hai học sinh.

> Đây là lúc chúng ta phải chọn đường an toàn.

Camera zoom vào biển chỉ dẫn.

---

# 46. CLIFFHANGER

Bộ đàm phát tiếng.

**SFX**

> Rè...

Mạnh:

> Cô Thảo.

Thảo:

> Tôi nghe.

Mạnh:

> Tôi tìm được một lối khác.

Màn hình fade black trước khi ông nói tiếp.

---

# 47. TITLE CARD

# SCENE 1 HOÀN THÀNH

Subtitle:

## CƠN MƯA LỚN

---

# 48. SCORE SCREEN

Game tổng kết nhưng không chấm điểm kiểu đúng/sai học thuật quá nặng.

## QUAN SÁT

Nếu tìm sơ đồ:

✓ Phát hiện manh mối quan trọng.

---

## SUY LUẬN

Nếu mở khóa:

✓ Giải được mật mã đường đi.

---

## BÌNH TĨNH

Nếu không nhập sai:

✓ Không thử mật mã ngẫu nhiên.

---

## AN TOÀN

Nếu chọn bỏ gấu khi thời gian thấp:

✓ Ưu tiên sơ tán.

Nếu mở được tủ nhanh:

✓ Hoàn thành trước khi cần rời đi.

Hai cách đều có thể nhận đánh giá tích cực.

---

# 49. ACHIEVEMENTS

## NHÀ QUAN SÁT

Tìm được sơ đồ mà không dùng Hint 2.

---

## GIẢI MÃ

Mở tủ trong lần thử đầu tiên.

---

## AN TOÀN TRƯỚC TIÊN

Chủ động bỏ lại gấu khi chỉ còn một đơn vị thời gian an toàn.

---

## KHÔNG THỬ ĐẠI

Không nhập mã trước khi kiểm tra sơ đồ.

---

# 50. HỆ THỐNG HINT

## Hint Level 0

Không hint.

---

## Hint Level 1

Duyên:

> Tớ nhớ lúc đổi mật mã...

> Tớ đang nhìn thứ gì đó trên tường.

---

## Hint Level 2

Duyên:

> Hình như nó liên quan đến một đường đi.

Poster sơ đồ có highlight rất nhẹ.

---

## Hint Level 3

Bạn:

> Bắt đầu từ lớp 4B.

> Có bốn chỗ phải đổi hướng.

Camera zoom lần lượt bốn điểm.

Không hiện đáp án trực tiếp.

---

## Hint Level 4 — Accessibility

Nếu người chơi vẫn mắc kẹt:

UI:

> Bạn có muốn xem gợi ý rõ hơn không?

Nếu chọn Có:

> Hãy theo tuyến từ **Lớp 4B** đến **Điểm tập kết** và ghi lại hướng tại bốn đoạn.

Vẫn không hiện:

**↑ → ↑ →**

---

# 51. ENVIRONMENTAL PROGRESSION

## SAFE TIME = 3

Không gian:

- Mưa lớn.
- Ánh sáng bình thường.
- Nhạc căng thẳng nhẹ.

Duyên tương đối bình tĩnh.

---

## SAFE TIME = 2

- Mưa to hơn.
- Một tiếng sấm.
- Ánh sáng tối nhẹ.
- Music tension +10%.

Duyên:

> Mình phải nhanh lên.

---

## SAFE TIME = 1

- Tiếng nước rõ hơn.
- Có tiếng loa ở xa.
- Camera thỉnh thoảng rung rất nhẹ.
- Music tension +30%.

Duyên:

> Hay là mình đi thôi...

---

## SAFE TIME = 0

Không phải cảnh nhân vật chết.

- Còi cảnh báo.
- Cô Thảo xuất hiện.
- Puzzle bị cưỡng chế kết thúc.
- Nhân vật phải sơ tán.

---

# 52. KHÔNG DÙNG COUNTDOWN THỰC

Không nên để:

```text
00:30
00:29
00:28
```

trừ khi game hướng tới người chơi lớn hơn.

Lý do:

Countdown thật dễ làm trẻ:

- hoảng;
- spam puzzle;
- bỏ đọc hội thoại;
- không còn quan sát môi trường.

Ba trạng thái thời gian tạo áp lực vừa đủ nhưng vẫn cho phép suy nghĩ.

---

# 53. PUZZLE SOLUTION

## Lock Type

Directional Combination Lock.

## Code

```text
↑ → ↑ →
```

## Source

Sơ đồ sơ tán lớp học.

## Logic

Player bắt đầu tại:

**LỚP 4B**

Đi theo đường được đánh dấu tới:

**ĐIỂM TẬP KẾT**

Bốn đoạn chính:

1. Đi lên.
2. Rẽ phải.
3. Đi lên.
4. Rẽ phải.

Result:

```text
↑ → ↑ →
```

---

# 54. NARRATIVE PURPOSE CỦA PUZZLE

Puzzle thực hiện bốn nhiệm vụ cùng lúc.

### 1. Gameplay

Dạy player quan sát môi trường.

### 2. Narrative

Cho thấy Duyên rất quan tâm tới gấu.

### 3. Tutorial

Player học đọc sơ đồ sơ tán.

### 4. Foreshadowing

Scene 2 sẽ buộc player nhận ra:

**sơ đồ cũ có thể không còn dùng được nếu đường thực tế bị ngập.**

Như vậy puzzle không phải mini-game đứng riêng.

Nó có ý nghĩa với câu chuyện.

---

# 55. CORE LESSON

Scene 1 không nên truyền tải:

> "Giải puzzle nhanh để cứu món đồ."

Thông điệp chính phải là:

# Quan sát — Bình tĩnh — Không chần chừ — Đi theo hướng dẫn.

Game cho phép người chơi lấy gấu nếu giải nhanh.

Nhưng cũng cho phép người chơi bỏ gấu và vẫn hoàn thành Scene tốt.

---

# 56. FULL FLOW

```text
START
 │
 ▼
Opening — Mưa lớn
 │
 ▼
Loa cảnh báo
 │
 ▼
Nói chuyện với Duyên
 │
 ▼
Duyên muốn lấy gấu
 │
 ▼
Phát hiện tủ bị khóa
 │
 ▼
Khóa điều hướng
 │
 ▼
Khám phá lớp
 │
 ├───────────────┐
 ▼               ▼
Vật giả         Sơ đồ sơ tán
                   │
                   ▼
              Hiểu quy luật
                   │
                   ▼
            Quay lại khóa
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
      Đúng                   Sai
        │                     │
        ▼                     ▼
    Lấy gấu              SafeTime -1
        │                     │
        │              ┌──────┴─────┐
        │              ▼            ▼
        │         còn thời gian    hết thời gian
        │              │            │
        │              ▼            ▼
        │           thử lại      Cô Thảo tới
        │
        ▼
Cô Thảo xuất hiện
        │
        ▼
Radio Minh Anh
        │
        ▼
Mạnh báo đường Đông ngập
        │
        ▼
Rời khỏi lớp
        │
        ▼
Ngã rẽ hành lang
        │
        ▼
SCENE 2
```

---

# 57. SCENE 2 HOOK

Text cuối:

# SCENE 2

## CON ĐƯỜNG BỊ CHẶN

Objective preview:

> Tìm đường an toàn tới điểm tập kết.

Fade out.

END SCENE 1.