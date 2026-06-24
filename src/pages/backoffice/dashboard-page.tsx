import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationApi } from '@/lib/api/application-api'
import type { VehicleApplication } from '@/lib/application/application-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function BackofficeDashboardPage() {
  const [applications, setApplications] = useState<VehicleApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadApplications() {
      try {
        setIsLoading(true)
        const response = await applicationApi.listAdmin()
        if (!cancelled) {
          setApplications(response.filter((application) => application.status !== 'DRAFT'))
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
    const unprocessed = applications.filter((application) => application.boardColumn === 'UNPROCESSED').length
    const inReview = applications.filter((application) => application.boardColumn === 'IN_REVIEW').length
    const approved = applications.filter((application) => application.boardColumn === 'APPROVED').length
    const rejected = applications.filter((application) => application.boardColumn === 'REJECTED').length
    return { total, unprocessed, inReview, approved, rejected }
  }, [applications])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard gestionnaire</h1>
      <div className="flex flex-wrap gap-2">
        <Button asChild><Link to="/backoffice/files">Ouvrir les dossiers</Link></Button>
        <Button asChild variant="outline"><Link to="/backoffice/vehicles">Gérer les véhicules</Link></Button>
        <Button asChild variant="outline"><Link to="/backoffice/vehicles/new">Ajouter un véhicule</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total dossiers</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Non traites</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.unprocessed}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">En verification</p><p className="text-2xl font-semibold">{isLoading ? '...' : stats.inReview}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Valides / refuses</p><p className="text-2xl font-semibold">{isLoading ? '...' : `${stats.approved} / ${stats.rejected}`}</p></CardContent></Card>
      </div>
    </div>
  )
}
