'use strict';
const { getGeminiConfig } = require('./env-loader.js');

/**
 * Call Gemini API with JSON response format and AbortController timeout.
 * Returns parsed JSON object or null if failed/timed out.
 */
async function callGeminiJson(systemPrompt, userPrompt, timeoutMs = 3500) {
  const { apiKey, model } = getGeminiConfig();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[DebriefAI] Gemini HTTP ${res.status}, using safe fallback.`);
      return null;
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawText) return null;
    return JSON.parse(rawText);
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[DebriefAI] Gemini request failed (${err.name || err.message}), using safe fallback.`);
    return null;
  }
}

/**
 * Endpoint 1: Khảo hạch sát hạch qua chương (Chapters 1 to 5)
 */
async function handleChapterDebrief({ chapter = 1, question = '', playerAnswer = '' } = {}) {
  const startTime = Date.now();
  const cleanAnswer = String(playerAnswer || '').trim();
  const numChapter = Number(chapter || 1);

  // Attempt live Gemini LLM evaluation
  const systemPrompt = `Bạn là Giảng viên Sư phạm Cứu nạn và Thẩm định An toàn trong game giáo dục phòng chống thiên tai bão lũ tại Việt Nam.
Nhiệm vụ: Chấm điểm bài khảo hạch của học sinh cuối chương ${numChapter}.
Tiêu chí cốt lõi:
1. Tính mạng con người là trên hết, tuyệt đối không tiếc của quay lại lấy tài sản.
2. Tuân thủ nghiêm ngặt kỷ luật di tản, nghe theo người chỉ huy và giáo viên.
3. Nắm vững địa hình an toàn (đi trên gờ đồi cứng, tránh taluy nứt, suối xiết, cầu dã chiến yếu).
4. Giữ bình tĩnh, tương trợ đồng đội theo phương pháp khoa học.

Trả về duy nhất JSON hợp lệ:
{
  "passed": boolean,
  "feedback": "string (lời nhận xét sư phạm 1-3 câu, nêu rõ vì sao đạt hoặc chỉ dẫn khắc phục)"
}`;

  const userPrompt = `[Khảo hạch Chương ${numChapter}]\nCâu hỏi: "${question || 'Nguyên tắc bảo vệ an toàn tính mạng khi thiên tai'}"\nCâu trả lời của người chơi: "${cleanAnswer}"`;

  const geminiResult = await callGeminiJson(systemPrompt, userPrompt);
  if (geminiResult && typeof geminiResult.passed === 'boolean' && geminiResult.feedback) {
    return {
      success: true,
      passed: geminiResult.passed,
      feedback: String(geminiResult.feedback),
      source: 'gemini_live',
      latency_ms: Date.now() - startTime
    };
  }

  // Safe pedagogical offline fallback
  if (!cleanAnswer || cleanAnswer.length < 5) {
    return {
      success: true,
      passed: false,
      feedback: 'Câu trả lời quá ngắn hoặc chưa nêu rõ hành động an toàn. Trong tình huống khẩn cấp, con cần thể hiện rõ nguyên tắc ưu tiên tính mạng.',
      source: 'fallback_offline',
      latency_ms: Date.now() - startTime
    };
  }

  const lower = cleanAnswer.toLowerCase();

  // Kiểm tra các hành vi nguy hiểm vi phạm nguyên tắc sinh tồn
  const dangerousBehaviors = [
    {
      regex: /(?:quay lại|ở lại|tìm|lấy)\s+(?:lớp|balo|ba lô|cặp|túi|đồ|tiền|điện thoại|tài sản)/i,
      feedback: 'Chưa đạt! Trong tình huống khẩn cấp, tính mạng con người là quý giá nhất. Tuyệt đối không được quay lại tìm đồ đạc hay tiếc của.'
    },
    {
      regex: /(?:đồ\s+đắt\s+tiền|tiếc\s+của|giữ\s+lại\s+tài\s+sản)/i,
      feedback: 'Chưa đạt! Tài sản có thể mua lại được nhưng sinh mạng chỉ có một. Phải sơ tán ngay lập tức!'
    },
    {
      regex: /(?:chọn|đi)\s+(?:cầu\s+treo|đường\s+tắt|đường\s+200m|ngắn\s+nhất)/i,
      feedback: 'Chưa đạt! Cầu treo 200m có mố cầu yếu và dòng nước xiết rất nguy hiểm. Con phải chọn cung đường vòng phía Bắc vững chãi.'
    },
    {
      regex: /(?:trèo\s+qua|leo\s+qua|vượt\s+qua)\s+(?:tảng\s+đá|khối\s+đá|vách\s+đá)/i,
      feedback: 'Chưa đạt! Tảng đá rơi chắn đường có thể lăn tiếp bất cứ lúc nào. Con cần giữ khoảng cách an toàn và men theo sườn đồi cứng.'
    }
  ];

  for (const danger of dangerousBehaviors) {
    if (danger.regex.test(lower)) {
      // Ngoại trừ trường hợp có từ phủ định rõ ràng: "không quay lại", "không tiếc của"
      const negated = /(?:không|chớ|đừng|tuyệt đối không|tránh|hạn chế)\s+.*(?:quay lại|lấy đồ|tiếc của|đi cầu treo|trèo qua)/i.test(lower);
      if (!negated) {
        return {
          success: true,
          passed: false,
          feedback: danger.feedback,
          source: 'fallback_offline',
          latency_ms: Date.now() - startTime
        };
      }
    }
  }

  // Các từ khóa an toàn chuẩn sư phạm cứu nạn
  const safeKeywords = [
    'tính mạng', 'an toàn', 'không quay lại', 'theo cô', 'bỏ lại', 'sơ tán', 'khẩn cấp',
    'nhanh chóng', 'bình tĩnh', 'vững chắc', 'cầu bắc', 'bê tông', 'khoa học', 'hướng dẫn',
    'nghe lời', 'trưởng làng', 'giãn cách', 'dãn cách', 'cứu bạn', 'bảo vệ', 'sống đồi',
    'mẹ cần', 'quan trọng nhất'
  ];

  const matchedKeywords = safeKeywords.filter(k => lower.includes(k));

  if (matchedKeywords.length > 0 || cleanAnswer.length >= 20) {
    return {
      success: true,
      passed: true,
      feedback: 'Xuất sắc! Con đã nắm vững nguyên tắc cứu nạn: tính mạng con người luôn là trên hết, tuân thủ kỷ luật di tản và bảo vệ bản thân cùng tập thể.',
      source: 'fallback_offline',
      latency_ms: Date.now() - startTime
    };
  }

  return {
    success: true,
    passed: false,
    feedback: 'Câu trả lời chưa nêu rõ các nguyên tắc an toàn cứu nạn. Hãy chú ý đến việc bảo vệ tính mạng và phối hợp cùng tập thể.',
    source: 'fallback_offline',
    latency_ms: Date.now() - startTime
  };
}

