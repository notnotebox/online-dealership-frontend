import { Outlet } from 'react-router-dom'
import { HeaderNav } from '@/components/layout/header-nav'
import { FooterBar } from '@/components/layout/footer-bar'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <HeaderNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <FooterBar />
    </div>
  )
}
