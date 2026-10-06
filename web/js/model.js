(function (root) {
  'use strict';
  const Navigation = root.SceneNavigation || (typeof require === 'function' ? require('./navigation.js') : null);
  const PHASES = ['intro', 'explore', 'choice', 'puzzle', 'teacher', 'rules', 'radio', 'hallway', 'finale', 'complete'];
  const CODE = ['↑', '→', '↑', '→'];
  const DIRECTIONS = ['↑', '→', '↓', '←'];
  const fresh = () => ({
    version: 1, started: false, phase: 'intro', location: 'exterior',
    SafeTime: 3, LockerOpened: false, EvacuatedWithoutBear: false,
    ClueBoardFound: false, RouteUnderstood: false, LockerAttempt: 0,
    Scene1Completed: false, SafetyIntervention: false, PrioritizedLeaving: false,
    LeftAtLowTime: false, TriedBeforeClue: false, HintLevel: 0, LastChoiceMade: false,
    routeStarted: false, routeProgress: 0, lockInput: [], visited: [],
    inventory: [], dialogue: null, player: { x: 51, y: 84 }, escortX: 35, escortMoving: false,
    hallwayStep: 0, hallwayTalked: false, elapsed: 0,
    settings: { sound: true, reducedMotion: false, showSpots: false },
    savedAt: null
  });
  function step(previous, action) {
    const s = JSON.parse(JSON.stringify(previous));
    switch (action.type) {
      case 'START': s.started = true; s.phase = 'intro'; s.dialogue = { id: 'opening', index: 0 }; break;
      case 'VISIT': if (!s.visited.includes(action.id)) s.visited.push(action.id); break;
      case 'CLUE': if (s.phase === 'puzzle') s.ClueBoardFound = true; break;
      case 'ROUTE_START': if (s.phase === 'puzzle') { s.routeStarted = true; s.routeProgress = 0; } break;
      case 'ROUTE_SEGMENT':
        if (s.phase === 'puzzle' && s.routeStarted && action.index === s.routeProgress && s.routeProgress < 4) {
          s.routeProgress++;
          if (s.routeProgress === 4) s.RouteUnderstood = true;
        }
        break;
      case 'DIRECTION':
        if (s.phase === 'puzzle' && s.SafeTime > 0 && DIRECTIONS.includes(action.value) && s.lockInput.length < 4) s.lockInput.push(action.value);
        break;
      case 'CLEAR': s.lockInput = []; break;
      case 'SUBMIT':
        if (s.phase !== 'puzzle' || s.SafeTime <= 0 || s.lockInput.length !== 4) break;
        s.LockerAttempt++;
        if (!s.ClueBoardFound) s.TriedBeforeClue = true;
        if (s.lockInput.every((direction, index) => direction === CODE[index])) {
          s.LockerOpened = true; s.inventory = ['bear']; s.phase = 'teacher'; s.dialogue = { id: 'success', index: 0 };
        } else {
          s.SafeTime = Math.max(0, s.SafeTime - 1);
          s.HintLevel = Math.max(s.HintLevel, 3 - s.SafeTime);
          if (s.SafeTime === 0) {
            s.SafetyIntervention = true; s.EvacuatedWithoutBear = true; s.phase = 'teacher'; s.dialogue = { id: 'intervention', index: 0 };
          } else s.dialogue = { id: s.SafeTime === 2 ? 'wrong-first' : 'wrong-second', index: 0 };
        }
        s.lockInput = [];
        break;
      case 'LEAVE':
        if (s.phase === 'puzzle') {
          s.EvacuatedWithoutBear = true; s.LeftAtLowTime = s.SafeTime === 1;
          s.phase = 'teacher'; s.dialogue = { id: 'leave', index: 0 }; s.lockInput = [];
        }
        break;
      case 'HINT': if (s.phase === 'puzzle') s.HintLevel = Math.min(4, s.HintLevel + 1); break;
      case 'LAST_TRY': s.LastChoiceMade = true; s.dialogue = { id: 'last-try', index: 0 }; break;
      case 'DIALOGUE': s.dialogue = { id: action.id, index: 0 }; break;
      case 'NEXT_LINE': if (s.dialogue) s.dialogue.index++; break;
      case 'END_DIALOGUE': s.dialogue = null; break;
      case 'PHASE': if (PHASES.includes(action.phase)) s.phase = action.phase; break;
      case 'INITIAL_CHOICE': s.PrioritizedLeaving = action.leave; s.phase = 'puzzle'; s.dialogue = { id: action.leave ? 'choice-leave' : 'choice-search', index: 0 }; break;
      case 'LOCATION': if (['exterior', 'classroom', 'hallway'].includes(action.location)) s.location = action.location; break;
      case 'HALLWAY':
        s.phase = 'hallway'; s.location = 'hallway'; s.player = { x: 23, y: 84 }; s.escortX = 35; s.escortMoving = false; s.hallwayStep = 0;
        s.dialogue = { id: 'hallway-start', index: 0 }; break;
      case 'BEGIN_FOLLOW':
        if (s.phase === 'hallway' && !s.dialogue && !s.escortMoving) {
          s.escortX = Math.min(82, 35 + (s.hallwayStep + 1) * 16); s.escortMoving = true;
        }
        break;
      case 'FOLLOW':
        if (s.phase === 'hallway' && !s.dialogue) {
          s.escortMoving = false;
          s.hallwayStep = Math.min(3, s.hallwayStep + 1);
          s.escortX = Math.min(82, 35 + s.hallwayStep * 16);
          if (s.hallwayStep === 1 && !s.hallwayTalked) { s.hallwayTalked = true; s.dialogue = { id: s.LockerOpened ? 'walking-bear' : 'walking-no-bear', index: 0 }; }
          if (s.hallwayStep === 3) { s.phase = 'finale'; s.dialogue = { id: 'fork', index: 0 }; }
        }
        break;
      case 'COMPLETE':
        if (s.phase === 'finale') { s.Scene1Completed = true; s.phase = 'complete'; s.dialogue = null; }
        break;
      case 'MOVE':
        if (Navigation && Number.isFinite(action.x) && Number.isFinite(action.y)) {
          s.player = Navigation.move(s.player, { x: action.x, y: action.y }, s.location === 'hallway' ? 'hallway' : 'classroom', s.escortX);
        }
        break;
      case 'SETTINGS':
        for (const key of ['sound', 'reducedMotion', 'showSpots']) if (typeof action[key] === 'boolean') s.settings[key] = action[key]; break;
      case 'ELAPSED': s.elapsed = Math.max(0, Math.min(86400, Number(action.value) || 0)); break;
    }
    return s;
  }
  function restore(raw) {
    if (!raw || raw.version !== 1 || typeof raw.started !== 'boolean' || !PHASES.includes(raw.phase)) return null;
    const s = fresh();
    for (const key of ['started', 'LockerOpened', 'EvacuatedWithoutBear', 'ClueBoardFound', 'RouteUnderstood', 'Scene1Completed', 'SafetyIntervention', 'PrioritizedLeaving', 'LeftAtLowTime', 'TriedBeforeClue', 'routeStarted', 'hallwayTalked', 'LastChoiceMade', 'escortMoving']) s[key] = raw[key] === true;
    s.SafeTime = Number.isInteger(raw.SafeTime) ? Math.max(0, Math.min(3, raw.SafeTime)) : 3;
    s.LockerAttempt = Number.isInteger(raw.LockerAttempt) ? Math.max(0, raw.LockerAttempt) : 0;
    s.HintLevel = Number.isInteger(raw.HintLevel) ? Math.max(0, Math.min(4, raw.HintLevel)) : 0;
    s.phase = raw.phase;
    s.location = ['exterior', 'classroom', 'hallway'].includes(raw.location) ? raw.location : 'classroom';
    s.routeProgress = Math.max(0, Math.min(4, Number(raw.routeProgress) || 0));
    s.lockInput = Array.isArray(raw.lockInput) ? raw.lockInput.filter(x => DIRECTIONS.includes(x)).slice(0, 4) : [];
    s.inventory = s.LockerOpened ? ['bear'] : [];
    s.visited = Array.isArray(raw.visited) ? raw.visited.filter(x => typeof x === 'string').slice(0, 30) : [];
    s.player = { x: Math.max(15, Math.min(92, Number(raw.player?.x) || 51)), y: Math.max(72, Math.min(94, Number(raw.player?.y) || 86)) };
    s.escortX = Math.max(33, Math.min(82, Number(raw.escortX) || 33));
    if (Navigation) s.player = Navigation.project(s.player, s.location === 'hallway' ? 'hallway' : 'classroom', s.escortX) || fresh().player;
    s.hallwayStep = Math.max(0, Math.min(3, Number(raw.hallwayStep) || 0));
    s.elapsed = Math.max(0, Math.min(86400, Number(raw.elapsed) || 0));
    s.settings = { ...s.settings, ...Object.fromEntries(Object.entries(raw.settings || {}).filter(([k, v]) => k in s.settings && typeof v === 'boolean')) };
    if (raw.dialogue && typeof raw.dialogue.id === 'string' && Number.isInteger(raw.dialogue.index) && raw.dialogue.index >= 0) s.dialogue = { id: raw.dialogue.id, index: raw.dialogue.index };
    if (s.Scene1Completed) { s.phase = 'complete'; s.dialogue = null; }
    return s;
  }
  function achievements(s) {
    const result = [];
    if (s.ClueBoardFound && s.HintLevel < 2) result.push('Nhà quan sát');
    if (s.LockerOpened && s.LockerAttempt === 1) result.push('Giải mã');
    if (s.LeftAtLowTime) result.push('An toàn trước tiên');
    if (s.ClueBoardFound && !s.TriedBeforeClue && s.LockerAttempt > 0) result.push('Không thử đại');
    return result;
  }
  const api = { fresh, step, restore, achievements, CODE };
  root.SceneModel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
