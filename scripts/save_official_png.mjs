import fs from 'fs';
import path from 'path';
import http from 'http';

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
        const base64Dark = data.dark.replace(/^data:image\/png;base64,/, '');
        const base64Light = data.light.replace(/^data:image\/png;base64,/, '');

        const bufDark = Buffer.from(base64Dark, 'base64');
        const bufLight = Buffer.from(base64Light, 'base64');

        fs.writeFileSync(path.resolve('./public/est-logo.png'), bufDark);
        fs.writeFileSync(path.resolve('./public/est-logo-dark.png'), bufDark);
        fs.writeFileSync(path.resolve('./src/assets/est-logo.png'), bufDark);
        fs.writeFileSync(path.resolve('./public/est-logo-light.png'), bufLight);

        console.log('Successfully saved official PNG files! Dark size:', bufDark.length, 'Light size:', bufLight.length);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, darkSize: bufDark.length, lightSize: bufLight.length }));
        setTimeout(() => process.exit(0), 1000);
      } catch (err) {
        console.error('Error saving image:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

server.listen(5198, () => {
  console.log('Converter listening on 5198');
});