/**
 * Endpoint 2: Phân tích kỹ thuật & Lập phác đồ vượt cầu tre (Chapter 4)
 */
async function handleBridgeBlueprint({ inspectionData, inspection } = {}) {
  const startTime = Date.now();
  const rawList = inspectionData || inspection || [];
  const inspections = Array.isArray(rawList) ? rawList.map(String) : [String(rawList)];

  const systemPrompt = `Bạn là Chuyên gia Kỹ thuật Công binh & Thủy văn cứu nạn hiện trường.
Nhiệm vụ: Phân tích hiện trạng cầu tre dã chiến qua suối lũ dữ và xuất phác đồ vượt cầu an toàn.
Trả về duy nhất định dạng JSON:
{
  "zones": [
    { "id": "zone_1", "name": "Đầu cầu & Cột neo", "risk": "...", "advice": "...", "status": "caution" },
    { "id": "zone_2", "name": "Thân tre đực giữa suối", "risk": "...", "advice": "...", "status": "warning" },
    { "id": "zone_3", "name": "Mố đá tiếp bờ", "risk": "...", "advice": "...", "status": "safe_landing" }
  ],
  "tacticalNote": "string (chỉ dẫn tải trọng và nhịp bước chi tiết)"
}`;

  const userPrompt = `Các quan sát hiện trường từ người chơi: ${JSON.stringify(inspections)}`;

  const geminiResult = await callGeminiJson(systemPrompt, userPrompt);
  if (geminiResult && Array.isArray(geminiResult.zones) && geminiResult.zones.length >= 3 && geminiResult.tacticalNote) {
    return {
      success: true,
      zones: geminiResult.zones,
      tacticalNote: String(geminiResult.tacticalNote),
      source: 'gemini_live',
      latency_ms: Date.now() - startTime
    };
  }

  // Fallback kỹ thuật dã chiến chuẩn quân báo
  const zones = [
    {
      id: 'zone_1',
      name: 'Đầu cầu & Cọc neo',
      observation: inspections[0] || 'Mối buộc tre lỏng',
      risk: 'Lạt tre ngậm nước lũ dễ xô dịch',
      advice: 'Kiểm tra cọc ghìm, gia cố dây chằng trước khi bước, di chuyển từng người một',
      status: 'caution',
      speed: 'chậm'
    },
    {
      id: 'zone_2',
      name: 'Thân tre đực giữa suối',
      observation: inspections[1] || 'Thân tre đực rêu trơn',
      risk: 'Bề mặt trơn trượt và lực rung lắc do dòng nước cuộn xô',
      advice: 'Hạ thấp trọng tâm, duy trì cự ly giãn cách tối thiểu 3m, bám chắc tay vịn tre',
      status: 'warning',
      speed: 'rất chậm'
    },
    {
      id: 'zone_3',
      name: 'Mố đá tiếp giáp bờ an toàn',
      observation: inspections[2] || 'Dòng xoáy mạn phải',
      risk: 'Dòng nước xoáy cuộn mạn phải tạo áp lực xoắn',
      advice: 'Nghiêng trọng tâm sang mạn trái, bước dứt khoát lên gờ đá móng vững chãi',
      status: 'safe_landing',
      speed: 'dứt khoát'
    }
  ];

  const tacticalNote = 'PHÁC ĐỒ TÁC CHIẾN VƯỢT CẦU DÃ CHIẾN: Nghiêm cấm di chuyển cùng lúc nhiều người trên 1 nhịp tre. Duy trì cự ly giãn cách tối thiểu 3m. Giữ trọng tâm thấp, bám chắc mạn trái ngược dòng xoáy và dứt khoát bước lên mố đá an toàn.';

  return {
    success: true,
    zones,
    tacticalNote,
    source: 'fallback_offline',
    latency_ms: Date.now() - startTime
  };
}

