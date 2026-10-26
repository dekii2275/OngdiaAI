(() => {
  'use strict';

  const D = window.Chapter03;
  const P = window.Chapter03Puzzles;
  const R = window.RadioAI;
  const audio = window.SceneAudio ? new window.SceneAudio() : null;
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
      ['Bạn', 'Dừng lại! Phía trước có một vết nứt đất rất dài hình cánh cung cắt ngang bờ dốc taluy!'],
      ['Duyên', 'Bụi tre ở mép đường cũng bị nghiêng hẳn xuống vực rồi...'],
      ['Thảo', 'Nước đục sủi bọt đùn ra từ vết nứt. Bật bộ đàm báo cáo bác Trưởng làng Minh Anh ngay!']
    ],
    mudflow_bend: [
      ['Duyên', 'Khúc cua này nước đỏ ngầu chảy tràn qua mặt đường rồi cô ơi!'],
      ['Mạnh', 'Miệng cống bị đá rác bít chặt. Không được lội bừa qua chỗ nước sâu quá gối!'],
      ['Bạn', 'Cầm gậy dò đường, lần theo gờ đá cứng để né các vũng bùn lún!']
    ],
    boulder_pass: [
      ['Mạnh', 'Khối đá tảng hàng tấn vừa sạt xuống chặn đứng đường chính!'],
      ['Thảo', 'Đừng ai cố trèo qua tảng đá trơn. Bác Minh Anh vừa chỉ đường vòng sống đá bên phải!'],
      ['Bạn', 'Chúng ta can ngăn bác Mạnh và men theo sống đá gốc để vượt qua an toàn!']
    ]
  };

  function triggerScreenShake(duration = 550) {
    const stage = $('stage');
    if (!stage) return;
    stage.classList.remove('screen-shake');
    void stage.offsetWidth;
    stage.classList.add('screen-shake');
    if (audio) audio.play('thunder');
    setTimeout(() => {
      stage.classList.remove('screen-shake');
    }, duration);
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
    if (s.complete) return 'Chương 03 hoàn thành. Đã vượt qua sườn đồi sạt lở!';
    if (s.scene === 'ridge_entry') {
      return s.solved.includes('ridge_entry')
        ? 'Tiến vào Vùng Nứt Đất cùng Bác Mạnh và Cô Thảo.'
        : 'Khởi động bộ đàm AI, thiết lập liên lạc với Trưởng làng.';
    }
    if (s.scene === 'crack_zone') {
      return s.solved.includes('crack_zone')
        ? 'Vòng qua vệt nứt tiến tới Khúc Cua Suối Bùn.'
        : 'Quan sát 3 dấu hiệu sạt lở taluy và báo cáo vệt nứt D1 qua bộ đàm.';
    }
    if (s.scene === 'mudflow_bend') {
      return s.solved.includes('mudflow_bend')
        ? 'Cẩn thận bước qua hẻm đá sạt lở phía trước.'
        : 'Dùng gậy dò đường vượt qua khúc cua nước bùn tràn mặt đường.';
    }
    if (s.scene === 'boulder_pass') {
      return s.solved.includes('boulder_pass')
        ? 'Men theo sống đá tiến vào khu vực xóm ngoài (Chương 04).'
        : 'Can ngăn Bác Mạnh không trèo đá tảng và tìm giải pháp sống đá an toàn.';
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

    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS?.isEnabled?.() ? 'bật' : 'tắt');
    }

    $('spots').replaceChildren();
    for (const p of scene.spots) {
      const btn = document.createElement('button');
      const isExit = p.type === 'exit' || p.type === 'chapter_advance';
      let label = p.label;
      if (p.id === 'radio-crack' && s.minhAnhReported) {
        label = '✓ Đã báo cáo vệt nứt D1';
      }
      if (p.id === 'blocked_path' && s.manhDissuaded) {
        label = '✓ Đã can ngăn Bác Mạnh';
      }
      btn.className = 'spot ' + (isExit ? 'exit ' : '') + (s.clues.includes(p.id) || s.solved.includes(p.puzzle) ? 'seen' : '');
      btn.style.left = p.x + '%';
      btn.style.top = p.y + '%';
      btn.textContent = label;
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

    if (p.id === 'radio-crack') {
      showMinhAnhReportModal();
      return;
    }

    if (p.id === 'blocked_path') {
      if (!s.clues.includes('blocked_path')) {
        s.clues.push('blocked_path');
        save();
      }
      triggerScreenShake(450);
      showManhDissuadeModal();
      return;
    }

    if (p.id === 'pebble_slide' || p.id === 'sound_rumble') {
      triggerScreenShake(400);
    }

    if (p.type === 'clue') {
      if (!s.clues.includes(p.id)) {
        s.clues.push(p.id);
        save();
      }
      speak([[p.speaker, p.text]]);
      return;
    }

    if (p.type === 'radio_call') {
      showMinhAnhReportModal();
      return;
    }

    if (p.type === 'puzzle') {
      if (p.puzzle === 'mudflow_bend') {
        startMudflowWalk();
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
        if (p.to === 'boulder_pass' || p.to === 'mudflow_bend') {
          triggerScreenShake(500);
        }
        save();
      } else {
        speak([['Cô Thảo', 'Chúng ta cần giải quyết câu đố và quan sát an toàn khu vực này trước khi đi tiếp!']]);
      }
      return;
    }

    if (p.type === 'chapter_advance') {
      if (s.solved.includes('boulder_pass')) {
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
    if (text.startsWith('[Bộ đàm') && audio) audio.play('radio');
    if (window.VoiceTTS?.isEnabled?.()) {
      window.VoiceTTS.speak(speaker, text);
    }
  }

  // Tình huống LLM 1: Báo cáo bộ đàm khẩn cấp cho Trưởng làng Minh Anh về vệt nứt D1
  function showMinhAnhReportModal(done) {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">BỘ ĐÀM KHẨN CẤP · TRƯỞNG LÀNG MINH ANH</small>
        <button id="close-minh-anh-report" style="padding:4px 10px">×</button>
      </div>
      <h2>Báo Cáo Vệt Nứt Sườn Đồi D1</h2>
      <p>Nhóm bạn vừa phát hiện <strong>vết nứt hình cánh cung D1</strong> dài hơn 10m cắt ngang taluy sườn đồi, rặng tre nghiêng về phía thung lũng và nước đục sủi tăm đùn ra từ vách đất. Hãy lập tức gửi báo cáo bộ đàm khẩn cấp cho Trưởng làng Minh Anh để thông báo tình trạng sạt lở cấp bách.</p>
      <div style="margin:12px 0">
        <textarea id="crack-report-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập báo cáo bộ đàm (VD: Báo cáo Trưởng làng Minh Anh: Xuất hiện vết nứt cánh cung D1 sườn đồi, rặng tre nghiêng và nước đục sủi tăm. Đất ngậm no nước có nguy cơ sạt lở taluy cấp bách, đề nghị kích hoạt còi sơ tán)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" id="prompt-minh-anh-1" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý 1: "Báo cáo Trưởng làng Minh Anh: Tại sườn đồi xuất hiện vết nứt hình cánh cung D1 dài hơn chục mét, rặng tre nghiêng về phía taluy âm và nước đục sủi bọt từ vách đất. Nguy cơ sạt trượt đất taluy diện rộng cấp bách, đề nghị kích hoạt còi sơ tán toàn xóm ngay!"</button>
        <button class="option" id="prompt-minh-anh-2" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý 2: "Bác Minh Anh ơi, vệt nứt D1 đang tách rộng thêm 5cm, nước từ vách đất đùn ra nhiều bùn đục. Nguy cơ sạt lở cấp bách, cả đoàn xin chỉ đạo đường vòng an toàn!"</button>
      </div>
      <p id="crack-report-status" role="status" style="color:var(--gold)"></p>
      <div id="crack-report-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="crack-report-submit" class="primary">Phát tín hiệu bộ đàm tới Trưởng làng</button>
        <button id="crack-report-close" hidden>Đóng bộ đàm</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-minh-anh-report').onclick = () => { $('modal').hidden = true; };

    $('prompt-minh-anh-1').onclick = () => {
      $('crack-report-input').value = 'Báo cáo Trưởng làng Minh Anh: Tại sườn đồi xuất hiện vết nứt hình cánh cung D1 dài hơn chục mét, rặng tre nghiêng về phía taluy âm và nước đục sủi bọt từ vách đất. Nguy cơ sạt trượt đất taluy diện rộng cấp bách, đề nghị kích hoạt còi sơ tán toàn xóm ngay!';
    };
    $('prompt-minh-anh-2').onclick = () => {
      $('crack-report-input').value = 'Bác Minh Anh ơi, vệt nứt D1 đang tách rộng thêm 5cm, nước từ vách đất đùn ra nhiều bùn đục. Nguy cơ sạt lở cấp bách, cả đoàn xin chỉ đạo đường vòng an toàn!';
    };

    $('crack-report-submit').onclick = async () => {
      const input = ($('crack-report-input')?.value || '').trim() ||
        'Báo cáo Trưởng làng Minh Anh: Vết nứt cánh cung D1 sườn đồi mở rộng, rặng tre nghiêng taluy âm và nước đục sủi tăm. Nguy cơ trượt lở cấp bách, đề nghị phát lệnh sơ tán khẩn cấp xóm dưới!';
      $('crack-report-status').textContent = 'Đang truyền tín hiệu bộ đàm khẩn cấp tới Trưởng làng...';
      $('crack-report-submit').disabled = true;

      let reply = null;
      try {
        const res = await fetch('/api/radio/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'minh_anh',
            playerName: 'Bạn',
            message: input,
            chapter: 3,
            scene: 'crack_zone'
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply_text;
        }
      } catch (_) {}

      if (!reply) {
        reply = 'Trưởng làng Minh Anh nghe rõ! Vết nứt cánh cung D1 kết hợp rặng tre nghiêng và nước đục sủi tăm là dấu hiệu kinh điển của sạt trượt taluy cấp bách! Tôi sẽ cho hú còi sơ tán khẩn cấp xóm dưới ngay lập tức. Các cháu tuyệt đối không lại gần mép nứt, vòng qua sườn đồi hướng khúc cua suối bùn mau!';
      }

      s.minhAnhReported = true;
      save();
      if (audio) audio.play('unlock');
      $('crack-report-status').textContent = '✓ Trưởng làng Minh Anh đã tiếp nhận báo cáo!';
      const resBox = $('crack-report-result');
      resBox.hidden = false;
      resBox.innerHTML = `
        <div class="entry good" style="border-left:3px solid #52c41a;background:#142920;padding:12px 16px;margin:8px 0;border-radius:4px">
          <small style="color:#52c41a;font-weight:700">TRƯỞNG LÀNG MINH ANH HỒI ĐÁP BỘ ĐÀM (KÊNH MINH_ANH)</small>
          <p style="margin:6px 0;line-height:1.7;color:#fff7df">“${reply}”</p>
        </div>
        <p style="color:#b3d4b7;font-size:12px">Báo cáo chuẩn xác! Còi báo động sơ tán xóm dưới đã vang lên kịp thời.</p>
      `;

      $('crack-report-submit').hidden = true;
      const closeBtn = $('crack-report-close');
      closeBtn.hidden = false;
      closeBtn.className = 'primary';
      closeBtn.textContent = 'Tiếp tục hành trình →';
      closeBtn.onclick = () => {
        $('modal').hidden = true;
        render();
        if (done) done();
      };
    };
  }

  // Tình huống LLM 2: Can ngăn Bác Mạnh không trèo qua đá tảng rêu trơn
  function showManhDissuadeModal(done) {
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">CAN THIỆP AN TOÀN · BÁC MẠNH TIỀN TRẠM</small>
        <button id="close-manh-dissuade" style="padding:4px 10px">×</button>
      </div>
      <h2>Can Ngăn Bác Mạnh Không Trèo Qua Đá Tảng Rêu Trơn</h2>
      <p>Khối đá tảng hàng tấn vừa sạt xuống chắn ngang đường chính. Bác Mạnh đang định leo trèo qua khối đá phủ rêu trơn trượt để tìm đường. Hãy can ngăn Bác Mạnh bằng lý lẽ khoa học an toàn cứu nạn, thuyết phục bác đi theo lối mòn sống đá gốc 15m kiên cố.</p>
      <div style="margin:12px 0">
        <textarea id="manh-dissuade-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập lời can ngăn Bác Mạnh (VD: Bác Mạnh ơi không được trèo qua tảng đá! Đá phủ rêu trơn trượt và nền đất đang ngậm nước rất dễ sạt lăn tiếp. Cả nhóm men theo sống đá gốc kiên cố 15m)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" id="prompt-manh-1" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý 1: "Bác Mạnh ơi không được trèo qua tảng đá! Khối đá hàng tấn phủ đầy rêu trơn trượt sau mưa lớn, nền đất bên dưới đang sũng nước rất dễ mất thăng bằng hoặc đá lăn tiếp. Chúng ta phải men theo lối mòn sống đá gốc kiên cố cao hơn 15m như bác Minh Anh hướng dẫn!"</button>
        <button class="option" id="prompt-manh-2" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý 2: "Bác Mạnh dừng lại! Quy tắc cứu nạn là không mạo hiểm vượt chướng ngại đá lở trơn trượt khi sườn đồi còn dịch chuyển. Chúng ta giữ đội hình đi đường vòng sống đá an toàn hơn!"</button>
      </div>
      <p id="manh-dissuade-status" role="status" style="color:var(--gold)"></p>
      <div id="manh-dissuade-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="manh-dissuade-submit" class="primary">Gửi lời can ngăn tới Bác Mạnh</button>
        <button id="manh-dissuade-close" hidden>Đóng bảng</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-manh-dissuade').onclick = () => { $('modal').hidden = true; };

    $('prompt-manh-1').onclick = () => {
      $('manh-dissuade-input').value = 'Bác Mạnh ơi không được trèo qua tảng đá! Khối đá hàng tấn phủ đầy rêu trơn trượt sau mưa lớn, nền đất bên dưới đang sũng nước rất dễ mất thăng bằng hoặc đá lăn tiếp. Chúng ta phải men theo lối mòn sống đá gốc kiên cố cao hơn 15m như bác Minh Anh hướng dẫn!';
    };
    $('prompt-manh-2').onclick = () => {
      $('manh-dissuade-input').value = 'Bác Mạnh dừng lại! Quy tắc cứu nạn là không mạo hiểm vượt chướng ngại đá lở trơn trượt khi sườn đồi còn dịch chuyển. Chúng ta giữ đội hình đi đường vòng sống đá an toàn hơn!';
    };

    $('manh-dissuade-submit').onclick = async () => {
      const input = ($('manh-dissuade-input')?.value || '').trim() ||
        'Bác Mạnh ơi không được trèo qua đá tảng rêu trơn trượt nguy hiểm! Chúng ta men theo lối mòn sống đá gốc kiên cố cao 15m an toàn hơn!';
      $('manh-dissuade-status').textContent = 'Đang trao đổi an toàn với Bác Mạnh...';
      $('manh-dissuade-submit').disabled = true;

      let reply = null;
      try {
        const res = await fetch('/api/radio/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'manh',
            playerName: 'Bạn',
            message: input,
            chapter: 3,
            scene: 'boulder_pass'
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply_text;
        }
      } catch (_) {}

      if (!reply) {
        reply = 'Cháu nói rất chí lý! Tảng đá này phủ đầy rêu trơn như mỡ, lại vừa sạt xuống nên thế đá chưa ổn định, leo lên lỡ trượt chân rơi xuống vực thì nguy hiểm khôn lường. Tôi suýt nữa thì hấp tấp! Cả nhóm nghe lệnh: rẽ sang bên phải men theo gờ sống đá gốc kiên cố!';
      }

      s.manhDissuaded = true;
      if (!s.clues.includes('blocked_path')) {
        s.clues.push('blocked_path');
      }
      save();
      if (audio) audio.play('unlock');
      $('manh-dissuade-status').textContent = '✓ Bác Mạnh đã đồng thuận!';
      const resBox = $('manh-dissuade-result');
      resBox.hidden = false;
      resBox.innerHTML = `
        <div class="entry good" style="border-left:3px solid #52c41a;background:#142920;padding:12px 16px;margin:8px 0;border-radius:4px">
          <small style="color:#52c41a;font-weight:700">BÁC MẠNH TIỀN TRẠM ĐỒNG THUẬN (KÊNH MANH)</small>
          <p style="margin:6px 0;line-height:1.7;color:#fff7df">“${reply}”</p>
        </div>
        <p style="color:#b3d4b7;font-size:12px">Cả nhóm thống nhất không trèo qua đá tảng rêu trơn, chuyển hướng theo sống đá gốc.</p>
      `;

      $('manh-dissuade-submit').hidden = true;
      const closeBtn = $('manh-dissuade-close');
      closeBtn.hidden = false;
      closeBtn.className = 'primary';
      closeBtn.textContent = 'Tiếp tục hành trình →';
      closeBtn.onclick = () => {
        $('modal').hidden = true;
        render();
        if (done) done();
      };
    };
  }

  // Mini-sequence WASD mudflow: Cầm gậy dò đường, bước trên gờ đá né vũng bùn lún
  let mudflowProgress = 0;
  function startMudflowWalk(done) {
    mudflowProgress = 0;
    let active = false;
    let lanePos = 20; // Bắt đầu ở gờ đá bên trái (20%)
    let time = 0;
    let mudflowTimer = null;

    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">MINI-SEQUENCE WASD · KHÚC CUA SUỐI BÙN</small>
        <button id="close-mudflow" style="padding:4px 10px">×</button>
      </div>
      <h2>Vượt Khúc Cua Suối Bùn Với Gậy Dò Đường</h2>
      <p>Dòng bùn đỏ cuộn xoáy đang tràn qua mặt đường. Hãy sử dụng <kbd>A</kbd> / <kbd>D</kbd> (hoặc ← / →) để di chuyển giữa các <strong>gờ đá</strong> kiên cố, né tránh các <strong>vũng bùn lún</strong> nguy hiểm. Nhấn giữ <kbd>W</kbd> hoặc <kbd>Space</kbd> hoặc nút <strong>Dùng gậy dò đường thăm dò & tiến bước</strong> để dò độ sâu trước mỗi bước chân.</p>
      <div style="background:#091619;border:1px solid var(--line);border-radius:6px;padding:14px;margin:15px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span id="mudflow-hazard-status" style="color:var(--gold)">🦯 GẬY DÒ ĐƯỜNG: ĐANG THĂM DÒ NỀN ĐÁ</span>
          <span id="mudflow-balance-status" class="good">GỜ ĐÁ: VỮNG CHẮC</span>
        </div>
        <div class="mudflow-lane" id="mudflow-track">
          <!-- Safe stone ridge Left (10% to 35%) -->
          <div class="stone-ridge" style="left:10%;width:25%" title="Gờ đá vững chắc"></div>
          <!-- Dangerous mud sink Center (38% to 62%) -->
          <div class="mud-sink" style="left:38%;width:24%" title="Vũng bùn lún sâu nguy hiểm"></div>
          <!-- Safe stone ridge Right (65% to 90%) -->
          <div class="stone-ridge" style="left:65%;width:25%" title="Gờ đá vững chắc"></div>
          <!-- Character marker with probe stick -->
          <div id="mudflow-marker" class="probe-marker" style="left:20%">
            🚶‍♂️🦯
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#8aa098;margin-top:4px">
          <span style="color:#52c41a">★ GỜ ĐÁ TRÁI (AN TOÀN) ★</span>
          <span style="color:#e76f51">⚠️ VŨNG BÙN LÚN (NGẬP GỐI) ⚠️</span>
          <span style="color:#52c41a">★ GỜ ĐÁ PHẢI (AN TOÀN) ★</span>
        </div>
      </div>
      <p class="good" id="mudflow-progress-text">Tiến độ vượt suối bùn: 0% · Dùng A/D chọn gờ đá và giữ W/Space dùng gậy dò đường</p>
      <div class="buttons" style="display:flex;gap:8px">
        <button id="mudflow-left" style="flex:1">← Bước sang Gờ đá trái (A)</button>
        <button id="mudflow-step" class="primary" style="flex:2">Dùng gậy dò đường & Tiến bước (Space / W) 🦯</button>
        <button id="mudflow-right" style="flex:1">Bước sang Gờ đá phải (D) →</button>
      </div>
    `;

    $('modal').hidden = false;
    $('close-mudflow').onclick = () => {
      $('modal').hidden = true;
      if (mudflowTimer) cancelAnimationFrame(mudflowTimer);
    };

    const bStep = $('mudflow-step');
    bStep.onpointerdown = e => { e.preventDefault(); active = true; bStep.setPointerCapture(e.pointerId); };
    bStep.onpointerup = bStep.onpointercancel = bStep.onlostpointercapture = () => active = false;

    const btnLeft = $('mudflow-left');
    const btnRight = $('mudflow-right');
    let touchLeft = false, touchRight = false;
    if (btnLeft) {
      btnLeft.onpointerdown = e => { e.preventDefault(); touchLeft = true; btnLeft.setPointerCapture(e.pointerId); };
      btnLeft.onpointerup = btnLeft.onpointercancel = btnLeft.onlostpointercapture = () => touchLeft = false;
    }
    if (btnRight) {
      btnRight.onpointerdown = e => { e.preventDefault(); touchRight = true; btnRight.setPointerCapture(e.pointerId); };
      btnRight.onpointerup = btnRight.onpointercancel = btnRight.onlostpointercapture = () => touchRight = false;
    }

    let previous = performance.now();
    const frame = now => {
      const elapsed = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      if ($('modal').hidden) return;

      time += elapsed;

      let steer = 0;
      if (held.has('a') || held.has('A') || held.has('ArrowLeft') || touchLeft) steer -= 35;
      if (held.has('d') || held.has('D') || held.has('ArrowRight') || touchRight) steer += 35;

      lanePos += steer * elapsed;
      lanePos = Math.max(12, Math.min(88, lanePos));

      const marker = $('mudflow-marker');
      if (marker) marker.style.left = lanePos + '%';

      // Check if in mud sink (between 37% and 63%)
      const inMudSink = lanePos >= 37 && lanePos <= 63;
      const hazardStatus = $('mudflow-hazard-status');
      const balanceStatus = $('mudflow-balance-status');

      if (inMudSink) {
        if (hazardStatus) {
          hazardStatus.textContent = '⚠️ VŨNG BÙN LÚN: SÂU 70CM QUA GỐI!';
          hazardStatus.style.color = '#ff4d4f';
        }
        if (balanceStatus) {
          balanceStatus.textContent = 'LÚN BÙN! BẤM A / D SANG GỜ ĐÁ';
          balanceStatus.className = 'bad';
          balanceStatus.style.color = '#ff7875';
        }
      } else {
        if (hazardStatus) {
          hazardStatus.textContent = '🦯 GẬY DÒ ĐƯỜNG: NƯỚC 15CM DƯỚI GỐI';
          hazardStatus.style.color = 'var(--gold)';
        }
        if (balanceStatus) {
          balanceStatus.textContent = 'GỜ ĐÁ KIÊN CỐ: BƯỚC ĐI VỮNG CHẮC';
          balanceStatus.className = 'good';
          balanceStatus.style.color = '#73d13d';
        }
      }

      const isStepping = active || held.has(' ') || held.has('w') || held.has('W') || held.has('ArrowUp');
      if (isStepping) {
        if (inMudSink) {
          triggerScreenShake(200);
          mudflowProgress += elapsed * 0.02;
        } else {
          mudflowProgress += (elapsed / 2.8);
        }
      }

      const progressEl = $('mudflow-progress-text');
      if (progressEl) {
        progressEl.textContent = `Tiến độ vượt suối bùn: ${Math.min(100, Math.floor(mudflowProgress * 100))}% · ${inMudSink ? 'Cảnh báo: Vũng bùn lún sâu! Rút chân lên gờ đá' : 'Gậy dò đường xác nhận gờ đá an toàn'}`;
      }

      if (mudflowProgress >= 1) {
        held.clear();
        if (!s.solved.includes('mudflow_bend')) {
          s.solved.push('mudflow_bend');
          save();
        }
        if (audio) audio.play('unlock');
        $('modal').hidden = true;
        render();
        speak([
          ['Mạnh', 'Hoan hô các cháu! Cầm gậy dò đường bước trên gờ đá kiên cố là chuẩn chỉ khoa học an toàn!'],
          ['Thảo', 'Cả nhóm đã vượt qua khúc cua suối bùn an toàn, phía trước là hẻm đá!']
        ], done);
        return;
      }

      mudflowTimer = requestAnimationFrame(frame);
    };
    mudflowTimer = requestAnimationFrame(frame);
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

  async function performDebriefEvaluation(playerAnswer) {
    const DEBRIEF_QUESTION = 'Khi phát hiện vết nứt sườn đồi hình cánh cung và rặng tre nghiêng về phía taluy âm, dấu hiệu này báo trước thảm họa gì và đoàn sơ tán phải làm gì ngay?';
    const cleanAnswer = String(playerAnswer || '').trim();
    let result = null;

    try {
      const res = await fetch('/api/debrief/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: 3,
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
      const dangerous = /(?:trèo qua|leo qua|vượt qua|ở lại|đi sát)\s+(?:tảng đá|khối đá|vết nứt|mép nứt)/i.test(lower);
      const negated = /(?:không|chớ|đừng|tuyệt đối không|tránh|hạn chế)\s+.*(?:trèo qua|leo qua|ở lại|đi sát)/i.test(lower);
      if (cleanAnswer.length < 5) {
        result = {
          passed: false,
          feedback: 'Câu trả lời quá ngắn. Con cần nêu rõ dấu hiệu sạt trượt đất taluy nguy hiểm và hành động báo động sơ tán khẩn cấp.'
        };
      } else if (dangerous && !negated) {
        result = {
          passed: false,
          feedback: 'Chưa đạt! Leo trèo qua tảng đá trơn trượt hoặc đi sát mép nứt cực kỳ nguy hiểm. Đoàn phải giữ khoảng cách và sơ tán ngay!'
        };
      } else {
        result = {
          passed: true,
          feedback: 'Xuất sắc! Vết nứt cánh cung và rặng tre nghiêng báo trước thảm họa sạt trượt taluy cấp bách do đất ngậm no nước. Đoàn sơ tán phải phát còi báo động khẩn cấp, tuyệt đối tránh xa mép nứt và di chuyển men theo sống đá gốc kiên cố.'
        };
      }
    }
    return result;
  }

  function showCompletionModal() {
    const DEBRIEF_QUESTION = 'Khi phát hiện vết nứt sườn đồi hình cánh cung và rặng tre nghiêng về phía taluy âm, dấu hiệu này báo trước thảm họa gì và đoàn sơ tán phải làm gì ngay?';
    const panel = $('panel');
    panel.innerHTML = `
      <div class="panel-top">
        <small style="color:var(--gold);letter-spacing:1px">KHẢO HẠCH AI · TRƯỞNG LÀNG MINH ANH</small>
      </div>
      <h2>Khảo Hạch Vượt Chương 03</h2>
      <p style="font-size:15px;color:#fff7df;margin:10px 0;line-height:1.7"><strong>“${DEBRIEF_QUESTION}”</strong></p>
      <p style="font-size:13px;color:#c1cdbf">Nhập phân tích trinh sát địa hình của bạn để Trưởng làng Minh Anh và hội đồng AI sát hạch cấp chứng nhận vượt Chương 03:</p>
      <div style="margin:12px 0">
        <textarea id="ch3-debrief-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập câu trả lời phân tích (VD: Vết nứt hình cánh cung và rặng tre nghiêng báo hiệu sạt trượt taluy cấp bách; đoàn phải phát lệnh báo động khẩn cấp và sơ tán theo gờ sống đá gốc kiên cố)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" id="prompt-debrief-1" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý đạt chuẩn: "Vết nứt hình cánh cung và rặng tre nghiêng về phía taluy âm là dấu hiệu báo trước thảm họa sạt lở taluy quy mô lớn do đất đã ngậm no nước. Đoàn sơ tán phải lập tức phát còi báo động khẩn cấp, tuyệt đối không di chuyển men mép nứt mà phải sơ tán lên cao hoặc men theo sống đá gốc kiên cố ra khỏi cung trượt."</button>
        <button class="option" id="prompt-debrief-2" style="margin-bottom:8px;text-align:left;width:100%">Gợi ý ngắn: "Báo trước thảm họa sạt trượt đất taluy; đoàn phải phát còi báo động khẩn cấp và sơ tán theo đường vòng sống đá kiên cố."</button>
      </div>
      <p id="ch3-debrief-status" role="status" style="color:var(--gold)"></p>
      <div id="ch3-debrief-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="ch3-debrief-submit" class="primary">Nộp bài khảo hạch AI</button>
        <a id="ch3-unlock-ch4" href="chapter04.html" class="primary" hidden style="background:#389e0d;border-color:#52c41a;color:#fff;display:inline-block;padding:11px 17px;border-radius:4px">Tiến vào Chương 04: Chia Cắt & Cứu Bạn Học →</a>
      </div>
    `;
    $('modal').hidden = false;

    $('prompt-debrief-1').onclick = () => {
      $('ch3-debrief-input').value = 'Vết nứt hình cánh cung và rặng tre nghiêng về phía taluy âm là dấu hiệu báo trước thảm họa sạt lở taluy quy mô lớn do đất đã ngậm no nước. Đoàn sơ tán phải lập tức phát còi báo động khẩn cấp, tuyệt đối không di chuyển men mép nứt mà phải sơ tán lên cao hoặc men theo sống đá gốc kiên cố ra khỏi cung trượt.';
    };
    $('prompt-debrief-2').onclick = () => {
      $('ch3-debrief-input').value = 'Báo trước thảm họa sạt trượt đất taluy; đoàn phải phát còi báo động khẩn cấp và sơ tán theo đường vòng sống đá kiên cố.';
    };

    const runDebrief = async (chosenAnswer) => {
      const input = chosenAnswer || ($('ch3-debrief-input')?.value || '').trim() ||
        'Vết nứt hình cánh cung và rặng tre nghiêng là dấu hiệu sạt lở taluy cấp bách; đoàn phải phát còi báo động và sơ tán theo sống đá kiên cố.';
      $('ch3-debrief-status').textContent = 'Trưởng làng Minh Anh đang thẩm định bài khảo hạch...';
      const submitBtn = $('ch3-debrief-submit');
      if (submitBtn) submitBtn.disabled = true;

      const result = await performDebriefEvaluation(input);
      const resultBox = $('ch3-debrief-result');

      if (result.passed) {
        if (audio) audio.play('unlock');
        $('ch3-debrief-status').textContent = '✓ KHẢO HẠCH ĐẠT YÊU CẦU!';
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div class="badge-pass">
            <b>🏅 PASS CHƯƠNG 03: ĐỘI VIÊN TRINH SÁT ĐỊA HÌNH</b>
            <p style="margin:6px 0;line-height:1.7;color:#eee9db">${result.feedback}</p>
          </div>
        `;
        s.complete = true;
        s.passedBadge = 'PASS CHƯƠNG 03: ĐỘI VIÊN TRINH SÁT ĐỊA HÌNH';
        save();
        render();

        if (submitBtn) submitBtn.hidden = true;
        const unlockBtn = $('ch3-unlock-ch4');
        if (unlockBtn) unlockBtn.hidden = false;
      } else {
        $('ch3-debrief-status').textContent = '✗ BÀI LÀM CHƯA ĐẠT';
        if (submitBtn) submitBtn.disabled = false;
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div style="border-left:3px solid #ff4d4f;background:#2a1414;padding:12px 16px;margin:10px 0;border-radius:4px">
            <b style="color:#ff7875;font-size:14px">Nhận xét của Trưởng làng Minh Anh:</b>
            <p style="margin:6px 0;color:#eee9db">${result.feedback}</p>
          </div>
        `;
      }
    };

    $('ch3-debrief-submit').onclick = () => runDebrief();
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
      triggerScreenShake(650);
      save();
      render();
      speak(sceneIntros.ridge_entry);
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
        3. Dùng cành cây hoặc gậy dò đường thăm dò độ sâu trước khi lội qua vùng nước bùn tràn.</p>
      `;
      $('modal').hidden = false;
      $('close-journal').onclick = () => { $('modal').hidden = true; };
    };

    // Keyboard navigation & WASD tracking
    window.addEventListener('keydown', (e) => {
      held.add(e.key);
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

    window.addEventListener('keyup', (e) => {
      held.delete(e.key);
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
