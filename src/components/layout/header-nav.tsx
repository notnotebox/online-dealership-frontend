import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

export function HeaderNav() {
  const { isAuthenticated } = useAuth()
  const favoritesPath = isAuthenticated ? '/app/favorites' : '/favorites'
  const depositPath = isAuthenticated ? '/app/files/new' : '/login'

  return (
    <header className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold">M-Motors</Link>
        <nav className="hidden gap-6 md:flex">
          {[
            { to: '/vehicles', label: 'Vehicules' },
            { to: favoritesPath, label: 'Favoris' },
          ].map((l) => (
            <NavLink key={l.to} to={l.to} className="text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" asChild><Link to="/app/dashboard">Espace client</Link></Button>
              <Button asChild><Link to={depositPath}>Deposer un dossier</Link></Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/login">Connexion</Link></Button>
              <Button asChild><Link to={depositPath}>Deposer un dossier</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
