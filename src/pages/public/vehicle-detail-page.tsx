import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { VehicleImage } from '@/components/shared/vehicle-image'
import { useAuth } from '@/lib/auth/auth-context'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'

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

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const { isAuthenticated } = useAuth()
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadVehicle() {
      if (!vehicleId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await vehicleApi.getPublicVehicle(vehicleId)
        if (!cancelled) {
          setVehicle(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le vehicule')
          setVehicle(null)
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

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement du vehicule...</div>
  }

  if (error) {
    return <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
  }

  if (!vehicle) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Vehicule introuvable.</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="flex h-80 items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        <VehicleImage
          brand={vehicle.brand}
          model={vehicle.title}
          seed={vehicle.id}
          src={vehicle.imageUrl ?? undefined}
          alt={`${vehicle.brand} ${vehicle.title}`}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Catalogue public</Badge>
          <Badge variant={vehicle.published ? 'default' : 'outline'}>
            {vehicle.published ? 'Publie' : 'Brouillon'}
          </Badge>
          <FavoriteButton vehicleId={vehicle.id} />
        </div>
        <h1 className="text-3xl font-semibold">
          {vehicle.brand} {vehicle.title}
        </h1>
        <p className="text-xl font-semibold">{formatPrice(vehicle.price)}</p>
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="text-sm text-muted-foreground">Kilometrage: {vehicle.mileage.toLocaleString('fr-FR')} km</p>
            <p className="text-sm text-muted-foreground">Energie: {vehicle.energy}</p>
            <p className="text-sm text-muted-foreground">Places: {vehicle.seatCount}</p>
            <p className="text-sm text-muted-foreground">Portes: {vehicle.doorCount}</p>
            <p className="text-sm text-muted-foreground">Couleur: {vehicle.color}</p>
            <p className="text-sm text-muted-foreground">Mis a jour le: {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(vehicle.updatedAt))}</p>
            <p className="text-sm text-muted-foreground">{vehicle.published ? 'Vehicule publie' : 'Vehicule non publie'}</p>
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
