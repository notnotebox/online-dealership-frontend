import { Link, useParams } from 'react-router-dom'
import { VehicleSpecsRow } from '@/components/shared/vehicle-specs-row'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { vehicles } from '@/lib/constants/mock-data'

export function VehicleDetailPage() {
  const { vehicleId } = useParams()
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0]

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <img src={vehicle.images[0]} alt={`${vehicle.brand} ${vehicle.model}`} className="h-80 w-full rounded-lg border object-cover" />
      <div className="space-y-4">
        <Badge variant="secondary">{vehicle.mode === 'buy' ? 'Achat' : 'Location'}</Badge>
        <h1 className="text-3xl font-semibold">{vehicle.brand} {vehicle.model}</h1>
        <p className="text-xl font-semibold">{vehicle.mode === 'buy' ? `${vehicle.price} EUR` : `${vehicle.monthlyPrice} EUR/mois`}</p>
        <VehicleSpecsRow mileage={vehicle.mileage} fuel={vehicle.fuel} transmission={vehicle.transmission} seats={vehicle.seats} doors={vehicle.doors} />
        <Card><CardContent className="space-y-3 p-4"><p>{vehicle.description}</p><p className="text-sm text-muted-foreground">Equipements: {vehicle.equipments?.join(', ')}</p></CardContent></Card>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/login">Creer mon dossier</Link></Button>
          <Button variant="secondary">Ajouter aux favoris</Button>
        </div>
      </div>
    </div>
  )
}
