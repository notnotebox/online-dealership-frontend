import { Link } from 'react-router-dom'
import { ApplicationStatusBadge } from '@/components/shared/application-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { useEffect, useMemo, useState } from 'react'
import type { VehicleApplication } from '@/lib/application/application-types'

export function ClientDashboardPage() {
  const [applications, setApplications] = useState<VehicleApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      try {
        setIsLoading(true)
        const response = await applicationApi.listMine()
        if (!cancelled) {
          setApplications(response)
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

  const stats = useMemo(() => {
    const total = applications.length
    const inProgress = applications.filter((app) => ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFO'].includes(app.status)).length
    const approved = applications.filter((app) => app.status === 'APPROVED').length
    const needInfo = applications.filter((app) => app.status === 'NEEDS_INFO').length
    return { total, inProgress, approved, needInfo }
  }, [applications])

  const activeApplication = applications[0] ?? null

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Tableau de bord client</h1>
        <p className="text-muted-foreground">Vos demandes sont regroupees dans votre espace client.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="space-y-1 p-4"><p className="text-sm text-muted-foreground">Total demandes</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.total}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-4"><p className="text-sm text-muted-foreground">En cours</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.inProgress}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-4"><p className="text-sm text-muted-foreground">Validees</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.approved}</p></CardContent></Card>
        <Card><CardContent className="space-y-1 p-4"><p className="text-sm text-muted-foreground">Pieces manquantes</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.needInfo}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Demande active</h2>
              {activeApplication ? <ApplicationStatusBadge status={activeApplication.status} /> : null}
            </div>
            {!activeApplication && <p className="text-sm text-muted-foreground">Aucune demande active.</p>}
            {activeApplication && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Vehicule:</span> {activeApplication.vehicleBrand} {activeApplication.vehicleTitle}</p>
                <p><span className="font-medium">Completion profil:</span> {activeApplication.profileCompletionPercent}%</p>
                <p><span className="font-medium">Mise a jour:</span> {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activeApplication.updatedAt))}</p>
                <p className="text-muted-foreground">Votre profil client sert de base pour vos prochaines demandes.</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link to="/app/files">Voir mes demandes</Link></Button>
              <Button variant="outline" asChild><Link to="/app/files/new">Nouvelle demande</Link></Button>
              {activeApplication && (
                <Button variant="outline" asChild>
                  <Link to={`/app/files/${activeApplication.id}`}>Suivi actif</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-lg font-semibold">Etapes conseillees</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Completer votre profil une seule fois.</li>
              <li>2. Ajouter les pieces justificatives necessaires.</li>
              <li>3. Ouvrir une nouvelle demande sur le vehicule souhaite.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-lg font-semibold">Demandes recentes</h2>
          <div className="space-y-2">
            {applications.map((application) => (
              <div key={application.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{application.vehicleBrand} {application.vehicleTitle}</p>
                  <p className="text-xs text-muted-foreground">Mis a jour le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(application.updatedAt))}</p>
                </div>
                <ApplicationStatusBadge status={application.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Actions rapides</h2>
            <Button asChild className="w-full"><Link to="/vehicles">Parcourir le catalogue</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link to="/app/files/new">Demarrer une demande</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Profil et pieces</h2>
            <p className="text-sm text-muted-foreground">
              Vos informations de base sont regroupées dans le profil client.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/app/profile">Completer mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
