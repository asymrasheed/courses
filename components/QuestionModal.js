"use client";

import Modal from "@/components/Modal";
import NoteForm from "@/components/NoteForm";

// Note for a course — either anchored to a video at a timestamp, or a general
// course note (when `video` is omitted, e.g. no videos uploaded yet).
export default function QuestionModal({
  open,
  onClose,
  courseId,
  courseFolder,
  video,
  question,
  getCurrentTime,
  onSaved,
}) {
  const isEdit = Boolean(question);

  function handleSaved() {
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit note" : "New note"} width="max-w-2xl">
      <NoteForm
        courseId={courseId}
        courseFolder={courseFolder}
        video={video}
        question={question}
        getCurrentTime={getCurrentTime}
        onSaved={handleSaved}
        onCancel={onClose}
      />
    </Modal>
  );
}
