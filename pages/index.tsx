import { useEffect, useState, useRef, useCallback } from "react";
// No need to import styles from Home.module.css for this specific fix.
// The `hide-scrollbar` class is a global class from `globals.css`.

// Make sure your Reel type is defined as before
type Reel = {
  id: string;
  title: string;
  videoUrl: string;
  tags: string[];
  lastPlaybackTime?: number;
};

// --- Your VideoReel component code should be placed here (unchanged from last time) ---
// If you copy-pasted the whole file from the previous response, it's already here.
function VideoReel({
  reel,
  isActive,
  onTimeUpdate,
}: {
  reel: Reel;
  isActive: boolean;
  onTimeUpdate: (id: string, time: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : 1;

      if (isActive) {
        videoRef.current.currentTime = reel.lastPlaybackTime || 0;
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Video play failed:", error);
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        if (videoRef.current.currentTime > 0) {
          onTimeUpdate(reel.id, videoRef.current.currentTime);
        }
      }
    }
  }, [isActive, isMuted, reel.id, reel.lastPlaybackTime, onTimeUpdate]);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch((error) => {
          console.error("Manual play failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "black",
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        src={reel.videoUrl}
        onClick={togglePlayPause}
        loop
        playsInline
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: isActive ? "none" : "brightness(0.7)",
        }}
      />

      {!isPlaying && isActive && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            color: "white",
            fontSize: "4em",
            textShadow: "0 0 10px rgba(0,0,0,0.7)",
            opacity: 0.8,
            zIndex: 1,
          }}
        >
          ▶
        </div>
      )}

      {isActive && (
        <button
          onClick={toggleMute}
          style={{
            position: "absolute",
            bottom: "80px",
            right: "20px",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            borderRadius: "50%",
            width: "45px",
            height: "45px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <span style={{ color: "white", fontSize: "1.8em" }}>
            {isMuted ? "🔇" : "🔊"}
          </span>
        </button>
      )}

      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          right: "20px",
          color: "white",
          textShadow: "0 0 5px rgba(0,0,0,0.8)",
          zIndex: 2,
        }}
      >
        <h2 style={{ margin: "0 0 5px 0", fontSize: "1.5em" }}>{reel.title}</h2>
        <p style={{ margin: 0, fontSize: "1em" }}>
          {(reel.tags || []).join(", ")}
        </p>
      </div>
    </div>
  );
}
// --- End of VideoReel component ---

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reels")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((fetchedReels) => {
        setReels(
          fetchedReels.map((reel: Reel) => ({ ...reel, lastPlaybackTime: 0 }))
        );
      })
      .catch((error) => console.error("Failed to fetch reels:", error));
  }, []);

  const updateReelPlaybackTime = useCallback((id: string, time: number) => {
    setReels((prevReels) =>
      prevReels.map((r) => (r.id === id ? { ...r, lastPlaybackTime: time } : r))
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current || reels.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.75) {
            const targetId = entry.target.id;
            const index = reels.findIndex((r) => `reel-${r.id}` === targetId);
            if (index !== -1 && index !== currentReelIndex) {
              setCurrentReelIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.75,
        root: containerRef.current,
        rootMargin: "0px",
      }
    );

    const elementsToObserve =
      containerRef.current.querySelectorAll("[data-reel-item]");
    const timeoutId = setTimeout(() => {
      elementsToObserve.forEach((el) => {
        observer.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      elementsToObserve.forEach((el) => {
        observer.unobserve(el);
      });
      observer.disconnect();
    };
  }, [reels, currentReelIndex]);

  return (
    <main
      ref={containerRef}
      className="hide-scrollbar" // <-- APPLY THIS CLASS HERE
      style={{
        overflowY: "scroll", // KEEP THIS: It enables the scrolling behavior
        height: "100vh",
        scrollSnapType: "y mandatory",
        scrollBehavior: "smooth",
        WebkitOverflowScrolling: "touch",
        margin: 0,
        padding: 0,
      }}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          id={`reel-${reel.id}`}
          data-reel-item
          style={{
            height: "100vh",
            scrollSnapAlign: "start",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: "black",
          }}
        >
          <VideoReel
            reel={reel}
            isActive={index === currentReelIndex}
            onTimeUpdate={updateReelPlaybackTime}
          />
        </div>
      ))}
    </main>
  );
}
