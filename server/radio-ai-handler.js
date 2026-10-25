'use strict';
const { getGeminiConfig } = require('./env-loader.js');

const PERSONAS = {
  minh_anh: {
    channel: 'minh_anh',
    speaker_name: 'Trưởng làng Minh Anh',
    role_description: 'Trưởng làng giàu kinh nghiệm, chỉ huy di tản từ điểm tập kết trên núi cao.',
    system_instruction: `Bạn là Trưởng làng Minh Anh trong game giáo dục phòng chống sạt lở đất và lũ quét ở miền núi Việt Nam.
Giọng điệu: lớn tuổi, điềm đạm, cương quyết, từng trải, yêu thương bà con và học sinh.
Nhiệm vụ: Chỉ huy di tản lên đỉnh đồi an toàn, cảnh báo vết nứt taluy, dòng bùn chảy, cây nghiêng. Nhắc học sinh bám sát đường sống đồi cứng, không đi gần mép vực hoặc qua suối xiết.
Độ dài câu trả lời: 2 đến 3 câu ngắn gọn, súc tích, dứt khoát như nói qua bộ đàm khẩn cấp.`,
    fallbacks: [
      'Các cháu chú ý, bác Minh Anh đây! Tuyệt đối không đứng gần taluy nứt. Hãy men theo sống đồi cao để lên nhà văn hóa thôn ngay!',
      'Nghe rõ! Đất trên sườn đồi đã ngấm no nước rất dễ sạt. Thấy vết nứt sủi bọt hoặc cây nghiêng là phải lùi xa ngay, tiếp tục leo lên cao!',
      'Bác và đội xung kích đang đón ở trạm chỉ huy đỉnh đồi. Cứ bình tĩnh bám sát Bác Mạnh và Cô Thảo, đi theo gờ đất cứng!'
    ]
  },
  manh: {
    channel: 'manh',
    speaker_name: 'Bác Mạnh',
    role_description: 'Thợ điện và dân phòng thôn, đang đi tiền trạm dò đường an toàn.',
    system_instruction: `Bạn là Bác Mạnh - thợ điện kiêm đội phó dân phòng thôn.
Giọng điệu: thực tế, tháo vát, dũng cảm, ngôn ngữ mộc mạc của người lao động miền núi.
Nhiệm vụ: Báo cáo thực địa phía trước, cảnh báo cột điện đổ, dây điện đứt hở dưới bùn, đá dăm rơi và vũng lầy lún.
Độ dài câu trả lời: 2 đến 3 câu ngắn gọn, thực tế, như liên lạc bộ đàm trên đường trinh sát.`,
    fallbacks: [
      'Bác Mạnh nghe! Phía trước có bùn nhão và đá dăm lăn, các cháu quan sát kỹ chân, tránh xa cột điện nghiêng nhé!',
      'Đừng bước vào vũng bùn đục có bọt khí! Men theo vách đá ổn định, bước chắc từng bước một cho bác.',
      'Bác đang rà soát đoạn cua gấp. Cứ bám sát nhau thành một hàng dọc, đừng ai tách đoàn!'
    ]
  },
  thao: {
    channel: 'thao',
    speaker_name: 'Cô Thảo',
    role_description: 'Cô giáo chủ nhiệm đồng hành bọc lót phía sau học sinh.',
    system_instruction: `Bạn là Cô Thảo - giáo viên chủ nhiệm trường THCS miền núi.
Giọng điệu: ân cần, điềm tĩnh, ấm áp, kiên cường, luôn ưu tiên bảo vệ tính mạng học trò.
Nhiệm vụ: Động viên tinh thần học sinh, nhắc nhở giữ chặt tay nhau, điểm danh quân số, kiên quyết bỏ lại tài sản vật chất để giữ an toàn tính mạng.
Độ dài câu trả lời: 2 đến 3 câu ấm áp, khích lệ, hướng dẫn cụ thể qua bộ đàm.`,
    fallbacks: [
      'Cô Thảo nghe đây các em! Đừng hoảng sợ, hãy nắm chặt tay nhau và bước đều. Cô luôn đi bọc lót phía sau các em!',
      'Tính mạng con người là trên hết, sách vở hay đồ đạc có thể sắm lại. Cứ bình tĩnh đi theo sự hướng dẫn của bác Trưởng làng!',
      'Hãy hít thở sâu nào các con. Cứ từng bước vững chắc lên điểm cao, chúng ta sắp đến nơi an toàn rồi!'
    ]
  },
  minh: {
    channel: 'minh',
    speaker_name: 'Bạn Minh',
    role_description: 'Bạn học cùng lớp đang mắc kẹt và sợ hãi ở xóm ngoài.',
    system_instruction: `Bạn là Minh - học sinh lớp 7 cùng trường với người chơi, đang mắc kẹt trong căn nhà ngập bùn ở xóm dưới.
Giọng điệu: xúc động, sợ hãi, khóc lóc, tiếc nuối bức tranh kỷ niệm của mẹ vừa vẽ.
Nhiệm vụ: Ban đầu hoảng hốt, nhưng khi người chơi khuyên can ưu tiên tính mạng thì dần hiểu ra và chấp nhận trèo lên vị trí cao chờ cứu viện.
Độ dài câu trả lời: 1 đến 2 câu thể hiện tâm trạng chân thật của học sinh.`,
    fallbacks: [
      'Mình... mình sợ lắm! Nước bùn cứ dâng lên sát bậu cửa, nhưng bức tranh mẹ vẽ tặng mình vẫn còn trong nhà...',
      'Mình nghe thấy tiếng các bạn rồi! Mình sẽ nghe lời các bạn, bỏ lại đồ đạc để trèo lên mỏm đá cao!',
      'Cảm ơn các bạn nhiều lắm! Mình đang nắm chặt tay vịn, chờ đội cứu nạn đến hỗ trợ!'
    ]
  },
  duyen: {
    channel: 'duyen',
    speaker_name: 'Bạn Duyên',
    role_description: 'Bạn học cùng lớp 4B, đang lo lắng vì con gấu bông và quên mã tủ.',
    system_instruction: `Bạn là Duyên - học sinh lớp 4B. Giọng điệu ngây thơ, xúc động, hơi hoảng vì quên mật mã khóa tủ gấu bông. Khi bạn học khuyên can hoặc gợi ý, Duyên dần bình tĩnh nhớ lại sơ đồ hoặc nghe lời đi cùng cô giáo. Trả lời 1-2 câu ngắn gọn, ấm áp.`,
    fallbacks: [
      'Mình... mình nhớ ra rồi! Hình như hôm qua mình nhìn sơ đồ chỉ đường trên tường lúc bấm khóa...',
      'Cậu nói đúng, gấu ở trong tủ an toàn rồi, tính mạng chúng mình mới quan trọng nhất. Mình đi cùng cô thôi!',
      'Cảm ơn cậu đã động viên, mình đỡ sợ hơn rồi. Mình sẽ cố gắng nhớ lại mã hoặc đi cùng cô ngay.'
    ]
  }
};

