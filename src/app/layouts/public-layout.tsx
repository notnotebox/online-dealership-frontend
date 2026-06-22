import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { FooterBar } from '@/components/layout/footer-bar'
import { SiteHeader } from '@/components/layout/site-header'
import { useAuth } from '@/lib/auth/auth-context'

export function PublicLayout() {
  const { isAuthenticated, profile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const contextAction = matchPath('/vehicles/:vehicleId', location.pathname)
    ? { to: '/vehicles', label: 'Retour catalogue', variant: 'outline' as const }
    : undefined

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader
        navLinks={[]}
        authenticated={isAuthenticated}
        userName={profile?.firstName}
        primaryAction={isAuthenticated
          ? { to: '/app/dashboard', label: 'Mon espace', variant: 'ghost' }
          : { to: '/login', label: 'Connexion', variant: 'ghost' }}
        secondaryAction={isAuthenticated
          ? { label: 'Deconnexion', variant: 'outline', onClick: () => { logout(); navigate('/'); } }
          : { to: '/register', label: 'Inscription', variant: 'outline' }}
        contextAction={contextAction}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <FooterBar />
    </div>
  )
}
