window.SceneStory = (() => {
  const line = (speaker, text, extra = {}) => ({ speaker, text, ...extra });
  const B = text => line('Bạn', text), D = text => line('Duyên', text), T = text => line('Thảo', text);
  const N = (text, extra = {}) => line('Câu chuyện', text, extra);
  const R = (speaker, text) => line(speaker, text, { sfx: 'radio' });
  return {
    opening: [
      N('Tiếng mưa bắt đầu vang lên. Nhỏ. Sau đó lớn dần.', { location: 'exterior', caption: '09:00', subtitle: 'GIỜ RA CHƠI' }),
      N('Mưa phủ kín sân trường. Nước chảy mạnh theo rãnh thoát nước. Những cành cây lay động trong gió.'),
      N('Trong lớp 4B, vài học sinh đang thu dọn đồ. Duyên nhìn ra cửa sổ.', { location: 'classroom', caption: '' }),
      D('Mưa vẫn chưa nhỏ đi nhỉ...'), B('Ừ. Từ sáng tới giờ vẫn mưa.'),
      line('Duyên', 'Ui!', { sfx: 'thunder', flash: true }), B('Sợ à?'), D('Không! ...Chỉ hơi giật mình thôi.'),
      line('Loa trường', 'Thông báo khẩn cấp.', { sfx: 'radio' }),
      line('Loa trường', 'Do mưa lớn kéo dài, khu vực gần trường đang có nguy cơ xảy ra lũ quét.'),
      line('Loa trường', 'Tất cả học sinh giữ bình tĩnh. Chuẩn bị di chuyển tới điểm tập kết theo hướng dẫn của giáo viên.'),
      line('Loa trường', 'Không tự ý rời khỏi trường. Không tách khỏi nhóm.'),
      line('Loa trường', 'Không quay lại lấy đồ sau khi đã bắt đầu sơ tán.'),
      line('Loa trường', 'Nhắc lại. Tất cả học sinh chuẩn bị di chuyển tới điểm tập kết.'),
      D('Lũ quét sao...?'), B('Chắc cô Thảo sắp tới.'),
      N('Chuẩn bị sơ tán cùng Duyên. Dùng WASD / các phím mũi tên để di chuyển, E để tương tác. Bạn cũng có thể bấm hoặc chạm vào đồ vật.')
    ],
    duyen: [B('Duyên.'), D('Ừ?'), B('Mình ra cửa chờ cô Thảo đi.'), D('...'), B('Sao thế?'), D('Gấu của tớ.'), B('Gấu?'), D('Con gấu bông hôm qua tớ mang tới ấy. Tớ để nó trong tủ rồi.'), B('Vậy lấy nhanh đi.'), N('Duyên chạy tới tủ. Bạn đi theo.'), line('Duyên', 'Ơ... Tớ khóa tủ mất rồi.', { sfx: 'click' }), B('Thì mở khóa đi.'), D('Nhưng... tớ quên mật mã.'), B('...'), D('Tớ nhớ hôm qua mình đổi mật mã. Vì tớ cứ quên mấy con số.'), B('Thế mật mã mới là gì?'), D('Tớ chỉ nhớ... nó liên quan tới một thứ trong lớp.'), N('Trên khóa có bốn ô trống và các nút hướng. Không phải ổ khóa số.'), B('Bốn hướng? Cậu đặt mật mã kiểu này à?'), D('Chắc vậy... Xin lỗi.'), B('Không sao. Tìm nhanh thôi.')],
    'choice-leave': [B('Nếu không mở được ngay thì để gấu lại đi. Loa vừa bảo không được chậm trễ.'), D('Nhưng... Tớ biết.'), N('Duyên bước về cửa. Sau hai bước, cô quay lại.'), D('Khoan. Hôm qua lúc đổi mật mã... tớ nhớ mình đang nhìn thứ gì đó trên tường.'), B('Nếu tìm được ngay thì thử một lần. Không được thì mình đi.'), D('Ừ.')],
    'choice-search': [B('Mình thử tìm nhanh. Nhưng khi cô Thảo tới thì phải đi ngay.'), D('Ừ!'), B('Không được quay lại nữa.'), D('Tớ hứa.')],
    clock: [N('Đồng hồ trên tường chỉ 09:00.'), B('Chín giờ. Nhưng khóa đâu có số.')],
    duty: [N('HÔM NAY — TỔ 3'), B('Hôm nay tổ 3 trực nhật. Không liên quan đến mấy nút hướng.')],
    vietnam: [B('Bản đồ Việt Nam... Không có gì giống mật mã cả.')],
    timetable: [B('Toán... Tiếng Việt... Khoa học...'), D('Tớ chắc không lấy thời khóa biểu làm mật mã đâu.'), B('Ừ.')],
    window: [B('Mưa vẫn rất lớn. Nước chảy qua rãnh ngoài sân.'), D('Mình nhớ lời cô: không tự ý ra ngoài.')],
    'duyen-puzzle': [D('Tớ nhớ mật mã liên quan tới một thứ trong lớp... Mình quan sát trước nhé.')],
    'door-early': [B('Mình cần chờ cô Thảo. Không tự ý rời khỏi trường.')],
    'locker-before-clue': [B('Mình chưa biết quy luật.'), D('Tớ chỉ nhớ lúc đổi mật mã... hình như tớ đang nhìn thứ gì đó treo trên tường.')],
    'clue-first': [B('Đây là đường từ lớp mình tới điểm tập kết.'), D('À... Tớ nhớ có nhìn cái này hôm qua.'), B('Khóa của cậu có bốn ô. Sơ đồ cũng có bốn đoạn chính...')],
    'route-found': [B('Bốn hướng.'), D('Giống khóa tủ!'), B('Có thể đây chính là mật mã.')],
    'wrong-first': [line('Duyên', 'Sai rồi...', { sfx: 'thunder', flash: true }), B('Đừng thử đại. Xem lại quy luật.'), D('Tớ nhớ rồi một chút. Lúc đổi mật mã... tớ đang nhìn thứ gì đó treo trên tường.')],
    'wrong-second': [D('Nước nhiều hơn lúc nãy rồi.'), B('Mình không còn nhiều thời gian.'), D('Hình như mật mã không phải một hình... mà là một đường đi. Đi theo đường tới điểm tập kết...')],
    'last-try': [D('Đây là lần cuối thôi nhé.'), B('Ừ.')],
    leave: [B('Duyên. Mình phải đi rồi.'), D('... Nhưng Gấu...'), B('Sau khi an toàn mình có thể nhờ người lớn quay lại. Gấu ở trong tủ. Cậu thì đang ở đây.'), D('Ừ. Mình đi.')],
    success: [line('Câu chuyện', 'Đèn chuyển xanh. CLICK! Cánh tủ mở: một con gấu bông nhỏ, vài sách vở và chiếc áo khoác.', { sfx: 'unlock' }), D('Gấu! May quá...'), B('Đi thôi.'), D('Ừ.')],
    intervention: [line('Loa trường', 'Tất cả các lớp di chuyển ngay!', { sfx: 'alarm' }), D('Mình phải đi!'), T('Hai em! Bỏ lại đồ. Đi ngay với cô.'), D('Nhưng—'), T('Duyên. Đồ vật có thể lấy lại sau. Bây giờ chúng ta phải rời đi.'), D('... Dạ.')],
    'teacher-success': [T('Hai em! Hai em ổn chứ?'), B('Dạ.'), D('Dạ.'), T('Em vừa lấy nó à?'), D('Dạ...'), T('Được rồi. Nhưng từ bây giờ không quay lại lấy bất cứ thứ gì nữa.'), D('Dạ.'), T('Khi cô nói đi, hai em đi cùng cô.'), B('Dạ.')],
    'teacher-leave': [T('Hai em! Hai em chuẩn bị xong chưa?'), D('Dạ... Gấu của em còn trong tủ.'), T('Em có mở được không?'), D('Không ạ.'), T('Vậy mình để lại. Khi khu vực an toàn, người lớn sẽ xử lý sau.'), D('Dạ.'), T('Em quyết định đúng rồi.')],
    'teacher-rules': [T('Trước khi đi, nghe cô nhé. Không tự ý đi một mình. Luôn đi cùng cô và các bạn. Khi đã bắt đầu sơ tán, không quay lại lấy đồ.')],
    radio: [R('Minh Anh', 'Cô Thảo. Cô Thảo nghe rõ không?'), T('Tôi nghe rõ.'), R('Minh Anh', 'Tôi là Minh Anh. Nước ở con suối phía dưới đang lên nhanh. Các lớp phải di chuyển lên điểm tập kết phía đồi.'), T('Học sinh lớp tôi đã sẵn sàng.'), R('Minh Anh', 'Tốt. Nhưng đường phía đông có thể không đi được. Tôi đã bảo bác Mạnh kiểm tra lối đó. Chờ thông tin trước khi đi qua.'), T('Rõ.'), R('Mạnh', 'Trưởng làng Minh Anh. Tôi đang ở hành lang phía đông. Nước đang tràn qua đoạn cầu nối. Không cho học sinh đi hướng này.'), R('Minh Anh', 'Rõ. Cô Thảo nghe chưa?'), T('Tôi nghe rõ.'), R('Mạnh', 'Tôi sẽ kiểm tra đường phía bắc. Nếu đi được tôi báo lại ngay.'), T('Cảm ơn bác Mạnh.'), D('Vậy mình không đi đường phía đông nữa ạ?'), T('Đúng.'), B('Nhưng sơ đồ trong lớp chỉ đường qua phía đông mà cô?'), T('Trong tình huống thật, đường sơ tán có thể thay đổi. Sơ đồ giúp chúng ta biết hướng cơ bản... nhưng phải nghe hướng dẫn mới nhất.'), D('Vậy bây giờ mình đi đâu?'), T('Đi cùng cô. Khi tới chỗ rẽ, chúng ta sẽ quan sát.')],
    'hallway-start': [N('Cửa lớp mở ra. Âm thanh mưa rõ hơn. Những lớp khác đang đi theo giáo viên.'), T('Hai em. Đi sát cô.'), B('Dạ.'), D('Dạ.'), N('Đi theo cô Thảo tới ngã rẽ. Bấm vào cô hoặc di chuyển đến gần rồi nhấn E. Không tách nhóm, không quay lại lớp.')],
    'walking-bear': [D('Lúc nãy tớ chỉ nghĩ tới Gấu thôi.'), B('Cậu lo cho nó mà.'), D('Ừ. Nhưng lần sau nếu cô bảo đi ngay... tớ sẽ đi ngay.'), B('Ừ.')],
    'walking-no-bear': [D('Tớ vẫn lo cho Gấu.'), B('Nó đang ở trong tủ. Khi an toàn mình sẽ hỏi cô.'), D('Ừ. Ít nhất mình đang đi cùng nhau.'), B('Ừ.')],
    fork: [N('Ba người tới một ngã rẽ. Lối phía đông có nước chảy qua và dây cảnh báo. Bên phải là cầu thang lên khu nhà khác.'), D('Đây là đường trên sơ đồ...'), B('Nhưng bác Mạnh vừa bảo không đi.'), T('Đúng. Đây là lúc chúng ta phải chọn đường an toàn.'), R('Mạnh', 'Cô Thảo.'), T('Tôi nghe.'), R('Mạnh', 'Tôi tìm được một lối khác.'), N('Quan sát — Bình tĩnh — Không chần chừ — Đi theo hướng dẫn.')]
  };
})();
