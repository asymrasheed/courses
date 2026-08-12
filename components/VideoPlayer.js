"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];
const PROGRESS_KEY_PREFIX = "video-progress:";
const VOLUME_KEY = "video-volume";

function isTypingTarget(el) {
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
}

// Native <video> gives a reliable scrubber/fullscreen/PiP for free; this wraps it with
// the things it doesn't do out of the box — resuming where you left off (core to a
// revision tool), a consistent speed control across browsers, keyboard shortcuts, and
// a visible error state when a file has been moved/deleted from the course folder.
const VideoPlayer = forwardRef(function VideoPlayer(
  { src, videoKey, onEnded, autoAdvance, onToggleAutoAdvance },
  forwardedRef
) {
  const internalRef = useRef(null);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);

  function setRefs(node) {
    internalRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }

  useEffect(() => {
    setError(false);
    setReady(false);
    setRate(1);

    const el = internalRef.current;
    if (!el) return;

    const savedVolume = Number(localStorage.getItem(VOLUME_KEY));
    if (!Number.isNaN(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
      el.volume = savedVolume;
    }

    function onLoadedMetadata() {
      const savedTime = Number(localStorage.getItem(PROGRESS_KEY_PREFIX + videoKey));
      if (savedTime > 5 && savedTime < el.duration - 1) {
        el.currentTime = savedTime;
      }
      setReady(true);
    }
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => el.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [videoKey]);

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (!el.paused) {
        localStorage.setItem(PROGRESS_KEY_PREFIX + videoKey, String(el.currentTime));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [videoKey]);

  function handleVolumeChange() {
    if (internalRef.current) {
      localStorage.setItem(VOLUME_KEY, String(internalRef.current.volume));
    }
  }

  function handleKeyDown(e) {
    if (isTypingTarget(e.target)) return;
    const el = internalRef.current;
    if (!el) return;
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (el.paused) el.play();
      else el.pause();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      el.currentTime = Math.min(el.duration || Infinity, el.currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      el.currentTime = Math.max(0, el.currentTime - 5);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      el.volume = Math.min(1, el.volume + 0.1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      el.volume = Math.max(0, el.volume - 0.1);
    }
  }

  function changeRate(r) {
    setRate(r);
    if (internalRef.current) internalRef.current.playbackRate = r;
  }

  return (
    <div tabIndex={0} onKeyDown={handleKeyDown} className="outline-none">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-cream-500 text-sm">
            Loading…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 gap-1">
            <p className="text-clay-400 text-sm">Couldn&apos;t load this video.</p>
            <p className="text-cream-500 text-xs">
              Check that the file still exists in the course folder.
            </p>
          </div>
        )}
        <video
          key={videoKey}
          ref={setRefs}
          src={src}
          controls
          preload="metadata"
          playsInline
          className={`w-full h-full ${error ? "invisible" : ""}`}
          onVolumeChange={handleVolumeChange}
          onError={() => setError(true)}
          onLoadedData={() => setReady(true)}
          onEnded={onEnded}
        />
      </div>

      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1">
          {RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                rate === r
                  ? "bg-gold-400/15 text-gold-300"
                  : "text-cream-500 hover:text-cream-100 hover:bg-white/5"
              }`}
            >
              {r}×
            </button>
          ))}
        </div>
        {onToggleAutoAdvance && (
          <label className="flex items-center gap-1.5 text-xs text-cream-500 cursor-pointer select-none">
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
    </div>
  );
});

export default VideoPlayer;
