import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const links = [
  { to: '/vehicles', label: 'Vehicules' },
  { to: '/favorites', label: 'Favoris' },
]

export function HeaderNav() {
  return (
    <header className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold">M-Motors</Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/login">Connexion</Link></Button>
          <Button asChild><Link to="/login">Deposer un dossier</Link></Button>
        </div>
      </div>
    </header>
  )
}
