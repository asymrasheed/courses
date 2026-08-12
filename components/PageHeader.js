export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
      <div>
        {eyebrow && <p className="badge mb-3">{eyebrow}</p>}
        <h1 className="font-display text-3xl text-cream-100">{title}</h1>
        {description && (
          <p className="text-cream-500 text-sm mt-2 max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
