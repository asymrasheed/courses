"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/RichTextEditor";
import { api } from "@/lib/api";
import { formatTime, parseTime } from "@/lib/time";
import { IconClock } from "@/components/icons";

const EMPTY = "<p></p>";

// Add/edit form for a course note — either anchored to a video at a
// timestamp, or a general course note (when `video` is omitted).
export default function NoteForm({
  courseId,
  courseFolder,
  video,
  question,
  getCurrentTime,
  onSaved,
  onCancel,
}) {
  const isEdit = Boolean(question);
  const hasVideo = Boolean(video || question?.video);
  const [timeText, setTimeText] = useState("0:00");
  const [title, setTitle] = useState("");
  const [notesHtml, setNotesHtml] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasVideo) {
      const initial = isEdit ? question.timestamp : getCurrentTime ? getCurrentTime() : 0;
      setTimeText(formatTime(initial));
    }
    setTitle(question?.title || "");
    setNotesHtml(question?.notes || EMPTY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

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
    if (!title.trim() || isBlank(notesHtml)) {
      toast.error("Both title and notes are required");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/questions/${question._id}`, {
          title: title.trim(),
          notes: notesHtml,
          ...(hasVideo ? { timestamp: seconds } : {}),
        });
        toast.success("Note updated");
      } else {
        await api.post("/api/questions", {
          course: courseId,
          title: title.trim(),
          notes: notesHtml,
          ...(hasVideo ? { video, timestamp: seconds } : {}),
        });
        toast.success("Note added");
      }
      onSaved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
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
        <label className="field-label">Title</label>
        <input
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title…"
        />
      </div>
      <div>
        <label className="field-label">Notes</label>
        <RichTextEditor
          value={notesHtml}
          onChange={setNotesHtml}
          placeholder="Write your notes…"
          uploadFolder={courseFolder}
        />
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : isEdit ? "Save changes" : "Add note"}
        </button>
      </div>
    </form>
  );
}
