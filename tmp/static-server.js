const http = require('http');
const fs = require('fs');
const path = require('path');
const root = process.cwd();
http.createServer((req,res)=>{const p=decodeURIComponent(req.url.split('?')[0].split('#')[0]);const rel=p==='/'?'index.html':p.replace(/^\//,'');const f=path.join(root,rel);fs.readFile(f,(e,d)=>{if(e){res.writeHead(404);res.end('Not found');return;}const ext=path.extname(f).toLowerCase();const m={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf'};res.writeHead(200,{'Content-Type':m[ext]||'application/octet-stream'});res.end(d);});}).listen(5500);
