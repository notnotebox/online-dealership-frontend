import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import type { VehicleApplication } from '@/lib/application/application-types'

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

export function FileTrackingPage() {
  const { fileId } = useParams()
  const [application, setApplication] = useState<VehicleApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        const response = await applicationApi.getMine(fileId)
        if (!cancelled) {
          setApplication(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger la demande')
          setApplication(null)
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
      const response = await applicationApi.submitMine(application.id)
      setApplication(response)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Soumission impossible')
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeline = useMemo(() => {
    if (!application) {
      return []
    }

    return [
      { status: 'SUBMITTED', date: application.createdAt, comment: 'Demande deposee' },
      { status: application.status, date: application.updatedAt, comment: applicationStatusMap[application.status].helper },
    ]
  }, [application])

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

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Reference</p>
                <p className="font-medium">{application.id}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={`${item.status}-${item.date}`} className="rounded-lg border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.status}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.comment}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-lg font-semibold">Rappels utiles</h2>
            <p className="text-sm text-muted-foreground">
              Profil complété: {application.profileCompletionPercent}%.
            </p>
            <p className="text-sm text-muted-foreground">Vehicule: {application.vehicleBrand} {application.vehicleTitle}</p>
            <p className="text-sm text-muted-foreground">Mode: {application.acquisitionType}</p>
            <Button asChild className="w-full">
              <Link to={`/app/files/${application.id}/upload`}>Voir les documents</Link>
            </Button>
            {['DRAFT', 'TO_COMPLETE'].includes(application.status) && (
              <Button className="w-full" onClick={() => void submitApplication()} disabled={isSubmitting}>
                {isSubmitting ? 'Soumission...' : 'Soumettre le dossier'}
              </Button>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link to="/app/files">Retour a la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
