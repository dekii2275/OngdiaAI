(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    root.SauConMuaTelemetry = exports;
    root.TelemetryLogger = exports.TelemetryLogger;
    root.evaluateRubric = exports.evaluateRubric;
    root.generateEducatorReport = exports.generateEducatorReport;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class TelemetryLogger {
    constructor(sessionId) {
      this.sessionId = sessionId || 'session-' + Date.now();
      this.startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      this.seenEventIds = new Set();
      this.events = [];
    }

    logEvent(event) {
      if (!event || !event.event_id) return false;
      if (this.seenEventIds.has(event.event_id)) return false;
      this.seenEventIds.add(event.event_id);

      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const elapsed_ms = Math.max(0, Math.round(now - this.startTime));
      const loggedEvent = {
        ...event,
        session_id: this.sessionId,
        elapsed_ms
      };
      this.events.push(loggedEvent);
      return true;
    }

    getEvents() {
      return [...this.events];
    }
  }

  function evaluateRubric(events) {
    const evts = Array.isArray(events) ? events : [];
    const decisions = ['D1', 'D2', 'D3', 'D4'];
    const scores = { D1: 0, D2: 0, D3: 0, D4: 0 };
    const safeChoices = {
      D1: ['report_teacher'],
      D2: ['describe_crack', 'need_help_describing', 'unsure', 'still_unsure', 'ground_crack', 'tilted_tree', 'muddy_stream'],
      D3: ['continue_with_teacher', 'ask_teacher'],
      D4: ['guided_route']
    };

    const isCompleted = evts.some(e => e.type === 'session_completed' || e.stage === 'S5' || e.stage === 'END');

    for (const d of decisions) {
      const dEvents = evts.filter(e => e.type === 'choice_selected' && e.decision_id === d);
      if (dEvents.length === 0) {
        scores[d] = 0;
        continue;
      }

      // Check all choices made for this decision
      const firstEvent = dEvents[0];
      const payload = firstEvent.payload || {};
      const firstChoice = payload.choice_id || firstEvent.choice_id;
      const attempt = payload.attempt || firstEvent.attempt || 1;
      const support = payload.support_before_choice || firstEvent.support_before_choice || 'none';

      const isFirstChoiceSafe = safeChoices[d].includes(firstChoice);
      const isIndependentChoice = (d === 'D2') ? (firstChoice === 'describe_crack') : isFirstChoiceSafe;

      if (dEvents.length === 1 && attempt === 1 && support === 'none' && isIndependentChoice) {
        scores[d] = 2; // Independent
      } else {
        // Solved with support / multiple attempts / help substage
        const resolved = dEvents.some(e => {
          const c = (e.payload && e.payload.choice_id) || e.choice_id;
          return safeChoices[d].includes(c);
        });
        scores[d] = resolved ? 1 : 0;
      }
    }

    const totalScore = scores.D1 + scores.D2 + scores.D3 + scores.D4;
    const childCards = {
      tell_adult: scores.D1 >= 1,
      safety_first: scores.D3 >= 1,
      stay_with_group: scores.D4 >= 1
    };

    return {
      status: isCompleted ? 'completed' : 'incomplete',
      scores,
      totalScore,
      childCards
    };
  }

  function generateEducatorReport(events) {
    const evts = Array.isArray(events) ? events : [];
    const rubric = evaluateRubric(evts);

    let minElapsed = Infinity;
    let maxElapsed = 0;
    evts.forEach(e => {
      const ms = Number(e.elapsed_ms || 0);
      if (ms < minElapsed) minElapsed = ms;
      if (ms > maxElapsed) maxElapsed = ms;
    });
    const totalDurationMs = maxElapsed >= minElapsed ? (maxElapsed - minElapsed) : 0;

    const hadApproachAttempt = evts.some(e => {
      const c = (e.payload && e.payload.choice_id) || e.choice_id;
      return c === 'approach_cue';
    });

    const hadReturnAttempt = evts.some(e => {
      const c = (e.payload && e.payload.choice_id) || e.choice_id;
      return c === 'return_for_drawing';
    });

    const hadShortcutAttempt = evts.some(e => {
      const c = (e.payload && e.payload.choice_id) || e.choice_id;
      return c === 'closed_shortcut';
    });

    const hintsCount = evts.filter(e => e.type === 'hint_shown').length;

    const objectives = {
      LO1: {
        id: 'LO1',
        title: 'Báo người lớn khi thấy bất thường',
        achieved: rubric.scores.D1 >= 1 && rubric.scores.D2 >= 1,
        details: `Điểm D1: ${rubric.scores.D1}/2, Điểm D2: ${rubric.scores.D2}/2`
      },
      LO2: {
        id: 'LO2',
        title: 'Tránh tiến gần vùng nghi ngờ sạt lở',
        achieved: !hadApproachAttempt,
        details: hadApproachAttempt ? 'Có tò mò muốn lại gần, đã được cô giải thích ngăn lại' : 'Tuyệt đối giữ khoảng cách an toàn ngay từ đầu'
      },
      LO3: {
        id: 'LO3',
        title: 'Ưu tiên an toàn hơn việc lấy đồ bỏ quên',
        achieved: rubric.scores.D3 >= 1 && !hadReturnAttempt,
        details: `Điểm D3: ${rubric.scores.D3}/2`
      },
      LO4: {
        id: 'LO4',
        title: 'Tuân thủ di chuyển theo tuyến được hướng dẫn',
        achieved: rubric.scores.D4 >= 1 && !hadShortcutAttempt,
        details: `Điểm D4: ${rubric.scores.D4}/2`
      }
    };

    return {
      sessionId: (evts[0] && evts[0].session_id) || 'session-default',
      status: rubric.status,
      summaryScore: `${rubric.totalScore}/8`,
      totalDurationMs,
      hintsCount,
      rubricScores: rubric.scores,
      objectives,
      eventLog: evts
    };
  }

  return {
    TelemetryLogger,
    evaluateRubric,
    generateEducatorReport
  };
}));
