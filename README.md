# Game giải đố cốt truyện 2D

## Chơi Scene 1 ngay, không cần Unity

Scene **Cơn Mưa Lớn** đã được triển khai bằng HTML, CSS và JavaScript thuần, bám theo [kịch bản chương 1](Docs/Chapter01.md).

- Nhấp đúp `start-game.cmd`, hoặc chạy `npm start` rồi mở **http://localhost:4173**.
- Không cần `npm install`. Máy cần Node.js để chạy server; nếu chưa có Node, có thể mở trực tiếp `web/index.html` bằng trình duyệt. Chạy qua server cho ảnh nhân vật và lưu trữ ổn định hơn.
- WASD / phím mũi tên để di chuyển, E để tương tác; cũng có thể bấm hoặc chạm trực tiếp. Enter / Space để đọc tiếp. I mở túi đồ, J mở sổ tay, Esc mở cài đặt hoặc đóng cửa sổ.
- Có lưu tự động, tiếp tục lần trước, âm thanh tổng hợp, điều khiển chạm, giảm chuyển động và hiển thị vùng tương tác.

Xem [hướng dẫn chỉnh scene và đối chiếu yêu cầu](Docs/Scene01-implementation.md). Ảnh kiểm tra giao diện ở `output/qa/`.

Bộ nhân vật 2D được vẽ mới riêng từng người, gồm 13 PNG trong suốt: năm ảnh toàn thân, năm chân dung, hai dáng bước của Bạn và dáng Duyên ôm gấu. Xem tại **http://localhost:4173/web/characters.html**; ảnh nằm ở `web/assets/characters/`, cấu hình trong `web/js/characters.js`, prompt trong [character-assets.md](Docs/character-assets.md). Game dùng font tiếng Việt local trong `web/assets/fonts/`. Sau khi cập nhật, khởi động lại server rồi bấm Ctrl+Shift+R.

Bản đồ sơ tán hoàn chỉnh: **http://localhost:4173/web/evacuation-map.html**. Dùng đúng tranh làng trong `map/`, đánh dấu tuyến từ trường qua cầu đá lên điểm tập kết trên núi, bốn điểm nối tương tác, phóng to/kéo và đọc từng chặng. Bản đồ này đã thay sơ đồ cũ trong Scene 1.

```text
web/
├── index.html           # Khung giao diện
├── characters.html      # Xem bộ nhân vật và tư thế riêng
├── evacuation-map.html  # Xem và tương tác bản đồ làng đầy đủ
├── evacuation-map.css   # Giao diện bản đồ trên máy tính/điện thoại
├── styles.css           # Giao diện, bố cục, điện thoại
├── typography.css       # Font tiếng Việt local và giãn dòng
├── assets/              # Nền, characters/ và fonts/
└── js/
    ├── characters.js    # Model 2D độc lập và điểm đặt chân
    ├── evacuation-map.js # Tuyến theo tranh gốc, điểm nối, zoom/kéo
    ├── story.js         # Hội thoại, lời dẫn, nhánh câu chuyện
    ├── model.js         # Trạng thái, khóa, tiến trình, thành tích
    ├── navigation.js    # Vùng sàn, va chạm, tìm đường tránh bàn ghế/nhân vật
    ├── game.js          # Tương tác, điều khiển, sơ đồ, lưu và giao diện
    └── audio.js         # Mưa, sấm, bộ đàm, âm khóa, nhạc nền tổng hợp
```

## Chương 02 — Ba con đường

Chơi tại **http://localhost:4173/web/chapter02.html** sau khi chạy `npm start`, hoặc chọn Chương 02 từ màn hình đầu / phần kết Chương 01. Tám cảnh có nền riêng và điểm nối hai chiều; ba tuyến cho phép khám phá theo thứ tự bất kỳ, có 13 dấu hiệu, tám câu đố khu vực, mũi tên hiện nơi đến khi rê chuột, sổ tay, bản đồ, hội thoại, khóa kiểm tra cầu Bắc và lưu tự động.

Xem [thiết kế và hướng dẫn Chương 02](Docs/Chapter02-implementation.md). Kiểm tra: `npm test` và `npm run test:chapter02` (Chrome + server). Ảnh QA tại `output/qa/chapter02/`.

## Khung Unity để dùng về sau

Khung thư mục Unity cho game tương tác theo cảnh, lấy cảm hứng từ cách chơi của Áo cưới giấy: khám phá, tìm manh mối, kết hợp vật phẩm, giải câu đố và tiến triển cốt truyện theo chương.

Phần Unity là cấu trúc khởi đầu, chưa có scene `.unity`, prefab hoặc script C# gameplay. Bản chơi hiện tại nằm trong `web/`. Các thư mục Unity trống có `.gitkeep` để Git lưu lại cấu trúc.

## Cấu trúc

