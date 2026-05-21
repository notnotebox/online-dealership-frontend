import { customerFiles } from '@/lib/constants/mock-data'

export function BackofficeDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard gestionnaire</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Dossiers en attente</p><p className="text-2xl font-semibold">{customerFiles.length}</p></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Dossiers incomplets</p><p className="text-2xl font-semibold">1</p></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Nouveaux vehicules</p><p className="text-2xl font-semibold">2</p></div>
        <div className="rounded-lg border p-4"><p className="text-sm text-muted-foreground">Alertes</p><p className="text-2xl font-semibold">1</p></div>
      </div>
    </div>
  )
}
