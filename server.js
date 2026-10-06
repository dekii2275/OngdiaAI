const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ttf': 'font/ttf' };
const port = Number(process.env.PORT || 4173);
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end('Invalid URL'); }
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
