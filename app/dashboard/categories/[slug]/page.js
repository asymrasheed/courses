"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import CourseModal from "@/components/CourseModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import CourseCard from "@/components/CourseCard";
import { api } from "@/lib/api";
import { IconPlus, IconBook, IconArrowRight } from "@/components/icons";

const fetcher = (url) => api.get(url);

export default function CategoryCoursesPage({ params }) {
  const { slug } = use(params);
  const { data: category, isLoading: catLoading } = useSWR(`/api/categories/${slug}`, fetcher);
  const { data: courses, isLoading, mutate } = useSWR(
    () => `/api/courses?category=${slug}`,
    fetcher
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  if (catLoading) return <p className="text-cream-500 text-sm">Loading…</p>;
  if (!category) {
    return (
      <div className="card p-12 text-center">
        <p className="text-cream-300">Category not found.</p>
        <Link href="/dashboard/categories" className="text-gold-300 text-sm mt-3 inline-block">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/categories"
        className="text-sm text-cream-500 hover:text-cream-100 flex items-center gap-1 mb-4"
      >
        <IconArrowRight width={13} height={13} className="rotate-180" /> All categories
      </Link>

      <PageHeader
        eyebrow="Category"
        title={category.name}
        description={category.description || "Courses in this category."}
        actions={
          <button className="btn btn-primary" onClick={openCreate}>
            <IconPlus width={16} height={16} /> New course
          </button>
        }
      />

      {isLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <IconBook width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No courses in this category yet.</p>
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
        defaultCategoryId={category._id}
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
