(function (root) {
  'use strict';

  const clue = (id, label, x, y, speaker, text) => ({ id, label, x, y, speaker, text, type: 'clue' });
  const exit = (id, label, to, x, y, sub = '') => ({ id, label, to, x, y, sub, type: 'exit' });

  const scenes = {
    village_outskirts: {
      name: 'Lối vào xóm đồi chia cắt',
      art: 'village_outskirts',
      position: 'left center',
      links: ['isolation_post'],
      spots: [
        clue('mud_debris', 'Rác gỗ ngập bùn', 25, 60, 'Mạnh', 'Bùn non từ đồi tràn xuống ngõ xóm. Rác gỗ và rễ cây ken dày, chỉ có thể đi bộ lách qua.'),
        clue('flooded_yard', 'Sân nhà ngập nước', 52, 65, 'Bạn', 'Nước từ rãnh thoát nước tràn qua sân các nhà ven ngõ. Mực nước đang dâng chậm.'),
        { id: 'puzzle-village_outskirts', label: 'Xử lý bùn lún xóm đồi', x: 75, y: 56, type: 'puzzle', puzzle: 'village_outskirts' },
        exit('to-isolation_post', 'Tiến vào trạm sơ tán xóm', 'isolation_post', 86, 70, 'Tìm gặp người dân')
      ]
    },
    isolation_post: {
      name: 'Trạm sơ tán tạm thời xóm đồi',
      art: 'isolation_post',
      position: 'center center',
      links: ['village_outskirts', 'bamboo_bridge'],
      spots: [
        clue('minh_crying', 'Bạn Minh ôm cặp khóc', 28, 68, 'Duyên', 'Minh ơi! Bác Trưởng làng dặn tất cả phải sơ tán lên nhà văn hóa gấp!'),
        clue('lost_drawing', 'Bức tranh 8/3 tặng mẹ', 50, 52, 'Minh', 'Bức tranh giải nhất ngày 8/3 mình để quên trong ngăn bàn lớp học... Mình muốn quay lại lấy...'),
        { id: 'chat-minh', label: 'Động viên Minh (AI)', x: 40, y: 76, type: 'minh_chat' },
        { id: 'puzzle-isolation_post', label: 'Ưu tiên tính mạng số 1', x: 78, y: 58, type: 'puzzle', puzzle: 'isolation_post' },
        exit('to-bamboo_bridge', 'Tới cầu tre dã chiến', 'bamboo_bridge', 88, 72, 'Dìu Minh đi cùng'),
        exit('back-village_outskirts', 'Quay lại lối vào xóm', 'village_outskirts', 12, 85)
      ]
    },
    bamboo_bridge: {
      name: 'Cầu tre qua khe nước lũ',
      art: 'bamboo_bridge',
      position: 'center center',
      links: ['isolation_post', 'safe_ascent'],
      spots: [
        clue('bridge_handrail', 'Tay vịn tre lỏng lẻo', 28, 55, 'Mạnh', 'Cầu tre này ghép từ thân tre đực, tay vịn có chỗ bị tuột lạt tre buộc. Tôi phải giằng lại trước.'),
        clue('water_under_bridge', 'Nước siết dưới gầm cầu', 50, 68, 'Bạn', 'Mặt cầu cách mặt nước khoảng 1 mét, dòng chảy bên dưới siết mạnh. Đi từng người một.'),
        clue('minh_trembling', 'Minh sợ hãi run rẩy', 70, 58, 'Thảo', 'Cô Thảo sẽ nắm tay Minh đi trước. Bạn và Duyên đi sau, bước dứt khoát không nhìn xuống nước.'),
        { id: 'puzzle-bamboo_bridge', label: 'Quy tắc qua cầu tre', x: 82, y: 55, type: 'puzzle', puzzle: 'bamboo_bridge' },
        exit('to-safe_ascent', 'Lên dốc đá an toàn', 'safe_ascent', 88, 72, 'Qua cầu an toàn'),
        exit('back-isolation_post', 'Trở lại trạm sơ tán', 'isolation_post', 12, 85)
      ]
    },
    safe_ascent: {
      name: 'Dốc đá kiên cố lên đỉnh đồi',
      art: 'safe_ascent',
      position: 'right center',
      links: ['bamboo_bridge'],
      spots: [
        clue('stone_paving', 'Bậc đá tảng cổ vững chắc', 32, 65, 'Bạn', 'Con dốc này được lát đá tảng dày từ xưa, không bị xói lở. Nền đường rất vững chãi.'),
        clue('summit_beacon', 'Đèn vàng trạm chỉ huy', 55, 48, 'Duyên', 'Kìa! Đèn vàng nhà văn hóa thôn trên đỉnh đồi đã sáng rõ rồi!'),
        clue('minh_gratitude', 'Minh mỉm cười an lòng', 72, 68, 'Minh', 'Cảm ơn các bạn và cô Thảo đã không bỏ rơi mình... Mình hiểu rồi, còn người là còn tất cả.'),
        { id: 'puzzle-safe_ascent', label: 'Đội hình leo dốc cuối cùng', x: 82, y: 60, type: 'puzzle', puzzle: 'safe_ascent' },
        { id: 'finish-ch04', to: 'chapter05', label: 'Tiến vào Đỉnh Đồi An Toàn (Chương 05)', x: 88, y: 78, type: 'chapter_advance', sub: 'Chương 05 →' },
        exit('back-bamboo_bridge', 'Trở lại cầu tre', 'bamboo_bridge', 12, 85)
      ]
    }
  };

  const required = {
    village_outskirts: ['mud_debris', 'flooded_yard'],
    isolation_post: ['minh_crying', 'lost_drawing'],
    bamboo_bridge: ['bridge_handrail', 'water_under_bridge', 'minh_trembling'],
    safe_ascent: ['stone_paving', 'summit_beacon', 'minh_gratitude']
  };

  function initial() {
    return {
      version: 4,
      scene: 'village_outskirts',
      clues: [],
      visited: ['village_outskirts'],
      solved: [],
      minhSaved: false,
      complete: false,
      started: false,
      position: { x: 20, y: 85 }
    };
  }

  function canTravel(s, to) {
    if (!scenes[s.scene] || !scenes[s.scene].links.includes(to)) return false;
    if (s.scene === 'village_outskirts' && to === 'isolation_post') {
      return s.solved.includes('village_outskirts');
    }
    if (s.scene === 'isolation_post' && to === 'bamboo_bridge') {
      return s.solved.includes('isolation_post') && s.minhSaved === true;
    }
    if (s.scene === 'bamboo_bridge' && to === 'safe_ascent') {
      return s.solved.includes('bamboo_bridge');
    }
    return true;
  }

  function restore(raw) {
    if (!raw || !scenes[raw.scene]) return initial();
    const s = initial();
    s.scene = raw.scene;
    s.clues = Array.isArray(raw.clues) ? [...new Set(raw.clues)] : [];
    s.visited = Array.isArray(raw.visited) ? [...new Set(raw.visited)] : ['village_outskirts'];
    s.solved = Array.isArray(raw.solved) ? [...new Set(raw.solved)] : [];
    s.minhSaved = raw.minhSaved === true;
    s.complete = raw.complete === true;
    s.started = raw.started === true;
    if (raw.position && Number.isFinite(raw.position.x) && Number.isFinite(raw.position.y)) {
      s.position = { x: raw.position.x, y: raw.position.y };
    }
    return s;
  }

  const data = { scenes, required, initial, canTravel, restore };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.Chapter04 = data;
})(typeof window === 'object' ? window : globalThis);
