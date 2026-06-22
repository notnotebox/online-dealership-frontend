import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/shared/application-status-badge'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import type { ApplicationBoardColumn, VehicleApplication } from '@/lib/application/application-types'

const COLUMNS: Array<{ key: ApplicationBoardColumn; label: string; description: string }> = [
  { key: 'UNPROCESSED', label: 'Non traites', description: 'Dossiers recu, a trier ou a demarrer.' },
  { key: 'IN_REVIEW', label: 'En verification', description: 'Pieces et dossier en cours de controle.' },
  { key: 'APPROVED', label: 'Valides', description: 'Dossiers acceptes.' },
  { key: 'REJECTED', label: 'Refuses', description: 'Dossiers fermes ou refuses.' },
]

export function BackofficeFilesPage() {
  const [applications, setApplications] = useState<VehicleApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      try {
        setIsLoading(true)
        const response = await applicationApi.listAdmin()
        if (!cancelled) {
          setApplications(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les dossiers')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadApplications()

    return () => {
      cancelled = true
    }
  }, [])

  const grouped = useMemo(() => {
    return COLUMNS.map((column) => ({
      ...column,
      applications: applications.filter((application) => application.boardColumn === column.key),
    }))
  }, [applications])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Dossiers clients</h1>
          <p className="text-sm text-muted-foreground">
            Vue de traitement par colonnes. Un dossier peut etre consulte sans etre modifie.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link to="/backoffice/dashboard">Retour dashboard</Link></Button>
          <Button asChild><Link to="/backoffice/vehicles">Vehicules</Link></Button>
        </div>
      </div>

      {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 xl:grid-cols-4">
        {grouped.map((group) => (
          <Card key={group.key} className="min-h-[24rem]">
            <CardContent className="space-y-4 p-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold">{group.label}</h2>
                  <span className="text-xs text-muted-foreground">{group.applications.length}</span>
                </div>
                <p className="text-xs text-muted-foreground">{group.description}</p>
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground">Chargement...</p>
              ) : group.applications.length === 0 ? (
                <ContentStateCard
                  title="Aucun dossier dans cette colonne"
                  description="Les nouveaux dossiers apparaîtront ici selon leur niveau d avancement."
                />
              ) : (
                <div className="space-y-3">
                  {group.applications.map((application) => (
                    <article key={application.id} className="space-y-2 rounded-lg border bg-background p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {application.vehicleBrand} {application.vehicleTitle}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {application.firstName} {application.lastName}
                          </p>
                        </div>
                        <ApplicationStatusBadge status={application.status} />
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Mode: {application.acquisitionType}</p>
                        <p>Mise a jour: {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(application.updatedAt))}</p>
                        <p>Profil: {application.profileCompletionPercent}%</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/backoffice/files/${application.id}`}>Ouvrir</Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/app/files/${application.id}`}>Vue client</Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
