import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream';
const root = path.resolve(process.argv[2] || '.');
const port = Number(process.argv[3] || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
  } catch { res.writeHead(400); res.end(); return; }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    res.setHeader('Content-Type', types[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    let start = 0, end = stat.size - 1;
    if (range) {
      start = Number(range[1]); end = range[2] ? Math.min(Number(range[2]), end) : end;
      if (start > end || start >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }); res.end(); return; }
      res.writeHead(206, { 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    } else { res.writeHead(200, { 'Content-Length': stat.size }); }
    if (req.method === 'HEAD') { res.end(); return; }
    pipeline(fs.createReadStream(file, { start, end }), res, () => {});
  });
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
