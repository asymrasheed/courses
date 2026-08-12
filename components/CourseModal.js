"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";

const fetcher = (url) => api.get(url);

export default function CourseModal({ open, onClose, course, defaultCategoryId, onSaved }) {
  const isEdit = Boolean(course);
  const { data: categories } = useSWR(open ? "/api/categories" : null, fetcher);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(course?.title || "");
      setDescription(course?.description || "");
      setCategoryId(course?.category?._id || defaultCategoryId || "");
    }
  }, [open, course, defaultCategoryId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { title, description, category: categoryId };
      if (isEdit) {
        await api.put(`/api/courses/${course._id}`, payload);
        toast.success("Course updated");
      } else {
        await api.post("/api/courses", payload);
        toast.success("Course created");
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
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit course" : "New course"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input
            className="field-input"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Fundamentals"
          />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea
            className="field-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this course cover?"
          />
        </div>
        <div>
          <label className="field-label">Category</label>
          <select
            className="field-select"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {categories?.length === 0 && (
            <p className="text-clay-400 text-xs mt-1.5">
              Create a category first before adding courses.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || !categoryId}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create course"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
