(function (root) {
  'use strict';

  const clue = (id, label, x, y, speaker, text) => ({ id, label, x, y, speaker, text, type: 'clue' });
  const exit = (id, label, to, x, y, sub = '') => ({ id, label, to, x, y, sub, type: 'exit' });

  const scenes = {
    ridge_entry: {
      name: 'Dốc đá mở đầu sườn đồi',
      art: 'ridge_entry',
      position: 'left center',
      links: ['crack_zone'],
      spots: [
        clue('rain_surge', 'Mưa xối xả trên sườn', 25, 60, 'Bạn', 'Mưa mỗi lúc một nặng hạt, rãnh thoát nước tự nhiên bên đường đã bắt đầu quá tải.'),
        clue('pebble_slide', 'Đá dăm lăn lạo xạo', 52, 68, 'Mạnh', 'Có tiếng lạo xạo dưới chân, lớp đất mặt bắt đầu trượt. Đi sát tim đường, bước dứt khoát!'),
        { id: 'puzzle-ridge_entry', label: 'Bật bộ đàm báo cáo', x: 74, y: 55, type: 'puzzle', puzzle: 'ridge_entry' },
        exit('to-crack_zone', 'Tiến vào Vùng Nứt Đất', 'crack_zone', 86, 70, 'Đi cùng nhóm')
      ]
    },
    crack_zone: {
      name: 'Vết nứt sườn dốc',
      art: 'crack_zone',
      position: 'center center',
      links: ['ridge_entry', 'mudflow_bend'],
      spots: [
        clue('crack_depth', 'Vết nứt hình vòng cung', 28, 65, 'Bạn', 'Vết nứt dài hơn chục mét, cắt ngang bờ dốc. Miệng nứt đang mở rộng dần.'),
        clue('tilted_bamboo', 'Bụi tre nghiêng ngả', 50, 45, 'Duyên', 'Nhìn bụi tre kìa cô! Thân tre bị nghiêng hẳn về phía thung lũng, rễ bật cả lên mặt đất.'),
        clue('mud_seep', 'Nước đục sủi tăm', 70, 62, 'Thảo', 'Nước từ vách đất đùn ra mang theo bọt khí và bùn đặc. Đất đã ngấm no nước!'),
        { id: 'radio-crack', label: 'Báo cáo Trưởng làng (R)', x: 42, y: 78, type: 'radio_call' },
        { id: 'puzzle-crack_zone', label: 'Đánh giá nguy cơ taluy', x: 80, y: 60, type: 'puzzle', puzzle: 'crack_zone' },
        exit('to-mudflow_bend', 'Tới khúc cua suối bùn', 'mudflow_bend', 88, 75, 'Vòng qua vệt nứt'),
        exit('back-ridge_entry', 'Quay lại dốc đá', 'ridge_entry', 12, 85)
      ]
    },
    mudflow_bend: {
      name: 'Khúc cua suối bùn đỏ',
      art: 'mudflow_bend',
      position: 'center center',
      links: ['crack_zone', 'boulder_pass'],
      spots: [
        clue('turbid_water', 'Dòng bùn cuộn xoáy', 30, 66, 'Duyên', 'Nước suối đỏ quạch như gạch nung, có cả cành cây to bị cuốn trôi.'),
        clue('slope_culvert', 'Miệng cống bị nghẽn', 55, 52, 'Mạnh', 'Miệng cống bị rác và đá chèn kín, nước bắt đầu tràn ngược qua mặt đường!'),
        clue('sound_rumble', 'Rung chuyển trong đất', 72, 70, 'Bạn', 'Có tiếng ục ục rung nhẹ dưới chân. Lòng đất đang dịch chuyển.'),
        { id: 'puzzle-mudflow_bend', label: 'Nguyên tắc vượt nước tràn', x: 82, y: 58, type: 'puzzle', puzzle: 'mudflow_bend' },
        exit('to-boulder_pass', 'Tới hẻm đá sạt lở', 'boulder_pass', 88, 74, 'Cẩn thận bước chân'),
        exit('back-crack_zone', 'Quay lại vùng nứt', 'crack_zone', 12, 85)
      ]
    },
    boulder_pass: {
      name: 'Hẻm đá đá lở chắn ngang',
      art: 'boulder_pass',
      position: 'right center',
      links: ['mudflow_bend'],
      spots: [
        clue('blocked_path', 'Đá tảng chắn lối chính', 35, 62, 'Mạnh', 'Khối đá này nặng hàng tấn vừa rơi xuống chắn ngang đường chính. Không trèo qua đá trơn!'),
        clue('detour_ridge', 'Lối mòn sống đá', 65, 50, 'Thảo', 'Bác Minh Anh báo có lối mòn sống đá gốc cao hơn 15 mét, nền đá cứng vững chắc!'),
        { id: 'puzzle-boulder_pass', label: 'Quyết định rẽ đường vòng', x: 80, y: 68, type: 'puzzle', puzzle: 'boulder_pass' },
        { id: 'finish-ch03', to: 'chapter04', label: 'Tiến vào xóm bị chia cắt (Chương 04)', x: 88, y: 78, type: 'chapter_advance', sub: 'Chương 04 →' },
        exit('back-mudflow_bend', 'Quay lại khúc cua bùn', 'mudflow_bend', 12, 85)
      ]
    }
  };

  const required = {
    ridge_entry: ['rain_surge', 'pebble_slide'],
    crack_zone: ['crack_depth', 'tilted_bamboo', 'mud_seep'],
    mudflow_bend: ['turbid_water', 'slope_culvert', 'sound_rumble'],
    boulder_pass: ['blocked_path', 'detour_ridge']
  };

  function initial() {
    return {
      version: 3,
      scene: 'ridge_entry',
      clues: [],
      visited: ['ridge_entry'],
      solved: [],
      complete: false,
      started: false,
      position: { x: 20, y: 85 }
    };
  }

  function canTravel(s, to) {
    if (!scenes[s.scene] || !scenes[s.scene].links.includes(to)) return false;
    // Traveling forward requires the current scene puzzle to be solved
    if (s.scene === 'ridge_entry' && to === 'crack_zone') {
      return s.solved.includes('ridge_entry');
    }
    if (s.scene === 'crack_zone' && to === 'mudflow_bend') {
      return s.solved.includes('crack_zone');
    }
    if (s.scene === 'mudflow_bend' && to === 'boulder_pass') {
      return s.solved.includes('mudflow_bend');
    }
    // Backward travel is always permitted
    return true;
  }

  function restore(raw) {
    if (!raw || !scenes[raw.scene]) return initial();
    const s = initial();
    s.scene = raw.scene;
    s.clues = Array.isArray(raw.clues) ? [...new Set(raw.clues)] : [];
    s.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited)] : ['ridge_entry'];
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
  else root.Chapter03 = data;
})(typeof window === 'object' ? window : globalThis);
