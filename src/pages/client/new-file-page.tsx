import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CompletionField, completionInputClassName, completionTextareaClassName } from '@/components/shared/completion-field'
import { ProfileDocumentsPanel } from '@/components/shared/profile-documents-panel'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { authApi } from '@/lib/api/auth-api'
import { documentApi } from '@/lib/api/document-api'
import { useAuth } from '@/lib/auth/auth-context'
import type { ApplicationAcquisitionType } from '@/lib/application/application-types'
import type { DocumentRecord, DocumentType } from '@/lib/documents/document-types'
import { formatDocumentTypeLabel, getRequiredDocuments } from '@/lib/documents/document-types'
import { getMissingProfileFieldKeys, getProfileCompletionPercent } from '@/lib/profile/profile-completeness'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'

const PROFESSIONAL_STATUSES = ['CDI', 'CDD', 'Indépendant', 'Fonctionnaire', 'Retraité', 'Étudiant']
const FAMILY_STATUSES = ['Célibataire', 'Marié', 'Pacsé', 'En union', 'Divorcé']
const ACQUISITIONS: Array<{ value: ApplicationAcquisitionType; label: string }> = [
  { value: 'CASH', label: 'Achat comptant' },
  { value: 'CREDIT', label: 'Crédit auto' },
  { value: 'LOA', label: 'LOA' },
  { value: 'LLD', label: 'LLD' },
]

type ApplicationFormState = {
  vehicleId: string
  acquisitionType: ApplicationAcquisitionType
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
  durationMonths: string
  annualMileage: string
  contributionAmount: string
  expectedStartDate: string
  tradeInDescription: string
  insuranceIncluded: boolean
  warrantyIncluded: boolean
  assistanceIncluded: boolean
  maintenanceIncluded: boolean
  comment: string
}

