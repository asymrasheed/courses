"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import CourseModal from "@/components/CourseModal";
import QuestionModal from "@/components/QuestionModal";
import QuestionCard from "@/components/QuestionCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api } from "@/lib/api";
import {
  IconEdit,
  IconTrash,
  IconArrowRight,
  IconPlay,
  IconFolder,
  IconPlus,
  IconHelp,
} from "@/components/icons";
import { useRouter } from "next/navigation";

const fetcher = (url) => api.get(url);

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: course, isLoading: courseLoading, mutate: mutateCourse } = useSWR(
    `/api/courses/${id}`,
    fetcher
  );
  const {
    data: videoData,
    isLoading: videosLoading,
    mutate: mutateVideos,
  } = useSWR(`/api/courses/${id}/videos`, fetcher);
  const { data: questions, mutate: mutateQuestions } = useSWR(
    `/api/questions?course=${id}`,
    fetcher
  );

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [courseDeleteLoading, setCourseDeleteLoading] = useState(false);

  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [noteDeleteLoading, setNoteDeleteLoading] = useState(false);

  const noteCounts = useMemo(() => {
    const map = new Map();
    (questions || []).forEach((q) => map.set(q.video, (map.get(q.video) || 0) + 1));
    return map;
  }, [questions]);

  const generalNotes = useMemo(() => (questions || []).filter((q) => !q.video), [questions]);

  const videoCount = useMemo(
    () => (videoData?.sections || []).reduce((sum, s) => sum + s.videos.length, 0),
    [videoData]
  );

  async function handleDeleteCourse() {
    setCourseDeleteLoading(true);
    try {
      await api.del(`/api/courses/${id}`);
      toast.success("Course deleted");
      router.push("/dashboard/courses");
    } catch (err) {
      toast.error(err.message);
      setCourseDeleteLoading(false);
    }
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
    setNoteDeleteLoading(true);
    try {
      await api.del(`/api/questions/${deletingNote._id}`);
      toast.success("Note deleted");
      mutateQuestions();
      setDeletingNote(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setNoteDeleteLoading(false);
    }
  }

  if (courseLoading) return <p className="text-cream-500 text-sm">Loading…</p>;
  if (!course) {
    return (
      <div className="card p-12 text-center">
        <p className="text-cream-300">Course not found.</p>
        <Link href="/dashboard/courses" className="text-gold-300 text-sm mt-3 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/courses"
        className="text-sm text-cream-500 hover:text-cream-100 flex items-center gap-1 mb-4"
      >
        <IconArrowRight width={13} height={13} className="rotate-180" /> All courses
      </Link>

      <PageHeader
        eyebrow={course.category?.name}
        title={course.title}
        description={course.description}
        actions={
          <>
            <button className="btn btn-ghost" onClick={() => setCourseModalOpen(true)}>
              <IconEdit width={15} height={15} /> Edit
            </button>
            <button className="btn btn-danger" onClick={() => setDeletingCourse(true)}>
              <IconTrash width={15} height={15} /> Delete
            </button>
          </>
        }
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg text-cream-100">
          Videos <span className="text-cream-500 text-sm font-sans">({videoCount})</span>
        </h2>
      </div>

      {videosLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : videoCount === 0 ? (
        <div className="card p-8 text-center">
          <IconFolder width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No videos found yet.</p>
          <p className="text-cream-500 text-sm mt-2">
            Drop video files into{" "}
            <code className="text-gold-300">public/courses/{course.folder}/</code> (subfolders
            are grouped as sections), then refresh.
          </p>
          <button className="btn btn-ghost mt-5" onClick={() => mutateVideos()}>
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {videoData.sections.map((section) => (
            <div key={section.name || "__root"}>
              {section.name && (
                <h3 className="text-cream-300 text-sm font-medium mb-2 flex items-center gap-1.5">
                  <IconFolder width={14} height={14} className="text-cream-500" />
                  {section.name}
                </h3>
              )}
              <div className="space-y-2">
                {section.videos.map((video) => (
                  <Link
                    key={video.path}
                    href={`/dashboard/courses/${id}/watch?v=${encodeURIComponent(video.path)}`}
                    className="card flex items-center gap-3 px-4 py-3 hover:border-gold-400/30 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-gold-400/10 text-gold-300 flex items-center justify-center shrink-0">
                      <IconPlay width={14} height={14} />
                    </span>
                    <span className="flex-1 min-w-0 truncate text-cream-100">{video.name}</span>
                    {noteCounts.get(video.path) > 0 && (
                      <span className="badge shrink-0">
                        {noteCounts.get(video.path)} note
                        {noteCounts.get(video.path) === 1 ? "" : "s"}
                      </span>
                    )}
                    <IconArrowRight width={13} height={13} className="text-cream-500 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!videosLoading && videoCount === 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-cream-100">
              Notes <span className="text-cream-500 text-sm font-sans">({generalNotes.length})</span>
            </h2>
            <button className="btn btn-primary" onClick={openAddNote}>
              <IconPlus width={16} height={16} /> Add note
            </button>
          </div>

          {generalNotes.length === 0 ? (
            <div className="card p-12 text-center">
              <IconHelp width={28} height={28} className="text-cream-500 mx-auto mb-3" />
              <p className="text-cream-300">No notes yet for this course.</p>
              <button className="btn btn-primary mt-5" onClick={openAddNote}>
                Add the first note
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {generalNotes.map((note, i) => (
                <QuestionCard
                  key={note._id}
                  question={note}
                  index={i}
                  onEdit={openEditNote}
                  onDelete={setDeletingNote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        course={course}
        onSaved={mutateCourse}
      />

      <QuestionModal
        open={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        courseId={id}
        courseFolder={course.folder}
        question={editingNote}
        onSaved={mutateQuestions}
      />

      <ConfirmDialog
        open={deletingCourse}
        onClose={() => setDeletingCourse(false)}
        onConfirm={handleDeleteCourse}
        title="Delete course"
        description={`Delete "${course.title}"? All of its notes will be removed too (uploaded video files are kept on disk).`}
        loading={courseDeleteLoading}
      />

      <ConfirmDialog
        open={Boolean(deletingNote)}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        title="Delete note"
        description="This note and its answer will be permanently removed."
        loading={noteDeleteLoading}
      />
    </div>
  );
}
