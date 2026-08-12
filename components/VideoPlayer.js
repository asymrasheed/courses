"use client";

import { forwardRef, useEffect, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

// Vidstack's `storage` prop persists volume/muted/resume-position per key,
// keyed by the full URL so it can't collide across courses.
const VideoPlayer = forwardRef(function VideoPlayer(
  { src, videoKey, onEnded, autoAdvance, onToggleAutoAdvance, navOverlay },
  ref
) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [videoKey]);

  return (
    <div>
      <div className="relative">
        <MediaPlayer
          key={videoKey}
          ref={ref}
          src={src}
          storage={`video-progress:${src}`}
          playsInline
          aspectRatio="16/9"
          className="rounded-xl overflow-hidden bg-black"
          onEnded={onEnded}
          onError={() => setError(true)}
        >
          <MediaProvider />
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        </MediaPlayer>
        {navOverlay}
      </div>

      {error && (
        <p className="text-clay-400 text-xs mt-2">
          Couldn&apos;t load this video — check that the file still exists in the course folder.
        </p>
      )}

      {onToggleAutoAdvance && (
        <label className="flex items-center gap-1.5 text-xs text-cream-500 cursor-pointer select-none mt-2.5">
          <input
            type="checkbox"
            checked={autoAdvance}
            onChange={onToggleAutoAdvance}
            className="accent-gold-400"
          />
          Auto-play next
        </label>
      )}
    </div>
  );
});

export default VideoPlayer;
