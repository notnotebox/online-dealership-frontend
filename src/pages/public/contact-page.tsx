import { Link } from 'react-router-dom'
import { ContactSupportPanel } from '@/components/shared/contact-support-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'

export function ContactPage() {
  const { isAuthenticated, profile, session } = useAuth()
  const canSend = isAuthenticated
  const defaultEmail = profile?.email ?? session?.user.email ?? ''

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="text-muted-foreground">
          Une question sur un vehicule ou sur votre dossier ? Notre equipe vous repond rapidement.
        </p>
      </div>

      <ContactSupportPanel />

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Envoyer un message</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="h-10 rounded border px-3" placeholder="Prenom" />
            <input className="h-10 rounded border px-3" placeholder="Nom" />
            <input className="h-10 rounded border px-3" placeholder="Email" type="email" defaultValue={defaultEmail} disabled={!canSend} />
            <input className="h-10 rounded border px-3" placeholder="Telephone" type="tel" />
            <input className="h-10 rounded border px-3 md:col-span-2" placeholder="Sujet" />
          </div>
          <textarea className="min-h-32 w-full rounded border px-3 py-2" placeholder="Votre message" />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!canSend && (
              <Button type="button" variant="outline" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
            )}
            <Button type="button" disabled={!canSend}>Envoyer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
