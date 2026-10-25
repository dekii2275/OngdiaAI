(() => {
  'use strict';

  const D = window.Chapter04;
  const P = window.Chapter04Puzzles;
  const R = window.RadioAI;
  const $ = (id) => document.getElementById(id);
  const KEY = 'ongdia.chapter04.v1';

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
    village_outskirts: [
      ['Bác Mạnh', 'Xóm đồi phía dưới bị bùn lấp ngõ rồi. Mọi người chú ý chân, dò từng bước!'],
      ['Bạn', 'Có tiếng khóc ở trạm sơ tán xóm... Là bạn Minh lớp 7!'],
      ['Cô Thảo', 'Chúng ta phải nhanh chóng tiếp cận trạm sơ tán kiểm tra tình hình!']
    ],
    isolation_post: [
      ['Bạn Minh', 'Bức tranh vẽ mẹ của mình vẫn để ở ngăn bàn trường... Mình muốn quay lại lấy...'],
      ['Cô Thảo', 'Minh ơi! Nước lũ đã chia cắt đường về trường rồi, tuyệt đối không được quay lại!'],
      ['Duyên', 'Tính mạng của bạn là quan trọng nhất! Hãy nói chuyện với Minh để bạn hiểu ra!']
    ],
    bamboo_bridge: [
      ['Bác Mạnh', 'Cầu tre dân sinh tạm thời bắc qua suối. Tôi đã buộc lại thanh giằng chắc chắn.'],
      ['Cô Thảo', 'Cô sẽ dắt tay Minh đi trước. Bạn và Duyên bọc lót phía sau, đi từng người một!'],
      ['Bạn Minh', 'Mình sẽ nắm chặt tay cô Thảo... Mình không sợ nữa!']
    ],
    safe_ascent: [
      ['Bạn', 'Bậc đá khối cổ ở đây rất kiên cố, không bị xói lở chút nào!'],
      ['Duyên', 'Nhìn kìa! Ngọn đèn vàng nhà văn hóa thôn trên đỉnh đồi đã sáng rực!'],
      ['Bạn Minh', 'Cảm ơn các bạn nhiều lắm! Chúng ta sắp tới nơi an toàn rồi!']
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
    if (s.complete) return 'Chương 04 hoàn thành. Đã đưa bạn Minh lên dốc an toàn!';
    if (s.scene === 'village_outskirts') {
      return s.solved.includes('village_outskirts')
        ? 'Tiến vào trạm sơ tán xóm tìm bạn Minh.'
        : 'Nắm vững kỹ năng vượt ngõ xóm ngập bùn lầy.';
    }
    if (s.scene === 'isolation_post') {
      if (!s.minhSaved) {
        return 'Thuyết phục bạn Minh đặt tính mạng lên số 1, không quay lại tìm tranh.';
      }
      return 'Dìu bạn Minh tiến tới Cầu Tre Dã Chiến.';
    }
    if (s.scene === 'bamboo_bridge') {
      return s.solved.includes('bamboo_bridge')
        ? 'Dìu bạn Minh bước vững chãi lên dốc đá an toàn.'
        : 'Quy tắc an toàn khi qua cầu tre dã chiến.';
    }
    if (s.scene === 'safe_ascent') {
      return s.solved.includes('safe_ascent')
        ? 'Cả đoàn tiến vào Đỉnh Đồi An Toàn (Chương 05).'
        : 'Sắp xếp đội hình bọc lót bảo vệ nhau leo dốc.';
    }
    return 'Di chuyển an toàn theo hướng dẫn.';
  }

  function render() {
    const scene = D.scenes[s.scene];
    if (!scene) return;

    $('spots').hidden = !s.started;
    $('scene-name').textContent = scene.name;
    $('landscape').style.backgroundImage = `url('assets/chapter04/${scene.art}.webp')`;
    $('landscape').style.backgroundPosition = scene.position || 'center';
    $('objective').textContent = objective();
    $('progress').textContent = `${s.solved.length}/4 câu đố · Minh: ${s.minhSaved ? '✓ Đã cứu' : 'Đang khóc'}`;

    // Minh world sprite vs Party companion
    const minhWorld = $('minh-world');
    const partyMinh = $('party-minh');
    if (s.scene === 'isolation_post' && !s.minhSaved) {
      if (minhWorld) minhWorld.hidden = !s.started;
      if (partyMinh) partyMinh.hidden = true;
    } else {
      if (minhWorld) minhWorld.hidden = true;
      if (partyMinh) partyMinh.hidden = !s.minhSaved;
    }

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

    if (p.type === 'minh_chat') {
      openMinhAIChatModal();
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
        if (s.scene === 'isolation_post' && !s.minhSaved) {
          speak([['Cô Thảo', 'Chúng ta không thể bỏ lại Minh! Hãy thuyết phục bạn ấy đặt tính mạng lên trên hết trước đã!']]);
        } else {
          speak([['Cô Thảo', 'Cần kiểm tra kỹ các điều kiện an toàn trước khi di chuyển!']]);
        }
      }
      return;
    }

    if (p.type === 'chapter_advance') {
      if (s.solved.includes('safe_ascent')) {
        s.complete = true;
        save();
        showCompletionModal();
      } else {
        speak([['Bác Mạnh', 'Hãy hoàn thành sắp xếp đội hình an toàn trước khi lên đỉnh đồi!']]);
      }
      return;
    }
  }

  function openMinhAIChatModal() {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold)">ĐỐI THOẠI AI THUYẾT PHỤC BẠN HỌC</small>
        <button id="close-minh-chat" style="padding:4px 10px">×</button>
      </div>
      <h2>Trò chuyện với Bạn Minh (AI Gemini)</h2>
      <div style="display:flex;gap:16px;margin:16px 0;align-items:center;background:#0c1e22;padding:12px;border:1px solid var(--line);border-radius:8px">
        <img src="assets/characters/minh/portrait.png" style="width:70px;height:80px;object-fit:cover;border-radius:4px" alt="Minh">
        <p style="margin:0;font-size:13px;line-height:1.7" id="minh-bubble">
          "Mình tiếc bức tranh vẽ mẹ lắm... Mình muốn chạy về lớp lấy tranh..."
        </p>
      </div>
      <p style="font-size:13px;color:#a0c2a7">Gõ lời khuyên chân thành của bạn để thuyết phục Minh hiểu an toàn tính mạng là số một:</p>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="ai-chat-input" class="radio-chat-input" placeholder="Ví dụ: Minh ơi, mẹ chỉ cần bạn an toàn trở về thôi..." maxlength="160" style="flex:1" />
        <button type="button" id="btn-send-minh-ai" class="primary">Gửi lời khuyên 🎙️</button>
      </div>
      <div class="buttons">
        <button type="button" id="btn-quick-persuade" style="font-size:12px">💡 Dùng lời khuyên chuẩn mẫu: "Tính mạng là quan trọng nhất, tranh có thể vẽ lại sau!"</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-minh-chat').onclick = () => { $('modal').hidden = true; };

    const bubble = $('minh-bubble');
    const input = $('ai-chat-input');
    const sendBtn = $('btn-send-minh-ai');
    const quickBtn = $('btn-quick-persuade');

    async function handleSend(text) {
      if (!text) return;
      bubble.textContent = '... [Minh đang lắng nghe bạn nói...]';
      sendBtn.disabled = true;

      try {
        const res = await fetch('/api/radio/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'minh',
            playerName: 'Bạn',
            message: text,
            chapter: 4,
            scene: 'isolation_post'
          })
        });
        const data = await res.json();
        bubble.textContent = `"${data.reply_text || 'Mình hiểu rồi... Cảm ơn các bạn!'}"`;
        s.minhSaved = true;
        save();
        render();

        setTimeout(() => {
          bubble.innerHTML += `<br><strong style="color:#73d13d">✓ Minh đã đồng ý đi cùng đoàn! Bạn đã hoàn thành việc cứu bạn học.</strong>`;
        }, 1000);
      } catch (_) {
        bubble.textContent = '"Cảm ơn bạn... Bạn nói đúng, mẹ chỉ cần mình an toàn. Mình sẽ đi cùng các bạn!"';
        s.minhSaved = true;
        save();
        render();
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.onclick = () => {
      const val = input.value.trim();
      if (val) handleSend(val);
    };

    quickBtn.onclick = () => {
      handleSend('Minh ơi, tính mạng của bạn là trên hết. Tranh vẽ thì sau này bạn vẽ lại tặng mẹ đẹp hơn nhiều!');
    };
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
              <option value="">-- Chọn lý lẽ đối chiếu --</option>
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
          if (puzzleId === 'isolation_post') s.minhSaved = true;
          save();
        }
        setTimeout(() => {
          $('modal').hidden = true;
          render();
          speak([['Cô Thảo', 'Tuyệt vời lắm các em! Cả đoàn cùng nắm tay nhau tiến lên phía trước!']]);
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
        <small style="color:var(--gold);letter-spacing:1px">HOÀN THÀNH CHƯƠNG 04</small>
      </div>
      <h2>Giải Cứu Bạn Minh Thành Công!</h2>
      <p>Cả nhóm đã an toàn vượt qua ngõ xóm ngập bùn, thuyết phục được Minh ưu tiên tính mạng số 1 và cùng vượt qua cầu tre dã chiến.</p>
      <p>Phía trước chính là Đỉnh Đồi An Toàn và Nhà văn hóa thôn, nơi Trưởng làng Minh Anh đang đợi toàn bộ học sinh và bà con!</p>
      <div class="buttons">
        <button id="btn-next-chapter" class="primary">Tiến vào Chương 05: Đỉnh Đồi An Toàn <span>→</span></button>
      </div>
    `;
    $('modal').hidden = false;
    $('btn-next-chapter').onclick = () => {
      window.location.href = 'chapter05.html';
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
      speak(sceneIntros.village_outskirts);
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
          <small style="color:var(--gold)">SỔ TAY CỨU HỘ VÀ TÂM LÝ</small>
          <button id="close-journal">Đóng ×</button>
        </div>
        <h2>Ghi nhận thực địa (${s.clues.length} manh mối)</h2>
        <ul style="line-height:2;padding-left:20px;font-size:13px;color:#d2d9d1">
          ${s.clues.map((c) => `<li><strong>${c}:</strong> Đã quan sát</li>`).join('')}
        </ul>
        <h3 style="margin-top:18px">Nguyên tắc sống còn:</h3>
        <p style="font-size:12px;color:#cbd5ce">1. Tính mạng con người là vô giá, không bao giờ quay lại vùng nguy hiểm lấy đồ đạc.<br>
        2. Cầu tre dã chiến phải đi từng người một, giữ cự ly tối thiểu 3 mét.<br>
        3. Đoàn kết bọc lót, dìu dắt người yếu hơn.</p>
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
      R.initRadioAI({ chapter: 4, scene: s.scene, playerName: 'Bạn' });
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
