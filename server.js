const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 7842;
const STATIC = path.join(__dirname, 'design_handoff_kredesh/source');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Claude proxy — forwards to Anthropic, strips dangerous-request header
  if (req.method === 'POST' && req.url === '/api/claude') {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
      const apiKey = process.env.ANTHROPIC_API_KEY || req.headers['x-api-key'] || '';
      if (!apiKey) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'API key required' } }));
        return;
      }
      const opts = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
      };
      const pr = https.request(opts, r => {
        res.writeHead(r.statusCode, { 'content-type': 'application/json' });
        r.pipe(res);
      });
      pr.on('error', e => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: { message: e.message } }));
      });
      pr.write(body);
      pr.end();
    });
    return;
  }

  // Static files
  let fp = path.join(STATIC, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  fs.readFile(fp, (err, data) => {
    if (err) {
      fs.readFile(path.join(STATIC, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        res.end(d2);
      });
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(fp)] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Kredesh → http://localhost:${PORT}`));
