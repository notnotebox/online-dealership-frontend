import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { HeaderNav } from '@/components/layout/header-nav'

const appLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/profile', label: 'Profil' },
  { to: '/app/favorites', label: 'Favoris' },
  { to: '/app/files', label: 'Dossiers' },
  { to: '/app/settings', label: 'Parametres' },
]

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <nav className="border-b bg-muted/20">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4">
          {appLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8"><Outlet /></main>
    </div>
  )
}
