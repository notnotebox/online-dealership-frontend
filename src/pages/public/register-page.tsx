import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border p-6">
      <h1 className="text-2xl font-semibold">Inscription</h1>
      <div className="grid grid-cols-2 gap-3">
        <input className="h-10 rounded-md border px-3" placeholder="Prenom" />
        <input className="h-10 rounded-md border px-3" placeholder="Nom" />
      </div>
      <input className="h-10 w-full rounded-md border px-3" placeholder="Email" />
      <input className="h-10 w-full rounded-md border px-3" placeholder="Telephone" />
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
      <div className="relative">
        <input type={showConfirmPassword ? 'text' : 'password'} className="h-10 w-full rounded-md border px-3 pr-20" placeholder="Confirmation" />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
        >
          {showConfirmPassword ? 'Masquer' : 'Afficher'}
        </button>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> J'accepte la politique de confidentialite</label>
      <Button className="w-full">Creer un compte</Button>
      <p className="text-sm">Deja inscrit ? <Link to="/login" className="underline">Connexion</Link></p>
    </div>
  )
}