const initialState: ApplicationFormState = {
  vehicleId: '',
  acquisitionType: 'LOA',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  postalCode: '',
  city: '',
  country: 'France',
  nationality: 'Française',
  familyStatus: '',
  householdSize: '',
  professionalStatus: '',
  monthlyIncome: '',
  monthlyCharges: '',
  iban: '',
  durationMonths: '48',
  annualMileage: '15000',
  contributionAmount: '3000',
  expectedStartDate: '',
  tradeInDescription: '',
  insuranceIncluded: false,
  warrantyIncluded: false,
  assistanceIncluded: false,
  maintenanceIncluded: false,
  comment: '',
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function buildFormFromProfile(profile: ReturnType<typeof useAuth>['profile']): ApplicationFormState {
  if (!profile) {
    return initialState
  }

  return {
    ...initialState,
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    dateOfBirth: profile.dateOfBirth ?? '',
    phoneNumber: profile.phoneNumber ?? '',
    addressLine1: profile.addressLine1 ?? '',
    addressLine2: profile.addressLine2 ?? '',
    postalCode: profile.postalCode ?? '',
    city: profile.city ?? '',
    country: profile.country ?? 'France',
    nationality: profile.nationality ?? 'Française',
    familyStatus: profile.familyStatus ?? '',
    householdSize: profile.householdSize != null ? String(profile.householdSize) : '',
    professionalStatus: profile.professionalStatus ?? '',
    monthlyIncome: profile.monthlyIncome != null ? String(profile.monthlyIncome) : '',
    monthlyCharges: profile.monthlyCharges != null ? String(profile.monthlyCharges) : '',
    iban: profile.iban ?? '',
  }
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const next = Number(trimmed)
  return Number.isFinite(next) ? next : undefined
}

function formatPrice(price: string) {
  const value = Number(price)
  if (Number.isNaN(value)) {
    return price
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function NewFilePage() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const { profile, refreshProfile } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [form, setForm] = useState<ApplicationFormState>(initialState)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentError, setDocumentError] = useState<string | null>(null)
  const profileHydratedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadInitialData() {
      try {
        setIsLoadingVehicles(true)
        setIsLoadingDocuments(true)

        const [vehicleResponse, documentResponse] = await Promise.all([
          vehicleApi.listPublicVehicles(),
          documentApi.listMine(),
        ])

        if (!cancelled) {
          setVehicles(vehicleResponse)
          setDocuments(documentResponse)
          setError(null)
          setDocumentError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          const message = cause instanceof Error ? cause.message : 'Impossible de charger les données'
          setError(message)
          setDocumentError(message)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVehicles(false)
          setIsLoadingDocuments(false)
        }
      }
    }

    void loadInitialData()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profile || profileHydratedRef.current) {
      return
    }

    setForm((current) => ({
      ...current,
      ...buildFormFromProfile(profile),
    }))
    profileHydratedRef.current = true
  }, [profile])

  useEffect(() => {
    if (!vehicleId) {
      return
    }

    setForm((current) => (current.vehicleId === vehicleId ? current : { ...current, vehicleId }))
  }, [vehicleId])

  const selectedVehicle = useMemo(() => {
    return vehicles.find((vehicle) => vehicle.id === form.vehicleId)
      ?? vehicles.find((vehicle) => vehicle.id === vehicleId)
      ?? vehicles[0]
      ?? null
  }, [form.vehicleId, vehicleId, vehicles])

  useEffect(() => {
    if (!form.vehicleId && selectedVehicle) {
      setForm((current) => ({ ...current, vehicleId: selectedVehicle.id }))
    }
  }, [form.vehicleId, selectedVehicle])

  const profileDraft = useMemo(() => ({
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
    householdSize: form.householdSize ? Number(form.householdSize) : undefined,
    professionalStatus: form.professionalStatus,
    monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
    monthlyCharges: form.monthlyCharges ? Number(form.monthlyCharges) : undefined,
    iban: form.iban,
  }), [form])

  const profileCompletionPercent = useMemo(() => getProfileCompletionPercent(profileDraft), [profileDraft])
  const missingProfileFieldKeys = useMemo(() => new Set(getMissingProfileFieldKeys(profileDraft)), [profileDraft])
  const requiredDocuments = useMemo(() => getRequiredDocuments(form.acquisitionType), [form.acquisitionType])
  const showLeaseFields = form.acquisitionType === 'LOA' || form.acquisitionType === 'LLD'

  function updateField(field: keyof ApplicationFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleUploadDocument(payload: { file: File; documentType: DocumentType }) {
    try {
      setIsUploadingDocument(true)
      const uploaded = await documentApi.upload(payload)
      setDocuments((current) => [uploaded, ...current.filter((document) => document.documentType !== uploaded.documentType)])
      setDocumentError(null)
    } catch (cause) {
      setDocumentError(cause instanceof Error ? cause.message : 'Impossible de déposer le document')
    } finally {
      setIsUploadingDocument(false)
    }
  }

  async function handleSaveDraft() {
    setError(null)
    setIsSavingDraft(true)

    try {
      await authApi.updateProfile({
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
        householdSize: toOptionalNumber(form.householdSize),
        professionalStatus: form.professionalStatus.trim() || undefined,
        monthlyIncome: toOptionalNumber(form.monthlyIncome),
        monthlyCharges: toOptionalNumber(form.monthlyCharges),
        iban: form.iban.trim() || undefined,
      })

      await refreshProfile()

      const response = await applicationApi.create({
        vehicleId: form.vehicleId,
        acquisitionType: form.acquisitionType,
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
        householdSize: toOptionalNumber(form.householdSize),
        professionalStatus: form.professionalStatus.trim() || undefined,
        monthlyIncome: toOptionalNumber(form.monthlyIncome),
        monthlyCharges: toOptionalNumber(form.monthlyCharges),
        iban: form.iban.trim() || undefined,
        durationMonths: showLeaseFields ? toOptionalNumber(form.durationMonths) : undefined,
        annualMileage: showLeaseFields ? toOptionalNumber(form.annualMileage) : undefined,
        contributionAmount: toOptionalNumber(form.contributionAmount),
        expectedStartDate: showLeaseFields ? form.expectedStartDate || undefined : undefined,
        tradeInDescription: form.tradeInDescription.trim() || undefined,
        insuranceIncluded: form.insuranceIncluded,
        warrantyIncluded: form.warrantyIncluded,
        assistanceIncluded: form.assistanceIncluded,
        maintenanceIncluded: form.maintenanceIncluded,
        comment: form.comment.trim() || undefined,
      })

      navigate(`/app/files/${response.id}`, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible')
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-2xl border bg-gradient-to-br from-background to-muted/20 p-6 shadow-sm lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nouveau dossier</p>
          <h1 className="text-3xl font-semibold">Préparer la demande véhicule</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Le profil et les pièces communes sont réutilisés. Cette page enregistre un brouillon.
            La soumission se fait ensuite depuis le suivi du dossier.
          </p>
        </div>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase text-muted-foreground">Complétude du profil</p>
              <p className="text-xl font-semibold">{profileCompletionPercent}%</p>
            </div>
            <ProgressBar value={profileCompletionPercent} />
            <p className="text-xs text-muted-foreground">
              La soumission sera disponible une fois le profil et les pièces complétés.
            </p>
          </CardContent>
        </Card>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      ) : null}

      <Card>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Véhicule sélectionné</p>
                <h2 className="text-2xl font-semibold">
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.title}` : 'Aucun véhicule sélectionné'}
                </h2>
                {selectedVehicle ? (
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedVehicle.price)} · {selectedVehicle.mileage.toLocaleString('fr-FR')} km · {selectedVehicle.energy}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Choisissez un véhicule pour poursuivre.</p>
                )}
              </div>

              <Button type="button" variant="outline" asChild>
                <Link to="/vehicles">Changer le véhicule</Link>
              </Button>
            </div>

            {selectedVehicle ? (
              <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                <p>{selectedVehicle.seatCount} places</p>
                <p>{selectedVehicle.doorCount} portes</p>
                <p>{selectedVehicle.color}</p>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border bg-muted/20">
            {selectedVehicle ? (
              <VehicleImage
                brand={selectedVehicle.brand}
                model={selectedVehicle.title}
                seed={selectedVehicle.id}
                src={selectedVehicle.imageUrl ?? undefined}
                alt={`${selectedVehicle.brand} ${selectedVehicle.title}`}
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                Aucun visuel disponible
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">1. Profil client</h2>
              <p className="text-sm text-muted-foreground">Ces informations sont enregistrées dans le compte et réutilisées pour les prochaines demandes.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CompletionField label="Prénom" missing={missingProfileFieldKeys.has('firstName')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('firstName'))} value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
              </CompletionField>
              <CompletionField label="Nom" missing={missingProfileFieldKeys.has('lastName')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('lastName'))} value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
              </CompletionField>
              <CompletionField label="Date de naissance" missing={missingProfileFieldKeys.has('dateOfBirth')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('dateOfBirth'))} type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} />
              </CompletionField>
              <CompletionField label="Téléphone" missing={missingProfileFieldKeys.has('phoneNumber')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('phoneNumber'))} value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
              </CompletionField>
              <CompletionField label="Adresse" missing={missingProfileFieldKeys.has('addressLine1')} className="md:col-span-2">
                <input className={completionInputClassName(missingProfileFieldKeys.has('addressLine1'))} value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} />
              </CompletionField>
              <CompletionField label="Complément d’adresse" missing={false}>
                <input className={completionInputClassName(false)} value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} />
              </CompletionField>
              <CompletionField label="Code postal" missing={missingProfileFieldKeys.has('postalCode')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('postalCode'))} value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} />
              </CompletionField>
              <CompletionField label="Ville" missing={missingProfileFieldKeys.has('city')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('city'))} value={form.city} onChange={(event) => updateField('city', event.target.value)} />
              </CompletionField>
              <CompletionField label="Pays" missing={missingProfileFieldKeys.has('country')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('country'))} value={form.country} onChange={(event) => updateField('country', event.target.value)} />
              </CompletionField>
              <CompletionField label="Nationalité" missing={missingProfileFieldKeys.has('nationality')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('nationality'))} value={form.nationality} onChange={(event) => updateField('nationality', event.target.value)} />
              </CompletionField>
              <CompletionField label="Situation familiale" missing={missingProfileFieldKeys.has('familyStatus')}>
                <select className={completionInputClassName(missingProfileFieldKeys.has('familyStatus'))} value={form.familyStatus} onChange={(event) => updateField('familyStatus', event.target.value)}>
                  <option value="">Choisir</option>
                  {FAMILY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </CompletionField>
              <CompletionField label="Personnes au foyer" missing={missingProfileFieldKeys.has('householdSize')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('householdSize'))} type="number" min="0" value={form.householdSize} onChange={(event) => updateField('householdSize', event.target.value)} />
              </CompletionField>
              <CompletionField label="Situation professionnelle" missing={missingProfileFieldKeys.has('professionalStatus')}>
                <select className={completionInputClassName(missingProfileFieldKeys.has('professionalStatus'))} value={form.professionalStatus} onChange={(event) => updateField('professionalStatus', event.target.value)}>
                  <option value="">Choisir</option>
                  {PROFESSIONAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </CompletionField>
              <CompletionField label="Revenus mensuels nets" missing={missingProfileFieldKeys.has('monthlyIncome')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('monthlyIncome'))} type="number" min="0" value={form.monthlyIncome} onChange={(event) => updateField('monthlyIncome', event.target.value)} />
              </CompletionField>
              <CompletionField label="Charges mensuelles" missing={missingProfileFieldKeys.has('monthlyCharges')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('monthlyCharges'))} type="number" min="0" value={form.monthlyCharges} onChange={(event) => updateField('monthlyCharges', event.target.value)} />
              </CompletionField>
              <CompletionField label="IBAN" missing={missingProfileFieldKeys.has('iban')} className="md:col-span-2">
                <input className={completionInputClassName(missingProfileFieldKeys.has('iban'))} value={form.iban} onChange={(event) => updateField('iban', event.target.value)} />
              </CompletionField>
            </div>
          </CardContent>
        </Card>

        {documentError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{documentError}</p>
        ) : null}

        {isLoadingDocuments ? (
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des pièces du profil...</div>
        ) : (
          <ProfileDocumentsPanel
            documents={documents}
            isUploading={isUploadingDocument}
            onUpload={handleUploadDocument}
            title="2. Pièces du profil"
            description="Déposez ou remplacez ici les PDF utilisés sur toutes vos demandes."
          />
        )}

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">3. Pièces attendues</h2>
              <p className="text-sm text-muted-foreground">Cette liste dépend du mode choisi. Les pièces sont centralisées dans le profil client.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {requiredDocuments.map((document) => (
                <div key={document.documentType} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{formatDocumentTypeLabel(document.documentType)}</p>
                      {document.note ? <p className="text-xs text-muted-foreground">{document.note}</p> : null}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => navigate('/app/profile')}>
                      Modifier
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">4. Demande liée au véhicule</h2>
              <p className="text-sm text-muted-foreground">Ces informations sont spécifiques au véhicule et au mode d’acquisition choisi.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-muted-foreground">Véhicule</span>
                <select className="h-10 w-full rounded-md border px-3" value={form.vehicleId} onChange={(event) => updateField('vehicleId', event.target.value)}>
                  <option value="">Choisir un véhicule</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.title} - {formatPrice(vehicle.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-muted-foreground">Mode d’acquisition</span>
                <select className="h-10 w-full rounded-md border px-3" value={form.acquisitionType} onChange={(event) => updateField('acquisitionType', event.target.value as ApplicationAcquisitionType)}>
                  {ACQUISITIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-muted-foreground">Apport</span>
                <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.contributionAmount} onChange={(event) => updateField('contributionAmount', event.target.value)} />
              </label>

              {showLeaseFields ? (
                <>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-muted-foreground">Durée (mois)</span>
                    <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.durationMonths} onChange={(event) => updateField('durationMonths', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-muted-foreground">Kilométrage annuel</span>
                    <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.annualMileage} onChange={(event) => updateField('annualMileage', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="font-medium text-muted-foreground">Date de démarrage souhaitée</span>
                    <input className="h-10 w-full rounded-md border px-3" type="date" value={form.expectedStartDate} onChange={(event) => updateField('expectedStartDate', event.target.value)} />
                  </label>
                </>
              ) : null}

              <CompletionField label="Reprise ou précision de financement" missing={false} className="md:col-span-2">
                <textarea className={completionTextareaClassName(false)} value={form.tradeInDescription} onChange={(event) => updateField('tradeInDescription', event.target.value)} />
              </CompletionField>

              <CompletionField label="Commentaire" missing={false} className="md:col-span-2">
                <textarea className={completionTextareaClassName(false)} value={form.comment} onChange={(event) => updateField('comment', event.target.value)} />
              </CompletionField>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.insuranceIncluded} onChange={(event) => updateField('insuranceIncluded', event.target.checked)} />
                Assurance incluse
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.warrantyIncluded} onChange={(event) => updateField('warrantyIncluded', event.target.checked)} />
                Garantie mécanique
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.assistanceIncluded} onChange={(event) => updateField('assistanceIncluded', event.target.checked)} />
                Assistance
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.maintenanceIncluded} onChange={(event) => updateField('maintenanceIncluded', event.target.checked)} />
                Entretien
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">5. Confirmation</h2>
              <p className="text-sm text-muted-foreground">Cette action enregistre le brouillon. La soumission se fait ensuite depuis le suivi du dossier.</p>
            </div>

            {selectedVehicle ? (
              <div className="grid gap-4 rounded-xl border p-4 lg:grid-cols-[1fr_1.3fr]">
                <div className="overflow-hidden rounded-lg border bg-muted/20">
                  <VehicleImage
                    brand={selectedVehicle.brand}
                    model={selectedVehicle.title}
                    seed={selectedVehicle.id}
                    src={selectedVehicle.imageUrl ?? undefined}
                    alt={`${selectedVehicle.brand} ${selectedVehicle.title}`}
                    className="h-44 w-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-lg font-semibold">{selectedVehicle.brand} {selectedVehicle.title}</p>
                  <p className="text-muted-foreground">{formatPrice(selectedVehicle.price)} · {selectedVehicle.mileage.toLocaleString('fr-FR')} km · {selectedVehicle.energy}</p>
                  <p className="text-muted-foreground">{selectedVehicle.seatCount} places · {selectedVehicle.doorCount} portes · {selectedVehicle.color}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="button" onClick={() => void handleSaveDraft()} disabled={isSavingDraft || isLoadingVehicles || !form.vehicleId}>
                      {isSavingDraft ? 'Enregistrement...' : 'Enregistrer le brouillon'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link to="/vehicles">Changer le véhicule</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sélectionnez un véhicule pour enregistrer votre dossier.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
