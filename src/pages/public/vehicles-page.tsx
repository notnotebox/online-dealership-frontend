import { useMemo, useState } from 'react'
import { VehicleCard } from '@/components/shared/vehicle-card'
import { Button } from '@/components/ui/button'
import { vehicles } from '@/lib/constants/mock-data'
import type { VehicleMode } from '@/types/domain'

export function VehiclesPage() {
  const [mode, setMode] = useState<VehicleMode | 'all'>('all')

  const filtered = useMemo(() => vehicles.filter((v) => (mode === 'all' ? true : v.mode === mode)), [mode])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap items-end gap-3">
          <select value={mode} onChange={(e) => setMode(e.target.value as VehicleMode | 'all')} className="h-9 rounded-md border px-3 text-sm">
            <option value="all">Tous les modes</option>
            <option value="buy">Achat</option>
            <option value="rent">Location</option>
          </select>
          <input className="h-9 rounded-md border px-3 text-sm" placeholder="Marque" />
          <input className="h-9 rounded-md border px-3 text-sm" placeholder="Modele" />
          <Button variant="outline">Reinitialiser</Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} resultats</p>
        <select className="h-9 rounded-md border px-3 text-sm">
          <option>Pertinence</option><option>Prix croissant</option><option>Prix decroissant</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((v) => <VehicleCard key={v.id} {...v} />)}</div>
      ) : (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">Aucun vehicule trouve.</div>
      )}
    </div>
  )
}
