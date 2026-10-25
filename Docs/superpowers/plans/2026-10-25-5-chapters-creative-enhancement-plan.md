# Kế Hoạch Triển Khai Nâng Cấp Toàn Diện 5 Chương: LLM Sáng Tạo, Giọng Lồng Tiếng, Đồ Họa Độc Bản & Di Chuyển WASD Ngữ Cảnh

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp toàn diện 5 chương game với 2–3 tình huống tương tác LLM sáng tạo mỗi chương (cả đối thoại và phi đối thoại), bài khảo hạch AI cuối chương để cấp quyền qua màn, hệ thống giọng lồng tiếng TTS tiếng Việt phân vai, background sinh mới 100% độc bản cho Chương 3–5 với hiệu ứng động, và các phân đoạn di chuyển WASD vượt chướng ngại vật thực địa.

**Architecture:** Bảo tồn 100% kiến trúc 2D Canvas và hệ thống State độc lập hiện có; bổ sung router chuyên biệt `server/debrief-ai-handler.js` tiếp nhận các tác vụ phân tích cứu hộ và chấm điểm sát hạch; tích hợp module `web/js/voice-tts.js` đọc thoại đa giọng điệu và module `web/js/situational-wasd.js` điều khiển di chuyển 2.5D ở các phân đoạn hành động.

**Tech Stack:** Node.js HTTP server, Google Gemini API (`gemini-3.5-flash-lite`), HTML5 Canvas, Web Speech API (Vietnamese SpeechSynthesis), CSS3 Keyframe Animations & Procedural Audio FX, Node.js Native Test Runner (`node:test`).

## Global Constraints

- **Không đập đi xây lại:** Kế thừa toàn bộ mã nguồn, cấu trúc Route Graph và Independent Checkpoints của 5 chương hiện tại.
- **Bảo lưu lựa chọn liên chương (Cross-chapter persistence):** Duyên có gấu bông hay không từ Chương 01 tiếp tục truyền xuyên suốt tới Chương 05.
- **Mô hình AI:** Google Gemini `gemini-3.5-flash-lite`, timeout 3500ms, fallback 100% an toàn không bao giờ làm crash game.
- **Zero Regression:** Toàn bộ 101 tests hiện có phải tiếp tục PASS 100%.

---

### Task 1: Hệ Thống Giọng Lồng Tiếng Phân Vai & Âm Thanh Cứu Hộ

**Files:**
- Create: `web/js/voice-tts.js`
- Test: `tests/task-1-voice-tts.test.cjs`

**Interfaces:**
- Produces: `window.VoiceTTS = { speak(speaker, text), stop(), toggle(), isEnabled() }`
- Consumes: `window.speechSynthesis` (Web Speech API)

- [ ] **Step 1: Viết failing test kiểm tra voice-tts.js**

```javascript
// tests/task-1-voice-tts.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 1: File web/js/voice-tts.js phải tồn tại và xuất cấu hình phân vai 6 nhân vật', () => {
  const filePath = path.resolve(__dirname, '../web/js/voice-tts.js');
  assert.ok(fs.existsSync(filePath), 'Thiếu web/js/voice-tts.js');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.includes('VOICE_PROFILES'), 'Thiếu VOICE_PROFILES');
  assert.ok(content.includes('thao'), 'Thiếu profile thao');
  assert.ok(content.includes('manh'), 'Thiếu profile manh');
  assert.ok(content.includes('minh_anh'), 'Thiếu profile minh_anh');
  assert.ok(content.includes('minh'), 'Thiếu profile minh');
  assert.ok(content.includes('duyen'), 'Thiếu profile duyen');
  assert.ok(content.includes('ban'), 'Thiếu profile ban');
});

test('Task 1: VoiceTTS cung cấp đầy đủ các phương thức điều khiển', () => {
  const VoiceTTS = require('../web/js/voice-tts.js');
  assert.equal(typeof VoiceTTS.speak, 'function');
  assert.equal(typeof VoiceTTS.stop, 'function');
  assert.equal(typeof VoiceTTS.toggle, 'function');
  assert.equal(typeof VoiceTTS.isEnabled, 'function');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-1-voice-tts.test.cjs`  
Expected: FAIL with "Cannot find module '../web/js/voice-tts.js'"

