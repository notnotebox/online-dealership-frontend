import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { VehicleGallery } from '@/components/shared/vehicle-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVehicleGalleryItems } from '@/hooks/use-vehicle-gallery-items'
import { vehicleApi, type AdminVehicleResponse, type VehicleMediaResponse } from '@/lib/api/vehicle-api'

function formatPrice(price: AdminVehicleResponse['price']) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) {
    return `${price} EUR`
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

function getVisibilityLabel(vehicle: AdminVehicleResponse) {
  if (vehicle.archived) {
    return 'Archive'
  }

  return vehicle.published ? 'Visible' : 'Masque'
}

export function BackofficeVehiclePreviewPage() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const [vehicle, setVehicle] = useState<AdminVehicleResponse | null>(null)
  const [media, setMedia] = useState<VehicleMediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items: galleryItems, error: galleryError } = useVehicleGalleryItems(media, {
    requiresAuth: true,
    altPrefix: 'Apercu interne',
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

        if (cancelled) {
          return
        }

        setVehicle(vehicleResponse)
        setMedia(mediaResponse)
        setError(null)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le vehicule')
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
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement de l&apos;apercu...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
  }

  if (!vehicle) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Vehicule introuvable.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Apercu interne</p>
          <h1 className="text-3xl font-semibold">
            {vehicle.brand} {vehicle.title}
          </h1>
          <p className="text-sm text-muted-foreground">Previsualisation back-office du vehicule avant publication.</p>
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
                  Aucun media principal
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
              <p className="text-lg font-semibold">{formatPrice(vehicle.price)}</p>
              <p className="text-sm text-muted-foreground">{vehicle.energy} - {vehicle.mileage.toLocaleString('fr-FR')} km</p>
              <p className="text-sm text-muted-foreground">Places: {vehicle.seatCount} | Portes: {vehicle.doorCount}</p>
              <p className="text-sm text-muted-foreground">Couleur: {vehicle.color}</p>
              <p className="text-sm text-muted-foreground">
                Mise a jour: {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(vehicle.updatedAt))}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Galerie</h2>
              {media.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun media charge.</p>
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
        </div>
      </div>
    </div>
  )
}
