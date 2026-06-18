import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, type UpdateProfileRequest } from '@/lib/api/auth-api'
import { useAuth } from '@/lib/auth/auth-context'
import { getMissingProfileFields, getProfileCompletionPercent } from '@/lib/profile/profile-completeness'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ProfileFormState = {
  firstName: string
  lastName: string
  dateOfBirth: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  nationality: string
  familyStatus: string
  householdSize: string
  professionalStatus: string
  monthlyIncome: string
  monthlyCharges: string
  iban: string
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigne'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

function buildProfileForm(profile: ReturnType<typeof useAuth>['profile']): ProfileFormState {
  return {
    firstName: profile?.firstName ?? '',
    lastName: profile?.lastName ?? '',
    dateOfBirth: profile?.dateOfBirth ?? '',
    phoneNumber: profile?.phoneNumber ?? '',
    addressLine1: profile?.addressLine1 ?? '',
    addressLine2: profile?.addressLine2 ?? '',
    postalCode: profile?.postalCode ?? '',
    city: profile?.city ?? '',
    country: profile?.country ?? '',
    nationality: profile?.nationality ?? '',
    familyStatus: profile?.familyStatus ?? '',
    householdSize: profile?.householdSize != null ? String(profile.householdSize) : '',
    professionalStatus: profile?.professionalStatus ?? '',
    monthlyIncome: profile?.monthlyIncome != null ? String(profile.monthlyIncome) : '',
    monthlyCharges: profile?.monthlyCharges != null ? String(profile.monthlyCharges) : '',
    iban: profile?.iban ?? '',
  }
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function toUpdatePayload(form: ProfileFormState): UpdateProfileRequest {
  return {
    firstName: form.firstName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    dateOfBirth: form.dateOfBirth || undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
    addressLine1: form.addressLine1.trim() || undefined,
    addressLine2: form.addressLine2.trim() || undefined,
    postalCode: form.postalCode.trim() || undefined,
    city: form.city.trim() || undefined,
    country: form.country.trim() || undefined,
    nationality: form.nationality.trim() || undefined,
    familyStatus: form.familyStatus.trim() || undefined,
    householdSize: form.householdSize.trim() ? Number(form.householdSize) : undefined,
    professionalStatus: form.professionalStatus.trim() || undefined,
    monthlyIncome: form.monthlyIncome.trim() ? Number(form.monthlyIncome) : undefined,
    monthlyCharges: form.monthlyCharges.trim() ? Number(form.monthlyCharges) : undefined,
    iban: form.iban.trim() || undefined,
  }
}

export function ClientProfilePage() {
  const { profile, session, logout, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<ProfileFormState>(() => buildProfileForm(profile))
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(buildProfileForm(profile))
  }, [profile])

  const completionPercent = profile?.profileCompletionPercent ?? getProfileCompletionPercent(profile)
  const isProfileComplete = completionPercent >= 100
  const missingFields = getMissingProfileFields(profile)

  const profileSummary = useMemo(
    () => [
      { label: 'Prenom', value: profile?.firstName ?? 'Non renseigne' },
      { label: 'Nom', value: profile?.lastName ?? 'Non renseigne' },
      { label: 'Email', value: profile?.email ?? session?.user.email ?? 'Non renseigne' },
      { label: 'Role', value: profile?.role ?? 'CLIENT' },
      { label: 'Date de naissance', value: formatDate(profile?.dateOfBirth) },
      { label: 'Compte cree le', value: formatDate(profile?.createdAt) },
      { label: 'Telephone', value: profile?.phoneNumber ?? 'Non renseigne' },
      {
        label: 'Adresse',
        value: [profile?.addressLine1, profile?.postalCode, profile?.city].filter(Boolean).join(', ') || 'Non renseigne',
      },
      { label: 'Completion profil', value: `${completionPercent}%` },
    ],
    [completionPercent, profile, session?.user.email],
  )

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    setError(null)
    setMessage(null)
    setIsSaving(true)

    try {
      await authApi.updateProfile(toUpdatePayload(form))
      await refreshProfile()
      setMessage('Profil mis a jour.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise a jour impossible')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-muted-foreground">Les informations saisies ici servent de base pour vos demandes.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Complétude du profil</p>
                <p className="text-sm text-muted-foreground">{completionPercent}%</p>
              </div>
              <ProgressBar value={completionPercent} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {profileSummary.map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {missingFields.length > 0 && (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">À compléter</p>
                <p>{missingFields.slice(0, 5).join(', ')}{missingFields.length > 5 ? '…' : ''}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-lg font-semibold">Actions</h2>
            <Button asChild className="w-full">
              <a href="#profile-form">{isProfileComplete ? 'Modifier le profil' : 'Completer le profil'}</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/files/new">Nouvelle demande</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/files">Voir mes demandes</Link>
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { logout(); navigate('/'); }}>
              Se deconnecter
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card id="profile-form">
        <CardContent className="space-y-5 p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Completer le profil</h2>
            <p className="text-sm text-muted-foreground">Vous pouvez mettre a jour ici les informations utilisees pour vos demandes.</p>
          </div>

          {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          {message && <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          {!isProfileComplete && (
            <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
              Votre profil peut encore être complété.
            </p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Prenom</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Nom</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Date de naissance</span>
              <input className="h-10 w-full rounded-md border px-3" type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Telephone</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">Adresse</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Complement d'adresse</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Code postal</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Ville</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.city} onChange={(event) => updateField('city', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Pays</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.country} onChange={(event) => updateField('country', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Nationalite</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.nationality} onChange={(event) => updateField('nationality', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Situation familiale</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.familyStatus} onChange={(event) => updateField('familyStatus', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Nombre de personnes au foyer</span>
              <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.householdSize} onChange={(event) => updateField('householdSize', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Situation professionnelle</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.professionalStatus} onChange={(event) => updateField('professionalStatus', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Revenus mensuels nets</span>
              <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.monthlyIncome} onChange={(event) => updateField('monthlyIncome', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Charges mensuelles</span>
              <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.monthlyCharges} onChange={(event) => updateField('monthlyCharges', event.target.value)} />
            </label>
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">IBAN</span>
              <input className="h-10 w-full rounded-md border px-3" value={form.iban} onChange={(event) => updateField('iban', event.target.value)} />
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/app/files/new">Creer une nouvelle demande</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
