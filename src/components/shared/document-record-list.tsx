import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DocumentRecord } from '@/lib/documents/document-types'
import { formatDocumentTypeLabel } from '@/lib/documents/document-types'
import { downloadProtectedFile } from '@/lib/api/download-protected-file'

type DocumentRecordListProps = {
  documents: DocumentRecord[]
  emptyTitle: string
  emptyDescription: string
}

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} o`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function DocumentRecordList({ documents, emptyTitle, emptyDescription }: DocumentRecordListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload(document: DocumentRecord) {
    try {
      setDownloadingId(document.id)
      setError(null)
      await downloadProtectedFile(document.downloadUrl, document.originalFileName)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Téléchargement impossible')
    } finally {
      setDownloadingId(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">{emptyTitle}</p>
        <p>{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div key={document.id} className="flex flex-col gap-3 rounded-lg border p-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{formatDocumentTypeLabel(document.documentType)}</p>
            </div>
            <p className="truncate text-sm text-muted-foreground">{document.originalFileName}</p>
            <p className="text-xs text-muted-foreground">
              PDF · {formatSize(document.fileSizeBytes)} · Déposé le {formatDate(document.createdAt)}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => void handleDownload(document)}
            disabled={downloadingId === document.id}
          >
            {downloadingId === document.id ? 'Téléchargement...' : 'Télécharger'}
          </Button>
        </div>
      ))}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
