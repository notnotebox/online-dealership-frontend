import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function BackofficeFileDetailPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Detail dossier</h1>
      <Card><CardContent className="space-y-2 p-4"><p>Client: John Doe</p><p>Vehicule: Peugeot 3008</p><p>Documents: 2/3</p></CardContent></Card>
      <Card><CardContent className="space-y-3 p-4"><h2 className="font-medium">Traitement</h2><textarea className="min-h-24 w-full rounded border px-3 py-2" placeholder="Commentaire interne" /><div className="flex gap-2"><Button>Valider</Button><Button variant="destructive">Refuser</Button><Button variant="outline">Demander complement</Button></div></CardContent></Card>
    </div>
  )
}
