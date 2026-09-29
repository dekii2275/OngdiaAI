# OngdiaAI - Mô Phỏng Giáo Dục Sơ Tán Lũ Quét & Sạt Lở Đất Cho Học Sinh

Bộ khung kỹ thuật kiến trúc chuẩn (Technical Scaffold Architecture) dành cho dự án mô phỏng giáo dục kỹ năng phòng chống, ứng phó thiên tai (**Lũ quét & Sạt lở đất**) tại vùng cao.

---

## 1. Mục Đích Dự Án (Project Purpose)

Dự án cung cấp môi trường mô phỏng tình huống giáo dục tương tác cho học sinh:
- **Tình huống mô phỏng**: Tại trường học vùng cao đang có mưa lớn kéo dài → Nhận còi báo động khẩn cấp → Quan sát hiện tượng thiên nhiên nhận biết nguy cơ (nước suối đục ngầu, vết nứt taluy dương) → Ra quyết định chọn tuyến đường sơ tán an toàn lên cao điểm → Môi trường thay đổi runtime (nước lũ cuốn sập cầu tạm ở Tuyến A, đất đá sạt trượt vùi lấp Tuyến C) → Xử lý tình huống đổi tuyến sang Tuyến B (đường đồi cao) → Hỗ trợ bạn học gặp nạn trên đường → Tập kết an toàn tại Nhà văn hóa / Điểm cao → Đánh giá điểm số sư phạm và xuất báo cáo hành động (Action Log & Telemetry).
- **Triết lý kiến trúc**: Tách biệt hoàn toàn giữa **Simulation & Educational Logic** và **Presentation Layer**. Ban đầu vận hành ở góc nhìn **2.5D / Isometric**, sẵn sàng chuyển đổi sang **Third-Person 3D** hoặc **VR (Meta Quest / OpenXR / XR Interaction Toolkit)** mà không phải sửa đổi bất kỳ dòng code nào trong `ScenarioManager`, `HazardSystem`, `RouteManager`, `CheckpointManager`, `ScoreManager` hay `PlayerActionLog`.

---

## 2. Thông Số Kỹ Thuật & Yêu Cầu Môi Trường (Unity Version)

- **Target Unity Version**: **Unity 6.3 LTS / Unity 6 (6000.0.32f1 hoặc mới hơn)**
- **Ngôn ngữ**: C# (.NET Standard 2.1 / C# 9.0+)
- **Render Pipeline**: Universal Render Pipeline (**URP**)
- **Input**: Unity Input System Package (`com.unity.inputsystem`)
- **Navigation**: AI Navigation Package (`com.unity.ai.navigation`)
- **UI**: TextMeshPro & Unity UI (`com.unity.ugui`, `com.unity.textmeshpro`)
- **Camera**: Cinemachine (`com.unity.cinemachine`)
- **Level Design**: ProBuilder (`com.unity.probuilder`)
- **Cinematics**: Timeline (`com.unity.timeline`)

Tất cả các packages chính thức trên đã được khai báo sẵn trong file `Packages/manifest.json`.

---

## 3. Sơ Đồ Kiến Trúc Hệ Thống (Architecture Flowchart)

```text
       +---------------------------------------------+
       |                ScenarioData                 |
       |  (ScriptableObject: Timeline, Events, ID)   |
       +---------------------------------------------+
                             |
                             v
       +---------------------------------------------+
       |               ScenarioManager               |
       |         (Timeline Event Dispatcher)         |
       +---------------------------------------------+
                             |
                             v [ScenarioEventData]
            +----------------+----------------+
            |                                 |
            v                                 v
  +--------------------+            +--------------------+
  |    HazardSystem    |            |    RouteManager    |
  |  (Flood / Slope)   |----------->|  (Route A, B, C)   |
  | HazardState Change |            |  RouteState Change |
  +--------------------+            +--------------------+
            |                                 |
            |                                 | (Path Blocked / Warning)
            v                                 v
+------------------------+          +--------------------+
|  HazardVisualBridge /  |          | DynamicObstacle /  |
| Visual Presentation    |          |  AI NavMeshAgent   |
+------------------------+          +--------------------+
                                              |
                                              v
                              +--------------------------------+
                              |      Player & NPC Actions      |
                              |  (Observe -> Move -> Reroute)  |
                              +--------------------------------+
                                              |
                                              v
                              +--------------------------------+
                              |       CheckpointManager        |
                              |      (CP0 -> CP7 Triggers)     |
                              +--------------------------------+
                                              |
                                              v
                              +--------------------------------+
                              |          ScoreManager          |
                              |  (5 Categories - 100 pts max)  |
                              +--------------------------------+
                                              |
                                              v
                              +--------------------------------+
                              |        PlayerActionLog         |
                              |   (Debriefing Teacher Report)  |
                              +--------------------------------+
```

