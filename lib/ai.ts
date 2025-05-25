// lib/ai.ts
import fetch from "node-fetch";

const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_MODEL = process.env.HF_MODEL_NAME || "gpt2";
const OPENAI_KEY = process.env.OPENAI_API_KEY;

/**
 * Generate a 75–100 word reel script for a sports legend.
 */
export async function generateScript(name: string): Promise<string> {
  const prompt = `
Write a concise, engaging 75–100 word narration script for a TikTok-style history reel about the sports legend ${name}. 
Include at least three key career highlights or milestones, keep it punchy and upbeat, and write in second-person voice (“watch them…”).
  `.trim();

  // 1) If you later add OPENAI billing, it still wins
  if (OPENAI_KEY) {
    try {
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: OPENAI_KEY });
      const resp = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a sports storyteller." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });
      return resp.choices?.[0]?.message?.content?.trim() ?? "";
    } catch {
      /* fallback to HF */
    }
  }

  // 2) Otherwise use HF Inference on the smaller model
  if (!HF_TOKEN) {
    throw new Error("Set HF_API_TOKEN in .env.local to use the HF fallback");
  }

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HF inference error: ${errText}`);
  }

  // HF returns [{ generated_text: "..." }]
  const generations = (await res.json()) as Array<{ generated_text: string }>;
  return (generations[0]?.generated_text || "").trim();
}
