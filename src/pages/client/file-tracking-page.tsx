import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, Clock3, FilePenLine, ShieldCheck } from 'lucide-react'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'
import type { ApplicationHistoryActorType, ApplicationStatusHistoryEntry, VehicleApplication } from '@/lib/application/application-types'
import { countCompletedDocuments, getDocumentCompletionPercent, getMissingRequiredDocuments, getRequiredDocuments, type DocumentRecord } from '@/lib/documents/document-types'

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

function formatPrice(value: string, commercialType?: VehicleApplication['vehicleCommercialType']) {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return value
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericValue)

  return commercialType === 'LEASE' ? `${formatted}/mois` : formatted
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function actorMeta(actorType: ApplicationHistoryActorType) {
  switch (actorType) {
    case 'CLIENT':
      return {
        label: 'Client',
        icon: ArrowUpFromLine,
        className: 'border-blue-200 bg-blue-50 text-blue-800',
      }
    case 'MANAGER':
      return {
        label: 'Gestionnaire',
        icon: ArrowDownToLine,
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      }
    default:
      return {
        label: 'Systeme',
        icon: Clock3,
        className: 'border-slate-200 bg-slate-50 text-slate-700',
      }
  }
}

export function FileTrackingPage() {
  const { fileId } = useParams()
  const [application, setApplication] = useState<VehicleApplication | null>(null)
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [history, setHistory] = useState<ApplicationStatusHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmingCustomerStep, setIsConfirmingCustomerStep] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadApplication() {
      if (!fileId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [applicationResponse, historyResponse, documentResponse] = await Promise.all([
          applicationApi.getMine(fileId),
          applicationApi.listHistoryMine(fileId),
          documentApi.listMine(),
        ])
        const vehicleResponse = await vehicleApi.getPublicVehicle(applicationResponse.vehicleId).catch(() => null)

        if (!cancelled) {
          setApplication(applicationResponse)
          setVehicle(vehicleResponse)
          setDocuments(documentResponse)
          setHistory(historyResponse)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger la demande')
          setApplication(null)
          setDocuments([])
          setHistory([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadApplication()

    return () => {
      cancelled = true
    }
  }, [fileId])

  async function submitApplication() {
    if (!application) {
      return
    }

    try {
      setIsSubmitting(true)
      const applicationResponse = await applicationApi.submitMine(application.id)
      const historyResponse = await applicationApi.listHistoryMine(application.id)
      setApplication(applicationResponse)
      setHistory(historyResponse)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Soumission impossible')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function confirmCustomerStep() {
    if (!application) {
      return
    }

    try {
      setIsConfirmingCustomerStep(true)
      const applicationResponse = await applicationApi.confirmCustomerAction(application.id)
      const historyResponse = await applicationApi.listHistoryMine(application.id)
      setApplication(applicationResponse)
      setHistory(historyResponse)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Confirmation impossible')
    } finally {
      setIsConfirmingCustomerStep(false)
    }
  }

  const canEdit = application?.status === 'DRAFT' || application?.status === 'COMPLEMENT_REQUESTED' || application?.status === 'WAITING_CUSTOMER'
  const canSubmit = application?.status === 'DRAFT' || application?.status === 'COMPLEMENT_REQUESTED'
  const canConfirmCustomerStep = application?.status === 'WAITING_CUSTOMER'

  const requiredDocuments = useMemo(() => {
    return application
      ? getRequiredDocuments(application.acquisitionType, { contributionAmount: application.contributionAmount })
      : []
  }, [application])

  const completedDocumentsCount = useMemo(() => {
    return countCompletedDocuments(documents, requiredDocuments)
  }, [documents, requiredDocuments])

  const missingRequiredDocuments = useMemo(() => {
    return getMissingRequiredDocuments(documents, requiredDocuments)
  }, [documents, requiredDocuments])

  const documentCompletionPercent = useMemo(() => {
    return getDocumentCompletionPercent(documents, requiredDocuments)
  }, [documents, requiredDocuments])

  const dossierCompletionPercent = useMemo(() => {
    if (!application) {
      return 0
    }

    return Math.round((application.profileCompletionPercent + documentCompletionPercent) / 2)
  }, [application, documentCompletionPercent])

  const timeline = useMemo(() => {
    return [...history]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .map((entry) => ({
        key: entry.id,
        title: applicationStatusMap[entry.status].label,
        date: entry.createdAt,
        detail: entry.comment?.trim() || applicationStatusMap[entry.status].helper,
        actorType: entry.actorType,
      }))
  }, [history])

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du suivi...</div>
  }

  if (error) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link to="/app/files">Retour aux demandes</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!application) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">Aucune demande selectionnee.</p>
          <Button asChild>
            <Link to="/app/files">Voir mes demandes</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Suivi de la demande</h1>
        <p className="text-muted-foreground">
          {application.vehicleBrand} {application.vehicleTitle}
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="overflow-hidden rounded-xl border bg-muted/20">
            <VehicleImage
              brand={application.vehicleBrand}
              model={application.vehicleTitle}
              seed={application.vehicleId}
              src={vehicle?.imageUrl ?? undefined}
              alt={`${application.vehicleBrand} ${application.vehicleTitle}`}
              className="h-56 w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Reference</p>
                <p className="font-medium">{application.id}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p><span className="font-medium">{application.vehicleCommercialType === 'LEASE' ? 'Loyer :' : 'Prix :'}</span> {formatPrice(application.vehiclePrice, application.vehicleCommercialType)}</p>
              <p><span className="font-medium">Mode :</span> {application.acquisitionType}</p>
              <p><span className="font-medium">Kilometrage :</span> {application.vehicleMileage.toLocaleString('fr-FR')} km</p>
              <p><span className="font-medium">Profil :</span> {application.profileCompletionPercent}%</p>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Completion du dossier</p>
                <p className="text-lg font-semibold">{dossierCompletionPercent}%</p>
              </div>
              <ProgressBar value={dossierCompletionPercent} />
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p><span className="font-medium">Profil :</span> {application.profileCompletionPercent}%</p>
                <p><span className="font-medium">Pieces :</span> {completedDocumentsCount}/{requiredDocuments.length}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canSubmit ? (
                <Button onClick={() => void submitApplication()} disabled={isSubmitting}>
                  {isSubmitting ? 'Soumission...' : application.status === 'DRAFT' ? 'Soumettre le dossier' : 'Soumettre a nouveau'}
                </Button>
              ) : null}
              {canEdit ? (
                <Button asChild variant="outline">
                  <Link to={`/app/files/${application.id}/edit`}>Mettre a jour le dossier</Link>
                </Button>
              ) : null}
              {canConfirmCustomerStep ? (
                <Button onClick={() => void confirmCustomerStep()} disabled={isConfirmingCustomerStep} variant="secondary">
                  {isConfirmingCustomerStep ? 'Confirmation...' : "J'ai signe et renvoye le contrat"}
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link to="/app/files">Retour aux demandes</Link>
              </Button>
            </div>

            {application.status === 'COMPLEMENT_REQUESTED' ? (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
                <div className="flex items-start gap-3">
                  <FilePenLine className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">Action attendue</p>
                    <p>Le gestionnaire a demande une mise a jour du dossier ou de nouvelles pieces. Ouvrez le dossier, corrigez les informations demandees puis soumettez a nouveau.</p>
                  </div>
                </div>
              </div>
            ) : null}

            {application.status === 'WAITING_CUSTOMER' ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">Validation finale attendue</p>
                    <p>Le gestionnaire attend votre retour final. Utilisez le bouton de confirmation une fois le contrat signe ou la derniere verification effectuee.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">Historique du dossier</h2>
          <div className="space-y-3">
            {timeline.length > 0 ? timeline.map((item) => {
              const actor = actorMeta(item.actorType)
              const ActorIcon = actor.icon
              return (
                <div key={item.key} className="rounded-lg border px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium ${actor.className}`}>
                        <ActorIcon className="h-3 w-3" />
                        {actor.label}
                      </span>
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              )
            }) : (
              <div className="rounded-lg border px-3 py-4 text-sm text-muted-foreground">
                Aucun evenement enregistre pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Pieces a fournir</h2>
            <p className="text-sm text-muted-foreground">{applicationStatusMap[application.status].helper}</p>
          </div>

          {application.internalComment ? (
            <div className="rounded-lg border bg-muted/20 p-3 text-sm">
              <p className="font-medium">Retour du gestionnaire</p>
              <p className="mt-1 text-muted-foreground">{application.internalComment}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            {missingRequiredDocuments.length > 0 ? missingRequiredDocuments.map((document) => (
              <div key={document.documentType} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p className="font-medium">{document.label}</p>
                {document.note ? <p className="text-xs text-amber-700">{document.note}</p> : null}
              </div>
            )) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                Toutes les pieces requises sont deja presentes dans le profil.
              </div>
            )}
          </div>

          <Button asChild className="w-full">
            <Link to="/app/profile">Verifier mon profil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
