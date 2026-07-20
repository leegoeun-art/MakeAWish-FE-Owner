const VARIANTS = {
  primary: 'bg-cake-pink-500 text-white shadow-cake-sm active:scale-95 hover:bg-cake-pink-600',
  secondary: 'bg-cake-pink-100 text-cake-pink-700 active:scale-95 hover:bg-cake-pink-200',
  outline: 'bg-white text-cake-pink-600 border border-cake-pink-300 active:scale-95 hover:bg-cake-pink-50',
  ghost: 'bg-transparent text-cake-ink-soft active:scale-95 hover:bg-cake-pink-50',
  danger: 'bg-white text-red-400 border border-red-200 active:scale-95 hover:bg-red-50',
  mint: 'bg-cake-mint-400 text-white shadow-cake-sm active:scale-95 hover:bg-cake-mint-600',
}

export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? '처리 중…' : children}
    </button>
  )
}