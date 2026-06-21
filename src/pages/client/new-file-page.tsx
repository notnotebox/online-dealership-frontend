import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { applicationApi } from '@/lib/api/application-api'
import { authApi } from '@/lib/api/auth-api'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'
import { useAuth } from '@/lib/auth/auth-context'
import type { ApplicationAcquisitionType } from '@/lib/application/application-types'
import { formatDocumentTypeLabel, getRequiredDocuments } from '@/lib/documents/document-types'
import { getMissingProfileFields, getProfileCompletionPercent } from '@/lib/profile/profile-completeness'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FIRST_NAMES = ['Alex', 'Camille', 'Jordan', 'Lina', 'Noah', 'Sofia', 'Malo', 'Ines']
const LAST_NAMES = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Durand', 'Dubois', 'Moreau']
const PROFESSIONAL_STATUSES = ['CDI', 'CDD', 'Independant', 'Fonctionnaire', 'Retraite', 'Etudiant']
const FAMILY_STATUSES = ['Celibataire', 'Marie', 'Pacsé', 'En union', 'Divorce']
const NATIONALITIES = ['Française', 'Belge', 'Suisse', 'Portugaise', 'Espagnole']
const ACQUISITIONS: ApplicationAcquisitionType[] = ['CASH', 'CREDIT', 'LOA', 'LLD']

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

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

function randomEmail(firstName: string, lastName: string) {
  const suffix = Math.floor(100 + Math.random() * 900)
  return `${firstName}.${lastName}${suffix}`.toLowerCase().replace(/[^a-z0-9.]/g, '') + '@example.com'
}