/**
 * Endpoint 3: Biên tập bức điện cứu hộ chuẩn quân báo gửi Huyện (Chapter 5)
 */
async function handleIncidentDispatch({ hazards = [] } = {}) {
  const startTime = Date.now();
  const rawList = Array.isArray(hazards) ? hazards.map(String) : (hazards ? [String(hazards)] : []);

  const systemPrompt = `Bạn là Sĩ quan Tham mưu Ban Chỉ huy Phòng chống Thiên tai & Tìm kiếm Cứu nạn.
Nhiệm vụ: Biên dịch các điểm hiểm họa thực địa thành bức điện cứu hộ khẩn cấp chuẩn quân báo cứu nạn.
Trả về duy nhất định dạng JSON:
{
  "dispatchCode": "string (mã điện tín ví dụ CD-TKCN-xxxx)",
  "reportText": "string (nội dung bức điện chỉ huy ngắn gọn, súc tích)"
}`;

  const userPrompt = `Danh sách điểm hiểm họa ghi nhận: ${JSON.stringify(rawList)}`;

  const geminiResult = await callGeminiJson(systemPrompt, userPrompt);
  if (geminiResult && geminiResult.dispatchCode && geminiResult.reportText) {
    return {
      success: true,
      dispatchCode: String(geminiResult.dispatchCode),
      reportText: String(geminiResult.reportText),
      source: 'gemini_live',
      latency_ms: Date.now() - startTime
    };
  }

  // Fallback bức điện khẩn cấp
  const dispatchCode = `CD-TKCN-${Date.now().toString().slice(-4)}`;
  const hazardDesc = rawList.length > 0 ? rawList.join('; ') : 'Sạt lở sườn dốc taluy và suối lũ dâng cao chia cắt cục bộ';
  const reportText = `BỨC ĐIỆN KHẨN CẤP GỬI BAN CHỈ HUY PCTT&TKCN HUYỆN:
- Căn cứ tình hình thực địa tại địa bàn xã/thôn, báo cáo ghi nhận các điểm xung yếu: ${hazardDesc}.
- Tình hình nhân mạng: Toàn bộ học sinh và đoàn sơ tán đã tiếp cận đỉnh đồi an toàn tại nhà cộng đồng.
- Đề xuất ứng phó khẩn cấp: Đề nghị Huyện điều động công binh thông tuyến giao thông, chi viện xuồng cao su cứu hộ và tiếp tế lương thực khô, nước sạch và cơ số thuốc men phòng chống hạ thân nhiệt.`;

  return {
    success: true,
    dispatchCode,
    reportText,
    source: 'fallback_offline',
    latency_ms: Date.now() - startTime
  };
}

