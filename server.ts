import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required and was not found.");
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// SECURE FAITH GENERATOR API ROUTE
app.post("/api/generate-faith", async (req, res) => {
  try {
    const { topic, prayerRequest } = req.body;
    const client = getGemini();

    let prompt = `You are a compassionate, thoughtful, and encouraging pastoral guide for Front Line People Church (FLP Church). `;
    if (prayerRequest) {
      prompt += `A member of our community has shared this prayer request or heart reflection: "${prayerRequest}". `;
    } else {
      prompt += `A member of our community is seeking spiritual encouragement on the topic of "${topic || "flourishing faith & deep roots"}". `;
    }

    prompt += `Please generate a short, beautiful, and comforting spiritual blessing and scripture reflection. Follow this structure:
1. A carefully chosen Scripture verse (including Bible reference like Psalms or Isaiah).
2. A gentle, breathing pastoral reflection (2-3 sentences) linking the Scripture to the themes of FLP Church: organic spiritual growth, nourishment from deep roots, and breathable optimism.
3. A short, warm blessing/prayer (1-2 sentences) for their week.

Keep the entire response extremely warm, grounded, and concise (under 180 words overall). Do not use heavy theological jargon, keep it modern and accessible. Do not include introductory notes or pre-analysis (e.g. "Here is your reflection:"). Start directly with the Scripture.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const resultText = response.text || "May your roots go deep and your spirit find peace today.";
    res.json({ text: resultText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred while seeking guidance." });
  }
});

// VITE MIDDLEWARE CONFIGURATION
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FLP Church full-stack server is listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start FLP Church full-stack server:", err);
});
