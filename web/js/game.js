(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const Model = window.SceneModel, Story = window.SceneStory, Navigation = window.SceneNavigation;
  const SAVE_KEY = 'ongdia.scene1.v1';
  let state = Model.fresh(), saved = null, active = false, modal = null, routeHighlight = -1;
  let toastTimer, target = null, moveDirty = false, lastTime = 0, elapsedCarry = 0;
  let hoveredSpot = null, facing = 1, walkTime = 0, cameraX = 50, playerWalking = false;
  let npcLocation = 'exterior';
  const npcPositions = { duyen: { x: 66, y: 77 }, thao: { x: 86, y: 72 } };
  const held = new Set(), assets = {};
  const Characters = window.SceneCharacters;
  const sound = new window.SceneAudio();
  const roles = { 'Bạn': 'HỌC SINH LỚP 4B', 'Duyên': 'BẠN CÙNG LỚP', 'Thảo': 'CÔ GIÁO', 'Minh Anh': 'TRƯỞNG LÀNG · BỘ ĐÀM', 'Mạnh': 'BÁC CÔNG NHÂN · BỘ ĐÀM', 'Loa trường': 'THÔNG BÁO KHẨN', 'Câu chuyện': 'CƠN MƯA LỚN' };
  const spots = [
    { id: 'window', name: 'Cửa sổ', x: 1, y: 22, w: 27, h: 31, floor: 46, floorY: 74 },
    { id: 'clock', name: 'Đồng hồ', x: 50.5, y: 5, w: 7, h: 11, floor: 54, floorY: 70 },
    { id: 'duty', name: 'Bảng trực nhật', x: 39, y: 23, w: 8, h: 8, floor: 49, floorY: 72 },
    { id: 'vietnam', name: 'Bản đồ Việt Nam', x: 65, y: 27, w: 5, h: 12, floor: 66, floorY: 71 },
    { id: 'timetable', name: 'Thời khóa biểu', x: 72, y: 18, w: 8.5, h: 15, floor: 76, floorY: 68 },
    { id: 'poster', name: 'Sơ đồ sơ tán', x: 84.5, y: 16, w: 6.5, h: 21, floor: 84, floorY: 68 },
    { id: 'locker', name: 'Tủ của Duyên', x: 71.5, y: 35, w: 14, h: 27, floor: 78, floorY: 71 },
    { id: 'door', name: 'Cửa lớp', x: 91, y: 20, w: 8, h: 42, floor: 86, floorY: 67 },
    { id: 'duyen', name: 'Duyên', x: 62, y: 47, w: 8, h: 31, floor: 60, floorY: 80 }
  ];
  function stopWalking() { target = null; held.clear(); $('walk-marker').hidden = true; }
  function npcGoals() {
    if (state.location === 'hallway') return { duyen: { x: Math.max(17, state.player.x - 7), y: Math.min(89, state.player.y + 4) }, thao: { x: state.escortX, y: 76 } };
    const atLocker = state.phase !== 'intro' && state.phase !== 'explore' || state.dialogue?.id === 'duyen' && state.dialogue.index >= 9;
    return { duyen: atLocker ? { x: 71, y: 75 } : { x: 66, y: 77 }, thao: { x: 86, y: 72 } };
  }
  function actorObstacles() {
    return ['duyen', 'thao'].filter(id => !$(id).hidden).map(id => npcPositions[id]).filter(position => Math.hypot((state.player.x - position.x) / 2.4, (state.player.y - position.y) / 1.7) >= 1);
  }
  function currentSpots() {
    if (state.location === 'hallway') return [
      { id: 'follow', name: 'Cô Thảo', x: npcPositions.thao.x - 4, y: 44, w: 8, h: 33, floor: state.escortX - 7, floorY: 82 },
      { id: 'back', name: 'Cửa lớp', x: 1, y: 20, w: 13, h: 45, floor: 17, floorY: 78 },
      { id: 'east', name: 'Lối phía đông bị chặn', x: 88, y: 25, w: 11, h: 44, floor: 84, floorY: 79 }
    ];
    return spots.map(spot => spot.id === 'duyen' ? { ...spot, x: npcPositions.duyen.x - 3.5, y: npcPositions.duyen.y - 29, floor: npcPositions.duyen.x - 6, floorY: npcPositions.duyen.y + 4 } : spot);
  }
  function readSave() {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (!data) return null;
      const loaded = Model.restore(JSON.parse(data));
      if (loaded?.dialogue && (!Story[loaded.dialogue.id] || loaded.dialogue.index >= Story[loaded.dialogue.id].length)) return null;
      return loaded?.started ? loaded : null;
    } catch { return null; }
  }
  function save() {
    if (!active) return;
    try {
      state.savedAt = new Date().toISOString();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state)); saved = state;
      $('save-status').textContent = 'ĐÃ LƯU TỰ ĐỘNG';
    } catch { $('save-status').textContent = 'LƯU TẠM TRONG PHIÊN'; }
  }
  function dispatch(action, renderNow = true) { state = Model.step(state, action); save(); if (renderNow) render(); }
  function toast(text) { clearTimeout(toastTimer); $('toast').textContent = text; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3800); }
  function showPanel(type, html, closable = true, wide = false) {
    modal?.cleanup?.();
    stopWalking(); modal = { type, closable, previousFocus: document.activeElement };
    $('overlay').dataset.panel = type;
    $('panel').className = 'panel' + (wide ? ' wide' : '');
    $('panel').innerHTML = (closable ? '<button class="close" aria-label="Đóng">×</button>' : '') + html;
    $('overlay').hidden = false;
    $('panel').setAttribute('aria-label', $('panel').querySelector('h2')?.textContent || 'Tương tác');
    $('panel').querySelector('.close')?.addEventListener('click', closePanel);
    requestAnimationFrame(() => { $('panel').querySelector(type === 'route' ? '#route-start' : 'button:not(.close):not(:disabled)')?.focus({ preventScroll: true }); });
  }
  function closePanel() {
    if (modal && !modal.closable) return;
    const previousFocus = modal?.previousFocus;
    modal?.cleanup?.();
    modal = null; $('overlay').hidden = true; $('panel').innerHTML = '';
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    render();
  }
  function forceClosePanel() { modal?.cleanup?.(); modal = null; $('overlay').hidden = true; $('panel').innerHTML = ''; }
  function setDialogue(id) { stopWalking(); forceClosePanel(); dispatch({ type: 'DIALOGUE', id }); playLine(); }
  function playLine() {
    const line = currentLine();
    if (!line) return;
    if (line.location) dispatch({ type: 'LOCATION', location: line.location }, false);
    if (line.sfx) sound.play(line.sfx);
    if (line.flash && !state.settings.reducedMotion) { $('lightning').classList.remove('flash'); void $('lightning').offsetWidth; $('lightning').classList.add('flash'); }
    render();
  }
  function currentLine() { return state.dialogue ? Story[state.dialogue.id]?.[state.dialogue.index] : null; }
  function nextLine() {
    if (!active || modal || !state.dialogue) return;
    const id = state.dialogue.id;
    if (state.dialogue.index + 1 < Story[id].length) { dispatch({ type: 'NEXT_LINE' }, false); playLine(); return; }
    dispatch({ type: 'END_DIALOGUE' }, false);
    switch (id) {
      case 'opening': dispatch({ type: 'PHASE', phase: 'explore' }); toast('Nói chuyện với Duyên.'); break;
      case 'duyen': dispatch({ type: 'PHASE', phase: 'choice' }); showInitialChoice(); break;
      case 'locker-before-clue': render(); showLock(); break;
      case 'clue-first': render(); showRoute(); break;
      case 'route-found': render(); toast('Manh mối đã tìm thấy: Mật mã có liên quan tới tuyến sơ tán.'); break;
      case 'wrong-first':
        if (state.PrioritizedLeaving) leaveBear(); else render(); break;
      case 'wrong-second': render(); showLastChoice(); break;
      case 'last-try': render(); showLock(); break;
      case 'success': setDialogue('teacher-success'); break;
      case 'leave': setDialogue('teacher-leave'); break;
      case 'intervention': setDialogue('teacher-rules'); break;
      case 'teacher-success': case 'teacher-leave': setDialogue('teacher-rules'); break;
      case 'teacher-rules': dispatch({ type: 'PHASE', phase: 'rules' }); showRules(); break;
      case 'radio': dispatch({ type: 'HALLWAY' }, false); playLine(); break;
      case 'fork': dispatch({ type: 'COMPLETE' }); showResults(); break;
      default: render();
    }
  }
  function startNew() {
    forceClosePanel(); stopWalking(); state = Model.fresh(); active = true;
    dispatch({ type: 'START' }, false); sound.setEnabled(state.settings.sound); sound.start(); playLine();
  }
  function continueGame() {
    if (!saved) return;
    state = Model.restore(saved); active = true; forceClosePanel();
    sound.setEnabled(state.settings.sound); sound.start();
    if (state.dialogue) playLine(); else render();
    if (!state.dialogue) {
      if (state.phase === 'choice') showInitialChoice();
      else if (state.phase === 'rules') showRules();
      else if (state.phase === 'complete') showResults();
      else if (state.phase === 'puzzle' && state.SafeTime === 1 && !state.LastChoiceMade) showLastChoice();
      else if (state.phase === 'puzzle' && state.lockInput.length) showLock();
    }
    toast('Đã khôi phục lần chơi trước.');
    if (state.escortMoving && !state.dialogue) walkTo({ x: state.escortX - 7, y: 82 }, 'follow');
  }
  function renderProps() {
    if (state.location === 'classroom') $('props').innerHTML = `
      <div class="prop wall-clock"><span>12</span></div>
      <div class="prop chalk-title">Lớp 4B</div>
      <div class="prop wall-poster duty">HÔM NAY<br><b>TỔ 3</b></div>
      <div class="prop wall-poster vn-map"><svg viewBox="0 0 40 70" width="90%" height="75%"><path d="M10 3 L22 7 L17 17 L24 26 L24 33 L32 44 L32 52 L23 64 L12 67 L8 61 L21 53 L24 47 L19 36 L16 30 L17 22 L10 17 L4 10Z" fill="#698975"/></svg>VIỆT NAM</div>
      <div class="prop wall-poster timetable">THỜI KHÓA BIỂU<br>TOÁN · TIẾNG VIỆT<br>────────<br>KHOA HỌC</div>
      <div class="prop wall-poster evac"><b>SƠ ĐỒ<br>SƠ TÁN</b><svg viewBox="0 0 35 45" width="85%" height="60%"><path d="M5 40 V26 H18 V10 H30" stroke="#668673" stroke-width="2" fill="none"/><circle cx="5" cy="40" r="2" fill="#b4934f"/><circle cx="30" cy="10" r="2" fill="#b4934f"/></svg>4B</div>
      ${state.LockerOpened ? '<div class="prop locker-light"></div>' : ''}`;
    else if (state.location === 'hallway') $('props').innerHTML = '<div class="prop east-sign">LỐI PHÍA ĐÔNG · KHÔNG ĐI QUA</div>';
    else $('props').innerHTML = '';
  }
  function renderSpots() {
    hoveredSpot = null;
    $('hotspots').innerHTML = '';
    if (!active || state.dialogue || modal || !['explore', 'puzzle', 'hallway'].includes(state.phase)) return;
    const list = currentSpots();
    for (const spot of list) {
      const button = document.createElement('button'); button.className = 'hotspot'; button.dataset.spot = spot.id;
      button.style.cssText = `left:${spot.x}%;top:${spot.y}%;width:${spot.w}%;height:${spot.h}%`;
      button.setAttribute('aria-label', spot.name);
      button.dataset.action = ['duyen', 'follow'].includes(spot.id) ? 'talk' : 'inspect';
      const label = document.createElement('span'); label.className = 'hotspot-label';
      label.textContent = state.visited.includes(spot.id) ? spot.name : ['duyen', 'follow'].includes(spot.id) ? 'Nói chuyện' : 'Quan sát'; button.append(label);
      button.onpointerenter = () => { hoveredSpot = spot.id; };
      button.onpointerleave = () => { hoveredSpot = null; };
      if (spot.id === 'poster' && state.HintLevel >= 2 && !state.ClueBoardFound) button.classList.add('subtle-hint');
      button.onclick = () => interact(spot.id);
      $('hotspots').append(button);
    }
  }
  function renderCharacters() {
    const inside = state.location !== 'exterior';
    $('player').hidden = !inside; $('duyen').hidden = !inside;
    $('thao').hidden = !inside || !['teacher', 'rules', 'radio', 'hallway', 'finale', 'complete'].includes(state.phase);
    const hallway = state.location === 'hallway';
    const mobile = window.matchMedia('(max-width: 650px)').matches;
    const halfViewport = $('stage').clientWidth / 750 * 50;
    $('world').style.transform = mobile ? `translateX(-${cameraX}%)` : '';
    const goals = npcGoals();
    if (npcLocation !== state.location) { Object.assign(npcPositions.duyen, goals.duyen); Object.assign(npcPositions.thao, goals.thao); npcLocation = state.location; cameraX = Math.max(halfViewport, Math.min(100 - halfViewport, state.player.x)); }
    for (const [id, position] of [['player', state.player], ['duyen', npcPositions.duyen], ['thao', npcPositions.thao]]) {
      const element = $(id), depth = .73 + (position.y - 66) * .012;
      element.style.left = position.x + '%'; element.style.top = position.y + '%';
      const characterId = { player: 'boy', duyen: 'girl', thao: 'teacher' }[id];
      element.style.height = Characters.cast[characterId].height * depth + '%';
      element.style.zIndex = Math.round(position.y * 10);
      const shadow = $(id + '-shadow'); shadow.hidden = element.hidden;
      shadow.style.left = position.x + '%'; shadow.style.top = position.y + '%'; shadow.style.width = (id === 'thao' ? 5 : 4) * depth + '%';
      const movingNpc = id !== 'player' && Math.hypot(position.x - goals[id].x, position.y - goals[id].y) > .2;
      if (id !== 'player') element.classList.toggle('walking', movingNpc && !state.settings.reducedMotion);
    }
    const playerPose = playerWalking ? 'walk-' + (Math.floor(walkTime / .24) % 2 + 1) : 'idle';
    drawSprite('player', 'boy', playerPose, facing < 0);
    drawSprite('duyen', 'girl', state.LockerOpened ? 'bear' : 'idle');
    drawSprite('thao', 'teacher', 'idle');
  }
  function render() {
    document.body.classList.toggle('reduced-motion', state.settings.reducedMotion);
    $('world').className = 'world ' + state.location + (state.settings.showSpots ? ' show-spots' : '') + (state.LockerOpened ? ' locker-open' : '');
    $('title-screen').hidden = active; $('hud').hidden = !active || state.phase === 'intro' || state.phase === 'complete';
    $('safe-card').hidden = ['rules', 'radio', 'hallway', 'finale'].includes(state.phase);
    const objectives = { explore: 'Chuẩn bị sơ tán cùng Duyên.', choice: 'Cùng Duyên đưa ra quyết định.', puzzle: 'Tìm manh mối mở tủ của Duyên.', teacher: 'Chuẩn bị đi cùng cô Thảo.', rules: 'Ghi nhớ ba nguyên tắc sơ tán.', radio: 'Lắng nghe thông tin mới nhất.', hallway: 'Đi theo cô Thảo. Không tách nhóm.', finale: 'Quan sát ngã rẽ và nghe hướng dẫn.' };
    $('objective').textContent = objectives[state.phase] || '';
    $('location-label').textContent = state.location === 'hallway' ? 'TRƯỜNG LÀNG / HÀNH LANG' : 'TRƯỜNG LÀNG / LỚP 4B';
    $('safe-dots').innerHTML = Array.from({ length: 3 }, (_, i) => `<span class="${i < state.SafeTime ? '' : 'empty-dot'}">${i < state.SafeTime ? '●' : '○'}</span>`).join('');
    $('safe-dots').setAttribute('aria-label', `Còn ${state.SafeTime} đơn vị thời gian an toàn`);
    $('item-count').textContent = state.inventory.length;
    $('journal-dot').hidden = !state.ClueBoardFound;
    $('sound').textContent = state.settings.sound ? '♪' : '♩'; $('sound').setAttribute('aria-label', state.settings.sound ? 'Tắt âm thanh' : 'Bật âm thanh');
    $('hint').disabled = !active || state.phase !== 'puzzle' || !!state.dialogue;
    $('journal').disabled = !active; $('inventory').disabled = !active;
    const line = currentLine(); $('dialogue').hidden = !active || !line;
    if (line) {
      $('speaker').textContent = line.speaker === 'Thảo' ? 'Cô Thảo' : line.speaker;
      $('speaker-role').textContent = roles[line.speaker] || '';
      $('line').textContent = line.text;
      renderPortrait(line.speaker);
    }
    $('world-caption').replaceChildren();
    if (state.phase === 'intro' && state.location === 'exterior') {
      $('world-caption').append(document.createTextNode('09:00'));
      const small = document.createElement('small'); small.textContent = 'GIỜ RA CHƠI'; $('world-caption').append(small);
    }
    $('background').style.filter = state.location === 'exterior' ? 'brightness(.53) saturate(.65)' : `brightness(${.95 - Math.min(state.elapsed / 4200, .12)}) saturate(.86)`;
    document.querySelectorAll('.foreground').forEach(layer => { layer.style.filter = $('background').style.filter; });
    renderProps(); renderSpots(); renderCharacters();
    sound.ambience(state.SafeTime, state.elapsed, state.phase);
    $('near-label').hidden = true;
    if (state.phase === 'complete' && active && !modal) showResults();
  }
  function walkTo(destination, id = null) {
    const location = state.location === 'hallway' ? 'hallway' : 'classroom';
    const points = Navigation.path(state.player, destination, location, state.escortX, actorObstacles());
    if (!points.length) return;
    held.clear(); target = { points, id }; $('world').dataset.walking = 'true';
    const goal = points[points.length - 1];
    $('walk-marker').hidden = false; $('walk-marker').style.left = goal.x + '%'; $('walk-marker').style.top = goal.y + '%';
    $('walk-marker').classList.toggle('interaction-marker', !!id);
  }
  function interact(id) {
    if (!canMove()) return;
    if (state.phase === 'hallway' && ['back', 'east'].includes(id)) return performInteraction(id);
    if (id === 'follow') { dispatch({ type: 'BEGIN_FOLLOW' }, false); walkTo({ x: state.escortX - 7, y: 82 }, id); return; }
    const spot = currentSpots().find(spot => spot.id === id);
    if (!spot) return;
    const point = { x: spot.floor, y: spot.floorY };
    if (Math.hypot(state.player.x - point.x, state.player.y - point.y) < 2.2) performInteraction(id);
    else walkTo(point, id);
  }
  function performInteraction(id) {
    if (!active || state.dialogue || modal) return;
    stopWalking(); sound.play('click');
    if (state.phase === 'hallway') {
      if (id === 'back') return toast('Không. Phải đi cùng cô. Không quay lại lấy đồ.');
      if (id === 'east') return toast('Lối phía đông đã bị chặn. Chờ hướng dẫn của cô Thảo.');
      if (id === 'follow') { dispatch({ type: 'FOLLOW' }); if (state.dialogue) playLine(); }
      return;
    }
    dispatch({ type: 'VISIT', id }, false);
    if (id === 'door') {
      if (state.phase === 'puzzle') showLeaveConfirmation(); else setDialogue('door-early'); return;
    }
    if (id === 'duyen') { setDialogue(state.phase === 'explore' ? 'duyen' : 'duyen-puzzle'); return; }
    if (state.phase === 'explore' && (id === 'locker' || id === 'poster')) { toast('Nói chuyện với Duyên trước. Cậu ấy có vẻ đang lo lắng.'); render(); return; }
    if (id === 'locker') { if (!state.ClueBoardFound) setDialogue('locker-before-clue'); else showLock(); return; }
    if (id === 'poster') {
      const first = !state.ClueBoardFound; dispatch({ type: 'CLUE' }, false);
      if (first) setDialogue('clue-first'); else showRoute(); return;
    }
    if (Story[id]) setDialogue(id);
  }
  function showInitialChoice() {
    showPanel('initial-choice', `<span class="eyebrow">TỦ CỦA DUYÊN</span><h2>Bạn nên làm gì?</h2><p>Duyên quên mật mã. Gấu bông vẫn ở trong tủ. Loa trường vừa yêu cầu chuẩn bị sơ tán.</p>
      <button id="choice-leave" class="choice">A. “Để gấu lại, mình đi chờ cô.”<small>Ưu tiên rời đi. Nếu tìm được manh mối ngay, chỉ thử một lần.</small></button>
      <button id="choice-search" class="choice">B. “Mình thử tìm mật mã thật nhanh.”<small>Khi cô Thảo tới, phải đi ngay.</small></button>`, false);
    $('choice-leave').onclick = () => { forceClosePanel(); dispatch({ type: 'INITIAL_CHOICE', leave: true }, false); playLine(); };
    $('choice-search').onclick = () => { forceClosePanel(); dispatch({ type: 'INITIAL_CHOICE', leave: false }, false); playLine(); };
  }
  function showLastChoice() {
    showPanel('last-choice', `<span class="eyebrow">CHỈ CÒN ÍT THỜI GIAN</span><h2>Mình phải quyết định.</h2><p>Chỉ còn một đơn vị thời gian an toàn. Đồ vật có thể được người lớn xử lý khi khu vực an toàn.</p><button id="last-try" class="choice">Thử mở tủ lần cuối<small>Đây là lần cuối. Không được chần chừ.</small></button><button id="last-leave" class="choice">Bỏ lại gấu và đi<small>Ưu tiên an toàn. Đây cũng là một kết thúc tốt.</small></button>`, false);
    $('last-try').onclick = () => { forceClosePanel(); dispatch({ type: 'LAST_TRY' }, false); playLine(); };
    $('last-leave').onclick = leaveBear;
  }
  function showLeaveConfirmation() {
    showPanel('leave', '<span class="eyebrow">CHUẨN BỊ SƠ TÁN</span><h2>Để gấu lại trong tủ?</h2><p>Khi khu vực an toàn, mình có thể nhờ người lớn xử lý sau. Bây giờ Duyên cần đi cùng bạn và cô Thảo.</p><div class="button-row"><button id="leave-now" class="primary">Bỏ lại gấu và đi</button><button id="stay" class="secondary">Quan sát thêm</button></div>');
    $('leave-now').onclick = leaveBear; $('stay').onclick = closePanel;
  }
  function leaveBear() { forceClosePanel(); dispatch({ type: 'LEAVE' }, false); playLine(); }
  function showLock() {
    if (state.phase !== 'puzzle' || state.SafeTime <= 0) return;
    showPanel('lock', `<span class="eyebrow">ĐỒ VẬT / TỦ CỦA DUYÊN</span><h2>Khóa bốn hướng</h2><p>${state.ClueBoardFound ? 'Quan sát quy luật trong lớp. Ghi nhớ bốn hướng theo đúng thứ tự.' : 'Mình chưa biết quy luật. Có thể quan sát lớp học trước khi thử.'}</p><div id="lock-slots" class="lock-slots" aria-label="Bốn hướng đang nhập"></div><div class="direction-pad"><button data-direction="↑" aria-label="Hướng lên">↑</button><button data-direction="←" aria-label="Hướng trái">←</button><button id="pad-confirm" class="confirm-pad" aria-label="Xác nhận mã">●</button><button data-direction="→" aria-label="Hướng phải">→</button><button data-direction="↓" aria-label="Hướng xuống">↓</button></div><p id="lock-status" class="lock-status" aria-live="polite"></p><div class="button-row"><button id="clear-lock" class="secondary">Xóa</button><button id="submit-lock" class="primary">Xác nhận</button><button id="leave-lock" class="secondary">Rời đi</button></div><div class="note">Nhập sai mất một đơn vị thời gian chuẩn bị. Không có đếm ngược; hãy bình tĩnh suy nghĩ.</div>`);
    document.querySelectorAll('[data-direction]').forEach(button => { button.onclick = () => inputDirection(button.dataset.direction); });
    $('clear-lock').onclick = () => { dispatch({ type: 'CLEAR' }, false); updateLock(); sound.play('click'); };
    $('submit-lock').onclick = submitLock; $('pad-confirm').onclick = submitLock; $('leave-lock').onclick = showLeaveConfirmation;
    updateLock();
  }
  function inputDirection(value) { dispatch({ type: 'DIRECTION', value }, false); sound.play('click'); updateLock(); }
  function updateLock() {
    if (modal?.type !== 'lock') return;
    $('lock-slots').innerHTML = Array.from({ length: 4 }, (_, i) => '<span>' + (state.lockInput[i] || '○') + '</span>').join('');
    $('lock-status').textContent = state.lockInput.length === 4 ? 'Nhấn nút giữa hoặc Xác nhận để thử mã.' : 'Chọn đủ bốn hướng.';
    $('submit-lock').disabled = state.lockInput.length !== 4; $('pad-confirm').disabled = state.lockInput.length !== 4;
  }
  function submitLock() {
    if (state.lockInput.length !== 4) return;
    const previousTime = state.SafeTime;
    forceClosePanel(); dispatch({ type: 'SUBMIT' }, false);
    if (state.SafeTime < previousTime && state.SafeTime > 0) { sound.play('wrong'); toast(`Chưa đúng. Còn ${state.SafeTime} đơn vị thời gian an toàn.`); }
    playLine();
  }
  function showRoute(hintFocus = false) {
    const activeSegment = routeHighlight;
    showPanel('route', window.SceneEvacuationMap.markup(hintFocus), true, true);
    $('panel').classList.add('route-panel');
    routeHighlight = activeSegment;
    modal.cleanup = window.SceneEvacuationMap.attach($('panel'), {
      onStart: () => { dispatch({ type: 'ROUTE_START' }, false); routeHighlight = -1; updateRoute(); sound.play('click'); },
      onSegment: routeSegment,
      onDone: () => { closePanel(); if (state.RouteUnderstood) setDialogue('route-found'); }
    });
    updateRoute();
    if (hintFocus && !state.settings.reducedMotion) {
      const hintPanel = modal;
      for (let index = 0; index < 4; index++) setTimeout(() => {
        if (modal !== hintPanel) return;
        document.querySelectorAll('[data-segment]').forEach(button => button.classList.toggle('hint-focus-step', Number(button.dataset.segment) === index));
      }, index * 850);
      setTimeout(() => { if (modal === hintPanel) document.querySelectorAll('.hint-focus-step').forEach(button => button.classList.remove('hint-focus-step')); }, 3600);
    }
  }
  function routeSegment(index) {
    if (!state.routeStarted) { $('route-status').textContent = 'Hãy chọn “Bắt đầu từ lớp 4B” trước.'; return; }
    if (state.routeProgress < 4 && index !== state.routeProgress) { $('route-status').textContent = 'Theo đường nối liền từ điểm vừa đọc. Quan sát đoạn tiếp theo.'; return; }
    dispatch({ type: 'ROUTE_SEGMENT', index }, false); routeHighlight = index; sound.play('click'); updateRoute();
  }
  function updateRoute() {
    if (modal?.type !== 'route') return;
    window.SceneEvacuationMap.update($('panel'), { started: state.routeStarted, progress: state.routeProgress, highlight: routeHighlight });
  }
  function showHints() {
    if (state.phase !== 'puzzle' || state.dialogue) return;
    if (state.HintLevel >= 3) {
      showPanel('hint-accessible', '<span class="eyebrow">GỢI Ý DỄ TIẾP CẬN</span><h2>Xem gợi ý rõ hơn?</h2><p>Hãy theo tuyến từ Lớp 4B đến Điểm tập kết và ghi nhớ hướng tại bốn đoạn. Mình sẽ phóng to sơ đồ để bạn quan sát, không điền hộ mã khóa.</p><div class="button-row"><button id="accept-hint" class="primary">Có, xem sơ đồ</button><button id="decline-hint" class="secondary">Tự quan sát thêm</button></div>');
      $('accept-hint').onclick = () => { dispatch({ type: 'HINT' }, false); dispatch({ type: 'CLUE' }, false); showRoute(true); }; $('decline-hint').onclick = closePanel; return;
    }
    dispatch({ type: 'HINT' });
    const texts = ['','Duyên: “Lúc đổi mật mã... tớ đang nhìn thứ gì đó trên tường.”','Duyên: “Hình như nó liên quan đến một đường đi.”','Bạn: “Bắt đầu từ lớp 4B. Có bốn đoạn chính.”'];
    if (state.HintLevel === 3) { dispatch({ type: 'CLUE' }, false); showRoute(true); }
    else toast(texts[state.HintLevel]);
  }
  function showJournal() {
    if (!active) return;
    const entries = [];
    if (state.ClueBoardFound) entries.push('<div class="journal-entry"><h3>✧ Sơ đồ sơ tán</h3><p>Mật mã có liên quan tới tuyến sơ tán từ Lớp 4B đến điểm tập kết. Khóa có bốn ô.</p><button id="journal-route" class="secondary">Xem lại sơ đồ</button></div>');
    if (state.RouteUnderstood) entries.push('<div class="journal-entry"><h3>Quy luật đường đi</h3><p>Đã đọc hết bốn đoạn. Cần tự ghi nhớ thứ tự các hướng.</p></div>');
    const observations = { clock: 'Đồng hồ chỉ 09:00; khóa không có số.', duty: 'Hôm nay tổ 3 trực nhật; không liên quan tới nút hướng.', vietnam: 'Bản đồ Việt Nam không phải manh mối mật mã.', timetable: 'Thời khóa biểu có Toán, Tiếng Việt và Khoa học.' };
    for (const id of state.visited) if (observations[id]) entries.push(`<div class="journal-entry"><p>${observations[id]}</p></div>`);
    if (['radio', 'hallway', 'finale', 'complete'].includes(state.phase)) entries.push('<div class="journal-entry"><h3>Thông tin mới từ bộ đàm</h3><p>Đường phía đông bị ngập. Sơ đồ cũ không thay thế hướng dẫn mới nhất của người lớn.</p></div>');
    showPanel('journal', `<span class="eyebrow">SỔ TAY QUAN SÁT</span><h2>Những điều đã biết</h2>${entries.join('') || '<p>Chưa có manh mối. Hãy quan sát lớp học và nói chuyện với Duyên.</p>'}<div class="note">Đừng thử đại. Đọc môi trường trước khi đưa ra quyết định.</div>`);
    $('journal-route')?.addEventListener('click', () => {
      if (state.phase === 'puzzle') showRoute();
      else toast('Tuyến cũ đi qua phía đông. Bây giờ cần theo hướng dẫn mới của cô Thảo.');
    });
  }
  function showInventory() {
    if (!active) return;
    showPanel('inventory', `<span class="eyebrow">VẬT PHẨM TRONG CÂU CHUYỆN</span><h2>Túi đồ</h2>${state.LockerOpened ? '<div class="journal-entry"><h3>🧸 Gấu bông của Duyên</h3><p>Duyên đã lấy gấu và đang ôm theo. Đây là vật kỷ niệm; không cần dùng lên đồ vật khác trong scene này.</p><button id="inspect-bear" class="secondary">Kiểm tra</button></div>' : '<p>Chưa có vật phẩm. Gấu bông của Duyên vẫn ở trong tủ.</p>'}<div class="note">Đồ vật có thể lấy lại sau. An toàn và đi cùng nhóm luôn quan trọng hơn.</div>`);
    $('inspect-bear')?.addEventListener('click', () => toast('Một con gấu nhỏ, đã sờn tai. Duyên giữ nó rất cẩn thận.'));
  }
  function showRules() {
    showPanel('rules', '<span class="eyebrow">LỜI DẶN CỦA CÔ THẢO</span><h2>Trước khi chúng ta đi</h2><ol class="rules-list"><li><div>Đi cùng người lớn<small>Không tự ý đi một mình.</small></div></li><li><div>Không tách nhóm<small>Luôn đi cùng cô và các bạn.</small></div></li><li><div>Không quay lại lấy đồ<small>Khi đã bắt đầu sơ tán, không quay lại.</small></div></li></ol><button id="understood" class="primary">Đã hiểu →</button>', false);
    $('understood').onclick = () => { forceClosePanel(); dispatch({ type: 'PHASE', phase: 'radio' }, false); setDialogue('radio'); };
  }
  function showResults() {
    const awards = Model.achievements(state);
    const calm = state.LockerAttempt === 0 || (state.LockerOpened && state.LockerAttempt === 1);
    const safety = state.SafetyIntervention ? 'Đã nghe cô Thảo và sơ tán cùng nhóm.' : state.EvacuatedWithoutBear ? 'Đã ưu tiên rời đi thay vì chờ lấy đồ.' : 'Đã lấy gấu trước khi cần rời đi và đi cùng cô.';
    showPanel('results', `<span class="eyebrow">SCENE 1 HOÀN THÀNH</span><h2>Cơn Mưa Lớn</h2><p>Quan sát — Bình tĩnh — Không chần chừ — Đi theo hướng dẫn.</p><div class="result-grid"><div class="result-card"><span>QUAN SÁT</span><p>${state.ClueBoardFound ? '✓ Phát hiện manh mối quan trọng.' : 'Lần sau, thử quan sát kỹ các vật trên tường.'}</p></div><div class="result-card"><span>SUY LUẬN</span><p>${state.LockerOpened ? '✓ Giải được mật mã đường đi.' : state.RouteUnderstood ? '✓ Hiểu quy luật của tuyến sơ tán.' : 'Gấu ở lại trong tủ. Bạn vẫn hoàn thành scene.'}</p></div><div class="result-card"><span>BÌNH TĨNH</span><p>${calm ? '✓ Không thử mật mã ngẫu nhiên nhiều lần.' : 'Dành thời gian quan sát trước khi thử lại.'}</p></div><div class="result-card"><span>AN TOÀN</span><p>✓ ${safety}</p></div></div><h3>Thành tích</h3>${awards.map(name => '<span class="achievement">✧ ' + name + '</span>').join('') || '<p>Đã hoàn thành sơ tán cùng cô Thảo.</p>'}<div class="journal-entry" style="margin-top:20px"><span class="eyebrow">SCENE 2 / GIỚI THIỆU</span><h3>Ba con đường</h3><p>Khảo sát ba tuyến và tìm đường lên điểm tập kết cùng cô Thảo, Duyên và bác Mạnh.</p><a class="primary" href="chapter02.html">Tiếp tục Chương 02 →</a></div><div class="button-row"><button id="replay" class="primary">Chơi lại scene 1</button><button id="back-title" class="secondary">Về màn hình đầu</button></div>`, false, true);
    $('replay').onclick = startNew;
    $('back-title').onclick = () => { forceClosePanel(); active = false; saved = readSave(); $('continue').hidden = !saved; state = Model.fresh(); render(); };
  }
  function showSettings() {
    showPanel('settings', `<span class="eyebrow">CÀI ĐẶT & HƯỚNG DẪN</span><h2>Chơi theo nhịp của bạn</h2><p>WASD hoặc phím mũi tên: di chuyển. E: tương tác khi đứng gần. Bấm/chạm: khám phá đồ vật. Enter hoặc Space: đọc tiếp. Esc: đóng cửa sổ. I: túi đồ. J: sổ tay.</p><p>Không có đếm ngược thực. Ba chấm là thời gian chuẩn bị còn lại; chỉ mất một chấm khi xác nhận mã sai. Bỏ lại gấu vẫn hoàn thành scene.</p><div class="button-row"><button id="toggle-motion" class="secondary">${state.settings.reducedMotion ? 'Bật' : 'Giảm'} chuyển động</button><button id="toggle-spots" class="secondary">${state.settings.showSpots ? 'Ẩn' : 'Hiện'} vùng tương tác</button><button id="toggle-audio" class="secondary">${state.settings.sound ? 'Tắt' : 'Bật'} âm thanh</button></div><div class="note">Tiến trình được lưu tự động trên trình duyệt này. Nếu trình duyệt chặn lưu trữ, trò chơi vẫn chạy trong phiên hiện tại.</div>${active ? '<div class="button-row"><button id="return-title" class="secondary">Lưu và về màn hình đầu</button></div>' : ''}`);
    $('toggle-motion').onclick = () => { dispatch({ type: 'SETTINGS', reducedMotion: !state.settings.reducedMotion }); showSettings(); };
    $('toggle-spots').onclick = () => { dispatch({ type: 'SETTINGS', showSpots: !state.settings.showSpots }); showSettings(); };
    $('toggle-audio').onclick = () => { toggleSound(); showSettings(); };
    $('return-title')?.addEventListener('click', () => { save(); saved = readSave(); active = false; forceClosePanel(); $('continue').hidden = !saved; state = Model.fresh(); render(); });
  }
  function toggleSound() { dispatch({ type: 'SETTINGS', sound: !state.settings.sound }); sound.setEnabled(state.settings.sound); if (state.settings.sound) sound.start(); }
  function drawSprite(id, characterId, pose = 'idle', flip = false) {
    const character = Characters.cast[characterId], model = assets[characterId];
    const image = model?.[pose] || model?.idle;
    if (!image) return;
    const canvas = $(id);
    const renderKey = image.src + ':' + flip;
    if (canvas.dataset.model === renderKey) return;
    canvas.width = 512; canvas.height = 768;
    const ctx = canvas.getContext('2d');
    const alignment = character.alignment?.[pose] || character;
    const scale = canvas.height / (image.naturalHeight * (alignment.ground - alignment.crown));
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    ctx.save();
    if (flip) { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    // Draw the entire standalone PNG. Only empty outer padding extends off canvas.
    ctx.drawImage(image, (canvas.width - width) / 2, -image.naturalHeight * alignment.crown * scale, width, height);
    ctx.restore(); canvas.dataset.model = renderKey;
  }
  function renderPortrait(speaker) {
    const canvas = $('portrait'), ctx = canvas.getContext('2d');
    const characterId = Characters.speakers[speaker], image = assets[characterId]?.portrait;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.hidden = !image;
    if (!image) return;
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    ctx.drawImage(image, (canvas.width - width) / 2, canvas.height - height, width, height);
  }
  async function loadAssets() {
    const loads = Object.entries(Characters.cast).flatMap(([id, character]) => {
      assets[id] = {};
      return Object.entries({ ...character.images, portrait: character.portrait }).map(async ([pose, filename]) => {
        const image = new Image(); image.src = filename;
        try { await image.decode(); assets[id][pose] = image; }
        catch { toast('Không tải được ảnh nhân vật ' + character.name + '. Hãy tải lại trang.'); }
      });
    });
    await Promise.all(loads);
    document.documentElement.dataset.characters = 'ready';
    render();
  }
  function canMove() { return active && !modal && !state.dialogue && ['explore', 'puzzle', 'hallway'].includes(state.phase); }
  function nearestSpot() {
    const candidates = currentSpots().filter(spot => !['back', 'east'].includes(spot.id) && (state.phase !== 'explore' || spot.id === 'duyen'));
    const byDistance = candidates.map(spot => ({ spot, distance: Math.hypot(state.player.x - spot.floor, state.player.y - spot.floorY) })).sort((a, b) => a.distance - b.distance);
    const hovered = byDistance.find(entry => entry.spot.id === hoveredSpot && entry.distance < 3.5);
    return hovered?.spot || (byDistance[0]?.distance < (state.phase === 'hallway' ? 9 : 3) ? byDistance[0].spot : null);
  }
  function movePlayer(dx, dy, delta) {
    const previous = state.player;
    const candidate = Navigation.move(previous, { x: previous.x + dx * delta * 13, y: previous.y + dy * delta * 13 }, state.location, state.escortX, actorObstacles());
    state = Model.step(state, { type: 'MOVE', x: candidate.x, y: candidate.y });
    const moved = Math.hypot(state.player.x - previous.x, state.player.y - previous.y) > .001;
    if (moved) { moveDirty = true; if (Math.abs(dx) > .1) facing = dx > 0 ? 1 : -1; }
    return moved;
  }
  let rainWidth = 1000, rainHeight = 700;
  const rainCtx = $('rain').getContext('2d');
  const drops = Array.from({ length: 130 }, () => ({ x: Math.random(), y: Math.random(), speed: .6 + Math.random(), length: .014 + Math.random() * .025 }));
  function resizeRain() {
    const rect = $('world').getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    rainWidth = rect.width; rainHeight = rect.height; $('rain').width = rainWidth * dpr; $('rain').height = rainHeight * dpr; rainCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function animate(time) {
    const delta = Math.min((time - (lastTime || time)) / 1000, .05); lastTime = time;
    if (active && state.phase !== 'complete') {
      elapsedCarry += delta;
      if (elapsedCarry > 1) { state.elapsed += elapsedCarry; elapsedCarry = 0; sound.ambience(state.SafeTime, state.elapsed, state.phase); }
    }
    rainCtx.clearRect(0, 0, rainWidth, rainHeight);
    if (!state.settings.reducedMotion) {
      rainCtx.strokeStyle = '#c9dfe15e'; rainCtx.lineWidth = 1;
      for (const drop of drops) {
        drop.y = (drop.y + delta * drop.speed * .8) % 1;
        const visible = state.location === 'exterior' || (state.location === 'classroom' ? drop.x < .27 || drop.x > .92 : drop.x > .19 && drop.x < .7 || drop.x > .85);
        if (!visible) continue;
        const x = drop.x * rainWidth, y = drop.y * rainHeight * .61;
        rainCtx.beginPath(); rainCtx.moveTo(x, y); rainCtx.lineTo(x - 4, y + drop.length * rainHeight); rainCtx.stroke();
      }
    }
    let walking = false;
    if (canMove()) {
      let dx = (held.has('d') || held.has('ArrowRight') ? 1 : 0) - (held.has('a') || held.has('ArrowLeft') ? 1 : 0);
      let dy = (held.has('s') || held.has('ArrowDown') ? 1 : 0) - (held.has('w') || held.has('ArrowUp') ? 1 : 0);
      if (target && !dx && !dy) {
        const waypoint = target.points[0];
        dx = waypoint.x - state.player.x; dy = waypoint.y - state.player.y;
        if (Math.hypot(dx, dy) < .35) {
          target.points.shift();
          if (!target.points.length) { const id = target.id; stopWalking(); save(); if (id) performInteraction(id); }
          dx = dy = 0;
        }
      }
      if ((dx || dy) && canMove()) {
        const aspect = $('world').clientWidth / $('world').clientHeight;
        const length = Math.hypot(dx, dy / aspect);
        const travelDelta = target ? Math.min(delta, length / 13) : delta;
        walking = movePlayer(dx / length, dy / length, travelDelta);
      }
      else if (moveDirty) { save(); moveDirty = false; }
      const nearest = nearestSpot(); $('near-label').hidden = !nearest || (!state.settings.showSpots && hoveredSpot !== nearest.id) || !!target;
      if (nearest) {
        $('near-label').textContent = 'E · ' + (state.visited.includes(nearest.id) ? nearest.name : ['duyen', 'follow'].includes(nearest.id) ? 'Nói chuyện' : 'Quan sát');
        const worldRect = $('world').getBoundingClientRect(), stageRect = $('stage').getBoundingClientRect();
        $('near-label').style.left = Math.max(70, Math.min(stageRect.width - 70, worldRect.left - stageRect.left + state.player.x / 100 * worldRect.width)) + 'px';
        $('near-label').style.top = (state.player.y - 3) + '%';
      }
    } else $('near-label').hidden = true;
    playerWalking = walking; if (walking) walkTime += delta; else walkTime = 0;
    const goals = npcGoals();
    if (active) for (const id of ['duyen', 'thao']) {
      const position = npcPositions[id], goal = goals[id], gap = Math.hypot(goal.x - position.x, goal.y - position.y);
      const distance = Math.min(gap, delta * (id === 'thao' ? 10 : 12));
      if (gap > .01) { position.x += (goal.x - position.x) / gap * distance; position.y += (goal.y - position.y) / gap * distance; }
    }
    const halfViewport = $('stage').clientWidth / 750 * 50;
    const desiredCamera = Math.max(halfViewport, Math.min(100 - halfViewport, state.player.x));
    cameraX += (desiredCamera - cameraX) * Math.min(1, delta * 5);
    renderCharacters();
    // Keep character hit areas aligned while they actually walk across the room.
    for (const spot of currentSpots().filter(spot => ['duyen', 'follow'].includes(spot.id))) {
      const button = $('hotspots').querySelector(`[data-spot="${spot.id}"]`);
      if (button) { button.style.left = spot.x + '%'; button.style.top = spot.y + '%'; }
    }
    $('world').dataset.walking = target || walking ? 'true' : 'false';
    requestAnimationFrame(animate);
  }
  function keydown(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (modal) {
      if (key === 'Escape') { event.preventDefault(); closePanel(); }
      if (key === 'Tab') {
        const buttons = [...$('panel').querySelectorAll('button:not(:disabled)')]; const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (modal.type === 'lock') {
        const direction = { ArrowUp: '↑', ArrowRight: '→', ArrowDown: '↓', ArrowLeft: '←' }[key];
        if (direction) { event.preventDefault(); if (!event.repeat) inputDirection(direction); }
        if (key === 'Backspace') { event.preventDefault(); dispatch({ type: 'CLEAR' }, false); updateLock(); }
        if (key === 'Enter' && state.lockInput.length === 4 && !event.repeat) { event.preventDefault(); submitLock(); }
      }
      return;
    }
    if (state.dialogue && active && ['Enter', ' ', 'e'].includes(key)) { event.preventDefault(); if (!event.repeat) nextLine(); return; }
    if (event.target.closest('button,input,select,textarea') && ['Enter', ' '].includes(key)) return;
    if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key) && canMove()) { event.preventDefault(); target = null; $('walk-marker').hidden = true; held.add(key); }
    if (key === 'e' && canMove() && !event.repeat) { event.preventDefault(); const near = nearestSpot(); if (near) interact(near.id); else toast('Đến gần đồ vật, hoặc bấm/chạm trực tiếp để tương tác.'); }
    if (key === 'i' && active && !event.repeat) showInventory();
    if (key === 'j' && active && !event.repeat) showJournal();
    if (key === 'Escape') showSettings();
  }
  $('start').onclick = () => {
    if (saved) {
      showPanel('restart', '<span class="eyebrow">MỘT CÂU CHUYỆN MỚI</span><h2>Chơi lại từ đầu?</h2><p>Lần chơi mới sẽ thay thế tiến trình đang lưu trên trình duyệt này.</p><div class="button-row"><button id="confirm-new" class="primary">Bắt đầu lại</button><button id="resume-old" class="secondary">Tiếp tục lần trước</button></div>');
      $('confirm-new').onclick = startNew; $('resume-old').onclick = continueGame;
    } else startNew();
  };
  $('continue').onclick = continueGame; $('next').onclick = nextLine;
  $('settings').onclick = showSettings; $('sound').onclick = toggleSound;
  $('hint').onclick = showHints; $('journal').onclick = showJournal; $('inventory').onclick = showInventory;
  $('overlay').onclick = event => { if (event.target === $('overlay')) closePanel(); };
  $('world').onclick = event => {
    if (!canMove() || event.target.closest('button')) return;
    const rect = $('world').getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * 100, y = (event.clientY - rect.top) / rect.height * 100;
    if (state.phase === 'hallway' && x < 15) { toast('Không. Phải đi cùng cô.'); return; }
    if (state.phase === 'hallway' && x > state.escortX + 4) { toast('Cô Thảo: “Đừng tách khỏi nhóm.”'); return; }
    if (y < 64) return;
    walkTo({ x, y });
  };
  document.addEventListener('keydown', keydown);
  document.addEventListener('keyup', event => held.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
  window.addEventListener('blur', () => { held.clear(); save(); });
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { held.clear(); save(); sound.ctx?.suspend(); } else if (active) sound.start(); });
  document.querySelectorAll('[data-move]').forEach(button => {
    button.onpointerdown = event => { event.preventDefault(); if (canMove()) { target = null; $('walk-marker').hidden = true; held.add(button.dataset.move); button.setPointerCapture(event.pointerId); } };
    button.onpointerup = button.onpointercancel = button.onlostpointercapture = () => held.delete(button.dataset.move);
  });
  $('touch-interact').onclick = () => { if (canMove()) { const near = nearestSpot(); if (near) interact(near.id); } };
  window.addEventListener('resize', resizeRain); new ResizeObserver(resizeRain).observe($('stage'));
  saved = readSave(); $('continue').hidden = !saved;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) state.settings.reducedMotion = true;
  render(); loadAssets(); resizeRain(); requestAnimationFrame(animate);
})();
