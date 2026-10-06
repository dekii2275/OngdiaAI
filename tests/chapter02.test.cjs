const test=require('node:test');
const assert=require('node:assert/strict');
const D=require('../web/js/chapter02-data.js');
const P=require('../web/js/chapter02-puzzles.js');
test('all eight locations are reachable and every connection permits a return',()=>{
 const reached=new Set(['gate']),todo=['gate'];while(todo.length){const id=todo.shift();for(const to of D.scenes[id].links){assert.ok(D.scenes[to]);assert.ok(D.scenes[to].links.includes(id),id+' ↔ '+to);if(!reached.has(to)){reached.add(to);todo.push(to);}}}assert.equal(reached.size,8);
});
test('forward connections require their local puzzle, return connections remain open',()=>{
 for(const [from,to,id] of [['gate','junction','gate'],['junction','hill','junction'],['junction','north','junction'],['north','concrete','north'],['highroad','refuge','highroad']]){
  const s=D.initial();s.scene=from;assert.equal(D.canTravel(s,to),false);s.solved.push(id);assert.equal(D.canTravel(s,to),true);s.scene=to;assert.equal(D.canTravel(s,from),true);
 }
});
test('sequence puzzles reject incomplete, reordered and distractor answers',()=>{
 for(const id of ['gate','concrete','highroad']){const answer=P.puzzles[id].answer;assert.equal(P.correct(id,answer),true);assert.equal(P.correct(id,answer.slice(1)),false);assert.equal(P.correct(id,[...answer].reverse()),false);assert.equal(P.correct(id,[...answer,'village']),false);}
});
test('matching puzzles require all observation relationships and route distances',()=>{
 for(const id of ['junction','north']){const answer=P.puzzles[id].answer;assert.equal(P.correct(id,answer),true);assert.equal(P.correct(id,{}),false);const wrong={...answer};wrong[Object.keys(wrong)[0]]='wrong';assert.equal(P.correct(id,wrong),false);}
});
test('old saved journeys migrate solved puzzles without losing progress',()=>{
 const raw=D.initial();delete raw.solved;raw.visited=['gate','junction','hill','north','concrete'];raw.judged=['hill'];raw.clues=['rock'];const s=D.restore(raw);assert.deepEqual(s.solved,['gate','junction','hill','north']);assert.deepEqual(s.clues,['rock']);
 const modern=D.initial();modern.solved=['gate','gate','bad'];assert.deepEqual(D.restore(modern).solved,['gate']);
});
test('bridge blocks until all observations, judgments and guide confirmation exist',()=>{
 const s=D.initial();s.scene='concrete';assert.equal(D.canTravel(s,'highroad'),false);s.clues=Object.values(D.required).flat();s.judged=['hill','suspension'];assert.equal(D.canCross(s),false);s.manh=true;assert.equal(D.canCross(s),false);s.solved.push('concrete');assert.equal(D.canCross(s),true);assert.equal(D.canTravel(s,'highroad'),true);s.clues=s.clues.filter(id=>id!=='level');assert.equal(D.canCross(s),false);
});
test('save restoration filters malformed data and prevents skipping to far bank',()=>{
 const s=D.initial();s.scene='refuge';s.clues=['bad','rock','rock'];s.position={x:Infinity,y:-50};const restored=D.restore(s);assert.equal(restored.scene,'concrete');assert.deepEqual(restored.clues,['rock']);assert.equal(restored.position.x,48);assert.equal(D.restore({version:2,scene:'nonexistent'}),null);
});
test('inspection order is unrestricted and observations survive return journeys',()=>{
 for(const order of [['north','hill','suspension'],['suspension','north','hill'],['hill','suspension','north']]){const s=D.initial();s.scene='junction';s.solved.push('junction');for(const to of order){assert.ok(D.canTravel(s,to));s.scene=to;s.clues.push(...D.required[to]);assert.ok(D.canTravel(s,'junction'));s.scene='junction';}assert.equal(new Set(s.clues).size,10);assert.equal(D.canTravel(s,'refuge'),false);}
});
