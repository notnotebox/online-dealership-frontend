import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DocumentUploadZone } from '@/components/shared/document-upload-zone'
import { DocumentRecordList } from '@/components/shared/document-record-list'
import { formatDocumentTypeLabel, REQUIRED_DOCUMENTS, type DocumentRecord, type DocumentType } from '@/lib/documents/document-types'

type ProfileDocumentsPanelProps = {
  documents: DocumentRecord[]
  isUploading: boolean
  onUpload: (payload: { file: File; documentType: DocumentType }) => Promise<void>
  title?: string
  description?: string
}

export function ProfileDocumentsPanel({
  documents,
  isUploading,
  onUpload,
  title = 'Pièces du profil',
  description = 'Ces documents sont partagés entre toutes les demandes. Vous les déposez une seule fois au format PDF.',
}: ProfileDocumentsPanelProps) {
  const documentTypes = useMemo(
    () => REQUIRED_DOCUMENTS.map((document) => ({ value: document.documentType, label: formatDocumentTypeLabel(document.documentType) })),
    [],
  )

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <DocumentUploadZone
          documentTypes={documentTypes}
          allowedFormats="PDF"
          isUploading={isUploading}
          onUpload={onUpload}
        />

        <DocumentRecordList
          documents={documents}
          emptyTitle="Aucun document déposé"
          emptyDescription="Ajoutez vos pièces communes ici pour les réutiliser sur toutes vos demandes."
        />
      </CardContent>
    </Card>
  )
}
