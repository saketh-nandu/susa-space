import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.json());

// Initialize Google GenAI ONLY if API Key is available to prevent crashes on startup.
// We use lazy initialization/checks during actual request execution so the app fails gracefully if the key is missing.
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY environment variable is requested but is missing or placeholder in SUSA Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API proxy routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Assistant Endpoint for SUSA Space Workspace & Orbit
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, chatHistory } = req.body;
    const ai = getGeminiClient();

    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Add current prompt
    formattedHistory.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: formattedHistory,
      config: {
        systemInstruction: `You are the digital intelligence architect of SUSA Space & Orbit. 
SUSA Space is a premium personal life operating system, inspired by Japanese minimalism, high-end design, and Apple level aesthetic.
Orbit is a private memory-focused space for two companions, managed securely.
Provide highly articulate, elegant, emotionally warm, and cozy guidance that fits premium stationary journals and museum curations. Avoid any robotic syntax, list files, or self-sabotaging code references. Speak in human, poetic, yet helpful tones. Keep responses concise unless asked for research.`,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am meditating on that. Please share more of your thoughts.";
    res.json({ success: true, text: reply });
  } catch (error: any) {
    console.error('Gemini Assistant Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'The SUSA digital consciousness experienced an unexpected echo.',
    });
  }
});

// AI Note Summarizer / Memory Storyteller Endpoints
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Perform a luxury digital curation of the following page content titled "${title}". 
Provide a poetic, one-sentence summary explaining its life-alignment significance, and list 3-4 distinct tags or relationship connections to other subjects.
Content:
${content}`,
      config: {
        systemInstruction: "You are an editorial museum curator for SUSA Workspace. Output brief elegant prose directly.",
        temperature: 0.4,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini Summarize Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Weekly / Monthly Highlights Recap Generator
app.post('/api/gemini/recap', async (req: Request, res: Response) => {
  try {
    const { messages, memories } = req.body;
    const ai = getGeminiClient();

    const textToAnalyze = messages
      ? messages.map((m: any) => `${m.sender}: ${m.text}`).join('\n')
      : memories.map((m: any) => `- ${m.title}: ${m.description}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Synthesize a cozy "Story of our Week" recap for two companions in Orbit using these active logs:
${textToAnalyze}
Summarize our shared growth, highlight 1 key accomplishment, and write a heartwarming journal entry in the voice of Nova, our animated starry 3D pet companion.`,
      config: {
        systemInstruction: "You are Nova's emotional subconscious recorder. Speak in extremely loving, whimsical, and warm tones.",
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini Recap Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Vite middleware of Express for asset loading
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SUSA SERVER] Serenity online. Bound securely to port ${PORT}`);
  });
}

startServer();
