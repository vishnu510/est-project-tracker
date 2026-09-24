import fs from 'fs';
import path from 'path';
import http from 'http';

// Create a temporary server to receive the base64 PNG from browser canvas
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const base64Data = data.image.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        fs.writeFileSync(path.resolve('./public/est-logo.png'), buffer);
        fs.writeFileSync(path.resolve('./src/assets/est-logo.png'), buffer);
        console.log('Successfully saved public/est-logo.png and src/assets/est-logo.png! Size:', buffer.length);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, size: buffer.length }));
        setTimeout(() => process.exit(0), 1000);
      } catch (err) {
        console.error('Error saving image:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

server.listen(5199, () => {
  console.log('PNG Receiver listening on port 5199');
});
