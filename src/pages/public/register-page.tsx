import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/auth-context'
import { downloadTextFile } from '@/lib/test-fixtures/download-text-file'
import { buildRegisterFixtureText, createRegisterFixture } from '@/lib/test-fixtures/register-fixture'

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
    const fixture = createRegisterFixture()

    setFirstName(fixture.firstName)
    setLastName(fixture.lastName)
    setEmail(fixture.email)
    setDateOfBirth(fixture.dateOfBirth)
    setPassword(fixture.password)
    setConfirmPassword(fixture.password)
    setAcceptedTerms(true)
    setShowPassword(false)
    setShowConfirmPassword(false)

    downloadTextFile(
      `register-fixture-${fixture.firstName.toLowerCase()}-${fixture.lastName.toLowerCase()}.txt`,
      buildRegisterFixtureText(fixture),
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
      setError('Vous devez accepter la politique de confidentialité.')
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
      navigate('/vehicles', { replace: true })
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
            <label className="text-sm font-medium" htmlFor="register-first-name">Prénom</label>
            <input
              id="register-first-name"
              className="h-10 w-full rounded-md border px-3"
              placeholder="Prénom"
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
          J'accepte la politique de confidentialité
        </label>

        {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Création...' : 'Créer un compte'}
        </Button>
      </form>

      <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50/60 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Outil de test formateurs</p>
          <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
            Remplit le formulaire avec des données de démonstration et télécharge un fichier texte.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full border-amber-500/50 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-500/20"
          onClick={generateTestData}
        >
          Générer un profil de test
        </Button>
      </div>

      <p className="text-sm">Déjà inscrit ? <Link to="/login" className="underline">Connexion</Link></p>
    </div>
  )
}
