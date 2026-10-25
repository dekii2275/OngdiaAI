(() => {
  'use strict';

  const D = window.Chapter03;
  const P = window.Chapter03Puzzles;
  const R = window.RadioAI;
  const $ = (id) => document.getElementById(id);
  const KEY = 'ongdia.chapter03.v1';

  let s = D.initial();
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw) s = D.restore(raw);
  } catch (_) {}

  let queue = [];
  let afterDialogue = null;
  let target = null;
  const held = new Set();
  const portraits = {
    'Bạn': 'ban',
    'Duyên': 'duyen',
    'Thảo': 'thao',
    'Mạnh': 'manh',
    'Minh Anh': 'minh-anh'
  };

  const sceneIntros = {
    ridge_entry: [
      ['Bạn', 'Tiếng nổ từ thung lũng vừa rồi... Cả sườn đồi đang rung lên.'],
      ['Thảo', 'Cả nhóm bình tĩnh, giữ khoảng cách và bước dứt khoát lên dốc.'],
      ['Mạnh', '[Bộ đàm] Mạnh đây! Đường lên núi có đá dăm bắt đầu trôi, phải kiểm tra liên lạc ngay!']
    ],
    crack_zone: [
      ['Bạn', 'Dừng lại! Phía trước có một vết nứt đất rất dài cắt ngang bờ dốc!'],
      ['Duyên', 'Bụi tre ở mép đường cũng bị nghiêng hẳn xuống vực rồi...'],
      ['Thảo', 'Nước đùn sủi bọt ra từ vết nứt. Bật bộ đàm báo cáo bác Trưởng làng ngay!']
    ],
    mudflow_bend: [
      ['Duyên', 'Khúc cua này nước đỏ ngầu chảy tràn qua mặt đường rồi cô ơi!'],
      ['Mạnh', 'Miệng cống bị đá rác bít chặt. Không được lội bừa qua chỗ nước sâu quá gối!'],
      ['Bạn', 'Hãy dùng cành cây thăm dò độ sâu trước khi bước!']
    ],
    boulder_pass: [
      ['Mạnh', 'Khối đá tảng hàng tấn vừa sạt xuống chặn đứng đường chính!'],
      ['Thảo', 'Đừng ai cố trèo qua tảng đá trơn. Bác Minh Anh vừa chỉ đường vòng sống đá bên phải!'],
      ['Bạn', 'Chúng ta men theo sống đá gốc để vượt qua hẻm đá an toàn!']
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
    if (s.complete) return 'Chương 03 hoàn thành. Đã vượt qua sườn đồi sạt lở!';
    if (s.scene === 'ridge_entry') {
      return s.solved.includes('ridge_entry')
        ? 'Tiến vào Vùng Nứt Đất cùng Bác Mạnh và Cô Thảo.'
        : 'Khởi động bộ đàm AI, thiết lập liên lạc với Trưởng làng.';
    }
    if (s.scene === 'crack_zone') {
      return s.solved.includes('crack_zone')
        ? 'Vòng qua vệt nứt tiến tới Khúc Cua Suối Bùn.'
        : 'Quan sát 3 dấu hiệu sạt lở taluy và báo cáo qua bộ đàm.';
    }
    if (s.scene === 'mudflow_bend') {
      return s.solved.includes('mudflow_bend')
        ? 'Cẩn thận bước qua hẻm đá sạt lở phía trước.'
        : 'Nắm vững quy tắc vượt qua khúc cua nước bùn tràn mặt đường.';
    }
    if (s.scene === 'boulder_pass') {
      return s.solved.includes('boulder_pass')
        ? 'Men theo sống đá tiến vào khu vực xóm ngoài (Chương 04).'
        : 'Tìm giải pháp an toàn tránh tảng đá tảng chắn đường.';
    }
    return 'Di chuyển an toàn theo hướng dẫn.';
  }

  function render() {
    const scene = D.scenes[s.scene];
    if (!scene) return;

    $('spots').hidden = !s.started;
    $('scene-name').textContent = scene.name;
    $('landscape').style.backgroundImage = `url('assets/chapter03/${scene.art}.webp')`;
    $('landscape').style.backgroundPosition = scene.position || 'center';
    $('objective').textContent = objective();
    $('progress').textContent = `${s.solved.length}/4 câu đố · ${s.clues.length}/10 manh mối`;

    $('spots').replaceChildren();
    for (const p of scene.spots) {
      const btn = document.createElement('button');
      const isExit = p.type === 'exit' || p.type === 'chapter_advance';
      btn.className = 'spot ' + (isExit ? 'exit ' : '') + (s.clues.includes(p.id) || s.solved.includes(p.puzzle) ? 'seen' : '');
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

    // Move party toward spot
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

    if (p.type === 'radio_call') {
      if (R && typeof R.openRadio === 'function') {
        R.openRadio('minh_anh');
      }
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
        speak([['Cô Thảo', 'Chúng ta cần giải quyết câu đố và quan sát an toàn khu vực này trước khi đi tiếp!']]);
      }
      return;
    }

    if (p.type === 'chapter_advance') {
      if (s.solved.includes('boulder_pass')) {
        s.complete = true;
        save();
        showCompletionModal();
      } else {
        speak([['Bác Mạnh', 'Khối đá tảng đang chắn ngang, phải giải câu đố tìm lối vòng sống đá trước!']]);
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
        <small style="color:var(--gold);letter-spacing:1px">CÂU ĐỐ TÌNH HUỐNG THỰC ĐỊA</small>
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
              <option value="">-- Chọn ý nghĩa đối chiếu --</option>
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
        fb.textContent = '✓ Chính xác! Bạn đã đưa ra quyết định an toàn chuẩn xác.';
        fb.style.color = '#73d13d';
        if (!s.solved.includes(puzzleId)) {
          s.solved.push(puzzleId);
          save();
        }
        setTimeout(() => {
          $('modal').hidden = true;
          render();
          speak([['Bác Mạnh', 'Làm tốt lắm các cháu! Lối đi an toàn đã được xác nhận. Tiến lên thôi!']]);
        }, 1100);
      } else {
        fb.textContent = '✗ Quyết định chưa an toàn hoặc sai thứ tự. Hãy đọc kỹ gợi ý và thử lại!';
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

  function showCompletionModal() {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">HOÀN THÀNH CHƯƠNG 03</small>
      </div>
      <h2>Vượt Qua Sườn Đồi Sạt Lở Thành Công!</h2>
      <p>Nhóm của Bạn, Duyên và Cô Thảo dưới sự tiền trạm của Bác Mạnh đã quan sát tinh tường 4 manh mối địa chất, vận dụng Bộ đàm AI và vượt qua hẻm đá nguy hiểm.</p>
      <p>Tuy nhiên, một tiếng gọi thất thanh từ xóm dưới truyền đến qua bộ đàm: Bạn Minh đang bị mắc kẹt một mình...</p>
      <div class="buttons">
        <button id="btn-next-chapter" class="primary">Tiến vào Chương 04: Chia Cắt & Cứu Bạn Học <span>→</span></button>
      </div>
    `;
    $('modal').hidden = false;
    $('btn-next-chapter').onclick = () => {
      window.location.href = 'chapter04.html';
    };
  }

  function initRain() {
    const canvas = $('rain');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = canvas.offsetWidth || 1600);
    let h = (canvas.height = canvas.offsetHeight || 900);

    const drops = [];
    for (let i = 0; i < 90; i++) {
      drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        l: Math.random() * 22 + 10,
        vy: Math.random() * 12 + 16,
        vx: Math.random() * 2 - 4
      });
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(210, 230, 240, 0.28)';
      ctx.lineWidth = 1.2;
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
      speak(sceneIntros.ridge_entry);
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
          <small style="color:var(--gold)">SỔ TAY CỨU HỘ ĐỊA CHẤT</small>
          <button id="close-journal">Đóng ×</button>
        </div>
        <h2>Manh mối sạt lở đã ghi nhận (${s.clues.length})</h2>
        <ul style="line-height:2;padding-left:20px;font-size:13px;color:#d2d9d1">
          ${s.clues.map((c) => `<li><strong>${c}:</strong> Đã quan sát và đánh giá thực địa</li>`).join('')}
        </ul>
        <h3 style="margin-top:18px">Ghi nhớ sống còn:</h3>
        <p style="font-size:12px;color:#cbd5ce">1. Vết nứt vòng cung trên taluy dốc báo hiệu nguy cơ sạt lở cấp tốc.<br>
        2. Nước đục sủi bọt khí là áp lực nước lỗ rỗng cực đại.<br>
        3. Dùng cành cây thăm dò độ sâu trước khi lội qua vùng nước tràn.</p>
      `;
      $('modal').hidden = false;
      $('close-journal').onclick = () => { $('modal').hidden = true; };
    };

    // Keyboard navigation
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
      R.initRadioAI({ chapter: 3, scene: s.scene, playerName: 'Bạn' });
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
