import type { NextApiRequest, NextApiResponse } from "next";
import { generateScript } from "../../lib/gemini";
import { synthesizeSpeech } from "../../lib/tts";
import { buildVideo } from "../../lib/videoGenerator";
import { uploadToSupabase } from "../../lib/s3";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { celebName } = req.body;

  // 1) Script from Gemini
  const script = await generateScript(celebName);

  // 2) Audio buffer from TTS
  const audioBuffer = await synthesizeSpeech(script);

  // 3) Video buffer from FFmpeg slideshow
  const videoBuffer = await buildVideo(celebName, audioBuffer);

  // 4) Upload to Supabase and return the URL
  const key = `reels/${celebName.replace(/\s+/g, "_")}.mp4`;
  const videoUrl = await uploadToSupabase(key, videoBuffer, {
    contentType: "video/mp4",
    cacheControl: "public, max-age=31536000",
  });

  res.status(200).json({ id: celebName, videoUrl });
}
