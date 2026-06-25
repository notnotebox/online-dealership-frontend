import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ApplicationStatusBadge, applicationStatusMap } from '@/components/shared/application-status-badge'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'
import type { VehicleApplication } from '@/lib/application/application-types'

function formatDate(value?: string | null) {
  if (!value) {
    return 'Non renseigné'
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

function formatPrice(value: string) {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) {
    return value
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericValue)
}

export function FileTrackingPage() {
  const { fileId } = useParams()
  const [application, setApplication] = useState<VehicleApplication | null>(null)
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
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
        const vehicleResponse = await vehicleApi.getPublicVehicle(response.vehicleId).catch(() => null)

        if (!cancelled) {
          setApplication(response)
          setVehicle(vehicleResponse)
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

    const items = [
      {
        key: 'created',
        title: 'Brouillon enregistré',
        date: application.createdAt,
        detail: 'Le dossier a été créé et reste modifiable.',
      },
    ]

    if (application.submittedAt) {
      items.push({
        key: 'submitted',
        title: 'Dossier soumis',
        date: application.submittedAt,
        detail: 'La demande a été transmise à l’équipe de gestion.',
      })
    }

    if (application.reviewedAt && application.status !== 'SUBMITTED' && application.status !== 'DRAFT') {
      items.push({
        key: 'reviewed',
        title: applicationStatusMap[application.status].label,
        date: application.reviewedAt,
        detail: application.internalComment?.trim() || applicationStatusMap[application.status].helper,
      })
    }

    return items
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
          <p className="text-sm text-muted-foreground">Aucune demande sélectionnée.</p>
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

          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Référence</p>
                <p className="font-medium">{application.id}</p>
              </div>
              <ApplicationStatusBadge status={application.status} />
            </div>

            <div className="grid gap-2 text-sm md:grid-cols-2">
              <p><span className="font-medium">Prix :</span> {formatPrice(application.vehiclePrice)}</p>
              <p><span className="font-medium">Mode :</span> {application.acquisitionType}</p>
              <p><span className="font-medium">Kilométrage :</span> {application.vehicleMileage.toLocaleString('fr-FR')} km</p>
              <p><span className="font-medium">Complétude du profil :</span> {application.profileCompletionPercent}%</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {application.status === 'DRAFT' ? (
                <>
                  <Button onClick={() => void submitApplication()} disabled={isSubmitting}>
                    {isSubmitting ? 'Soumission...' : 'Soumettre le dossier'}
                  </Button>
                  <Button asChild variant="outline">
                    <Link to={`/app/files/new/${application.vehicleId}`}>Modifier le brouillon</Link>
                  </Button>
                </>
              ) : null}
              <Button asChild variant="outline">
                <Link to="/app/files">Retour aux demandes</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="text-lg font-semibold">Historique</h2>
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.key} className="rounded-lg border px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-lg font-semibold">Rappels utiles</h2>
            <p className="text-sm text-muted-foreground">{applicationStatusMap[application.status].helper}</p>
            {application.internalComment ? (
              <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                <p className="font-medium">Commentaire interne transmis</p>
                <p className="mt-1 text-muted-foreground">{application.internalComment}</p>
              </div>
            ) : null}
            <Button asChild className="w-full">
              <Link to="/app/profile">Vérifier mon profil</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
