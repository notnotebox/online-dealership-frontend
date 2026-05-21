import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { vehicles } from '@/lib/constants/mock-data'

export function BackofficeVehiclesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicules</h1>
        <Button asChild><Link to="/backoffice/vehicles/new">Ajouter un vehicule</Link></Button>
      </div>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">Vehicule</th><th>Mode</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t"><td className="p-3">{v.brand} {v.model}</td><td>{v.mode}</td><td><Badge variant="outline">{v.status}</Badge></td><td><Link to={`/backoffice/vehicles/${v.id}/edit`} className="underline">Modifier</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
