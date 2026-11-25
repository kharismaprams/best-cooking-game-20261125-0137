// A tiny static server for play-testing: node serve.ts, then open the
// printed address in a desktop browser. It serves only game/ files.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./game/', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer(async (request, response) => {
  const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  const file = path === '/' ? 'index.html' : path.replace(/^\/+/, '');
  try {
    const body = await readFile(join(root, file));
    response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
  }
});

server.listen(8080, () => {
  console.log('Wajan Malam serving game/ at http://localhost:8080');
});
