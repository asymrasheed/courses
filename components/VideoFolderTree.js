"use client";

import { useState } from "react";
import Link from "next/link";
import { IconFolder, IconPlay, IconArrowRight } from "@/components/icons";
import { countVideos } from "@/lib/videoTree";

const INDENT = 18;

function VideoRow({ video, depth, courseId, count }) {
  return (
    <Link
      href={`/dashboard/courses/${courseId}/watch?v=${encodeURIComponent(video.path)}`}
      className="flex items-center gap-2 py-2 pr-3 rounded-md hover:bg-white/5 transition-colors"
      style={{ paddingLeft: `${depth * INDENT + 10}px` }}
    >
      <span className="w-6 h-6 rounded-full bg-gold-400/10 text-gold-300 flex items-center justify-center shrink-0">
        <IconPlay width={10} height={10} />
      </span>
      <span className="flex-1 min-w-0 truncate text-cream-100 text-sm">{video.name}</span>
      {count > 0 && (
        <span className="badge shrink-0">
          {count} note{count === 1 ? "" : "s"}
        </span>
      )}
    </Link>
  );
}

function FolderRow({ node, depth, courseId, noteCounts }) {
  const [open, setOpen] = useState(false);
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
            <FolderRow
              key={folder.path}
              node={folder}
              depth={depth + 1}
              courseId={courseId}
              noteCounts={noteCounts}
            />
          ))}
          {node.videos.map((video) => (
            <VideoRow
              key={video.path}
              video={video}
              depth={depth + 1}
              courseId={courseId}
              count={noteCounts.get(video.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Mirrors the real public/courses/<folder> directory structure: folders are
// collapsed by default so a course with many sections doesn't dump every
// video onto the page at once.
export default function VideoFolderTree({ tree, courseId, noteCounts }) {
  return (
    <div className="card p-2">
      {tree.videos.map((video) => (
        <VideoRow key={video.path} video={video} depth={0} courseId={courseId} count={noteCounts.get(video.path)} />
      ))}
      {tree.folders.map((folder) => (
        <FolderRow key={folder.path} node={folder} depth={0} courseId={courseId} noteCounts={noteCounts} />
      ))}
    </div>
  );
}
