// lib/openai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY in environment");
}

// 1) Configure the client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a short, engaging script for a sports-celebrity history reel.
 * @param name The celebrity’s name (e.g. "Lionel Messi")
 * @returns A string of ~75–100 words, formatted as a narration.
 */
export async function generateScript(name: string): Promise<string> {
  const prompt = `
Write a concise, engaging 75–100 word narration script for a TikTok-style history reel about the sports legend ${name}. 
Include at least three key career highlights or milestones, keep it punchy and upbeat, and write in second-person voice (“watch them…”).
  `.trim();

  // v4 SDK call
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo", // or 'gpt-4' if you have access
    messages: [
      {
        role: "system",
        content: "You are a sports storyteller creating short video scripts.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  // Extract the assistant’s reply
  const script = response.choices?.[0]?.message?.content;
  if (!script) {
    throw new Error("OpenAI did not return a script");
  }
  return script.trim();
}
