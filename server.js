import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/spiega-errore', async (req, res) => {
  const { domanda, rispostaSbagliata, rispostaCorretta } = req.body;

  const prompt = `Sei un professore universitario di Psicobiologia. 
Uno studente ha risposto "${rispostaSbagliata}" alla domanda "${domanda}". 
La risposta corretta era "${rispostaCorretta}". 
Spiega in modo chiaro, empatico e in massimo 3 frasi PERCHÉ la sua risposta è un errore comune e qual è il principio neuroscientifico corretto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textOutput = "";
    if (typeof response.text === 'string') {
      textOutput = response.text;
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      textOutput = response.candidates[0].content.parts[0].text;
    } else {
      textOutput = "Spiegazione non disponibile al momento.";
    }

    res.json({ spiegazione: textOutput });
  } catch (err) {
    console.error("Errore Generazione IA:", err);
    res.status(500).json({ error: "Errore durante la generazione della spiegazione." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server IA attivo sulla porta ${PORT}`));
