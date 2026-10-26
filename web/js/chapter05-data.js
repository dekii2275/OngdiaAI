(function (root) {
  'use strict';

  const clue = (id, label, x, y, speaker, text) => ({ id, label, x, y, speaker, text, type: 'clue' });
  const exit = (id, label, to, x, y, sub = '') => ({ id, label, to, x, y, sub, type: 'exit' });

  const scenes = {
    summit_gate: {
      name: 'Cổng điểm tập kết an toàn đỉnh đồi',
      art: 'summit_gate',
      position: 'left center',
      links: ['command_post'],
      spots: [
        clue('national_flag', 'Lá cờ đỏ sao vàng', 30, 48, 'Bạn', 'Lá cờ trên cổng nhà văn hóa đồi cao đang bay trong gió. Mưa đã ngớt dần thành hạt phùn nhẹ.'),
        clue('assembly_sign', 'Biển điểm sơ tán an toàn', 55, 62, 'Duyên', 'Đây rồi! Biển ghi rõ: ĐIỂM TẬP KẾT AN TOÀN SỐ 1 - CAO ĐỘ +180M. Chúng ta đã lên tới nơi an toàn nhất!'),
        { id: 'puzzle-summit_gate', label: 'Báo danh qua cổng', x: 70, y: 56, type: 'puzzle', puzzle: 'summit_gate' },
        { id: 'gate-march', label: 'Dẫn đoàn qua Cổng', x: 78, y: 44, type: 'gate_march', sub: 'WASD 5 thành viên' },
        exit('to-command_post', 'Vào trạm chỉ huy', 'command_post', 88, 70, 'Gặp bác Minh Anh')
      ]
    },
    command_post: {
      name: 'Trạm chỉ huy của Trưởng làng',
      art: 'command_post',
      position: 'center center',
      links: ['summit_gate', 'safe_hall'],
      spots: [
        clue('minh_anh_desk', 'Bàn làm việc Trưởng làng', 32, 58, 'Minh Anh', 'Hoan hô cô trò và chú Mạnh! Đoàn 5 người đều an toàn đầy đủ, không thiếu một ai!'),
        clue('warm_blankets', 'Khăn ấm và trà gừng', 54, 66, 'Thảo', 'Các em hãy quấn khăn ấm và uống ngụm trà gừng nóng cho lại sức.'),
        clue('minh_smile', 'Nụ cười rạng rỡ của Minh', 72, 60, 'Minh', 'Bác Minh Anh nói khi lũ rút đội xung kích sẽ tìm tranh cho mình. Còn người là còn tất cả!'),
        { id: 'puzzle-command_post', label: 'Bàn giao thực địa', x: 74, y: 55, type: 'puzzle', puzzle: 'command_post' },
        { id: 'incident-dispatch', label: 'Bức điện cứu nạn Huyện', x: 80, y: 40, type: 'incident_dispatch', sub: 'Điện tín tác chiến' },
        exit('to-safe_hall', 'Vào hội trường an toàn', 'safe_hall', 88, 72, 'Tổng kết hành trình'),
        exit('back-summit_gate', 'Trở lại cổng', 'summit_gate', 12, 85)
      ]
    },
    safe_hall: {
      name: 'Hội trường Nhà văn hóa thôn',
      art: 'safe_hall',
      position: 'right center',
      links: ['command_post'],
      spots: [
        clue('warm_stove', 'Bếp lửa hồng ấm áp', 30, 65, 'Duyên', 'Ấm áp quá! Bên ngoài mưa bão dữ dội, nhưng trong này mọi người đều an toàn và đoàn kết.'),
        clue('radio_report', 'Bản tin truyền thanh thôn', 52, 50, 'Minh Anh', 'Loa phát thanh: Lũ quét và sạt lở trên diện rộng đã được kiểm soát. Toàn bộ học sinh đã an toàn!'),
        { id: 'medical-triage', label: 'Cấp cứu 3 ca sau bão', x: 62, y: 52, type: 'medical_triage', sub: 'Hội Chữ thập đỏ' },
        { id: 'puzzle-safe_hall', label: 'Trắc nghiệm tổng hợp 5 chương', x: 75, y: 60, type: 'puzzle', puzzle: 'safe_hall' },
        { id: 'cert-award', label: 'Nhận Chứng Chỉ An Toàn', x: 86, y: 76, type: 'cert_award', sub: 'Khảo hạch tốt nghiệp' },
        exit('back-command_post', 'Trở lại bàn chỉ huy', 'command_post', 12, 85)
      ]
    }
  };

  const required = {
    summit_gate: ['national_flag', 'assembly_sign'],
    command_post: ['minh_anh_desk', 'warm_blankets', 'minh_smile'],
    safe_hall: ['warm_stove', 'radio_report']
  };

  function initial() {
    return {
      version: 5,
      scene: 'summit_gate',
      clues: [],
      visited: ['summit_gate'],
      solved: [],
      complete: false,
      started: false,
      position: { x: 20, y: 85 }
    };
  }

  function canTravel(s, to) {
    if (!scenes[s.scene] || !scenes[s.scene].links.includes(to)) return false;
    if (s.scene === 'summit_gate' && to === 'command_post') {
      return s.solved.includes('summit_gate') || s.solved.includes('gate_march');
    }
    if (s.scene === 'command_post' && to === 'safe_hall') {
      return s.solved.includes('command_post') || s.solved.includes('incident_dispatch');
    }
    return true;
  }

  function restore(raw) {
    if (!raw || !scenes[raw.scene]) return initial();
    const s = initial();
    s.scene = raw.scene;
    s.clues = Array.isArray(raw.clues) ? [...new Set(raw.clues)] : [];
    s.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited)] : ['summit_gate'];
    s.solved = Array.isArray(raw.solved) ? [...new Set(raw.solved)] : [];
    s.complete = raw.complete === true;
    s.started = raw.started === true;
    if (raw.position && Number.isFinite(raw.position.x) && Number.isFinite(raw.position.y)) {
      s.position = { x: raw.position.x, y: raw.position.y };
    }
    return s;
  }

  const data = { scenes, required, initial, canTravel, restore };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.Chapter05 = data;
})(typeof window === 'object' ? window : globalThis);
