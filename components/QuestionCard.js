"use client";

import { useState } from "react";
import { IconEdit, IconTrash, IconArrowRight } from "@/components/icons";

export default function QuestionCard({ question, index, onEdit, onDelete, meta }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card animate-fade-up" style={{ animationDelay: `${Math.min(index, 10) * 0.03}s` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-3 text-left px-5 py-4"
      >
        <span className="text-cream-500 text-xs font-mono mt-1 shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          {meta}
          <div
            className="prose-content text-cream-100 [&_p]:mb-0 font-medium"
            dangerouslySetInnerHTML={{ __html: question.question }}
          />
        </div>
        <IconArrowRight
          width={14}
          height={14}
          className={`text-cream-500 shrink-0 mt-1.5 transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 pl-11">
          <div
            className="prose-content border-l-2 border-gold-400/40 pl-4"
            dangerouslySetInnerHTML={{ __html: question.answer }}
          />
          {(onEdit || onDelete) && (
            <div className="flex gap-2 mt-4">
              {onEdit && (
                <button className="btn btn-ghost !py-1.5 !px-3 text-xs" onClick={() => onEdit(question)}>
                  <IconEdit width={13} height={13} /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="btn btn-danger !py-1.5 !px-3 text-xs"
                  onClick={() => onDelete(question)}
                >
                  <IconTrash width={13} height={13} /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
