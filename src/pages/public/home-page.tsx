import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { CatalogVehicleCard } from '@/components/shared/catalog-vehicle-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'
import { vehicleApi, type VehicleResponse } from '@/lib/api/vehicle-api'

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
          setVehicles(response.slice(0, 3))
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les vehicules mis en avant')
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
          <p className="text-sm text-muted-foreground">Achat et location de vehicules</p>
          <h1 className="text-3xl font-semibold">Trouvez votre prochain vehicule en quelques clics</h1>
          <p className="text-muted-foreground">Catalogue public, dossiers clients et favoris enregistrables.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/vehicles">Voir les vehicules</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={depositPath}>Deposer un dossier</Link>
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
        <h2 className="text-2xl font-semibold">Vehicules mis en avant</h2>
        {isLoading ? (
          <div className="rounded-lg border p-6 text-sm text-muted-foreground">Chargement...</div>
        ) : error ? (
          <ContentStateCard
            title="Vehicules momentanement indisponibles"
            description="Le catalogue n est pas accessible pour le moment. Revenez un peu plus tard pour consulter les offres."
            actionLabel="Voir le catalogue"
            onAction={() => navigate('/vehicles')}
          />
        ) : vehicles.length === 0 ? (
          <ContentStateCard
            title="Aucun vehicule en avant"
            description="Les trois derniers vehicules publiés apparaîtront ici automatiquement."
            actionLabel="Voir le catalogue"
            onAction={() => navigate('/vehicles')}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <CatalogVehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
