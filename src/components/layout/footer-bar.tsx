import { Link } from 'react-router-dom'

export function FooterBar() {
  return (
    <footer className="h-12 border-t">
      <div className="mx-auto grid h-full max-w-7xl items-center gap-1 px-4 text-[11px] leading-tight text-muted-foreground md:grid-cols-4">
        <Link to="/legal" className="hover:text-foreground">Mentions legales</Link>
        <Link to="/contact" className="hover:text-foreground">Contact</Link>
        <span>Aide</span>
        <Link to="/privacy" className="hover:text-foreground">Confidentialite</Link>
      </div>
    </footer>
  )
}
