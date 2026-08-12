"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import RichTextEditor from "@/components/RichTextEditor";
import { api } from "@/lib/api";
import { formatTime, parseTime } from "@/lib/time";
import { IconClock } from "@/components/icons";

const EMPTY = "<p></p>";

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
  const hasVideo = Boolean(video || question?.video);
  const [timeText, setTimeText] = useState("0:00");
  const [questionHtml, setQuestionHtml] = useState(EMPTY);
  const [answerHtml, setAnswerHtml] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (hasVideo) {
      const initial = isEdit ? question.timestamp : getCurrentTime ? getCurrentTime() : 0;
      setTimeText(formatTime(initial));
    }
    setQuestionHtml(question?.question || EMPTY);
    setAnswerHtml(question?.answer || EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, question]);

  function isBlank(html) {
    return !html || html.replace(/<[^>]+>/g, "").trim() === "";
  }

  function handleCapture() {
    if (getCurrentTime) setTimeText(formatTime(getCurrentTime()));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let seconds = null;
    if (hasVideo) {
      seconds = parseTime(timeText);
      if (seconds === null || seconds < 0) {
        toast.error("Enter a valid time as m:ss");
        return;
      }
    }
    if (isBlank(questionHtml) || isBlank(answerHtml)) {
      toast.error("Both question and answer are required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/questions/${question._id}`, {
          question: questionHtml,
          answer: answerHtml,
          ...(hasVideo ? { timestamp: seconds } : {}),
        });
        toast.success("Note updated");
      } else {
        await api.post("/api/questions", {
          course: courseId,
          question: questionHtml,
          answer: answerHtml,
          ...(hasVideo ? { video, timestamp: seconds } : {}),
        });
        toast.success("Note added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit note" : "New note"} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {hasVideo && (
          <div>
            <label className="field-label">Timestamp</label>
            <div className="flex gap-2">
              <input
                className="field-input w-28"
                value={timeText}
                onChange={(e) => setTimeText(e.target.value)}
                placeholder="m:ss"
              />
              {getCurrentTime && (
                <button type="button" className="btn btn-ghost" onClick={handleCapture}>
                  <IconClock width={14} height={14} /> Use current time
                </button>
              )}
            </div>
          </div>
        )}
        <div>
          <label className="field-label">Question</label>
          <RichTextEditor
            value={questionHtml}
            onChange={setQuestionHtml}
            placeholder="Write the question…"
            uploadFolder={courseFolder}
          />
        </div>
        <div>
          <label className="field-label">Answer</label>
          <RichTextEditor
            value={answerHtml}
            onChange={setAnswerHtml}
            placeholder="Write the answer…"
            uploadFolder={courseFolder}
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add note"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
