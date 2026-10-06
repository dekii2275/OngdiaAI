/* Shared, versioned handoff. The chapter saves remain independent checkpoints. */
(function (root) {
  'use strict';
  const keys = { chapter01: 'ongdia.scene1.v1', chapter02: 'ongdia.chapter02.v2' };
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
    return { version: 1, id: raw.id, hasBear: raw.hasBear === true,
      choices: Object.fromEntries(['ClueBoardFound', 'RouteUnderstood', 'SafetyIntervention', 'PrioritizedLeaving', 'LeftAtLowTime'].map(key => [key, raw.choices?.[key] === true])),
      settings: { sound: raw.settings?.sound === true, reduced: raw.settings?.reduced === true } };
  }
  function attach(state, previous) {
    const context = restoreOrigin(previous);
    return context ? { ...state, origin: context, settings: { ...state.settings, ...context.settings } } : state;
  }
  function read(key) { try { return JSON.parse(root.localStorage.getItem(key)); } catch { return null; } }
  function readOrigin() { return origin(read(keys.chapter01)); }
  function newRunId() { return root.crypto?.randomUUID?.() || 'run-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,10); }
  function sameJourney(state, context) { return !!state?.started && !!context && state.origin?.id === context.id; }
  function canContinue(chapterOne, chapterTwo) {
    if (chapterTwo?.version !== 2 || chapterTwo.started !== true || !['gate','junction','hill','suspension','north','concrete','highroad','refuge'].includes(chapterTwo.scene)) return false;
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
  const api = { keys, origin, restoreOrigin, attach, read, readOrigin, newRunId, sameJourney, canContinue, summary };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.StoryJourney = api;
})(typeof window === 'object' ? window : globalThis);