- [ ] **Step 3: Triển khai `web/js/voice-tts.js`**
Tạo file `web/js/voice-tts.js` với các thông số pitch/rate phù hợp giọng tiếng Việt cho từng nhân vật, hỗ trợ cả browser và Node.js test environment.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-1-voice-tts.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/js/voice-tts.js tests/task-1-voice-tts.test.cjs
git commit -m "feat(audio): implement character-specific Vietnamese voice TTS engine"
```

---

### Task 2: Backend AI Routers — Khảo Hạch Pass Chương & Phân Tích Cứu Hộ

**Files:**
- Create: `server/debrief-ai-handler.js`
- Modify: `server.js`
- Test: `tests/task-2-debrief-ai-handler.test.cjs`

**Interfaces:**
- Produces: 
  - `handleChapterDebrief({ chapter, question, playerAnswer })` -> `{ passed: boolean, feedback: string }`
  - `handleBridgeBlueprint({ inspectionData })` -> `{ zones: Array, tacticalNote: string }`
  - `handleIncidentDispatch({ hazards })` -> `{ dispatchCode: string, reportText: string }`
  - `handleMedicalTriage({ caseId, solutionText })` -> `{ approved: boolean, critique: string }`
- Consumes: `server/gemini-client.js`, `server/env-loader.js`

- [ ] **Step 1: Viết failing test cho `server/debrief-ai-handler.js`**

```javascript
// tests/task-2-debrief-ai-handler.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { 
  handleChapterDebrief, 
  handleBridgeBlueprint, 
  handleIncidentDispatch, 
  handleMedicalTriage 
} = require('../server/debrief-ai-handler.js');

test('Task 2: handleChapterDebrief đánh giá câu trả lời đúng trọng tâm là PASS', async () => {
  const res = await handleChapterDebrief({
    chapter: 1,
    question: 'Khi có báo động sơ tán khẩn cấp, thái độ đúng đắn đối với đồ đạc để quên là gì?',
    playerAnswer: 'Tính mạng là quan trọng nhất, không quay lại lấy đồ để quên, đi theo cô giáo ngay lập tức.'
  });
  assert.equal(res.success, true);
  assert.equal(res.passed, true);
  assert.ok(res.feedback.length > 5);
});

test('Task 2: handleBridgeBlueprint phân tích 3 điểm kiểm tra thành phác đồ qua cầu', async () => {
  const res = await handleBridgeBlueprint({
    inspection: ['Mối buộc tre lỏng', 'Thân tre đực rêu trơn', 'Dòng xoáy mạn phải']
  });
  assert.equal(res.success, true);
  assert.ok(Array.isArray(res.zones) && res.zones.length >= 3);
});

