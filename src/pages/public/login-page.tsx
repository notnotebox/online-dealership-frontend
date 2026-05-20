import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-6">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      <input className="h-10 w-full rounded-md border px-3" placeholder="Email" />
      <div className="relative">
        <input type={showPassword ? 'text' : 'password'} className="h-10 w-full rounded-md border px-3 pr-20" placeholder="Mot de passe" />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          {showPassword ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      <Button className="w-full">Se connecter</Button>
      <Link className="block text-sm text-muted-foreground" to="/forgot-password">Mot de passe oublie</Link>
      <p className="text-sm">Pas de compte ? <Link to="/register" className="underline">Inscription</Link></p>
    </div>
  )
}
