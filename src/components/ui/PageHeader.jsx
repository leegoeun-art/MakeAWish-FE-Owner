import { useNavigate } from 'react-router-dom'
import { CaretLeft } from '@phosphor-icons/react'

export default function PageHeader({ title, subtitle, back = false, right }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 bg-cake-cream/90 px-5 pb-3 pt-5 backdrop-blur">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-cake-ink active:bg-cake-pink-100"
          aria-label="뒤로가기"
        >
          <CaretLeft size={20} weight="bold" />
        </button>
      )}
      <div className="flex-1">
        <h1 className="font-display text-xl text-cake-ink">{title}</h1>
        {subtitle && <p className="text-xs text-cake-ink-soft">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}