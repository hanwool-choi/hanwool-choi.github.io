/* zero-dep static server for the prototype */
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.ico':'image/x-icon', '.woff2':'font/woff2', '.woff':'font/woff' };
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err,data)=>{
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, {'Content-Type': MIME[path.extname(file)]||'application/octet-stream', 'Cache-Control':'no-store'});
    res.end(data);
  });
}).listen(5173, ()=>console.log('SPC prototype at http://localhost:5173'));
