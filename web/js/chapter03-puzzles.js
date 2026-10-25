(function (root) {
  'use strict';

  const puzzles = {
    ridge_entry: {
      title: 'Khởi động bộ đàm & Kiểm tra liên lạc',
      kind: 'sequence',
      intro: 'Trước khi tiến sâu vào sườn đồi dốc đá, Bác Mạnh và Cô Thảo cần xác lập liên lạc vô tuyến với Trưởng làng Minh Anh.',
      hint: 'Bật nguồn bộ đàm → Xoay nút chọn tần số 142.5 MHz → Báo cáo quân số 4 người.',
      options: [
        ['report', 'Báo cáo quân số 4 người an toàn'],
        ['power', 'Bật nguồn bộ đàm cứu hộ'],
        ['freq', 'Xoay nút chọn tần số chỉ huy 142.5 MHz']
      ],
      answer: ['power', 'freq', 'report']
    },
    crack_zone: {
      title: 'Nhận diện tam giác cảnh báo sạt lở',
      kind: 'matching',
      intro: 'Quan sát các dấu hiệu bất thường trên taluy dương và đối chiếu mức độ nguy hiểm.',
      hint: 'Vết nứt vòng cung báo hiệu trượt chính; Cây nghiêng bật rễ là đất trôi; Nước đùn sủi tăm là áp lực nước lỗ rỗng cực đại.',
      rows: [
        ['crack', 'Vết nứt hình vòng cung dài 10m'],
        ['tree', 'Bụi tre nghiêng bật rễ'],
        ['mud', 'Nước đục sủi tăm đùn từ vách đất']
      ],
      options: [
        ['hydro', 'Áp lực nước lỗ rỗng vượt ngưỡng, đất sắp hóa bùn nhão'],
        ['root', 'Tầng đất mặt đang bị trôi tuột khỏi tầng đá gốc'],
        ['geo', 'Vết nứt trượt chính báo hiệu nguy cơ sạt lở cấp tốc']
      ],
      answer: { crack: 'geo', tree: 'root', mud: 'hydro' }
    },
    mudflow_bend: {
      title: 'Quy tắc an toàn qua khúc cua tràn bùn',
      kind: 'sequence',
      intro: 'Khúc cua ngập nước đục cuộn xoáy và miệng cống bị nghẽn. Hãy sắp xếp nguyên tắc vượt cua an toàn.',
      hint: 'Dùng cành cây thăm dò độ sâu → Xác nhận nước dưới đầu gối → Bước nhanh theo gờ đá cứng.',
      options: [
        ['probe', 'Dùng cành cây cứng thăm dò độ sâu bùn nước'],
        ['step', 'Bước nhanh qua theo gờ đá cứng lộ thiên'],
        ['avoid', 'Xác định dòng nước dưới đầu gối mới được bước']
      ],
      answer: ['probe', 'avoid', 'step']
    },
    boulder_pass: {
      title: 'Quyết định chọn lối vòng an toàn',
      kind: 'sequence',
      intro: 'Tảng đá lớn chắn lối chính. Nhóm cần đưa ra quyết định di chuyển theo chỉ đạo của Bác Minh Anh.',
      hint: 'Dừng lại quan sát đỉnh dốc → Không trèo mạo hiểm lên khối đá trơn → Men theo sống đá gốc cao hơn 15m.',
      options: [
        ['observe', 'Dừng lại quan sát đỉnh dốc xem còn đá lăn không'],
        ['refuse', 'Không trèo mạo hiểm lên khối đá trơn trượt'],
        ['ridge_path', 'Men theo sống đá gốc cao hơn 15m để vòng qua']
      ],
      answer: ['observe', 'refuse', 'ridge_path']
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
  else root.Chapter03Puzzles = data;
})(typeof window === 'object' ? window : globalThis);
