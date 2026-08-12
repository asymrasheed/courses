"use client";

import { use, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import QuestionModal from "@/components/QuestionModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import QuestionCard from "@/components/QuestionCard";
import VideoPlayer from "@/components/VideoPlayer";
import { api } from "@/lib/api";
import { formatTime } from "@/lib/time";
import { flattenVideoTree } from "@/lib/videoTree";
import {
  IconArrowRight,
  IconPlus,
  IconHelp,
  IconFolder,
} from "@/components/icons";

const fetcher = (url) => api.get(url);

export default function WatchPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoPath = searchParams.get("v") || "";

  const { data: course } = useSWR(`/api/courses/${id}`, fetcher);
  const { data: videoData } = useSWR(`/api/courses/${id}/videos`, fetcher);
  const {
    data: notes,
    isLoading: notesLoading,
    mutate: mutateNotes,
  } = useSWR(
    videoPath ? `/api/questions?course=${id}&video=${encodeURIComponent(videoPath)}` : null,
    fetcher
  );

  const videoRef = useRef(null);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const flatVideos = useMemo(() => {
    if (!videoData?.tree) return [];
    return flattenVideoTree(videoData.tree);
  }, [videoData]);

  const currentIndex = flatVideos.findIndex((v) => v.path === videoPath);
  const currentVideo = currentIndex >= 0 ? flatVideos[currentIndex] : null;
  const prevVideo = currentIndex > 0 ? flatVideos[currentIndex - 1] : null;
  const nextVideo =
    currentIndex >= 0 && currentIndex < flatVideos.length - 1
      ? flatVideos[currentIndex + 1]
      : null;

  function goTo(video) {
    router.push(`/dashboard/courses/${id}/watch?v=${encodeURIComponent(video.path)}`);
  }

  function getCurrentTime() {
    return videoRef.current?.currentTime || 0;
  }

  function seekTo(seconds) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    videoRef.current.play();
  }

  function handleEnded() {
    if (autoAdvance && nextVideo) goTo(nextVideo);
  }

  function openAddNote() {
    setEditingNote(null);
    setNoteModalOpen(true);
  }

  function openEditNote(note) {
    setEditingNote(note);
    setNoteModalOpen(true);
  }

  async function handleDeleteNote() {
    setDeleteLoading(true);
    try {
      await api.del(`/api/questions/${deletingNote._id}`);
      toast.success("Note deleted");
      mutateNotes();
      setDeletingNote(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (!videoPath) {
    return (
      <div className="card p-12 text-center">
        <p className="text-cream-300">No video selected.</p>
        <Link href={`/dashboard/courses/${id}`} className="text-gold-300 text-sm mt-3 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  if (videoData && !currentVideo) {
    return (
      <div className="card p-12 text-center">
        <IconFolder width={28} height={28} className="text-cream-500 mx-auto mb-3" />
        <p className="text-cream-300">This video wasn&apos;t found in the course folder.</p>
        <Link href={`/dashboard/courses/${id}`} className="text-gold-300 text-sm mt-3 inline-block">
          Back to course
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <Link
          href={`/dashboard/courses/${id}`}
          className="text-sm text-cream-500 hover:text-cream-100 flex items-center gap-1"
        >
          <IconArrowRight width={13} height={13} className="rotate-180" /> {course?.title || "Course"}
        </Link>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            disabled={!prevVideo}
            onClick={() => prevVideo && goTo(prevVideo)}
          >
            Previous
          </button>
          <button
            className="btn btn-ghost !py-1.5 !px-3 text-xs"
            disabled={!nextVideo}
            onClick={() => nextVideo && goTo(nextVideo)}
          >
            Next
          </button>
        </div>
      </div>

      <h1 className="font-display text-xl text-cream-100 mb-1">{currentVideo?.name}</h1>
      {currentVideo?.section && (
        <p className="text-cream-500 text-sm mb-5 flex items-center gap-1.5">
          <IconFolder width={13} height={13} /> {currentVideo.section}
        </p>
      )}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-[60%]">
          {currentVideo && (
            <VideoPlayer
              ref={videoRef}
              src={currentVideo.url}
              videoKey={currentVideo.path}
              onEnded={handleEnded}
              autoAdvance={autoAdvance}
              onToggleAutoAdvance={() => setAutoAdvance((a) => !a)}
            />
          )}
        </div>

        <div className="w-full lg:w-[40%]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-cream-100">
              Notes <span className="text-cream-500 text-sm font-sans">({notes?.length || 0})</span>
            </h2>
            <button className="btn btn-primary !py-1.5 !px-3 text-xs" onClick={openAddNote}>
              <IconPlus width={14} height={14} /> Add note
            </button>
          </div>

          {notesLoading ? (
            <p className="text-cream-500 text-sm">Loading…</p>
          ) : notes.length === 0 ? (
            <div className="card p-8 text-center">
              <IconHelp width={24} height={24} className="text-cream-500 mx-auto mb-3" />
              <p className="text-cream-300 text-sm">No notes yet for this video.</p>
              <button className="btn btn-primary mt-4 text-xs" onClick={openAddNote}>
                Add the first note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note, i) => (
                <QuestionCard
                  key={note._id}
                  question={note}
                  index={i}
                  onEdit={openEditNote}
                  onDelete={setDeletingNote}
                  meta={
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        seekTo(note.timestamp);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          seekTo(note.timestamp);
                        }
                      }}
                      className="badge mb-1.5 inline-flex cursor-pointer hover:border-gold-400/50 hover:text-gold-300 transition-colors"
                    >
                      {formatTime(note.timestamp)}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <QuestionModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        courseId={id}
        courseFolder={course?.folder}
        video={videoPath}
        question={editingNote}
        getCurrentTime={getCurrentTime}
        onSaved={mutateNotes}
      />

      <ConfirmDialog
        open={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        title="Delete note"
        description="This note and its answer will be permanently removed."
        loading={deleteLoading}
      />
    </div>
  );
}
