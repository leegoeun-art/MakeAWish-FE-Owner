export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white/60 py-14 text-center">
      {icon && <div className="text-5xl">{icon}</div>}
      <p className="font-display text-lg text-cake-ink">{title}</p>
      {description && <p className="max-w-xs text-sm text-cake-ink-soft">{description}</p>}
    </div>
  )
}