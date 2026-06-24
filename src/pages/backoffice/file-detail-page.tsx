import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { DocumentRecordList } from '@/components/shared/document-record-list'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import type { ApplicationStatus, VehicleApplication } from '@/lib/application/application-types'
import type { DocumentRecord } from '@/lib/documents/document-types'

const MANAGER_STATUSES: ApplicationStatus[] = ['UNDER_REVIEW', 'COMPLEMENT_REQUESTED', 'WAITING_CUSTOMER', 'APPROVED', 'REJECTED']

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigné'
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
        const [applicationResponse, documentResponse] = await Promise.all([
          applicationApi.getAdmin(fileId),
          documentApi.listAdminForApplication(fileId),
        ])

        if (!cancelled) {
          setApplication(applicationResponse)
          setDocuments(documentResponse)
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
    if (!application) {
      return []
    }

    return [
      { label: 'Création', date: application.createdAt, detail: 'Dossier enregistré.' },
      { label: 'Soumission', date: application.submittedAt, detail: application.submittedAt ? 'Envoyé par le client.' : 'Pas encore soumis.' },
      { label: 'Traitement', date: application.reviewedAt, detail: application.internalComment ?? 'Aucun commentaire interne.' },
    ]
  }, [application])

  async function changeStatus(status: ApplicationStatus) {
    if (!application) {
      return
    }

    try {
      setIsSaving(true)
      const response = await applicationApi.updateStatusAdmin(application.id, {
        status,
        internalComment: comment.trim() || undefined,
      })
      setApplication(response)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Mise à jour impossible')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du dossier…</div>
  }

  if (error) {
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
          <p className="text-sm text-muted-foreground">Aucun dossier sélectionné.</p>
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

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Client</p><p className="font-medium">{application.firstName} {application.lastName}</p></div>
                <div><p className="text-xs text-muted-foreground">Mode d’acquisition</p><p className="font-medium">{application.acquisitionType}</p></div>
                <div><p className="text-xs text-muted-foreground">Complétude du profil</p><p className="font-medium">{application.profileCompletionPercent}%</p></div>
                <div><p className="text-xs text-muted-foreground">Dernière mise à jour</p><p className="font-medium">{formatDate(application.updatedAt)}</p></div>
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Chronologie</h2>
                {timeline.map((item) => (
                  <div key={`${item.label}-${item.date ?? 'none'}`} className="rounded-lg border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Profil client</h2>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Téléphone :</span> {application.phoneNumber ?? '-'}</p>
                  <p><span className="font-medium">Date de naissance :</span> {application.dateOfBirth ?? '-'}</p>
                  <p><span className="font-medium">Adresse :</span> {application.addressLine1 ?? '-'}</p>
                  <p><span className="font-medium">Ville :</span> {application.city ?? '-'}</p>
                  <p><span className="font-medium">Code postal :</span> {application.postalCode ?? '-'}</p>
                  <p><span className="font-medium">Pays :</span> {application.country ?? '-'}</p>
                  <p><span className="font-medium">Nationalité :</span> {application.nationality ?? '-'}</p>
                  <p><span className="font-medium">Situation familiale :</span> {application.familyStatus ?? '-'}</p>
                  <p><span className="font-medium">Foyer :</span> {application.householdSize ?? '-'}</p>
                  <p><span className="font-medium">Situation professionnelle :</span> {application.professionalStatus ?? '-'}</p>
                  <p><span className="font-medium">Revenus mensuels :</span> {application.monthlyIncome ?? '-'}</p>
                  <p><span className="font-medium">Charges mensuelles :</span> {application.monthlyCharges ?? '-'}</p>
                  <p><span className="font-medium">IBAN :</span> {application.iban ?? '-'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-medium">Paramètres du dossier</h2>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Apport :</span> {application.contributionAmount ?? '-'}</p>
                  <p><span className="font-medium">Durée :</span> {application.durationMonths ? `${application.durationMonths} mois` : '-'}</p>
                  <p><span className="font-medium">Kilométrage annuel :</span> {application.annualMileage ? `${application.annualMileage} km` : '-'}</p>
                  <p><span className="font-medium">Début souhaité :</span> {application.expectedStartDate ?? '-'}</p>
                  <p><span className="font-medium">Reprise / remarque :</span> {application.tradeInDescription ?? '-'}</p>
                  <p><span className="font-medium">Commentaire client :</span> {application.comment ?? '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="text-lg font-semibold">Pièces du profil</h2>
                <p className="text-sm text-muted-foreground">
                  Ces PDF sont déposés une seule fois par le client et réutilisés pour toutes ses demandes.
                </p>
              </div>

              <DocumentRecordList
                documents={documents}
                emptyTitle="Aucun document disponible"
                emptyDescription="Le client n’a encore déposé aucune pièce PDF dans son profil."
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Traitement</h2>
              <p className="text-sm text-muted-foreground">
                Le gestionnaire peut faire avancer le dossier sans modifier les données déposées par le client.
              </p>
            </div>

            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Commentaire interne"
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
              <Link to="/backoffice/files">Retour à la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
