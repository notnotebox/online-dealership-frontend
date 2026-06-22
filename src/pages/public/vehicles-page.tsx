import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { CatalogVehicleCard } from '@/components/shared/catalog-vehicle-card'
import { Button } from '@/components/ui/button'
import { vehicleApi, type VehicleEnergy, type VehicleResponse } from '@/lib/api/vehicle-api'

export function VehiclesPage() {
  const [searchParams] = useSearchParams()
  const [brand, setBrand] = useState(() => searchParams.get('brand') ?? '')
  const [energy, setEnergy] = useState<VehicleEnergy | 'all'>(() => {
    const value = searchParams.get('energy')
    return value ? (value as VehicleEnergy) : 'all'
  })
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') ?? '')
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadVehicles() {
      try {
        setIsLoading(true)
        const response = await vehicleApi.listPublicVehicles({
          brand: brand.trim() || undefined,
          energy: energy === 'all' ? undefined : energy,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        })

        if (!cancelled) {
          setVehicles(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le catalogue')
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
  }, [brand, energy, maxPrice])

  const resultLabel = useMemo(() => {
    if (isLoading) {
      return 'Chargement du catalogue...'
    }

    if (error) {
      return error
    }

    return `${vehicles.length} resultat${vehicles.length > 1 ? 's' : ''}`
  }, [error, isLoading, vehicles.length])

  function resetFilters() {
    setBrand('')
    setEnergy('all')
    setMaxPrice('')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            className="h-10 rounded-md border px-3 text-sm"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            placeholder="Marque"
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={energy}
            onChange={(event) => setEnergy(event.target.value as VehicleEnergy | 'all')}
          >
            <option value="all">Toutes les energies</option>
            <option value="GASOLINE">Essence</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRID">Hybride</option>
            <option value="ELECTRIC">Electrique</option>
            <option value="LPG">GPL</option>
            <option value="OTHER">Autre</option>
          </select>
          <input
            className="h-10 rounded-md border px-3 text-sm"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Budget max"
            inputMode="numeric"
          />
          <Button variant="outline" onClick={resetFilters}>
            Reinitialiser
          </Button>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{resultLabel}</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Chargement des vehicules...
        </div>
      ) : error ? (
        <ContentStateCard
          title="Catalogue indisponible"
          description="Le catalogue ne repond pas pour le moment. Reessayez dans un instant ou revenez depuis la page d accueil."
          actionLabel="Recharger"
          onAction={() => window.location.reload()}
        />
      ) : vehicles.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <CatalogVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <ContentStateCard
          title="Aucun vehicule disponible"
          description="Le catalogue est temporairement vide. Les nouveaux vehicules apparaîtront ici dès leur publication."
        />
      )}
    </div>
  )
}
