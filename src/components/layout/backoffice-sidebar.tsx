import { Link, NavLink } from 'react-router-dom'

const items = [
  { to: '/backoffice/dashboard', label: 'Dashboard' },
  { to: '/backoffice/vehicles', label: 'Vehicules' },
  { to: '/backoffice/files', label: 'Dossiers' },
]

export function BackofficeSidebar() {
  return (
    <aside className="w-64 border-r bg-muted/30 p-4">
      <Link to="/backoffice/dashboard" className="mb-6 block text-lg font-semibold">Backoffice</Link>
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
