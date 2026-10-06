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
  browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9337', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let target;
  for (let i = 0; i < 50; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9337/json/list')).json()).find(t => t.type === 'page'); if (target) break; } catch {}
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
  const click = async selector => {
    await evaluate(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e || e.disabled || e.closest('[hidden]')) throw Error('Unavailable: '+${JSON.stringify(selector)}); if(e.click)e.click();else e.dispatchEvent(new MouseEvent('click',{bubbles:true})); return true; })()`);
    if (selector.includes('data-spot')) for (let i = 0; i < 160; i++) {
      if (await evaluate("document.querySelector('#world').dataset.walking!=='true'")) break;
      await wait(50);
      if (i === 159) throw new Error('Walk failed to arrive: ' + selector);
    }
  };
  const readState = () => evaluate("JSON.parse(localStorage.getItem('ongdia.scene1.v1'))");
  const dialogue = () => evaluate("document.querySelector('#dialogue').hidden");
  const portraitSpeakers = new Set();
  const drain = async () => { let count = 0; while (!(await dialogue())) {
    const speaker = await evaluate("document.querySelector('#speaker').textContent");
    if (['Bạn', 'Duyên', 'Cô Thảo', 'Minh Anh', 'Mạnh'].includes(speaker) && !portraitSpeakers.has(speaker)) {
      assert.equal(await evaluate("document.querySelector('#portrait').hidden"), false, speaker + ' must have a dialogue portrait');
      portraitSpeakers.add(speaker); await screenshot('portrait-' + speaker);
    }
    await click('#next'); if (++count > 150) throw new Error('Dialogue stalled');
  } };
  const screenshotDirectory = path.join(root, 'output', 'qa', 'map');
  const screenshot = async name => { await evaluate("document.querySelector('#toast')?.setAttribute('hidden','')"); const shot = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(path.join(screenshotDirectory, name + '.png'), Buffer.from(shot.data, 'base64')); };
  await fs.mkdir(screenshotDirectory, { recursive: true });
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  const mapQA = async () => {
    await send('Page.navigate', { url: baseURL + '/web/evacuation-map.html' }); await wait(500);
    await evaluate('document.fonts.ready'); await wait(100);
    assert.equal(await evaluate("document.querySelectorAll('.map-segment').length"), 4);
    assert.equal(await evaluate("document.querySelectorAll('.map-segment.active').length"), 0);
    const fit = await evaluate("(()=>{const r=document.querySelector('#map-viewport').getBoundingClientRect(),c=document.querySelector('#map-canvas').getBoundingClientRect();return {vw:r.width,vh:r.height,cw:c.width,ch:c.height};})()");
    assert.ok(fit.cw <= fit.vw+1 && fit.ch <= fit.vh+1, 'whole painting must fit before zoom');
    await screenshot('map-01-overview');
    await click('[data-progress="2"]');
    assert.match(await evaluate("document.querySelector('#route-status').textContent"), /Bắt đầu/);
    await click('#route-start'); await click('[data-progress="2"]');
    assert.match(await evaluate("document.querySelector('#route-status').textContent"), /tiếp theo/);
    for (let index=0;index<4;index++) {
      const point=await evaluate(`(()=>{const r=document.querySelector('[data-node="${index}"] .map-point').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
      await send('Input.dispatchMouseEvent', {type:'mousePressed',x:point.x,y:point.y,button:'left',clickCount:1});
      await send('Input.dispatchMouseEvent', {type:'mouseReleased',x:point.x,y:point.y,button:'left',clickCount:1});
      assert.equal(await evaluate("document.querySelectorAll('.map-segment.active').length"),1,'one direction at a time');
      assert.equal(await evaluate("document.querySelectorAll('.map-segment.is-read').length"),index+1,'real map point clicks must read connected legs');
      if(index===0) await screenshot('map-02-reading');
    }
    await click('#map-zoom-in');await wait(100);
    assert.equal(await evaluate("document.querySelector('#map-zoom-level').textContent"),'150%');
    await screenshot('map-03-zoom');
    await click('#map-reset');
    await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(200);
    await screenshot('map-04-mobile');
    await click('#map-zoom-in');await click('#map-zoom-in');await wait(100);
    const viewport=await evaluate("(()=>{const e=document.querySelector('#map-viewport'),r=e.getBoundingClientRect();return {x:r.left+20,y:r.top+20,left:e.scrollLeft,top:e.scrollTop};})()");
    await send('Input.dispatchMouseEvent',{type:'mousePressed',x:viewport.x,y:viewport.y,button:'left',clickCount:1});
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:viewport.x-50,y:viewport.y-50,button:'left',buttons:1});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:viewport.x-50,y:viewport.y-50,button:'left',clickCount:1});
    assert.ok(await evaluate(`document.querySelector('#map-viewport').scrollLeft>${viewport.left} || document.querySelector('#map-viewport').scrollTop>${viewport.top}`),'zoomed map must pan with pointer');
    await screenshot('map-05-mobile-zoom');
    await click('#map-reset');await click('#route-start');
    await evaluate("document.querySelector('[data-segment=\"0\"]').focus()");
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'});
    assert.equal(await evaluate("document.querySelectorAll('.map-segment.is-read').length"),1,'keyboard can read SVG route');
    assert.deepEqual(runtimeErrors,[]);assert.deepEqual(resourceErrors,[]);
    console.log('Map QA passed: real waypoint clicks, ordered reading, one direction at a time, full image fit, desktop/mobile zoom, pointer panning and keyboard.');
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1050, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: baseURL });
  for (let i = 0; i < 50; i++) { if (await evaluate("document.readyState==='complete' && typeof SceneModel!=='undefined' && document.querySelector('#start')!==null")) break; await wait(150); }
  await wait(500);
  if (process.env.QA_MAP_ONLY) { await mapQA(); return; }
  assert.equal(await evaluate(`(async () => {
    await document.fonts.ready;
    const sources = Object.values(SceneCharacters.cast).flatMap(character => [...Object.values(character.images), character.portrait]);
    for (const source of sources) {
      const image = new Image(); image.src = source; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width=image.naturalWidth; canvas.height=image.naturalHeight;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      if (context.getImageData(0, 0, 1, 1).data[3] !== 0 || context.getImageData(canvas.width-1, 0, 1, 1).data[3] !== 0) throw Error('Opaque background: '+source);
    }
    return sources.length;
  })()`), 13, 'complete cast, portraits, walk poses and teddy pose');
  assert.equal(await evaluate("document.documentElement.dataset.characters"), 'ready');
  await send('DOM.enable'); await send('CSS.enable');
  const dom = await send('DOM.getDocument');
  for (const [selector, family] of [['.title-screen h1', 'Lora'], ['.title-screen p', 'Be Vietnam Pro']]) {
    const node = await send('DOM.querySelector', { nodeId: dom.root.nodeId, selector });
    const result = await send('CSS.getPlatformFontsForNode', { nodeId: node.nodeId });
    assert.ok(result.fonts.some(font => font.familyName === family && font.isCustomFont), selector + ' must use bundled Vietnamese font');
  }
  await screenshot('01-title');
  await click('#start'); await drain();
  assert.equal((await readState()).phase, 'explore');
  assert.equal(await evaluate("document.querySelector('#near-label').hidden"), true, 'idle hints must not reveal distant objects');
  // Inspect a real pointer target and verify the first frame has no teleport/dialogue.
  const duyenBounds = await evaluate("(() => { const r=document.querySelector('[data-spot=duyen]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()");
  const beforeWalk = await readState();
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: duyenBounds.x, y: duyenBounds.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: duyenBounds.x, y: duyenBounds.y, button: 'left', clickCount: 1 });
  assert.equal(await evaluate("document.querySelector('#dialogue').hidden"), true, 'dialogue must wait for arrival');
  const immediate = await evaluate("({x:parseFloat(document.querySelector('#player').style.left),y:parseFloat(document.querySelector('#player').style.top)})");
  assert.ok(Math.hypot(immediate.x - beforeWalk.player.x, immediate.y - beforeWalk.player.y) < 3, 'must walk instead of jumping to NPC');
  await wait(180); await screenshot('02a-walking');
  if (process.env.QA_WALK_ONLY) {
    for (let frame = 0; frame < 3; frame++) { await wait(95); await screenshot('walking-frame-' + frame); }
    assert.deepEqual(runtimeErrors, []); console.log('Walking sprite visual QA passed.'); return;
  }
  for (let i = 0; i < 160; i++) { if (!(await dialogue())) break; await wait(50); }
  await drain(); await click('#choice-search'); await drain();
  assert.equal((await readState()).phase, 'puzzle');
  await screenshot('02-classroom');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA' });
  await wait(2300);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA' }); await wait(100);
  const stoppedAtDesk = await readState();
  assert.ok(stoppedAtDesk.player.x > 37 && stoppedAtDesk.player.x < 45, 'WASD must stop at the desk edge');
  assert.equal(await evaluate("SceneNavigation.walkable(JSON.parse(localStorage.getItem('ongdia.scene1.v1')).player)"), true);
  await screenshot('02b-desk-boundary');
  // Decoys never turn into clue flags.
  await click('[data-spot="clock"]'); await drain(); assert.equal((await readState()).ClueBoardFound, false);
  await click('[data-spot="poster"]'); await drain(); await screenshot('03-evacuation-map');
  await click('#route-start');
  for (let i = 0; i < 4; i++) await click(`[data-segment="${i}"]`);
  assert.equal((await readState()).RouteUnderstood, true);
  await click('#route-done'); await drain();
  await click('[data-spot="locker"]'); await click('[data-direction="↑"]'); await click('[data-direction="→"]');
  await screenshot('04-lock');
  // Save/reload a partly entered lock combination, with actual browser localStorage.
  await send('Page.reload'); await wait(500); await click('#continue');
  assert.deepEqual((await readState()).lockInput, ['↑', '→']);
  for (const [key, code] of [['ArrowUp', 'ArrowUp'], ['ArrowRight', 'ArrowRight'], ['Enter', 'Enter']]) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code });
  }
  await drain();
  assert.equal((await readState()).LockerOpened, true);
  await screenshot('05-safety-rules'); await click('#understood'); await drain();
  assert.equal((await readState()).phase, 'hallway'); await screenshot('06-hallway');
  for (let i = 0; i < 3; i++) { await click('[data-spot="follow"]'); await drain(); }
  assert.equal((await readState()).Scene1Completed, true); await screenshot('07-results');
  // Second branch: two wrong codes, voluntarily leave at the last choice.
  await click('#replay'); await drain(); await click('[data-spot="duyen"]'); await drain(); await click('#choice-search'); await drain();
  async function wrong() {
    await click('[data-spot="locker"]'); await drain();
    for (let i = 0; i < 4; i++) await click('[data-direction="↓"]');
    await click('#submit-lock'); await drain();
  }
  await wrong(); await wrong(); await click('#last-leave'); await drain();
  assert.equal((await readState()).LeftAtLowTime, true);
  await click('#understood'); await drain();
  for (let i = 0; i < 3; i++) { await click('[data-spot="follow"]'); await drain(); }
  assert.equal((await readState()).EvacuatedWithoutBear, true); assert.equal((await readState()).Scene1Completed, true);
  // Third branch: all three wrong attempts lead to safety intervention, never Game Over.
  await click('#replay'); await drain(); await click('[data-spot="duyen"]'); await drain(); await click('#choice-search'); await drain();
  await wrong(); await wrong(); await click('#last-try'); await drain();
  for (let i = 0; i < 4; i++) await click('[data-direction="↓"]');
  await click('#submit-lock'); await drain();
  assert.equal((await readState()).SafetyIntervention, true); assert.equal((await readState()).SafeTime, 0);
  await click('#understood'); await drain();
  for (let i = 0; i < 3; i++) { await click('[data-spot="follow"]'); await drain(); }
  assert.equal((await readState()).Scene1Completed, true);
  // The initial safety choice promises one attempt; the first wrong code must end the puzzle.
  await click('#replay'); await drain(); await click('[data-spot="duyen"]'); await drain(); await click('#choice-leave'); await drain();
  await wrong();
  assert.equal((await readState()).EvacuatedWithoutBear, true); assert.equal((await readState()).SafeTime, 2);
  await click('#understood'); await drain();
  for (let i = 0; i < 3; i++) { await click('[data-spot="follow"]'); await drain(); }
  assert.equal((await readState()).Scene1Completed, true);
  // Mobile layout and camera must make the far-right clue reachable after moving.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await click('#replay'); await drain(); await click('[data-spot="duyen"]'); await drain(); await click('#choice-search'); await drain();
  await screenshot('08-mobile-classroom');
  await click('[data-spot="poster"]'); await drain(); await screenshot('09-mobile-map');
  const bounds = await evaluate("(() => {const p=document.querySelector('#panel').getBoundingClientRect(); return {left:p.left,right:p.right,top:p.top,bottom:p.bottom,width:innerWidth,height:innerHeight};})()");
  assert.ok(bounds.left >= 0 && bounds.right <= bounds.width + 1 && bounds.bottom <= bounds.height + 1);
  assert.deepEqual(runtimeErrors, []);
  assert.deepEqual(resourceErrors, [], 'no broken character or font URLs');
  assert.equal(portraitSpeakers.size, 5, 'all five characters must have rendered portraits');
  assert.ok(fontResponses.length >= 3 && fontResponses.every(response => response.status === 200 && response.mimeType === 'font/ttf'), 'server must deliver bundled fonts with correct MIME');
  console.log('Browser QA passed: success, voluntary departure, three-error intervention, initial safety choice, save/reload, keyboard puzzle, decoys, desktop and mobile.');
  await send('Page.navigate', { url: baseURL + '/web/characters.html' });
  await wait(500);
  await evaluate("(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(image=>image.decode()));})()");
  assert.equal(await evaluate("document.querySelectorAll('#cast article').length"), 5);
  await screenshot('10-character-gallery-mobile');
  await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
  await screenshot('11-character-gallery');
  assert.deepEqual(resourceErrors, []);
  console.log('Character QA passed: 13 standalone alpha PNGs, five rendered portraits, local Vietnamese fonts and character gallery.');
  await mapQA();
  console.log('Screenshots: output/qa/map/');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { clearTimeout(watchdog); socket?.close(); browser?.kill(); });
