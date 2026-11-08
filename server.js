const http = require('http');

const API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;
const MODEL = 'gemini-3.8-flash';

const SYSTEM_PROMPT = [
  'You are the official AI assistant inside Smart TMJ Pro.',
  'Explain TMJ disorders, bruxism, night guard monitoring, wearable devices, jaw relaxation exercises, and rehabilitation.',
  'Help users understand sensor readings and monitoring results.',
  'You are not a doctor and must not diagnose.',
  'Never invent sensor readings or claim a device is connected when it is not.',
  'Distinguish measured data from general explanations.',
  'Recommend professional assessment when appropriate.',
  'Answer in the same language used by the user.'
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'Smart TMJ Gemini server is online'
    }));
  }

  if (req.method !== 'POST' || req.url !== '/api/chat') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  try {
    if (!API_KEY) throw new Error('Gemini API key is missing');

    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 100000) throw new Error('Message too large');
    }

    const input = JSON.parse(body);
    const message = input.message;

    if (!message || typeof message !== 'string') {
      throw new Error('Message is required');
    }

    const apiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      MODEL +
      ':generateContent?key=' +
      encodeURIComponent(API_KEY);

    const result = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000
        }
      })
    });

    const data = await result.json();

    if (!result.ok) {
      throw new Error(data.error?.message || 'Gemini request failed');
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim();

    if (!answer) throw new Error('Gemini returned an empty response');

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ answer }));

  } catch (error) {
    console.error('Gemini error:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Smart TMJ Gemini server running on port ' + PORT);
});
