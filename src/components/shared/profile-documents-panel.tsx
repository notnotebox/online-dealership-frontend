import { useMemo, useRef, type ChangeEvent } from 'react'
import { AlertCircle, FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { downloadProtectedFile } from '@/lib/api/download-protected-file'
import {
  findLatestDocument,
  PROFILE_DOCUMENTS,
  type DocumentRecord,
  type DocumentType,
  type RequiredDocument,
} from '@/lib/documents/document-types'

type ProfileDocumentsPanelProps = {
  documents: DocumentRecord[]
  isUploading: boolean
  onUpload: (payload: { file: File; documentType: DocumentType }) => Promise<void>
  title?: string
  description?: string
  documentDefinitions?: RequiredDocument[]
}

type DocumentSlotCardProps = {
  currentDocument: DocumentRecord | null
  documentType: DocumentType
  isUploading: boolean
  label: string
  note?: string
  onUpload: (payload: { file: File; documentType: DocumentType }) => Promise<void>
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatSize(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 1,
  }).format(value / 1024 / 1024)
}

function DocumentSlotCard({
  currentDocument,
  documentType,
  isUploading,
  label,
  note,
  onUpload,
}: DocumentSlotCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const isMissing = currentDocument == null

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    await onUpload({ file, documentType })
    event.target.value = ''
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        isMissing
          ? 'border-amber-500 bg-amber-50/60'
          : 'border-border bg-background',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{label}</p>
            {isMissing ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-amber-800">
                <AlertCircle className="h-3 w-3 shrink-0" />
                A completer
              </span>
            ) : null}
          </div>
          {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
        </div>
        <Button
          type="button"
          variant={currentDocument ? 'outline' : 'default'}
          size="sm"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {currentDocument ? 'Modifier' : 'Deposer'}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      {currentDocument ? (
        <div className="mt-4 rounded-lg border bg-muted/20 p-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-medium">{currentDocument.originalFileName}</p>
              <p className="text-xs text-muted-foreground">
                PDF · {formatSize(currentDocument.fileSizeBytes)} Mo · {formatDate(currentDocument.createdAt)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void downloadProtectedFile(currentDocument.downloadUrl, currentDocument.originalFileName)}
            >
              Telecharger
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed bg-background/80 p-3 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>PDF a deposer pour completer cette piece.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export function ProfileDocumentsPanel({
  documents,
  isUploading,
  onUpload,
  title = 'Pieces du profil',
  description = 'Ces documents sont stockes dans le profil client et reutilises sur les demandes.',
  documentDefinitions = PROFILE_DOCUMENTS,
}: ProfileDocumentsPanelProps) {
  const latestDocumentsByType = useMemo(() => {
    return new Map(
      documentDefinitions.map((document) => [document.documentType, findLatestDocument(documents, document.documentType)]),
    )
  }, [documentDefinitions, documents])

  const missingCount = useMemo(() => {
    return documentDefinitions.filter((document) => !latestDocumentsByType.get(document.documentType)).length
  }, [documentDefinitions, latestDocumentsByType])

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {missingCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-amber-800">
                <AlertCircle className="h-3 w-3 shrink-0" />
                {missingCount} a completer
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {documentDefinitions.map((document) => (
            <DocumentSlotCard
              key={document.documentType}
              documentType={document.documentType}
              label={document.label}
              note={document.note}
              currentDocument={latestDocumentsByType.get(document.documentType) ?? null}
              isUploading={isUploading}
              onUpload={onUpload}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
