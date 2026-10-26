(() => {
  'use strict';

  const D = window.Chapter05;
  const P = window.Chapter05Puzzles;
  const R = window.RadioAI;
  const $ = (id) => document.getElementById(id);
  const KEY = 'ongdia.chapter05.v1';

  let s = D.initial();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw) s = D.restore(raw);
  } catch (_) {}

  let queue = [];
  let afterDialogue = null;
  const portraits = {
    'Bạn': 'ban',
    'Duyên': 'duyen',
    'Thảo': 'thao',
    'Mạnh': 'manh',
    'Minh': 'minh',
    'Minh Anh': 'minh-anh'
  };

  const sceneIntros = {
    summit_gate: [
      ['Bạn', 'Lá cờ Tổ quốc trên đỉnh đồi kìa! Mưa đã ngớt dần rồi!'],
      ['Bác Mạnh', 'Chúng ta đã tới cổng điểm sơ tán an toàn số 1. Làm thủ tục báo danh với dân phòng trực cổng thôi!'],
      ['Cô Thảo', 'Cả nhóm vẫn nguyên vẹn bên nhau. Cô tự hào về các em lắm!']
    ],
    command_post: [
      ['Trưởng làng Minh Anh', 'Hoan hô cô trò và chú Mạnh! Đoàn 5 người đều an toàn trọn vẹn!'],
      ['Bác Mạnh', 'Báo cáo Trưởng làng: Chúng tôi đã kiểm soát được tình hình và đưa cả cháu Minh lên đây.'],
      ['Trưởng làng Minh Anh', 'Các cháu đã làm rất tốt. Hãy bàn giao lại các điểm nguy hiểm trên đường để cắm biển cảnh báo!']
    ],
    safe_hall: [
      ['Duyên', 'Bếp lửa ấm quá! Tất cả các bạn trong trường đều đã lên đây rồi!'],
      ['Bạn Minh', 'Mẹ mình cũng ở đây! Mẹ ôm mình khóc và nói còn mình là còn tất cả... Cảm ơn các bạn!'],
      ['Cô Thảo', 'Giờ là lúc cùng làm bài kiểm tra tổng kết 5 chương để nhận Chứng Nhận Chiến Sĩ An Toàn!']
    ]
  };

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
      $('save').textContent = 'ĐÃ LƯU HÀNH TRÌNH';
    } catch (_) {
      $('save').textContent = 'KHÔNG THỂ LƯU';
    }
  }

  function objective() {
    if (s.complete) return 'Toàn bộ 5 Chương hoàn thành xuất sắc! Đã nhận Chứng Chỉ An Toàn.';
    if (s.scene === 'summit_gate') {
      return (s.solved.includes('summit_gate') || s.solved.includes('gate_march'))
        ? 'Tiến vào Trạm chỉ huy gặp Trưởng làng Minh Anh.'
        : 'Dẫn đoàn 5 người bước qua cổng an toàn đỉnh đồi.';
    }
    if (s.scene === 'command_post') {
      return (s.solved.includes('command_post') || s.solved.includes('incident_dispatch'))
        ? 'Tiến vào Hội trường an toàn để chăm sóc sức khỏe.'
        : 'Biên tập bức điện cứu hộ khẩn cấp gửi Ban chỉ huy Huyện.';
    }
    if (s.scene === 'safe_hall') {
      if (!s.solved.includes('medical_triage')) {
        return 'Xử lý sơ cứu 3 ca khủng hoảng y tế sau bão theo chuẩn Chữ thập đỏ.';
      }
      return s.solved.includes('safe_hall')
        ? 'Làm bài Khảo hạch AI tốt nghiệp để nhận Chứng Chỉ An Toàn!'
        : 'Vượt qua bài trắc nghiệm tổng hợp 5 chương thực địa.';
    }
    return 'Di chuyển an toàn theo hướng dẫn.';
  }

  function render() {
    const scene = D.scenes[s.scene];
    if (!scene) return;

    $('spots').hidden = !s.started;
    $('scene-name').textContent = scene.name;
    const landscape = $('landscape');
    if (landscape) {
      landscape.style.backgroundImage = `url('assets/chapter05/${scene.art}.webp')`;
      landscape.style.backgroundPosition = scene.position || 'center';
      landscape.classList.remove('sunrise-glow', 'hearth-fire');
      if (s.scene === 'summit_gate') landscape.classList.add('sunrise-glow');
      if (s.scene === 'safe_hall') landscape.classList.add('hearth-fire');
    }
    $('objective').textContent = objective();
    $('progress').textContent = `${s.solved.length}/3 bài học · ${s.clues.length}/7 dấu hiệu`;

    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS?.isEnabled?.() ? 'bật' : 'tắt');
    }

    // Minhanh world sprite at command_post
    const minhAnhWorld = $('minhanh-world');
    if (minhAnhWorld) {
      minhAnhWorld.hidden = !s.started || s.scene !== 'command_post';
    }

    $('spots').replaceChildren();
    for (const p of scene.spots) {
      const btn = document.createElement('button');
      const isSpecial = p.type === 'exit' || p.type === 'cert_award' || p.type === 'gate_march' || p.type === 'incident_dispatch' || p.type === 'medical_triage';
      const isSolved = s.clues.includes(p.id) || s.solved.includes(p.puzzle) || s.solved.includes(p.type);
      btn.className = 'spot ' + (isSpecial ? 'exit ' : '') + (isSolved ? 'seen' : '');
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.textContent = p.label;
      if (p.sub) {
        const sub = document.createElement('small');
        sub.textContent = p.sub;
        btn.appendChild(sub);
      }
      btn.onclick = () => onSpotClick(p);
      $('spots').appendChild(btn);
    }

    $('party').style.left = s.position.x + '%';
    $('party').style.top = s.position.y + '%';
    $('party').hidden = !s.started;
    $('scene-caption').hidden = !s.started;
    $('mission').hidden = !s.started;

    if (R && typeof R.setScene === 'function') {
      R.setScene(s.scene);
    }
  }

  function onSpotClick(p) {
    if (!$('dialogue').hidden || !$('modal').hidden) return;

    s.position.x = Math.max(15, Math.min(85, p.x));
    s.position.y = Math.max(75, Math.min(90, p.y + 12));
    render();

    if (p.type === 'clue') {
      if (!s.clues.includes(p.id)) {
        s.clues.push(p.id);
        save();
      }
      speak([[p.speaker, p.text]]);
      return;
    }

    if (p.type === 'gate_march') {
      startSummitGateMarch();
      return;
    }

    if (p.type === 'incident_dispatch') {
      openIncidentDispatchModal();
      return;
    }

    if (p.type === 'medical_triage') {
      openMedicalTriageModal();
      return;
    }

    if (p.type === 'puzzle') {
      openPuzzleModal(p.puzzle);
      return;
    }

    if (p.type === 'exit') {
      if (D.canTravel(s, p.to)) {
        s.scene = p.to;
        if (!s.visited.includes(p.to)) {
          s.visited.push(p.to);
          render();
          speak(sceneIntros[p.to] || []);
        } else {
          render();
        }
        save();
      } else {
        speak([['Trưởng làng Minh Anh', 'Cần hoàn tất báo danh và kiểm tra an toàn từng bước một!']]);
      }
      return;
    }

    if (p.type === 'cert_award') {
      if (s.solved.includes('safe_hall') || s.solved.includes('medical_triage')) {
        openGraduationDebriefModal();
      } else {
        speak([['Cô Thảo', 'Hãy hoàn thành bài kiểm tra và cấp cứu 3 ca y tế trước khi làm bài khảo hạch tốt nghiệp nhé các em!']]);
      }
      return;
    }
  }

  function speak(lines, done) {
    queue = lines.slice();
    afterDialogue = done || null;
    $('dialogue').hidden = false;
    advanceDialogue();
  }

  function advanceDialogue() {
    if (!queue.length) {
      $('dialogue').hidden = true;
      if (afterDialogue) {
        const fn = afterDialogue;
        afterDialogue = null;
        fn();
      }
      return;
    }
    const [speaker, text] = queue.shift();
    $('speaker').textContent = speaker;
    $('line').textContent = text;
    const pKey = portraits[speaker] || 'ban';
    $('portrait').src = `assets/characters/${pKey}/idle.png`;
    $('portrait').alt = speaker;

    if (window.VoiceTTS?.isEnabled?.()) {
      window.VoiceTTS.speak(speaker, text);
    }
  }

  function openPuzzleModal(puzzleId) {
    const puzzle = P.puzzles[puzzleId];
    if (!puzzle) return;

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">TỔNG KẾT THỰC ĐỊA</small>
        <button id="close-puzzle" style="padding:4px 10px">×</button>
      </div>
      <h2>${puzzle.title}</h2>
      <p>${puzzle.intro}</p>
      <p style="color:#d5bd87;font-size:12px;margin:8px 0"><em>💡 Gợi ý: ${puzzle.hint}</em></p>
      <div id="puzzle-body"></div>
      <div id="puzzle-feedback"></div>
      <div class="buttons">
        <button id="submit-puzzle" class="primary">Xác nhận câu trả lời ↵</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-puzzle').onclick = () => { $('modal').hidden = true; };

    const body = $('puzzle-body');
    let userState = null;

    if (puzzle.kind === 'sequence') {
      userState = [];
      body.innerHTML = `
        <ol class="puzzle-slots" id="slots">
          ${puzzle.answer.map(() => '<li>(Bấm thẻ bên dưới để xếp vào)</li>').join('')}
        </ol>
        <div class="puzzle-cards" id="cards">
          ${puzzle.options.map(([val, label]) => `<button type="button" class="card-btn" data-val="${val}">${label}</button>`).join('')}
        </div>
      `;

      const cards = body.querySelectorAll('.card-btn');
      cards.forEach((btn) => {
        btn.onclick = () => {
          const val = btn.dataset.val;
          if (userState.includes(val)) {
            userState = userState.filter((v) => v !== val);
            btn.style.opacity = '1';
          } else if (userState.length < puzzle.answer.length) {
            userState.push(val);
            btn.style.opacity = '0.4';
          }
          renderSequenceSlots(userState, puzzle);
        };
      });
    } else if (puzzle.kind === 'matching') {
      userState = {};
      body.innerHTML = puzzle.rows.map(([rId, rLabel]) => `
        <div class="match-row">
          <div><strong>${rLabel}</strong></div>
          <div>
            <select data-row="${rId}">
              <option value="">-- Chọn quyết định chính xác --</option>
              ${puzzle.options.map(([oVal, oText]) => `<option value="${oVal}">${oText}</option>`).join('')}
            </select>
          </div>
        </div>
      `).join('');

      body.querySelectorAll('select').forEach((sel) => {
        sel.onchange = (e) => {
          userState[e.target.dataset.row] = e.target.value;
        };
      });
    }

    $('submit-puzzle').onclick = () => {
      const isCorrect = P.correct(puzzleId, userState);
      const fb = $('puzzle-feedback');
      if (isCorrect) {
        fb.textContent = '✓ Xuất sắc! Toàn bộ các quyết định ứng phó thiên tai đều chuẩn xác.';
        fb.style.color = '#73d13d';
        if (!s.solved.includes(puzzleId)) {
          s.solved.push(puzzleId);
          save();
        }
        setTimeout(() => {
          $('modal').hidden = true;
          render();
          if (puzzleId === 'summit_gate') {
            startSummitGateMarch();
          } else if (puzzleId === 'command_post') {
            openIncidentDispatchModal();
          } else if (puzzleId === 'safe_hall') {
            openMedicalTriageModal();
          } else {
            speak([['Trưởng làng Minh Anh', 'Rất tốt! Cả đoàn đã chứng minh được kiến thức sinh tồn vững vàng!']]);
          }
        }, 1100);
      } else {
        fb.textContent = '✗ Quyết định chưa chuẩn xác. Hãy đọc kỹ gợi ý và thử lại!';
        fb.style.color = '#ff7875';
      }
    };
  }

  function renderSequenceSlots(arr, puzzle) {
    const slots = document.querySelectorAll('#slots li');
    slots.forEach((li, idx) => {
      if (arr[idx]) {
        const opt = puzzle.options.find(([v]) => v === arr[idx]);
        li.textContent = opt ? opt[1] : arr[idx];
        li.style.borderColor = 'var(--gold)';
        li.style.background = '#1a332d';
      } else {
        li.textContent = '(Chưa chọn)';
        li.style.borderColor = '#d5bd8760';
        li.style.background = '#0b1d22';
      }
    });
  }

  // Mini-sequence WASD dẫn đoàn 5 người bước qua cổng an toàn
  function startSummitGateMarch(done) {
    let gateProgress = 0; // 0 to 100
    let lastTime = performance.now();
    let animFrame = null;
    let activeStep = false;
    const held = new Set();

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">MINI-SEQUENCE WASD · CỔNG ĐỈNH ĐỒI AN TOÀN</small>
        <button id="close-gate-march" style="padding:4px 10px">×</button>
      </div>
      <h2>Dẫn Đoàn 5 Người Bước Qua Cổng An Toàn</h2>
      <p style="font-size:13px;line-height:1.7;color:#c8d4cf">
        Lá cờ đỏ sao vàng trên đỉnh đồi đang phần phật bay trong nắng mai. Dùng phím <kbd>W</kbd> / <kbd>Space</kbd> (hoặc nút <strong>Bước nhịp đều 🚶‍♂️</strong>) để dẫn đầu đoàn 5 người cùng tiến bước; dùng phím <kbd>A</kbd> / <kbd>D</kbd> để giữ cự ly đội hình, bọc lót cho Minh và đảm bảo cả đoàn qua cổng an toàn!
      </p>

      <div style="background:#091619;border:1px solid var(--line);border-radius:6px;padding:14px;margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span style="color:var(--gold);font-weight:600">ĐỘI HÌNH ĐOÀN 5 NGƯỜI: Bạn (Dẫn đầu) · Cô Thảo · Duyên · Minh · Bác Mạnh (Chốt hậu)</span>
          <span id="gate-march-status" style="color:#52c41a;font-weight:600">🚶‍♂️ TIẾN BƯỚC NHỊP NHÀNG</span>
        </div>

        <div class="gate-march-lane" id="gate-track">
          <div class="gate-arch-target" title="Cổng điểm tập kết số 1">
            <span style="font-size:22px">🇻🇳</span>
            <span>CỔNG AN TOÀN</span>
          </div>
          <div id="gate-party-marker" class="gate-party-marker" style="left:5%">
            <div class="gate-party-avatar" title="Bạn (Dẫn đầu)">🚶‍♂️</div>
            <div class="gate-party-avatar" title="Cô Thảo">👩‍🏫</div>
            <div class="gate-party-avatar" title="Duyên">👧</div>
            <div class="gate-party-avatar" title="Minh">👦</div>
            <div class="gate-party-avatar" title="Bác Mạnh">👨‍🚒</div>
            <div class="gate-party-info">
              <strong style="color:var(--gold)">ĐOÀN 5 NGƯỜI</strong>
              <small style="color:#a0c2a7">HỘI TỤ ĐẦY ĐỦ</small>
            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:11px;color:#8aa098;margin-top:6px">
          <span>Sườn dốc cuối cùng (+175m)</span>
          <span style="color:#ffd591">Nắng mai rạng rỡ ☀️</span>
          <span style="color:#52c41a">Điểm sơ tán số 1 (+180m)</span>
        </div>
      </div>

      <p id="gate-progress-text" style="color:var(--gold);font-size:13px;font-weight:500;margin:8px 0">
        Tiến độ qua cổng an toàn: 0% · Đang chỉnh đốn hàng ngũ
      </p>

      <div class="buttons" style="display:flex;gap:8px">
        <button id="gate-left" style="flex:1">◀ Bọc lót trái (A)</button>
        <button id="gate-step" class="primary" style="flex:2">Bước nhịp đều dẫn đoàn (W / Space) 🚶‍♂️</button>
        <button id="gate-right" style="flex:1">Bọc lót phải (D) ▶</button>
      </div>
    `;

    $('modal').hidden = false;

    const cleanup = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (animFrame) cancelAnimationFrame(animFrame);
    };

    $('close-gate-march').onclick = () => {
      $('modal').hidden = true;
      cleanup();
    };

    const gStep = $('gate-step');
    gStep.onpointerdown = (e) => { e.preventDefault(); activeStep = true; gStep.setPointerCapture(e.pointerId); };
    gStep.onpointerup = gStep.onpointercancel = gStep.onlostpointercapture = () => { activeStep = false; };

    const gLeft = $('gate-left');
    gLeft.onpointerdown = (e) => { e.preventDefault(); held.add('a'); gLeft.setPointerCapture(e.pointerId); };
    gLeft.onpointerup = gLeft.onpointercancel = gLeft.onlostpointercapture = () => { held.delete('a'); };

    const gRight = $('gate-right');
    gRight.onpointerdown = (e) => { e.preventDefault(); held.add('d'); gRight.setPointerCapture(e.pointerId); };
    gRight.onpointerup = gRight.onpointercancel = gRight.onlostpointercapture = () => { held.delete('d'); };

    const onKeyDown = (e) => {
      held.add(e.key.toLowerCase());
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      held.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const frame = (now) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      const isWalking = activeStep || held.has('w') || held.has('arrowup') || held.has(' ');
      if (isWalking) {
        gateProgress += dt * 35; // ~3 seconds to cross
      }

      if (gateProgress > 100) gateProgress = 100;

      const marker = $('gate-party-marker');
      const progressText = $('gate-progress-text');
      const statusEl = $('gate-march-status');

      if (marker) {
        const visualPct = Math.min(78, 5 + (gateProgress * 0.73));
        marker.style.left = visualPct + '%';
      }

      if (progressText) {
        progressText.textContent = `Tiến độ qua cổng an toàn: ${Math.floor(gateProgress)}% · Cả 5 thành viên (Bạn, Cô Thảo, Duyên, Minh, Bác Mạnh) bước đều nhịp`;
      }

      if (statusEl) {
        statusEl.textContent = isWalking ? '🚶‍♂️ ĐANG TIẾN VÀO CỔNG AN TOÀN' : '⏸️ TẠM DỪNG (NHẤN W/SPACE ĐỂ ĐI TIẾP)';
      }

      if (gateProgress >= 100) {
        cleanup();
        if (!s.solved.includes('gate_march')) {
          s.solved.push('gate_march');
        }
        if (!s.solved.includes('summit_gate')) {
          s.solved.push('summit_gate');
        }
        save();
        render();

        if (statusEl) statusEl.textContent = '🎉 ĐÃ QUA CỔNG AN TOÀN!';
        if (progressText) {
          progressText.innerHTML = '<strong style="color:#52c41a">✓ XUẤT SẮC! Cả 5 thành viên (Bạn, Cô Thảo, Duyên, Minh, Bác Mạnh) đã chính thức qua cổng an toàn số 1!</strong>';
        }

        setTimeout(() => {
          $('modal').hidden = true;
          speak([
            ['Bác Mạnh', 'Cả 5 người chúng ta đã qua cổng an toàn rồi! Lực lượng dân phòng đã ghi nhận danh sách đầy đủ.'],
            ['Cô Thảo', 'Trưởng làng Minh Anh đang đợi ở Trạm chỉ huy phía trước, các em hãy cùng vào báo cáo thực địa!']
          ], done);
        }, 1300);
        return;
      }

      animFrame = requestAnimationFrame(frame);
    };

    animFrame = requestAnimationFrame(frame);
  }

  // Tình huống LLM 1: AI Biên tập Bức điện Cứu nạn Khẩn cấp gửi Huyện (command_post)
  async function openIncidentDispatchModal() {
    const defaultHazards = [
      'Vết nứt sườn đồi taluy âm D1 nguy cơ trượt lở 500m3 đất đá',
      'Khối đá tảng sạt trượt chắn ngang hẻm dốc và cống tràn dâng xiết',
      'Cầu tre dã chiến qua dòng xoáy nước lũ đe dọa cô lập các hộ dân xóm ngoài',
      'Học sinh và nhân dân sơ tán cần chi viện nước sạch, lương thực khô và chăn ấm phòng hạ thân nhiệt'
    ];

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">TÁC CHIẾN CHỈ HUY · BỨC ĐIỆN CỨU NẠN KHẨN CẤP</small>
        <button id="close-dispatch-modal" style="padding:4px 10px">×</button>
      </div>
      <h2>Biên Tập Bức Điện Cứu Nạn Gửi Huyện</h2>
      <p style="font-size:13px;line-height:1.7;color:#c8d4cf">
        Trưởng làng Minh Anh cần tổng hợp các điểm hiểm họa thực địa đã phát hiện suốt 5 chương để gửi bức điện khẩn cấp báo cáo Ban Chỉ huy PCTT&TKCN Huyện xin chi viện cứu trợ khẩn cấp.
      </p>

      <div style="background:#0d1e22;border:1px solid var(--line);border-radius:6px;padding:14px;margin:12px 0">
        <strong style="color:var(--gold);font-size:12px">CÁC ĐIỂM HIỂM HỌA THỰC ĐỊA GHI NHẬN:</strong>
        <ul style="font-size:12px;line-height:1.8;color:#d8e5df;margin:8px 0;padding-left:18px">
          ${defaultHazards.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>

      <div id="dispatch-output" hidden></div>
      <p id="dispatch-status" style="color:var(--gold);font-size:13px;margin:8px 0"></p>

      <div class="buttons" id="dispatch-actions">
        <button id="btn-compile-dispatch" class="primary">📡 Biên Tập Bức Điện Cứu Nạn Khẩn Cấp (AI LLM) ↵</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-dispatch-modal').onclick = () => { $('modal').hidden = true; };

    $('btn-compile-dispatch').onclick = async () => {
      const btn = $('btn-compile-dispatch');
      const statusEl = $('dispatch-status');
      const outputEl = $('dispatch-output');

      btn.disabled = true;
      btn.textContent = 'Đang biên dịch mã điện tín quân báo...';
      statusEl.textContent = 'Đang kết nối Ban Chỉ huy PCTT&TKCN Huyện...';

      let dispatchResult = null;
      try {
        const res = await fetch('/api/tactical/incident-dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hazards: defaultHazards })
        });
        if (res.ok) {
          dispatchResult = await res.json();
        }
      } catch (_) {}

      if (!dispatchResult || !dispatchResult.dispatchCode) {
        const code = 'CD-TKCN-' + Date.now().toString().slice(-4);
        dispatchResult = {
          dispatchCode: code,
          reportText: `BỨC ĐIỆN KHẨN CẤP GỬI BAN CHỈ HUY PCTT&TKCN HUYỆN:\n- Căn cứ tình hình thực địa tại địa bàn xã/thôn, báo cáo ghi nhận các điểm xung yếu: Vết nứt sườn đồi taluy D1; tảng đá lăn chắn hẻm dốc và cống ngập xiết; cầu tre dã chiến qua dòng nước lũ.\n- Tình hình nhân mạng: Toàn bộ học sinh và đoàn sơ tán 5 người đã tiếp cận đỉnh đồi an toàn tại nhà văn hóa cộng đồng.\n- Đề xuất ứng phó khẩn cấp: Đề nghị Huyện điều động công binh thông tuyến giao thông, chi viện xuồng cao su cứu hộ và tiếp tế lương thực khô, nước sạch và cơ số thuốc men phòng chống hạ thân nhiệt.`
        };
      }

      statusEl.textContent = '✓ Đã mã hóa và phát điện tín thành công!';
      statusEl.style.color = '#52c41a';

      outputEl.hidden = false;
      outputEl.innerHTML = `
        <div class="dispatch-sheet">
          <div class="dispatch-header">
            <span style="font-weight:700;color:var(--gold);font-size:12px">BỨC ĐIỆN CỨU HỘ KHẨN CẤP GỬI HUYỆN</span>
            <span class="dispatch-code">${dispatchResult.dispatchCode}</span>
          </div>
          <div class="dispatch-content">${dispatchResult.reportText}</div>
          <div class="dispatch-stamp">BAN CHỈ HUY PCTT&TKCN · ĐÃ PHÁT ĐIỆN</div>
        </div>
      `;

      if (!s.solved.includes('incident_dispatch')) {
        s.solved.push('incident_dispatch');
      }
      if (!s.solved.includes('command_post')) {
        s.solved.push('command_post');
      }
      save();
      render();

      $('dispatch-actions').innerHTML = `
        <button id="btn-dispatch-proceed" class="primary" style="background:#389e0d;border-color:#52c41a">Tiến Vào Hội Trường An Toàn ➔</button>
      `;

      $('btn-dispatch-proceed').onclick = () => {
        $('modal').hidden = true;
        s.scene = 'safe_hall';
        if (!s.visited.includes('safe_hall')) s.visited.push('safe_hall');
        save();
        render();
        speak(sceneIntros.safe_hall);
      };
    };
  }

  // Tình huống LLM 2: 3 Ca Khủng hoảng Y tế sau bão (Hội Chữ Thập Đỏ AI)
  function openMedicalTriageModal() {
    const cases = [
      {
        id: 'hypothermia',
        label: 'Ca 1: Hạ thân nhiệt của Minh',
        icon: '🥶',
        patient: 'Bạn Minh',
        situation: 'Minh lội qua dòng nước lũ lạnh buốt, quần áo ướt sũng, toàn thân run bần bật, môi tím tái và có dấu hiệu hạ thân nhiệt.',
        promptSafe: 'Lau khô toàn thân, thay quần áo khô ấm, ủ ấm vùng lõi ngực và bụng từ từ bằng chăn ấm, cho uống nước ấm hoặc trà gừng ấm; tuyệt đối không hơ lửa trực tiếp hay xoa bóp mạnh làm tụt huyết áp.',
        promptDanger: 'Cho Minh ngồi sát ngay bếp lửa than đang đỏ rực để hơ nóng thật nhanh và xoa bóp thật mạnh chân tay.'
      },
      {
        id: 'laceration',
        label: 'Ca 2: Vết rách bắp chân Bác Mạnh',
        icon: '🩹',
        patient: 'Bác Mạnh',
        situation: 'Bác Mạnh bị cành cây gãy cứa rách sâu bắp chân khi bọc lót cho đoàn qua dòng lũ, vết thương chảy máu và dính bùn đất sình lầy.',
        promptSafe: 'Rửa sạch vết thương bằng nước sạch hoặc nước muối sinh lý, sát khuẩn bằng dung dịch sát trùng y tế, băng ép vô trùng cầm máu; tuyệt đối không đắp lá rừng bừa bãi hay bôi tro than.',
        promptDanger: 'Nhai nát lá cây dại ven đường đắp vào vết rách và lấy tro than bếp củi bôi kín để bịt miệng vết thương.'
      },
      {
        id: 'co_hazard',
        label: 'Ca 3: Nguy cơ ngạt khí CO sưởi than',
        icon: '⚠️',
        patient: 'Hội trường người dân',
        situation: 'Trời trở rét căm căm, người dân định khiêng chậu than củi đỏ rực vào đóng chặt tất cả các cửa sổ để sưởi ấm cho cả phòng.',
        promptSafe: 'Kiên quyết mở toang tất cả các cửa sổ để không khí lưu thông, dập tắt và di chuyển bếp than ra ngoài hiên thoáng khí để phòng chống ngạt khí độc CO không màu không mùi gây tử vong.',
        promptDanger: 'Đóng kín mít toàn bộ cửa sổ và cửa ra vào để giữ nhiệt độ ấm áp trong phòng sưởi suốt đêm.'
      }
    ];

    let activeIdx = 0;
    const triageSolved = new Set();

    const renderModal = () => {
      const cur = cases[activeIdx];
      const panel = $('panel');
      panel.innerHTML = `
        <div class="panel-top">
          <small style="color:var(--gold);letter-spacing:1px">HỘI CHỮ THẬP ĐỎ AI · 3 CA KHỦNG HOẢNG Y TẾ SAU BÃO</small>
          <button id="close-triage-modal" style="padding:4px 10px">×</button>
        </div>
        <h2>Cố Vấn & Sơ Cứu Khẩn Cấp Sau Thiên Tai</h2>
        <p style="font-size:13px;line-height:1.7;color:#c8d4cf">
          Đoàn đã an toàn tại Hội trường, nhưng xuất hiện 3 ca y tế khẩn cấp cần phân loại và xử lý chuẩn xác theo hướng dẫn của Hội Chữ thập đỏ Việt Nam.
        </p>

        <div class="triage-tabs">
          ${cases.map((c, i) => `
            <button class="triage-tab-btn ${i === activeIdx ? 'active' : ''} ${triageSolved.has(c.id) ? 'solved' : ''}" data-idx="${i}">
              ${c.icon} ${c.label} ${triageSolved.has(c.id) ? '✓' : ''}
            </button>
          `).join('')}
        </div>

        <div class="triage-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <strong style="color:#ffd591;font-size:14px">${cur.label}</strong>
            <span style="font-size:12px;color:${triageSolved.has(cur.id) ? '#52c41a' : '#faad14'}">
              ${triageSolved.has(cur.id) ? '✓ ĐÃ GIẢI QUYẾT AN TOÀN' : '⚠️ CẦN SƠ CỨU NGAY'}
            </span>
          </div>
          <p style="font-size:13px;line-height:1.7;color:#d8e5df;margin-bottom:12px">
            <strong>Hiện trạng bệnh nhân:</strong> ${cur.situation}
          </p>

          <label style="display:block;font-size:12px;color:var(--gold);margin-bottom:6px">Nhập hoặc chọn phương án sơ cứu chuẩn y tế:</label>
          <textarea id="triage-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Mô tả các bước sơ cứu an toàn theo khuyến cáo Chữ Thập Đỏ..."></textarea>

          <div style="display:flex;flex-direction:column;gap:6px;margin:10px 0">
            <button class="option" id="btn-suggest-safe" style="text-align:left;font-size:12px;padding:8px 12px">💡 Gợi ý chuẩn: "${cur.promptSafe}"</button>
            <button class="option" id="btn-suggest-danger" style="text-align:left;font-size:12px;padding:8px 12px;color:#ffa39e">⚠️ Thử phương án sai: "${cur.promptDanger}"</button>
          </div>

          <div id="triage-critique" hidden></div>
        </div>

        <div class="buttons" style="display:flex;justify-content:space-between;align-items:center">
          <button id="btn-submit-triage" class="primary">🩺 Thẩm Định Phương Án Cứu Thương (AI Chữ Thập Đỏ) ↵</button>
          ${triageSolved.size === 3 ? '<button id="btn-finish-triage" class="primary" style="background:#389e0d;border-color:#52c41a">Tiến Vào Khảo Hạch Tốt Nghiệp 5 Chương ➔</button>' : ''}
        </div>
      `;

      $('close-triage-modal').onclick = () => { $('modal').hidden = true; };

      panel.querySelectorAll('.triage-tab-btn').forEach(btn => {
        btn.onclick = () => {
          activeIdx = Number(btn.dataset.idx);
          renderModal();
        };
      });

      $('btn-suggest-safe').onclick = () => {
        $('triage-input').value = cur.promptSafe;
      };

      $('btn-suggest-danger').onclick = () => {
        $('triage-input').value = cur.promptDanger;
      };

      if ($('btn-finish-triage')) {
        $('btn-finish-triage').onclick = () => {
          $('modal').hidden = true;
          openGraduationDebriefModal();
        };
      }

      $('btn-submit-triage').onclick = async () => {
        const inputSolution = $('triage-input').value.trim();
        const critiqueEl = $('triage-critique');
        const submitBtn = $('btn-submit-triage');

        if (!inputSolution) {
          critiqueEl.hidden = false;
          critiqueEl.className = 'critique-box rejected';
          critiqueEl.textContent = 'Vui lòng nhập phương án sơ cứu hoặc chọn một trong các gợi ý bên trên.';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'AI Chữ Thập Đỏ đang thẩm định y tế...';

        let result = null;
        try {
          const res = await fetch('/api/medical/triage-solver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              caseId: cur.id,
              solutionText: inputSolution
            })
          });
          if (res.ok) {
            result = await res.json();
          }
        } catch (_) {}

        if (!result) {
          // Offline fallback
          const lower = inputSolution.toLowerCase();
          if (cur.id === 'hypothermia') {
            const danger = /hơ\s+(?:trực\s+tiếp\s+)?(?:vào\s+)?lửa|xoa\s+bóp\s+thật\s+mạnh/.test(lower) && !/không|tránh/i.test(lower);
            result = danger
              ? { approved: false, critique: 'Sai phương pháp nguy hiểm! Tuyệt đối không được hơ lửa trực tiếp hay làm nóng đột ngột nạn nhân hạ thân nhiệt, vì sẽ gây giãn mạch ngoại vi đột ngột làm tụt huyết áp và nguy cơ loạn nhịp tim. Cần ủ ấm trung tâm từ từ bằng chăn và quần áo khô.' }
              : { approved: true, critique: 'Chính xác! Lau khô, thay quần áo khô và ủ ấm vùng lõi cơ thể (ngực, bụng) từ từ bằng chăn ấm là phác đồ sơ cứu chuẩn quốc tế của Hội Chữ thập đỏ.' };
          } else if (cur.id === 'laceration') {
            const danger = /đắp\s+lá|bôi\s+tro|bột\s+than/.test(lower) && !/không|tránh/i.test(lower);
            result = danger
              ? { approved: false, critique: 'Sai phương pháp nguy hiểm! Đắp lá cây hoặc tro than bẩn vào vết rách hở dính bùn dễ dẫn đến nhiễm trùng uốn ván hoại tử. Phải rửa sạch và sát trùng vết thương.' }
              : { approved: true, critique: 'Chính xác! Rửa sạch bằng nước muối sinh lý hoặc nước sạch, sát khuẩn và băng ép cố định vết thương giúp ngăn nhiễm trùng hiệu quả.' };
          } else {
            const danger = /đóng\s+kín\s+cửa|tiếp\s+tục\s+đốt/.test(lower) && !/không|tránh/i.test(lower);
            result = danger
              ? { approved: false, critique: 'Cực kỳ nguy hiểm! Đốt than trong phòng kín sinh khí CO không màu không mùi gây ngạt thở và tử vong nhanh chóng. Phải mở toang cửa ngay lập tức!' }
              : { approved: true, critique: 'Rất chuẩn xác! Mở toang cửa cho không khí lưu thông và di chuyển bếp than ra ngoài hiên thoáng khí là cách xử lý sống còn để ngăn ngộ độc khí CO.' };
          }
        }

        submitBtn.disabled = false;
        submitBtn.textContent = '🩺 Thẩm Định Phương Án Cứu Thương (AI Chữ Thập Đỏ) ↵';

        critiqueEl.hidden = false;
        critiqueEl.className = 'critique-box ' + (result.approved ? 'approved' : 'rejected');
        critiqueEl.innerHTML = `<strong>${result.approved ? '✓ ĐẠT CHUẨN Y TẾ:' : '⚠️ CẢNH BÁO NGUY HIỂM:'}</strong> ${result.critique}`;

        if (result.approved) {
          triageSolved.add(cur.id);
          if (triageSolved.size === 3) {
            if (!s.solved.includes('medical_triage')) s.solved.push('medical_triage');
            if (!s.solved.includes('safe_hall')) s.solved.push('safe_hall');
            save();
            render();
          }
          setTimeout(() => {
            if (activeIdx < cases.length - 1 && !triageSolved.has(cases[activeIdx + 1].id)) {
              activeIdx++;
              renderModal();
            } else {
              renderModal();
            }
          }, 1500);
        }
      };
    };

    renderModal();
    $('modal').hidden = false;
  }

  // Khảo Hạch AI Tốt Nghiệp: Phỏng vấn đúc kết 5 chương và khắc lời khen cá nhân hóa
  async function openGraduationDebriefModal() {
    const DEBRIEF_QUESTION = 'Qua toàn bộ 5 chương hành trình từ trường học lên đỉnh đồi an toàn, bài học sinh tồn cốt lõi và cao nhất mà con đã học được là gì để bảo vệ an toàn cho bản thân và cộng đồng?';

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">HỘI ĐỒNG KHẢO HẠCH TỐT NGHIỆP · TRƯỞNG LÀNG MINH ANH & CÔ THẢO</small>
        <button id="close-debrief-modal" style="padding:4px 10px">×</button>
      </div>
      <h2>Khảo Hạch AI Tốt Nghiệp — Đúc Kết 5 Chương</h2>
      <p style="font-size:15px;color:#fff7df;margin:10px 0;line-height:1.7">
        <strong>“${DEBRIEF_QUESTION}”</strong>
      </p>
      <p style="font-size:13px;color:#c1cdbf">
        Hãy nêu bài học đúc kết sâu sắc nhất của con. Lời nhận xét và đánh giá cá nhân hóa từ Hội đồng Khảo hạch AI sẽ được vinh danh và khắc trực tiếp lên Chứng Nhận Chiến Sĩ Nhí An Toàn.
      </p>

      <div style="margin:12px 0">
        <textarea id="debrief-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập bài học sinh tồn cốt lõi (VD: Tính mạng con người là vô giá, tuyệt đối không tiếc của quay lại lấy tài sản; nghiêm túc tuân thủ chỉ huy sơ tán và tương trợ đồng đội theo khoa học)..."></textarea>
      </div>

      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" id="prompt-grad-1" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý đúc kết: "Tính mạng con người luôn là trên hết, tuyệt đối không tiếc của quay lại lấy tài sản; nghiêm túc tuân thủ chỉ huy sơ tán, nắm vững quy tắc địa hình an toàn và tương trợ đồng đội theo phương pháp khoa học."</button>
        <button class="option" id="prompt-grad-2" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý ngắn: "Bảo vệ an toàn tính mạng là nguyên tắc tối thượng, chấp hành kỷ luật di tản và tương trợ đồng đội vượt qua bão lũ."</button>
      </div>

      <p id="debrief-status" role="status" style="color:var(--gold)"></p>
      <div id="debrief-result" hidden style="margin:12px 0"></div>

      <div class="buttons">
        <button id="btn-submit-debrief" class="primary">Nộp Bài Khảo Hạch AI ↵</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-debrief-modal').onclick = () => { $('modal').hidden = true; };

    $('prompt-grad-1').onclick = () => {
      $('debrief-input').value = 'Tính mạng con người luôn là trên hết, tuyệt đối không tiếc của quay lại lấy tài sản; nghiêm túc tuân thủ chỉ huy sơ tán, nắm vững quy tắc địa hình an toàn và tương trợ đồng đội theo phương pháp khoa học.';
    };

    $('prompt-grad-2').onclick = () => {
      $('debrief-input').value = 'Bảo vệ an toàn tính mạng là nguyên tắc tối thượng, chấp hành kỷ luật di tản và tương trợ đồng đội vượt qua bão lũ.';
    };

    $('btn-submit-debrief').onclick = async () => {
      const cleanAnswer = $('debrief-input').value.trim();
      const statusEl = $('debrief-status');
      const resultEl = $('debrief-result');
      const btn = $('btn-submit-debrief');

      if (!cleanAnswer) {
        statusEl.textContent = 'Vui lòng nhập bài học đúc kết của con trước khi nộp.';
        return;
      }

      btn.disabled = true;
      statusEl.textContent = 'Hội đồng Khảo hạch AI đang chấm điểm và thẩm định bài học...';

      let result = null;
      try {
        const res = await fetch('/api/debrief/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapter: 5,
            question: DEBRIEF_QUESTION,
            playerAnswer: cleanAnswer
          })
        });
        if (res.ok) {
          result = await res.json();
        }
      } catch (_) {}

      if (!result) {
        const lower = cleanAnswer.toLowerCase();
        const dangerous = /(?:tiếc của|quay lại lấy|tài sản quý hơn)/i.test(lower);
        result = dangerous
          ? { passed: false, feedback: 'Chưa đạt! Tính mạng con người luôn là trên hết, tuyệt đối không được tiếc của hay quay lại lấy tài sản trong thiên tai.' }
          : { passed: true, feedback: 'Xuất sắc! Con đã nắm vững nguyên tắc cốt lõi: Tính mạng con người là vô giá, tuân thủ kỷ luật sơ tán và tương trợ đồng đội bằng phương pháp khoa học.' };
      }

      btn.disabled = false;
      statusEl.textContent = '';
      resultEl.hidden = false;

      if (result.passed) {
        resultEl.innerHTML = `<div class="critique-box approved"><strong>✓ ĐẠT CHUẨN TỐT NGHIỆP:</strong> ${result.feedback}</div>`;
        s.complete = true;
        s.certPraise = result.feedback;
        save();
        render();

        setTimeout(() => {
          showCertificateModal(result.feedback);
        }, 1300);
      } else {
        resultEl.innerHTML = `<div class="critique-box rejected"><strong>⚠️ CHƯA ĐẠT:</strong> ${result.feedback}</div>`;
      }
    };
  }

  function showCertificateModal(praiseText) {
    const feedback = praiseText || s.certPraise || 'Xuất sắc! Con đã nắm vững nguyên tắc cứu nạn: tính mạng con người luôn là trên hết, tuân thủ kỷ luật di tản và bảo vệ bản thân cùng tập thể.';
    const panel = $('panel');
    panel.innerHTML = `
      <div class="cert-card">
        <div class="cert-header">BAN CHỈ HUY PHÒNG CHỐNG THIÊN TAI VÀ TÌM KIẾM CỨU NẠN THÔN</div>
        <div class="cert-title">CHỨNG NHẬN CHIẾN SĨ NHÍ AN TOÀN</div>
        <div style="font-size:12px;letter-spacing:1px;color:#d5bd87;margin-bottom:8px">VINH DANH HOÀN THÀNH XUẤT SẮC 5 CHƯƠNG PHÒNG CHỐNG THIÊN TAI BÃO LŨ</div>
        <div class="cert-recipient">TRAO TẶNG: BẠN & TẬP THỂ LỚP 7B</div>
        <p class="cert-body">
          Đã xuất sắc hoàn thành trọn vẹn Hành trình 5 Chương phòng chống lũ quét & sạt lở đất:
          Từ sơ tán có tổ chức ở trường học (Ch1), phân tích và chọn đường vòng an toàn qua Cầu Bắc (Ch2),
          nhận diện vết nứt sườn đồi và dòng bùn bằng Bộ đàm AI (Ch3), kiên quyết đặt tính mạng lên số 1 để cứu bạn học (Ch4),
          và hội quân an toàn tại Nhà văn hóa thôn, biên tập bức điện cứu nạn khẩn cấp, xử lý 3 ca khủng hoảng y tế tại Đỉnh đồi an toàn (Ch5).
        </p>

        <div class="cert-praise-box">
          <div class="cert-praise-title">🎖️ Lời Khen Khắc Ghi Cá Nhân Hóa Từ Ban Chỉ Huy & AI Cố Vấn:</div>
          <p id="cert-feedback" class="cert-feedback">${feedback}</p>
        </div>

        <div class="cert-badge-row">
          <span class="cert-badge">🏅 Trinh Sát Địa Chất</span>
          <span class="cert-badge">❤️ Tinh Thần Đồng Đội</span>
          <span class="cert-badge">🛡️ Sơ Cứu Chuẩn Chữ Thập Đỏ</span>
          <span class="cert-badge">🌟 Chiến Sĩ Xuất Sắc 5 Chương</span>
        </div>
        <p style="font-size:11px;color:#9eb1a4;margin-top:14px">
          <em>Xác nhận bởi Trưởng làng Minh Anh & Cô giáo chủ nhiệm Nguyễn Thị Thảo</em>
        </p>
      </div>
      <div class="buttons" style="justify-content:center">
        <button id="btn-print-cert" style="font-size:13px">🖨️ In / Lưu Chứng Nhận (PDF)</button>
        <a href="index.html" class="primary" style="display:inline-flex;align-items:center;padding:10px 20px;border-radius:4px">Trở về Trang Chủ Tổng Hành Trình 🏠</a>
      </div>
    `;
    $('modal').hidden = false;

    $('btn-print-cert').onclick = () => {
      window.print();
    };
  }

  function initRain() {
    const canvas = $('rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.offsetWidth || 1600);
    let h = (canvas.height = canvas.offsetHeight || 900);

    const drops = [];
    for (let i = 0; i < 40; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 12 + 6,
        vy: Math.random() * 8 + 10,
        vx: Math.random() * 1 - 2
      });
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(210, 230, 240, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.vx, d.y + d.l);
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > h) {
          d.y = -d.l;
          d.x = Math.random() * w;
        }
      }
      ctx.stroke();
      requestAnimationFrame(loop);
    }
    loop();
  }

  function setupControls() {
    $('start').onclick = () => {
      $('intro').hidden = true;
      s.started = true;
      save();
      render();
      speak(sceneIntros.summit_gate);
    };

    $('next').onclick = advanceDialogue;

    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.onclick = () => {
        if (window.VoiceTTS) {
          window.VoiceTTS.toggle();
          voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS.isEnabled() ? 'bật' : 'tắt');
        }
      };
    }

    $('btn-radio').onclick = () => {
      if (R && typeof R.toggleRadio === 'function') R.toggleRadio();
    };

    const footerRadio = $('btn-radio-footer');
    if (footerRadio) {
      footerRadio.onclick = () => {
        if (R && typeof R.toggleRadio === 'function') R.toggleRadio();
      };
    }

    $('journal').onclick = () => {
      const panel = $('panel');
      panel.innerHTML = `
        <div class="panel-top">
          <small style="color:var(--gold)">SỔ TAY TỔNG KẾT 5 CHƯƠNG</small>
          <button id="close-journal">Đóng ×</button>
        </div>
        <h2>Hành trình hoàn thành trọn vẹn 5/5 Chương</h2>
        <ul style="line-height:2;padding-left:20px;font-size:13px;color:#d2d9d1">
          <li><strong>Chương 01:</strong> Sơ tán từ lớp học 4B ra cổng sau trường.</li>
          <li><strong>Chương 02:</strong> Phân tích 3 tuyến đường và vượt Cầu Bắc an toàn.</li>
          <li><strong>Chương 03:</strong> Vượt sườn đồi nứt nẻ, nhận diện sạt trượt bằng Bộ đàm AI.</li>
          <li><strong>Chương 04:</strong> Cứu bạn Minh ở xóm ngoài, ưu tiên tính mạng trên hết.</li>
          <li><strong>Chương 05:</strong> Hội quân Đỉnh Đồi An Toàn và nhận Chứng nhận Chiến sĩ nhí.</li>
        </ul>
      `;
      $('modal').hidden = false;
      $('close-journal').onclick = () => { $('modal').hidden = true; };
    };

    window.addEventListener('keydown', (e) => {
      if (!$('dialogue').hidden && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        advanceDialogue();
        return;
      }
      if ($('dialogue').hidden && $('modal').hidden && s.started) {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          s.position.x = Math.max(12, s.position.x - 3);
          render();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          s.position.x = Math.min(88, s.position.x + 3);
          render();
        }
      }
    });

    $('stage').addEventListener('click', (e) => {
      if (!$('dialogue').hidden || !$('modal').hidden || !s.started) return;
      const rect = $('stage').getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 100;
      s.position.x = Math.max(12, Math.min(88, clickX));
      render();
    });
  }

  function init() {
    if (R && typeof R.initRadioAI === 'function') {
      R.initRadioAI({ chapter: 5, scene: s.scene, playerName: 'Bạn' });
    }
    setupControls();
    initRain();
    if (s.started) {
      $('intro').hidden = true;
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
