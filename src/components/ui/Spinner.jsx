export default function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-cake-pink-500">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-cake-pink-100 border-t-cake-pink-500" />
      {label && <p className="text-sm text-cake-ink-soft">{label}</p>}
    </div>
  )
}