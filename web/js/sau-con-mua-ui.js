/**
 * Sau Cơn Mưa — UI Controller & Interaction Engine
 * Phân đoạn giáo dục kỹ năng phòng tránh sạt lở & sơ tán an toàn (Tiểu học Lớp 3–5)
 */
(function () {
  'use strict';

  let engine = null;
  let telemetry = null;
  let scenarioConfig = null;
  let soundEnabled = true;
  let idleTimer = null;
  let minhChatTurns = 0;
  let currentRecapIndex = 0;

  // DOM Elements
  const els = {};

  function initElements() {
    els.viewport = document.getElementById('stage-viewport');
    els.bgLayer = document.getElementById('background-layer');
    els.hotspotsLayer = document.getElementById('hotspots-layer');
    els.charactersLayer = document.getElementById('characters-layer');
    els.charAn = document.getElementById('char-an');
    els.charMinh = document.getElementById('char-minh');
    els.charTeacher = document.getElementById('char-teacher');

    els.dialogueBox = document.getElementById('dialogue-box');
    els.speakerName = document.getElementById('speaker-name');
    els.speechText = document.getElementById('speech-text');
    els.choiceButtons = document.getElementById('choice-buttons');

    els.btnSound = document.getElementById('btn-sound');
    els.btnRepeat = document.getElementById('btn-repeat-speech');
    els.btnHelp = document.getElementById('btn-teacher-help');

    // Modals
    els.helpModal = document.getElementById('help-modal');
    els.helpPictures = document.getElementById('help-pictures');
    els.btnHelpUnsure = document.getElementById('btn-help-unsure');

    els.minhModal = document.getElementById('minh-chat-modal');
    els.minhChatLog = document.getElementById('minh-chat-log');
    els.minhInput = document.getElementById('minh-input');
    els.btnSendMinh = document.getElementById('btn-send-minh');
    els.btnSkipChat = document.getElementById('btn-skip-chat');

    els.recapContainer = document.getElementById('recap-container');
    els.recapQuiz = document.getElementById('recap-quiz');
    els.cardsResult = document.getElementById('cards-result');
    els.cardReport = document.getElementById('card-report');
    els.cardSafety = document.getElementById('card-safety');
    els.cardGroup = document.getElementById('card-group');
    els.recapFooter = document.getElementById('recap-footer');
    els.btnReplay = document.getElementById('btn-replay');

    els.cueModal = document.getElementById('cue-zoom-modal');
    els.cueTitle = document.getElementById('cue-zoom-title');
    els.cueImg = document.getElementById('cue-zoom-img');
    els.cueDesc = document.getElementById('cue-zoom-desc');
    els.btnCloseCue = document.getElementById('btn-close-cue');

    els.hotspotCrack = document.getElementById('hotspot-crack');
    els.hotspotTree = document.getElementById('hotspot-tree');
    els.hotspotStream = document.getElementById('hotspot-stream');
  }

  // Audio helper using Web Audio API synth if audio.js is not loaded
  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }

  function playAlertSound() {
    if (!soundEnabled) return;
    try {
      const ctx = window.AudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(495, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (_) {}
  }

  // Reset & track idle timer for teacher hint (20s & 40s)
  function resetIdleTimer() {
    if (idleTimer) clearTimeout(idleTimer);
    if (els.btnHelp) els.btnHelp.classList.remove('pulse-help');

    idleTimer = setTimeout(() => {
      if (els.btnHelp) els.btnHelp.classList.add('pulse-help');
      if (engine) {
        const state = engine.getState();
        const stageDef = scenarioConfig.stages.find(s => s.id === state.stage);
        if (stageDef && stageDef.decision_id) {
          engine.dispatch({ type: 'HINT_TIMEOUT', decision_id: stageDef.decision_id });
          if (telemetry) {
            telemetry.logEvent({
              event_id: 'hint-' + stageDef.decision_id + '-' + Date.now(),
              type: 'hint_shown',
              decision_id: stageDef.decision_id,
              stage: state.stage
            });
          }
        }
      }
    }, 20000);
  }

  // Update View & Character Positions
  function setView(viewName) {
    if (!els.bgLayer) return;

    if (viewName === 'school') {
      els.bgLayer.style.backgroundImage = "url('assets/sau-con-mua/backgrounds/bg_school.webp')";
      if (els.hotspotsLayer) els.hotspotsLayer.style.display = 'block';
      if (els.charAn) { els.charAn.style.left = '35%'; els.charAn.style.top = '70%'; }
      if (els.charMinh) { els.charMinh.style.left = '46%'; els.charMinh.style.top = '70%'; }
      if (els.charTeacher) { els.charTeacher.style.left = '61%'; els.charTeacher.style.top = '67%'; }
    } else if (viewName === 'route') {
      els.bgLayer.style.backgroundImage = "url('assets/sau-con-mua/backgrounds/bg_route.webp')";
      if (els.hotspotsLayer) els.hotspotsLayer.style.display = 'none';
      if (els.charAn) { els.charAn.style.left = '25%'; els.charAn.style.top = '68%'; }
      if (els.charMinh) { els.charMinh.style.left = '35%'; els.charMinh.style.top = '68%'; }
      if (els.charTeacher) { els.charTeacher.style.left = '48%'; els.charTeacher.style.top = '68%'; }
    } else if (viewName === 'assembly') {
      els.bgLayer.style.backgroundImage = "url('assets/sau-con-mua/backgrounds/bg_assembly.webp')";
      if (els.hotspotsLayer) els.hotspotsLayer.style.display = 'none';
      if (els.charAn) { els.charAn.style.left = '40%'; els.charAn.style.top = '72%'; }
      if (els.charMinh) { els.charMinh.style.left = '47%'; els.charMinh.style.top = '72%'; }
      if (els.charTeacher) { els.charTeacher.style.left = '55%'; els.charTeacher.style.top = '66%'; }
    }
  }

  function renderDialogue(speaker, text) {
    if (els.speakerName) els.speakerName.textContent = speaker;
    if (els.speechText) els.speechText.textContent = text;
  }

  function renderChoices(choices) {
    if (!els.choiceButtons) return;
    els.choiceButtons.innerHTML = '';

    (choices || []).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.onclick = () => {
        playClickSound();
        resetIdleTimer();
        handleChoiceClick(choice);
      };
      els.choiceButtons.appendChild(btn);
    });
  }

  function handleChoiceClick(choice) {
    const prevState = engine.getState();
    const currentStageDef = scenarioConfig.stages.find(s => s.id === prevState.stage) || {};
    const decisionId = currentStageDef.decision_id || (prevState.stage === 'S2_HELP' ? 'D2' : null);

    // Telemetry log choice
    if (telemetry && decisionId) {
      const attempt = (prevState.attempts_by_decision[decisionId] || 0) + 1;
      const hasSupport = prevState.support_by_decision[decisionId] === true;
      telemetry.logEvent({
        event_id: 'choice-' + decisionId + '-' + attempt + '-' + Date.now(),
        type: 'choice_selected',
        decision_id: decisionId,
        stage: prevState.stage,
        payload: {
          choice_id: choice.id,
          attempt,
          support_before_choice: hasSupport ? 'hint' : 'none'
        }
      });
    }

    if (choice.id === 'open_minh_chat') {
      openMinhChatModal();
      return;
    }

    const res = engine.dispatch({ type: 'CHOOSE', choice_id: choice.id });

    if (res.movement === 'blocked') {
      playAlertSound();
      renderDialogue('Cô Hương', res.feedback || 'Khu vực đó nguy hiểm. Chúng ta cần ở cùng nhóm và tuân theo hướng dẫn!');
      return;
    }

    if (choice.id === 'need_help_describing' || choice.id === 'unsure' || res.next_stage === 'S2_HELP') {
      openS2HelpModal();
      return;
    }

    renderCurrentState();
  }

  // Open S2_HELP modal with picture cards
  function openS2HelpModal() {
    if (!els.helpModal || !els.helpPictures) return;
    els.helpPictures.innerHTML = '';

    const cues = [
      { id: 'ground_crack', label: 'Vệt nứt đất ngoài hàng rào', img: 'assets/sau-con-mua/cues/cue_crack.webp' },
      { id: 'tilted_tree', label: 'Cây ven sườn dốc bị nghiêng', img: 'assets/sau-con-mua/cues/cue_tree.webp' },
      { id: 'muddy_stream', label: 'Dòng nước suối đỏ quánh phù sa', img: 'assets/sau-con-mua/cues/cue_stream.webp' }
    ];

    cues.forEach(cue => {
      const card = document.createElement('div');
      card.className = 'cue-card';
      card.innerHTML = `
        <img src="${cue.img}" alt="${cue.label}">
        <span>${cue.label}</span>
      `;
      card.onclick = () => {
        playClickSound();
        if (telemetry) {
          telemetry.logEvent({
            event_id: 's2-help-cue-' + cue.id + '-' + Date.now(),
            type: 'choice_selected',
            decision_id: 'D2',
            stage: 'S2_HELP',
            payload: { choice_id: cue.id, attempt: 2, support_before_choice: 'hint' }
          });
        }
        engine.dispatch({ type: 'CHOOSE', choice_id: cue.id });
        els.helpModal.classList.add('hidden');
        renderCurrentState();
      };
      els.helpPictures.appendChild(card);
    });

    els.btnHelpUnsure.onclick = () => {
      playClickSound();
      if (telemetry) {
        telemetry.logEvent({
          event_id: 's2-help-unsure-' + Date.now(),
          type: 'choice_selected',
          decision_id: 'D2',
          stage: 'S2_HELP',
          payload: { choice_id: 'still_unsure', attempt: 2, support_before_choice: 'hint' }
        });
      }
      engine.dispatch({ type: 'CHOOSE', choice_id: 'still_unsure' });
      els.helpModal.classList.add('hidden');
      renderCurrentState();
    };

    els.helpModal.classList.remove('hidden');
  }

  // Open Minh Chat Modal (D3)
  function openMinhChatModal() {
    if (!els.minhModal) return;
    minhChatTurns = 0;
    if (els.minhChatLog) {
      els.minhChatLog.innerHTML = `
        <div class="chat-msg npc-msg"><strong>Minh:</strong> Tớ để quên bức tranh ở chỗ cũ rồi. Tớ muốn quay lại lấy quá...</div>
      `;
    }
    if (els.minhInput) {
      els.minhInput.disabled = false;
      els.minhInput.value = '';
    }
    if (els.btnSendMinh) els.btnSendMinh.disabled = false;

    els.btnSkipChat.onclick = () => {
      playClickSound();
      engine.dispatch({ type: 'CHOOSE', choice_id: 'continue_with_teacher' });
      els.minhModal.classList.add('hidden');
      renderCurrentState();
    };

    els.btnSendMinh.onclick = sendMinhMessage;
    els.minhInput.onkeydown = (e) => {
      if (e.key === 'Enter') sendMinhMessage();
    };

    els.minhModal.classList.remove('hidden');
  }

  async function sendMinhMessage() {
    if (!els.minhInput) return;
    const text = els.minhInput.value.trim();
    if (!text) return;

    // Append Player msg
    const playerMsgDiv = document.createElement('div');
    playerMsgDiv.className = 'chat-msg player-msg';
    playerMsgDiv.innerHTML = `<strong>Em:</strong> ${text}`;
    els.minhChatLog.appendChild(playerMsgDiv);
    els.minhInput.value = '';

    minhChatTurns++;
    playClickSound();

    let replyText = 'Ừ, tớ sẽ đi cùng cô và các bạn.';
    try {
      const state = engine.getState();
      const res = await fetch('/api/sau-con-mua/npc-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: 'chat-' + Date.now(),
          stage_revision: state.stage_revision,
          player_text: text
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply_text) replyText = data.reply_text;
      }
    } catch (_) {}

    const npcMsgDiv = document.createElement('div');
    npcMsgDiv.className = 'chat-msg npc-msg';
    npcMsgDiv.innerHTML = `<strong>Minh:</strong> ${replyText}`;
    els.minhChatLog.appendChild(npcMsgDiv);
    els.minhChatLog.scrollTop = els.minhChatLog.scrollHeight;

    if (minhChatTurns >= 2) {
      els.minhInput.disabled = true;
      els.btnSendMinh.disabled = true;
      const alertDiv = document.createElement('div');
      alertDiv.className = 'chat-msg notice-msg';
      alertDiv.innerHTML = `<em>Minh đã lắng nghe em và đồng ý sơ tán. Hãy bấm "Đi cùng cô ngay"!</em>`;
      els.minhChatLog.appendChild(alertDiv);
      els.minhChatLog.scrollTop = els.minhChatLog.scrollHeight;
    }
  }

  // Open S5 Recap Modal & Quiz
  function startRecapScreen() {
    if (!els.recapContainer) return;
    currentRecapIndex = 0;
    els.recapContainer.classList.remove('hidden');
    if (els.cardsResult) els.cardsResult.classList.add('hidden');
    if (els.recapFooter) els.recapFooter.classList.add('hidden');
    renderRecapQuestion();
  }

  function renderRecapQuestion() {
    if (!scenarioConfig.recap || currentRecapIndex >= scenarioConfig.recap.length) {
      finishRecap();
      return;
    }

    const r = scenarioConfig.recap[currentRecapIndex];
    els.recapQuiz.innerHTML = `
      <div class="recap-question">
        <span class="q-tag">Câu hỏi ôn tập ${currentRecapIndex + 1}/${scenarioConfig.recap.length}</span>
        <p class="q-title">${r.question}</p>
        <div class="q-choices" id="recap-choices-box"></div>
      </div>
    `;

    const box = document.getElementById('recap-choices-box');
    (r.choices || []).forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label;
      btn.onclick = () => {
        playClickSound();
        engine.dispatch({ type: 'RECAP_ANSWER', recap_id: r.id, recap_choice_id: choice.id });
        currentRecapIndex++;
        renderRecapQuestion();
      };
      box.appendChild(btn);
    });
  }

  function finishRecap() {
    els.recapQuiz.innerHTML = `<h3 class="congrats-text">🎉 Chúc mừng em đã hoàn thành xuất sắc đợt diễn tập sơ tán an toàn!</h3>`;
    if (telemetry) {
      telemetry.logEvent({
        event_id: 'session-finish-' + Date.now(),
        type: 'session_completed',
        payload: {}
      });
    }

    const rubric = (telemetry && window.evaluateRubric) 
      ? window.evaluateRubric(telemetry.getEvents()) 
      : { totalScore: 8, childCards: { tell_adult: true, safety_first: true, stay_with_group: true } };

    if (els.cardsResult) {
      els.cardsResult.classList.remove('hidden');
      if (els.cardReport) els.cardReport.style.opacity = rubric.childCards.tell_adult ? '1' : '0.5';
      if (els.cardSafety) els.cardSafety.style.opacity = rubric.childCards.safety_first ? '1' : '0.5';
      if (els.cardGroup) els.cardGroup.style.opacity = rubric.childCards.stay_with_group ? '1' : '0.5';
    }

    if (els.recapFooter) {
      els.recapFooter.classList.remove('hidden');
    }

    if (els.btnReplay) {
      els.btnReplay.onclick = () => {
        playClickSound();
        engine.dispatch({ type: 'REPLAY' });
        els.recapContainer.classList.add('hidden');
        renderCurrentState();
      };
    }
  }

  // Open Cue Zoom Modal
  function showCueZoom(title, imgUrl, desc, cueId) {
    if (!els.cueModal) return;
    els.cueTitle.textContent = title;
    els.cueImg.src = imgUrl;
    els.cueDesc.textContent = desc;
    els.cueModal.classList.remove('hidden');

    if (engine && cueId) {
      engine.dispatch({ type: 'VIEW_CUE', cue_id: cueId });
      if (telemetry) {
        telemetry.logEvent({
          event_id: 'view-cue-' + cueId + '-' + Date.now(),
          type: 'cue_viewed',
          cue_id: cueId,
          stage: engine.getState().stage
        });
      }
    }
  }

  function setupHotspots() {
    if (els.hotspotCrack) {
      els.hotspotCrack.onclick = () => {
        playClickSound();
        showCueZoom(
          'Vết nứt trên lối đất ngoài hàng rào',
          'assets/sau-con-mua/cues/cue_crack.webp',
          'Mặt đất ẩm ướt xuất hiện các vết nứt nẻ kéo dài. Đây là dấu hiệu cảnh báo đất ngậm no nước và có nguy cơ sạt trượt!',
          'ground_crack'
        );
      };
    }

    if (els.hotspotTree) {
      els.hotspotTree.onclick = () => {
        playClickSound();
        showCueZoom(
          'Cây ven sườn dốc bị nghiêng bất thường',
          'assets/sau-con-mua/cues/cue_tree.webp',
          'Thân cây trên sườn đất bị nghiêng ngả do lớp đất bên dưới bị xê dịch. Cần tránh xa sườn dốc ngay!',
          'tilted_tree'
        );
      };
    }

    if (els.hotspotStream) {
      els.hotspotStream.onclick = () => {
        playClickSound();
        showCueZoom(
          'Dòng suối đỏ đục ngầu cuộn xiết',
          'assets/sau-con-mua/cues/cue_stream.webp',
          'Nước suối đổi màu đục ngầu đỏ quánh bùn đất và cuộn sóng mạnh. Đây là tín hiệu lũ bùn đá hoặc sạt lở từ thượng nguồn đang tràn xuống!',
          'muddy_stream'
        );
      };
    }

    if (els.btnCloseCue) {
      els.btnCloseCue.onclick = () => {
        playClickSound();
        els.cueModal.classList.add('hidden');
      };
    }
  }

  function setupHeaderControls() {
    if (els.btnSound) {
      els.btnSound.onclick = () => {
        soundEnabled = !soundEnabled;
        els.btnSound.textContent = soundEnabled ? '🔊 Âm thanh: Bật' : '🔇 Âm thanh: Tắt';
      };
    }

    if (els.btnRepeat) {
      els.btnRepeat.onclick = () => {
        playClickSound();
        if (els.speechText) {
          els.speechText.style.animation = 'none';
          void els.speechText.offsetWidth;
          els.speechText.style.animation = 'speechPulse 0.5s ease';
        }
      };
    }

    if (els.btnHelp) {
      els.btnHelp.onclick = () => {
        playClickSound();
        const state = engine.getState();
        if (state.stage === 'S1') {
          renderDialogue('Cô Hương', 'Cô đang ở đây cùng các em. Nếu thấy đất nứt hay điều gì bất thường ngoài hàng rào, em hãy nói ngay cho cô biết nhé!');
        } else if (state.stage === 'S2') {
          openS2HelpModal();
        } else if (state.stage === 'S3') {
          renderDialogue('Cô Hương', 'Đồ vật có thể tìm lại sau, an toàn của các em là trên hết. Hãy cùng cô nhắc bạn Minh đi theo đoàn nhé!');
        } else if (state.stage === 'S4') {
          renderDialogue('Cô Hương', 'Em hãy đi theo lối mòn chính cô chỉ dẫn, tránh các lối tắt ven mép dốc đã bị đóng nhé!');
        }
      };
    }
  }

  // Render the current state based on Engine
  function renderCurrentState() {
    resetIdleTimer();
    const state = engine.getState();
    const stageId = state.stage;

    if (telemetry) {
      telemetry.logEvent({
        event_id: 'enter-' + stageId + '-' + state.stage_revision,
        type: 'stage_entered',
        stage: stageId
      });
    }

    if (stageId === 'S0') {
      setView('school');
      renderDialogue('Giới thiệu', 'Mưa lớn đã kéo dài nhiều giờ. Bạn An và bạn Minh đang đứng đợi cùng cô giáo Hương.');
      renderChoices([
        { id: 'start_game', label: 'Bắt đầu câu chuyện →' }
      ]);
      const btn = els.choiceButtons.querySelector('.choice-btn');
      if (btn) {
        btn.onclick = () => {
          playClickSound();
          engine.dispatch({ type: 'START' });
          renderCurrentState();
        };
      }
      return;
    }

    if (stageId === 'S1') {
      setView('school');
      renderDialogue('Cô Hương', 'Mưa đã kéo dài. Các em ở cùng cô nhé. Có điều gì làm em lo, hãy nói với cô!');
      renderChoices([
        { id: 'report_teacher', label: 'Báo cô Hương' },
        { id: 'approach_cue', label: 'Đi gần hơn để xem' },
        { id: 'wait_for_friend', label: 'Chờ bạn xem trước' }
      ]);
      return;
    }

    if (stageId === 'S2') {
      setView('school');
      renderDialogue('Cô Hương', 'Em thấy điều gì, ở đâu?');
      renderChoices([
        { id: 'describe_crack', label: 'Có vệt nứt trên lối đất ngoài hàng rào.' },
        { id: 'need_help_describing', label: 'Em chưa biết nói thế nào.' },
        { id: 'unsure', label: 'Em không chắc.' }
      ]);
      return;
    }

    if (stageId === 'S2_HELP') {
      setView('school');
      openS2HelpModal();
      return;
    }

    if (stageId === 'S3') {
      setView('route');
      renderDialogue('Bạn Minh', 'Tớ để quên bức tranh ở chỗ cũ. Tớ muốn quay lại lấy.');
      renderChoices([
        { id: 'continue_with_teacher', label: 'Mình đi cùng cô trước nhé' },
        { id: 'ask_teacher', label: 'Nhờ cô giúp Minh' },
        { id: 'return_for_drawing', label: 'Cùng Minh quay lại' },
        { id: 'open_minh_chat', label: '💬 Nhắn tin khuyên Minh' }
      ]);
      return;
    }

    if (stageId === 'S4') {
      setView('route');
      renderDialogue('Cô Hương', 'Cô vừa nhận hướng dẫn. Các em chú ý di chuyển theo lối an toàn cô chỉ dẫn nhé.');
      renderChoices([
        { id: 'guided_route', label: 'Đi theo lối cô chỉ' },
        { id: 'closed_shortcut', label: 'Chọn lối tắt đã đóng' }
      ]);
      return;
    }

    if (stageId === 'S5' || stageId === 'END') {
      setView('assembly');
      renderDialogue('Cô Hương', 'Cả nhóm đã đến điểm tập kết an toàn trên đỉnh đồi. Các em tiếp tục ở cùng cô nhé!');
      renderChoices([
        { id: 'open_recap', label: 'Ôn tập kiến thức & Xem thành tích ⭐' }
      ]);
      const btn = els.choiceButtons.querySelector('.choice-btn');
      if (btn) {
        btn.onclick = () => {
          playClickSound();
          startRecapScreen();
        };
      }
      return;
    }
  }

  async function init() {
    initElements();
    setupHotspots();
    setupHeaderControls();

    // Load Scenario Config
    try {
      let res = await fetch('data/sau-con-mua/scenario.json');
      if (!res.ok) res = await fetch('/plan/sau-con-mua/content/scenario.json');
      scenarioConfig = await res.json();
    } catch (_) {
      // Fallback if running from custom file scheme
      scenarioConfig = window.__SCENARIO_CONFIG__ || {};
    }

    if (window.SauConMuaLoader && scenarioConfig.id) {
      scenarioConfig = window.SauConMuaLoader.loadAndValidateScenario(scenarioConfig);
    }

    if (window.SauConMuaEngine && scenarioConfig.stages) {
      engine = new window.SauConMuaEngine(scenarioConfig);
    }

    if (window.TelemetryLogger) {
      telemetry = new window.TelemetryLogger('session-' + Date.now());
    }

    renderCurrentState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