test('Task 2: handleMedicalTriage phản biện ca hạ thân nhiệt và ngạt khí CO', async () => {
  const resHypothermia = await handleMedicalTriage({
    caseId: 'hypothermia',
    solutionText: 'Lau khô, thay quần áo khô, ủ ấm ngực bụng từ từ bằng chăn ấm, không hơ trực tiếp vào lửa nóng'
  });
  assert.equal(resHypothermia.approved, true);

  const resStove = await handleMedicalTriage({
    caseId: 'co_hazard',
    solutionText: 'Mở toang cửa sổ thông gió, dập tắt bếp than và mang ra ngoài hiên thoáng khí'
  });
  assert.equal(resStove.approved, true);
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-2-debrief-ai-handler.test.cjs`  
Expected: FAIL with "Cannot find module '../server/debrief-ai-handler.js'"

- [ ] **Step 3: Triển khai `server/debrief-ai-handler.js` & mở route trong `server.js`**
Xây dựng logic phân tích sư phạm cứu hộ, timeout 3500ms, fallback an toàn cho cả 4 endpoints (`/api/debrief/evaluate`, `/api/tactical/bridge-blueprint`, `/api/tactical/incident-dispatch`, `/api/medical/triage-solver`).

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-2-debrief-ai-handler.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add server/debrief-ai-handler.js server.js tests/task-2-debrief-ai-handler.test.cjs
git commit -m "feat(ai): implement debrief evaluation, bridge blueprint, and triage solvers"
```

---

### Task 3: Nâng Cấp Chương 01 — Lớp 4B Trong Mưa Lớn

**Files:**
- Modify: `web/index.html`
- Modify: `web/js/story.js`
- Modify: `web/js/game.js`
- Test: `tests/task-3-chapter01-enhancement.test.cjs`

**Interfaces:**
- Produces:
  - Tình huống LLM 1: Đàm thoại AI với Duyên khi quên mật mã tủ gấu.
  - Tình huống LLM 2: Đối thoại với Cô Thảo về nguyên tắc tính mạng vs đồ đạc.
  - Mini-sequence WASD né chậu cây ngã trên hành lang ướt trơn.
  - Khảo hạch AI Cô Thảo cấp huy hiệu `PASS CHƯƠNG 01`.

- [ ] **Step 1: Viết failing test kiểm tra nâng cấp Chương 01**

```javascript
// tests/task-3-chapter01-enhancement.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 3: web/index.html và story.js hỗ trợ đối thoại LLM Duyên và Cô Thảo', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/index.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'HTML phải nạp voice-tts.js');
  assert.ok(html.includes('id="ch1-debrief-modal"') || html.includes('debrief'), 'Phải có modal khảo hạch');
});

test('Task 3: game.js có cơ chế kiểm tra Pass Chương 01 trước khi mở Chương 02', () => {
  const gameJs = fs.readFileSync(path.resolve(__dirname, '../web/js/game.js'), 'utf8');
  assert.ok(gameJs.includes('debrief') || gameJs.includes('PASS'), 'Phải có logic khảo hạch cuối chương');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-3-chapter01-enhancement.test.cjs`  
Expected: FAIL

- [ ] **Step 3: Triển khai các tình huống LLM, mini-sequence WASD hành lang và khảo hạch Cô Thảo**
Nạp `voice-tts.js`, gắn hook đàm thoại Duyên/Cô Thảo, bổ sung mini-sequence WASD 15s và modal khảo hạch AI cấp thẻ `PASS CHƯƠNG 01`.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-3-chapter01-enhancement.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/index.html web/js/story.js web/js/game.js tests/task-3-chapter01-enhancement.test.cjs
git commit -m "feat(ch01): enhance Chapter 01 with Duyen AI dialogue, hallway WASD, and AI debrief"
```

---

### Task 4: Nâng Cấp Chương 02 — Ba Con Đường

**Files:**
- Modify: `web/chapter02.html`
- Modify: `web/js/chapter02.js`
- Test: `tests/task-4-chapter02-enhancement.test.cjs`

**Interfaces:**
- Produces:
  - Tình huống LLM 1: Tranh luận an toàn với Duyên tại ngã ba (Duyên đòi đi Cầu treo 200m).
  - Tình huống LLM 2: Báo cáo thực địa & trao đổi nghiệp vụ với Bác Mạnh tại đầu Cầu Bắc.
  - Mini-sequence WASD giữ thăng bằng tim Cầu Bắc trong gió giật.
  - Khảo hạch AI Bác Mạnh & Cô Thảo cấp `PASS CHƯƠNG 02`.

- [ ] **Step 1: Viết failing test kiểm tra nâng cấp Chương 02**

```javascript
// tests/task-4-chapter02-enhancement.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 4: chapter02.html nạp voice-tts.js và có giao diện tranh luận với Duyên', () => {
  const html = fs.readFileSync(path.resolve(__dirname, '../web/chapter02.html'), 'utf8');
  assert.ok(html.includes('voice-tts.js'), 'Thiếu nạp voice-tts.js');
});

test('Task 4: chapter02.js có khảo hạch AI kết thúc chương thay thế trắc nghiệm cũ', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter02.js'), 'utf8');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API khảo hạch cuối chương');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-4-chapter02-enhancement.test.cjs`  
Expected: FAIL

- [ ] **Step 3: Triển khai tình huống tranh luận Duyên, phỏng vấn Bác Mạnh, WASD Cầu Bắc và khảo hạch AI**
Cập nhật `web/chapter02.html` và `web/js/chapter02.js`.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-4-chapter02-enhancement.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/chapter02.html web/js/chapter02.js tests/task-4-chapter02-enhancement.test.cjs
git commit -m "feat(ch02): enhance Chapter 02 with Duyen debate, bridge WASD, and AI oral debrief"
```

---

### Task 5: Nâng Cấp Chương 03 — Vết Nứt Sườn Đồi (Đồ Họa Mới & FX Động)

**Files:**
- Create: 4 ảnh nền mới độc bản trong `web/assets/chapter03/` (`ridge_entry.webp`, `crack_zone.webp`, `mudflow_bend.webp`, `boulder_pass.webp`)
- Modify: `web/chapter03.html`
- Modify: `web/chapter03.css`
- Modify: `web/js/chapter03.js`
- Test: `tests/task-5-chapter03-enhancement.test.cjs`

