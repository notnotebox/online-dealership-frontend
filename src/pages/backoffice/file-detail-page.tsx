import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Clock3, FileCheck2, FileWarning, Send, XCircle } from 'lucide-react'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { DocumentRecordList } from '@/components/shared/document-record-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import type { ApplicationHistoryActorType, ApplicationStatus, ApplicationStatusHistoryEntry, VehicleApplication } from '@/lib/application/application-types'
import { countCompletedDocuments, getDocumentCompletionPercent, getMissingRequiredDocuments, getRequiredDocuments, type DocumentRecord } from '@/lib/documents/document-types'

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigne'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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

type ManagerAction = {
  status: ApplicationStatus
  title: string
  helper: string
  icon: typeof CheckCircle2
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

const MANAGER_ACTIONS: ManagerAction[] = [
  {
    status: 'UNDER_REVIEW',
    title: 'Passer en verification',
    helper: 'Le dossier est pris en charge et les pieces sont en cours de controle.',
    icon: FileCheck2,
    variant: 'outline',
  },
  {
    status: 'COMPLEMENT_REQUESTED',
    title: 'Demander un complement',
    helper: 'Utiliser ce statut lorsqu il manque des pieces ou une correction cote client.',
    icon: FileWarning,
    variant: 'outline',
  },
  {
    status: 'WAITING_CUSTOMER',
    title: 'Attendre la validation client',
    helper: 'Utiliser ce statut apres envoi du contrat ou pour une confirmation finale cote client.',
    icon: Send,
    variant: 'secondary',
  },
  {
    status: 'APPROVED',
    title: 'Valider le dossier',
    helper: 'Le dossier est conforme et peut etre accepte definitivement.',
    icon: CheckCircle2,
    variant: 'default',
  },
  {
    status: 'REJECTED',
    title: 'Refuser le dossier',
    helper: 'A utiliser uniquement si la demande ne peut pas aboutir.',
    icon: XCircle,
    variant: 'destructive',
  },
]

export function BackofficeFileDetailPage() {
  const { fileId } = useParams()
  const [application, setApplication] = useState<VehicleApplication | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [history, setHistory] = useState<ApplicationStatusHistoryEntry[]>([])
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
        const [applicationResponse, documentResponse, historyResponse] = await Promise.all([
          applicationApi.getAdmin(fileId),
          documentApi.listAdminForApplication(fileId),
          applicationApi.listHistoryAdmin(fileId),
        ])

        if (!cancelled) {
          setApplication(applicationResponse)
          setDocuments(documentResponse)
          setHistory(historyResponse)
          setComment(applicationResponse.internalComment ?? '')
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le dossier')
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
      .map((item) => ({
        key: item.id,
        label: applicationStatusMap[item.status].label,
        date: item.createdAt,
        detail: item.comment?.trim() || applicationStatusMap[item.status].helper,
        actorType: item.actorType,
      }))
  }, [history])

  async function changeStatus(status: ApplicationStatus) {
    if (!application) {
      return
    }

    if ((status === 'COMPLEMENT_REQUESTED' || status === 'WAITING_CUSTOMER') && !comment.trim()) {
      setError('Un commentaire est requis pour informer le client.')
      return
    }

    try {
      setIsSaving(true)
      const response = await applicationApi.updateStatusAdmin(application.id, {
        status,
        internalComment: comment.trim() || undefined,
      })
      const historyResponse = await applicationApi.listHistoryAdmin(application.id)
      setApplication(response)
      setHistory(historyResponse)
      setComment(response.internalComment ?? '')
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise a jour impossible')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du dossier...</div>
  }

  if (error && !application) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button asChild variant="outline">
            <Link to="/backoffice/files">Retour aux dossiers</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!application) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">Aucun dossier selectionne.</p>
          <Button asChild>
            <Link to="/backoffice/files">Voir les dossiers</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Traitement du dossier</h1>
          <p className="text-sm text-muted-foreground">
            {application.vehicleBrand} {application.vehicleTitle}
          </p>
        </div>
        <ApplicationStatusBadge status={application.status} />
      </div>

      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1 rounded-xl border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Client</p>
                  <p className="font-medium">{application.firstName} {application.lastName}</p>
                </div>
                <div className="space-y-1 rounded-xl border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Mode</p>
                  <p className="font-medium">{application.acquisitionType}</p>
                </div>
                <div className="space-y-1 rounded-xl border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Profil</p>
                  <p className="font-medium">{application.profileCompletionPercent}%</p>
                </div>
                <div className="space-y-1 rounded-xl border p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Derniere mise a jour</p>
                  <p className="font-medium">{formatDate(application.updatedAt)}</p>
                </div>
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

              <div className="space-y-2">
                <h2 className="font-medium">Historique du traitement</h2>
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
                          <p className="text-sm font-medium">{item.label}</p>
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

              <div className="space-y-2">
                <h2 className="font-medium">Profil client</h2>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Telephone :</span> {application.phoneNumber ?? '-'}</p>
                  <p><span className="font-medium">Date de naissance :</span> {application.dateOfBirth ?? '-'}</p>
                  <p><span className="font-medium">Adresse :</span> {application.addressLine1 ?? '-'}</p>
                  <p><span className="font-medium">Ville :</span> {application.city ?? '-'}</p>
                  <p><span className="font-medium">Code postal :</span> {application.postalCode ?? '-'}</p>
                  <p><span className="font-medium">Pays :</span> {application.country ?? '-'}</p>
                  <p><span className="font-medium">Nationalite :</span> {application.nationality ?? '-'}</p>
                  <p><span className="font-medium">Situation familiale :</span> {application.familyStatus ?? '-'}</p>
                  <p><span className="font-medium">Foyer :</span> {application.householdSize ?? '-'}</p>
                  <p><span className="font-medium">Situation professionnelle :</span> {application.professionalStatus ?? '-'}</p>
                  <p><span className="font-medium">Revenus mensuels :</span> {application.monthlyIncome ?? '-'}</p>
                  <p><span className="font-medium">Charges mensuelles :</span> {application.monthlyCharges ?? '-'}</p>
                  <p><span className="font-medium">IBAN :</span> {application.iban ?? '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Parametres de la demande</h2>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Apport :</span> {application.contributionAmount ?? '-'}</p>
                  <p><span className="font-medium">Duree :</span> {application.durationMonths ? `${application.durationMonths} mois` : '-'}</p>
                  <p><span className="font-medium">Kilometrage annuel :</span> {application.annualMileage ? `${application.annualMileage} km` : '-'}</p>
                  <p><span className="font-medium">Debut souhaite :</span> {application.expectedStartDate ?? '-'}</p>
                  <p><span className="font-medium">Reprise ou remarque :</span> {application.tradeInDescription ?? '-'}</p>
                  <p><span className="font-medium">Commentaire client :</span> {application.comment ?? '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Pieces encore attendues</h2>
                {missingRequiredDocuments.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {missingRequiredDocuments.map((document) => (
                      <div key={document.documentType} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <p className="font-medium">{document.label}</p>
                        {document.note ? <p className="text-xs text-amber-700">{document.note}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
                    Toutes les pieces requises sont deja presentes dans le profil client.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-lg font-semibold">Pieces du profil</h2>
                <p className="text-sm text-muted-foreground">
                  Ces PDF sont deposes une seule fois par le client et reutilises pour toutes ses demandes.
                </p>
              </div>

              <DocumentRecordList
                documents={documents}
                emptyTitle="Aucun document disponible"
                emptyDescription="Le client n'a encore depose aucune piece PDF dans son profil."
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Actions gestionnaire</h2>
              <p className="text-sm text-muted-foreground">
                Le commentaire ci-dessous sera utilise pour informer le client lorsqu une action le concerne.
              </p>
            </div>

            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Commentaire a transmettre"
              className="min-h-24"
            />

            <div className="grid gap-3">
              {MANAGER_ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.status}
                    type="button"
                    onClick={() => void changeStatus(action.status)}
                    disabled={isSaving}
                    className="rounded-xl border p-4 text-left transition hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.helper}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link to="/backoffice/files">Retour a la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
