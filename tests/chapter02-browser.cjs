// Development QA in a separate headless Chrome profile. No personal browser state is used.
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const baseURL = process.env.GAME_URL || 'http://localhost:4173';
let browser, socket;
const watchdog = setTimeout(() => { console.error('Browser QA timed out'); socket?.close(); browser?.kill(); process.exitCode = 1; }, 180000);
(async () => {
  const profile = await fs.mkdtemp(path.join(root, 'tmp', 'chrome-'));
  browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9338', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let target;
  for (let i = 0; i < 50; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9338/json/list')).json()).find(t => t.type === 'page'); if (target) break; } catch {}
    await wait(150);
  }
  if (!target) throw new Error('Headless Chrome did not start');
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onclose = event => { if (process.env.QA_DEBUG) console.log('CDP closed', event.code, event.reason); };
  socket.onerror = event => { if (process.env.QA_DEBUG) console.log('CDP error', event.message); };
  let serial = 0; const pending = new Map(), runtimeErrors = [], resourceErrors = [], fontResponses = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (process.env.QA_DEBUG) console.log('CDP', JSON.stringify(message).slice(0, 250));
    if (message.id) { const callbacks = pending.get(message.id); pending.delete(message.id); if (callbacks) message.error ? callbacks.reject(message.error) : callbacks.resolve(message.result); }
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text + ': ' + message.params.exceptionDetails.exception?.description);
    if (message.method === 'Network.responseReceived') {
      const response = message.params.response;
      if (response.url.includes('/web/') && response.status >= 400) resourceErrors.push(response.url + ': ' + response.status);
      if (response.url.endsWith('.ttf')) fontResponses.push(response);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 5000);
    pending.set(id, { resolve: value => { clearTimeout(timeout); resolve(value); }, reject: error => { clearTimeout(timeout); reject(error); } });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const click=selector=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e||e.disabled||e.closest('[hidden]'))throw Error('Unavailable '+${JSON.stringify(selector)});e.click();return true;})()`);
  const until=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await wait(60);}throw Error('Timed out '+expression);};
  const drain=async()=>{while(await evaluate("!document.querySelector('#dialogue').hidden"))await click('#next');};
  const spot=async id=>{const name=await evaluate("document.querySelector('#scene-name').textContent");await click(`[data-spot="${id}"]`);await until("!document.querySelector('#dialogue').hidden || !document.querySelector('#modal').hidden || document.querySelector('#scene-name').textContent!=="+JSON.stringify(name));};
  const solve=async(id)=>{
    const puzzle=require('../web/js/chapter02-puzzles.js').puzzles[id];
    await until("!!document.querySelector('#puzzle-submit')");
    await click('#puzzle-submit');assert.equal((await state()).solved.includes(id),false,'wrong or empty answer must not unlock');
    if(puzzle.kind==='sequence'){for(const key of puzzle.answer)await click('[data-card="'+key+'"]');}
    else for(const [key,value] of Object.entries(puzzle.answer))await evaluate("document.querySelector('[data-match=\""+key+"\"]').value="+JSON.stringify(value));
    await screenshot('puzzle-'+id);await click('#puzzle-submit');assert.ok((await state()).solved.includes(id));await click('#puzzle-done');
  };
  const state=()=>evaluate("JSON.parse(localStorage.getItem('ongdia.chapter02.v2'))");
  const directory=path.join(root,'output','qa','chapter02');await fs.mkdir(directory,{recursive:true});
  const screenshot=async name=>{await evaluate("document.fonts.ready");await wait(150);const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await fs.writeFile(path.join(directory,name+'.png'),Buffer.from(shot.data,'base64'));};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:baseURL+'/web/chapter02.html'});await wait(700);await evaluate("localStorage.removeItem('ongdia.chapter02.v2')");await send('Page.reload');await wait(500);
  await screenshot('01-title');await click('#start');await drain();await spot('to-junction');await solve('gate');await drain();await screenshot('02-junction');const arrow=await evaluate("(()=>{const b=document.querySelector('[data-spot=to-north]');const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");await send('Input.dispatchMouseEvent',{type:'mouseMoved',...arrow});await wait(200);assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-spot=to-north] .arrow-tip')).visibility"),'visible');await screenshot('arrow-destination');
  await spot('to-north');await solve('junction');await drain();await screenshot('03-north');
  for(const id of ['road','clearance','sign','manh']){await spot(id);await drain();}
  await spot('to-concrete');await solve('north');await drain();await screenshot('04-concrete');await spot('cross');assert.ok(await evaluate("document.querySelector('#panel').textContent.includes('Quan sát trước')"));await click('#close-panel');assert.equal((await state()).crossed,false);
  for(const id of ['deck','level','piers']){await spot(id);await drain();}
  await spot('puzzle-concrete');await solve('concrete');await click('#map');await click('[data-go="north"]');await until("document.querySelector('#scene-name').textContent.includes('Đường phía Bắc')");
  await spot('back-north');await until("document.querySelector('#scene-name').textContent==='Ngã ba trong mưa'");
  await spot('to-suspension');await drain();await screenshot('05-suspension');
  for(const id of ['current','debris','waterline']){await spot(id);await drain();}
  await spot('judge-bridge');await click('#risk-choice');await drain();await click('[data-answer="0"]');assert.equal((await state()).judged.length,0);await click('[data-answer="1"]');await drain();
  await spot('to-hill');await drain();await screenshot('06-hill');
  for(const id of ['rock','tree','seep','crack']){await spot(id);await drain();}
  await spot('judge-hill');await click('#safe-choice');await click('[data-answer="1"]');await drain();
  assert.equal((await state()).clues.length,13);assert.equal((await state()).judged.length,2);
  await click('#journal');await screenshot('07-journal');await click('#close-panel');await click('#map');await screenshot('08-map');await click('#close-panel');
  await send('Page.reload');await wait(450);await click('#resume');assert.equal((await state()).clues.length,13);assert.equal((await state()).scene,'junction');
  await spot('to-north');await until("document.querySelector('#scene-name').textContent.includes('Đường phía Bắc')");await spot('to-concrete');await until("document.querySelector('#scene-name').textContent.includes('Bờ gần')");await spot('cross');await drain();
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await until("!document.querySelector('#dialogue').hidden");await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});await drain();assert.equal((await state()).crossed,true);await screenshot('09-highroad');
  await spot('back-highroad');await drain();assert.equal((await state()).scene,'concrete');await spot('cross');await drain();await send('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space'});await until("document.querySelector('#scene-name').textContent.includes('Bờ xa')");await send('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space'});await drain();
  await spot('to-refuge');assert.ok(await evaluate("document.querySelector('#panel').textContent.includes('Mốc chỉ dẫn')"));await click('#close-panel');await spot('highroad-marker');await drain();await spot('to-refuge');await solve('highroad');await drain();await screenshot('10-refuge');await spot('finale');for(let i=0;i<3;i++)await click('[data-reflect="1"]');await drain();assert.equal((await state()).complete,true);assert.equal((await state()).solved.length,8);await screenshot('11-results');
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await click('#replay');await drain();await spot('to-junction');await solve('gate');await drain();await screenshot('12-mobile-junction');
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});
  const touchPoint=await evaluate("(()=>{const r=document.querySelector('[data-spot=to-hill]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  const tap=async()=>{await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...touchPoint,id:0,radiusX:4,radiusY:4,force:1}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(200);};
  await tap();assert.equal((await state()).scene,'junction');assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-spot=to-hill] .arrow-tip')).visibility"),'visible');await screenshot('14-mobile-arrow');
  await tap();await solve('junction');await drain();assert.equal((await state()).scene,'hill');await spot('back-hill');await drain();
  assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true);
  await click('#map');await screenshot('13-mobile-map');assert.equal(await evaluate("(()=>{const r=document.querySelector('#panel').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})()"),true);await click('#close-panel');
  await evaluate("(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));})()");
  assert.equal(await evaluate("document.fonts.check('16px \"Be Vietnam Pro\"','Đường phía Bắc · Nguyễn · ườ ẫ ỵ')&&document.fonts.check('32px Lora','Ba con đường')"),true);
  assert.deepEqual(runtimeErrors,[]);assert.deepEqual(resourceErrors,[]);assert.ok(fontResponses.length>=3&&fontResponses.every(r=>r.status===200));
  console.log('Chapter 02 browser QA passed: eight map puzzles, destination hover, wrong-answer gates, C/B/A order, unsafe-choice intervention, full clues, bridge gate, both crossing directions, save/reload, ending, mobile, font and asset checks.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{clearTimeout(watchdog);socket?.close();browser?.kill();});
