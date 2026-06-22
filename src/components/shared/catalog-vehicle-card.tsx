import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { VehicleImage } from '@/components/shared/vehicle-image'
import type { VehicleResponse } from '@/lib/api/vehicle-api'

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

type CatalogVehicleCardProps = {
  vehicle: VehicleResponse
}

export function CatalogVehicleCard({ vehicle }: CatalogVehicleCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden py-0">
      <CardHeader className="relative p-0">
        <div className="h-44 w-full overflow-hidden bg-muted">
          <VehicleImage
            brand={vehicle.brand}
            model={vehicle.title}
            seed={vehicle.id}
            src={vehicle.imageUrl ?? undefined}
            alt={`${vehicle.brand} ${vehicle.title}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="secondary">{vehicle.brand}</Badge>
          <Badge variant={vehicle.published ? 'default' : 'outline'}>
            {vehicle.published ? 'Publie' : 'Brouillon'}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton vehicleId={vehicle.id} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight">{vehicle.title}</h3>
          <p className="text-sm text-muted-foreground">{vehicle.energy}</p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <p className="text-lg font-semibold">{formatPrice(vehicle.price)}</p>
          <p className="text-sm text-muted-foreground">
            {vehicle.mileage.toLocaleString('fr-FR')} km
          </p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto p-4">
        <Button asChild className="w-full">
          <Link to={`/vehicles/${vehicle.id}`}>Voir le detail</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
