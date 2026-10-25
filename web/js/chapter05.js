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
      return s.solved.includes('summit_gate')
        ? 'Tiến vào Trạm chỉ huy gặp Trưởng làng Minh Anh.'
        : 'Thực hiện thủ tục báo danh tại Cổng Đỉnh Đồi.';
    }
    if (s.scene === 'command_post') {
      return s.solved.includes('command_post')
        ? 'Tiến vào Hội trường an toàn để tổng kết hành trình.'
        : 'Bàn giao thực địa các vệt nứt và cống tràn cho Trưởng làng.';
    }
    if (s.scene === 'safe_hall') {
      return s.solved.includes('safe_hall')
        ? 'Nhận Chứng Chỉ Chiến Sĩ Nhí An Toàn Phòng Chống Thiên Tai!'
        : 'Vượt qua bài trắc nghiệm tổng hợp 5 chương thực địa.';
    }
    return 'Di chuyển an toàn theo hướng dẫn.';
  }

  function render() {
    const scene = D.scenes[s.scene];
    if (!scene) return;

    $('spots').hidden = !s.started;
    $('scene-name').textContent = scene.name;
    $('landscape').style.backgroundImage = `url('assets/chapter05/${scene.art}.webp')`;
    $('landscape').style.backgroundPosition = scene.position || 'center';
    $('objective').textContent = objective();
    $('progress').textContent = `${s.solved.length}/3 bài học · ${s.clues.length}/7 dấu hiệu`;

    // Minhanh world sprite at command_post
    const minhAnhWorld = $('minhanh-world');
    if (minhAnhWorld) {
      minhAnhWorld.hidden = !s.started || s.scene !== 'command_post';
    }

    $('spots').replaceChildren();
    for (const p of scene.spots) {
      const btn = document.createElement('button');
      const isSpecial = p.type === 'exit' || p.type === 'cert_award';
      btn.className = 'spot ' + (isSpecial ? 'exit ' : '') + (s.clues.includes(p.id) || s.solved.includes(p.puzzle) ? 'seen' : '');
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
      if (s.solved.includes('safe_hall')) {
        s.complete = true;
        save();
        showCertificateModal();
      } else {
        speak([['Cô Thảo', 'Hãy hoàn thành bài trắc nghiệm tổng hợp 5 chương trước khi nhận Chứng chỉ nhé các em!']]);
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
          if (puzzleId === 'safe_hall') {
            showCertificateModal();
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

  function showCertificateModal() {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="cert-card">
        <div class="cert-header">BAN CHỈ HUY PHÒNG CHỐNG THIÊN TAI VÀ TÌM KIẾM CỨU NẠN THÔN</div>
        <div class="cert-title">CHỨNG NHẬN CHIẾN SĨ NHÍ AN TOÀN</div>
        <div class="cert-recipient">TRAO TẶNG: BẠN & TẬP THỂ LỚP 7B</div>
        <p class="cert-body">
          Đã xuất sắc hoàn thành trọn vẹn Hành trình 5 Chương phòng chống lũ quét & sạt lở đất:
          Từ sơ tán có tổ chức ở trường học (Ch1), phân tích và chọn đường vòng an toàn qua Cầu Bắc (Ch2),
          nhận diện vết nứt sườn đồi và dòng bùn bằng Bộ đàm AI (Ch3), kiên quyết đặt tính mạng lên số 1 để cứu bạn học (Ch4),
          và hội quân an toàn tại Nhà văn hóa thôn (Ch5).
        </p>
        <div class="cert-badge-row">
          <span class="cert-badge">🏅 Trinh Sát Địa Chất</span>
          <span class="cert-badge">❤️ Tinh Thần Đồng Đội</span>
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