### Kiến Trúc 4 Tầng Phân Lớp (Layered Architecture)

```text
[ Game Logic & Engine ]
      GameManager, ScenarioManager, ScenarioEventData
             ↓
[ Domain Subsystems ]
      HazardBase (FloodHazard, LandslideHazard)
      RouteManager (RouteData, RouteState)
      CheckpointManager (CheckpointData, CheckpointTrigger)
      ScoreManager (ScoreCategory, ScoreEntry)
      PlayerActionLog (ActionLogEntry)
             ↓
[ World Abstraction & Input Contracts ]
      IHazard, IRoute, IInteractable, IPlayerInput, IScenarioEventReceiver
             ↓
[ Presentation Layer (Plug-and-Play) ]
      - 2.5D Isometric : DesktopPlayerInput + IsometricCameraController + LowPoly Blockout
      - 3D Third-Person: Desktop/Gamepad + ThirdPersonCameraRig
      - VR Meta Quest  : XRPlayerInput + XR Origin + OpenXR Hand Controllers
```

---

## 4. Cấu Trúc Thư Mục Repository (Folder Architecture)

```text
Assets/
├── _Project/
│   ├── Art/
│   │   ├── Characters/          # Models & textures nhân vật học sinh, giáo viên
│   │   ├── Environment/         # Blockout trường học, suối, cầu, đồi núi
│   │   ├── Hazards/             # Visual hiệu ứng lũ quét, đất đá sạt trượt
│   │   ├── Materials/           # URP materials
│   │   └── UI/                  # Sprites, icons, font assets
│   │
│   ├── Audio/
│   │   ├── Ambient/             # Tiếng mưa gió, sấm chớp, tiếng suối
│   │   ├── SFX/                 # Âm thanh đất đá rơi, nước lũ cuộn, bước chân
│   │   └── Warning/             # Còi báo động phòng chống thiên tai xã
│   │
│   ├── Data/
│   │   ├── Scenarios/           # ScriptableObject ScenarioData
│   │   ├── Checkpoints/         # Checkpoint presets
│   │   ├── Routes/              # RouteData configs
│   │   └── Hazards/             # Hazard profiles
│   │
│   ├── Prefabs/
│   │   ├── Characters/          # Prefabs Player, NPC bạn học, NPC thầy cô
│   │   ├── Environment/         # Prefab trường học, cầu, nhà văn hóa
│   │   ├── Checkpoints/         # Prefab trigger volume CP0 -> CP7
│   │   ├── Hazards/             # Prefab FloodHazard, LandslideHazard
│   │   └── UI/                  # Canvas HUD, kết quả, popup cảnh báo
│   │
│   ├── Scenes/
│   │   ├── Bootstrap/           # Scene khởi động & quản lý nạp resource
│   │   ├── Gameplay/            # Scene chính: EvacuationPrototype.unity
│   │   └── Testing/             # Scene test cơ chế riêng lẻ
│   │
│   ├── Scripts/
│   │   ├── Core/                # Assembly DisasterSim.Core (Enums, Interfaces, GameManager, Data)
│   │   │   ├── Enums.cs
│   │   │   ├── IHazard.cs
│   │   │   ├── IRoute.cs
│   │   │   ├── IInteractable.cs
│   │   │   ├── IPlayerInput.cs
│   │   │   ├── IScenarioEventReceiver.cs
│   │   │   ├── GameManager.cs
│   │   │   ├── ScenarioEventData.cs
│   │   │   └── ScoreAndActionData.cs
│   │   │
│   │   ├── DisasterSim.Gameplay.asmdef
│   │   ├── Player/              # PlayerController, DesktopPlayerInput, XRPlayerInput
│   │   ├── Camera/              # IsometricCameraController, CameraManager
│   │   ├── Scenario/            # ScenarioData, ScenarioManager, RouteData, RouteManager, Factory
│   │   ├── Checkpoints/         # CheckpointData, CheckpointManager, CheckpointTrigger
│   │   ├── Hazards/             # HazardBase, FloodHazard, LandslideHazard, HazardVisualBridge
│   │   ├── Navigation/          # DynamicRouteObstacle, EvacuationNpcAgent
│   │   ├── NPC/                 # InteractableNpcFriend (CP5 Hỗ trợ bạn)
│   │   ├── Interaction/         # Interactor, InteractableBase, WarningBoard, Hotspot, AssemblyPoint
│   │   ├── Scoring/             # ScoreManager
│   │   ├── Replay/              # PlayerActionLog
│   │   ├── Debug/               # SimulationDebugPanel (Hotkeys F1 -> F8)
│   │   │
│   │   ├── UI/                  # Assembly DisasterSim.UI
│   │   │   ├── HUDController.cs
│   │   │   ├── InteractionPromptUI.cs
│   │   │   ├── WarningNotificationUI.cs
│   │   │   └── ScenarioResultPanelUI.cs
│   │   │
│   │   └── Editor/              # Assembly DisasterSim.Editor
│   │       └── EvacuationSceneBuilder.cs (Menu 1-Click Generator)
│   │
│   ├── Settings/                # URP Pipeline Asset, Input Actions Asset
│   └── Tests/
│       └── EditMode/            # Assembly DisasterSim.Tests
│           ├── RouteManagerTests.cs
│           ├── HazardSystemTests.cs
│           ├── ScoreManagerTests.cs
│           ├── CheckpointManagerTests.cs
│           ├── ScenarioTimelineTests.cs
│           └── ActionLogTests.cs
│
└── ThirdParty/                  # Thư viện ngoài (nếu có, không để lẫn source code dự án)
```

