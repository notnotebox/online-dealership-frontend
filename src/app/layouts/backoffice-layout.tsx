import { Outlet } from 'react-router-dom'
import { BackofficeSidebar } from '@/components/layout/backoffice-sidebar'

export function BackofficeLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <BackofficeSidebar />
      <main className="flex-1 p-8"><Outlet /></main>
    </div>
  )
}
