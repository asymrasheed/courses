import Link from "next/link";
import { IconEdit, IconTrash, IconArrowRight } from "@/components/icons";

export default function CourseCard({ course, onEdit, onDelete, delay = 0 }) {
  return (
    <div className="card p-5 flex flex-col animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between mb-2">
        <span
          className="badge"
          style={{ color: course.category?.color, background: `${course.category?.color}1a` }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: course.category?.color }}
          />
          {course.category?.name}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(course)}
            className="p-1.5 rounded-md text-cream-500 hover:text-gold-300 hover:bg-white/5 transition-colors"
            aria-label="Edit"
          >
            <IconEdit width={15} height={15} />
          </button>
          <button
            onClick={() => onDelete(course)}
            className="p-1.5 rounded-md text-cream-500 hover:text-clay-400 hover:bg-white/5 transition-colors"
            aria-label="Delete"
          >
            <IconTrash width={15} height={15} />
          </button>
        </div>
      </div>

      <h3 className="font-display text-lg text-cream-100 mt-2">{course.title}</h3>
      {course.description && (
        <p className="text-cream-500 text-sm mt-1.5 line-clamp-2">{course.description}</p>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
        <span className="badge">
          {course.questionCount} question{course.questionCount === 1 ? "" : "s"}
        </span>
        <Link
          href={`/dashboard/courses/${course._id}`}
          className="text-sm text-gold-300 hover:text-gold-200 flex items-center gap-1"
        >
          Manage <IconArrowRight width={13} height={13} />
        </Link>
      </div>
    </div>
  );
}
