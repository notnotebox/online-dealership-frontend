import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { vehicleApi, type AdminVehicleResponse } from '@/lib/api/vehicle-api'

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

export function BackofficeVehiclesPage() {
  const [vehicles, setVehicles] = useState<AdminVehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadVehicles() {
      try {
        setIsLoading(true)
        const response = await vehicleApi.listAdminVehicles()
        if (!cancelled) {
          setVehicles(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les vehicules')
          setVehicles([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadVehicles()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Vehicules</h1>
          <p className="text-sm text-muted-foreground">Pilotage du catalogue et des medias associes.</p>
        </div>
        <Button asChild>
          <Link to="/backoffice/vehicles/new">Ajouter un vehicule</Link>
        </Button>
      </div>

      {isLoading && <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement...</div>}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && vehicles.length === 0 && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Aucun vehicule enregistre.</div>
      )}

      {!isLoading && !error && vehicles.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Vehicule</th>
                <th>Prix</th>
                <th>Statut</th>
                <th>Archive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{vehicle.brand} {vehicle.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {vehicle.energy} - {vehicle.mileage.toLocaleString('fr-FR')} km
                    </div>
                  </td>
                  <td>{formatPrice(vehicle.price)}</td>
                  <td>
                    <Badge variant={vehicle.published ? 'default' : 'outline'}>
                      {vehicle.published ? 'Publie' : 'Brouillon'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={vehicle.archived ? 'secondary' : 'outline'}>
                      {vehicle.archived ? 'Archive' : 'Actif'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Link className="font-medium underline" to={`/backoffice/vehicles/${vehicle.id}/edit`}>
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
