import { matchPath, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FooterBar } from '@/components/layout/footer-bar'
import { SiteHeader } from '@/components/layout/site-header'
import { useAuth } from '@/lib/auth/auth-context'

const appLinks = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/profile', label: 'Profil' },
  { to: '/app/favoris', label: 'Favoris' },
  { to: '/app/files', label: 'Demandes' },
  { to: '/app/settings', label: 'Parametres' },
]

export function ClientLayout() {
  const { profile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const contextAction =
    matchPath('/app/files/new', location.pathname) ||
    matchPath('/app/files/new/:vehicleId', location.pathname) ||
    matchPath('/app/files/:fileId', location.pathname) ||
    matchPath('/app/files/:fileId/upload', location.pathname)
      ? { to: '/vehicles', label: 'Retour catalogue', variant: 'outline' as const }
      : undefined

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        navLinks={[
          { to: '/vehicles', label: 'Vehicules' },
        ]}
        authenticated
        userName={profile?.firstName}
        primaryAction={{ to: '/app/dashboard', label: 'Espace client', variant: 'ghost' }}
        secondaryAction={{ label: 'Deconnexion', variant: 'outline', onClick: () => { logout(); navigate('/'); } }}
        contextAction={contextAction}
      />

      <nav className="border-b bg-muted/20">
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-3 overflow-x-auto px-4 py-2 whitespace-nowrap">
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            {appLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <FooterBar />
    </div>
  )
}
