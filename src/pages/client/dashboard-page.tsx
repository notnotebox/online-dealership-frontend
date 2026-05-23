import { Link } from 'react-router-dom'
import { FileStatusBadge, fileStatusMap } from '@/components/shared/file-status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { customerFiles } from '@/lib/constants/mock-data'

export function ClientDashboardPage() {
  const totalFiles = customerFiles.length
  const inProgressCount = customerFiles.filter((f) => ['draft', 'submitted', 'reviewing', 'missing-documents'].includes(f.status)).length
  const approvedCount = customerFiles.filter((f) => f.status === 'approved').length
  const rejectedCount = customerFiles.filter((f) => f.status === 'rejected').length
  const activeFile = customerFiles[0]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tableau de bord</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Total dossiers</p>
            <p className="text-2xl font-semibold">{totalFiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-2xl font-semibold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Valides</p>
            <p className="text-2xl font-semibold">{approvedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 p-4">
            <p className="text-sm text-muted-foreground">Refuses</p>
            <p className="text-2xl font-semibold">{rejectedCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Dossier actif</h2>
              {activeFile ? <FileStatusBadge status={activeFile.status} /> : null}
            </div>
            {!activeFile && <p className="text-sm text-muted-foreground">Aucun dossier actif pour le moment.</p>}
            {activeFile && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Reference:</span> {activeFile.id}</p>
                <p><span className="font-medium">Derniere mise a jour:</span> {activeFile.updatedAt}</p>
                <p className="text-muted-foreground">{fileStatusMap[activeFile.status].helper}</p>
                {activeFile.comment && <p className="rounded-md border bg-muted/20 p-2 text-muted-foreground">Note: {activeFile.comment}</p>}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link to="/app/files">Voir tous mes dossiers</Link></Button>
              <Button variant="outline" asChild><Link to="/app/files/new">Nouveau dossier</Link></Button>
              {activeFile && (
                <Button variant="outline" asChild>
                  <Link to={`/app/files/${activeFile.id}/upload`}>Completer le dossier</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="text-lg font-semibold">Prochaines etapes</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Verifier les informations de contact.</li>
              <li>2. Ajouter les pieces justificatives manquantes.</li>
              <li>3. Suivre l'evolution du statut dans "Mes dossiers".</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-lg font-semibold">Activite recente</h2>
          <div className="space-y-2">
            {customerFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Dossier {file.id}</p>
                  <p className="text-xs text-muted-foreground">Mis a jour le {file.updatedAt}</p>
                </div>
                <FileStatusBadge status={file.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Actions rapides</h2>
            <Button asChild className="w-full"><Link to="/vehicles">Parcourir le catalogue</Link></Button>
            <Button asChild variant="outline" className="w-full"><Link to="/app/files/new">Demarrer un nouveau dossier</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="text-lg font-semibold">Besoin d'aide ?</h2>
            <p className="text-sm text-muted-foreground">
              Notre equipe peut vous aider a completer votre dossier et accelerer le traitement.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/contact">Contacter un conseiller</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
