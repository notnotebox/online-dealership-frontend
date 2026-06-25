import { NavLink } from 'react-router-dom'
import { AppLogo } from '@/components/layout/app-logo'
import { useAuth } from '@/lib/auth/auth-context'

export function BackofficeSidebar() {
  const { profile, session } = useAuth()
  const role = profile?.role ?? session?.user.role
  const items = [
    { to: '/backoffice/dashboard', label: 'Dashboard' },
    { to: '/backoffice/vehicles', label: 'Vehicules' },
    { to: '/backoffice/files', label: 'Dossiers' },
    { to: '/backoffice/users', label: role === 'ADMIN' ? 'Utilisateurs' : 'Equipe' },
  ]

  return (
    <aside className="w-64 border-r bg-muted/30 p-4">
      <AppLogo to="/backoffice/dashboard" label="Backoffice" className="mb-6" />
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