**Interfaces:**
- Produces:
  - 4 background mới 100% vẽ riêng về sạt lở núi dốc.
  - FX rung màn hình (Screen Shake) và tiếng đá lăn lở rầm rập.
  - Tình huống LLM 1: Báo cáo bộ đàm khẩn cấp cho Trưởng làng Minh Anh về vệt nứt D1.
  - Tình huống LLM 2: Can ngăn Bác Mạnh không trèo qua đá tảng rêu trơn.
  - Mini-sequence WASD cầm gậy dò đường, bước trên gờ đá né vũng bùn lún.
  - Khảo hạch AI Trưởng làng Minh Anh qua bộ đàm cấp `PASS CHƯƠNG 03`.

- [ ] **Step 1: Viết failing test kiểm tra nâng cấp Chương 03**

```javascript
// tests/task-5-chapter03-enhancement.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 5: chapter03.js tích hợp hiệu ứng screen shake và gọi API debrief', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter03.js'), 'utf8');
  assert.ok(js.includes('screen-shake') || js.includes('shake'), 'Phải có hiệu ứng screen shake');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API debrief');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-5-chapter03-enhancement.test.cjs`  
Expected: FAIL

- [ ] **Step 3: Tạo 4 ảnh nền độc bản chuyên biệt, triển khai Screen Shake FX, WASD bùn lún và khảo hạch Trưởng làng**
Sinh ảnh nền mới tỷ lệ 16:9 độ chi tiết cao, gắn CSS screen shake animation và logic bộ đàm AI.

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-5-chapter03-enhancement.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/assets/chapter03 web/chapter03.html web/chapter03.css web/js/chapter03.js tests/task-5-chapter03-enhancement.test.cjs
git commit -m "feat(ch03): add custom landslide art, screen shake FX, mudflow WASD, and AI radio exam"
```

---

### Task 6: Nâng Cấp Chương 04 — Chia Cắt & Cứu Bạn Học (AI Giám Định Kỹ Thuật Cầu Tre)

**Files:**
- Create: 4 ảnh nền mới độc bản trong `web/assets/chapter04/` (`village_outskirts.webp`, `isolation_post.webp`, `bamboo_bridge.webp`, `safe_ascent.webp`)
- Modify: `web/chapter04.html`
- Modify: `web/chapter04.css`
- Modify: `web/js/chapter04.js`
- Test: `tests/task-6-chapter04-enhancement.test.cjs`

**Interfaces:**
- Produces:
  - 4 background mới 100% về xóm đồi ngập lụt ven suối và cầu tre dã chiến.
  - FX dòng suối lũ cuộn xoáy và cầu tre đu đưa.
  - Tình huống LLM 1: Đối thoại tâm lý thuyết phục Minh bỏ tranh cứu mạng (chiều sâu cảm xúc).
  - Tình huống LLM 2 (Phi đối thoại): AI Giám định hiện trường & Lập phác đồ vượt cầu tre (Tactical Crossing Blueprint).
  - Mini-sequence WASD bọc lót cho Minh qua cầu tre rung lắc theo phác đồ.
  - Khảo hạch AI Cô Thảo & Minh cấp `PASS CHƯƠNG 04`.

- [ ] **Step 1: Viết failing test kiểm tra nâng cấp Chương 04**

```javascript
// tests/task-6-chapter04-enhancement.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 6: chapter04.js tích hợp Tactical Bridge Blueprint API và WASD crossing', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter04.js'), 'utf8');
  assert.ok(js.includes('/api/tactical/bridge-blueprint'), 'Phải gọi API bridge blueprint');
  assert.ok(js.includes('/api/debrief/evaluate'), 'Phải gọi API debrief');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-6-chapter04-enhancement.test.cjs`  
Expected: FAIL

- [ ] **Step 3: Tạo 4 ảnh nền độc bản, triển khai module AI Giám định kỹ thuật cầu tre, WASD thăng bằng và khảo hạch Cô Thảo/Minh**

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-6-chapter04-enhancement.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/assets/chapter04 web/chapter04.html web/chapter04.css web/js/chapter04.js tests/task-6-chapter04-enhancement.test.cjs
git commit -m "feat(ch04): add flood art, AI structural blueprint, bridge WASD, and AI rescue debrief"
```

---

