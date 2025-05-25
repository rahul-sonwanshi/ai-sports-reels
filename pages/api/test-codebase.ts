// pages/api/test-supabase.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { uploadToSupabase } from "../../lib/s3";
// import { generateScript } from "../../lib/ai";
import { generateScript } from "../../lib/gemini";
import { synthesizeSpeech } from "../../lib/tts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    /* Tried already working 
    const buffer = Buffer.from("Hello from Supabase!", "utf-8");

    const key = `test/test-${Date.now()}.txt`;

    const publicUrl = await uploadToSupabase(key, buffer, {
      contentType: "text/plain",
      cacheControl: "public, max-age=3600",
    }); 
    
    res.status(200).json({ success: true, key, publicUrl });
    

    const script = await generateScript("Virat Kholi");
    res.status(200).json({ script });
    */
    const buffer = await synthesizeSpeech(
      "Hello sports fans, welcome to the reel! let's get started we are now going for batting as we have won the toss. First batsman Virat Kholi"
    );
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}