---

## 5. Hướng Dẫn Chạy Prototype Trong Unity Editor (How to Run)

Nhờ bộ công cụ tự động hóa `EvacuationSceneBuilder`, bạn có thể thiết lập toàn bộ scene playable chỉ với **1 click**:

### Bước 1: Mở Project trong Unity Editor
- Mở **Unity Hub** → Chọn **Add project from disk** → Trỏ tới thư mục `d:\OngdiaAI`.
- Chọn phiên bản **Unity 6000.0 LTS (hoặc 6.3 LTS)**.
- Đợi Unity import packages (URP, Input System, AI Navigation, Cinemachine, TextMeshPro).

### Bước 2: Tự động khởi tạo Scene & Scenario
- Trên thanh menu của Unity Editor, chọn:
  ```text
  Tools -> Disaster Sim -> 2. Generate Evacuation Prototype Scene
  ```
- Editor script sẽ tự động:
  1. Tạo file ScriptableObject `FlashFloodEvacuationScenario.asset` đầy đủ sự kiện timeline chuẩn.
  2. Tạo scene `Assets/_Project/Scenes/Gameplay/EvacuationPrototype.unity`.
  3. Dựng layout blockout 3 tuyến sơ tán:
     - **Trường học (School)**: Điểm xuất phát của học sinh.
     - **Tuyến A (Cầu suối cạn)**: Dòng suối + Cầu tạm + FloodHazard + NavMesh DynamicObstacle.
     - **Tuyến B (Đường đồi cao)**: Tuyến sơ tán an toàn dẫn thẳng lên đỉnh đồi.
     - **Tuyến C (Chân dốc taluy)**: Sườn núi dốc + LandslideHazard + Đá dăm + NavMesh DynamicObstacle.
     - **Điểm tập kết an toàn (Safe Assembly Point)**: Nhà văn hóa trên cao + Cột báo danh.
  4. Tạo nhân vật **Player** với CharacterController, Interactor, Desktop Input.
  5. Đặt **Bạn Minh (NPC Friend)** tại CP5 đang cần hỗ trợ.
  6. Đặt **NPC Học sinh chạy tự động (NavMeshAgent)** biểu diễn việc tự đổi tuyến khi cầu sập.
  7. Thiết lập hệ thống 8 Checkpoint (CP0 → CP7).
  8. Kết nối toàn bộ **GameManager, ScenarioManager, RouteManager, HazardManager, CheckpointManager, ScoreManager, ActionLog**.
  9. Tạo Canvas UI với HUD hiển thị thời gian, mục tiêu, trạng thái tuyến đường và bảng kết quả.
  10. Tự động lưu scene.

