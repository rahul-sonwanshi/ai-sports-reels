import googleTTS from "google-tts-api";
import fetch from "node-fetch";

/**
 * Synthesize speech for any-length text by splitting into 200-char chunks.
 * Returns a single Buffer containing the full MP3 audio.
 */
export async function synthesizeSpeech(text: string): Promise<Buffer> {
  // 1) Split into URLs for each chunk
  const urlObjects = await googleTTS.getAllAudioUrls(text, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });

  // 2) Fetch each chunk and collect Buffers
  const buffers: Buffer[] = [];
  for (const { url } of urlObjects) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `TTS chunk fetch failed: ${res.status} ${res.statusText}`
      );
    }
    const arrayBuf = await res.arrayBuffer();
    buffers.push(Buffer.from(arrayBuf));
  }

  // 3) Concatenate into one Buffer
  return Buffer.concat(buffers);
}
