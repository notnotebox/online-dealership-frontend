import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { DocumentType } from '@/lib/documents/document-types'

type DocumentUploadZoneProps = {
  documentTypes: Array<{ value: DocumentType; label: string }>
  allowedFormats: string
  isUploading?: boolean
  onUpload: (payload: { file: File; documentType: DocumentType }) => Promise<void>
}

export function DocumentUploadZone({ documentTypes, allowedFormats, isUploading = false, onUpload }: DocumentUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>(documentTypes[0]?.value ?? 'OTHER')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!file) {
      setError("Choisir un fichier avant l'envoi.")
      return
    }

    try {
      setError(null)
      await onUpload({ file, documentType })
      setFile(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Envoi impossible')
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="rounded-md border border-dashed p-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <p className="font-medium">Déposer un document</p>
              </div>
              <p className="text-sm text-muted-foreground">Formats acceptés: {allowedFormats}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Type de pièce</span>
                <select
                  className="h-10 w-full rounded-md border px-3"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value as DocumentType)}
                >
                  {documentTypes.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Fichier</span>
                <input
                  className="h-10 w-full rounded-md border px-3 py-2"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </label>

              <div className="flex items-end">
                <Button type="button" onClick={handleSubmit} disabled={isUploading} className="w-full md:w-auto">
                  {isUploading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>

            {file && (
              <p className="text-xs text-muted-foreground">
                Fichier sélectionné: {file.name}
              </p>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
