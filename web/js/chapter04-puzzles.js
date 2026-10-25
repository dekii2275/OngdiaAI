(function (root) {
  'use strict';

  const puzzles = {
    village_outskirts: {
      title: 'Kỹ năng di chuyển qua bùn lún xóm đồi',
      kind: 'sequence',
      intro: 'Bùn ngập ngõ xóm kèm cành cây mục. Hãy sắp xếp các bước an toàn để vượt qua ngõ xóm.',
      hint: 'Dùng gậy kiểm tra độ lún → Tránh cành cây mục trơn trượt → Bước đều theo dấu chân người trước.',
      options: [
        ['walk', 'Bước đều chân theo vệt đất cứng của người đi trước'],
        ['probe', 'Dùng gậy gõ kiểm tra độ lún và vật nhọn ẩn dưới bùn'],
        ['avoid', 'Tránh giẫm lên cành cây mục và tôn phế liệu trơn trượt']
      ],
      answer: ['probe', 'avoid', 'walk']
    },
    isolation_post: {
      title: 'Nguyên tắc Vàng: Ưu tiên Tính mạng Số 1',
      kind: 'matching',
      intro: 'Minh đang khóc đòi quay lại trường lấy tranh. Hãy đối chiếu lý lẽ thuyết phục bạn học.',
      hint: 'Tính mạng là vô giá; Tranh vẽ có thể vẽ lại; Tuyệt đối không quay lại vùng nguy hiểm.',
      rows: [
        ['life', 'Tính mạng và an toàn của Minh'],
        ['drawing', 'Bức tranh kỷ niệm để quên'],
        ['danger', 'Lời đề nghị quay lại trường tìm đồ']
      ],
      options: [
        ['refuse', 'Hành động cực kỳ nguy hiểm, tuyệt đối không được phép'],
        ['precious', 'Giá trị thiêng liêng nhất, mẹ chỉ cần Minh an toàn trở về'],
        ['recreate', 'Kỷ niệm trong tim, Minh có thể vẽ tặng mẹ bức tranh đẹp hơn']
      ],
      answer: { life: 'precious', drawing: 'recreate', danger: 'refuse' }
    },
    bamboo_bridge: {
      title: 'Quy tắc vượt cầu tre dã chiến trong lũ',
      kind: 'sequence',
      intro: 'Cầu tre bắc qua khe nước siết có tay vịn yếu. Sắp xếp quy trình an toàn trước và trong khi qua cầu.',
      hint: 'Kiểm tra buộc chặt tay vịn → Đi từng người cách nhau 3m → Hai tay bám chắc, mắt nhìn thẳng.',
      options: [
        ['brace', 'Kiểm tra và buộc chặt lại thanh giằng tay vịn tre'],
        ['single', 'Đi từng người một, giữ cự ly tối thiểu 3 mét'],
        ['focus', 'Hai tay bám chắc, mắt nhìn thẳng bờ đối diện, không nhìn xoáy nước']
      ],
      answer: ['brace', 'single', 'focus']
    },
    safe_ascent: {
      title: 'Đội hình vượt dốc đá lên Đỉnh đồi',
      kind: 'sequence',
      intro: 'Con dốc lát đá kiên cố dẫn thẳng tới nhà văn hóa. Sắp xếp đội hình gắn kết bảo vệ thành viên yếu nhất.',
      hint: 'Bác Mạnh dẫn đầu → Cô Thảo đi cạnh nắm tay Minh → Bạn và Duyên bọc lót phía sau.',
      options: [
        ['scout', 'Bác Mạnh dẫn đầu kiểm tra từng bậc đá'],
        ['support', 'Cô Thảo đi cạnh nắm chặt tay dìu bạn Minh'],
        ['rear', 'Bạn và Duyên bám sát bọc lót phía sau']
      ],
      answer: ['scout', 'support', 'rear']
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
  else root.Chapter04Puzzles = data;
})(typeof window === 'object' ? window : globalThis);
