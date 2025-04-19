/**
 * Simple Express server to proxy requests to OpenAI API for the AI Stock Analysis ChatGPT app.
 * 
 * Usage:
 * 1. Set environment variable OPENAI_API_KEY with your OpenAI API key.
 * 2. Run: node server.js
 * 3. Open http://localhost:3000 in your browser.
 */

const express = require('express');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable not set.');
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Construct prompt with instructions for stock analysis features
  const prompt = `
You are a helpful AI assistant specialized in stock market analysis and financial information. Answer the user's questions based on the following capabilities:

- Summarize stock market news
- Explain stock movements
- Analyze any company or sector
- Give portfolio advice with appropriate disclaimers
- Decode financial jargon in plain English

Use clear, concise, and accessible language. If the user asks for investment advice, always include a disclaimer that this is not financial advice.

User question: "${message}"

Answer:
`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stop: ['\n\n'],
    });

    const reply = completion.data.choices[0].text.trim();
    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
