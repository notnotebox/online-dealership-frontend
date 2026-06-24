import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProfileDocumentsPanel } from '@/components/shared/profile-documents-panel'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { applicationApi } from '@/lib/api/application-api'
import { documentApi } from '@/lib/api/document-api'
import type { VehicleApplication } from '@/lib/application/application-types'
import type { DocumentRecord, DocumentType } from '@/lib/documents/document-types'

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

  async function handleUpload(payload: { file: File; documentType: DocumentType }) {
    try {
      setIsUploading(true)
      const uploaded = await documentApi.upload(payload)
      setDocuments((current) => [uploaded, ...current])
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d'envoyer le document")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return <div className="rounded-lg border p-4 text-sm text-muted-foreground">Chargement des documents…</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Documents du profil</h1>
        <p className="text-muted-foreground">
          {application
            ? `${application.vehicleBrand} ${application.vehicleTitle} · ces pièces seront réutilisées pour cette demande et les suivantes.`
            : 'Ces pièces sont partagées entre toutes vos demandes.'}
        </p>
      </div>

      {error ? <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <ProfileDocumentsPanel
        documents={documents}
        isUploading={isUploading}
        onUpload={handleUpload}
        description="Déposez ici vos pièces PDF communes. Elles restent visibles dans le profil client et dans la revue gestionnaire."
      />

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          <Button asChild variant="outline">
            <Link to="/app/profile">Retour au profil</Link>
          </Button>
          <Button asChild>
            <Link to={fileId ? `/app/files/${fileId}` : '/app/files'}>Retour au dossier</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
