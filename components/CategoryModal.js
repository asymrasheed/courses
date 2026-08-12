"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";

export const PALETTE = [
  { label: "Gold", value: "#e9a23b" },
  { label: "Clay", value: "#d9704f" },
  { label: "Sage", value: "#7f9c72" },
  { label: "Dusk", value: "#6382a1" },
  { label: "Plum", value: "#a172a0" },
  { label: "Teal", value: "#4f9e94" },
  { label: "Rose", value: "#c97686" },
  { label: "Olive", value: "#a49a52" },
];

export default function CategoryModal({ open, onClose, category, onSaved }) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PALETTE[0].value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name || "");
      setDescription(category?.description || "");
      setColor(category?.color || PALETTE[0].value);
    }
  }, [open, category]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/api/categories/${category._id}`, { name, description, color });
        toast.success("Category updated");
      } else {
        await api.post("/api/categories", { name, description, color });
        toast.success("Category created");
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
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit category" : "New category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input
            className="field-input"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Web Development"
          />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea
            className="field-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What kind of courses live here?"
          />
        </div>
        <div>
          <label className="field-label">Color</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((swatch) => (
              <button
                type="button"
                key={swatch.value}
                title={swatch.label}
                onClick={() => setColor(swatch.value)}
                className="w-8 h-8 rounded-full transition-transform"
                style={{
                  background: swatch.value,
                  outline: color === swatch.value ? "2px solid var(--color-cream-100)" : "none",
                  outlineOffset: "2px",
                  transform: color === swatch.value ? "scale(1.08)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
