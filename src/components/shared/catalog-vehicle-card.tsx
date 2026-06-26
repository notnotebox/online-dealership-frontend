import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { VehicleImage } from '@/components/shared/vehicle-image'

type CatalogVehicle = {
  id: string
  title: string
  brand: string
  price: string | number | null
  energy: string
  mileage: number | null
  seatCount?: number
  doorCount?: number
  color?: string
  commercialType?: 'UNSPECIFIED' | 'PURCHASE' | 'LEASE'
  published: boolean
  imageUrl?: string | null
}

function formatPrice(price: CatalogVehicle['price'], commercialType?: CatalogVehicle['commercialType']) {
  const numericPrice = Number(price)
  if (Number.isNaN(numericPrice)) {
    if (price == null) {
      return 'Sur demande'
    }
    return commercialType === 'LEASE' ? `${price} EUR/mois` : `${price} EUR`
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericPrice)

  return commercialType === 'LEASE' ? `${formatted}/mois` : formatted
}

function commercialTypeLabel(type?: 'UNSPECIFIED' | 'PURCHASE' | 'LEASE') {
  if (type === 'LEASE') {
    return 'Location'
  }
  if (type === 'PURCHASE') {
    return 'Achat'
  }
  return 'A definir'
}

function commercialTypeBadgeClassName(type?: 'UNSPECIFIED' | 'PURCHASE' | 'LEASE') {
  if (type === 'LEASE') {
    return 'border-sky-200 bg-sky-100 text-sky-900'
  }
  if (type === 'PURCHASE') {
    return 'border-emerald-200 bg-emerald-100 text-emerald-900'
  }
  return 'border-slate-200 bg-slate-100 text-slate-800'
}

type CatalogVehicleCardProps = {
  vehicle: CatalogVehicle
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
          <Badge variant="outline" className={commercialTypeBadgeClassName(vehicle.commercialType)}>
            {commercialTypeLabel(vehicle.commercialType)}
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
          {vehicle.seatCount != null && vehicle.doorCount != null && vehicle.color && (
            <p className="text-xs text-muted-foreground">
              {vehicle.seatCount} places - {vehicle.doorCount} portes - {vehicle.color}
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-2">
          <p className="text-lg font-semibold">{formatPrice(vehicle.price, vehicle.commercialType)}</p>
          <p className="text-sm text-muted-foreground">
            {vehicle.mileage == null ? 'Kilometrage non renseigne' : `${vehicle.mileage.toLocaleString('fr-FR')} km`}
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
