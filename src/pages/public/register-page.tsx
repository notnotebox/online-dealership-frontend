import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

const FIRST_NAMES = ['Alex', 'Camille', 'Jordan', 'Lina', 'Noah', 'Sofia', 'Malo', 'Ines']
const LAST_NAMES = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Durand', 'Dubois', 'Moreau']

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomEmail(firstName: string, lastName: string) {
  const suffix = Math.floor(100 + Math.random() * 900)
  const clean = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '')
  return `${clean}${suffix}@example.com`
}

function randomBirthDate() {
  const now = new Date()
  const age = 21 + Math.floor(Math.random() * 18)
  const year = now.getFullYear() - age
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function randomPassword() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `Test${randomItem(FIRST_NAMES)}!${digits}`
}

function buildFixtureText(data: {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  password: string
}) {
  return [
    `firstName=${data.firstName}`,
    `lastName=${data.lastName}`,
    `email=${data.email}`,
    `dateOfBirth=${data.dateOfBirth}`,
    `password=${data.password}`,
    `confirmPassword=${data.password}`,
    `acceptedTerms=true`,
  ].join('\n')
}

function downloadFixture(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function generateTestData() {
    const nextFirstName = randomItem(FIRST_NAMES)
    const nextLastName = randomItem(LAST_NAMES)
    const nextEmail = randomEmail(nextFirstName, nextLastName)
    const nextDateOfBirth = randomBirthDate()
    const nextPassword = randomPassword()

    setFirstName(nextFirstName)
    setLastName(nextLastName)
    setEmail(nextEmail)
    setDateOfBirth(nextDateOfBirth)
    setPassword(nextPassword)
    setConfirmPassword(nextPassword)
    setAcceptedTerms(true)
    setShowPassword(false)
    setShowConfirmPassword(false)

    downloadFixture(
      `register-fixture-${nextFirstName.toLowerCase()}-${nextLastName.toLowerCase()}.txt`,
      buildFixtureText({
        firstName: nextFirstName,
        lastName: nextLastName,
        email: nextEmail,
        dateOfBirth: nextDateOfBirth,
        password: nextPassword,
      }),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (!acceptedTerms) {
      setError('Vous devez accepter la politique de confidentialite.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        firstName,
        lastName,
        email,
        dateOfBirth,
        password,
      })
      navigate('/app/dashboard', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Inscription impossible')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Inscription</h1>
        <p className="text-sm text-muted-foreground">Création de compte client avec contrôle des données à l'envoi.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="register-first-name">Prenom</label>
            <input
              id="register-first-name"
              className="h-10 w-full rounded-md border px-3"
              placeholder="Prenom"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="register-last-name">Nom</label>
            <input
              id="register-last-name"
              className="h-10 w-full rounded-md border px-3"
              placeholder="Nom"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="register-email">Email</label>
          <input
            id="register-email"
            className="h-10 w-full rounded-md border px-3"
            placeholder="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="register-dob">Date de naissance</label>
          <input
            id="register-dob"
            className="h-10 w-full rounded-md border px-3"
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="register-password">Mot de passe</label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="h-10 w-full rounded-md border px-3 pr-20"
              placeholder="Mot de passe"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="register-confirm-password">Confirmation</label>
          <div className="relative">
            <input
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              className="h-10 w-full rounded-md border px-3 pr-20"
              placeholder="Confirmation"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
          J'accepte la politique de confidentialite
        </label>

        {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creation...' : 'Creer un compte'}
        </Button>
      </form>

      <Button type="button" variant="outline" className="w-full" onClick={generateTestData}>
        Generer des donnees de test
      </Button>

      <p className="text-sm">Deja inscrit ? <Link to="/login" className="underline">Connexion</Link></p>
    </div>
  )
}
