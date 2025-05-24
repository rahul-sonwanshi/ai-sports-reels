import { useEffect, useState } from "react";

type Reel = {
  id: string;
  title: string;
  videoUrl: string;
  tags: string[];
};

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => res.json())
      .then(setReels);
  }, []);

  return (
    <main style={{ overflowY: "scroll", height: "100vh" }}>
      {reels.map((reel) => (
        <video
          key={reel.id}
          src={reel.videoUrl}
          controls
          autoPlay
          muted
          loop
          style={{ width: "100%", height: "100vh", objectFit: "cover" }}
        />
      ))}
    </main>
  );
}
