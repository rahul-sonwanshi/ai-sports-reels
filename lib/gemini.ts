const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) throw new Error("Missing GEMINI_API_KEY in env");

const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function generateScript(name: string): Promise<string> {
  const prompt = `
Write a concise, upbeat 75–100 word narration for a TikTok-style history reel about the sports legend ${name}.
Include at least three career highlights, keep it punchy and in second-person (“watch them…”).
  `.trim();

  const res = await fetch(`${BASE_URL}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  const script = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!script) throw new Error("No script returned from Gemini");
  return script.trim();
}
