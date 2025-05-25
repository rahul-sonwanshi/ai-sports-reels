import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, unlinkSync, readFileSync } from "fs";

ffmpeg.setFfmpegPath(ffmpegPath.path);

/**
 * Build a simple MP4: one static image + your audio buffer.
 * @param name        Celebrity name (used for temp filename)
 * @param audioBuffer Buffer containing MP3 audio
 * @returns           A Promise resolving to an MP4 Buffer
 */
export async function buildVideo(
  name: string,
  audioBuffer: Buffer
): Promise<Buffer> {
  const tmp = tmpdir();
  const audioPath = join(tmp, `${name.replace(/\s+/g, "_")}.mp3`);
  const outputPath = join(tmp, `${name.replace(/\s+/g, "_")}.mp4`);
  const imagePath = join(process.cwd(), "public", "placeholder.jpg");

  // 1) Write the audioBuffer to disk
  writeFileSync(audioPath, audioBuffer);

  // 2) Run ffmpeg: image + audio → MP4
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop() // loop the single image
      .input(audioPath)
      .outputOptions([
        "-c:v libx264",
        "-tune stillimage",
        "-c:a aac",
        "-b:a 192k",
        "-pix_fmt yuv420p",
        "-shortest", // finish when audio ends
      ])
      .size("720x1280") // vertical video
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err: any) => reject(err))
      .run();
  });

  // 3) Read the generated MP4 into a Buffer
  const videoBuffer = readFileSync(outputPath);

  // 4) Clean up temp files
  unlinkSync(audioPath);
  unlinkSync(outputPath);

  return videoBuffer;
}
