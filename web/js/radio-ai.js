// Emergency Rescue AI Walkie-Talkie Frontend Module
(function (global) {
  'use strict';

  const CHANNELS = {
    minh_anh: { id: 'minh_anh', label: 'Kênh 1: Minh Anh', role: 'Trưởng làng' },
    manh: { id: 'manh', label: 'Kênh 2: Bác Mạnh', role: 'Dân phòng' },
    thao: { id: 'thao', label: 'Kênh 3: Cô Thảo', role: 'Cô giáo' },
    minh: { id: 'minh', label: 'Kênh 4: Bạn Minh', role: 'Bạn học' }
  };

  const state = {
    isOpen: false,
    currentChannel: 'minh_anh',
    chapter: 3,
    scene: 'ridge_entry',
    playerName: 'Bạn',
    history: {
      minh_anh: [
        { type: 'system', text: '--- BỘ ĐÀM CỨU HỘ VÔ TUYẾN 142.5 MHz ---' },
        { type: 'responder', speaker: 'Trưởng làng Minh Anh', text: 'Bác Minh Anh đây! Các cháu có nghe rõ không? Báo cáo vị trí ngay!' }
      ],
      manh: [
        { type: 'system', text: '--- KÊNH TIỀN TRẠM DÂN PHÒNG ---' },
        { type: 'responder', speaker: 'Bác Mạnh', text: 'Bác Mạnh đang dò đường phía trước, quan sát kỹ bùn và đá lăn nhé!' }
      ],
      thao: [
        { type: 'system', text: '--- KÊNH GIÁO VIÊN BẢO VỆ ĐOÀN ---' },
        { type: 'responder', speaker: 'Cô Thảo', text: 'Cô Thảo đây các em. Luôn bám sát hàng ngũ, bình tĩnh nhé!' }
      ],
      minh: [
        { type: 'system', text: '--- KÊNH KHẨN CẤP XÓM DƯỚI ---' },
        { type: 'responder', speaker: 'Bạn Minh', text: 'Ai đó cứu mình với... bùn đang ngập sân nhà mình rồi...' }
      ]
    }
  };

  function playRadioBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (_) {}
  }

  function createRadioDOM() {
    if (typeof document === 'undefined') return null;
    let modal = document.getElementById('radio-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'radio-modal';
    modal.className = 'radio-modal';
    modal.innerHTML = `
      <div class="radio-chassis">
        <div class="radio-topbar">
          <div class="radio-brand">
            <span class="radio-antenna-icon">📶</span>
            <span class="radio-model-title">BỘ ĐÀM CỨU HỘ AI</span>
            <span class="radio-led-online"><span class="radio-led-indicator"></span>AI ONLINE</span>
          </div>
          <button class="radio-close-btn" id="radio-close-btn" title="Đóng bộ đàm (Phím R)">×</button>
        </div>

        <div class="radio-channels" id="radio-channel-bar">
          <button class="radio-channel-btn active" data-channel="minh_anh">1. Bác Minh Anh</button>
          <button class="radio-channel-btn" data-channel="manh">2. Bác Mạnh</button>
          <button class="radio-channel-btn" data-channel="thao">3. Cô Thảo</button>
        </div>

        <div class="radio-screen" id="radio-screen"></div>

        <div class="radio-input-box">
          <input type="text" id="radio-input" class="radio-chat-input" placeholder="Gõ báo cáo / hỏi đáp..." maxlength="200" autocomplete="off" />
          <button type="button" id="radio-send-btn" class="radio-send-btn">PHÁT 🎙️</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('radio-close-btn').addEventListener('click', toggleRadio);
    document.getElementById('radio-send-btn').addEventListener('click', () => {
      const input = document.getElementById('radio-input');
      const text = input.value.trim();
      if (text) {
        sendMessage(text);
        input.value = '';
      }
    });

    document.getElementById('radio-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text) {
          sendMessage(text);
          e.target.value = '';
        }
      }
    });

    const channelButtons = modal.querySelectorAll('.radio-channel-btn');
    channelButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const ch = btn.getAttribute('data-channel');
        setChannel(ch);
      });
    });

    renderScreen();
    return modal;
  }

  function renderScreen() {
    if (typeof document === 'undefined') return;
    const screen = document.getElementById('radio-screen');
    if (!screen) return;

    const msgs = state.history[state.currentChannel] || [];
    screen.innerHTML = msgs.map((m) => {
      if (m.type === 'system') {
        return `<div class="radio-msg-row radio-msg-system">${m.text}</div>`;
      }
      if (m.type === 'player') {
        return `<div class="radio-msg-row radio-msg-player"><strong>${state.playerName} (Bạn):</strong> ${m.text}</div>`;
      }
      return `<div class="radio-msg-row radio-msg-responder"><strong>${m.speaker}:</strong> ${m.text}</div>`;
    }).join('');

    screen.scrollTop = screen.scrollHeight;
  }

  function setChannel(ch) {
    if (!CHANNELS[ch]) return;
    state.currentChannel = ch;

    if (typeof document !== 'undefined') {
      const buttons = document.querySelectorAll('.radio-channel-btn');
      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-channel') === ch);
      });
      renderScreen();
    }
  }

  function toggleRadio() {
    state.isOpen = !state.isOpen;
    if (typeof document !== 'undefined') {
      let modal = document.getElementById('radio-modal');
      if (!modal) modal = createRadioDOM();
      modal.classList.toggle('open', state.isOpen);
      if (state.isOpen) {
        playRadioBeep();
        const input = document.getElementById('radio-input');
        if (input) setTimeout(() => input.focus(), 100);
      }
    }
    return state.isOpen;
  }

  function openRadio(channel) {
    if (channel) setChannel(channel);
    state.isOpen = true;
    if (typeof document !== 'undefined') {
      let modal = document.getElementById('radio-modal');
      if (!modal) modal = createRadioDOM();
      modal.classList.add('open');
      playRadioBeep();
      const input = document.getElementById('radio-input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }

  function closeRadio() {
    state.isOpen = false;
    if (typeof document !== 'undefined') {
      const modal = document.getElementById('radio-modal');
      if (modal) modal.classList.remove('open');
    }
  }

  async function sendMessage(text) {
    if (!text || !text.trim()) return null;
    const msg = text.trim();

    if (!state.history[state.currentChannel]) {
      state.history[state.currentChannel] = [];
    }
    state.history[state.currentChannel].push({ type: 'player', text: msg });
    renderScreen();
    playRadioBeep();

    const sendBtn = typeof document !== 'undefined' ? document.getElementById('radio-send-btn') : null;
    if (sendBtn) sendBtn.disabled = true;

    try {
      const res = await fetch('/api/radio/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: state.currentChannel,
          playerName: state.playerName,
          message: msg,
          chapter: state.chapter,
          scene: state.scene
        })
      });

      if (!res.ok) throw new Error('Radio response error ' + res.status);
      const data = await res.json();

      state.history[state.currentChannel].push({
        type: 'responder',
        speaker: data.speaker_name || 'Người cứu hộ',
        text: data.reply_text || 'Nghe rõ, hãy tiếp tục di chuyển an toàn!'
      });
      playRadioBeep();
      renderScreen();
      return data;
    } catch (e) {
      console.warn('Radio send failed:', e);
      state.history[state.currentChannel].push({
        type: 'responder',
        speaker: 'Bộ đàm',
        text: '... [Tín hiệu chập chờn] Hãy bám sát sống đồi cao và di chuyển cùng nhau!'
      });
      renderScreen();
      return null;
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function setupGlobalShortcut() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', (e) => {
      // If typing in an input or textarea, don't trigger toggle
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        toggleRadio();
      }
    });
  }

  function initRadioAI(options = {}) {
    if (options.chapter) state.chapter = options.chapter;
    if (options.scene) state.scene = options.scene;
    if (options.playerName) state.playerName = options.playerName;
    if (options.currentChannel) setChannel(options.currentChannel);

    if (typeof document !== 'undefined') {
      createRadioDOM();
      setupGlobalShortcut();
    }
    return RadioAI;
  }

  const RadioAI = {
    initRadioAI,
    toggleRadio,
    openRadio,
    closeRadio,
    setChannel,
    sendMessage,
    getState: () => ({ ...state }),
    setScene: (scene) => { state.scene = scene; },
    setChapter: (chapter) => { state.chapter = chapter; }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = RadioAI;
  }
  global.RadioAI = RadioAI;
})(typeof window !== 'undefined' ? window : globalThis);