```text
OngdiaAI/
├── map/                           # 7 ảnh nguồn ban đầu, giữ nguyên
├── Assets/
│   ├── _Project/                  # Nội dung tự làm của game
│   │   ├── Art/
│   │   │   ├── Backgrounds/       # Nền các địa điểm
│   │   │   ├── Characters/        # Sprite nhân vật
│   │   │   ├── Portraits/         # Chân dung khi hội thoại
│   │   │   ├── Props/             # Đồ vật và hình vật phẩm
│   │   │   ├── UI/                # Icon, nút, khung hội thoại
│   │   │   └── Effects/           # Sprite hiệu ứng
│   │   ├── Animations/
│   │   ├── Audio/
│   │   │   ├── Music/
│   │   │   ├── Ambience/
│   │   │   └── SFX/
│   │   ├── Scenes/
│   │   │   ├── Bootstrap/         # Khởi tạo hệ thống dùng chung
│   │   │   ├── MainMenu/
│   │   │   ├── Chapters/
│   │   │   │   └── Chapter01/     # Các scene của chương đầu
│   │   │   └── Sandbox/           # Scene thử tương tác/câu đố
│   │   ├── Prefabs/
│   │   │   ├── Locations/         # Một địa điểm gồm nền và điểm tương tác
│   │   │   ├── Interactables/     # Điểm bấm, cửa, đồ vật có thể kiểm tra
│   │   │   ├── Items/
│   │   │   ├── Puzzles/
│   │   │   └── UI/
│   │   ├── Scripts/
│   │   │   ├── Core/              # Khởi tạo và chuyển cảnh
│   │   │   ├── Input/             # Chuột/chạm, chuyển tọa độ sang điểm tương tác
│   │   │   ├── Interaction/       # Kiểm tra, nhặt đồ, dùng đồ tại điểm bấm
│   │   │   ├── Inventory/         # Túi đồ, chọn và kết hợp vật phẩm
│   │   │   ├── Puzzles/           # Logic câu đố
│   │   │   ├── Dialogue/          # Hội thoại và lời dẫn
│   │   │   ├── Progress/          # Cờ cốt truyện, điều kiện mở cảnh
│   │   │   ├── Save/              # Lưu và khôi phục tiến trình
│   │   │   ├── Audio/
│   │   │   └── UI/
│   │   ├── Data/                 # Dữ liệu nội dung, dự kiến dùng ScriptableObject
│   │   │   ├── Chapters/
│   │   │   ├── Locations/
│   │   │   ├── Items/
│   │   │   ├── Puzzles/
│   │   │   └── Dialogues/
│   │   └── Settings/             # Thiết lập dành riêng cho game
│   └── ThirdParty/               # Asset/package ngoài tự nhập
├── Docs/
│   └── Chapter01.md              # Mẫu thiết kế chương đầu
├── Packages/
└── ProjectSettings/
```

## Mở project

Trong Unity Hub, chọn **Add project from disk** và chọn thư mục `OngdiaAI`. Phiên bản được giữ từ project cũ là **6000.0.32f1**. Unity sẽ tạo các thiết lập còn thiếu và file `.meta` khi mở project; hãy đưa `.meta` vào Git cùng asset tương ứng.

Ảnh trong `map/` nằm ngoài `Assets/`, nên Unity chưa nhập chúng. Khi bắt đầu dựng cảnh, sao chép ảnh nền vào `Art/Backgrounds/`, ảnh nhân vật vào `Art/Characters/`, rồi đặt **Texture Type → Sprite (2D and UI)** trong Inspector. Giữ `map/` làm bản nguồn.

## Sửa ở đâu?

| Muốn sửa | Nơi sửa |
| --- | --- |
| Bối cảnh, hình nhân vật, đồ vật | `Assets/_Project/Art/` |
| Bố trí cảnh và điểm tương tác | `Scenes/Chapters/` và `Prefabs/Locations/` |
| Tên, mô tả, icon của vật phẩm | `Data/Items/` |
| Nội dung hội thoại | `Data/Dialogues/` |
| Nội dung và đáp án câu đố | `Data/Puzzles/` |
| Cách vận hành câu đố | `Scripts/Puzzles/` |
| Điều kiện mở cửa, chuyển cảnh, kết thúc chương | `Scripts/Progress/` và `Data/Chapters/` |
| Túi đồ, giao diện hội thoại, màn hình câu đố | `Prefabs/UI/`, `Art/UI/`, `Scripts/UI/` |
| Nội dung thiết kế chương | `Docs/Chapter01.md` |

## Quy ước khi triển khai

- Dùng ID ổn định như `chapter01.house`, `item.brass_key`, `puzzle.lockbox`. Lưu tiến trình bằng ID, không dùng tên hiển thị hay tham chiếu GameObject.
- Tách dữ liệu cố định trong `Data/` khỏi trạng thái khi chơi. Trạng thái gồm vật phẩm đã nhặt, câu đố đã giải, cờ cốt truyện và địa điểm hiện tại; lưu ra `Application.persistentDataPath`.
- Đặt tên scene theo chương và địa điểm, ví dụ `CH01_VillageEntrance.unity`. Tên C# dùng PascalCase; namespace có thể dùng `OngdiaAI.Interaction`, `OngdiaAI.Puzzles`.
- Giữ hệ thống dùng chung trong `Scripts/`. Nội dung từng chương nằm trong dữ liệu và scene, tránh tạo một bản hệ thống mới cho mỗi chương.
- Dùng camera Orthographic và vùng tương tác phù hợp cho từng cảnh. Chọn độ phân giải tham chiếu và Pixels Per Unit thống nhất trước khi dựng cảnh.
- Đổi tên hoặc di chuyển asset đã nhập bằng Unity Project window để giữ liên kết `.meta`.

## Thứ tự dựng bản chơi đầu tiên

1. Hoàn thành thiết kế một địa điểm trong `Docs/Chapter01.md`.
2. Dựng một scene có ảnh nền và điểm bấm kiểm tra đồ vật.
3. Thêm nhặt vật phẩm, túi đồ và dùng vật phẩm lên điểm bấm.
4. Thêm một câu đố, hội thoại và điều kiện mở địa điểm tiếp theo.
5. Thêm lưu/khôi phục trạng thái rồi mở rộng sang các địa điểm khác.
