import { useParams } from 'react-router-dom'
import { DocumentUploadZone } from '@/components/shared/document-upload-zone'
import { uploadedDocuments } from '@/lib/constants/mock-data'

export function UploadDocumentsPage() {
  const { fileId } = useParams()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Depot de documents</h1>
        <p className="text-muted-foreground">
          Demande associee: {fileId ?? 'Non renseignee'}. Les documents restent attaches a votre profil pour les prochaines demandes.
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Documents attendus</h2>
        <div className="space-y-2 text-sm">
          {uploadedDocuments.map((d) => <p key={d.id}>{d.label}: {d.status}</p>)}
        </div>
      </div>
      <DocumentUploadZone />
    </div>
  )
}
