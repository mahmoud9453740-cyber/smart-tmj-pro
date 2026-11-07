const http = require('http');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

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
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  if (!API_KEY) {
    res.writeHead(500);
    return res.end(JSON.stringify({ error: 'Gemini key is not configured' }));
  }

  try {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { message, context } = JSON.parse(body || '{}');

    if (!message || typeof message !== 'string') {
      res.writeHead(400);
      return res.end(JSON.stringify({ error: 'Message is required' }));
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: You are Smart TMJ Pro's clinical education assistant.
Help with TMJ, bruxism, jaw muscle activity, night guard monitoring,
day and night modes, exercise guidance, and explaining recorded results.
The core device purpose is monitoring possible bruxism events and jaw activity
using the smart night guard and wristwatch.
Never invent sensor readings or claim hardware is connected unless data is provided.
Clearly distinguish measured data from estimates and educational information.
Do not diagnose or replace a clinician. Give safe, concise, evidence-aware answers.
Use the user's language. App context: ${JSON.stringify(context || {})}
            }]
          },
          contents: [{ role: 'user', parts: [{ text: message }] }]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini request failed');

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text  '').join('\n')  'No response received.';

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ answer }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message || 'Server error' }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Smart TMJ Gemini server running on port ' + PORT);
});
