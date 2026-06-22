import { Link } from 'react-router-dom'

export function FooterBar() {
  return (
    <footer className="h-12 border-t">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 text-[11px] leading-tight text-muted-foreground">
        <Link to="/legal" className="hover:text-foreground">Mentions legales</Link>
        <Link to="/privacy" className="hover:text-foreground">Confidentialite</Link>
      </div>
    </footer>
  )
}
