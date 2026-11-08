const http = require('http');

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404);
    return res.end('Not found');
  }

  try {
    if (!API_KEY) throw new Error('Gemini API key missing');

    let body = '';
    for await (const chunk of req) body += chunk;

    const input = JSON.parse(body);
    const message = input.message;
    if (!message) throw new Error('Message is required');

    const result = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{
              text: 'You are Smart TMJ Pro assistant. Explain TMJ, bruxism, jaw activity, night guard monitoring, wristwatch data, day and night modes, exercises and results. Never invent sensor readings or claim hardware is connected without real data. Do not diagnose. User question: ' + message
            }]
          }]
        })
      }
    );

    const data = await result.json();
    if (!result.ok) throw new Error(data.error?.message || 'Gemini API error');

    const parts = data.candidates[0].content.parts;
    const answer = parts.map(part => part.text || '').join(' ');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ answer: answer }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Smart TMJ Gemini server running on port ' + PORT);
});
