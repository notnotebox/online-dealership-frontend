import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { vehicleApi, type AdminVehicleResponse, type VehicleCommercialType, type VehicleEnergy } from '@/lib/api/vehicle-api'

type VehicleStatusFilter = 'ALL' | 'VISIBLE' | 'HIDDEN' | 'ARCHIVED'

function getVehicleStatusLabel(vehicle: AdminVehicleResponse) {
  if (vehicle.archived) {
    return 'Archivé'
  }

  return vehicle.published ? 'Visible' : 'Masqué'
}

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

function getCommercialTypeLabel(type: VehicleCommercialType) {
  return type === 'LEASE' ? 'Location' : 'Achat'
}

export function BackofficeVehiclesPage() {
  const [vehicles, setVehicles] = useState<AdminVehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VehicleStatusFilter>('ALL')
  const [energyFilter, setEnergyFilter] = useState<VehicleEnergy | 'ALL'>('ALL')
  const [commercialTypeFilter, setCommercialTypeFilter] = useState<VehicleCommercialType | 'ALL'>('ALL')
  const [isActionLoading, setIsActionLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadFilteredVehicles() {
      try {
        setIsLoading(true)
        const response = await vehicleApi.listAdminVehicles({
          query: search.trim() || undefined,
          status: statusFilter,
          energy: energyFilter === 'ALL' ? undefined : energyFilter,
          commercialType: commercialTypeFilter === 'ALL' ? undefined : commercialTypeFilter,
        })

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

    void loadFilteredVehicles()

    return () => {
      cancelled = true
    }
  }, [commercialTypeFilter, energyFilter, search, statusFilter])

  async function refreshVehicles() {
    const response = await vehicleApi.listAdminVehicles({
      query: search.trim() || undefined,
      status: statusFilter,
      energy: energyFilter === 'ALL' ? undefined : energyFilter,
      commercialType: commercialTypeFilter === 'ALL' ? undefined : commercialTypeFilter,
    })
    setVehicles(response)
  }

  async function handleAction(action: () => Promise<AdminVehicleResponse>, confirmationMessage: string) {
    if (!window.confirm(confirmationMessage)) {
      return
    }

    try {
      setIsActionLoading(true)
      await action()
      await refreshVehicles()
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Action impossible')
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Véhicules</h1>
          <p className="text-sm text-muted-foreground">Pilotage du catalogue, des statuts et des aperçus internes.</p>
        </div>
        <Button asChild>
          <Link to="/backoffice/vehicles/new">Ajouter un vehicule</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Recherche</span>
            <input
              className="h-10 w-full rounded-md border px-3"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Marque, modele, couleur..."
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Catalogue</span>
            <select className="h-10 w-full rounded-md border px-3" value={commercialTypeFilter} onChange={(event) => setCommercialTypeFilter(event.target.value as VehicleCommercialType | 'ALL')}>
              <option value="ALL">Tous</option>
              <option value="PURCHASE">Achat</option>
              <option value="LEASE">Location</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Statut</span>
            <select className="h-10 w-full rounded-md border px-3" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as VehicleStatusFilter)}>
              <option value="ALL">Tous</option>
              <option value="VISIBLE">Visibles</option>
              <option value="HIDDEN">Masqués</option>
              <option value="ARCHIVED">Archivés</option>
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Energie</span>
            <select className="h-10 w-full rounded-md border px-3" value={energyFilter} onChange={(event) => setEnergyFilter(event.target.value as VehicleEnergy | 'ALL')}>
              <option value="ALL">Toutes</option>
              <option value="GASOLINE">GASOLINE</option>
              <option value="DIESEL">DIESEL</option>
              <option value="HYBRID">HYBRID</option>
              <option value="ELECTRIC">ELECTRIC</option>
              <option value="LPG">LPG</option>
              <option value="OTHER">OTHER</option>
            </select>
          </label>
        </CardContent>
      </Card>

      {isLoading && <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement...</div>}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!isLoading && !error && vehicles.length === 0 && (
        <div className="rounded-lg border p-4 text-sm text-muted-foreground">Aucun vehicule ne correspond aux filtres.</div>
      )}

      {!isLoading && !error && vehicles.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Vehicule</th>
                <th className="p-3">Prix</th>
                <th className="p-3">Etat</th>
                <th className="p-3">Actions</th>
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
                    <div className="text-xs text-muted-foreground">
                      {vehicle.seatCount} places - {vehicle.doorCount} portes - {vehicle.color}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">{getCommercialTypeLabel(vehicle.commercialType)}</Badge>
                      <Badge variant="secondary">{vehicle.imageUrl ? 'Media disponible' : 'Sans media'}</Badge>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(vehicle.price)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={vehicle.archived ? 'secondary' : vehicle.published ? 'default' : 'outline'}>
                        {getVehicleStatusLabel(vehicle)}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/backoffice/vehicles/${vehicle.id}/preview`}>Apercu</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/backoffice/vehicles/${vehicle.id}/edit`}>Modifier</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isActionLoading}
                        onClick={() => void handleAction(
                          () => (vehicle.published && !vehicle.archived
                            ? vehicleApi.unpublishAdminVehicle(vehicle.id)
                            : vehicleApi.publishAdminVehicle(vehicle.id)),
                          vehicle.published && !vehicle.archived
                            ? 'Masquer ce vehicule ?'
                            : 'Rendre ce vehicule visible ?',
                        )}
                      >
                        {vehicle.published && !vehicle.archived ? 'Masquer' : 'Afficher'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isActionLoading}
                        onClick={() => void handleAction(
                          () => (vehicle.archived
                            ? vehicleApi.unarchiveAdminVehicle(vehicle.id)
                            : vehicleApi.archiveAdminVehicle(vehicle.id)),
                          vehicle.archived
                            ? 'Restaurer ce vehicule ?'
                            : 'Archiver ce vehicule ?',
                        )}
                      >
                        {vehicle.archived ? 'Restaurer' : 'Archiver'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isActionLoading}
                        onClick={() => void handleAction(
                          () => vehicleApi.deleteAdminVehicle(vehicle.id),
                          'Supprimer ce vehicule ? Cette action le masque du public et l archive.',
                        )}
                      >
                        Supprimer
                      </Button>
                    </div>
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
