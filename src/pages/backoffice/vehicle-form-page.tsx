import { Button } from '@/components/ui/button'

export function BackofficeVehicleFormPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Creation / edition vehicule</h1>
      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <input className="h-10 rounded border px-3" placeholder="Marque" />
        <input className="h-10 rounded border px-3" placeholder="Modele" />
        <input className="h-10 rounded border px-3" placeholder="Annee" />
        <input className="h-10 rounded border px-3" placeholder="Kilometrage" />
        <input className="h-10 rounded border px-3" placeholder="Prix achat" />
        <input className="h-10 rounded border px-3" placeholder="Mensualite location" />
        <textarea className="min-h-28 rounded border px-3 py-2 md:col-span-2" placeholder="Description" />
      </div>
      <Button>Enregistrer</Button>
    </div>
  )
}
