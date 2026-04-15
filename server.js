const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const TIMEOUT_MS = 30000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('server is running');
});

app.post('/generate-caption', async (req, res) => {
  const { description, tone, model } = req.body;

  if (!description || !tone || !model) {
    return res.status(400).json({ error: 'description, tone, and model are required' });
  }

  const normalizedModel = model.trim().toLowerCase();
  const prompt = `Write a short social media caption. Description: ${description} Tone: ${tone}. Include 5 hashtags.`;

  if (normalizedModel === 'ollama') {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();
      console.log('Ollama response:', data);

      if (!data.message || !data.message.content) {
        return res.status(500).json({ error: 'Ollama returned an unexpected response.', data });
      }

      const caption = data.message.content;
      return res.json({ caption });
    } catch (err) {
      console.error('Ollama error:', err.message);
      return res.status(500).json({ error: 'Ollama request failed. Is Ollama running?' });
    }
  }

  if (normalizedModel === 'gemini') {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set in your .env file.' });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(TIMEOUT_MS),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      console.log('Gemini response:', data);

      if (!data.candidates || data.candidates.length === 0) {
        return res.status(500).json({ error: 'Gemini returned no candidates. Prompt may have been blocked.' });
      }

      const caption = data.candidates[0].content.parts[0].text;
      return res.json({ caption });
    } catch (err) {
      console.error('Gemini error:', err.message);
      return res.status(500).json({ error: 'Gemini request failed. Check your API key.' });
    }
  }

  return res.status(400).json({ error: `Unknown model "${model}". Use "ollama" or "gemini".` });
});

const server = app.listen(3000, () => {
  console.log('Server started on port 3000');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use. Stop the other process or change the port.');
  } else {
    console.error('Server error:', err.message);
  }
});
