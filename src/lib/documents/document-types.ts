import type { ApplicationAcquisitionType } from '@/lib/application/application-types'

export type DocumentType =
  | 'REGISTRATION_CERTIFICATE'
  | 'IDENTITY_CARD'
  | 'PASSPORT'
  | 'PROOF_OF_ADDRESS'
  | 'DRIVER_LICENSE'
  | 'INSURANCE_CERTIFICATE'
  | 'BANK_STATEMENT'
  | 'SALARY_SLIP'
  | 'TAX_NOTICE'
  | 'EMPLOYMENT_CONTRACT'
  | 'EMPLOYER_CERTIFICATE'
  | 'DOWN_PAYMENT_PROOF'
  | 'PAYMENT_PROOF'
  | 'SIGNED_LOAN_OFFER'
  | 'SIGNED_LEASE_CONTRACT'
  | 'OTHER'

export type DocumentFileFormat = 'PDF' | 'PNG' | 'JPG' | 'JPEG'

export type DocumentStatus = 'UPLOADED' | 'ARCHIVED'

export type DocumentRecord = {
  id: string
  documentType: DocumentType
  fileFormat: DocumentFileFormat
  status: DocumentStatus
  originalFileName: string
  fileSizeBytes: number
  mimeType: string
  ownerId: string
  applicationId: string | null
  createdAt: string
  downloadUrl: string
}

export type DocumentUploadPayload = {
  file: File
  documentType: DocumentType
  applicationId?: string
}

export type RequiredDocument = {
  documentType: DocumentType
  label: string
  requiredFor: ApplicationAcquisitionType[]
  note?: string
}

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { documentType: 'IDENTITY_CARD', label: 'Carte d’identité ou passeport', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'] },
  { documentType: 'DRIVER_LICENSE', label: 'Permis de conduire', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'] },
  { documentType: 'PROOF_OF_ADDRESS', label: 'Justificatif de domicile', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'], note: 'Daté de moins de 3 mois' },
  { documentType: 'BANK_STATEMENT', label: 'RIB ou relevé bancaire', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'] },
  { documentType: 'SALARY_SLIP', label: 'Bulletins de salaire', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'TAX_NOTICE', label: 'Dernier avis d’imposition', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'EMPLOYMENT_CONTRACT', label: 'Contrat de travail', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'EMPLOYER_CERTIFICATE', label: 'Attestation employeur', requiredFor: ['LOA', 'LLD'] },
  { documentType: 'DOWN_PAYMENT_PROOF', label: 'Justificatif d’apport', requiredFor: ['LOA', 'LLD'] },
  { documentType: 'SIGNED_LOAN_OFFER', label: 'Offre de prêt signée', requiredFor: ['CREDIT'] },
  { documentType: 'SIGNED_LEASE_CONTRACT', label: 'Contrat de leasing signé', requiredFor: ['LOA', 'LLD'] },
  { documentType: 'INSURANCE_CERTIFICATE', label: 'Attestation d’assurance', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'], note: 'Demandée avant livraison' },
  { documentType: 'PAYMENT_PROOF', label: 'Preuve de paiement', requiredFor: ['CASH'] },
]

export function getRequiredDocuments(acquisitionType: ApplicationAcquisitionType) {
  return REQUIRED_DOCUMENTS.filter((document) => document.requiredFor.includes(acquisitionType))
}

export function formatDocumentTypeLabel(documentType: DocumentType) {
  return REQUIRED_DOCUMENTS.find((document) => document.documentType === documentType)?.label ?? documentType
}
