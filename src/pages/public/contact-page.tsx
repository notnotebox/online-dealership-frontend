import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ContactSupportPanel } from '@/components/shared/contact-support-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'

type ContactFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

function buildContactForm(profile: ReturnType<typeof useAuth>['profile'], sessionEmail: string): ContactFormState {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    email: profile?.email ?? sessionEmail,
    phone: profile?.phoneNumber ?? '',
    subject: '',
    message: '',
  }
}

export function ContactPage() {
  const { isAuthenticated, profile, session } = useAuth()
  const [form, setForm] = useState<ContactFormState>(() => buildContactForm(profile, session?.user.email ?? ''))

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    setForm(buildContactForm(profile, session?.user.email ?? ''))
  }, [isAuthenticated, profile, session?.user.email])

  const readOnly = useMemo(() => isAuthenticated, [isAuthenticated])

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
            <input className="h-10 rounded border px-3" placeholder="Prenom" value={form.firstName} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} />
            <input className="h-10 rounded border px-3" placeholder="Nom" value={form.lastName} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} />
            <input className="h-10 rounded border px-3" placeholder="Email" type="email" value={form.email} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <input className="h-10 rounded border px-3" placeholder="Telephone" type="tel" value={form.phone} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <input className="h-10 rounded border px-3 md:col-span-2" placeholder="Sujet" value={form.subject} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} />
          </div>
          <textarea className="min-h-32 w-full rounded border px-3 py-2" placeholder="Votre message" value={form.message} readOnly={readOnly} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isAuthenticated && (
              <Button type="button" variant="outline" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
            )}
            <Button type="button">Envoyer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
