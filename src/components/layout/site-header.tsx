import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export type SiteHeaderLink = {
  to: string
  label: string
}

export type SiteHeaderAction = {
  label: string
  variant?: 'default' | 'ghost' | 'outline'
  to?: string
  onClick?: () => void
}

type SiteHeaderProps = {
  leadingAction?: SiteHeaderAction
  navLinks: SiteHeaderLink[]
  authenticated: boolean
  userName?: string
  primaryAction: SiteHeaderAction
  secondaryAction?: SiteHeaderAction
  contextAction?: SiteHeaderAction
  brandLabel?: string
  brandTo?: string
}

export function SiteHeader({
  leadingAction,
  navLinks,
  authenticated,
  userName,
  primaryAction,
  secondaryAction,
  contextAction,
  brandLabel = 'M-Motors',
  brandTo = '/',
}: SiteHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto h-16 max-w-7xl px-4">
        <div className="flex h-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link to={brandTo} className="shrink-0 text-lg font-semibold">
              {brandLabel}
            </Link>
            {leadingAction && (
              leadingAction.to ? (
                <Button variant={leadingAction.variant ?? 'ghost'} asChild>
                  <Link to={leadingAction.to}>{leadingAction.label}</Link>
                </Button>
              ) : (
                <Button variant={leadingAction.variant ?? 'ghost'} onClick={leadingAction.onClick}>
                  {leadingAction.label}
                </Button>
              )
            )}
          </div>

          {navLinks.length > 0 && (
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 overflow-x-auto whitespace-nowrap md:flex">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className="text-sm text-muted-foreground hover:text-foreground">
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
            {authenticated && (
              <div className="hidden max-w-[160px] text-right sm:block">
                <p className="truncate text-sm font-medium">{userName ?? 'Utilisateur'}</p>
              </div>
            )}

            {contextAction && (
              contextAction.to ? (
                <Button variant={contextAction.variant ?? 'outline'} asChild>
                  <Link to={contextAction.to}>{contextAction.label}</Link>
                </Button>
              ) : (
                <Button variant={contextAction.variant ?? 'outline'} onClick={contextAction.onClick}>
                  {contextAction.label}
                </Button>
              )
            )}

            {primaryAction.to ? (
              <Button variant={primaryAction.variant ?? 'ghost'} asChild>
                <Link to={primaryAction.to}>{primaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant={primaryAction.variant ?? 'ghost'} onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              secondaryAction.to ? (
                <Button variant={secondaryAction.variant ?? 'outline'} asChild>
                  <Link to={secondaryAction.to}>{secondaryAction.label}</Link>
                </Button>
              ) : (
                <Button variant={secondaryAction.variant ?? 'outline'} onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
