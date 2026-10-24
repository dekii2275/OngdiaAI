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
const watchdog = setTimeout(() => { console.error('Browser QA timed out'); socket?.close(); browser?.kill(); process.exitCode = 1; }, 60000);
(async () => {
  const profile = await fs.mkdtemp(path.join(root, 'tmp', 'chrome-'));
  browser = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9341', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let target;
  for (let i = 0; i < 50; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9341/json/list')).json()).find(t => t.type === 'page'); if (target) break; } catch {}
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

  await send('Page.enable'); await send('Runtime.enable');
  await fs.mkdir(path.join(root,'output/qa/thao'), {recursive:true});
  for(const page of ['index.html','chapter02.html']) {
    await send('Page.navigate',{url:baseURL+'/web/'+page}); await wait(700);
    assert.equal(await evaluate("typeof window.ThaoAdvisor"),'object');
    await evaluate("document.querySelector('.thao-launch').click()");
    assert.equal(await evaluate("document.querySelector('#thao-chat').open"),true);
    await evaluate("window.qaRequests=[];window.fetch=async(url,options)=>{window.qaRequests.push(JSON.parse(options.body));return {ok:true,json:async()=>("+JSON.stringify({...require('../server/thao-prompt').FEW_SHOTS[1].output,source:'llm',model:'gemma-4-31b-it'})+")}}");
    await evaluate("document.querySelector('#thao-question').value='Nước đang lên, em nên làm gì?';document.querySelector('.thao-form').requestSubmit()");
    await wait(150);
    assert.equal(await evaluate("qaRequests[0].context.chapter"),page==='index.html'?'chapter01':'chapter02');
    assert.equal(await evaluate("document.querySelectorAll('[data-urgency=emergency]').length"),1);
    assert.ok((await evaluate("document.querySelector('.thao-messages').textContent")).includes('Không lên cầu'));
    // A later question carries the successful preceding exchange.
    await evaluate("document.querySelector('#thao-question').value='Vì sao hả cô?';document.querySelector('.thao-form').requestSubmit()");await wait(100);
    assert.equal(await evaluate('qaRequests[1].history.length'),2);
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape'});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape'});
    await wait(150);
    assert.equal(await evaluate("document.querySelector('#thao-chat').open"),false);
    await evaluate("document.querySelector('.thao-launch').click()");
    for(const width of [1440,390]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width===390});
      await wait(100);
      const bounds=await evaluate("(()=>{let d=document.querySelector('#thao-chat'),r=d.getBoundingClientRect();return {left:r.left,right:r.right,bottom:r.bottom,top:r.top,width:innerWidth,height:innerHeight,overflow:d.scrollWidth>d.clientWidth}})()");
      assert.ok(bounds.left>=0&&bounds.right<=bounds.width+1&&bounds.top>=0&&bounds.bottom<=bounds.height+1&&!bounds.overflow,JSON.stringify(bounds));
      const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(root,'output/qa/thao',page+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
    await evaluate("document.querySelector('.thao-reset').click();window.fetch=async()=>({ok:false,json:async()=>({error:'Khóa API chưa hợp lệ.'})});document.querySelector('#thao-question').value='Cô ơi';document.querySelector('.thao-form').requestSubmit()");await wait(100);
    assert.match(await evaluate("document.querySelector('.thao-messages').textContent"),/Khóa API/);
    assert.equal(await evaluate("document.querySelector('#thao-question').value"),'Cô ơi');
  }
  assert.deepEqual(runtimeErrors,[]);assert.deepEqual(resourceErrors,[]);
  console.log('Thao browser QA passed: both chapters, context/history, structured emergency advice, desktop/mobile, Escape and retry on API errors.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{clearTimeout(watchdog);socket?.close();browser?.kill()});
