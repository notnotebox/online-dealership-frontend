import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { DocumentRecordList } from '@/components/shared/document-record-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import type { ApplicationStatus, ApplicationStatusHistoryEntry, VehicleApplication } from '@/lib/application/application-types'
import type { DocumentRecord } from '@/lib/documents/document-types'

const MANAGER_STATUSES: ApplicationStatus[] = ['UNDER_REVIEW', 'COMPLEMENT_REQUESTED', 'WAITING_CUSTOMER', 'APPROVED', 'REJECTED']

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigne'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

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

  const timeline = useMemo(() => {
    return history.map((item) => ({
      key: item.id,
      label: applicationStatusMap[item.status].label,
      date: item.createdAt,
      detail: item.comment?.trim() || applicationStatusMap[item.status].helper,
    }))
  }, [history])

  async function changeStatus(status: ApplicationStatus) {
    if (!application) {
      return
    }

    if (status === 'COMPLEMENT_REQUESTED' && !comment.trim()) {
      setError('Un commentaire est requis pour demander un complement.')
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
          <h1 className="text-2xl font-semibold">Revue du dossier</h1>
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
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{application.firstName} {application.lastName}</p></div>
                <div><p className="text-xs text-muted-foreground">Mode d'acquisition</p><p className="font-medium">{application.acquisitionType}</p></div>
                <div><p className="text-xs text-muted-foreground">Completude du profil</p><p className="font-medium">{application.profileCompletionPercent}%</p></div>
                <div><p className="text-xs text-muted-foreground">Derniere mise a jour</p><p className="font-medium">{formatDate(application.updatedAt)}</p></div>
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Chronologie</h2>
                {timeline.length > 0 ? timeline.map((item) => (
                  <div key={item.key} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                )) : (
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
                <h2 className="font-medium">Parametres du dossier</h2>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Apport :</span> {application.contributionAmount ?? '-'}</p>
                  <p><span className="font-medium">Duree :</span> {application.durationMonths ? `${application.durationMonths} mois` : '-'}</p>
                  <p><span className="font-medium">Kilometrage annuel :</span> {application.annualMileage ? `${application.annualMileage} km` : '-'}</p>
                  <p><span className="font-medium">Debut souhaite :</span> {application.expectedStartDate ?? '-'}</p>
                  <p><span className="font-medium">Reprise / remarque :</span> {application.tradeInDescription ?? '-'}</p>
                  <p><span className="font-medium">Commentaire client :</span> {application.comment ?? '-'}</p>
                </div>
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
              <h2 className="text-lg font-semibold">Traitement</h2>
              <p className="text-sm text-muted-foreground">
                Le gestionnaire peut faire avancer le dossier sans modifier les donnees du client.
              </p>
            </div>

            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Commentaire a transmettre"
              className="min-h-24"
            />

            <div className="grid gap-2">
              {MANAGER_STATUSES.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={status === 'APPROVED' ? 'default' : status === 'REJECTED' ? 'destructive' : 'outline'}
                  onClick={() => void changeStatus(status)}
                  disabled={isSaving}
                >
                  {applicationStatusMap[status].label}
                </Button>
              ))}
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
