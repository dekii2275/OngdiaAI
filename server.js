const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
if (fs.existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));
const { askThao, ChatError } = require('./server/thao');
const chatLimits = new Map();
let chatInFlight = 0;
function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(value));
}
async function chat(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, { error: 'Chỉ chấp nhận POST.' }); }
  if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) return json(res, 403, { error: 'Nguồn yêu cầu không hợp lệ.' });
  if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Yêu cầu cần dùng application/json.' });
  const now = Date.now(), ip = req.socket.remoteAddress;
  for (const [key, entry] of chatLimits) if (entry.until < now) chatLimits.delete(key);
  const entry = chatLimits.get(ip) || { until: now + 60000, count: 0 };
  if (++entry.count > 12 || chatInFlight >= 3) return json(res, 429, { error: 'Em đợi một chút trước khi hỏi tiếp nhé.' });
  chatLimits.set(ip, entry);
  chatInFlight++;
  try {
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 16000) throw new ChatError(413, 'TOO_LARGE', 'Câu hỏi quá dài.');
      chunks.push(chunk);
    }
    let input;
    try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ChatError(400, 'INVALID_JSON', 'Dữ liệu câu hỏi không hợp lệ.'); }
    json(res, 200, await askThao(input));
  } catch (error) {
    json(res, error instanceof ChatError ? error.status : 500, { code: error instanceof ChatError ? error.code : 'INTERNAL_ERROR', error: error instanceof ChatError ? error.message : 'Cô chưa kết nối được. Em thử lại sau nhé.' });
  } finally { chatInFlight--; }
}
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ttf': 'font/ttf' };
const port = Number(process.env.PORT || 4173);
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL'); }
  if (pathname === '/api/thao/chat') { void chat(req, res); return; }
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
  console.log(`Scene 1: ${url}\nPress Ctrl+C to stop.`);
  if (process.argv.includes('--open') && process.platform === 'win32') {
    // Open only after the server is ready, so the browser cannot race startup.
    const opener = require('node:child_process').spawn('cmd.exe', ['/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
    opener.on('error', () => console.log(`Open this address in your browser: ${url}`));
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
