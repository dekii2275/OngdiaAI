(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SauConMuaLoader = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function loadAndValidateScenario(rawJson) {
    const data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    if (!data.id || data.id !== 'sau_con_mua_01') {
      throw new Error('Invalid scenario ID: must be sau_con_mua_01');
    }
    if (!Array.isArray(data.stages) || data.stages.length < 6) {
      throw new Error('Scenario must contain all required stages (S0-S5, END)');
    }
    if (!Array.isArray(data.cues) || data.cues.length === 0) {
      throw new Error('Scenario must define cues');
    }
    if (!Array.isArray(data.recap) || data.recap.length < 3) {
      throw new Error('Scenario must define at least 3 recap items (R1-R3)');
    }
    return data;
  }

  return { loadAndValidateScenario };
}));
