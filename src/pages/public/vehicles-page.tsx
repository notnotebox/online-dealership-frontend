import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { CatalogVehicleCard } from '@/components/shared/catalog-vehicle-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  vehicleApi,
  type VehicleCatalogSort,
  type VehicleCommercialType,
  type VehicleEnergy,
  type VehicleResponse,
} from '@/lib/api/vehicle-api'

const SORT_OPTIONS: Array<{ value: VehicleCatalogSort; label: string }> = [
  { value: 'UPDATED_DESC', label: 'Plus recents' },
  { value: 'PRICE_ASC', label: 'Prix croissant' },
  { value: 'PRICE_DESC', label: 'Prix decroissant' },
  { value: 'MILEAGE_ASC', label: 'Moins de kilometres' },
  { value: 'MILEAGE_DESC', label: 'Plus de kilometres' },
]

function getCommercialTypeLabel(type: VehicleCommercialType) {
  if (type === 'LEASE') {
    return 'Location'
  }
  if (type === 'PURCHASE') {
    return 'Achat'
  }
  return 'A definir'
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

function splitQueryTokens(query: string) {
  return query
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
}

export function VehiclesPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('query') ?? '')
  const [commercialType, setCommercialType] = useState<VehicleCommercialType>(() => {
    const value = searchParams.get('commercialType')
    return value === 'LEASE' ? 'LEASE' : 'PURCHASE'
  })
  const [energy, setEnergy] = useState<VehicleEnergy | 'ALL'>(() => {
    const value = searchParams.get('energy')
    return value ? (value as VehicleEnergy) : 'ALL'
  })
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get('maxPrice') ?? '')
  const [maxMileage, setMaxMileage] = useState(() => searchParams.get('maxMileage') ?? '')
  const [seatCount, setSeatCount] = useState(() => searchParams.get('seatCount') ?? '')
  const [doorCount, setDoorCount] = useState(() => searchParams.get('doorCount') ?? '')
  const [color, setColor] = useState(() => searchParams.get('color') ?? '')
  const [sort, setSort] = useState<VehicleCatalogSort>(() => {
    const value = searchParams.get('sort')
    return SORT_OPTIONS.some((option) => option.value === value) ? (value as VehicleCatalogSort) : 'UPDATED_DESC'
  })
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadVehicles() {
      try {
        setIsLoading(true)
        const response = await vehicleApi.listPublicVehicles({
          query: query.trim() || undefined,
          commercialType,
          energy: energy === 'ALL' ? undefined : energy,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          maxMileage: maxMileage ? Number(maxMileage) : undefined,
          seatCount: seatCount ? Number(seatCount) : undefined,
          doorCount: doorCount ? Number(doorCount) : undefined,
          color: color.trim() || undefined,
          sort,
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
  }, [color, commercialType, doorCount, energy, maxMileage, maxPrice, query, seatCount, sort])

  const activeBadges = useMemo(() => {
    const badges: string[] = [getCommercialTypeLabel(commercialType)]
    splitQueryTokens(query).forEach((token) => badges.push(token))
    if (energy !== 'ALL') badges.push(getEnergyLabel(energy))
    if (maxPrice) badges.push(`Budget ${maxPrice} EUR max`)
    if (maxMileage) badges.push(`${maxMileage} km max`)
    if (seatCount) badges.push(`${seatCount}+ places`)
    if (doorCount) badges.push(`${doorCount}+ portes`)
    if (color.trim()) badges.push(color.trim())
    return badges
  }, [color, commercialType, doorCount, energy, maxMileage, maxPrice, query, seatCount])

  function resetFilters() {
    setQuery('')
    setCommercialType('PURCHASE')
    setEnergy('ALL')
    setMaxPrice('')
    setMaxMileage('')
    setSeatCount('')
    setDoorCount('')
    setColor('')
    setSort('UPDATED_DESC')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Catalogue</h1>
            <p className="text-sm text-muted-foreground">
              Commencez par choisir un univers, puis affinez la recherche avec une seule barre et des filtres utiles.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={commercialType === 'PURCHASE' ? 'default' : 'outline'}
              onClick={() => setCommercialType('PURCHASE')}
            >
              Achat
            </Button>
            <Button
              type="button"
              variant={commercialType === 'LEASE' ? 'default' : 'outline'}
              onClick={() => setCommercialType('LEASE')}
            >
              Location
            </Button>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr]">
            <input
              className="h-11 rounded-md border px-3 text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Marque, modele, couleur... utilisez des virgules pour plusieurs termes"
            />
            <select
              className="h-11 rounded-md border px-3 text-sm"
              value={energy}
              onChange={(event) => setEnergy(event.target.value as VehicleEnergy | 'ALL')}
            >
              <option value="ALL">Toutes les energies</option>
              <option value="GASOLINE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybride</option>
              <option value="ELECTRIC">Electrique</option>
              <option value="LPG">GPL</option>
              <option value="OTHER">Autre</option>
            </select>
            <input
              className="h-11 rounded-md border px-3 text-sm"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Budget max"
              inputMode="numeric"
            />
            <select
              className="h-11 rounded-md border px-3 text-sm"
              value={sort}
              onChange={(event) => setSort(event.target.value as VehicleCatalogSort)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="h-10 rounded-md border px-3 text-sm"
              value={maxMileage}
              onChange={(event) => setMaxMileage(event.target.value)}
              placeholder="Kilometrage max"
              inputMode="numeric"
            />
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={seatCount}
              onChange={(event) => setSeatCount(event.target.value)}
            >
              <option value="">Places</option>
              <option value="2">2+ places</option>
              <option value="4">4+ places</option>
              <option value="5">5+ places</option>
              <option value="7">7+ places</option>
            </select>
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={doorCount}
              onChange={(event) => setDoorCount(event.target.value)}
            >
              <option value="">Portes</option>
              <option value="2">2+ portes</option>
              <option value="3">3+ portes</option>
              <option value="4">4+ portes</option>
              <option value="5">5+ portes</option>
            </select>
            <input
              className="h-10 rounded-md border px-3 text-sm"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Couleur"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {activeBadges.map((badge) => (
                <Badge key={badge} variant="secondary">{badge}</Badge>
              ))}
            </div>
            <Button variant="outline" onClick={resetFilters}>
              Reinitialiser
            </Button>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Chargement du catalogue...' : `${vehicles.length} vehicule${vehicles.length > 1 ? 's' : ''} disponible${vehicles.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
          Chargement des vehicules...
        </div>
      ) : error ? (
        <ContentStateCard
          title="Catalogue indisponible"
          description="Le catalogue ne repond pas pour le moment. Reessayez dans un instant."
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
          title="Aucun vehicule ne correspond a cette recherche"
          description="Essayez une autre combinaison de filtres ou revenez a une recherche plus large."
          actionLabel="Effacer les filtres"
          onAction={resetFilters}
        />
      )}
    </div>
  )
}
