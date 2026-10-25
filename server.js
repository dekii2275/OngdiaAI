const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { selectNpcReply } = require('./server/ai-bridge.js');
const { handleRadioChat } = require('./server/radio-ai-handler.js');
const { 
  handleChapterDebrief, 
  handleBridgeBlueprint, 
  handleIncidentDispatch, 
  handleMedicalTriage 
} = require('./server/debrief-ai-handler.js');

const root = __dirname;
const types = { 
  '.html': 'text/html; charset=utf-8', 
  '.js': 'text/javascript; charset=utf-8', 
  '.css': 'text/css; charset=utf-8', 
  '.png': 'image/png', 
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', 
  '.json': 'application/json', 
  '.ttf': 'font/ttf' 
};
const port = Number(process.env.PORT || 4173);
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL'); }

  // API Route: Sau Con Mua NPC Reply
  if (req.method === 'POST' && pathname === '/api/sau-con-mua/npc-reply') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await selectNpcReply({
          requestId: data.request_id || 'req-' + Date.now(),
          stageRevision: Number(data.stage_revision || 0),
          playerText: String(data.player_text || '')
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API Route: Emergency Rescue AI Radio Chat
  if (req.method === 'POST' && pathname === '/api/radio/chat') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleRadioChat({
          channel: data.channel || 'minh_anh',
          playerName: data.playerName || 'Bạn',
          message: data.message || '',
          chapter: Number(data.chapter || 3),
          scene: data.scene || ''
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API Route: Debrief Evaluate (Khảo hạch pass chương)
  if (req.method === 'POST' && pathname === '/api/debrief/evaluate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleChapterDebrief({
          chapter: data.chapter,
          question: data.question,
          playerAnswer: data.playerAnswer !== undefined ? data.playerAnswer : data.player_answer
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API Route: Tactical Bridge Blueprint (Phác đồ vượt cầu tre)
  if (req.method === 'POST' && pathname === '/api/tactical/bridge-blueprint') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleBridgeBlueprint({
          inspectionData: data.inspectionData,
          inspection: data.inspection
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API Route: Tactical Incident Dispatch (Bức điện cứu nạn Huyện)
  if (req.method === 'POST' && pathname === '/api/tactical/incident-dispatch') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleIncidentDispatch({
          hazards: data.hazards
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API Route: Medical Triage Solver (Cố vấn y tế 3 ca khủng hoảng)
  if (req.method === 'POST' && pathname === '/api/medical/triage-solver') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const result = await handleMedicalTriage({
          caseId: data.caseId !== undefined ? data.caseId : data.case_id,
          solutionText: data.solutionText !== undefined ? data.solutionText : data.solution_text
        });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (pathname === '/') { res.writeHead(302, { Location: '/web/index.html' }); return res.end(); }
  // Serve the game and source art only, never expose .git or other project files.
  if (!pathname.startsWith('/web/') && !pathname.startsWith('/map/')) {
    res.writeHead(404); return res.end('Not found');
  }
  const file = path.resolve(root, '.' + pathname);
  const allowedRoot = pathname.startsWith('/web/') ? path.join(root, 'web') : path.join(root, 'map');
  if (!file.startsWith(allowedRoot + path.sep) || !Object.hasOwn(types, path.extname(file))) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  });
});
server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}`;
  console.log(`Ongdia Game Server: ${url}\nPress Ctrl+C to stop.`);
  if (process.argv.includes('--open') && process.platform === 'win32') {
    const opener = require('node:child_process').spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
    opener.on('error', () => console.log(`Open this address in your browser: ${url}`));
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
