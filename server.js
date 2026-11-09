const http = require('http');
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;
const MODEL = 'gemini-3.6-flash';

const SYSTEM_PROMPT = [
  'You are the AI assistant of Smart TMJ Pro.',
  'Your main purpose is to support TMJ and bruxism monitoring and rehabilitation.',
  'Explain PVDF sensor readings, jaw muscle activity, night guard monitoring, exercises and rehabilitation.',
  'Never invent sensor readings or claim hardware is connected when it is not.',
  'Never diagnose. Recommend professional assessment when needed.',
  'Clearly distinguish measured data from general information.',
  'Reply in the same language as the user.'
].join(' ');

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify({status: 'Smart TMJ server online'}));
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404);
    return res.end();
  }

  try {
    if (!API_KEY) throw new Error('Gemini API key missing');

    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 100000) throw new Error('Message too large');
    }

    const input = JSON.parse(body);
    if (typeof input.message !== 'string' || !input.message.trim()) {
      throw new Error('Message is required');
    }

    const payload = JSON.stringify({
      systemInstruction: {parts: [{text: SYSTEM_PROMPT}]},
      contents: [{role: 'user', parts: [{text: input.message}]}],
      generationConfig: {temperature: 0.5, maxOutputTokens: 1000}
    });

    const request = https.request({
      hostname: 'generativelanguage.googleapis.com',
      family: 4,
      path: '/v1beta/models/' + MODEL + ':generateContent',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-goog-api-key': API_KEY
      },
      timeout: 60000
    }, response => {
      let result = '';
      response.setEncoding('utf8');
      response.on('data', chunk => result += chunk);
      response.on('end', () => {
        try {
          const data = JSON.parse(result);
          if (response.statusCode < 200 || response.statusCode >= 300) {
            throw new Error(data.error?.message || 'Gemini API error');
          }

          const answer = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || '').join('').trim();

          if (!answer) throw new Error('Empty Gemini response');

          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({answer}));
        } catch (error) {
          res.writeHead(502, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: error.message}));
        }
      });
    });

    request.on('timeout', () => request.destroy(new Error('Gemini timeout')));
    request.on('error', error => {
      if (!res.headersSent) res.writeHead(502, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: error.message}));
    });

    request.write(payload);
    request.end();

  } catch (error) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: error.message}));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Smart TMJ Gemini server running on port ' + PORT);
});
