import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CompletionField, completionInputClassName, completionTextareaClassName } from '@/components/shared/completion-field'
import { ProfileDocumentsPanel } from '@/components/shared/profile-documents-panel'
import { TestHelperCard } from '@/components/shared/test-helper-card'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { authApi } from '@/lib/api/auth-api'
import { documentApi } from '@/lib/api/document-api'
import { vehicleApi, type VehicleCommercialType, type VehicleResponse } from '@/lib/api/vehicle-api'
import { useAuth } from '@/lib/auth/auth-context'
import type { ApplicationAcquisitionType, CreateVehicleApplicationRequest } from '@/lib/application/application-types'
import type { DocumentRecord, DocumentType } from '@/lib/documents/document-types'
import { countCompletedDocuments, getDocumentCompletionPercent, getMissingRequiredDocuments, getRequiredDocuments } from '@/lib/documents/document-types'
import { getMissingProfileFieldKeys, getProfileCompletionPercent } from '@/lib/profile/profile-completeness'
import { downloadTextFile } from '@/lib/test-fixtures/download-text-file'
import { createPlaceholderPdfFile } from '@/lib/test-fixtures/placeholder-pdf'
import { buildApplicationFixtureText, createApplicationFixture } from '@/lib/test-fixtures/profile-application-fixture'

const PROFESSIONAL_STATUSES = ['CDI', 'CDD', 'Independant', 'Fonctionnaire', 'Retraite', 'Etudiant']
const FAMILY_STATUSES = ['Celibataire', 'Marie', 'Pacse', 'En union', 'Divorce']
const ACQUISITIONS: Array<{ value: ApplicationAcquisitionType; label: string }> = [
  { value: 'CASH', label: 'Achat comptant' },
  { value: 'CREDIT', label: 'Credit auto' },
  { value: 'LOA', label: 'LOA' },
  { value: 'LLD', label: 'LLD' },
]

function allowedAcquisitionTypes(commercialType?: VehicleCommercialType | null) {
  if (commercialType === 'LEASE') {
    return ACQUISITIONS.filter((item) => item.value === 'LOA' || item.value === 'LLD')
  }

  return ACQUISITIONS.filter((item) => item.value === 'CASH' || item.value === 'CREDIT')
}

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
  nationality: 'Francaise',
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
    nationality: profile.nationality ?? 'Francaise',
    familyStatus: profile.familyStatus ?? '',
    householdSize: profile.householdSize != null ? String(profile.householdSize) : '',
    professionalStatus: profile.professionalStatus ?? '',
    monthlyIncome: profile.monthlyIncome != null ? String(profile.monthlyIncome) : '',
    monthlyCharges: profile.monthlyCharges != null ? String(profile.monthlyCharges) : '',
    iban: profile.iban ?? '',
  }
}

