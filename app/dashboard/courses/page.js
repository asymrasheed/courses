"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import CourseModal from "@/components/CourseModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import CourseCard from "@/components/CourseCard";
import { api } from "@/lib/api";
import { IconPlus, IconBook, IconSearch } from "@/components/icons";

const fetcher = (url) => api.get(url);

export default function CoursesPage() {
  const [categorySlug, setCategorySlug] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { data: categories } = useSWR("/api/categories", fetcher);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (search) params.set("search", search);
    return params.toString();
  }, [categorySlug, search]);

  const { data: courses, isLoading, mutate } = useSWR(`/api/courses?${query}`, fetcher);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(course) {
    setEditing(course);
    setModalOpen(true);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      await api.del(`/api/courses/${deleting._id}`);
      toast.success("Course deleted");
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
        eyebrow="Content"
        title="Courses"
        description="Every course, linked to a category, holding its own question bank."
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus width={16} height={16} /> New course
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <IconSearch
            width={15}
            height={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-cream-500"
          />
          <input
            className="field-input pl-9"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="field-select w-full sm:w-56"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <IconBook width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No courses match yet.</p>
          <button className="btn btn-primary mt-5" onClick={openCreate}>
            Create a course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={openEdit}
              onDelete={setDeleting}
              delay={Math.min(i, 8) * 0.04}
            />
          ))}
        </div>
      )}

      <CourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        course={editing}
        onSaved={mutate}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete course"
        description={`Delete "${deleting?.title}"? All of its questions will be removed too.`}
        loading={deleteLoading}
      />
    </div>
  );
}
