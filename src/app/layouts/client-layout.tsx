import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { HeaderNav } from '@/components/layout/header-nav'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

const appLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/profile', label: 'Profil' },
  { to: '/app/favorites', label: 'Favoris' },
  { to: '/app/files', label: 'Demandes' },
  { to: '/app/settings', label: 'Parametres' },
]

export function ClientLayout() {
  const { profile, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <HeaderNav />
      <nav className="border-b bg-muted/20">
        <div className="mx-auto flex min-h-11 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2">
          <div className="flex flex-wrap items-center gap-1">
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
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Compte connecte</p>
              <p className="text-sm font-medium">{profile?.firstName ?? 'Utilisateur'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Deconnexion
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8"><Outlet /></main>
    </div>
  )
}