### Bước 3: Nướng NavMesh (NavMesh Bake)
- Trong Unity Editor, mở cửa sổ: **Window -> AI -> Navigation** (hoặc chọn component `NavMeshSurface` trên mặt đất).
- Bấm **Bake** để tạo dữ liệu đường đi cho các NPC học sinh.

### Bước 4: Bấm PLAY & Trải Nghiệm Gameplay
- Bấm nút **Play** trên thanh công cụ Unity Editor.
- **Điều khiển Player**:
  - `W, A, S, D` (hoặc phím mũi tên): Di chuyển nhân vật (hướng di chuyển theo góc camera Isometric).
  - `Giữ Shift`: Chạy nhanh (Sprint).
  - `Phím E`: Tương tác (đọc biển cảnh báo, quan sát nước suối, giúp đỡ bạn, điểm danh tại điểm tập kết).
  - `Phím Esc`: Tạm dừng / Tiếp tục mô phỏng.

---

## 6. Phím Tắt Debug & Thử Nghiệm Nhanh (Debug Tools)

Khi đang ở chế độ Play (Play Mode), bạn không cần chờ hết 8 phút kịch bản mà có thể dùng các phím tắt sau để kiểm tra ngay lập tức:

| Phím Tắt | Chức Năng | Mô Tả |
| :---: | :--- | :--- |
| **`F1`** | **Bật/Tắt Debug Panel** | Hiện bảng GUI trực quan trên màn hình để click chuột/chạm |
| **`F2`** | **Kích hoạt Lũ dâng (River Rising)** | Nước suối chuyển đục, dâng cao, cảnh báo Tuyến A |
| **`F3`** | **Cầu sập (Bridge Blocked)** | Nước lũ cuốn trôi cầu tạm → Khóa Tuyến A (`RouteA: Blocked`) |
| **`F4`** | **Đá lăn (Rockfall Warning)** | Đất đá rơi rải rác từ sườn dốc Tuyến C |
| **`F5`** | **Sạt lở đất (Landslide Blocked)** | Taluy sập hoàn toàn → Khóa Tuyến C (`RouteC: Blocked`) |
| **`F6`** | **Hoàn thành Checkpoint** | Hoàn thành ngay mục tiêu checkpoint hiện tại |
| **`F7`** | **Tua nhanh +30 giây** | Nhảy mốc thời gian kịch bản tới trước |
| **`F8`** | **Khởi động lại (Reset)** | Reset lại toàn bộ kịch bản và vị trí |

---

## 7. Chi Tiết Kịch Bản Mẫu: FlashFloodEvacuationScenario

Timeline chuẩn được cài đặt theo diễn biến giáo dục:

- **00:00 (0s)**: Bắt đầu mô phỏng - Mưa to, sấm chớp kéo dài tại khu vực trường học.
- **00:30 (30s)**: `WarningIssued` - Còi báo động xã vang lên. Toàn trường nhận lệnh sơ tán (**Hoàn thành CP0**).
- **01:30 (90s)**: `RiverLevelRaised` - Nước suối chuyển màu nâu đỏ quánh, cuộn sóng dâng cao (**Hoàn thành CP2 khi quan sát**).
- **02:30 (150s)**: `BridgeWarning` - Nước lũ tràn sát mép cầu tạm ở Tuyến A. Rung lắc mạnh.
- **03:30 (210s)**: `BridgeBlocked` - **Cầu bị lũ cuốn sập hoàn toàn!** Tuyến A tự động đổi sang trạng thái `Blocked`. Vật cản NavMesh kích hoạt, NPC tự động quay đầu sang Tuyến B.
- **04:30 (270s)**: `RockfallStarted` - Đá dăm bắt đầu lăn xuống mặt đường Tuyến C.
- **05:30 (330s)**: `WarningIssued` - Xuất hiện vết nứt lớn dọc sườn dốc taluy dương Tuyến C.
- **06:30 (390s)**: `LandslideStarted` - **Sạt lở núi nghiêm trọng!** Hàng trăm khối đất đá vùi lấp Tuyến C (`RouteC: Blocked`).
- **Đích đến**: Học sinh chỉ có thể an toàn khi theo **Tuyến B** lên đồi cao, hỗ trợ bạn (**CP5**) và đến điểm tập kết (**CP7**).