### Task 7: Nâng Cấp Chương 05 — Đỉnh Đồi An Toàn (AI Biên Tập Bức Điện Cứu Nạn & 3 Ca Khủng Hoảng Y Tế)

**Files:**
- Create: 3 ảnh nền mới độc bản trong `web/assets/chapter05/` (`summit_gate.webp`, `command_post.webp`, `safe_hall.webp`)
- Modify: `web/chapter05.html`
- Modify: `web/chapter05.css`
- Modify: `web/js/chapter05.js`
- Test: `tests/task-7-chapter05-enhancement.test.cjs`

**Interfaces:**
- Produces:
  - 3 background mới 100% về trạm cứu hộ cờ đỏ trong nắng rạng, phòng chỉ huy bản đồ, hội trường bếp lửa.
  - FX vệt nắng hửng rạng và bếp lửa reo tí tách.
  - Mini-sequence WASD dẫn đoàn 5 người bước qua cổng an toàn.
  - Tình huống LLM 1 (Phi đối thoại): AI Biên tập Bức điện Cứu nạn Khẩn cấp gửi Huyện từ dữ liệu bản đồ.
  - Tình huống LLM 2 (Tư duy y tế sâu sắc): Giải quyết 3 ca khủng hoảng sau bão (Hạ thân nhiệt của Minh, Vết thương sâu Bác Mạnh, Nguy cơ ngạt khí CO) với AI Chữ Thập Đỏ phản biện.
  - Khảo Hạch AI Tốt Nghiệp: Trưởng làng Minh Anh & Cô Thảo phỏng vấn đúc kết 5 chương ➔ LLM tự động khắc lời khen cá nhân hóa lên Chứng Nhận Chiến Sĩ Nhí An Toàn.

- [ ] **Step 1: Viết failing test kiểm tra nâng cấp Chương 05**

```javascript
// tests/task-7-chapter05-enhancement.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('Task 7: chapter05.js tích hợp AI Incident Dispatch và Medical Triage Solver', () => {
  const js = fs.readFileSync(path.resolve(__dirname, '../web/js/chapter05.js'), 'utf8');
  assert.ok(js.includes('/api/tactical/incident-dispatch'), 'Phải gọi API incident dispatch');
  assert.ok(js.includes('/api/medical/triage-solver'), 'Phải gọi API medical triage');
  assert.ok(js.includes('cert-card'), 'Phải hiển thị chứng nhận cá nhân hóa');
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**
Run: `node --test tests/task-7-chapter05-enhancement.test.cjs`  
Expected: FAIL

- [ ] **Step 3: Tạo 3 ảnh nền độc bản, triển khai AI Dispatcher, Medical Triage Solver, Khảo hạch tốt nghiệp và khắc lời khen cá nhân hóa lên Chứng chỉ**

- [ ] **Step 4: Chạy test để xác nhận PASS**
Run: `node --test tests/task-7-chapter05-enhancement.test.cjs`  
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add web/assets/chapter05 web/chapter05.html web/chapter05.css web/js/chapter05.js tests/task-7-chapter05-enhancement.test.cjs
git commit -m "feat(ch05): add refuge art, AI dispatch compiler, triage solver, and personalized honors cert"
```

---

### Task 8: Full Regression Suite, UI Polish & Push lên GitHub

**Files:**
- Create: `tests/full-5-chapters-regression.test.cjs`
- Modify: `README.md`

- [ ] **Step 1: Viết bài test hồi quy tổng thể 5 chương**
Kiểm tra khả năng đi từ Ch1 ➔ Ch2 ➔ Ch3 ➔ Ch4 ➔ Ch5, xác nhận tất cả các router LLM phản hồi đúng chuẩn, các bài khảo hạch cấp thẻ Pass chuẩn xác.

- [ ] **Step 2: Chạy full test suite**
Run: `npm test`  
Expected: $\ge 120$ tests PASS 100% (Zero regression).

- [ ] **Step 3: Cập nhật tài liệu `README.md`**
Ghi chép chi tiết các tính năng mới: Phác đồ cầu tre, Bức điện cứu nạn huyện, Xử lý y tế 3 ca, Khảo hạch AI cuối chương và Giọng đọc TTS.

- [ ] **Step 4: Commit và Push lên `origin feat/2D-chapter1to5`**
```bash
git add README.md tests/full-5-chapters-regression.test.cjs
git commit -m "chore(release): complete full 5-chapter creative enhancement and regression suite"
git push -u origin feat/2D-chapter1to5
```
