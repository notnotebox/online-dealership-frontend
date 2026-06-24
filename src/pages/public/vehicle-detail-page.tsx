import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarClock, CarFront, DoorOpen, Fuel, Gauge, Palette, Sofa } from 'lucide-react'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { VehicleGallery } from '@/components/shared/vehicle-gallery'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useVehicleGalleryItems } from '@/hooks/use-vehicle-gallery-items'
import { useAuth } from '@/lib/auth/auth-context'
import { vehicleApi, type VehicleEnergy, type VehicleMediaResponse, type VehicleResponse } from '@/lib/api/vehicle-api'

function formatPrice(price: VehicleResponse['price']) {
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

function getEnergyLabel(energy: VehicleEnergy) {
  switch (energy) {
    case 'GASOLINE':
      return 'Essence'
    case 'DIESEL':
      return 'Diesel'
    case 'HYBRID':
      return 'Hybride'
    case 'ELECTRIC':
      return 'Electrique'
    case 'LPG':
      return 'GPL'
    default:
      return 'Autre'
  }
}

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const { isAuthenticated } = useAuth()
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [media, setMedia] = useState<VehicleMediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { items: galleryItems, error: galleryError } = useVehicleGalleryItems(media, {
    altPrefix: 'Photo vehicule',
    labelPrefix: 'Photo',
  })

  useEffect(() => {
    let cancelled = false

    async function loadVehicle() {
      if (!vehicleId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [vehicleResponse, mediaResponse] = await Promise.all([
          vehicleApi.getPublicVehicle(vehicleId),
          vehicleApi.listPublicVehicleMedia(vehicleId),
        ])

        if (!cancelled) {
          setVehicle(vehicleResponse)
          setMedia(mediaResponse)
          setError(null)
        }
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

    void loadVehicle()

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
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du vehicule...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
  }

  if (!vehicle) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Vehicule introuvable.</div>
  }

  const specifications = [
    {
      label: 'Kilometrage',
      value: `${vehicle.mileage.toLocaleString('fr-FR')} km`,
      icon: Gauge,
    },
    {
      label: 'Energie',
      value: getEnergyLabel(vehicle.energy),
      icon: Fuel,
    },
    {
      label: 'Places',
      value: `${vehicle.seatCount}`,
      icon: Sofa,
    },
    {
      label: 'Portes',
      value: `${vehicle.doorCount}`,
      icon: DoorOpen,
    },
    {
      label: 'Couleur',
      value: vehicle.color,
      icon: Palette,
    },
    {
      label: 'Mis a jour',
      value: new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(vehicle.updatedAt)),
      icon: CalendarClock,
    },
  ]

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="overflow-hidden rounded-2xl border bg-muted/30 shadow-sm">
        {galleryItems.length > 0 ? (
          <div className="p-4">
            <VehicleGallery items={galleryItems} imageClassName="min-h-[24rem]" />
          </div>
        ) : (
          <VehicleImage
            brand={vehicle.brand}
            model={vehicle.title}
            seed={vehicle.id}
            src={vehicle.imageUrl ?? undefined}
            alt={`${vehicle.brand} ${vehicle.title}`}
            className="h-full min-h-[24rem] w-full object-cover"
          />
        )}
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <CarFront className="h-3.5 w-3.5" />
                Catalogue
              </Badge>
              <Badge variant={vehicle.published ? 'default' : 'outline'}>
                {vehicle.published ? 'Publie' : 'Brouillon'}
              </Badge>
            </div>
            <FavoriteButton vehicleId={vehicle.id} />
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{vehicle.brand}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{vehicle.title}</h1>
            <p className="text-2xl font-semibold">{formatPrice(vehicle.price)}</p>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Fiche vehicule claire et prete pour une demande de financement ou d&apos;achat.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Details du vehicule</h2>
                <p className="text-sm text-muted-foreground">Informations essentielles presentees de maniere lisible.</p>
              </div>
              <Badge variant="outline">
                {vehicle.published ? 'Vehicule publie' : 'Vehicule non publie'}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {specifications.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={isAuthenticated ? `/app/files/new/${vehicle.id}` : '/login'}>Creer ma demande</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link to="/vehicles">Retour au catalogue</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
