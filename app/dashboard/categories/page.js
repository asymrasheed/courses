"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import CategoryModal from "@/components/CategoryModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { api } from "@/lib/api";
import { IconPlus, IconEdit, IconTrash, IconArrowRight, IconLayers } from "@/components/icons";

const fetcher = (url) => api.get(url);

export default function CategoriesPage() {
  const { data: categories, isLoading, mutate } = useSWR("/api/categories", fetcher);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(category) {
    setEditing(category);
    setModalOpen(true);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.del(`/api/categories/${deleting._id}`);
      toast.success("Category deleted");
      mutate();
      setDeleting(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Organize"
        title="Categories"
        description="Group your courses into subject areas."
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus width={16} height={16} /> New category
          </button>
        }
      />

      {isLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <IconLayers width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No categories yet.</p>
          <button className="btn btn-primary mt-5" onClick={openCreate}>
            Create your first category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <div
              key={cat._id}
              className="card p-5 flex flex-col animate-fade-up"
              style={{ animationDelay: `${Math.min(i, 8) * 0.04}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-ink-950 font-semibold text-sm"
                  style={{ background: cat.color }}
                >
                  {cat.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-md text-cream-500 hover:text-gold-300 hover:bg-white/5 transition-colors"
                    aria-label="Edit"
                  >
                    <IconEdit width={15} height={15} />
                  </button>
                  <button
                    onClick={() => setDeleting(cat)}
                    className="p-1.5 rounded-md text-cream-500 hover:text-clay-400 hover:bg-white/5 transition-colors"
                    aria-label="Delete"
                  >
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              </div>

              <h3 className="font-display text-lg text-cream-100">{cat.name}</h3>
              {cat.description && (
                <p className="text-cream-500 text-sm mt-1.5 line-clamp-2">{cat.description}</p>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                <span className="badge">{cat.courseCount} course{cat.courseCount === 1 ? "" : "s"}</span>
                <Link
                  href={`/dashboard/categories/${cat.slug}`}
                  className="text-sm text-gold-300 hover:text-gold-200 flex items-center gap-1"
                >
                  View <IconArrowRight width={13} height={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editing}
        onSaved={mutate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete category"
        description={`Delete "${deleting?.name}"? This can't be undone. Categories with courses can't be deleted.`}
        loading={deleteLoading}
      />
    </div>
  );
}
