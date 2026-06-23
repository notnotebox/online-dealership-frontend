import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import type { ApplicationStatus, VehicleApplication } from '@/lib/application/application-types'

const inProgressStatuses = new Set<ApplicationStatus>(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'COMPLEMENT_REQUESTED', 'WAITING_CUSTOMER'])
const approvedStatuses = new Set<ApplicationStatus>(['APPROVED'])
const rejectedStatuses = new Set<ApplicationStatus>(['REJECTED'])

export function ClientFilesPage() {
  const [applications, setApplications] = useState<VehicleApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      try {
        setIsLoading(true)
        const response = await applicationApi.listMine()
        if (!cancelled) {
          setApplications(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les demandes')
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

  const groups = useMemo(() => {
    return [
      {
        key: 'in-progress',
        title: 'Demandes en cours',
        description: 'Brouillons, envoyees ou en attente de pieces.',
        applications: applications.filter((application) => inProgressStatuses.has(application.status)),
      },
      {
        key: 'approved',
        title: 'Demandes validees',
        description: 'Demandes acceptees.',
        applications: applications.filter((application) => approvedStatuses.has(application.status)),
      },
      {
        key: 'rejected',
        title: 'Demandes cloturees',
        description: 'Demandes refusees ou annulees.',
        applications: applications.filter((application) => rejectedStatuses.has(application.status)),
      },
    ]
  }, [applications])

  const emptyMessage = useMemo(() => {
    if (isLoading) {
      return 'Chargement des demandes...'
    }
    if (error) {
      return error
    }
    return 'Aucune demande pour le moment.'
  }, [error, isLoading])

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Mes demandes</h1>
        <p className="text-muted-foreground">Chaque demande est maintenant liee a un vehicule et au profil client.</p>
      </div>

      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="mb-2 text-sm font-medium">Lecture des statuts</p>
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(applicationStatusMap).map(([status, meta]) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <ApplicationStatusBadge status={status as ApplicationStatus} />
              <span className="text-muted-foreground">{meta.helper}</span>
            </div>
          ))}
        </div>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">{emptyMessage}</CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.key} className="rounded-lg border p-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </div>

            {group.applications.length === 0 && (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Aucune demande dans cette section.
              </p>
            )}

            {group.applications.map((application) => (
              <div key={application.id} className="flex flex-col gap-3 border-b py-3 last:border-b-0 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {application.vehicleBrand} {application.vehicleTitle}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creee le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(application.createdAt))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Completion profil: {application.profileCompletionPercent}%
                  </p>
                  <p className="text-xs text-muted-foreground">{applicationStatusMap[application.status].helper}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <ApplicationStatusBadge status={application.status} />
                  <Button asChild variant="outline">
                    <Link to={`/app/files/${application.id}`}>Voir le detail</Link>
                  </Button>
                </div>
              </div>
            ))}
          </section>
        ))
      )}

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/app/files/new">Nouvelle demande</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/vehicles">Parcourir le catalogue</Link>
        </Button>
      </div>
    </div>
  )
}
