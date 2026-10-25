(function (root) {
  'use strict';

  const puzzles = {
    summit_gate: {
      title: 'Thủ tục báo danh tại Cổng Đỉnh Đồi',
      kind: 'sequence',
      intro: 'Tiếp cận cổng an toàn số 1, nhóm cần thực hiện đúng quy trình bàn giao với dân phòng trực cổng.',
      hint: 'Xác nhận thông tin nhóm → Báo cáo quân số 5 người an toàn → Nhận thẻ điểm danh vào trạm.',
      options: [
        ['report', 'Báo cáo quân số 5 người (cô giáo + 3 học sinh + bác Mạnh) an toàn'],
        ['id_card', 'Xác nhận thông tin nhóm từ trường THCS'],
        ['badge', 'Nhận thẻ điểm danh và hướng dẫn vào trạm chỉ huy']
      ],
      answer: ['id_card', 'report', 'badge']
    },
    command_post: {
      title: 'Bàn giao thực địa cho Trưởng làng Minh Anh',
      kind: 'sequence',
      intro: 'Bác Minh Anh cần nắm thông tin các điểm nguy hiểm trên đường để cảnh báo các đoàn đi sau.',
      hint: 'Báo cáo vệt nứt taluy D1 → Báo cáo tảng đá chắn hẻm và cống nghẽn → Đề xuất cắm biển cảnh báo.',
      options: [
        ['crack_report', 'Báo cáo tọa độ vết nứt sườn đồi D1 và bụi tre nghiêng'],
        ['block_report', 'Báo cáo tảng đá chắn lối hẻm và khúc cua cống tràn'],
        ['flag_warning', 'Đề xuất cử đội xung kích cắm biển cảnh báo cấm qua']
      ],
      answer: ['crack_report', 'block_report', 'flag_warning']
    },
    safe_hall: {
      title: 'BÀI KIỂM TRA TỔNG HỢP 5 CHƯƠNG — CHIẾN SĨ AN TOÀN',
      kind: 'matching',
      intro: 'Đối chiếu 4 tình huống sống còn trong suốt hành trình 5 chương với quyết định chính xác nhất.',
      hint: 'Ch1 tuân thủ sơ tán; Ch2 không chọn đường gần mù quáng; Ch3 tránh xa taluy nứt; Ch4 tính mạng con người là vô giá.',
      rows: [
        ['ch1', 'Khi có chuông báo bão lũ tại trường học (Ch1)'],
        ['ch2', 'Khi đứng trước 3 con đường sơ tán (Ch2)'],
        ['ch3', 'Khi gặp sườn đồi nứt nẻ sủi bọt (Ch3)'],
        ['ch4', 'Khi bạn đòi quay lại tìm đồ để quên (Ch4)']
      ],
      options: [
        ['priority', 'Kiên quyết ngăn cản, khẳng định tính mạng con người là vô giá'],
        ['distance', 'Không đi đường gần nhất mù quáng, quan sát địa hình và kiểm tra cầu'],
        ['evacuate', 'Tuân thủ lệnh thầy cô, mang ba lô khẩn cấp và di chuyển trật tự'],
        ['retreat', 'Lùi xa taluy ngay lập tức, men theo sống đồi cao cứng']
      ],
      answer: { ch1: 'evacuate', ch2: 'distance', ch3: 'retreat', ch4: 'priority' }
    }
  };

  function correct(id, input) {
    const puzzle = puzzles[id];
    if (!puzzle) return false;
    if (puzzle.kind === 'sequence') {
      return (
        Array.isArray(input) &&
        input.length === puzzle.answer.length &&
        input.every((v, i) => v === puzzle.answer[i])
      );
    }
    return (
      input &&
      puzzle.rows.every(([row]) => input[row] === puzzle.answer[row])
    );
  }

  const data = { puzzles, correct };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.Chapter05Puzzles = data;
})(typeof window === 'object' ? window : globalThis);
