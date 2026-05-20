import { Link } from 'react-router-dom'
import { vehicles } from '@/lib/constants/mock-data'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VehicleCard } from '@/components/shared/vehicle-card'

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 rounded-lg border bg-card p-8 md:grid-cols-2">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Achat et location de vehicules</p>
          <h1 className="text-3xl font-semibold">Trouvez votre prochain vehicule en quelques clics</h1>
          <p className="text-muted-foreground">Catalogue verifie, accompagnement dossier, parcours simple.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link to="/vehicles">Voir les vehicules</Link></Button>
            <Button variant="outline" asChild><Link to="/login">Deposer un dossier</Link></Button>
          </div>
        </div>
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            <select className="h-9 rounded-md border bg-background px-3 text-sm"><option>Achat</option><option>Location</option></select>
            <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Marque" />
            <input className="h-9 rounded-md border bg-background px-3 text-sm" placeholder="Budget max" />
            <Button className="h-9">Rechercher</Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Vehicules mis en avant</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((v) => <VehicleCard key={v.id} {...v} />)}
        </div>
      </section>
    </div>
  )
}
