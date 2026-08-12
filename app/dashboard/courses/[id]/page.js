"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import PageHeader from "@/components/PageHeader";
import CourseModal from "@/components/CourseModal";
import QuestionModal from "@/components/QuestionModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import QuestionCard from "@/components/QuestionCard";
import { api } from "@/lib/api";
import { IconPlus, IconEdit, IconTrash, IconArrowRight, IconHelp } from "@/components/icons";

const fetcher = (url) => api.get(url);

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { data: course, isLoading: courseLoading, mutate: mutateCourse } = useSWR(
    `/api/courses/${id}`,
    fetcher
  );
  const { data: questions, isLoading: questionsLoading, mutate: mutateQuestions } = useSWR(
    `/api/questions?course=${id}`,
    fetcher
  );

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [courseDeleteLoading, setCourseDeleteLoading] = useState(false);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [questionDeleteLoading, setQuestionDeleteLoading] = useState(false);

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

  function openAddQuestion() {
    setEditingQuestion(null);
    setQuestionModalOpen(true);
  }

  function openEditQuestion(q) {
    setEditingQuestion(q);
    setQuestionModalOpen(true);
  }

  async function handleDeleteQuestion() {
    setQuestionDeleteLoading(true);
    try {
      await api.del(`/api/questions/${deletingQuestion._id}`);
      toast.success("Question deleted");
      mutateQuestions();
      setDeletingQuestion(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setQuestionDeleteLoading(false);
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
          Questions{" "}
          <span className="text-cream-500 text-sm font-sans">({questions?.length || 0})</span>
        </h2>
        <button className="btn btn-primary" onClick={openAddQuestion}>
          <IconPlus width={16} height={16} /> Add question
        </button>
      </div>

      {questionsLoading ? (
        <p className="text-cream-500 text-sm">Loading…</p>
      ) : questions.length === 0 ? (
        <div className="card p-12 text-center">
          <IconHelp width={28} height={28} className="text-cream-500 mx-auto mb-3" />
          <p className="text-cream-300">No questions yet for this course.</p>
          <button className="btn btn-primary mt-5" onClick={openAddQuestion}>
            Add the first question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q._id}
              question={q}
              index={i}
              onEdit={openEditQuestion}
              onDelete={setDeletingQuestion}
            />
          ))}
        </div>
      )}

      <CourseModal
        open={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        course={course}
        onSaved={mutateCourse}
      />

      <QuestionModal
        open={questionModalOpen}
        onClose={() => setQuestionModalOpen(false)}
        courseId={id}
        question={editingQuestion}
        onSaved={mutateQuestions}
      />

      <ConfirmDialog
        open={deletingCourse}
        onClose={() => setDeletingCourse(false)}
        onConfirm={handleDeleteCourse}
        title="Delete course"
        description={`Delete "${course.title}"? All ${questions?.length || 0} question(s) will be removed too.`}
        loading={courseDeleteLoading}
      />

      <ConfirmDialog
        open={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete question"
        description="This question and its answer will be permanently removed."
        loading={questionDeleteLoading}
      />
    </div>
  );
}
