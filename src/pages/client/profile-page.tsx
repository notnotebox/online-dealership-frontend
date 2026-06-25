import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CompletionField, completionInputClassName } from '@/components/shared/completion-field'
import { ProfileDocumentsPanel } from '@/components/shared/profile-documents-panel'
import { TestHelperCard } from '@/components/shared/test-helper-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { documentApi } from '@/lib/api/document-api'
import { authApi, type UpdateProfileRequest } from '@/lib/api/auth-api'
import { useAuth } from '@/lib/auth/auth-context'
import type { DocumentRecord, DocumentType } from '@/lib/documents/document-types'
import { getMissingProfileFields, getMissingProfileFieldKeys, getProfileCompletionPercent } from '@/lib/profile/profile-completeness'
import { downloadTextFile } from '@/lib/test-fixtures/download-text-file'
import { buildProfileFixtureText, createProfileFixture } from '@/lib/test-fixtures/profile-application-fixture'

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

function toProfileDraft(form: ProfileFormState) {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    dateOfBirth: form.dateOfBirth,
    phoneNumber: form.phoneNumber,
    addressLine1: form.addressLine1,
    postalCode: form.postalCode,
    city: form.city,
    country: form.country,
    nationality: form.nationality,
    familyStatus: form.familyStatus,
    householdSize: form.householdSize.trim() ? Number(form.householdSize) : undefined,
    professionalStatus: form.professionalStatus,
    monthlyIncome: form.monthlyIncome.trim() ? Number(form.monthlyIncome) : undefined,
    monthlyCharges: form.monthlyCharges.trim() ? Number(form.monthlyCharges) : undefined,
    iban: form.iban,
  }
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
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)

  useEffect(() => {
    setForm(buildProfileForm(profile))
  }, [profile])

  useEffect(() => {
    let cancelled = false

    async function loadDocuments() {
      try {
        setIsLoadingDocuments(true)
        const response = await documentApi.listMine()
        if (!cancelled) {
          setDocuments(response)
          setDocumentError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setDocumentError(cause instanceof Error ? cause.message : 'Impossible de charger les documents')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDocuments(false)
        }
      }
    }

    void loadDocuments()

    return () => {
      cancelled = true
    }
  }, [])

  const profileDraft = useMemo(() => toProfileDraft(form), [form])
  const completionPercent = getProfileCompletionPercent(profileDraft)
  const isProfileComplete = completionPercent >= 100
  const missingFields = getMissingProfileFields(profileDraft)
  const missingFieldKeys = new Set(getMissingProfileFieldKeys(profileDraft))

  const profileSummary = useMemo(
    () => [
      { label: 'Prenom', value: form.firstName || 'Non renseigne' },
      { label: 'Nom', value: form.lastName || 'Non renseigne' },
      { label: 'Email', value: profile?.email ?? session?.user.email ?? 'Non renseigne' },
      { label: 'Role', value: profile?.role ?? session?.user.role ?? 'CLIENT' },
      { label: 'Date de naissance', value: form.dateOfBirth ? formatDate(form.dateOfBirth) : 'Non renseigne' },
      { label: 'Compte cree le', value: formatDate(profile?.createdAt) },
      { label: 'Telephone', value: form.phoneNumber || 'Non renseigne' },
      {
        label: 'Adresse',
        value: [form.addressLine1, form.postalCode, form.city].filter(Boolean).join(', ') || 'Non renseigne',
      },
      { label: 'Completude du profil', value: `${completionPercent}%` },
    ],
    [completionPercent, form.addressLine1, form.city, form.dateOfBirth, form.firstName, form.lastName, form.phoneNumber, form.postalCode, profile?.createdAt, profile?.email, profile?.role, session?.user.email, session?.user.role],
  )

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function fillProfileAutomatically() {
    const fixture = createProfileFixture()
    setForm((current) => ({
      ...current,
      ...fixture,
    }))
    setMessage(null)
    setError(null)
    downloadTextFile(
      `profil-test-${fixture.firstName.toLowerCase()}-${fixture.lastName.toLowerCase()}.txt`,
      buildProfileFixtureText(fixture),
    )
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
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUploadDocument(payload: { file: File; documentType: DocumentType }) {
    try {
      setIsUploading(true)
      const uploaded = await documentApi.upload(payload)
      setDocuments((current) => [uploaded, ...current.filter((document) => document.documentType !== uploaded.documentType)])
      setDocumentError(null)
    } catch (cause) {
      setDocumentError(cause instanceof Error ? cause.message : "Impossible d'envoyer le document")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <p className="text-muted-foreground">Les informations saisies ici servent de base pour toutes vos demandes.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Completude du profil</p>
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

            {missingFields.length > 0 ? (
              <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Champs encore attendus</p>
                <p>{missingFields.slice(0, 5).join(', ')}{missingFields.length > 5 ? '...' : ''}</p>
              </div>
            ) : null}
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

      <TestHelperCard
        title="Outil de test profil"
        description="Remplit les informations de profil avec des donnees coherentes et telecharge un fichier texte de demonstration."
        buttonLabel="Completer automatiquement"
        onClick={fillProfileAutomatically}
      />

      <Card id="profile-form">
        <CardContent className="space-y-5 p-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Completer le profil</h2>
            <p className="text-sm text-muted-foreground">Les indicateurs disparaissent des qu un champ contient une valeur exploitable.</p>
          </div>

          {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {message ? <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <div className="grid gap-3 md:grid-cols-2">
            <CompletionField label="Prenom" missing={missingFieldKeys.has('firstName')}>
              <input className={completionInputClassName(missingFieldKeys.has('firstName'))} value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
            </CompletionField>
            <CompletionField label="Nom" missing={missingFieldKeys.has('lastName')}>
              <input className={completionInputClassName(missingFieldKeys.has('lastName'))} value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
            </CompletionField>
            <CompletionField label="Date de naissance" missing={missingFieldKeys.has('dateOfBirth')}>
              <input className={completionInputClassName(missingFieldKeys.has('dateOfBirth'))} type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} />
            </CompletionField>
            <CompletionField label="Telephone" missing={missingFieldKeys.has('phoneNumber')}>
              <input className={completionInputClassName(missingFieldKeys.has('phoneNumber'))} value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
            </CompletionField>
            <CompletionField label="Adresse" missing={missingFieldKeys.has('addressLine1')} className="md:col-span-2">
              <input className={completionInputClassName(missingFieldKeys.has('addressLine1'))} value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} />
            </CompletionField>
            <CompletionField label="Complement d'adresse" missing={false}>
              <input className={completionInputClassName(false)} value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} />
            </CompletionField>
            <CompletionField label="Code postal" missing={missingFieldKeys.has('postalCode')}>
              <input className={completionInputClassName(missingFieldKeys.has('postalCode'))} value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} />
            </CompletionField>
            <CompletionField label="Ville" missing={missingFieldKeys.has('city')}>
              <input className={completionInputClassName(missingFieldKeys.has('city'))} value={form.city} onChange={(event) => updateField('city', event.target.value)} />
            </CompletionField>
            <CompletionField label="Pays" missing={missingFieldKeys.has('country')}>
              <input className={completionInputClassName(missingFieldKeys.has('country'))} value={form.country} onChange={(event) => updateField('country', event.target.value)} />
            </CompletionField>
            <CompletionField label="Nationalite" missing={missingFieldKeys.has('nationality')}>
              <input className={completionInputClassName(missingFieldKeys.has('nationality'))} value={form.nationality} onChange={(event) => updateField('nationality', event.target.value)} />
            </CompletionField>
            <CompletionField label="Situation familiale" missing={missingFieldKeys.has('familyStatus')}>
              <input className={completionInputClassName(missingFieldKeys.has('familyStatus'))} value={form.familyStatus} onChange={(event) => updateField('familyStatus', event.target.value)} />
            </CompletionField>
            <CompletionField label="Nombre de personnes au foyer" missing={missingFieldKeys.has('householdSize')}>
              <input className={completionInputClassName(missingFieldKeys.has('householdSize'))} type="number" min="0" value={form.householdSize} onChange={(event) => updateField('householdSize', event.target.value)} />
            </CompletionField>
            <CompletionField label="Situation professionnelle" missing={missingFieldKeys.has('professionalStatus')}>
              <input className={completionInputClassName(missingFieldKeys.has('professionalStatus'))} value={form.professionalStatus} onChange={(event) => updateField('professionalStatus', event.target.value)} />
            </CompletionField>
            <CompletionField label="Revenus mensuels nets" missing={missingFieldKeys.has('monthlyIncome')}>
              <input className={completionInputClassName(missingFieldKeys.has('monthlyIncome'))} type="number" min="0" value={form.monthlyIncome} onChange={(event) => updateField('monthlyIncome', event.target.value)} />
            </CompletionField>
            <CompletionField label="Charges mensuelles" missing={missingFieldKeys.has('monthlyCharges')}>
              <input className={completionInputClassName(missingFieldKeys.has('monthlyCharges'))} type="number" min="0" value={form.monthlyCharges} onChange={(event) => updateField('monthlyCharges', event.target.value)} />
            </CompletionField>
            <CompletionField label="IBAN" missing={missingFieldKeys.has('iban')} className="md:col-span-2">
              <input className={completionInputClassName(missingFieldKeys.has('iban'))} value={form.iban} onChange={(event) => updateField('iban', event.target.value)} />
            </CompletionField>
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

      {documentError ? <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{documentError}</p> : null}
      {isLoadingDocuments ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des documents...</div>
      ) : (
        <ProfileDocumentsPanel
          documents={documents}
          isUploading={isUploading}
          onUpload={handleUploadDocument}
          title="Pieces du profil"
          description="Déposez ou remplacez ici vos PDF communs à toutes les demandes."
        />
      )}
    </div>
  )
}


