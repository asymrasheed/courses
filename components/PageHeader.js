export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
      <div className="flex-1 min-w-0 basis-full sm:basis-0">
        {eyebrow && <p className="badge mb-3">{eyebrow}</p>}
        <h1 className="font-display text-3xl text-cream-100">{title}</h1>
        {description && <p className="text-cream-500 text-sm mt-2">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
