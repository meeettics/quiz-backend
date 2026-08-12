app.post('/api/spiega-errore', async (req, res) => {
  const { domanda, rispostaSbagliata, rispostaCorretta } = req.body;

  const prompt = `Sei un professore universitario di Psicobiologia. 
Uno studente ha risposto "${rispostaSbagliata}" alla domanda "${domanda}". 
La risposta corretta era "${rispostaCorretta}". 
Spiega in modo chiaro, empatico e in massimo 3 frasi PERCHÉ la sua risposta è sbagliata e qual è il principio neuroscientifico corretto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Estrazione sicura del testo generato
    let textOutput = response.text;
    if (!textOutput && response.candidates?.[0]?.content?.parts?.[0]?.text) {
      textOutput = response.candidates[0].content.parts[0].text;
    }

    res.json({ spiegazione: textOutput || "Nessuna spiegazione generata." });
  } catch (err) {
    console.error("Errore Generazione IA:", err);
    res.status(500).json({ error: "Errore interno durante la generazione." });
  }
});
