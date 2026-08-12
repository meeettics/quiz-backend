import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/spiega-errore', async (req, res) => {
  const { domanda, rispostaSbagliata, rispostaCorretta } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("ERRORE: GEMINI_API_KEY non trovata nelle variabili d'ambiente!");
    return res.status(500).json({ error: "Chiave API non configurata sul server Render." });
  }

  const prompt = `Sei un professore universitario di Psicobiologia. 
Uno studente ha risposto "${rispostaSbagliata}" alla domanda "${domanda}". 
La risposta corretta era "${rispostaCorretta}". 
Spiega in modo chiaro, empatico e in massimo 3 frasi PERCHÉ la sua risposta è sbagliata e qual è il principio neuroscientifico corretto.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      console.error("Errore da Google API:", data);
      return res.status(500).json({ error: data.error?.message || "Errore durante la chiamata a Gemini." });
    }

    const spiegazione = data.candidates?.[0]?.content?.parts?.[0]?.text;
    res.json({ spiegazione: spiegazione || "Nessuna spiegazione generata." });

  } catch (err) {
    console.error("Errore server interno:", err);
    res.status(500).json({ error: "Errore di connessione con le API di Gemini." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
