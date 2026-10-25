/* Shared, versioned handoff. The chapter saves remain independent checkpoints. */
(function (root) {
  'use strict';
  const keys = {
    chapter01: 'ongdia.scene1.v1',
    chapter02: 'ongdia.chapter02.v2',
    chapter03: 'ongdia.chapter03.v1',
    chapter04: 'ongdia.chapter04.v1',
    chapter05: 'ongdia.chapter05.v1'
  };

  function origin(raw) {
    if (!raw || raw.version !== 1 || raw.Scene1Completed !== true || raw.started !== true) return null;
    const hasBear = raw.LockerOpened === true;
    const flags = ['ClueBoardFound', 'RouteUnderstood', 'SafetyIntervention', 'PrioritizedLeaving', 'LeftAtLowTime'];
    const choices = Object.fromEntries(flags.map(key => [key, raw[key] === true]));
    return {
      version: 1,
      id: typeof raw.runId === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(raw.runId) ? raw.runId : 'legacy-' + [hasBear, ...Object.values(choices)].map(Number).join(''),
      hasBear, choices,
      settings: { sound: raw.settings?.sound !== false, reduced: raw.settings?.reducedMotion === true }
    };
  }

  function restoreOrigin(raw) {
    if (!raw || raw.version !== 1 || typeof raw.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(raw.id)) return null;
    return {
      version: 1, id: raw.id, hasBear: raw.hasBear === true,
      choices: Object.fromEntries(['ClueBoardFound', 'RouteUnderstood', 'SafetyIntervention', 'PrioritizedLeaving', 'LeftAtLowTime'].map(key => [key, raw.choices?.[key] === true])),
      settings: { sound: raw.settings?.sound === true, reduced: raw.settings?.reduced === true }
    };
  }

  function attach(state, previous) {
    const context = restoreOrigin(previous);
    return context ? { ...state, origin: context, settings: { ...state.settings, ...context.settings } } : state;
  }

  function read(key) {
    try {
      const storage = root.localStorage;
      return storage ? JSON.parse(storage.getItem(key)) : null;
    } catch {
      return null;
    }
  }

  function readOrigin() {
    return origin(read(keys.chapter01));
  }

  function newRunId() {
    return root.crypto?.randomUUID?.() || 'run-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function sameJourney(state, context) {
    return !!state?.started && !!context && state.origin?.id === context.id;
  }

  function canContinue(chapterOne, chapterTwo) {
    if (chapterTwo?.version !== 2 || chapterTwo.started !== true || !['gate', 'junction', 'hill', 'suspension', 'north', 'concrete', 'highroad', 'refuge'].includes(chapterTwo.scene)) return false;
    if (!chapterOne?.runId) return true;
    if (chapterTwo.origin?.id) return chapterTwo.origin.id === chapterOne.runId;
    return chapterOne.Scene1Completed === true;
  }

  function summary(context) {
    if (!context) return 'Bạn gặp nhóm tại cổng trường. Các quyết định của Chương 01 chưa được ghi lại.';
    if (context.hasBear) return 'Duyên đã lấy được gấu. Cả nhóm rời lớp và đi cùng cô Thảo.';
    if (context.choices.SafetyIntervention) return 'Nhóm đã nghe cô Thảo và rời lớp; gấu bông ở lại trong tủ.';
    return 'Bạn đã ưu tiên rời lớp cùng nhóm. Gấu bông của Duyên ở lại trong tủ.';
  }

  function getOverallProgress(customStorage) {
    const getItem = (k) => {
      if (customStorage && typeof customStorage[k] !== 'undefined') {
        try { return JSON.parse(customStorage[k]); } catch { return null; }
      }
      return read(k);
    };

    const ch1 = getItem(keys.chapter01);
    const ch2 = getItem(keys.chapter02);
    const ch3 = getItem(keys.chapter03);
    const ch4 = getItem(keys.chapter04);
    const ch5 = getItem(keys.chapter05);

    let completedCount = 0;
    if (ch1?.Scene1Completed) completedCount++;
    if (ch2?.complete) completedCount++;
    if (ch3?.complete) completedCount++;
    if (ch4?.complete) completedCount++;
    if (ch5?.complete) completedCount++;

    let currentChapter = 1;
    if (ch1?.Scene1Completed) currentChapter = 2;
    if (ch2?.complete) currentChapter = 3;
    if (ch3?.complete) currentChapter = 4;
    if (ch4?.complete) currentChapter = 5;
    if (ch5?.complete) currentChapter = 5;

    const percent = Math.min(100, Math.round((completedCount / 5) * 100));

    return {
      totalChapters: 5,
      completedCount,
      currentChapter,
      percent,
      chapters: {
        ch1: !!ch1?.Scene1Completed,
        ch2: !!ch2?.complete,
        ch3: !!ch3?.complete,
        ch4: !!ch4?.complete,
        ch5: !!ch5?.complete
      }
    };
  }

  const api = {
    keys,
    origin,
    restoreOrigin,
    attach,
    read,
    readOrigin,
    newRunId,
    sameJourney,
    canContinue,
    summary,
    getOverallProgress
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StoryJourney = api;
})(typeof window === 'object' ? window : globalThis);
