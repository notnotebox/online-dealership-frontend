import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentUploadZone } from '@/components/shared/document-upload-zone'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import { formatDocumentTypeLabel, getRequiredDocuments, type DocumentRecord, type DocumentType } from '@/lib/documents/document-types'
import type { VehicleApplication } from '@/lib/application/application-types'
import { Button } from '@/components/ui/button'

function formatSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} o`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} Ko`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function UploadDocumentsPage() {
  const { fileId } = useParams()
  const [application, setApplication] = useState<VehicleApplication | null>(null)
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      try {
        setIsLoading(true)
        const [applicationResponse, documentResponse] = await Promise.all([
          fileId ? applicationApi.getMine(fileId) : Promise.resolve(null),
          documentApi.listMine(),
        ])

        if (!cancelled) {
          setApplication(applicationResponse)
          setDocuments(documentResponse)
          setError(null)
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les documents')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      cancelled = true
    }
  }, [fileId])

  const requiredDocuments = useMemo(() => {
    if (!application) {
      return []
    }

    return getRequiredDocuments(application.acquisitionType)
  }, [application])

  const uploadedByType = useMemo(() => {
    return new Map<DocumentType, DocumentRecord[]>(
      documents.reduce<Array<[DocumentType, DocumentRecord[]]>>((acc, document) => {
        const existing = acc.find(([type]) => type === document.documentType)
        if (existing) {
          existing[1].push(document)
        } else {
          acc.push([document.documentType, [document]])
        }
        return acc
      }, []),
    )
  }, [documents])

  async function handleUpload(payload: { file: File; documentType: DocumentType; applicationId?: string }) {
    try {
      setIsUploading(true)
      const uploaded = await documentApi.upload({ ...payload, applicationId: payload.applicationId ?? fileId ?? undefined })
      setDocuments((current) => [uploaded, ...current])
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d'envoyer le document")
    } finally {
      setIsUploading(false)
    }
  }

  const completionPercent = useMemo(() => {
    if (!requiredDocuments.length) {
      return 0
    }

    const completed = requiredDocuments.filter((document) => uploadedByType.has(document.documentType)).length
    return Math.round((completed * 1000) / requiredDocuments.length) / 10
  }, [requiredDocuments, uploadedByType])

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des documents...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Documents du dossier</h1>
        <p className="text-muted-foreground">
          {application
            ? `${application.vehicleBrand} ${application.vehicleTitle} - mode ${application.acquisitionType}`
            : 'Aucune demande sélectionnée.'}
        </p>
      </div>

      {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Pièces attendues</h2>
                <p className="text-sm text-muted-foreground">
                  Les pièces varient selon le mode d’acquisition. Le statut se met à jour document par document.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Complétude</p>
                <p className="text-2xl font-semibold">{completionPercent}%</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {requiredDocuments.map((document) => {
                const uploadedDocuments = uploadedByType.get(document.documentType) ?? []
                const latest = uploadedDocuments[0]
                const isDone = uploadedDocuments.length > 0

                return (
                  <div key={document.documentType} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">{document.label}</p>
                        {document.note && <p className="text-xs text-muted-foreground">{document.note}</p>}
                      </div>
                      <span className={`rounded-full px-2 py-1 text-xs ${isDone ? 'bg-emerald-500/10 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                        {isDone ? 'Déposé' : 'À déposer'}
                      </span>
                    </div>

                    {latest ? (
                      <div className="mt-3 text-xs text-muted-foreground">
                        <p>{latest.originalFileName}</p>
                        <p>{latest.fileFormat} - {formatSize(latest.fileSizeBytes)}</p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-lg font-semibold">Actions</h2>
              <p className="text-sm text-muted-foreground">Déposez une pièce au bon format, puis complétez le dossier si nécessaire.</p>
            </div>
            <DocumentUploadZone
              documentTypes={requiredDocuments.length > 0
                ? requiredDocuments.map((document) => ({ value: document.documentType, label: formatDocumentTypeLabel(document.documentType) }))
                : [{ value: 'OTHER', label: 'Autre pièce' }]}
              allowedFormats="PDF"
              isUploading={isUploading}
              applicationId={fileId ?? undefined}
              onUpload={handleUpload}
            />
            <Button asChild variant="outline" className="w-full">
              <Link to={fileId ? `/app/files/${fileId}` : '/app/files'}>Retour au dossier</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
