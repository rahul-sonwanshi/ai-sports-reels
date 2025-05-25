import { useEffect, useState, useRef, useCallback } from "react";

// Define the Reel type, including a new optional property for lastPlaybackTime
type Reel = {
  id: string;
  title: string;
  videoUrl: string;
  tags: string[];
  lastPlaybackTime?: number; // Added to store the last played position
};

// Component for a single video reel with play/pause and mute/unmute functionality
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
  const [isMuted, setIsMuted] = useState(true); // Start muted for reliable autoplay

  // Effect to manage play/pause, volume, and save/restore playback time
  useEffect(() => {
    if (videoRef.current) {
      // Control volume directly based on isMuted state
      videoRef.current.volume = isMuted ? 0 : 1; // 0 for muted, 1 for full volume

      if (isActive) {
        // Restore playback time when the video becomes active
        videoRef.current.currentTime = reel.lastPlaybackTime || 0; // Play from stored time or beginning

        // Attempt to play the video. Browsers generally allow autoplay if muted.
        videoRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Video play failed:", error);
            setIsPlaying(false); // Set to paused if autoplay couldn't start
          });
      } else {
        // Pause and save current playback time when the video becomes inactive
        videoRef.current.pause();
        setIsPlaying(false);
        if (videoRef.current.currentTime > 0) {
          // Only save if the video actually started playing
          onTimeUpdate(reel.id, videoRef.current.currentTime);
        }
      }
    }
  }, [isActive, isMuted, reel.id, reel.lastPlaybackTime, onTimeUpdate]); // Add new dependencies

  // Handler for tapping the video to toggle play/pause
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

  // Handler for the mute/unmute button
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
        // 'muted' attribute is removed, volume is controlled by JS
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          filter: isActive ? "none" : "brightness(0.7)",
        }}
      />

      {/* Optional: Play/Pause Overlay Icon */}
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

      {/* Mute/Unmute Button/Icon Overlay */}
      {isActive && ( // Only show the mute button for the active video
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

      {/* Title and Tags Overlay */}
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

// Main Home component for the reels feed
export default function Home() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0); // Tracks the index of the currently active reel
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main scrollable container

  // Fetch reels data from your API
  useEffect(() => {
    fetch("/api/reels")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((fetchedReels) => {
        // Initialize lastPlaybackTime for fetched reels
        setReels(
          fetchedReels.map((reel: Reel) => ({ ...reel, lastPlaybackTime: 0 }))
        );
      })
      .catch((error) => console.error("Failed to fetch reels:", error));
  }, []);

  // Callback to update a reel's lastPlaybackTime in the parent's state
  const updateReelPlaybackTime = useCallback((id: string, time: number) => {
    setReels((prevReels) =>
      prevReels.map((r) => (r.id === id ? { ...r, lastPlaybackTime: time } : r))
    );
  }, []); // No dependencies needed for useCallback as setReels is stable

  // Intersection Observer to detect which reel is mostly in view
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
    // Use a timeout to ensure elements are rendered before observing, especially on initial load
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
      style={{
        overflowY: "scroll",
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
          {/* Pass the update callback to VideoReel */}
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