---

## 8. Hệ Thống Điểm Số & Chuẩn Đầu Ra Sư Phạm (Scoring System)

Điểm số tối đa là **100 điểm**, chia làm 5 nhóm năng lực sư phạm theo đúng quy chuẩn:

| Danh Mục Đánh Giá | Điểm Tối Đa | Hành Động Đạt Điểm |
| :--- | :---: | :--- |
| **1. Nhận biết nguy cơ** (*HazardAwareness*) | **25 điểm** | Quan sát dấu hiệu nước suối đục ngầu cuốn cây cối (15đ); Kiểm tra độ an toàn của sườn dốc trước khi vượt dốc cuối (10đ). |
| **2. Lựa chọn tuyến đường** (*RouteChoice*) | **25 điểm** | Chọn tuyến đường đồi cao thay vì liều lĩnh qua suối (10đ); Chủ động đổi tuyến ngay khi thấy dấu hiệu nguy hiểm (15đ). |
| **3. Thời gian phản ứng** (*ReactionTime*) | **20 điểm** | Chú ý nghe còi báo động khẩn cấp (10đ); Rời khỏi khuôn viên trường học nhanh chóng, không nấn ná (10đ). |
| **4. An toàn tập thể** (*GroupSafety*) | **15 điểm** | Dừng lại hỗ trợ bạn Minh đang bị đau chân cùng di chuyển lên nơi cao (15đ). |
| **5. Hoàn thành sơ tán** (*EvacuationCompletion*) | **15 điểm** | Có mặt tại Điểm sơ tán an toàn trên đỉnh đồi và báo danh với phụ trách (15đ). |
| **TỔNG ĐIỂM** | **100 điểm** | **Xếp loại: Xuất sắc (≥85đ) \| Đạt (≥65đ) \| Cần rèn luyện (<65đ)** |

> Điểm số được cộng/trừ thông qua API: `ScoreManager.Instance.Add(category, delta, reason)`. Không bao giờ cộng trực tiếp từ UI.

---

## 9. Nhật Ký Hành Động & Báo Cáo Giáo Viên (PlayerActionLog)

Hệ thống ghi nhận từng hành vi theo dấu vết thời gian thực:
```text
00:00 Mô phỏng bắt đầu
00:30 Nhận cảnh báo sơ tán (CP0) (Score: +10)
00:45 Rời cổng trường an toàn (CP1) (Score: +10)
01:32 Quan sát phát hiện nước suối đục ngầu cuốn cành cây (CP2) (Score: +15)
01:50 Lựa chọn Tuyến B đường đồi cao (CP3) (Score: +10)
02:40 Cầu tạm bị nước lũ cuốn sập: Tuyến A bị phong tỏa
03:15 Hỗ trợ bạn Minh cùng sơ tán (CP5) (Score: +15)
04:20 Vượt qua ngã rẽ an toàn trước khi taluy sạt lở (CP6) (Score: +10)
05:10 Có mặt và điểm danh tại Nhà văn hóa an toàn (CP7) (Score: +15)
```
Khi kết thúc, hệ thống tự động tổng hợp **Báo cáo kết quả diễn tập** cho giáo viên/học sinh với đầy đủ nhận xét và phân tích kỹ năng.

---

## 10. Hướng Dẫn Mở Rộng Kỹ Thuật (Extension Guidelines)

### A. Cách Tạo Một Kịch Bản Mới (Create New Scenario)
1. Trong Unity Editor, click chuột phải trong cửa sổ Project:
   `Create -> DisasterSim -> Scenario Data`.
2. Điền `ScenarioId`, `DisplayName`, `DurationSeconds`.
3. Trong mảng `TimelineEvents`, thêm các sự kiện mong muốn:
   - Điền thời gian xuất hiện (`TriggerTimeSeconds`).
   - Chọn `EventType` (ví dụ `WarningIssued`, `RiverLevelRaised`, `RouteBlocked`).
   - Điền mục tiêu `TargetId` (ID của Hazard hoặc Route).
4. Kéo asset vừa tạo vào trường `Active Scenario` của `ScenarioManager` trong scene.

