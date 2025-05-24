import { NextApiRequest, NextApiResponse } from "next";

const fakeReels = [
  {
    id: "messi_2022",
    title: "Messi World Cup Glory",
    videoUrl: "https://your-s3-bucket.s3.amazonaws.com/messi_2022.mp4",
    tags: ["messi", "football"],
  },
  {
    id: "serena_grand_slams",
    title: "Serena’s Slam Era",
    videoUrl: "https://your-s3-bucket.s3.amazonaws.com/serena_slam.mp4",
    tags: ["tennis", "serena"],
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(fakeReels);
}
