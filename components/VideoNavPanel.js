"use client";

import { useEffect, useRef, useState } from "react";
import { IconFolder, IconPlay, IconArrowRight, IconMenu, IconX } from "@/components/icons";
import { countVideos, folderContainsPath } from "@/lib/videoTree";

const INDENT = 16;

function VideoOption({ video, depth, currentPath, noteCounts, onSelect }) {
  const active = video.path === currentPath;
  const count = noteCounts?.get(video.path) || 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(video)}
      className={`w-full flex items-center gap-2 py-2 pr-3 rounded-md hover:bg-white/5 transition-colors text-left ${
        active ? "bg-gold-400/10" : ""
      }`}
      style={{ paddingLeft: `${depth * INDENT + 10}px` }}
    >
      <span className="w-6 h-6 rounded-full bg-gold-400/10 text-gold-300 flex items-center justify-center shrink-0">
        <IconPlay width={10} height={10} />
      </span>
      <span
        className={`flex-1 min-w-0 truncate text-sm ${active ? "text-gold-300" : "text-cream-100"}`}
      >
        {video.name}
      </span>
      {count > 0 && <span className="badge shrink-0">{count}</span>}
    </button>
  );
}

function FolderOption({ node, depth, currentPath, noteCounts, onSelect }) {
  const [open, setOpen] = useState(() => folderContainsPath(node, currentPath));
  const total = countVideos(node);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-2 pr-3 rounded-md hover:bg-white/5 transition-colors text-left"
        style={{ paddingLeft: `${depth * INDENT + 10}px` }}
      >
        <IconArrowRight
          width={11}
          height={11}
          className={`text-cream-500 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
        />
        <IconFolder width={14} height={14} className="text-cream-500 shrink-0" />
        <span className="flex-1 min-w-0 truncate text-cream-200 text-sm">{node.name}</span>
        <span className="text-cream-500 text-xs shrink-0">
          {total} video{total === 1 ? "" : "s"}
        </span>
      </button>

      {open && (
        <div>
          {node.folders.map((folder) => (
            <FolderOption
              key={folder.path}
              node={folder}
              depth={depth + 1}
              currentPath={currentPath}
              noteCounts={noteCounts}
              onSelect={onSelect}
            />
          ))}
          {node.videos.map((video) => (
            <VideoOption
              key={video.path}
              video={video}
              depth={depth + 1}
              currentPath={currentPath}
              noteCounts={noteCounts}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Toggle button pinned to the top-left corner of the video, opening an
// absolutely-positioned drawer (mirroring the course page's folder tree) so
// any video in the course can be jumped to without leaving the player.
// Rendered as `navOverlay` inside VideoPlayer's own relative video box, so
// both the button and the drawer stay bounded to the video's frame.
export default function VideoNavPanel({ tree, currentPath, noteCounts, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleSelect(video) {
    setOpen(false);
    onSelect(video);
  }

  return (
    <div ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Browse videos"
        className="absolute top-3 left-3 z-30 w-8 h-8 rounded-md bg-ink-950/80 backdrop-blur border border-white/15 flex items-center justify-center text-cream-200 hover:text-gold-300 hover:border-gold-400/40 transition-colors"
      >
        {open ? <IconX width={15} height={15} /> : <IconMenu width={15} height={15} />}
      </button>

      {open && (
        <div
          className="absolute inset-y-0 left-0 z-20 w-72 max-w-[85%] bg-ink-950 border-r border-white/10 overflow-y-auto p-2 pt-14 animate-slide-in-left"
          style={{ boxShadow: "var(--shadow-pop)" }}
        >
          {tree.videos.map((video) => (
            <VideoOption
              key={video.path}
              video={video}
              depth={0}
              currentPath={currentPath}
              noteCounts={noteCounts}
              onSelect={handleSelect}
            />
          ))}
          {tree.folders.map((folder) => (
            <FolderOption
              key={folder.path}
              node={folder}
              depth={0}
              currentPath={currentPath}
              noteCounts={noteCounts}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
