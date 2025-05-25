import type { NextApiRequest, NextApiResponse } from "next";
import { listReels } from "../../lib/s3";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  const items = await listReels();
  console.log(items);

  const reels = items.map(({ name, publicUrl }) => ({
    id: name.replace(/^reels\//, "").replace(/\.mp4$/, ""),
    title: name.replace(/^reels\//, "").replace(/_/g, " "),
    videoUrl: publicUrl,
  }));

  res.status(200).json(reels);
}
