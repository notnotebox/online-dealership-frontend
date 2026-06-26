import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Clock3, History } from 'lucide-react'
import { VehicleGallery } from '@/components/shared/vehicle-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVehicleGalleryItems } from '@/hooks/use-vehicle-gallery-items'
import { vehicleApi, type AdminVehicleResponse, type VehicleHistoryResponse, type VehicleMediaResponse } from '@/lib/api/vehicle-api'

function formatPrice(price: AdminVehicleResponse['price'], commercialType: AdminVehicleResponse['commercialType']) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) {
    return commercialType === 'LEASE' ? `${price} EUR/mois` : `${price} EUR`
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericPrice)

  return commercialType === 'LEASE' ? `${formatted}/mois` : formatted
}

function getVisibilityLabel(vehicle: AdminVehicleResponse) {
  if (vehicle.archived) {
    return 'Archivé'
  }

  return vehicle.published ? 'Visible' : 'Masqué'
}

export function BackofficeVehiclePreviewPage() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const [vehicle, setVehicle] = useState<AdminVehicleResponse | null>(null)
  const [media, setMedia] = useState<VehicleMediaResponse[]>([])
  const [history, setHistory] = useState<VehicleHistoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items: galleryItems, error: galleryError } = useVehicleGalleryItems(media, {
    requiresAuth: true,
    altPrefix: 'Aperçu interne',
    labelPrefix: 'Vue',
  })

  useEffect(() => {
    let cancelled = false

    async function loadPreview() {
      if (!vehicleId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [vehicleResponse, mediaResponse] = await Promise.all([
          vehicleApi.getAdminVehicle(vehicleId),
          vehicleApi.listAdminVehicleMedia(vehicleId),
        ])
        const historyResponse = await vehicleApi.listAdminVehicleHistory(vehicleId)

        if (cancelled) {
          return
        }

        setVehicle(vehicleResponse)
        setMedia(mediaResponse)
        setHistory(historyResponse)
        setError(null)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le véhicule')
          setVehicle(null)
          setMedia([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
    }
  }, [vehicleId])

  useEffect(() => {
    if (galleryError) {
      setError(galleryError)
    }
  }, [galleryError])

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement de l&apos;aperçu...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
  }

  if (!vehicle) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Véhicule introuvable.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aperçu interne</p>
          <h1 className="text-3xl font-semibold">
            {vehicle.brand} {vehicle.title}
          </h1>
          <p className="text-sm text-muted-foreground">Prévisualisation back-office du véhicule avant publication.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
          <Button asChild>
            <Link to={`/backoffice/vehicles/${vehicle.id}/edit`}>Modifier</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <VehicleGallery
              items={galleryItems}
              imageClassName="min-h-[22rem]"
              emptyContent={
                <div className="flex min-h-[22rem] items-center justify-center px-6 text-sm text-muted-foreground">
                  Aucun média principal
                </div>
              }
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{vehicle.brand}</Badge>
                <Badge variant={vehicle.archived ? 'secondary' : vehicle.published ? 'default' : 'outline'}>
                  {getVisibilityLabel(vehicle)}
                </Badge>
              </div>
              <p className="text-lg font-semibold">{formatPrice(vehicle.price, vehicle.commercialType)}</p>
              <p className="text-sm text-muted-foreground">{vehicle.energy} - {vehicle.mileage.toLocaleString('fr-FR')} km</p>
              <p className="text-sm text-muted-foreground">Places: {vehicle.seatCount} | Portes: {vehicle.doorCount}</p>
              <p className="text-sm text-muted-foreground">Couleur : {vehicle.color}</p>
              <p className="text-sm text-muted-foreground">
                Mise à jour : {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(vehicle.updatedAt))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Galerie</h2>
              {media.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun média chargé.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {media.map((item) => (
                    <div key={item.id} className="rounded-md border px-3 py-2">
                      <p className="font-medium">Image #{item.sortOrder + 1}</p>
                      <p className="break-all text-muted-foreground">{item.downloadUrl}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Historique du véhicule</h2>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune action enregistrée pour le moment.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((entry) => (
                    <div key={entry.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-medium">{entry.summary}</p>
                          {entry.details ? (
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                          ) : null}
                        </div>
                        <Badge variant="outline">{formatActionLabel(entry.action)}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{formatDateTime(entry.createdAt)}</span>
                        {entry.createdByUserId ? <span>· {entry.createdByUserId}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatActionLabel(action: VehicleHistoryResponse['action']) {
  switch (action) {
    case 'CREATED':
      return 'Création'
    case 'UPDATED':
      return 'Modification'
    case 'PUBLISHED':
      return 'Publication'
    case 'UNPUBLISHED':
      return 'Masquage'
    case 'ARCHIVED':
      return 'Archivage'
    case 'RESTORED':
      return 'Restauration'
    case 'DELETED':
      return 'Retrait'
    case 'MEDIA_ADDED':
      return 'Média'
    default:
      return action
  }
}
