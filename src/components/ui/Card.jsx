export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-3xl bg-white p-4 shadow-cake-sm ring-1 ring-cake-pink-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}