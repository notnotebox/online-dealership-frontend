import { Card, CardContent } from '@/components/ui/card'
import { CatalogVehicleCard } from '@/components/shared/catalog-vehicle-card'
import { ContentStateCard } from '@/components/shared/content-state-card'
import { useAuth } from '@/lib/auth/auth-context'

export function ClientFavoritesPage() {
  const { favorites, isReady } = useAuth()

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
        <ContentStateCard
          title="Aucun favori pour le moment"
          description="Les vehicules que vous enregistrez apparaissent ici pour un acces rapide."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((vehicle) => (
            <CatalogVehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  )
}
