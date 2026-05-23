import { customerFiles } from '@/lib/constants/mock-data'
import { fileStatusMap, FileStatusBadge } from '@/components/shared/file-status-badge'
import type { CustomerFileStatus } from '@/types/domain'

const inProgressStatuses = new Set<CustomerFileStatus>(['draft', 'submitted', 'reviewing', 'missing-documents'])
const approvedStatuses = new Set<CustomerFileStatus>(['approved'])
const rejectedStatuses = new Set<CustomerFileStatus>(['rejected'])

export function ClientFilesPage() {
  const inProgressFiles = customerFiles.filter((f) => inProgressStatuses.has(f.status))
  const approvedFiles = customerFiles.filter((f) => approvedStatuses.has(f.status))
  const rejectedFiles = customerFiles.filter((f) => rejectedStatuses.has(f.status))

  const groups = [
    {
      key: 'in-progress',
      title: 'Demandes en cours',
      description: 'Dossiers en preparation, envoyes ou en attente de pieces.',
      files: inProgressFiles,
    },
    {
      key: 'approved',
      title: 'Demandes validees',
      description: 'Dossiers acceptes.',
      files: approvedFiles,
    },
    {
      key: 'rejected',
      title: 'Demandes refusees',
      description: 'Dossiers non retenus.',
      files: rejectedFiles,
    },
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Mes dossiers</h1>
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="mb-2 text-sm font-medium">Lecture des statuts</p>
        <div className="grid gap-2 md:grid-cols-2">
          {Object.entries(fileStatusMap).map(([status, meta]) => (
            <div key={status} className="flex items-center gap-2 text-sm">
              <FileStatusBadge status={status as keyof typeof fileStatusMap} />
              <span className="text-muted-foreground">{meta.helper}</span>
            </div>
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.key} className="rounded-lg border p-4">
          <div className="mb-3">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>
          {group.files.length === 0 && (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Aucun dossier dans cette section.
            </p>
          )}
          {group.files.map((f) => (
            <div key={f.id} className="flex items-start justify-between border-b py-3 last:border-b-0">
              <div className="space-y-1">
                <p className="text-sm font-medium">Dossier {f.id}</p>
                <p className="text-xs text-muted-foreground">Derniere mise a jour: {f.updatedAt}</p>
                {f.comment && <p className="text-xs text-muted-foreground">Note: {f.comment}</p>}
                <p className="text-xs text-muted-foreground">{fileStatusMap[f.status].helper}</p>
              </div>
              <FileStatusBadge status={f.status} />
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