function buildFormFromApplication(application: Awaited<ReturnType<typeof applicationApi.getMine>>): ApplicationFormState {
  return {
    vehicleId: application.vehicleId,
    acquisitionType: application.acquisitionType,
    firstName: application.firstName ?? '',
    lastName: application.lastName ?? '',
    dateOfBirth: application.dateOfBirth ?? '',
    phoneNumber: application.phoneNumber ?? '',
    addressLine1: application.addressLine1 ?? '',
    addressLine2: application.addressLine2 ?? '',
    postalCode: application.postalCode ?? '',
    city: application.city ?? '',
    country: application.country ?? 'France',
    nationality: application.nationality ?? 'Francaise',
    familyStatus: application.familyStatus ?? '',
    householdSize: application.householdSize != null ? String(application.householdSize) : '',
    professionalStatus: application.professionalStatus ?? '',
    monthlyIncome: application.monthlyIncome != null ? String(application.monthlyIncome) : '',
    monthlyCharges: application.monthlyCharges != null ? String(application.monthlyCharges) : '',
    iban: application.iban ?? '',
    durationMonths: application.durationMonths != null ? String(application.durationMonths) : '',
    annualMileage: application.annualMileage != null ? String(application.annualMileage) : '',
    contributionAmount: application.contributionAmount != null ? String(application.contributionAmount) : '',
    expectedStartDate: application.expectedStartDate ?? '',
    tradeInDescription: application.tradeInDescription ?? '',
    insuranceIncluded: application.insuranceIncluded,
    warrantyIncluded: application.warrantyIncluded,
    assistanceIncluded: application.assistanceIncluded,
    maintenanceIncluded: application.maintenanceIncluded,
    comment: application.comment ?? '',
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

function buildPayload(form: ApplicationFormState, showLeaseFields: boolean): CreateVehicleApplicationRequest {
  return {
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
  }
}

function getVehicleSectionCompletionPercent(form: ApplicationFormState, showLeaseFields: boolean) {
  const requiredValues = [
    form.vehicleId,
    form.acquisitionType,
    showLeaseFields ? form.durationMonths : 'ok',
    showLeaseFields ? form.annualMileage : 'ok',
  ]

  const completed = requiredValues.filter((value) => String(value ?? '').trim() !== '').length
  return Math.round((completed / requiredValues.length) * 100)
}

function buildFixtureDocumentFileName(documentType: DocumentType) {
  return `${documentType.toLowerCase()}-test.pdf`
}

export function NewFilePage() {
  const navigate = useNavigate()
  const { vehicleId, fileId } = useParams()
  const { profile, refreshProfile } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [form, setForm] = useState<ApplicationFormState>(initialState)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [isLoadingApplication, setIsLoadingApplication] = useState(false)
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
          const message = cause instanceof Error ? cause.message : 'Impossible de charger les donnees'
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
    let cancelled = false

    async function loadApplication() {
      if (!fileId) {
        return
      }

      try {
        setIsLoadingApplication(true)
        const application = await applicationApi.getMine(fileId)

        if (!cancelled) {
          setForm(buildFormFromApplication(application))
          setError(null)
          profileHydratedRef.current = true
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le dossier')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingApplication(false)
        }
      }
    }

    void loadApplication()

    return () => {
      cancelled = true
    }
  }, [fileId])

  useEffect(() => {
    if (!profile || profileHydratedRef.current || fileId) {
      return
    }

    setForm((current) => ({
      ...current,
      ...buildFormFromProfile(profile),
    }))
    profileHydratedRef.current = true
  }, [fileId, profile])

  useEffect(() => {
    if (!vehicleId || fileId) {
      return
    }

    setForm((current) => (current.vehicleId === vehicleId ? current : { ...current, vehicleId }))
  }, [fileId, vehicleId])

  const selectedVehicle = useMemo(() => {
    return vehicles.find((vehicle) => vehicle.id === form.vehicleId)
      ?? vehicles.find((vehicle) => vehicle.id === vehicleId)
      ?? vehicles[0]
      ?? null
  }, [form.vehicleId, vehicleId, vehicles])

  const allowedAcquisitions = useMemo(
    () => allowedAcquisitionTypes(selectedVehicle?.commercialType),
    [selectedVehicle?.commercialType],
  )

  useEffect(() => {
    if (!form.vehicleId && selectedVehicle) {
      setForm((current) => ({ ...current, vehicleId: selectedVehicle.id }))
    }
  }, [form.vehicleId, selectedVehicle])

  useEffect(() => {
    if (!selectedVehicle) {
      return
    }

    const isCurrentAllowed = allowedAcquisitions.some((item) => item.value === form.acquisitionType)
    if (!isCurrentAllowed && allowedAcquisitions.length > 0) {
      setForm((current) => ({ ...current, acquisitionType: allowedAcquisitions[0].value }))
    }
  }, [allowedAcquisitions, form.acquisitionType, selectedVehicle])

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
  const requiredDocuments = useMemo(
    () => getRequiredDocuments(form.acquisitionType, { contributionAmount: form.contributionAmount }),
    [form.acquisitionType, form.contributionAmount],
  )
  const showLeaseFields = form.acquisitionType === 'LOA' || form.acquisitionType === 'LLD'
  const pageTitle = fileId ? 'Completer le dossier' : 'Preparer la demande vehicule'
  const documentCompletionPercent = useMemo(() => getDocumentCompletionPercent(documents, requiredDocuments), [documents, requiredDocuments])
  const completedDocumentsCount = useMemo(() => countCompletedDocuments(documents, requiredDocuments), [documents, requiredDocuments])
  const missingRequiredDocuments = useMemo(() => getMissingRequiredDocuments(documents, requiredDocuments), [documents, requiredDocuments])
  const vehicleSectionCompletionPercent = useMemo(() => getVehicleSectionCompletionPercent(form, showLeaseFields), [form, showLeaseFields])
  const dossierCompletionPercent = useMemo(() => {
    return Math.round((profileCompletionPercent + documentCompletionPercent + vehicleSectionCompletionPercent) / 3)
  }, [documentCompletionPercent, profileCompletionPercent, vehicleSectionCompletionPercent])

  function updateField(field: keyof ApplicationFormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function fillApplicationAutomatically() {
    const fixture = createApplicationFixture()
    const targetVehicle = vehicles.length > 0
      ? vehicles[Math.floor(Math.random() * vehicles.length)]
      : selectedVehicle

    setForm((current) => ({
      ...current,
      ...fixture,
      vehicleId: targetVehicle?.id ?? current.vehicleId,
    }))
    setError(null)
    setDocumentError(null)

    downloadTextFile(
      `dossier-test-${fixture.firstName.toLowerCase()}-${fixture.lastName.toLowerCase()}.txt`,
      buildApplicationFixtureText(fixture, targetVehicle),
    )

    const fixtureRequiredDocuments = getRequiredDocuments(fixture.acquisitionType, {
      contributionAmount: fixture.contributionAmount,
    })

    try {
      setIsUploadingDocument(true)
      const uploads = await Promise.all(
        fixtureRequiredDocuments.map((document) => documentApi.upload({
          documentType: document.documentType,
          file: createPlaceholderPdfFile(
            buildFixtureDocumentFileName(document.documentType),
            'document place holder pour les tests',
          ),
        })),
      )

      setDocuments((current) => {
        const withoutReplacedTypes = current.filter(
          (document) => !uploads.some((uploaded) => uploaded.documentType === document.documentType),
        )
        return [...uploads, ...withoutReplacedTypes]
      })
      setDocumentError(null)
    } catch (cause) {
      setDocumentError(cause instanceof Error ? cause.message : 'Impossible de deposer les PDF de test')
    } finally {
      setIsUploadingDocument(false)
    }
  }

  async function handleUploadDocument(payload: { file: File; documentType: DocumentType }) {
    try {
      setIsUploadingDocument(true)
      const uploaded = await documentApi.upload(payload)
      setDocuments((current) => [uploaded, ...current.filter((document) => document.documentType !== uploaded.documentType)])
      setDocumentError(null)
    } catch (cause) {
      setDocumentError(cause instanceof Error ? cause.message : 'Impossible de deposer le document')
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

      const payload = buildPayload(form, showLeaseFields)
      const response = fileId
        ? await applicationApi.updateMine(fileId, payload)
        : await applicationApi.create(payload)

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
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dossier vehicule</p>
          <h1 className="text-3xl font-semibold">{pageTitle}</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Le profil et les pieces communes sont reutilises. Cette page enregistre un brouillon.
            La soumission se fait ensuite depuis le suivi du dossier.
          </p>

        </div>

        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase text-muted-foreground">Completude du dossier</p>
              <p className="text-xl font-semibold">{dossierCompletionPercent}%</p>
            </div>
            <ProgressBar value={dossierCompletionPercent} />
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Profil: {profileCompletionPercent}%</p>
              <p>Pieces requises: {completedDocumentsCount}/{requiredDocuments.length}</p>
              <p>Parametres dossier: {vehicleSectionCompletionPercent}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoadingApplication ? (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du dossier...</div>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      ) : null}

      <TestHelperCard
        title="Outil de test dossier"
        description="Preremplit le profil et la demande vehicule avec un jeu de donnees de demonstration, puis telecharge un fichier texte."
        buttonLabel="Completer automatiquement"
        onClick={fillApplicationAutomatically}
      />

      <Card>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Vehicule selectionne</p>
                <h2 className="text-2xl font-semibold">
                  {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.title}` : 'Aucun vehicule selectionne'}
                </h2>
                {selectedVehicle ? (
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(selectedVehicle.price)} | {selectedVehicle.mileage.toLocaleString('fr-FR')} km | {selectedVehicle.energy}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Choisissez un vehicule pour poursuivre.</p>
                )}
              </div>

              <Button type="button" variant="outline" asChild>
                <Link to="/vehicles">Changer le vehicule</Link>
              </Button>
            </div>

            {selectedVehicle ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Places</p>
                  <p className="mt-1 text-lg font-semibold">{selectedVehicle.seatCount}</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Portes</p>
                  <p className="mt-1 text-lg font-semibold">{selectedVehicle.doorCount}</p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Couleur</p>
                  <p className="mt-1 text-lg font-semibold">{selectedVehicle.color}</p>
                </div>
              </div>
            ) : null}

            {selectedVehicle ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border bg-background px-3 py-1 text-muted-foreground">{selectedVehicle.energy}</span>
                <span className="rounded-full border bg-background px-3 py-1 text-muted-foreground">{selectedVehicle.mileage.toLocaleString('fr-FR')} km</span>
                <span className="rounded-full border bg-background px-3 py-1 text-muted-foreground">{formatPrice(selectedVehicle.price)}</span>
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
              <p className="text-sm text-muted-foreground">Ces informations sont enregistrees dans le compte et reutilisees pour les prochaines demandes.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CompletionField label="Prenom" missing={missingProfileFieldKeys.has('firstName')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('firstName'))} value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} />
              </CompletionField>
              <CompletionField label="Nom" missing={missingProfileFieldKeys.has('lastName')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('lastName'))} value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} />
              </CompletionField>
              <CompletionField label="Date de naissance" missing={missingProfileFieldKeys.has('dateOfBirth')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('dateOfBirth'))} type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} />
              </CompletionField>
              <CompletionField label="Telephone" missing={missingProfileFieldKeys.has('phoneNumber')}>
                <input className={completionInputClassName(missingProfileFieldKeys.has('phoneNumber'))} value={form.phoneNumber} onChange={(event) => updateField('phoneNumber', event.target.value)} />
              </CompletionField>
              <CompletionField label="Adresse" missing={missingProfileFieldKeys.has('addressLine1')} className="md:col-span-2">
                <input className={completionInputClassName(missingProfileFieldKeys.has('addressLine1'))} value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} />
              </CompletionField>
              <CompletionField label="Complement d'adresse" missing={false}>
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
              <CompletionField label="Nationalite" missing={missingProfileFieldKeys.has('nationality')}>
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
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des pieces du profil...</div>
        ) : (
          <ProfileDocumentsPanel
            documents={documents}
            isUploading={isUploadingDocument}
            onUpload={handleUploadDocument}
            title="2. Pieces du profil"
            description="Deposez ici les PDF requis pour ce dossier. Ils restent attaches a votre profil et seront reutilises pour les autres demandes."
            documentDefinitions={requiredDocuments}
          />
        )}

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">3. Suivi des pieces</h2>
              <p className="text-sm text-muted-foreground">Cette synthese reprend uniquement les pieces utiles pour le mode choisi.</p>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">Pieces deposees</p>
                  <span className="text-sm text-muted-foreground">{completedDocumentsCount}/{requiredDocuments.length}</span>
                </div>
                <ProgressBar value={documentCompletionPercent} />
                <p className="mt-3 text-sm text-muted-foreground">
                  Les pieces du profil restent modifiables a tout moment. La soumission pourra ensuite etre faite depuis le suivi de dossier.
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="font-medium">Pieces encore attendues</p>
                <div className="mt-3 space-y-2">
                  {missingRequiredDocuments.length > 0 ? missingRequiredDocuments.map((document) => (
                    <div key={document.documentType} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      <p className="font-medium">{document.label}</p>
                      {document.note ? <p className="text-xs text-amber-700">{document.note}</p> : null}
                    </div>
                  )) : (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      Toutes les pieces requises pour ce dossier sont deja presentes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">4. Demande liee au vehicule</h2>
              <p className="text-sm text-muted-foreground">Ces informations sont specifiques au vehicule et au mode d'acquisition choisi.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-muted-foreground">Vehicule</span>
                <select className="h-10 w-full rounded-md border px-3" value={form.vehicleId} onChange={(event) => updateField('vehicleId', event.target.value)}>
                  <option value="">Choisir un vehicule</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.title} - {formatPrice(vehicle.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-muted-foreground">Mode d'acquisition</span>
                <select className="h-10 w-full rounded-md border px-3" value={form.acquisitionType} onChange={(event) => updateField('acquisitionType', event.target.value as ApplicationAcquisitionType)}>
                  {allowedAcquisitions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="font-medium text-muted-foreground">Apport</span>
                <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.contributionAmount} onChange={(event) => updateField('contributionAmount', event.target.value)} />
              </label>

              {showLeaseFields ? (
                <>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-muted-foreground">Duree (mois)</span>
                    <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.durationMonths} onChange={(event) => updateField('durationMonths', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-muted-foreground">Kilometrage annuel</span>
                    <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.annualMileage} onChange={(event) => updateField('annualMileage', event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="font-medium text-muted-foreground">Date de demarrage souhaitee</span>
                    <input className="h-10 w-full rounded-md border px-3" type="date" value={form.expectedStartDate} onChange={(event) => updateField('expectedStartDate', event.target.value)} />
                  </label>
                </>
              ) : null}

              <CompletionField label="Reprise ou precision de financement" missing={false} className="md:col-span-2">
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
                Garantie mecanique
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
                  <p className="text-muted-foreground">{formatPrice(selectedVehicle.price)} | {selectedVehicle.mileage.toLocaleString('fr-FR')} km | {selectedVehicle.energy}</p>
                  <p className="text-muted-foreground">{selectedVehicle.seatCount} places | {selectedVehicle.doorCount} portes | {selectedVehicle.color}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="button" onClick={() => void handleSaveDraft()} disabled={isSavingDraft || isLoadingVehicles || isLoadingApplication || !form.vehicleId}>
                      {isSavingDraft ? 'Enregistrement...' : fileId ? 'Mettre a jour le brouillon' : 'Enregistrer le brouillon'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                      <Link to="/vehicles">Changer le vehicule</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Selectionnez un vehicule pour enregistrer votre dossier.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