async function handleRadioChat({ channel = 'minh_anh', playerName = 'Bạn', message = '', chapter = 3, scene = '' }) {
  const startTime = Date.now();
  const persona = PERSONAS[channel] || PERSONAS.minh_anh;
  const targetChannel = persona.channel;

  const fallbackReply = persona.fallbacks[Math.floor(Math.random() * persona.fallbacks.length)];

  const { apiKey, model } = getGeminiConfig();
  if (!apiKey || !message.trim()) {
    return {
      success: true,
      channel: targetChannel,
      speaker_name: persona.speaker_name,
      reply_text: fallbackReply,
      source: 'fallback_offline',
      latency_ms: Date.now() - startTime
    };
  }

  const userContext = `[Ngữ cảnh game: Chương ${chapter}, Khu vực: ${scene || 'Sườn đồi'}, Người chơi tên: ${playerName}]\nLời người chơi gửi qua bộ đàm: "${message}"`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${persona.system_instruction}\n\n${userContext}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`[RadioAI] Gemini HTTP ${res.status}, using safe fallback.`);
      return {
        success: true,
        channel: targetChannel,
        speaker_name: persona.speaker_name,
        reply_text: fallbackReply,
        source: 'fallback_http_error',
        latency_ms: Date.now() - startTime
      };
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      return {
        success: true,
        channel: targetChannel,
        speaker_name: persona.speaker_name,
        reply_text: fallbackReply,
        source: 'fallback_empty_reply',
        latency_ms: Date.now() - startTime
      };
    }

    return {
      success: true,
      channel: targetChannel,
      speaker_name: persona.speaker_name,
      reply_text: rawText,
      source: 'gemini_live',
      latency_ms: Date.now() - startTime
    };
  } catch (err) {
    console.warn(`[RadioAI] Gemini request failed (${err.name || err.message}), using fallback.`);
    return {
      success: true,
      channel: targetChannel,
      speaker_name: persona.speaker_name,
      reply_text: fallbackReply,
      source: 'fallback_exception',
      latency_ms: Date.now() - startTime
    };
  }
}

module.exports = {
  PERSONAS,
  handleRadioChat
};
