import { Outlet } from 'react-router-dom'
import { PublicHeader } from '@/components/layout/public-header'
import { FooterBar } from '@/components/layout/footer-bar'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <FooterBar />
    </div>
  )
}
