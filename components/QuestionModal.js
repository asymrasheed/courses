"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import RichTextEditor from "@/components/RichTextEditor";
import { api } from "@/lib/api";

const EMPTY = "<p></p>";

export default function QuestionModal({ open, onClose, courseId, question, onSaved }) {
  const isEdit = Boolean(question);
  const [questionHtml, setQuestionHtml] = useState(EMPTY);
  const [answerHtml, setAnswerHtml] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuestionHtml(question?.question || EMPTY);
      setAnswerHtml(question?.answer || EMPTY);
    }
  }, [open, question]);

  function isBlank(html) {
    return !html || html.replace(/<[^>]+>/g, "").trim() === "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
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
        });
        toast.success("Question updated");
      } else {
        await api.post("/api/questions", {
          course: courseId,
          question: questionHtml,
          answer: answerHtml,
        });
        toast.success("Question added");
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
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit question" : "New question"}
      width="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="field-label">Question</label>
          <RichTextEditor
            value={questionHtml}
            onChange={setQuestionHtml}
            placeholder="Write the question…"
          />
        </div>
        <div>
          <label className="field-label">Answer</label>
          <RichTextEditor
            value={answerHtml}
            onChange={setAnswerHtml}
            placeholder="Write the answer…"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add question"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