### B. Cách Thêm Một Checkpoint Mới
1. Tạo một GameObject mới trong scene (hoặc dùng menu `Create Empty`).
2. Gắn component `BoxCollider` (bật checkbox `Is Trigger = true`).
3. Gắn component `CheckpointTrigger`.
4. Điền `CheckpointId` (ví dụ: `CP8`) và độ rộng của vùng phát hiện.
5. Trong `CheckpointManager`, bổ sung thông tin `CheckpointData` tương ứng (Tên, điểm thưởng, danh mục tính điểm).

### C. Cách Khóa Tuyến Đường Từ Hazard Hoặc Script Bất Kỳ
Chỉ cần gọi một dòng code duy nhất:
```csharp
RouteManager.Instance.SetRouteState("RouteA", RouteState.Blocked, "Nước lũ dâng cao cuốn sập cầu");
```
Hệ thống sẽ tự động:
- Thông báo tới HUD để cập nhật biểu tượng trạng thái sang màu đỏ `[BỊ KHÓA]`.
- Kích hoạt `DynamicRouteObstacle`, chặn đường vật lý và khắc rãnh cấm trên NavMesh.
- Khiến các `EvacuationNpcAgent` tự động chuyển hướng tìm tuyến đường thay thế (`RouteB`).
- Ghi một dòng sự kiện vào `PlayerActionLog`.

---

## 11. Hướng Dẫn Tích Hợp VR / XR Trong Tương Lai (Future VR Integration)

Dự án được xây dựng theo tiêu chuẩn **XR-Ready**. Khi chuyển đổi sang VR (Meta Quest 2/3/Pro thông qua OpenXR):

### Những Gì SẼ GIỮ NGUYÊN (100% Codebase Logic):
- `GameManager`
- `ScenarioManager` & `ScenarioData`
- `HazardBase`, `FloodHazard`, `LandslideHazard`
- `RouteManager` & `DynamicRouteObstacle`
- `CheckpointManager` & `CheckpointTrigger`
- `ScoreManager`
- `PlayerActionLog`

### Các Bước Triển Khai VR (Chỉ cần thay đổi Presentation Layer):
1. **Thêm Package XR**:
   - Cài đặt `com.unity.xr.openxr` và `com.unity.xr.interaction.toolkit`.
2. **Thay Thế Input & Camera**:
   - Gắn `XRPlayerInput.cs` (đã viết sẵn) vào nhân vật thay cho `DesktopPlayerInput.cs`.
   - Trong `CameraManager`, gọi `SetCameraMode(CameraMode.VR)`.
   - Đặt prefab `XR Origin` (với Head Mounted Display và 2 tay cầm điều khiển) tại vị trí của Player.
3. **Tương Tác VR**:
   - Gắn `XRRayInteractor` hoặc `XRDirectInteractor` trên tay cầm để tương tác với các vật thể kế thừa `IInteractable` (Biển báo, quan sát mẫu nước suối, chìa tay giúp bạn học).

---

## 12. Danh Sách Unit Tests (EditMode Tests)

Các unit tests được đặt trong assembly `DisasterSim.Tests`:
- `RouteManagerTests.cs`: Kiểm tra trạng thái khởi tạo, chuyển trạng thái Open → Blocked, kích hoạt sự kiện.
- `HazardSystemTests.cs`: Kiểm tra chuyển đổi 4 nấc của lũ quét (`Normal` → `Rising` → `Dangerous` → `Blocked`) và 5 nấc của sạt lở đất.
- `ScoreManagerTests.cs`: Kiểm tra giới hạn điểm trần từng danh mục, tổng điểm 100đ, lịch sử ghi nhận điểm.
- `CheckpointManagerTests.cs`: Kiểm tra tuần tự checkpoint, tránh điểm danh trùng lặp, cộng điểm đúng danh mục.
- `ScenarioTimelineTests.cs`: Kiểm tra sắp xếp thứ tự sự kiện theo thời gian, tính năng tua nhanh (fast-forward).
- `ActionLogTests.cs`: Kiểm tra ghi nhận telemetry và xuất báo cáo đánh giá năng lực học sinh.

Chạy test bằng cách: Mở cửa sổ **Window -> General -> Test Runner** trong Unity Editor và bấm **Run All**.