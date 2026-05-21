import { Link } from 'react-router-dom'
import { customerFiles } from '@/lib/constants/mock-data'
import { FileStatusBadge } from '@/components/shared/file-status-badge'

export function BackofficeFilesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dossiers clients</h1>
      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left"><tr><th className="p-3">ID</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {customerFiles.map((f) => (
              <tr key={f.id} className="border-t"><td className="p-3">{f.id}</td><td><FileStatusBadge status={f.status} /></td><td>{f.updatedAt}</td><td><Link className="underline" to={`/backoffice/files/${f.id}`}>Voir</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
