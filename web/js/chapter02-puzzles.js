(function (root) {
  const puzzles = {
    gate: {
      title: 'Ghép chỉ dẫn qua bộ đàm', kind: 'sequence',
      intro: 'Tín hiệu chập chờn. Ghép lại ba việc cô Thảo yêu cầu trước khi rời cổng trường.',
      hint: 'Kiểm tra nhóm trước, xác nhận hướng dẫn rồi mới di chuyển.',
      options: [ ['move', 'Cùng cô Thảo đi tới ngã ba'], ['radio', 'Xác nhận đường đông bị nước tràn'], ['group', 'Kiểm tra Bạn và Duyên đều ở cùng cô'] ],
      answer: ['group', 'radio', 'move']
    },
    junction: {
      title: 'Khôi phục biển chỉ đường', kind: 'matching',
      intro: 'Bảng tuyến ghi: đường đồi 450 m, cầu treo 200 m, đường Bắc 650 m. Các tấm chỉ khoảng cách bị gió xoay lệch; ghép lại đúng ba biển.',
      hint: 'Đường đồi 450 m · Cầu treo 200 m · Đường Bắc 650 m. Khoảng cách chỉ để định hướng.',
      rows: [['hill', 'A · Đường chân đồi'], ['suspension', 'B · Cầu treo'], ['north', 'C · Đường phía Bắc']],
      options: [['200', '200 m'], ['650', '650 m'], ['450', '450 m']],
      answer: { hill: '450', suspension: '200', north: '650' }
    },
    north: {
      title: 'Đối chiếu điều kiện tuyến dự phòng', kind: 'matching',
      intro: 'Ghép mỗi quan sát với điều nó thực sự cho biết, rồi đối chiếu báo cáo của bác Mạnh.',
      hint: 'Không suy ra an toàn chỉ từ một tấm biển hoặc một vũng nước.',
      rows: [['road', 'Vũng nước mưa trên mặt đường'], ['clearance', 'Sườn đồi cách xa đường'], ['sign', 'Cọc chỉ tuyến sơ tán']],
      options: [['direction', 'Giúp định hướng, vẫn cần kiểm tra hôm nay'], ['surface', 'Đường ướt, chưa thấy nước chảy cắt ngang'], ['terrain', 'Tránh đi sát chân sườn đất như tuyến A']],
      answer: { road: 'surface', clearance: 'terrain', sign: 'direction' },
      requires: ['road', 'clearance', 'sign'], guide: true
    },
    concrete: {
      title: 'Sắp đội hình qua cầu', kind: 'sequence',
      intro: 'Mạnh đã kiểm tra cầu và dẫn đầu. Cô Thảo đi ngay sau để giữ nhóm học sinh. Bạn đi trước Duyên. Sắp đúng đội hình trước khi qua.',
      hint: 'Người dẫn đường → cô giáo → Bạn → Duyên.',
      options: [['duyen', 'Duyên'], ['ban', 'Bạn'], ['manh', 'Mạnh'], ['thao', 'Cô Thảo']],
      answer: ['manh', 'thao', 'ban', 'duyen'], requires: ['deck', 'level', 'piers'], guide: true
    },
    highroad: {
      title: 'Nối các mốc trên đường cao', kind: 'sequence',
      intro: 'Ghép đúng hành trình theo lời chỉ dẫn của Minh Anh, tránh lối rẽ xuống làng.',
      hint: 'Cọc sơ tán → đường cao → mái đèn vàng. Không rẽ xuống làng.',
      options: [['lights', 'Mái nhà có đèn vàng'], ['village', 'Lối rẽ xuống làng'], ['marker', 'Cọc tuyến sơ tán'], ['ridge', 'Đường cao trên sườn đồi']],
      answer: ['marker', 'ridge', 'lights'], requires: ['highroad-marker']
    }
  };
  function correct(id, input) {
    const puzzle = puzzles[id];
    if (!puzzle) return false;
    if (puzzle.kind === 'sequence') return Array.isArray(input) && input.length === puzzle.answer.length && input.every((v, i) => v === puzzle.answer[i]);
    return input && puzzle.rows.every(([row]) => input[row] === puzzle.answer[row]);
  }
  const data = { puzzles, correct };
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.Chapter02Puzzles = data;
})(typeof window === 'object' ? window : globalThis);
