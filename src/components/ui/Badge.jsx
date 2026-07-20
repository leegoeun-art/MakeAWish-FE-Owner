const STATUS_STYLE = {
  PENDING: { label: '수락 대기', className: 'bg-cake-yellow-100 text-cake-yellow-600' },
  ACCEPTED: { label: '제작 예정', className: 'bg-cake-lavender-100 text-cake-lavender-600' },
  IN_PROGRESS: { label: '제작 중', className: 'bg-cake-pink-100 text-cake-pink-600' },
  COMPLETED: { label: '완료', className: 'bg-cake-mint-100 text-cake-mint-600' },
  REJECTED: { label: '거절됨', className: 'bg-gray-100 text-gray-500' },
}

export function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${s.className}`}>
      {s.label}
    </span>
  )
}

export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-cake-pink-50 px-2.5 py-1 text-xs font-medium text-cake-pink-600 ${className}`}>
      {children}
    </span>
  )
}