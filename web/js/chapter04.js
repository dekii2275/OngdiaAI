(() => {
  'use strict';

  const D = window.Chapter04;
  const P = window.Chapter04Puzzles;
  const R = window.RadioAI;
  const audio = window.SceneAudio ? new window.SceneAudio() : null;
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
      ['Bác Mạnh', 'Cầu tre dân sinh tạm thời bắc qua suối lũ dữ. Tôi thấy mối buộc và thân tre có dấu hiệu chao đảo.'],
      ['Cô Thảo', 'Chúng ta cần AI Giám định hiện trường và lập phác đồ vượt cầu trước khi bước!'],
      ['Bạn Minh', 'Dòng nước xoáy cuộn dưới chân ghê quá... Em sẽ theo sát chỉ dẫn của anh chị và cô Thảo!']
    ],
    safe_ascent: [
      ['Bạn', 'Bậc đá khối cổ ở đây rất kiên cố, không bị xói lở chút nào!'],
      ['Duyên', 'Nhìn kìa! Ngọn đèn vàng nhà văn hóa thôn trên đỉnh đồi đã sáng rực!'],
      ['Bạn Minh', 'Cảm ơn các bạn nhiều lắm! Chúng ta sắp tới nơi an toàn rồi!']
    ]
  };

  function triggerBridgeSway(duration = 700) {
    const stage = $('stage');
    if (!stage) return;
    stage.classList.add('bridge-sway');
    setTimeout(() => stage.classList.remove('bridge-sway'), duration);
  }

  function triggerScreenShake(duration = 500) {
    const stage = $('stage');
    if (!stage) return;
    stage.classList.add('screen-shake');
    setTimeout(() => stage.classList.remove('screen-shake'), duration);
  }

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
        : 'Lập phác đồ kỹ thuật AI & bọc lót Minh vượt cầu tre dã chiến.';
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

    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS?.isEnabled?.() ? 'bật' : 'tắt');
    }

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
      if (p.id === 'water_under_bridge' || p.id === 'bridge_handrail' || p.id === 'minh_trembling') {
        triggerBridgeSway(600);
      }
      speak([[p.speaker, p.text]]);
      return;
    }

    if (p.type === 'minh_chat') {
      openMinhAIChatModal();
      return;
    }

    if (p.type === 'puzzle') {
      if (p.puzzle === 'bamboo_bridge') {
        triggerBridgeSway(700);
        openBridgeBlueprintModal();
      } else {
        openPuzzleModal(p.puzzle);
      }
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
        if (p.to === 'bamboo_bridge') {
          triggerBridgeSway(800);
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

  // Tình huống LLM 1: Đàm thoại tâm lý thuyết phục Minh ưu tiên tính mạng
  function openMinhAIChatModal() {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold)">ĐỐI THOẠI AI THUYẾT PHỤC BẠN HỌC</small>
        <button id="close-minh-chat" style="padding:4px 10px">×</button>
      </div>
      <h2>Trò chuyện với Bạn Minh (AI Gemini)</h2>
      <div style="display:flex;gap:16px;margin:16px 0;align-items:center;background:#0c1e22;padding:12px;border:1px solid var(--line);border-radius:8px">
        <img src="assets/characters/minh/idle.png" style="width:70px;height:85px;object-fit:cover;border-radius:4px" alt="Minh">
        <p style="margin:0;font-size:13px;line-height:1.7" id="minh-bubble">
          "Bức tranh vẽ mẹ của mình vẫn để ở ngăn bàn trường... Mình muốn quay lại lấy... Mẹ đã vất vả vì mình nhiều lắm..."
        </p>
      </div>
      <p style="font-size:13px;color:#a0c2a7">Gõ lời khuyên chân thành của bạn để thuyết phục Minh hiểu an toàn tính mạng là số một:</p>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input type="text" id="ai-chat-input" class="radio-chat-input" placeholder="Ví dụ: Minh ơi, mẹ chỉ cần bạn an toàn trở về thôi..." maxlength="160" style="flex:1" />
        <button type="button" id="btn-send-minh-ai" class="primary">Gửi lời khuyên 🎙️</button>
      </div>
      <div class="buttons">
        <button type="button" id="btn-quick-persuade" style="font-size:12px">💡 Dùng lời khuyên mẫu: "Tính mạng của bạn là quý giá nhất, mẹ chỉ cần bạn bình an. Tranh sau này vẽ lại đẹp hơn nhiều!"</button>
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
      bubble.textContent = '... [Minh đang lắng nghe lời bạn nói trong nước mắt...]';
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
        const reply = data.reply_text || 'Mình hiểu rồi... Bạn nói đúng, mẹ chỉ cần mình an toàn trở về!';
        bubble.textContent = `"${reply}"`;
        s.minhSaved = true;
        save();
        render();

        if (window.VoiceTTS?.isEnabled?.()) {
          window.VoiceTTS.speak('Minh', reply);
        }

        setTimeout(() => {
          bubble.innerHTML += `<br><strong style="color:#73d13d">✓ Minh đã gạt nước mắt, đồng ý bỏ lại đồ đạc để đi cùng đoàn! Bạn đã cứu bạn học thành công.</strong>`;
        }, 800);
      } catch (_) {
        const reply = 'Cảm ơn bạn... Bạn nói đúng, mẹ chỉ cần mình bình an trở về. Mình sẽ không tiếc bức tranh nữa, mình đi cùng các bạn!';
        bubble.textContent = `"${reply}"`;
        s.minhSaved = true;
        save();
        render();

        if (window.VoiceTTS?.isEnabled?.()) {
          window.VoiceTTS.speak('Minh', reply);
        }

        setTimeout(() => {
          bubble.innerHTML += `<br><strong style="color:#73d13d">✓ Minh đã gạt nước mắt, đồng ý đi cùng đoàn!</strong>`;
        }, 800);
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.onclick = () => {
      const val = input.value.trim();
      if (val) handleSend(val);
    };

    quickBtn.onclick = () => {
      handleSend('Minh ơi, tính mạng của bạn là quý giá nhất, mẹ chỉ cần bạn bình an. Tranh sau này vẽ lại đẹp hơn nhiều!');
    };
  }

  // Tình huống LLM 2 (Phi đối thoại): AI Giám định hiện trường & Lập phác đồ vượt cầu tre (Tactical Bridge Blueprint)
  async function openBridgeBlueprintModal() {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">AI GIÁM ĐỊNH HIỆN TRƯỜNG & PHÁC ĐỒ KỸ THUẬT CẦU TRE</small>
        <button id="close-blueprint" style="padding:4px 10px">×</button>
      </div>
      <h2>Tactical Bridge Blueprint (Phác Đồ Vượt Suối Lũ)</h2>
      <p style="color:#d2dcd5;font-size:13px;line-height:1.7">
        Hệ thống AI Đội Công binh & Thủy văn cứu nạn tiếp nhận dữ liệu trinh sát hiện trường cầu tre dã chiến để phân tích ứng suất và dòng xoáy nước lũ.
      </p>

      <div style="background:#0a171a;border:1px solid var(--line);border-radius:6px;padding:12px;margin:12px 0">
        <div style="font-size:12px;color:var(--gold);margin-bottom:6px">📋 DỮ LIỆU KIỂM TRA HIỆN TRƯỜNG:</div>
        <ul style="margin:0;padding-left:18px;font-size:12px;color:#cbd5ce;line-height:1.8">
          <li><strong>Mối buộc tre lỏng:</strong> Lạt tre ngậm no nước lũ, cọc neo đầu cầu chịu lực xô lệch.</li>
          <li><strong>Thân tre đực rêu trơn:</strong> Mặt cầu dốc trơn giữa dòng lũ dữ dội, rung lắc biên độ lớn.</li>
          <li><strong>Dòng xoáy mạn phải:</strong> Dòng nước lũ ngầm tạo ngẫu lực xoắn làm nghiêng mặt cầu sang phải.</li>
        </ul>
      </div>

      <div id="blueprint-status" style="color:var(--gold);font-size:13px;margin:12px 0">
        ⏳ AI đang phân tích dữ liệu ứng suất và xuất phác đồ 3 phân khu...
      </div>

      <div id="blueprint-content" hidden></div>

      <div class="buttons" id="blueprint-actions" hidden>
        <button id="btn-start-bridge-crossing" class="primary" style="font-size:14px;padding:12px 20px">
          Bắt đầu vượt cầu tre theo phác đồ (WASD) ➔
        </button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-blueprint').onclick = () => { $('modal').hidden = true; };

    const inspectionData = ['Mối buộc tre lỏng', 'Thân tre đực rêu trơn', 'Dòng xoáy mạn phải'];
    let blueprintResult = null;

    try {
      const res = await fetch('/api/tactical/bridge-blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspection: inspectionData,
          inspectionData: inspectionData
        })
      });
      if (res.ok) {
        blueprintResult = await res.json();
      }
    } catch (_) {}

    if (!blueprintResult || !Array.isArray(blueprintResult.zones)) {
      blueprintResult = {
        zones: [
          {
            id: 'zone_1',
            name: 'Phân Khu 1: Đầu cầu & Cọc neo',
            status: 'caution',
            observation: 'Mối buộc tre lỏng',
            risk: 'Lạt tre ngậm nước lũ dễ xô dịch, cọc ghìm lung lay',
            advice: 'Kiểm tra cọc ghìm, bám chắc tay vịn, từng người một bước chậm rãi'
          },
          {
            id: 'zone_2',
            name: 'Phân Khu 2: Thân tre đực giữa suối',
            status: 'warning',
            observation: 'Thân tre đực rêu trơn',
            risk: 'Bề mặt trơn trượt và biên độ rung lắc mạnh do dòng nước cuộn xô',
            advice: 'Hạ thấp trọng tâm, giữ cự ly tối thiểu 3m, mắt nhìn thẳng mố đá bên kia tuyệt đối không nhìn xuống xoáy nước'
          },
          {
            id: 'zone_3',
            name: 'Phân Khu 3: Mố đá tiếp bờ an toàn',
            status: 'safe_landing',
            observation: 'Dòng xoáy mạn phải',
            risk: 'Dòng xoáy ngầm tạo lực xoắn ép thân cầu nghiêng sang mạn phải',
            advice: 'Nghiêng trọng tâm sang mạn trái để cân bằng, dứt khoát bước lên móng đá kiên cố'
          }
        ],
        tacticalNote: 'QUY TẮC SỐNG CÒN: Giãn cách 3 mét giữa các thành viên. Đi từng người một. Hạ thấp trọng tâm. Tuyệt đối không nhìn xuống dòng xoáy nước lũ mà nhìn thẳng bờ đá đối diện.'
      };
    }

    const statusEl = $('blueprint-status');
    const contentEl = $('blueprint-content');
    const actionsEl = $('blueprint-actions');

    if (statusEl) statusEl.textContent = '✓ AI ĐÃ LẬP PHÁC ĐỒ VƯỢT CẦU TRE THÀNH CÔNG:';
    if (contentEl) {
      contentEl.hidden = false;
      contentEl.innerHTML = `
        <div class="tactical-note-box">
          <strong>⚡ CHỈ DẪN CHIẾN THUẬT:</strong> ${blueprintResult.tacticalNote || 'Giãn cách 3m, đi từng người một, hạ thấp trọng tâm, mắt nhìn thẳng mố đá.'}
        </div>
        <div class="zones-container">
          ${blueprintResult.zones.map((z, idx) => `
            <div class="blueprint-card">
              <h3>
                <span>Phân Khu ${idx + 1}: ${z.name || z.id}</span>
                <span class="status-tag status-${z.status || 'caution'}">${z.status === 'safe_landing' ? 'ĐÍCH AN TOÀN' : (z.status === 'warning' ? 'NGUY HIỂM CAO' : 'CHÚ Ý')}</span>
              </h3>
              <p><strong>Hiểm họa:</strong> ${z.risk || z.observation}</p>
              <p style="color:#b3d4b7"><strong>Chiến thuật:</strong> ${z.advice}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (actionsEl) {
      actionsEl.hidden = false;
      $('btn-start-bridge-crossing').onclick = () => {
        startBridgeCrossing(blueprintResult);
      };
    }
  }

  // Mini-sequence WASD qua cầu tre dã chiến: Bọc lót Minh, giữ thăng bằng chống chao đảo
  function startBridgeCrossing(blueprintData, done) {
    let bridgeProgress = 0; // 0 to 100
    let balance = 50; // 0 to 100, 50 is center
    let drift = 0;
    let activeStep = false;
    let swayTimer = null;
    let lastTime = performance.now();
    const held = new Set();

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">MINI-SEQUENCE WASD · VƯỢT CẦU TRE DÃ CHIẾN</small>
        <button id="close-bridge-game" style="padding:4px 10px">×</button>
      </div>
      <h2>Bọc Lót Cho Minh Vượt Cầu Tre Rung Lắc</h2>
      <p style="font-size:13px;line-height:1.7;color:#c8d4cf">
        Dòng nước lũ cuộn xoáy đang làm cầu tre đu đưa dữ dội. Dùng phím <kbd>A</kbd> / <kbd>D</kbd> (hoặc ← / →) để nghiêng người giữ thanh thăng bằng trong <strong>vùng an toàn</strong> (33% - 67%). Nhấn giữ <kbd>W</kbd> hoặc <kbd>Space</kbd> (hoặc nút <strong>Bước tới cẩn trọng</strong>) để dìu Minh tiến bước theo từng phân khu phác đồ.
      </p>

      <div style="background:#091619;border:1px solid var(--line);border-radius:6px;padding:14px;margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span id="bridge-zone-indicator" style="color:var(--gold);font-weight:600">PHÂN KHU 1: ĐẦU CẦU & CỌC NEO</span>
          <span id="bridge-balance-status" style="color:#52c41a;font-weight:600">⚖️ THĂNG BẰNG: VỮNG CHẮC</span>
        </div>

        <div class="bridge-balance-bar">
          <div class="bridge-balance-target" title="Vùng thăng bằng an toàn"></div>
          <div id="bridge-balance-indicator" class="bridge-balance-indicator"></div>
        </div>

        <div class="bridge-lane" id="bridge-track">
          <div class="bamboo-beam"></div>
          <div class="swirl-zone flood-current" style="left:72%;" title="Dòng xoáy mạn phải nguy hiểm">🌀</div>
          <div id="bridge-player-marker" class="bridge-player-marker" style="left:5%">
            🚶‍♂️🤝👦
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;font-size:11px;color:#8aa098;margin-top:6px">
          <span>Bờ xuất phát (Trạm sơ tán)</span>
          <span style="color:#e76f51">⚠️ Vùng xoáy mạn phải (Zone 3)</span>
          <span style="color:#52c41a">Mố đá bờ an toàn</span>
        </div>
      </div>

      <p id="bridge-progress-text" style="color:var(--gold);font-size:13px;font-weight:500;margin:8px 0">
        Tiến độ vượt cầu tre: 0% · Bắt đầu bước vào Phân Khu 1
      </p>

      <div class="buttons" style="display:flex;gap:8px">
        <button id="bridge-left" style="flex:1">◀ Nghiêng Trái (A)</button>
        <button id="bridge-step" class="primary" style="flex:2">Bước tới bọc lót cho Minh (W / Space) 🚶‍♂️</button>
        <button id="bridge-right" style="flex:1">Nghiêng Phải (D) ▶</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-bridge-game').onclick = () => {
      $('modal').hidden = true;
      if (swayTimer) cancelAnimationFrame(swayTimer);
    };

    const bStep = $('bridge-step');
    bStep.onpointerdown = (e) => { e.preventDefault(); activeStep = true; bStep.setPointerCapture(e.pointerId); };
    bStep.onpointerup = bStep.onpointercancel = bStep.onlostpointercapture = () => { activeStep = false; };

    const bLeft = $('bridge-left');
    bLeft.onpointerdown = (e) => { e.preventDefault(); held.add('a'); bLeft.setPointerCapture(e.pointerId); };
    bLeft.onpointerup = bLeft.onpointercancel = bLeft.onlostpointercapture = () => { held.delete('a'); };

    const bRight = $('bridge-right');
    bRight.onpointerdown = (e) => { e.preventDefault(); held.add('d'); bRight.setPointerCapture(e.pointerId); };
    bRight.onpointerup = bRight.onpointercancel = bRight.onlostpointercapture = () => { held.delete('d'); };

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

    function cleanup() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (swayTimer) cancelAnimationFrame(swayTimer);
    }

    const frame = (now) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      // Natural sway drift based on bridge zone
      if (bridgeProgress < 30) {
        // Zone 1: mild sway
        drift = Math.sin(now * 0.003) * 14;
      } else if (bridgeProgress < 70) {
        // Zone 2: high current turbulence and bridge sway
        drift = Math.sin(now * 0.005) * 28 + Math.cos(now * 0.002) * 12;
      } else {
        // Zone 3: whirlpool on the right creates persistent rightward pull (+32)
        drift = Math.sin(now * 0.004) * 18 + 24;
      }

      // Player tilting controls
      if (held.has('a') || held.has('arrowleft')) {
        balance -= 48 * dt;
      }
      if (held.has('d') || held.has('arrowright')) {
        balance += 48 * dt;
      }

      // Apply natural sway
      balance += drift * dt;
      balance = Math.max(8, Math.min(92, balance));

      // Is balance within safe zone (33% to 67%)?
      const isBalanced = balance >= 30 && balance <= 70;

      // Stepping forward
      const isStepping = activeStep || held.has(' ') || held.has('w') || held.has('arrowup');
      if (isStepping) {
        if (isBalanced) {
          bridgeProgress += 18 * dt;
        } else {
          // Out of balance: heavy sway warning, minimal movement
          triggerBridgeSway(250);
          bridgeProgress += 2.5 * dt;
        }
      }

      // Update UI elements
      const indicator = $('bridge-balance-indicator');
      if (indicator) {
        indicator.style.left = (balance - 10) + '%';
        indicator.style.background = isBalanced ? '#52c41a' : '#e76f51';
      }

      const statusEl = $('bridge-balance-status');
      if (statusEl) {
        if (isBalanced) {
          statusEl.textContent = '⚖️ THĂNG BẰNG: VỮNG CHẮC';
          statusEl.style.color = '#52c41a';
        } else {
          statusEl.textContent = '⚠️ CHAO ĐẢO MẠNH! NGHIÊNG NGƯỜI LẠI!';
          statusEl.style.color = '#e76f51';
        }
      }

      const marker = $('bridge-player-marker');
      if (marker) {
        marker.style.left = Math.min(92, Math.max(5, bridgeProgress)) + '%';
      }

      const zoneIndicator = $('bridge-zone-indicator');
      const progressText = $('bridge-progress-text');

      let zoneName = 'Phân Khu 1: Đầu cầu & Cọc neo';
      if (bridgeProgress >= 70) {
        zoneName = 'Phân Khu 3: Mố đá tiếp bờ (Áp lực xoáy mạn phải)';
      } else if (bridgeProgress >= 30) {
        zoneName = 'Phân Khu 2: Thân tre đực giữa suối lũ dữ';
      }

      if (zoneIndicator) zoneIndicator.textContent = zoneName.toUpperCase();
      if (progressText) {
        progressText.textContent = `Tiến độ vượt cầu tre: ${Math.min(100, Math.floor(bridgeProgress))}% · ${zoneName}`;
      }

      // Check win condition
      if (bridgeProgress >= 100) {
        cleanup();
        if (!s.solved.includes('bamboo_bridge')) {
          s.solved.push('bamboo_bridge');
          save();
        }
        if (audio) audio.play('unlock');
        $('modal').hidden = true;
        render();

        speak([
          ['Bạn', 'Chúng ta đã qua bờ an toàn rồi! Minh làm tốt lắm, bám rất chắc tay!'],
          ['Bạn Minh', 'Em cảm ơn anh/chị và cô Thảo nhiều lắm! Em đã không nhìn xuống xoáy nước và giữ được thăng bằng!'],
          ['Cô Thảo', 'Xuất sắc lắm các em! Cả đoàn đã vượt qua dòng suối lũ dữ an toàn. Phía trước là dốc đá kiên cố dẫn lên đỉnh đồi!']
        ], done);
        return;
      }

      swayTimer = requestAnimationFrame(frame);
    };

    swayTimer = requestAnimationFrame(frame);
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

    if (text.startsWith('[Bộ đàm') && audio) audio.play('radio');
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

  // Khảo hạch AI Cô Thảo & Minh cấp PASS CHƯƠNG 04
  async function performDebriefEvaluation(playerAnswer) {
    const DEBRIEF_QUESTION = 'Tại sao khi vượt cầu tre dã chiến trong dòng nước lũ, chúng ta bắt buộc phải đi từng người một cách nhau 3 mét và tuyệt đối không nhìn xuống xoáy nước?';
    const cleanAnswer = String(playerAnswer || '').trim();
    let result = null;

    try {
      const res = await fetch('/api/debrief/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: 4,
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
      const dangerous = /(?:đi cùng lúc|tụ tập|nhảy qua|nhìn xuống xoáy nước|ôm nhau qua)/i.test(lower);
      const negated = /(?:không|chớ|đừng|tuyệt đối không|tránh)\s+.*(?:đi cùng lúc|tụ tập|nhìn xuống)/i.test(lower);

      if (cleanAnswer.length < 5) {
        result = {
          passed: false,
          feedback: 'Câu trả lời quá ngắn. Con cần giải thích rõ vì sao phải giữ cự ly giãn cách 3 mét và không nhìn xuống dòng nước xoáy lũ.'
        };
      } else if (dangerous && !negated) {
        result = {
          passed: false,
          feedback: 'Chưa đạt! Đi cùng lúc sẽ gây quá tải trọng làm gãy nhịp tre, và nhìn xuống xoáy nước sẽ gây chóng mặt mất thăng bằng ngã xuống dòng nước lũ.'
        };
      } else {
        result = {
          passed: true,
          feedback: 'Xuất sắc! Con đã nắm vững nguyên lý công binh cứu hộ: Đi từng người giãn cách 3m để giảm tải trọng chống sập nhịp cầu tre và triệt tiêu dao động cộng hưởng rung lắc; mắt nhìn thẳng bờ đá không nhìn xuống xoáy nước để tránh chóng mặt, mất thăng bằng.'
        };
      }
    }
    return result;
  }

  function showCompletionModal() {
    const DEBRIEF_QUESTION = 'Tại sao khi vượt cầu tre dã chiến trong dòng nước lũ, chúng ta bắt buộc phải đi từng người một cách nhau 3 mét và tuyệt đối không nhìn xuống xoáy nước?';
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">KHẢO HẠCH AI · CÔ THẢO & BẠN MINH</small>
      </div>
      <h2>Khảo Hạch Vượt Chương 04</h2>
      <p style="font-size:15px;color:#fff7df;margin:10px 0;line-height:1.7"><strong>“${DEBRIEF_QUESTION}”</strong></p>
      <p style="font-size:13px;color:#c1cdbf">Nhập phân tích cứu nạn thực địa của bạn để Cô Thảo và Bạn Minh thẩm định cấp chứng nhận PASS Chương 04:</p>
      <div style="margin:12px 0">
        <textarea id="ch4-debrief-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập câu trả lời phân tích (VD: Đi từng người cách nhau 3m để giảm tải trọng dồn nén chống sập nhịp cầu tre; không nhìn xuống xoáy nước để tránh chóng mặt mất thăng bằng)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" id="prompt-debrief-1" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý đạt chuẩn: "Đi từng người một cách nhau 3 mét để giảm tải trọng dồn nén chống sập nhịp cầu tre và triệt tiêu dao động cộng hưởng rung lắc; tuyệt đối không nhìn xuống dòng xoáy nước lũ để tránh bị chóng mặt, mất thăng bằng ngã xuống dòng nước xiết, mà luôn nhìn thẳng vào mố đá kiên cố bờ bên kia."</button>
        <button class="option" id="prompt-debrief-2" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý ngắn: "Giảm tải trọng cho thân tre và không bị hoa mắt chóng mặt bởi dòng nước xoáy, bảo vệ an toàn tính mạng tuyệt đối."</button>
      </div>
      <p id="ch4-debrief-status" role="status" style="color:var(--gold)"></p>
      <div id="ch4-debrief-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="ch4-debrief-submit" class="primary">Nộp bài khảo hạch AI</button>
        <a id="ch4-unlock-ch5" href="chapter05.html" class="primary" hidden style="background:#389e0d;border-color:#52c41a;color:#fff;display:inline-block;padding:11px 17px;border-radius:4px">Tiến vào Chương 05: Đỉnh Đồi An Toàn ➔</a>
      </div>
    `;

    $('modal').hidden = false;

    $('prompt-debrief-1').onclick = () => {
      $('ch4-debrief-input').value = 'Đi từng người một cách nhau 3 mét để giảm tải trọng dồn nén chống sập nhịp cầu tre và triệt tiêu dao động cộng hưởng rung lắc; tuyệt đối không nhìn xuống dòng xoáy nước lũ để tránh bị chóng mặt, mất thăng bằng ngã xuống dòng nước xiết, mà luôn nhìn thẳng vào mố đá kiên cố bờ bên kia.';
    };
    $('prompt-debrief-2').onclick = () => {
      $('ch4-debrief-input').value = 'Giảm tải trọng cho thân tre và không bị hoa mắt chóng mặt bởi dòng nước xoáy, bảo vệ an toàn tính mạng tuyệt đối.';
    };

    const runDebrief = async (chosenAnswer) => {
      const input = chosenAnswer || ($('ch4-debrief-input')?.value || '').trim() ||
        'Đi từng người cách nhau 3m để giảm tải trọng dồn nén chống gãy nhịp tre; không nhìn xuống xoáy nước lũ để tránh hoa mắt chóng mặt ngã xuống nước.';
      $('ch4-debrief-status').textContent = 'Cô Thảo và Bạn Minh đang thẩm định bài khảo hạch...';
      const submitBtn = $('ch4-debrief-submit');
      if (submitBtn) submitBtn.disabled = true;

      const result = await performDebriefEvaluation(input);
      const resultBox = $('ch4-debrief-result');

      if (result.passed) {
        if (audio) audio.play('unlock');
        $('ch4-debrief-status').textContent = '✓ KHẢO HẠCH ĐẠT YÊU CẦU!';
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div class="badge-pass">
            <b>🎖️ PASS CHƯƠNG 04: CHIẾN SĨ CỨU HỘ ĐỒNG ĐỘI</b>
            <p style="margin:6px 0;line-height:1.7;color:#eee9db">${result.feedback}</p>
          </div>
        `;
        s.complete = true;
        s.passedBadge = 'PASS CHƯƠNG 04: CHIẾN SĨ CỨU HỘ ĐỒNG ĐỘI';
        save();

        const unlockBtn = $('ch4-unlock-ch5');
        if (unlockBtn) unlockBtn.hidden = false;
      } else {
        $('ch4-debrief-status').textContent = '✗ BÀI LÀM CHƯA ĐẠT';
        if (submitBtn) submitBtn.disabled = false;
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div style="background:#2a1215;border:1px solid #ff4d4f;padding:12px;border-radius:4px">
            <p style="color:#ff7875;margin:0;line-height:1.7">${result.feedback}</p>
          </div>
        `;
      }
    };

    $('ch4-debrief-submit').onclick = () => runDebrief();
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

    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.onclick = () => {
        if (window.VoiceTTS) {
          window.VoiceTTS.toggle();
          voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS.isEnabled() ? 'bật' : 'tắt');
        }
      };
    }

    const soundBtn = $('sound');
    if (soundBtn && audio) {
      soundBtn.onclick = () => {
        audio.init();
        const on = !audio.enabled;
        audio.enabled = on;
        soundBtn.textContent = 'Âm thanh: ' + (on ? 'bật' : 'tắt');
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
          <small style="color:var(--gold)">SỔ TAY CỨU HỘ VÀ TÂM LÝ</small>
          <button id="close-journal">Đóng ×</button>
        </div>
        <h2>Ghi nhận thực địa (${s.clues.length} manh mối)</h2>
        <ul style="line-height:2;padding-left:20px;font-size:13px;color:#d2d9d1">
          ${s.clues.map((c) => `<li><strong>${c}:</strong> Đã quan sát</li>`).join('')}
        </ul>
        <h3 style="margin-top:18px">Nguyên tắc sống còn:</h3>
        <p style="font-size:12px;color:#cbd5ce">1. Tính mạng con người là vô giá, không bao giờ quay lại vùng nguy hiểm lấy đồ đạc.<br>
        2. Cầu tre dã chiến phải đi từng người một, giữ cự ly tối thiểu 3 mét, không nhìn xuống xoáy nước.<br>
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
