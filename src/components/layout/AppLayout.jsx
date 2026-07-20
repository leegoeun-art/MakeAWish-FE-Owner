import { Outlet } from 'react-router-dom'
import TabBar from './TabBar'

export default function AppLayout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-cake-cream">
      <div className="flex-1 pb-24">
        <Outlet />
      </div>
      <TabBar />
    </div>
  )
}