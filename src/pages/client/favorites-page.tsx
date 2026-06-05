import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '@/lib/api/auth-api'
import type { FavoriteVehicle } from '@/lib/auth/auth-types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

function formatPrice(price: FavoriteVehicle['price']) {
  if (price == null || price === '') {
    return 'Sur demande'
  }

  const numericPrice = typeof price === 'number' ? price : Number(price)
  if (Number.isNaN(numericPrice)) {
    return String(price)
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

export function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadFavorites() {
      try {
        setIsLoading(true)
        const response = await authApi.favorites()
        if (!cancelled) {
          setFavorites(response.favorites)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les favoris')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadFavorites()

    return () => {
      cancelled = true
    }
  }, [])

  const emptyState = useMemo(() => {
    if (isLoading) {
      return 'Chargement des favoris...'
    }

    if (error) {
      return error
    }

    return 'Aucun vehicule en favori pour le moment.'
  }, [error, isLoading])

  async function handleRemoveFavorite(vehicleId: string) {
    try {
      const response = await authApi.removeFavorite(vehicleId)
      setFavorites(response.favorites)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossible de retirer ce favori')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Favoris</h1>
        <p className="text-muted-foreground">Les vehicules enregistrés depuis votre compte.</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            {emptyState}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{vehicle.brand}</p>
                  <h2 className="text-lg font-semibold">{vehicle.title}</h2>
                  <p className="text-sm text-muted-foreground">{vehicle.energy} • {vehicle.mileage ?? 'N/A'} km</p>
                  <p className="text-base font-semibold">{formatPrice(vehicle.price)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/vehicles/${vehicle.id}`}>Voir le detail</Link>
                  </Button>
                  <Button variant="outline" onClick={() => void handleRemoveFavorite(vehicle.id)}>
                    Retirer
                  </Button>
                </div>

                {!vehicle.published && (
                  <p className="text-xs text-muted-foreground">Vehicule non publie actuellement.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