/**
 * Endpoint 4: Phản biện giải pháp y tế 3 ca khủng hoảng (Chapter 5)
 */
async function handleMedicalTriage({ caseId = '', solutionText = '' } = {}) {
  const startTime = Date.now();
  const id = String(caseId || '').toLowerCase().trim();
  const cleanSolution = String(solutionText || '').trim();

  const systemPrompt = `Bạn là Chuyên gia Cứu thương của Hội Chữ thập đỏ Việt Nam trong bối cảnh ứng phó thiên tai lũ quét.
Nhiệm vụ: Đánh giá phương án sơ cứu của người chơi cho ca cấp cứu hiện trường.
Các ca bệnh:
1. hypothermia: Hạ thân nhiệt sau ngâm nước lũ (Chuẩn: lau khô, thay đồ khô, ủ ấm ngực/bụng/nách từ từ, uống nước ấm. Cấm: hơ trực tiếp vào lửa đỏ, sưởi nóng đột ngột, xoa bóp mạnh tứ chi).
2. co_hazard / stove: Ngạt khí độc CO do đốt bếp than sưởi ấm trong phòng kín (Chuẩn: mở toang cửa sổ thông gió, dập tắt bếp và mang ra ngoài hiên thoáng khí, đưa nạn nhân ra nơi thoáng khí).
3. laceration / wound: Vết rách bắp chân dính bùn đất (Chuẩn: rửa sạch bằng nước sạch/muối sinh lý, sát khuẩn, băng ép cầm máu vô trùng. Cấm: đắp lá rừng, bôi tro than bừa bãi).

Trả về duy nhất định dạng JSON:
{
  "approved": boolean,
  "critique": "string (nhận xét chuyên môn y tế giải thích cặn kẽ và ngắn gọn)"
}`;

  const userPrompt = `Ca bệnh ID: "${id}"\nPhương án sơ cứu của người chơi: "${cleanSolution}"`;

  const geminiResult = await callGeminiJson(systemPrompt, userPrompt);
  if (geminiResult && typeof geminiResult.approved === 'boolean' && geminiResult.critique) {
    return {
      success: true,
      approved: geminiResult.approved,
      critique: String(geminiResult.critique),
      source: 'gemini_live',
      latency_ms: Date.now() - startTime
    };
  }

  // Safe offline medical rubric
  const text = cleanSolution.toLowerCase();
  let approved = false;
  let critique = '';

  if (id === 'hypothermia') {
    const dangerousPatterns = [
      /hơ\s+(?:trực\s+tiếp\s+)?(?:vào\s+)?lửa/,
      /sát\s+bếp\s+lửa/,
      /hơ\s+nóng/,
      /xoa\s+bóp\s+thật\s+mạnh/
    ];
    const hasDanger = dangerousPatterns.some(pat => pat.test(text) && !/(?:không|tránh|chớ)\s+.*hơ/i.test(text));

    const safePatterns = [
      /ủ\s+ấm/,
      /lau\s+khô/,
      /quần\s+áo\s+khô/,
      /chăn\s+ấm/,
      /từ\s+từ/,
      /ngực/,
      /bụng/,
      /nước\s+ấm/,
      /trà\s+gừng/
    ];
    const hasSafe = safePatterns.filter(pat => pat.test(text)).length >= 2;

    if (hasDanger) {
      approved = false;
      critique = 'Sai phương pháp nguy hiểm! Tuyệt đối không được hơ lửa trực tiếp hay làm nóng đột ngột nạn nhân hạ thân nhiệt, vì sẽ gây giãn mạch ngoại vi đột ngột làm tụt huyết áp và nguy cơ loạn nhịp tim. Cần ủ ấm trung tâm từ từ bằng chăn và quần áo khô.';
    } else if (hasSafe) {
      approved = true;
      critique = 'Chính xác! Lau khô, thay quần áo khô và ủ ấm vùng lõi cơ thể (ngực, bụng) từ từ bằng chăn ấm là phác đồ sơ cứu chuẩn quốc tế của Hội Chữ thập đỏ.';
    } else {
      approved = false;
      critique = 'Phương án chưa đầy đủ. Đối với ca hạ thân nhiệt, cần khẩn trương lau khô, thay quần áo khô và ủ ấm trung tâm từ từ.';
    }
  } else if (id === 'co_hazard' || id === 'stove') {
    const dangerousPatterns = [
      /đóng\s+kín\s+cửa/,
      /tiếp\s+tục\s+đốt/,
      /để\s+than\s+trong\s+phòng/
    ];
    const hasDanger = dangerousPatterns.some(pat => pat.test(text));

    const safePatterns = [
      /mở\s+(?:toang\s+)?cửa/,
      /thông\s+gió/,
      /dập\s+tắt/,
      /mang\s+ra\s+ngoài/,
      /thoáng\s+khí/,
      /ra\s+ngoài\s+hiên/
    ];
    const hasSafe = safePatterns.filter(pat => pat.test(text)).length >= 2;

    if (hasDanger) {
      approved = false;
      critique = 'Cực kỳ nguy hiểm! Đốt than trong phòng kín sinh khí CO không màu không mùi gây ngạt thở và tử vong nhanh chóng. Phải mở toang cửa ngay lập tức!';
    } else if (hasSafe) {
      approved = true;
      critique = 'Rất chuẩn xác! Mở toang cửa cho không khí lưu thông và di chuyển bếp than ra ngoài hiên thoáng khí là cách xử lý sống còn để ngăn ngộ độc khí CO.';
    } else {
      approved = false;
      critique = 'Chưa đạt! Cần ưu tiên mở cửa sổ thông gió và mang bếp than ra nơi thoáng khí ngay lập tức.';
    }
  } else if (id === 'laceration' || id === 'wound') {
    const dangerousPatterns = [
      /đắp\s+lá/,
      /bôi\s+tro/,
      /bột\s+than/,
      /bịt\s+bùn/
    ];
    const hasDanger = dangerousPatterns.some(pat => pat.test(text));

    const safePatterns = [
      /rửa/,
      /nước\s+sạch/,
      /sát\s+trùng/,
      /nước\s+muối/,
      /băng\s+ép/,
      /cầm\s+máu/
    ];
    const hasSafe = safePatterns.filter(pat => pat.test(text)).length >= 2;

    if (hasDanger) {
      approved = false;
      critique = 'Sai phương pháp nguy hiểm! Đắp lá cây hoặc tro than bẩn vào vết rách hở dính bùn dễ dẫn đến nhiễm trùng uốn ván hoại tử. Phải rửa sạch và sát trùng vết thương.';
    } else if (hasSafe) {
      approved = true;
      critique = 'Chính xác! Rửa sạch bằng nước muối sinh lý hoặc nước sạch, sát khuẩn và băng ép cố định vết thương giúp ngăn nhiễm trùng hiệu quả.';
    } else {
      approved = false;
      critique = 'Chưa đủ điều kiện an toàn. Cần rửa sạch bùn đất bằng nước sạch, sát trùng và băng ép cầm máu.';
    }
  } else {
    approved = cleanSolution.length > 15;
    critique = approved ? 'Phương án xử lý phù hợp với nguyên tắc sơ cứu ban đầu.' : 'Cần nêu rõ phương án sơ cứu an toàn.';
  }

  return {
    success: true,
    approved,
    critique,
    source: 'fallback_offline',
    latency_ms: Date.now() - startTime
  };
}

module.exports = {
  handleChapterDebrief,
  handleBridgeBlueprint,
  handleIncidentDispatch,
  handleMedicalTriage
};
