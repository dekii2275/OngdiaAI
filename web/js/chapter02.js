(() => {
  'use strict';
  const D = window.Chapter02, $ = id => document.getElementById(id), KEY = 'ongdia.chapter02.v2';
  let saved = null;
  try { saved = D.restore(JSON.parse(localStorage.getItem(KEY))); } catch {}
  const previousOrigin = window.StoryJourney.readOrigin();
  let moveDirty = false, lastMoveSave = 0;
  let s = D.initial(), queue = [], afterDialogue = null, target = null, modalReturn = null, toastUntil = 0, last = 0, tick = 0;
  const held = new Set(), audio = new window.SceneAudio(), reduced = () => s.settings.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const portraits = { 'Bạn': 'ban', 'Duyên': 'duyen', 'Thảo': 'thao', 'Mạnh': 'manh', 'Minh Anh': 'minh-anh' };
  
  const intros = {
    gate: [
      ['Duyên', 'Cô ơi… mưa còn lớn hơn lúc nãy.'],
      ['Thảo', 'Hai em đi sát cô. Điểm tập kết ở trên đồi, nhưng phải chọn đường tới đó an toàn.'],
      ['Mạnh', '[Bộ đàm] Đường phía đông có nước tràn. Không đi hướng đó nữa.'],
      ['Minh Anh', '[Bộ đàm] Các nhóm từ trường tìm tuyến khác. Không ai tự ý đi qua vùng nước chảy.']
    ],
    junction: [
      ['Duyên', 'Có ba đường… Cầu treo gần nhất chỉ 200m thôi cô ơi! Hay mình qua đó cho nhanh?'],
      ['Thảo', 'Không chọn chỉ vì gần. Trước hết, xem từng tuyến và ghép những gì mình quan sát được.'],
      ['Duyên', 'Nhưng Cầu treo 200m đi nhanh nhất để về làng với mẹ mà! Em muốn qua cầu treo!']
    ],
    hill: [
      ['Duyên', 'Đường này không ngập, lại đi lên cao. Có khi tốt đấy.'],
      ['Thảo', 'Quan sát từ khoảng cách an toàn. Đừng tới sát sườn đất.']
    ],
    suspension: [
      ['Duyên', 'Kìa! Nhìn thấy mái điểm tập kết rồi. Cầu vẫn đứng, mặt cầu còn khô.'],
      ['Thảo', 'Đừng chỉ nhìn mặt cầu. Hãy nhìn dòng nước và khu vực xung quanh.'],
      ['Mạnh', '[Bộ đàm nhiễu] …cô Thảo… tôi đang kiểm tra… cầu…']
    ],
    north: [
      ['Duyên', '650 mét… mình có kịp không?'],
      ['Thảo', 'Xa hơn không có nghĩa là chậm hơn, nếu đó là đường chúng ta thực sự đi được.']
    ],
    concrete: [
      ['Thảo', 'Dừng ở bờ gần. Kiểm tra mặt cầu, mực nước và dòng chảy quanh trụ trước khi quyết định.']
    ],
    highroad: [
      ['Duyên', 'Cuối cùng đường xa nhất lại là đường mình đi.'],
      ['Mạnh', 'Không phải vì nó xa. Vì hiện tại nó có điều kiện ổn định hơn và đã được kiểm tra.'],
      ['Minh Anh', '[Bộ đàm] Từ đó theo đường cao thêm khoảng ba trăm mét. Điểm tập kết ngay phía trước.']
    ],
    refuge: [
      ['Duyên', 'Mưa nhỏ hơn rồi… mình sắp tới nơi phải không?'],
      ['Thảo', 'Ừ. Cả nhóm vẫn ở cùng nhau. Trước khi liên lạc, hãy nhớ những dấu hiệu đã giúp mình chọn đường.']
    ]
  };

  function gateDialogue() {
    if (!s.origin) return intros.gate.slice();
    const memory = s.origin.hasBear
      ? [['Duyên', 'Gấu vẫn ở đây… Tớ sẽ giữ nó, nhưng không tách khỏi nhóm nữa.'], ['Bạn', 'Ừ. Mình đi cùng cô.']]
      : [['Duyên', 'Gấu vẫn ở trong tủ…'], ['Thảo', 'Cô nhớ. Khi an toàn, mình sẽ tính chuyện đồ đạc. Bây giờ cô cần cả hai em ở cạnh cô.']];
    return [...memory, ...intros.gate];
  }

  function sceneDialogue(id) {
    const lines = (intros[id] || []).slice();
    if (id === 'junction' && s.origin?.choices.RouteUnderstood) {
      lines.unshift(['Bạn', 'Sơ đồ trong lớp chỉ đường qua phía đông. Nhưng đường đó đã bị nước tràn; mình phải đối chiếu điều kiện hiện tại.']);
    }
    return lines;
  }

  function save() {
    try {
      s.savedAt = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(s));
      saved = JSON.parse(JSON.stringify(s));
      $('save').textContent = 'ĐÃ LƯU HÀNH TRÌNH';
    } catch {
      $('save').textContent = 'KHÔNG THỂ LƯU · VẪN CHƠI ĐƯỢC';
    }
  }

  function toast(text) {
    $('location-toast').textContent = text;
    $('location-toast').classList.add('visible');
    toastUntil = performance.now() + 4200;
  }

  const free = () => s.started && $('dialogue').hidden && $('modal').hidden && !s.complete;

  function objective() {
    if (s.complete) return 'Cả nhóm đã lên đường cao. Chương 02 hoàn thành.';
    if (!s.solved.includes(s.scene) && window.Chapter02Puzzles.puzzles[s.scene]) {
      return 'Giải câu đố khu vực: ' + window.Chapter02Puzzles.puzzles[s.scene].title + '. Quan sát manh mối trước khi mở đường.';
    }
    if (s.crossed) return 'Theo đường cao lên điểm tập kết. Liên lạc với Minh Anh.';
    if (s.scene === 'concrete') return 'Kiểm tra đủ ba điểm ở bờ gần. Qua cầu khi bác Mạnh xác nhận và các tuyến đã được đánh giá.';
    if (s.scene === 'hill' || s.scene === 'suspension') return 'Quan sát các dấu hiệu, đánh giá tuyến rồi trở lại ngã ba.';
    if (s.scene === 'north') return 'Quan sát đường dự phòng và hỏi bác Mạnh về tình trạng hiện tại.';
    return 'Quan sát cả ba tuyến. Tìm đường lên điểm tập kết cùng cô Thảo và Duyên.';
  }

  function render() {
    const scene = D.scenes[s.scene];
    s.position.x = clampX(s.position.x);
    $('spots').hidden = !s.started;
    $('scene-name').textContent = scene.name;
    $('landscape').style.backgroundImage = `url('assets/chapter02/${scene.art}.png')`;
    $('landscape').style.backgroundPosition = scene.position || 'center';
    $('objective').textContent = objective();
    $('progress').textContent = `${s.solved.length}/8 câu đố · ${s.clues.filter(id => id !== 'highroad-marker').length}/13 dấu hiệu`;
    $('spots').replaceChildren();

    const sceneSpots = scene.spots.slice();
    if (s.scene === 'junction') {
      sceneSpots.push({
        id: 'debate-duyen',
        label: s.duyenDebated ? '✓ Đã thuyết phục Duyên' : '💬 Tranh luận với Duyên',
        sub: s.duyenDebated ? 'Đã đồng ý không đi Cầu treo 200m' : 'Duyên đòi đi Cầu treo 200m',
        x: 58,
        y: 64,
        type: 'debate'
      });
    }
    if (s.scene === 'concrete' || s.scene === 'north') {
      sceneSpots.push({
        id: 'report-manh',
        label: s.manhReported ? '✓ Đã báo cáo Bác Mạnh' : '💬 Báo cáo thực địa Bác Mạnh',
        sub: s.manhReported ? 'Đã ghi nhận nghiệp vụ' : 'Báo cáo taluy rỉ nước, đá dăm rơi',
        x: s.scene === 'concrete' ? 48 : 50,
        y: s.scene === 'concrete' ? 70 : 66,
        type: 'report'
      });
    }

    for (const p of sceneSpots) {
      const button = document.createElement('button'), isArrow = p.type === 'exit' || p.type === 'cross';
      button.className = 'spot ' + (isArrow ? 'route-arrow ' : '') + (s.clues.includes(p.id) || s.solved.includes(p.puzzle) ? 'seen' : '');
      button.style.left = p.x + '%';
      button.style.top = p.y + '%';
      button.dataset.spot = p.id;
      if (isArrow) {
        const destination = D.scenes[p.to].name, puzzle = D.travelPuzzle(s.scene, p.to);
        button.setAttribute('aria-label', 'Đi tới ' + destination);
        button.setAttribute('aria-describedby', 'tip-' + p.id);
        const icon = document.createElement('span');
        icon.className = 'arrow-icon';
        icon.textContent = p.x < 30 || p.id.startsWith('back-') ? '←' : p.y < 65 ? '↑' : '→';
        icon.setAttribute('aria-hidden', 'true');
        const tip = document.createElement('span');
        tip.id = 'tip-' + p.id;
        tip.className = 'arrow-tip';
        tip.setAttribute('role', 'tooltip');
        const name = document.createElement('strong');
        name.textContent = destination;
        tip.append(name);
        const note = document.createElement('small');
        note.textContent = puzzle && !s.solved.includes(puzzle)
          ? 'Giải câu đố để mở đường'
          : p.type === 'cross' && !D.canCross(s)
          ? 'Kiểm tra cầu và sắp đội hình'
          : p.sub || 'Bấm để đi tới';
        tip.append(note);
        button.append(icon, tip);
        button.dataset.edge = p.x < 25 ? 'left' : p.x > 75 ? 'right' : 'middle';
        button.dataset.locked = String(!D.canTravel(s, p.to));
      } else {
        button.append(document.createTextNode(p.label));
        if (p.sub) {
          const sub = document.createElement('small');
          sub.textContent = p.sub;
          button.append(sub);
        }
      }
      button.onclick = event => {
        if (isArrow && event.pointerType === 'touch' && !button.classList.contains('armed')) {
          document.querySelectorAll('.route-arrow.armed').forEach(v => v.classList.remove('armed'));
          button.classList.add('armed');
          return;
        }
        walkToSpot(p);
      };
      $('spots').append(button);
    }

    $('party').style.left = s.position.x + '%';
    $('party').style.top = s.position.y + '%';
    $('party').hidden = !s.started;
    document.querySelector('#party .girl').src = s.origin?.hasBear ? 'assets/characters/duyen/bear.png' : 'assets/characters/duyen/idle.png';
    $('manh-world').hidden = !s.started || !['north', 'concrete', 'highroad', 'refuge'].includes(s.scene);
    $('scene-caption').hidden = !s.started;
    $('mission').hidden = !s.started;
    $('sound').textContent = 'Âm thanh: ' + (s.settings.sound ? 'bật' : 'tắt');
    const voiceBtn = $('voice-toggle');
    if (voiceBtn) {
      voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS?.isEnabled?.() ? 'bật' : 'tắt');
    }
  }

  function speak(lines, done) {
    held.clear();
    target = null;
    queue = lines.slice();
    afterDialogue = done || null;
    $('dialogue').hidden = false;
    advance();
  }

  function advance() {
    if (!queue.length) {
      $('dialogue').hidden = true;
      const done = afterDialogue;
      afterDialogue = null;
      done?.();
      return;
    }
    const [who, text] = queue.shift();
    $('speaker').textContent = who.toUpperCase() + (text.startsWith('[Bộ đàm') ? ' · BỘ ĐÀM' : '');
    $('line').textContent = text;
    $('portrait').src = `assets/characters/${portraits[who] || 'thao'}/portrait.png`;
    if (text.startsWith('[Bộ đàm')) audio.play('radio');
    if (window.VoiceTTS?.isEnabled?.()) {
      window.VoiceTTS.speak(who, text);
    }
  }

  function enter(to) {
    if (!D.canTravel(s, to)) {
      toast('Cần kiểm tra đủ các tuyến và có bác Mạnh dẫn đường.');
      return;
    }
    const first = !s.visited.includes(to);
    s.scene = to;
    s.position = { ...(D.scenes[to].spawn || { x: 48, y: 88 }) };
    if (first) s.visited.push(to);
    toastUntil = 0;
    held.clear();
    target = null;
    render();
    save();
    if (!reduced()) {
      for (const id of ['landscape', 'party']) {
        $(id).animate([{ opacity: .25 }, { opacity: 1 }], { duration: 400, easing: 'ease-out' });
      }
    }
    if (first) speak(sceneDialogue(to));
    else toast(D.scenes[to].name);
  }

  function start(resume) {
    s = resume ? D.restore(saved) : window.StoryJourney.attach(D.initial(), previousOrigin);
    s.started = true;
    if (!s.visited.includes(s.scene)) s.visited.push(s.scene);
    s.settings.reduced ||= matchMedia('(prefers-reduced-motion: reduce)').matches;
    $('intro').hidden = true;
    render();
    save();
    audio.setEnabled(s.settings.sound);
    audio.start();
    if (s.complete) showResults();
    else if (!resume) speak(gateDialogue());
    else toast('Tiếp tục tại ' + D.scenes[s.scene].name);
  }

  const clampX = x => {
    const margin = Math.max(12, Math.min(25, 9500 / $('stage').clientWidth));
    const zone = D.scenes[s.scene].walk || { min: margin, max: 100 - margin };
    return Math.max(Math.max(margin, zone.min), Math.min(Math.min(100 - margin, zone.max), x));
  };

  function walkToSpot(p) {
    if (!free()) return;
    target = { x: clampX(p.x), y: Math.max(78, Math.min(89, p.y)), action: () => interact(p) };
  }

  function interact(p) {
    audio.play('click');
    if (p.type === 'debate') { showDuyenDebateModal(); return; }
    if (p.type === 'report') { showManhReportModal(); return; }
    if (p.type === 'puzzle') { openPuzzle(p.puzzle); return; }
    if (p.type === 'exit') {
      const puzzle = D.travelPuzzle(s.scene, p.to);
      if (puzzle && !s.solved.includes(puzzle)) {
        openPuzzle(puzzle, () => interact(p));
        return;
      }
      if (p.to === 'concrete' && !s.manh) {
        speak([['Thảo', 'Mình hỏi bác Mạnh trước. Đừng tự đi tới cầu khi chưa có thông tin hiện tại.']]);
        return;
      }
      if (s.scene === 'highroad' && p.to === 'concrete') {
        speak([['Mạnh', 'Tôi dẫn cả nhóm trở lại bờ gần. Đi đều và không dừng trên cầu.']], () => enter('concrete'));
        return;
      }
      enter(p.to);
      return;
    }
    if (p.type === 'clue') {
      if (!s.clues.includes(p.id)) {
        s.clues.push(p.id);
        render();
        save();
      }
      speak([[p.speaker, p.text]]);
      return;
    }
    if (p.type === 'decision') {
      judge(p.route);
      return;
    }
    if (p.type === 'npc') {
      s.manh = true;
      save();
      speak([
        ['Mạnh', 'Tôi vừa kiểm tra cầu phía Bắc và đường sau cầu. Hiện đường vẫn thông, chưa có nước tràn hay dấu hiệu hư hỏng rõ.'],
        ['Thảo', 'Hai em vẫn quan sát ở đầu cầu. Mình chỉ qua sau khi kiểm tra đủ và thống nhất tuyến.'],
        ['Mạnh', 'Tôi sẽ dẫn cả nhóm. Điều kiện có thể thay đổi, nên mình đi đều và nghe hướng dẫn mới nhất.']
      ]);
      return;
    }
    if (p.type === 'cross') {
      if (!s.solved.includes('concrete')) {
        openPuzzle('concrete', () => interact(p));
        return;
      }
      if (!D.canCross(s)) {
        const missing = Object.entries(D.required).filter(([, ids]) => ids.some(id => !s.clues.includes(id))).map(([r]) => D.scenes[r].name);
        speak([['Thảo', 'Chưa vội qua. ' + (missing.length ? 'Còn dấu hiệu chưa quan sát ở: ' + missing.join('; ') + '.' : 'Hãy đánh giá hai tuyến A, B và trao đổi với bác Mạnh trước.')]]);
        return;
      }
      speak([['Mạnh', 'Tôi đi đầu, sau đó cô Thảo, hai em đi sát nhau. Đi đều, không chạy và không đứng lại trên cầu.']], () => crossing());
      return;
    }
    if (p.type === 'finale') {
      reflection(0);
    }
  }

  function panel(title, html, closable = true) {
    modalReturn = document.activeElement;
    held.clear();
    target = null;
    $('panel').innerHTML = `<div class="panel-top"><small>CHƯƠNG 02 · BA CON ĐƯỜNG</small>${closable ? '<button id="close-panel" aria-label="Đóng bảng">Đóng ×</button>' : ''}</div><h2>${title}</h2>${html}`;
    $('modal').hidden = false;
    $('close-panel')?.addEventListener('click', closePanel);
    $('panel').focus();
  }

  function closePanel() {
    if (s.complete) {
      $('modal').hidden = true;
      return;
    }
    $('modal').hidden = true;
    modalReturn?.focus();
  }

  function openPuzzle(id, done) {
    const puzzle = window.Chapter02Puzzles.puzzles[id];
    if (!puzzle) return;
    if (s.solved.includes(id)) {
      if (done) done();
      else toast('Câu đố đã giải. Đường đi tiếp đã được mở.');
      return;
    }
    const missing = (puzzle.requires || []).filter(clue => !s.clues.includes(clue));
    if (missing.length || (puzzle.guide && !s.manh)) {
      const names = missing.map(clue => Object.values(D.scenes).flatMap(scene => scene.spots).find(p => p.id === clue)?.label || clue);
      panel(puzzle.title, '<p>Quan sát trước khi suy luận.</p><div class="entry">' + names.map(name => '<p>◇ ' + name + '</p>').join('') + (puzzle.guide && !s.manh ? '<p>◇ Trao đổi với bác Mạnh</p>' : '') + '</div><p>Đóng bảng để tiếp tục khám phá. Manh mối đã tìm được sẽ được giữ.</p>');
      return;
    }
    let chosen = [];
    const content = puzzle.kind === 'sequence'
      ? '<p class="puzzle-instruction">Chọn các thẻ theo thứ tự đúng. Cần ' + puzzle.answer.length + ' thẻ.</p><ol id="puzzle-slots" class="puzzle-slots"></ol><div class="puzzle-cards">' + puzzle.options.map(([key, label]) => '<button data-card="' + key + '">' + label + '</button>').join('') + '</div>'
      : puzzle.rows.map(([key, label]) => '<label class="match-row"><span>' + label + '</span><select data-match="' + key + '"><option value="">Chọn lời giải…</option>' + puzzle.options.map(([value, text]) => '<option value="' + value + '">' + text + '</option>').join('') + '</select></label>').join('');
    panel(puzzle.title, '<small>CÂU ĐỐ KHU VỰC · ' + D.scenes[id].name + '</small><p>' + puzzle.intro + '</p>' + content + '<p id="puzzle-feedback" role="status"></p><div class="buttons"><button id="puzzle-submit" class="primary">Xác nhận lời giải</button><button id="puzzle-reset">Làm lại</button><button id="puzzle-hint">Gợi ý</button></div>');
    const refresh = () => {
      if (puzzle.kind !== 'sequence') return;
      $('puzzle-slots').replaceChildren();
      for (let i = 0; i < puzzle.answer.length; i++) {
        const item = document.createElement('li');
        item.textContent = puzzle.options.find(([key]) => key === chosen[i])?.[1] || 'Chưa chọn';
        $('puzzle-slots').append(item);
      }
      document.querySelectorAll('[data-card]').forEach(button => {
        button.disabled = chosen.includes(button.dataset.card) || chosen.length >= puzzle.answer.length;
      });
    };
    refresh();
    document.querySelectorAll('[data-card]').forEach(button => button.onclick = () => {
      chosen.push(button.dataset.card);
      $('puzzle-feedback').textContent = '';
      refresh();
    });
    document.querySelectorAll('[data-match]').forEach(select => select.onchange = () => {
      $('puzzle-feedback').textContent = '';
      select.title = select.selectedOptions[0].textContent;
    });
    $('puzzle-reset').onclick = () => {
      chosen = [];
      document.querySelectorAll('[data-match]').forEach(select => select.value = '');
      $('puzzle-feedback').textContent = '';
      refresh();
    };
    $('puzzle-hint').onclick = () => $('puzzle-feedback').textContent = puzzle.hint;
    $('puzzle-submit').onclick = () => {
      const answer = puzzle.kind === 'sequence'
        ? chosen
        : Object.fromEntries([...document.querySelectorAll('[data-match]')].map(select => [select.dataset.match, select.value]));
      if (!window.Chapter02Puzzles.correct(id, answer)) {
        $('puzzle-feedback').textContent = 'Chưa khớp với các chỉ dẫn. Hãy đối chiếu lại hoặc xem gợi ý; không mất tiến trình.';
        audio.play('wrong');
        return;
      }
      s.solved.push(id);
      save();
      audio.play('unlock');
      render();
      panel('Đường đi đã được mở', '<small class="good">CÂU ĐỐ HOÀN THÀNH</small><p>' + puzzle.title + '</p><button id="puzzle-done" class="primary">' + (done ? 'Tiếp tục hành trình →' : 'Trở lại khu vực') + '</button>');
      $('puzzle-done').onclick = () => {
        closePanel();
        done?.();
      };
    };
  }

  function judge(route) {
    const ids = D.required[route];
    if (!ids.every(c => s.clues.includes(c))) {
      speak([['Thảo', 'Chưa đủ thông tin. Hãy quan sát tất cả dấu hiệu được đánh dấu ở khu vực này trước khi quyết định.']]);
      return;
    }
    const isHill = route === 'hill';
    panel('Đường này có nên đi tiếp?', `<p>${isHill ? 'Đường lên cao và chưa ngập, nhưng đất đang cho thấy nhiều dấu hiệu bất thường.' : 'Điểm tập kết ở ngay bên kia. Mặt cầu khô, nhưng dòng nước đang tác động vào kết cấu.'}</p><div class="buttons"><button id="safe-choice" class="primary">${isHill ? 'Lùi khỏi sườn dốc' : 'Không qua cầu'} · Quay lại</button><button id="risk-choice">${isHill ? 'Tiếp tục đường đồi' : 'Qua cầu cho nhanh'}</button></div>`);
    $('safe-choice').onclick = () => reason(route);
    $('risk-choice').onclick = () => {
      closePanel();
      audio.play('thunder');
      speak(isHill ? [
        ['Thảo', 'Dừng lại. Mình không tiến vào sườn dốc đã có nhiều dấu hiệu bất ổn.'],
        ['Duyên', 'Cô! Có đất đá vừa rơi ở phía trước…'],
        ['Thảo', 'Cả nhóm đang ở ngoài chân dốc. Lùi về khu rộng rồi quay lại ngã ba.']
      ] : [
        ['Thảo', 'Không lên cầu. Dòng nước và cây trôi đang tác động vào phần bên dưới.'],
        ['Duyên', 'Một khúc cây nữa… cầu vừa rung mạnh!'],
        ['Thảo', 'Mình quan sát được từ bờ. Đừng đánh cược bằng việc bước lên cầu.']
      ], () => reason(route));
    };
  }

  function reason(route) {
    const isHill = route === 'hill';
    panel('Điều gì quyết định lựa chọn?', `<p>${isHill ? 'Vì sao nên tránh đường chân đồi?' : 'Vì sao mặt cầu khô vẫn chưa đủ để đi qua?'}</p><button class="option" data-answer="0">${isHill ? 'Vì đường này không có cầu.' : 'Vì mọi cây cầu treo đều nguy hiểm.'}</button><button class="option" data-answer="1">${isHill ? 'Vì cây nghiêng, đất nứt, nước rỉ và đá rơi xuất hiện cùng nhau.' : 'Vì nước xiết, vật trôi và mực nước cao đang tác động vào cầu.'}</button><button class="option" data-answer="2">${isHill ? 'Vì đi lên cao luôn nguy hiểm.' : 'Vì đường này ngắn nhất.'}</button><p id="feedback" role="status"></p>`);
    document.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {
      if (b.dataset.answer !== '1') {
        $('feedback').textContent = 'Hãy ghép các dấu hiệu về điều kiện hiện tại, thay vì kết luận chỉ từ địa hình hoặc loại cầu.';
        return;
      }
      if (!s.judged.includes(route)) s.judged.push(route);
      if (!s.solved.includes(route)) s.solved.push(route);
      save();
      closePanel();
      render();
      speak(isHill ? [
        ['Thảo', 'Đúng. Tìm nơi cao vẫn cần chọn một đường tới đó an toàn. Nhiều dấu hiệu cùng xuất hiện thì không nên mạo hiểm.']
      ] : [
        ['Mạnh', '[Bộ đàm] Không qua cầu treo. Nước thượng nguồn đang lên, nhiều cây trôi xuống.'],
        ['Bạn', 'Mình đã thấy dấu hiệu trước khi bác Mạnh báo. Gần không có nghĩa là an toàn.']
      ], () => enter('junction'));
    });
  }

  // Tình huống LLM 1: Tranh luận an toàn với Duyên tại ngã ba
  function showDuyenDebateModal() {
    panel(
      'Tranh luận an toàn với Duyên',
      `<small class="good">TÌNH HUỐNG HIỆN TRƯỜNG · NGÃ BA</small>
      <p>Duyên đang nôn nóng đòi đi <strong>Cầu treo 200m</strong> vì gần nhất. Em hãy dùng lời nói/lý lẽ an toàn giải thích cho Duyên hiểu vì sao không thể đi cầu treo (nước xoáy ngập mố cầu, dây cáp võng nguy hiểm) và vì sao cả nhóm phải chọn đường vòng phía Bắc kiên cố.</p>
      <div style="margin:12px 0">
        <textarea id="duyen-debate-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập lý lẽ an toàn thuyết phục Duyên (VD: Cầu treo 200m nước xoáy ngập mố cầu, dây cáp võng rung lắc nguy hiểm, mình phải đi đường Bắc kiên cố)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" data-duyen-prompt="Cầu treo 200m nước xoáy ngập mố cầu, dây cáp võng rung lắc dữ dội rất nguy hiểm, không thể đi được Duyên ơi! Ta phải đi đường vòng phía Bắc kiên cố!">Gợi ý: Cầu treo nước xoáy ngập mố cầu, cáp võng nguy hiểm</button>
        <button class="option" data-duyen-prompt="Gần nhất chưa chắc đã an toàn! Tính mạng là quan trọng nhất, mình đi đường vòng phía Bắc 650m kiên cố cùng cô Thảo!">Gợi ý: Tính mạng là trên hết, đi đường Bắc cùng cô</button>
      </div>
      <p id="duyen-debate-status" role="status" style="color:var(--gold)"></p>
      <div id="duyen-debate-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="duyen-debate-submit" class="primary">Gửi lời giải thích cho Duyên</button>
        <button id="duyen-debate-close">Đóng lại</button>
      </div>`
    );

    document.querySelectorAll('[data-duyen-prompt]').forEach(btn => {
      btn.onclick = () => {
        $('duyen-debate-input').value = btn.dataset.duyenPrompt;
      };
    });

    $('duyen-debate-close').onclick = closePanel;

    $('duyen-debate-submit').onclick = async () => {
      const input = ($('duyen-debate-input')?.value || '').trim() ||
        'Cầu treo 200m nước xoáy ngập mố cầu, dây cáp võng rung lắc nguy hiểm lắm Duyên ơi! Tính mạng là trên hết, mình phải đi đường vòng phía Bắc kiên cố!';
      $('duyen-debate-status').textContent = 'Đang truyền đạt lý lẽ an toàn tới Duyên...';
      $('duyen-debate-submit').disabled = true;

      let reply = null;
      try {
        const res = await fetch('/api/radio/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'duyen',
            playerName: 'Bạn',
            message: input,
            chapter: 2,
            scene: 'junction'
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply_text;
        }
      } catch (_) {}

      if (!reply) {
        reply = 'Cậu nói đúng, nước xoáy mạnh ngập cả mố cầu treo và dây cáp võng thế kia thì nguy hiểm quá. Mình không đi đường tắt 200m nữa, mình sẽ đi đường vòng phía Bắc cùng cậu và cô Thảo!';
      }

      s.duyenDebated = true;
      save();
      audio.play('unlock');
      $('duyen-debate-status').textContent = '✓ Duyên đã thấu hiểu!';
      const resultBox = $('duyen-debate-result');
      resultBox.hidden = false;
      resultBox.innerHTML = `
        <div class="entry good" style="border-left:3px solid #52c41a;background:#142920;padding:10px 14px;margin:8px 0">
          <small style="color:#52c41a">BẠN DUYÊN LẮNG NGHE & ĐỒNG Ý</small>
          <p style="margin:4px 0">“${reply}”</p>
        </div>
        <p style="color:#b3d4b7;font-size:12px">Duyên đã thấu hiểu nguyên tắc: <strong>Gần không có nghĩa là an toàn</strong>, đồng thuận không đi Cầu treo 200m.</p>
      `;
      $('duyen-debate-submit').hidden = true;
      $('duyen-debate-close').textContent = 'Tiếp tục hành trình →';
      $('duyen-debate-close').className = 'primary';
      toast('Duyên đã thấu hiểu và đồng ý không đi cầu treo!');
    };
  }

  // Tình huống LLM 2: Báo cáo thực địa với Bác Mạnh tại Cầu Bắc
  function showManhReportModal(done) {
    panel(
      'Báo cáo thực địa với Bác Mạnh',
      `<small class="good">BÁO CÁO THỰC ĐỊA & PHƯƠNG ÁN QUA CẦU BẮC</small>
      <p>Bác Mạnh đang đợi báo cáo hiện trường từ nhóm khảo sát. Hãy báo cáo các dấu hiệu nguy hiểm đã quan sát (<strong>nước rỉ taluy, đá dăm rơi</strong> ở tuyến đồi A, nước xiết ở cầu treo B) để Bác Mạnh chốt phương án đội hình vượt Cầu Bắc.</p>
      <div style="margin:12px 0">
        <textarea id="manh-report-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập báo cáo thực địa (VD: Báo cáo bác Mạnh, tuyến A có nước rỉ taluy và đá dăm rơi sườn đồi, đoàn đề xuất đi Cầu Bắc bê tông)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" data-manh-prompt="Báo cáo bác Mạnh: Tuyến đồi A xuất hiện nước rỉ taluy và đá dăm rơi sườn dốc, sườn đất ngậm nước rất dễ sạt lở. Cầu treo B nước xiết ngập mố. Nhóm xin đi Cầu Bắc bê tông kiên cố!">Gợi ý: Báo cáo nước rỉ taluy, đá dăm rơi và đề xuất Cầu Bắc</button>
        <button class="option" data-manh-prompt="Bác Mạnh ơi, chúng cháu đã kiểm tra đủ 3 điểm đầu Cầu Bắc: mặt cầu nguyên vẹn, nước chưa chạm dầm, trụ không bị va đập!">Gợi ý: Báo cáo 3 điểm kiểm tra Cầu Bắc kiên cố</button>
      </div>
      <p id="manh-report-status" role="status" style="color:var(--gold)"></p>
      <div id="manh-report-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="manh-report-submit" class="primary">Gửi báo cáo cho Bác Mạnh</button>
        <button id="manh-report-close">Đóng lại</button>
      </div>`
    );

    document.querySelectorAll('[data-manh-prompt]').forEach(btn => {
      btn.onclick = () => {
        $('manh-report-input').value = btn.dataset.manhPrompt;
      };
    });

    $('manh-report-close').onclick = closePanel;

    $('manh-report-submit').onclick = async () => {
      const input = ($('manh-report-input')?.value || '').trim() ||
        'Báo cáo bác Mạnh: Quan sát thấy nước rỉ taluy và đá dăm rơi ở tuyến A, nhóm đề xuất vượt Cầu Bắc bê tông kiên cố.';
      $('manh-report-status').textContent = 'Đang truyền tin bộ đàm đến Bác Mạnh...';
      $('manh-report-submit').disabled = true;

      let reply = null;
      try {
        const res = await fetch('/api/radio/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: 'manh',
            playerName: 'Bạn',
            message: input,
            chapter: 2,
            scene: s.scene
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.reply_text;
        }
      } catch (_) {}

      if (!reply) {
        reply = 'Bác Mạnh nghe rõ! Tình hình nước rỉ taluy và đá dăm rơi là dấu hiệu sườn đất ngậm nước rất nguy hiểm! Báo cáo thực địa của các cháu rất chuẩn nghiệp vụ. Bác đã kiểm tra Cầu Bắc bê tông kiên cố, chuẩn bị đội hình qua cầu theo hiệu lệnh của bác!';
      }

      s.manh = true;
      s.manhReported = true;
      save();
      audio.play('unlock');
      $('manh-report-status').textContent = '✓ Bác Mạnh đã ghi nhận nghiệp vụ!';
      const resultBox = $('manh-report-result');
      resultBox.hidden = false;
      resultBox.innerHTML = `
        <div class="entry good" style="border-left:3px solid #52c41a;background:#142920;padding:10px 14px;margin:8px 0">
          <small style="color:#52c41a">BÁC MẠNH PHẢN HỒI QUA BỘ ĐÀM</small>
          <p style="margin:4px 0">“${reply}”</p>
        </div>
        <p style="color:#b3d4b7;font-size:12px">Bác Mạnh đã ghi nhận nghiệp vụ quan sát thực địa và hướng dẫn đội hình vượt Cầu Bắc an toàn.</p>
      `;
      $('manh-report-submit').hidden = true;
      $('manh-report-close').textContent = 'Nhận chỉ đạo đội hình →';
      $('manh-report-close').className = 'primary';
      $('manh-report-close').onclick = () => {
        closePanel();
        speak([
          ['Mạnh', 'Tôi đi đầu dẫn đường, cô Thảo bọc lót phía sau, hai em đi ở giữa. Nhớ giữ vững tim cầu trong gió giật!'],
          ['Thảo', 'Cả nhóm nghe rõ lời bác Mạnh. Chuẩn bị bước vào Cầu Bắc!']
        ], done);
      };
    };
  }

  // Mini-sequence WASD Cầu Bắc trong gió giật
  let crossingProgress = 0;
  function crossing() {
    crossingProgress = 0;
    let active = false;
    let lanePos = 50; // centerline at 50%
    let gustOffset = 0;
    let gustTimer = 0;
    let gustDirection = 1;
    let time = 0;

    panel(
      'Vượt Cầu Bắc trong gió giật',
      `<p>Gió bão giật mạnh trên mặt Cầu Bắc! Sử dụng <kbd>A</kbd> / <kbd>D</kbd> (hoặc mũi tên ← / →) để giữ thăng bằng <strong>tim cầu</strong> (centerline), chống lại lực <strong>gió giật</strong> tạt lệch hướng. Giữ <kbd>Space</kbd> hoặc nút bên dưới để tiến bước theo đội hình bác Mạnh.</p>
      <div style="background:#091619;border:1px solid var(--line);border-radius:6px;padding:14px;margin:15px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
          <span id="bridge-wind-status" style="color:var(--gold)">💨 GIÓ GIẬT: BÌNH THƯỜNG</span>
          <span id="bridge-balance-status" class="good">TIM CẦU: CÂN BẰNG</span>
        </div>
        <div style="position:relative;height:50px;background:linear-gradient(180deg,#1c3338 0%,#132427 100%);border:2px solid #5a7673;border-radius:4px;overflow:hidden">
          <!-- Safe centerline zone -->
          <div style="position:absolute;left:35%;width:30%;height:100%;background:rgba(82,196,26,0.15);border-left:1px dashed rgba(82,196,26,0.4);border-right:1px dashed rgba(82,196,26,0.4);pointer-events:none"></div>
          <!-- Centerline -->
          <div style="position:absolute;left:50%;width:2px;height:100%;background:var(--gold);transform:translateX(-50%);box-shadow:0 0 6px var(--gold);pointer-events:none"></div>
          <!-- Party marker -->
          <div id="bridge-party-marker" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:22px;transition:left 0.05s linear;pointer-events:none">
            🏃‍♂️🏃‍♀️🚶‍♂️
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#8aa098;margin-top:4px">
          <span>← Mạn trái (Sông lũ)</span>
          <span style="color:var(--gold)">★ TIM CẦU AN TOÀN ★</span>
          <span>Mạn phải (Vách suối) →</span>
        </div>
      </div>
      <p class="good" id="cross-progress">Tiến độ vượt cầu: 0% · Giữ A/D ghì tim cầu và giữ Space</p>
      <div class="buttons" style="display:flex;gap:8px">
        <button id="gust-left" style="flex:1">← Ghì Trái (A)</button>
        <button id="hold-cross" class="primary" style="flex:2">Giữ để đi cùng nhau (Space) →</button>
        <button id="gust-right" style="flex:1">Ghì Phải (D) →</button>
      </div>`,
      false
    );

    const b = $('hold-cross');
    b.onpointerdown = e => { e.preventDefault(); active = true; b.setPointerCapture(e.pointerId); };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => active = false;

    const btnLeft = $('gust-left');
    const btnRight = $('gust-right');
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
      gustTimer += elapsed;
      if (gustTimer > 2.0) {
        gustTimer = 0;
        gustDirection = Math.random() > 0.5 ? 1 : -1;
      }
      gustOffset = Math.sin(time * 3) * 16 * gustDirection;

      // WASD / keyboard / touch input to counteract gust and hold centerline
      let steer = 0;
      if (held.has('a') || held.has('ArrowLeft') || touchLeft) steer -= 38;
      if (held.has('d') || held.has('ArrowRight') || touchRight) steer += 38;

      lanePos += (steer + gustOffset * 1.5) * elapsed;
      lanePos = Math.max(12, Math.min(88, lanePos));

      const marker = $('bridge-party-marker');
      if (marker) marker.style.left = lanePos + '%';

      const distFromCenter = Math.abs(lanePos - 50);
      const windStatus = $('bridge-wind-status');
      const balStatus = $('bridge-balance-status');

      if (windStatus) {
        windStatus.textContent = Math.abs(gustOffset) > 8
          ? `💨 GIÓ GIẬT MẠNH: TẠT ${gustOffset > 0 ? 'MẠN PHẢI' : 'MẠN TRÁI'}!`
          : '💨 GIÓ GIẬT: VỪA PHẢI';
        windStatus.style.color = Math.abs(gustOffset) > 8 ? '#f0ad4e' : 'var(--gold)';
      }

      if (balStatus) {
        if (distFromCenter < 15) {
          balStatus.textContent = 'TIM CẦU: VỮNG CHẮC';
          balStatus.className = 'good';
        } else {
          balStatus.textContent = '⚠️ LỆCH TIM CẦU! NHẤN A/D ĐỂ GHÌ LẠI';
          balStatus.className = 'bad';
          balStatus.style.color = '#ff7875';
        }
      }

      // Crossing advances with space/button or steady pace if near centerline
      const isStepping = active || held.has(' ') || held.has('w') || held.has('ArrowUp');
      const speedMultiplier = distFromCenter < 15 ? 1.0 : 0.6;
      if (isStepping) {
        crossingProgress += (elapsed / 3.0) * speedMultiplier;
      } else {
        crossingProgress += (elapsed / 16.0) * speedMultiplier;
      }

      $('cross-progress').textContent = `Cả nhóm đang qua Cầu Bắc · ${Math.min(100, Math.floor(crossingProgress * 100))}% · ${distFromCenter < 15 ? 'Bám sát tim cầu' : 'Gió tạt mạnh'}`;

      if (crossingProgress >= 1) {
        held.clear();
        closePanel();
        s.crossed = true;
        save();
        speak([
          ['Mạnh', 'Rất tốt! Cả đoàn đã giữ vững tim cầu trong gió giật lớn và qua bờ an toàn!'],
          ['Thảo', 'Tất cả học sinh đều nguyên vẹn. Bám sát đường cao tiếp tục di tản!']
        ], () => enter('highroad'));
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  function routeGraph() {
    const nodes = { gate: [55, 235, 'Cổng trường'], junction: [200, 235, 'Ngã ba'], hill: [200, 70, 'A · Đường đồi'], suspension: [390, 70, 'B · Cầu treo'], north: [390, 235, 'C · Đường Bắc'], concrete: [565, 235, 'Cầu Bắc'], highroad: [660, 145, 'Đường cao'], refuge: [660, 45, 'Tập kết'] };
    const edges = [['gate', 'junction'], ['junction', 'hill'], ['junction', 'suspension'], ['junction', 'north'], ['north', 'concrete'], ['concrete', 'highroad'], ['highroad', 'refuge']];
    const paths = edges.map(([a, b]) => { const A = nodes[a], B = nodes[b]; return '<path d="M ' + A[0] + ' ' + A[1] + ' L ' + B[0] + ' ' + B[1] + '" class="' + (s.visited.includes(a) && s.visited.includes(b) ? 'explored' : '') + '"/>'; }).join('');
    const dots = Object.entries(nodes).map(([id, n]) => '<g class="' + (s.scene === id ? 'current' : s.visited.includes(id) ? 'visited' : '') + '"><circle cx="' + n[0] + '" cy="' + n[1] + '" r="9"/><text x="' + n[0] + '" y="' + (n[1] + 29) + '" text-anchor="middle">' + n[2] + '</text></g>').join('');
    return '<div class="diagram-scroll"><svg class="route-diagram" viewBox="0 0 740 285" role="img" aria-label="Bản đồ tám khu vực nối hai chiều, vị trí hiện tại được tô vàng">' + paths + dots + '</svg></div>';
  }

  function showMap() {
    panel('Ba đường. Một hành trình.', `<p>Khám phá ba tuyến từ ngã ba. Có thể quay lại giữa các khu vực đã nối; dấu hiệu quan sát luôn được giữ.</p>${routeGraph()}<div class="connection">Cổng trường ↔ Ngã ba ↔ A / B / C</div><div class="connection">Đường Bắc ↔ Cầu Bắc ↔ Đường cao ↔ Điểm tập kết</div><div class="route-grid">${['hill', 'suspension', 'north'].map((r, i) => `<div class="route-card"><b>${'ABC'[i]}</b><h3>${D.scenes[r].name.slice(4)}</h3><small>${[450, 200, 650][i]} m tới điểm tập kết</small><p>${s.judged.includes(r) ? 'Đã đánh giá: tránh tuyến này.' : s.visited.includes(r) ? 'Đã tới · ' + D.required[r].filter(c => s.clues.includes(c)).length + '/' + D.required[r].length + ' dấu hiệu.' : 'Chưa khảo sát.'}</p></div>`).join('')}</div><h3>Bạn đang ở: ${D.scenes[s.scene].name}</h3><div class="map-end">${D.scenes[s.scene].links.map(to => `<button data-go="${to}" >${D.scenes[to].name} →</button>`).join('')}</div><p><small>Chọn mũi tên để đi tới. Nếu đường chưa mở, câu đố của khu vực sẽ xuất hiện. Đường quay lại luôn thông.</small></p>`);
    document.querySelectorAll('[data-go]').forEach(b => b.onclick = () => {
      closePanel();
      const p = D.scenes[s.scene].spots.find(p => p.to === b.dataset.go);
      if (p) walkToSpot(p);
      else if (b.dataset.go === 'highroad') interact({ type: 'cross' });
    });
  }

  function showJournal() {
    panel('Những điều đã quan sát', `<p>Khoảng cách giúp định hướng. Điều kiện hiện tại mới quyết định tuyến đi.</p><div class="entry"><small>CHƯƠNG 01 · NHỮNG GÌ NHÓM MANG THEO</small><p>${window.StoryJourney.summary(s.origin)}</p>${s.origin?.choices.RouteUnderstood ? '<p>Đã đọc sơ đồ trong lớp. Tuyến cũ phía đông đã bị đóng; nhóm đang kiểm tra đường mới.</p>' : ''}</div><div class="entry"><small>CÂU ĐỐ ĐÃ GIẢI · ${s.solved.length}/8</small><p>${s.solved.map(id => D.scenes[id].name).join('<br>') || 'Chưa giải câu đố nào.'}</p></div>${Object.entries(D.required).map(([r, ids]) => `<div class="entry"><small>${D.scenes[r].name}</small>${ids.map(id => { const p = D.scenes[r].spots.find(p => p.id === id); return s.clues.includes(id) ? `<p>✓ <strong>${p.label}</strong><br>${p.text}</p>` : '<p>◇ Chưa quan sát dấu hiệu này.</p>'; }).join('')}</div>`).join('')}`);
  }

  function settings() {
    panel(
      'Nhịp chơi của bạn',
      `<p>WASD / mũi tên: di chuyển trong vùng quan sát. E: tương tác gần. Bấm dấu hiệu để đi tới và quan sát. Enter: đọc tiếp. M: bản đồ. J: sổ tay. Esc: đóng bảng.</p>
      <div class="buttons">
        <button id="reduce">Giảm chuyển động: ${reduced() ? 'bật' : 'tắt'}</button>
        <button id="toggle-voice">Giọng đọc AI: ${window.VoiceTTS?.isEnabled?.() ? 'bật' : 'tắt'}</button>
        <button id="restart">Chơi lại chương</button>
      </div>
      <p>Tiến trình được lưu riêng cho Chương 02 trên trình duyệt này.</p>`
    );
    $('reduce').onclick = () => { s.settings.reduced = !s.settings.reduced; save(); settings(); };
    $('toggle-voice').onclick = () => {
      if (window.VoiceTTS) {
        window.VoiceTTS.toggle();
        const voiceBtn = $('voice-toggle');
        if (voiceBtn) voiceBtn.textContent = 'Giọng đọc: ' + (window.VoiceTTS.isEnabled() ? 'bật' : 'tắt');
      }
      settings();
    };
    $('restart').onclick = () => {
      panel('Bắt đầu hành trình mới?', '<p>Tiến trình Chương 02 trên trình duyệt này sẽ được thay thế.</p><button id="confirm-restart" class="primary">Chơi lại từ cổng trường</button>');
      $('confirm-restart').onclick = () => { closePanel(); start(false); };
    };
  }

  // Khảo hạch AI Bác Mạnh & Cô Thảo
  const reflections = [
    ['Đường chân đồi', ['Vì quá xa.', 'Vì có nhiều dấu hiệu đất không ổn định (nước rỉ taluy, đá dăm rơi, cây nghiêng).', 'Vì không có cầu.'], 1],
    ['Cầu treo', ['Vì cầu cũ.', 'Vì dòng nước xiết, cây trôi và mực nước cao đang tác động nguy hiểm vào mố cầu.', 'Vì đường này gần nhất.'], 1]
  ];

  async function performDebriefEvaluation(playerAnswer) {
    const DEBRIEF_QUESTION = 'Tại ngã ba, vì sao cả đoàn lại chọn đi đường vòng phía Bắc 650m thay vì đường 450m hay 200m?';
    const cleanAnswer = String(playerAnswer || '').trim();
    let result = null;

    try {
      const res = await fetch('/api/debrief/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter: 2,
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
      const dangerous = /(?:chọn|đi)\s+(?:cầu\s+treo|đường\s+tắt|đường\s+200m|ngắn\s+nhất)/i.test(lower);
      const negated = /(?:không|chớ|đừng|tuyệt đối không|tránh|hạn chế)\s+.*(?:đi cầu treo|chọn cầu treo|đi đường tắt)/i.test(lower);
      if (cleanAnswer.length < 5) {
        result = {
          passed: false,
          feedback: 'Câu trả lời quá ngắn hoặc chưa nêu rõ phân tích điều kiện hiện trường. Con cần giải thích rõ vì sao chọn đường vòng phía Bắc kiên cố.'
        };
      } else if (dangerous && !negated) {
        result = {
          passed: false,
          feedback: 'Chưa đạt! Cầu treo 200m có mố cầu yếu, dòng nước xoáy xiết và dây cáp võng rất nguy hiểm. Cả đoàn không thể mạo hiểm đi đường tắt!'
        };
      } else {
        result = {
          passed: true,
          feedback: 'Xuất sắc! Bạn đã phân tích thấu đáo: Đường 450m có nguy cơ sạt lở taluy đá rơi, cầu treo 200m nước xoáy ngập mố cáp võng; đường vòng phía Bắc 650m tuy xa hơn nhưng có cầu bê tông vững chãi, đã được bác Mạnh kiểm tra và bảo đảm an toàn tính mạng cả đoàn.'
        };
      }
    }
    return result;
  }

  function reflection(i) {
    if (i < reflections.length) {
      const [name, answers, right] = reflections[i];
      panel(
        'Cô Thảo hỏi: “Em nhớ vì sao?”',
        `<small>${i + 1} / 3 · ${name}</small>
        ${answers.map((t, n) => `<button class="option" data-reflect="${n}">${t}</button>`).join('')}
        <p id="feedback" role="status"></p>`
      );
      document.querySelectorAll('[data-reflect]').forEach(b => {
        b.onclick = () => {
          if (Number(b.dataset.reflect) !== right) {
            $('feedback').textContent = 'Nhớ lại điều nhóm đã quan sát hôm nay. Loại cầu hay khoảng cách không đủ để kết luận.';
            return;
          }
          closePanel();
          reflection(i + 1);
        };
      });
      return;
    }

    // Khảo hạch AI kết thúc chương: Hội đồng Bác Mạnh & Cô Thảo
    showOralDebriefModal();
  }

  function showOralDebriefModal() {
    const questionText = 'Tại ngã ba, vì sao cả đoàn lại chọn đi đường vòng phía Bắc 650m thay vì đường 450m hay 200m?';
    panel(
      'Khảo hạch AI: Bác Mạnh & Cô Thảo',
      `<small class="good">SÁT HẠCH ĐIỀU HƯỚNG · CHƯƠNG 02</small>
      <p style="font-size:16px;color:#fff7df;margin:10px 0;line-height:1.7"><strong>“${questionText}”</strong></p>
      <p style="font-size:13px;color:#c1cdbf">Nhập phân tích an toàn cứu nạn của bạn để hội đồng AI thẩm định cấp chứng nhận vượt Chương 02:</p>
      <div style="margin:12px 0">
        <textarea id="ch2-debrief-input" rows="3" style="width:100%;padding:10px;background:#0d1e22;border:1px solid var(--line);color:#eee9db;border-radius:4px" placeholder="Nhập câu trả lời phân tích (VD: Cầu treo 200m nước xoáy ngập mố cáp võng nguy hiểm; đường 450m sạt lở taluy đá rơi; đường Bắc 650m kiên cố có cầu bê tông đã kiểm tra an toàn tính mạng)..."></textarea>
      </div>
      <div class="buttons" style="margin:8px 0;display:block">
        <button class="option" data-reflect="1" style="margin-bottom:8px">Vì đường phía Bắc 650m tuy xa hơn nhưng có cầu bê tông kiên cố đã được bác Mạnh kiểm tra an toàn, bảo vệ tính mạng cả đoàn khỏi sạt lở và lũ cuốn.</button>
        <button class="option" data-reflect="0" style="margin-bottom:8px">Vì đường này có phong cảnh đẹp hơn.</button>
        <button class="option" data-reflect="2" style="margin-bottom:8px">Vì đi đường nào cũng như nhau, chỉ cần chạy thật nhanh.</button>
      </div>
      <p id="ch2-debrief-status" role="status" style="color:var(--gold)"></p>
      <div id="ch2-debrief-result" hidden style="margin:12px 0"></div>
      <div class="buttons">
        <button id="ch2-debrief-submit" class="primary">Nộp bài khảo hạch AI</button>
        <a id="ch2-unlock-ch3" href="chapter03.html" class="primary" hidden style="background:#389e0d;border-color:#52c41a;color:#fff;display:inline-block;padding:11px 17px;border-radius:4px">Tiếp tục hành trình · Chương 03 →</a>
      </div>`,
      false
    );

    const runDebrief = async (chosenAnswer) => {
      const input = chosenAnswer || ($('ch2-debrief-input')?.value || '').trim() ||
        'Tại ngã ba, đường 450m sạt lở taluy đá rơi nguy hiểm, cầu treo 200m nước xoáy ngập mố cáp võng; cả đoàn chọn đường vòng phía Bắc 650m vì có cầu bê tông kiên cố đã được bác Mạnh kiểm tra, ưu tiên tính mạng an toàn là trên hết.';
      $('ch2-debrief-status').textContent = 'Hội đồng Bác Mạnh & Cô Thảo đang chấm bài...';
      const submitBtn = $('ch2-debrief-submit');
      if (submitBtn) submitBtn.disabled = true;

      const result = await performDebriefEvaluation(input);
      const resultBox = $('ch2-debrief-result');

      if (result.passed) {
        audio.play('unlock');
        $('ch2-debrief-status').textContent = '✓ KHẢO HẠCH ĐẠT YÊU CẦU!';
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div class="entry good" style="border-left:3px solid #52c41a;background:#142920;padding:12px 16px;margin:10px 0">
            <b style="color:#52c41a;font-size:15px">🏅 PASS CHƯƠNG 02: NHÀ ĐIỀU HƯỚNG TÀI BA</b>
            <p style="margin:6px 0">${result.feedback}</p>
          </div>
        `;
        s.complete = true;
        s.passedBadge = 'PASS CHƯƠNG 02: NHÀ ĐIỀU HƯỚNG TÀI BA';
        if (!s.solved.includes('refuge')) s.solved.push('refuge');
        save();
        render();

        if (submitBtn) submitBtn.hidden = true;
        const unlockBtn = $('ch2-unlock-ch3');
        if (unlockBtn) unlockBtn.hidden = false;

        setTimeout(() => {
          closePanel();
          speak([
            ['Thảo', 'Không chỉ nhìn khoảng cách. Nhớ quan sát nước, địa hình, tình trạng cầu đường và hướng dẫn mới nhất.'],
            ['Duyên', 'Tiếng gì vậy cô?'],
            ['Mạnh', '… Có tiếng đất đá lớn ở phía dưới làng.'],
            ['Minh Anh', '[Bộ đàm] Mạnh! Có chuyện ở phía dưới làng!']
          ], () => {
            showResults();
          });
        }, 1200);
      } else {
        audio.play('wrong');
        $('ch2-debrief-status').textContent = 'Chưa đạt yêu cầu khảo hạch';
        resultBox.hidden = false;
        resultBox.innerHTML = `
          <div class="entry" style="border-left:3px solid #ff4d4f;background:#2a1818;padding:12px 16px;margin:10px 0">
            <b style="color:#ff7875">CHƯA ĐẠT</b>
            <p style="margin:6px 0">${result.feedback}</p>
          </div>
        `;
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    $('ch2-debrief-submit').onclick = () => runDebrief();

    document.querySelectorAll('[data-reflect]').forEach(b => {
      b.onclick = () => {
        if (b.dataset.reflect !== '1') {
          $('ch2-debrief-status').textContent = 'Chưa đúng trọng tâm an toàn. Hãy phân tích điều kiện thực tế của 3 con đường.';
          return;
        }
        runDebrief(b.textContent);
      };
    });
  }

  function showResults() {
    panel(
      'Ba con đường',
      `<small class="good">CHƯƠNG 02 HOÀN THÀNH</small>
      <div style="background:#132d22;border:1px solid #52c41a;border-radius:4px;padding:12px 16px;margin:12px 0">
        <span style="color:#52c41a;font-weight:700;font-size:14px">🏅 PASS CHƯƠNG 02: NHÀ ĐIỀU HƯỚNG TÀI BA</span>
        <p style="margin:4px 0 0;font-size:12px">Bạn đã đánh giá chính xác 3 con đường và đưa cả đoàn vượt Cầu Bắc kiên cố an toàn.</p>
      </div>
      <p>Cả nhóm đã qua cầu phía Bắc và lên đường cao. Một tiếng động từ dưới làng mở ra câu chuyện tiếp theo.</p>
      <div class="route-grid">
        <div class="route-card"><b>13 / 13</b><p>Dấu hiệu đã quan sát</p></div>
        <div class="route-card"><b>3</b><p>Tuyến đường đã cân nhắc</p></div>
        <div class="route-card"><b>Cùng nhau</b><p>Không ai bị bỏ lại</p></div>
      </div>
      <p>✧ Quan sát địa hình<br>✧ Gần không có nghĩa là an toàn<br>✧ Hành trình có người dẫn đường</p>
      <div class="buttons">
        <a href="chapter03.html" class="primary" style="background:#389e0d;border-color:#52c41a;color:#fff">Tiếp tục hành trình · Chương 03 →</a>
        <button id="review">Xem lại sổ tay</button>
        <button id="replay" class="primary">Chơi lại chương 02</button>
        <a href="index.html">Về chương 01 →</a>
      </div>`,
      false
    );
    $('review').onclick = showJournal;
    $('replay').onclick = () => { closePanel(); start(false); };
  }

  const unlockAudio = () => { if (s.started) audio.start(); };
  document.addEventListener('pointerdown', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });

  $('start').onclick = () => {
    if (saved) {
      panel(
        'Bắt đầu một hành trình mới?',
        '<p>Lần chơi mới thay thế tiến trình Chương 02 đã lưu.</p><div class="buttons"><button id="fresh" class="primary">Bắt đầu mới</button><button id="keep">Tiếp tục đã lưu</button></div>'
      );
      $('fresh').onclick = () => { closePanel(); start(false); };
      $('keep').onclick = () => { closePanel(); start(true); };
    } else start(false);
  };
  $('resume').hidden = !saved;
  $('resume').onclick = () => start(true);
  $('next').onclick = advance;

  $('sound').onclick = () => {
    s.settings.sound = !s.settings.sound;
    audio.setEnabled(s.settings.sound);
    audio.start();
    render();
    if (s.started) save();
  };

  const voiceBtn = $('voice-toggle');
  if (voiceBtn) {
    voiceBtn.onclick = () => {
      if (window.VoiceTTS) {
        const on = window.VoiceTTS.toggle();
        voiceBtn.textContent = 'Giọng đọc: ' + (on ? 'bật' : 'tắt');
        voiceBtn.style.borderColor = on ? 'var(--gold)' : '';
        toast(on ? 'Đã bật giọng đọc AI.' : 'Đã tắt giọng đọc AI.');
      }
    };
  }

  $('map').onclick = () => { if (s.started && $('dialogue').hidden) showMap(); };
  $('journal').onclick = () => { if (s.started && $('dialogue').hidden) showJournal(); };
  $('settings').onclick = settings;

  function near() {
    return D.scenes[s.scene].spots.reduce((best, p) => {
      const d = Math.abs(p.x - s.position.x) + Math.abs(Math.max(78, p.y) - s.position.y);
      return d < 14 && (!best || d < best.d) ? { p, d } : best;
    }, null)?.p;
  }

  $('interact').onclick = () => {
    if (free()) {
      const p = near();
      if (p) interact(p);
      else toast('Bấm một dấu hiệu để đi tới và quan sát.');
    }
  };

  $('stage').onclick = e => {
    if (!free() || e.target.closest('button')) return;
    const rect = $('stage').getBoundingClientRect();
    const y = (e.clientY - rect.top) / rect.height * 100;
    if (y >= 74) target = { x: clampX((e.clientX - rect.left) / rect.width * 100), y: Math.max(76, Math.min(91, y)) };
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && !$('modal').hidden) {
      const elements = [...$('panel').querySelectorAll('button:not(:disabled),a[href],select,textarea')];
      const first = elements[0], end = elements.at(-1);
      if (e.shiftKey && (document.activeElement === first || document.activeElement === $('panel'))) {
        e.preventDefault();
        end?.focus();
      } else if (!e.shiftKey && (document.activeElement === end || document.activeElement === $('panel'))) {
        e.preventDefault();
        first?.focus();
      }
      return;
    }
    if ((e.target.matches('select') || e.target.matches('textarea') || e.target.matches('input')) && !$('modal').hidden && e.key !== 'Escape') return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k)) e.preventDefault();
    if (k === 'Escape') {
      if (!$('modal').hidden && $('hold-cross')) return;
      if (!$('modal').hidden) closePanel();
      else settings();
      return;
    }
    if ((k === 'Enter' || k === ' ') && !$('dialogue').hidden) {
      if (!e.repeat) advance();
      return;
    }
    if (!$('modal').hidden) {
      if ($('hold-cross') && k === ' ') held.add(' ');
      if (['a', 'd', 'ArrowLeft', 'ArrowRight'].includes(k)) held.add(k);
      return;
    }
    if (!free()) return;
    if (['w', 'a', 's', 'd', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(k)) {
      held.add(k);
      target = null;
    }
    if (e.repeat) return;
    if (k === 'e') $('interact').click();
    if (k === 'm') showMap();
    if (k === 'j') showJournal();
  });

  document.addEventListener('keyup', e => held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  window.addEventListener('blur', () => { held.clear(); target = null; if (s.started) save(); });
  window.addEventListener('pagehide', () => { if (s.started) save(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      held.clear();
      audio.ctx?.suspend();
    } else if (s.started) audio.start();
  });

  document.querySelectorAll('[data-key]').forEach(b => {
    b.onpointerdown = e => {
      e.preventDefault();
      if (free()) {
        target = null;
        held.add(b.dataset.key);
        b.setPointerCapture(e.pointerId);
      }
    };
    b.onpointerup = b.onpointercancel = b.onlostpointercapture = () => {
      held.delete(b.dataset.key);
      save();
    };
  });

  const canvas = $('rain'), ctx = canvas.getContext('2d');
  let drops = [];
  function resize() {
    canvas.width = $('stage').clientWidth;
    canvas.height = $('stage').clientHeight;
    drops = Array.from({ length: 90 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, v: 450 + Math.random() * 250 }));
  }
  new ResizeObserver(resize).observe($('stage'));
  resize();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, .04);
    last = now;
    tick += dt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!reduced()) {
      ctx.strokeStyle = '#d7e9e230';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v * dt;
        d.x -= d.v * .2 * dt;
        if (d.y > canvas.height) {
          d.y = -30;
          d.x = Math.random() * canvas.width;
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 5, d.y + 20);
      }
      ctx.stroke();
    }
    let moving = false;
    if (free()) {
      let dx = 0, dy = 0;
      if (target) {
        const x = target.x - s.position.x, y = target.y - s.position.y, dist = Math.hypot(x, y);
        if (dist < .5) {
          const action = target.action;
          target = null;
          action?.();
        } else {
          dx = x / dist;
          dy = y / dist;
        }
      } else {
        dx = Number(held.has('d') || held.has('ArrowRight')) - Number(held.has('a') || held.has('ArrowLeft'));
        dy = Number(held.has('s') || held.has('ArrowDown')) - Number(held.has('w') || held.has('ArrowUp'));
        const n = Math.hypot(dx, dy);
        if (n > 1) {
          dx /= n;
          dy /= n;
        }
      }
      if (dx || dy) {
        moving = true;
        s.position.x = clampX(s.position.x + dx * 22 * dt);
        s.position.y = Math.max(76, Math.min(91, s.position.y + dy * 13 * dt));
        $('party').style.left = s.position.x + '%';
        $('party').style.top = s.position.y + '%';
      }
    }
    $('party').classList.toggle('walking', moving && !reduced());
    const pose = moving && !reduced() ? (Math.floor(tick * 7) % 2 ? 'walk-1' : 'walk-2') : 'idle';
    if ($('player').dataset.pose !== pose) {
      $('player').src = `assets/characters/ban/${pose}.png`;
      $('player').dataset.pose = pose;
    }
    if (moving) moveDirty = true;
    if (moveDirty && (!moving || now - lastMoveSave > 1500)) {
      save();
      moveDirty = false;
      lastMoveSave = now;
    }
    if (now > toastUntil) $('location-toast').classList.remove('visible');
    requestAnimationFrame(frame);
  }

  const summary = previousOrigin ? window.StoryJourney.summary(previousOrigin) : null;
  if (summary) {
    $('journey-summary').textContent = 'Từ Chương 01: ' + summary;
    $('journey-summary').hidden = false;
  }
  render();
  requestAnimationFrame(frame);
  const entry = new URLSearchParams(location.search);
  if (entry.get('from') === 'chapter01' && previousOrigin) start(window.StoryJourney.sameJourney(saved, previousOrigin));
  else if (entry.get('continue') === '1' && saved) start(true);
})();