function randomBirthDate() {
  const now = new Date()
  const age = 24 + Math.floor(Math.random() * 20)
  const year = now.getFullYear() - age
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function randomFutureDate() {
  const date = new Date()
  date.setDate(date.getDate() + 15 + Math.floor(Math.random() * 120))
  return date.toISOString().slice(0, 10)
}

function toOptionalNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const next = Number(trimmed)
  return Number.isFinite(next) ? next : undefined
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

function downloadTextFile(filename: string, content: string) {
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

function createFixtureContent(profile: ApplicationFormState, email: string, vehicle?: VehicleResponse | null) {
  return [
    `vehicleId=${vehicle?.id ?? profile.vehicleId}`,
    `vehicleTitle=${vehicle ? `${vehicle.brand} ${vehicle.title}` : ''}`,
    `acquisitionType=${profile.acquisitionType}`,
    `firstName=${profile.firstName}`,
    `lastName=${profile.lastName}`,
    `dateOfBirth=${profile.dateOfBirth}`,
    `phoneNumber=${profile.phoneNumber}`,
    `email=${email}`,
    `addressLine1=${profile.addressLine1}`,
    `addressLine2=${profile.addressLine2}`,
    `postalCode=${profile.postalCode}`,
    `city=${profile.city}`,
    `country=${profile.country}`,
    `nationality=${profile.nationality}`,
    `familyStatus=${profile.familyStatus}`,
    `householdSize=${profile.householdSize}`,
    `professionalStatus=${profile.professionalStatus}`,
    `monthlyIncome=${profile.monthlyIncome}`,
    `monthlyCharges=${profile.monthlyCharges}`,
    `iban=${profile.iban}`,
    `durationMonths=${profile.durationMonths}`,
    `annualMileage=${profile.annualMileage}`,
    `contributionAmount=${profile.contributionAmount}`,
    `expectedStartDate=${profile.expectedStartDate}`,
    `tradeInDescription=${profile.tradeInDescription}`,
    `insuranceIncluded=${profile.insuranceIncluded}`,
    `warrantyIncluded=${profile.warrantyIncluded}`,
    `assistanceIncluded=${profile.assistanceIncluded}`,
    `maintenanceIncluded=${profile.maintenanceIncluded}`,
    `comment=${profile.comment}`,
    `documents=${getRequiredDocuments(profile.acquisitionType).map((document) => formatDocumentTypeLabel(document.documentType)).join(', ')}`,
  ].join('\n')
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export function NewFilePage() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const { profile, refreshProfile } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [form, setForm] = useState<ApplicationFormState>(initialState)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const profileHydratedRef = useRef(false)
  const accountEmail = profile?.email ?? ''

  useEffect(() => {
    let cancelled = false

    async function loadVehicles() {
      try {
        setIsLoadingVehicles(true)
        const response = await vehicleApi.listPublicVehicles()
        if (!cancelled) {
          setVehicles(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les véhicules')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVehicles(false)
        }
      }
    }

    void loadVehicles()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profile || profileHydratedRef.current) {
      return
    }

    setForm((prev) => ({
      ...prev,
      ...buildFormFromProfile(profile),
    }))
    profileHydratedRef.current = true
  }, [profile])

  useEffect(() => {
    if (!vehicleId) {
      return
    }
    setForm((prev) => (prev.vehicleId === vehicleId ? prev : { ...prev, vehicleId }))
  }, [vehicleId])

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === form.vehicleId) ?? vehicles.find((vehicle) => vehicle.id === vehicleId) ?? vehicles[0] ?? null,
    [form.vehicleId, vehicleId, vehicles],
  )

  useEffect(() => {
    if (!form.vehicleId && selectedVehicle) {
      setForm((prev) => ({ ...prev, vehicleId: selectedVehicle.id }))
    }
  }, [form.vehicleId, selectedVehicle])

  const profileCompletionPercent = useMemo(() => {
    return getProfileCompletionPercent({
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
    })
  }, [form])

  const missingProfileFields = useMemo(() => {
    return getMissingProfileFields({
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
    })
  }, [form])

  const requiredDocuments = useMemo(() => getRequiredDocuments(form.acquisitionType), [form.acquisitionType])

  function updateField(field: keyof ApplicationFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function generateRandomData() {
    const firstName = randomItem(FIRST_NAMES)
    const lastName = randomItem(LAST_NAMES)
    const generatedEmail = accountEmail || randomEmail(firstName, lastName)
    const selectedVehicle = vehicles[Math.floor(Math.random() * Math.max(vehicles.length, 1))] ?? null
    const nextForm: ApplicationFormState = {
      ...initialState,
      vehicleId: selectedVehicle?.id ?? vehicleId ?? '',
      acquisitionType: randomItem(ACQUISITIONS),
      firstName,
      lastName,
      dateOfBirth: randomBirthDate(),
      phoneNumber: `06${randomDigits(8)}`,
      addressLine1: `${Math.floor(10 + Math.random() * 180)} Rue de la ${randomItem(['Paix', 'Republique', 'Liberte', 'Victoire', 'Gare'])}`,
      addressLine2: Math.random() > 0.6 ? `Batiment ${randomItem(['A', 'B', 'C'])}` : '',
      postalCode: String(Math.floor(10000 + Math.random() * 89999)),
      city: randomItem(['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes']),
      country: 'France',
      nationality: randomItem(NATIONALITIES),
      familyStatus: randomItem(FAMILY_STATUSES),
      householdSize: String(1 + Math.floor(Math.random() * 4)),
      professionalStatus: randomItem(PROFESSIONAL_STATUSES),
      monthlyIncome: String(1800 + Math.floor(Math.random() * 5200)),
      monthlyCharges: String(300 + Math.floor(Math.random() * 1800)),
      iban: `FR${randomDigits(2)}${randomDigits(2)}${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}${randomDigits(2)}`,
      durationMonths: String(randomItem([24, 36, 48, 60])),
      annualMileage: String(randomItem([10000, 12000, 15000, 18000, 20000])),
      contributionAmount: String(randomItem([0, 1500, 3000, 5000, 8000])),
      expectedStartDate: randomFutureDate(),
      tradeInDescription: Math.random() > 0.5 ? 'Reprise à estimer' : '',
      insuranceIncluded: Math.random() > 0.5,
      warrantyIncluded: Math.random() > 0.5,
      assistanceIncluded: Math.random() > 0.5,
      maintenanceIncluded: Math.random() > 0.5,
      comment: 'Génération de test pour le parcours complet.',
    }

    setForm(nextForm)
    setSuccess(null)
    setError(null)
    downloadTextFile(
      `application-fixture-${firstName.toLowerCase()}-${lastName.toLowerCase()}.txt`,
      createFixtureContent(nextForm, generatedEmail, selectedVehicle),
    )
  }

  async function handleSubmit() {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

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
        status: 'DRAFT',
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
        durationMonths: toOptionalNumber(form.durationMonths),
        annualMileage: toOptionalNumber(form.annualMileage),
        contributionAmount: toOptionalNumber(form.contributionAmount),
        expectedStartDate: form.expectedStartDate || undefined,
        tradeInDescription: form.tradeInDescription || undefined,
        insuranceIncluded: form.insuranceIncluded,
        warrantyIncluded: form.warrantyIncluded,
        assistanceIncluded: form.assistanceIncluded,
        maintenanceIncluded: form.maintenanceIncluded,
        comment: form.comment || undefined,
      })

      setSuccess(`Demande créée: ${response.id}`)
      navigate(`/app/files/${response.id}`, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Création impossible')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showLeaseFields = form.acquisitionType === 'LOA' || form.acquisitionType === 'LLD'

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-2xl border bg-gradient-to-br from-background to-muted/30 p-6 shadow-sm lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nouvelle demande</p>
            <h1 className="text-3xl font-semibold">Compléter le profil puis déposer la demande</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Les informations communes restent dans le profil. La demande conserve uniquement ce qui dépend du véhicule et du mode choisi.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={generateRandomData}>
              Générer les données aléatoires
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/app/profile')}>
              Compléter le profil
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase text-muted-foreground">Complétude du profil</p>
                <p className="text-xl font-semibold">{profileCompletionPercent}%</p>
              </div>
              <ProgressBar value={profileCompletionPercent} />
              <p className="text-xs text-muted-foreground">
                {missingProfileFields.length > 0
                  ? `À compléter: ${missingProfileFields.slice(0, 4).join(', ')}${missingProfileFields.length > 4 ? '…' : ''}`
                  : 'Profil prêt pour une demande complète.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 p-4">
              <p className="text-xs uppercase text-muted-foreground">Véhicule</p>
              <p className="text-lg font-semibold">{selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.title}` : 'Aucun véhicule'}</p>
              <p className="text-xs text-muted-foreground">{selectedVehicle ? `${selectedVehicle.energy} - ${selectedVehicle.mileage.toLocaleString('fr-FR')} km` : 'Sélectionnez un véhicule dans le catalogue'}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
      {success && <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{success}</p>}

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">1. Profil client</h2>
                <p className="text-sm text-muted-foreground">Ces informations mettent à jour le compte client et servent de base à la demande.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Prénom</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Nom</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Date de naissance</span>
                  <input className="h-10 w-full rounded-md border px-3" type="date" value={form.dateOfBirth} onChange={(e) => updateField('dateOfBirth', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Téléphone</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.phoneNumber} onChange={(e) => updateField('phoneNumber', e.target.value)} />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">2. Coordonnées et situation</h2>
                <p className="text-sm text-muted-foreground">Ces champs complètent le profil. Ils peuvent être renseignés ici ou depuis la page profil.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="text-muted-foreground">Adresse</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.addressLine1} onChange={(e) => updateField('addressLine1', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Complément</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.addressLine2} onChange={(e) => updateField('addressLine2', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Code postal</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Ville</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.city} onChange={(e) => updateField('city', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Pays</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.country} onChange={(e) => updateField('country', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Nationalité</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Situation familiale</span>
                  <select className="h-10 w-full rounded-md border px-3" value={form.familyStatus} onChange={(e) => updateField('familyStatus', e.target.value)}>
                    <option value="">Choisir</option>
                    {FAMILY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Nombre de personnes au foyer</span>
                  <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.householdSize} onChange={(e) => updateField('householdSize', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Situation professionnelle</span>
                  <select className="h-10 w-full rounded-md border px-3" value={form.professionalStatus} onChange={(e) => updateField('professionalStatus', e.target.value)}>
                    <option value="">Choisir</option>
                    {PROFESSIONAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Revenus mensuels nets</span>
                  <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.monthlyIncome} onChange={(e) => updateField('monthlyIncome', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Charges mensuelles</span>
                  <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.monthlyCharges} onChange={(e) => updateField('monthlyCharges', e.target.value)} />
                </label>
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="text-muted-foreground">IBAN</span>
                  <input className="h-10 w-full rounded-md border px-3" value={form.iban} onChange={(e) => updateField('iban', e.target.value)} />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">3. Demande liée au véhicule</h2>
                <p className="text-sm text-muted-foreground">Les champs ci-dessous dépendent du mode d’acquisition.</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="text-muted-foreground">Véhicule</span>
                  <select className="h-10 w-full rounded-md border px-3" value={form.vehicleId} onChange={(e) => updateField('vehicleId', e.target.value)}>
                    <option value="">Choisir un véhicule</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.title} - {vehicle.price} EUR
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Mode d’acquisition</span>
                  <select className="h-10 w-full rounded-md border px-3" value={form.acquisitionType} onChange={(e) => updateField('acquisitionType', e.target.value as ApplicationAcquisitionType)}>
                    {ACQUISITIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Apport</span>
                  <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.contributionAmount} onChange={(e) => updateField('contributionAmount', e.target.value)} />
                </label>

                {showLeaseFields ? (
                  <>
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">Durée (mois)</span>
                      <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.durationMonths} onChange={(e) => updateField('durationMonths', e.target.value)} />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">Kilométrage annuel</span>
                      <input className="h-10 w-full rounded-md border px-3" type="number" min="0" value={form.annualMileage} onChange={(e) => updateField('annualMileage', e.target.value)} />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="text-muted-foreground">Date de démarrage souhaitée</span>
                      <input className="h-10 w-full rounded-md border px-3" type="date" value={form.expectedStartDate} onChange={(e) => updateField('expectedStartDate', e.target.value)} />
                    </label>
                  </>
                ) : (
                  <label className="space-y-1 text-sm md:col-span-2">
                    <span className="text-muted-foreground">Information de reprise ou de règlement</span>
                    <textarea className="min-h-24 w-full rounded-md border px-3 py-2" value={form.tradeInDescription} onChange={(e) => updateField('tradeInDescription', e.target.value)} />
                  </label>
                )}

                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="text-muted-foreground">Commentaire</span>
                  <textarea className="min-h-24 w-full rounded-md border px-3 py-2" value={form.comment} onChange={(e) => updateField('comment', e.target.value)} />
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.insuranceIncluded} onChange={(e) => updateField('insuranceIncluded', e.target.checked)} />
                  Assurance incluse
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.warrantyIncluded} onChange={(e) => updateField('warrantyIncluded', e.target.checked)} />
                  Garantie mécanique
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.assistanceIncluded} onChange={(e) => updateField('assistanceIncluded', e.target.checked)} />
                  Assistance
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.maintenanceIncluded} onChange={(e) => updateField('maintenanceIncluded', e.target.checked)} />
                  Entretien
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">4. Pièces attendues</h2>
                <p className="text-sm text-muted-foreground">La liste s’adapte au mode choisi. Les pièces déposées plus tard seront rattachées à la demande.</p>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {requiredDocuments.map((document) => (
                  <div key={document.documentType} className="rounded-lg border px-3 py-2 text-sm">
                    <p className="font-medium">{formatDocumentTypeLabel(document.documentType)}</p>
                    {document.note && <p className="text-xs text-muted-foreground">{document.note}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">5. Récapitulatif</h2>
                <p className="text-sm text-muted-foreground">La demande reprend le profil complété et les informations liées au véhicule.</p>
              </div>

              <div className="grid gap-2 text-sm md:grid-cols-2">
                <p><span className="font-medium">Véhicule:</span> {selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.title}` : '-'}</p>
                <p><span className="font-medium">Compte:</span> {(profile?.email ?? accountEmail) || '-'}</p>
                <p><span className="font-medium">Complétude profil:</span> {profileCompletionPercent}%</p>
                <p><span className="font-medium">Mode:</span> {form.acquisitionType}</p>
                <p><span className="font-medium">Durée:</span> {showLeaseFields ? `${form.durationMonths} mois` : '-'}</p>
                <p><span className="font-medium">Kilométrage annuel:</span> {showLeaseFields ? `${form.annualMileage} km` : '-'}</p>
                <p><span className="font-medium">Apport:</span> {form.contributionAmount} EUR</p>
                <p><span className="font-medium">Début souhaité:</span> {showLeaseFields ? form.expectedStartDate || '-' : '-'}</p>
              </div>

              <Button type="button" className="w-full md:w-auto" onClick={handleSubmit} disabled={isSubmitting || isLoadingVehicles || !form.vehicleId}>
                {isSubmitting ? 'Envoi...' : 'Enregistrer la demande'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Véhicule sélectionné</h2>
                <span className="text-xs text-muted-foreground">{isLoadingVehicles ? 'Chargement...' : `${vehicles.length} véhicules`}</span>
              </div>

              {selectedVehicle ? (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{selectedVehicle.brand}</p>
                  <p className="text-lg font-semibold">{selectedVehicle.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedVehicle.energy} - {selectedVehicle.mileage.toLocaleString('fr-FR')} km
                  </p>
                  <p className="text-xl font-semibold">{selectedVehicle.price} EUR</p>
                  <Button variant="outline" asChild className="w-full">
                    <Link to={`/vehicles/${selectedVehicle.id}`}>Voir la fiche véhicule</Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sélectionnez un véhicule pour poursuivre.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-lg font-semibold">Profil</h2>
              <p className="text-sm text-muted-foreground">{profileCompletionPercent}% complété</p>
              <ProgressBar value={profileCompletionPercent} />
              {missingProfileFields.length > 0 ? (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Champs encore ouverts:</p>
                  <ul className="space-y-1">
                    {missingProfileFields.slice(0, 6).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Profil prêt à l’usage.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
