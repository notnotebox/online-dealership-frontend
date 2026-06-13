import { apiRequest } from './client'
import type { DocumentRecord, DocumentUploadPayload } from '@/lib/documents/document-types'

export const documentApi = {
  listMine() {
    return apiRequest<DocumentRecord[]>('/documents')
  },
  upload(payload: DocumentUploadPayload) {
    const formData = new FormData()
    formData.append('file', payload.file)
    formData.append('documentType', payload.documentType)

    return apiRequest<DocumentRecord>('/documents', {
      method: 'POST',
      body: formData,
    })
  },
}
