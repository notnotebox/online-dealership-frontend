import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'

type LoginLocationState = {
  from?: string
}

function getPostLoginTarget(role?: string, from?: string) {
  if (from && from !== '/login' && from !== '/register') {
    const isStaffPath = from.startsWith('/backoffice')
    const isClientPath = from.startsWith('/app')

    if ((role === 'MANAGER' || role === 'ADMIN') && isStaffPath) {
      return from
    }

    if (role === 'CLIENT' && isClientPath) {
      return from
    }
  }

  if (role === 'MANAGER' || role === 'ADMIN') {
    return '/backoffice/dashboard'
  }

  return '/app/dashboard'
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const session = await login({ email, password })
      const state = location.state as LoginLocationState | null
      navigate(getPostLoginTarget(session.user.role, state?.from), { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Identifiants invalides')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="text-sm text-muted-foreground">Accedez a votre espace client ou a votre back-office selon votre role.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium" htmlFor="login-email">Email</label>
          <input
            id="login-email"
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
          <label className="text-sm font-medium" htmlFor="login-password">Mot de passe</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="h-10 w-full rounded-md border px-3 pr-20"
              placeholder="Mot de passe"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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

        {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <div className="space-y-2 text-sm">
        <Link className="block text-muted-foreground underline" to="/forgot-password">Mot de passe oublie</Link>
        <p>Pas de compte ? <Link to="/register" className="underline">Inscription</Link></p>
      </div>
    </div>
  )
}
