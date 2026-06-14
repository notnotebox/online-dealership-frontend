import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'

function formatPrice(price: string | number | null) {
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
  const { favorites, isReady, removeFavorite } = useAuth()

  if (!isReady) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Chargement des favoris...</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Favoris</h1>
        <p className="text-muted-foreground">Les vehicules enregistres depuis votre compte.</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Aucun vehicule en favori pour le moment.
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
                  <p className="text-sm text-muted-foreground">
                    {vehicle.energy} • {vehicle.mileage ?? 'N/A'} km
                  </p>
                  <p className="text-base font-semibold">{formatPrice(vehicle.price)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/vehicles/${vehicle.id}`}>Voir le detail</Link>
                  </Button>
                  <Button variant="outline" onClick={() => void removeFavorite(vehicle.id)}>
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
