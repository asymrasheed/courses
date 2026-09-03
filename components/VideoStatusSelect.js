"use client";

// Any status can be picked directly from any other — no forced progression.
export const STATUS_META = {
  pending: { label: "Pending", color: "var(--color-cream-500)" },
  learning: { label: "Learning", color: "var(--color-gold-300)" },
  done: { label: "Done", color: "var(--color-sage-400)" },
};

export default function VideoStatusSelect({ status, onChange, size = "sm" }) {
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <select
      value={status || "pending"}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      title="Video status"
      className={`status-select ${size === "md" ? "status-select-md" : ""}`}
      style={{ color: meta.color, borderColor: meta.color }}
    >
      {Object.entries(STATUS_META).map(([value, m]) => (
        <option key={value} value={value}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
