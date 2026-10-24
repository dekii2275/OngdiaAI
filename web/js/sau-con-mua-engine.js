(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SauConMuaEngine = factory().SauConMuaEngine;
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class SauConMuaEngine {
    constructor(scenarioConfig) {
      if (!scenarioConfig) throw new Error('scenarioConfig is required');
      this.config = scenarioConfig;
      this.state = this._getInitialState();
    }

    _getInitialState() {
      return {
        stage: 'S0',
        stage_revision: 0,
        observed_cues: [],
        first_choice_by_decision: {},
        attempts_by_decision: {},
        support_by_decision: { D1: false, D2: false, D3: false, D4: false },
        teacher_instruction_received: false,
        minh_resolved: false,
        arrived: false,
        recap_first_answers: {},
        recap_attempts: {},
        session_status: 'active'
      };
    }

    getState() {
      return JSON.parse(JSON.stringify(this.state));
    }

    dispatch(action) {
      const s = JSON.parse(JSON.stringify(this.state));
      let response = { success: true, movement: 'allowed', feedback: null };

      switch (action.type) {
        case 'START':
          s.stage = 'S1';
          s.stage_revision++;
          if (!s.observed_cues.includes('ground_crack')) {
            s.observed_cues.push('ground_crack');
          }
          break;

        case 'VIEW_CUE':
          if (action.cue_id && !s.observed_cues.includes(action.cue_id)) {
            s.observed_cues.push(action.cue_id);
          }
          break;

        case 'HINT_TIMEOUT':
          if (action.decision_id) {
            s.support_by_decision[action.decision_id] = true;
          }
          break;

        case 'CHOOSE': {
          const currentStageDef = this._findStageDef(s.stage);
          if (!currentStageDef) break;

          const decisionId = currentStageDef.decision_id || (s.stage === 'S2_HELP' ? 'D2' : null);
          const choice = this._findChoice(currentStageDef, s.stage, action.choice_id);

          if (!choice) {
            response.success = false;
            break;
          }

          if (decisionId) {
            s.attempts_by_decision[decisionId] = (s.attempts_by_decision[decisionId] || 0) + 1;
            if (!s.first_choice_by_decision[decisionId]) {
              s.first_choice_by_decision[decisionId] = choice.id;
            }
          }

          if (choice.counts_as_support && decisionId) {
            s.support_by_decision[decisionId] = true;
          }

          response.feedback = choice.feedback || null;

          if (choice.safe === false) {
            response.movement = 'blocked';
          } else {
            if (choice.set) {
              Object.assign(s, choice.set);
            }

            let beforeExit = currentStageDef.before_exit;
            if (!beforeExit && s.stage === 'S2_HELP') {
              const s2 = (this.config.stages || []).find(st => st.id === 'S2');
              if (s2 && s2.before_exit) beforeExit = s2.before_exit;
            }

            if (beforeExit && choice.next_stage !== 'S2_HELP') {
              if (beforeExit.set) {
                Object.assign(s, beforeExit.set);
              }
            }

            if (choice.next_stage) {
              s.stage = choice.next_stage;
              s.stage_revision++;
            }
          }
          break;
        }

        case 'RECAP_ANSWER': {
          const recapDef = (this.config.recap || []).find(r => r.id === action.recap_id);
          if (recapDef) {
            const ch = (recapDef.choices || []).find(c => c.id === action.recap_choice_id);
            if (ch) {
              const isCorrect = ch.correct === true;
              s.recap_attempts[action.recap_id] = (s.recap_attempts[action.recap_id] || 0) + 1;
              if (s.recap_first_answers[action.recap_id] === undefined) {
                s.recap_first_answers[action.recap_id] = isCorrect;
              }
              response.correct = isCorrect;
            }
          }
          break;
        }

        case 'REPLAY':
          this.state = this._getInitialState();
          return { success: true };
      }

      this.state = s;
      return response;
    }

    _findStageDef(stageId) {
      if (stageId === 'S2_HELP') {
        const s2 = (this.config.stages || []).find(st => st.id === 'S2');
        return s2 ? s2.support_substage : null;
      }
      return (this.config.stages || []).find(st => st.id === stageId);
    }

    _findChoice(stageDef, stageId, choiceId) {
      if (stageId === 'S2_HELP') {
        if (stageDef.completion_choice && stageDef.completion_choice.id === choiceId) {
          return { ...stageDef.completion_choice, safe: true, counts_as_support: true };
        }
        return {
          id: choiceId,
          safe: true,
          counts_as_support: true,
          next_stage: 'S3',
          set: { teacher_instruction_received: true }
        };
      }
      return (stageDef.choices || []).find(c => c.id === choiceId);
    }
  }

  return { SauConMuaEngine };
}));
