import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";

export default function VideoPlayer({
  url,
  title,
  savedProgress = 0,
  onProgressSync,
  onEnded,
}) {
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // When a new url is loaded, we reset our ready state
  useEffect(() => {
    setReady(false);
  }, [url]);

  const handleReady = () => {
    setReady(true);
    // Seek to the saved progress if it's significant (>5s)
    if (savedProgress > 5 && playerRef.current) {
      playerRef.current.seekTo(savedProgress, "seconds");
    }
  };

  const handleProgress = (state) => {
    // state.playedSeconds
    // Sync progress to backend every 10 seconds locally (handled by parent or debounced)
    if (onProgressSync) {
      onProgressSync(state.playedSeconds);
    }
  };

  if (!url) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <span className="text-white/50">No video URL provided</span>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black relative">
      <ReactPlayer
        ref={playerRef}
        url={url}
        width="100%"
        height="100%"
        controls={true}
        onReady={handleReady}
        onProgress={handleProgress}
        onEnded={() => onEnded?.()}
        progressInterval={10000} // Fire onProgress every 10 seconds
        config={{
          youtube: {
            playerVars: { rel: 0 },
          },
        }}
      />
    </div>
  );
}
