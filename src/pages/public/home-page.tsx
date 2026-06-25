import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CatalogVehicleCard } from '@/components/shared/catalog-vehicle-card'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'
import { useAuth } from '@/lib/auth/auth-context'

function pickFeaturedVehicles(vehicles: VehicleResponse[]) {
  if (vehicles.length === 0) {
    return []
  }

  const uniqueVehicles = [...vehicles]
    .sort((left, right) => {
      const priceDiff = Number(left.price) - Number(right.price)
      if (priceDiff !== 0) {
        return priceDiff
      }
      return left.mileage - right.mileage
    })

  return uniqueVehicles.slice(0, 9)
}

export function HomePage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [brand, setBrand] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const depositPath = isAuthenticated ? '/app/files/new' : '/login'

  useEffect(() => {
    let cancelled = false

    async function loadVehicles() {
      try {
        setIsLoading(true)
        const response = await vehicleApi.listPublicVehicles()
        if (!cancelled) {
          setVehicles(response)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger le catalogue')
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

  const featuredVehicles = useMemo(() => pickFeaturedVehicles(vehicles), [vehicles])

  function handleSearch() {
    const params = new URLSearchParams()
    if (brand.trim()) {
      params.set('brand', brand.trim())
    }
    if (maxPrice.trim()) {
      params.set('maxPrice', maxPrice.trim())
    }

    navigate(`/vehicles${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-lg border bg-card p-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Achat et location de véhicules</p>
          <h1 className="text-3xl font-semibold">Trouvez votre prochain véhicule en quelques clics</h1>
          <p className="text-muted-foreground">
            Catalogue public, espace client, suivi de dossier et meilleures affaires du moment.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/vehicles">Voir le catalogue</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={depositPath}>Déposer un dossier</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="Marque"
            />
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Budget max"
              inputMode="numeric"
            />
            <Button className="h-9 md:col-span-2" onClick={handleSearch}>
              Rechercher
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Meilleures affaires du site</h2>
            <p className="text-sm text-muted-foreground">
              Une selection limitee a 9 vehicules, mise en avant selon le prix et le kilometrage.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/vehicles">Acceder au catalogue</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">Chargement...</div>
        ) : error ? (
          <ContentStateCard
            title="Catalogue temporairement indisponible"
            description="Le chargement des véhicules a échoué. Vous pouvez réessayer un peu plus tard."
            actionLabel="Voir le catalogue"
            onAction={() => navigate('/vehicles')}
          />
        ) : featuredVehicles.length === 0 ? (
          <ContentStateCard
            title="Aucun véhicule à afficher"
            description="Les meilleures affaires apparaitront ici dès qu'un véhicule sera disponible."
            actionLabel="Voir le catalogue"
            onAction={() => navigate('/vehicles')}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredVehicles.map((vehicle) => (
              <CatalogVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button asChild>
            <Link to="/vehicles">Voir tout le catalogue</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
