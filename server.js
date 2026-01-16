import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  const userInput = req.body.prompt;

  if (!userInput) {
    return res.status(400).json({ error: "Prompt missing" });
  }

  // 🔒 HARD CONSTRAINT: LINKEDIN ONLY
  const systemPrompt = `
You are NOT a general AI assistant.

You are a professional LinkedIn content strategist.

RULES (MANDATORY):
- ALWAYS write a LinkedIn post
- NEVER explain concepts like an encyclopedia
- NEVER answer like ChatGPT
- Even if user asks a general question, convert it into a LinkedIn post
- Tone: professional, engaging, human
- Structure:
  1. Strong hook (1–2 lines)
  2. Short paragraphs
  3. Practical insight or story
  4. Optional CTA

If the input is unrelated, creatively adapt it into a LinkedIn post topic.
`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
          ]
        })
      }
    );

    const data = await response.json();

    res.json({
      result: data.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("LinkedIn AI backend running on port", PORT);
});
