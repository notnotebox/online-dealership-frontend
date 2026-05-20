import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mockAuth } from '@/lib/constants/mock-auth'

export function ContactPage() {
  const canSend = mockAuth.loggedIn

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="text-muted-foreground">
          Une question sur un vehicule ou sur votre dossier ? Notre equipe vous repond rapidement.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Telephone</p>
            <p className="font-medium">+33 1 80 00 00 00</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">contact@m-motors.fr</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Horaires</p>
            <p className="font-medium">Lun - Ven, 9h - 18h</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Envoyer un message</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="h-10 rounded border px-3" placeholder="Prenom" />
            <input className="h-10 rounded border px-3" placeholder="Nom" />
            <input className="h-10 rounded border px-3" placeholder="Email" type="email" defaultValue={canSend ? mockAuth.user.email : ''} disabled={!canSend} />
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
