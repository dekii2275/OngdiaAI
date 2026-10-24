(() => {
  'use strict';
  let adapter, pending = false, history = [], returnFocus;
  const dialog = document.createElement('dialog');
  dialog.id = 'thao-chat';
  dialog.setAttribute('aria-labelledby', 'thao-chat-title');
  dialog.innerHTML = `<header class="thao-heading"><img src="assets/characters/thao/portrait.png" alt=""><div><small>GIÁO VIÊN · CỐ VẤN THIÊN TAI AI</small><h2 id="thao-chat-title">Hỏi cô Thảo</h2></div><button type="button" class="thao-close" aria-label="Đóng trò chuyện">×</button></header>
    <p class="thao-note">Cùng cô tìm hiểu bão lũ và cách ứng phó. Cô không có bản tin thời tiết trực tiếp. Nếu nguy hiểm ngoài đời, hãy báo người lớn hoặc cứu hộ địa phương.</p>
    <div class="thao-messages" role="log" aria-label="Trò chuyện với cô Thảo" aria-live="polite"></div>
    <div class="thao-suggestions"><button type="button">Em nên chuẩn bị gì khi sơ tán?</button><button type="button">Nước ngập đường, em có nên đi qua?</button></div>
    <form class="thao-form"><label for="thao-question">Câu hỏi của em</label><textarea id="thao-question" rows="2" maxlength="1200" required placeholder="Cô ơi, nếu gặp bão lũ thì…"></textarea><div><span class="thao-status" role="status"></span><button type="submit">Gửi cô Thảo →</button><button type="button" class="thao-reset">Hỏi chuyện mới</button></div></form>`;
  document.body.append(dialog);
  const log = dialog.querySelector('.thao-messages'), form = dialog.querySelector('form'), input = dialog.querySelector('textarea'), status = dialog.querySelector('.thao-status');
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'thao-launch'; button.textContent = 'Hỏi cô Thảo';
  button.setAttribute('aria-haspopup', 'dialog');
  document.querySelector('header .tools, main > header').append(button);
  function addText(who, text) {
    const article = document.createElement('article'); article.className = who === 'Em' ? 'thao-message thao-user' : 'thao-message';
    const label = document.createElement('strong'); label.textContent = who;
    const p = document.createElement('p'); p.textContent = text;
    article.append(label, p); log.append(article); log.scrollTop = log.scrollHeight;
    return article;
  }
  function welcome() { addText('Cô Thảo', 'Cô đang nghe đây. Em muốn hỏi về bão, lũ, sạt lở, giông sét hay cách sơ tán cùng nhóm?'); }
  welcome();
  function open() {
    if (dialog.open) return;
    returnFocus = document.activeElement; adapter?.pause?.(); dialog.showModal(); input.focus();
  }
  button.onclick = open;
  dialog.querySelector('.thao-close').onclick = () => dialog.close();
  dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dialog.close(); } });
  dialog.addEventListener('close', () => returnFocus?.focus());
  dialog.querySelectorAll('.thao-suggestions button').forEach(b => b.onclick = () => { if (!pending) { input.value = b.textContent; input.focus(); } });
  dialog.querySelector('.thao-reset').onclick = () => { if (pending) return; history = []; log.replaceChildren(); welcome(); input.value = ''; status.textContent = ''; input.focus(); };
  function renderAnswer(answer) {
    const label = { normal: 'Tìm hiểu', caution: 'Cần thận trọng', emergency: 'Ưu tiên an toàn ngay' }[answer.urgency];
    const article = addText('Cô Thảo · ' + label, answer.answer);
    article.dataset.urgency = answer.urgency;
    for (const [key, title] of [['actions', 'Em nên làm'], ['avoid', 'Em cần tránh']]) {
      if (!answer[key].length) continue;
      const heading = document.createElement('h3'); heading.textContent = title;
      const list = document.createElement(key === 'actions' ? 'ol' : 'ul');
      answer[key].forEach(text => { const li = document.createElement('li'); li.textContent = text; list.append(li); });
      article.append(heading, list);
    }
    if (answer.follow_up) { const p = document.createElement('p'); p.textContent = answer.follow_up; article.append(p); }
    log.scrollTop = log.scrollHeight;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); const message = input.value.trim();
    if (pending || !message) return;
    if (location.protocol === 'file:') { status.textContent = 'Em cần chạy npm start và mở http://localhost:4173 để hỏi cô.'; return; }
    pending = true; form.querySelector('[type=submit]').disabled = true; input.disabled = true;
    dialog.querySelector('.thao-reset').disabled = true;
    addText('Em', message); status.textContent = 'Cô đang suy nghĩ…'; log.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/thao/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, context: adapter?.context?.() || {}, history }), signal: AbortSignal.timeout(30000) });
      const answer = await response.json();
      if (!response.ok) throw new Error(answer.error || 'Cô chưa kết nối được. Em thử lại nhé.');
      renderAnswer(answer);
      history.push({ role: 'user', text: message }, { role: 'assistant', text: JSON.stringify({ answer: answer.answer, actions: answer.actions, avoid: answer.avoid, follow_up: answer.follow_up }) });
      history = history.slice(-6); input.value = ''; status.textContent = '';
    } catch (error) {
      addText('Chưa nhận được câu trả lời', error.name === 'TimeoutError' ? 'Kết nối quá lâu. Em thử gửi lại nhé.' : error.message);
      status.textContent = 'Câu hỏi vẫn được giữ để em gửi lại.';
    } finally {
      pending = false; form.querySelector('[type=submit]').disabled = false; input.disabled = false;
      dialog.querySelector('.thao-reset').disabled = false; log.setAttribute('aria-busy', 'false');
      if (dialog.open) input.focus();
    }
  });
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); form.requestSubmit(); } });
  window.ThaoAdvisor = { init(value) { adapter = value; }, isOpen: () => dialog.open, open };
})();
