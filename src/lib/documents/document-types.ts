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
  | 'OTHER'

export type DocumentFileFormat = 'PDF'

export type DocumentStatus = 'UPLOADED' | 'ARCHIVED'

export type DocumentRecord = {
  id: string
  documentType: DocumentType
  fileFormat?: DocumentFileFormat
  status: DocumentStatus
  originalFileName: string
  fileSizeBytes: number
  mimeType: string
  ownerId: string
  applicationId?: string | null
  createdAt: string
  downloadUrl: string
}

export type DocumentUploadPayload = {
  file: File
  documentType: DocumentType
}

export type RequiredDocument = {
  documentType: DocumentType
  label: string
  requiredFor: ApplicationAcquisitionType[]
  note?: string
  requiresContribution?: boolean
}

export const REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { documentType: 'IDENTITY_CARD', label: "Carte d'identite ou passeport", requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'] },
  { documentType: 'DRIVER_LICENSE', label: 'Permis de conduire', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'PROOF_OF_ADDRESS', label: 'Justificatif de domicile', requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'], note: 'Date de moins de 3 mois' },
  { documentType: 'BANK_STATEMENT', label: 'RIB ou releve bancaire', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'SALARY_SLIP', label: 'Bulletins de salaire', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'TAX_NOTICE', label: "Dernier avis d'imposition", requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'EMPLOYMENT_CONTRACT', label: 'Contrat de travail', requiredFor: ['CREDIT', 'LOA', 'LLD'] },
  { documentType: 'EMPLOYER_CERTIFICATE', label: 'Attestation employeur', requiredFor: ['LOA', 'LLD'] },
  { documentType: 'DOWN_PAYMENT_PROOF', label: "Justificatif d'apport", requiredFor: ['LOA', 'LLD'], note: 'Seulement si un apport est prevu', requiresContribution: true },
  { documentType: 'SIGNED_LOAN_OFFER', label: 'Offre de pret signee', requiredFor: ['CREDIT'] },
  { documentType: 'INSURANCE_CERTIFICATE', label: "Attestation d'assurance", requiredFor: ['CASH', 'CREDIT', 'LOA', 'LLD'], note: 'Demandee avant livraison' },
  { documentType: 'PAYMENT_PROOF', label: 'Preuve de paiement', requiredFor: ['CASH'] },
]

export const PROFILE_DOCUMENTS = REQUIRED_DOCUMENTS.filter((document, index, source) => {
  return source.findIndex((candidate) => candidate.documentType === document.documentType) === index
})

export function getRequiredDocuments(
  acquisitionType: ApplicationAcquisitionType,
  options?: { contributionAmount?: number | string | null },
) {
  const contributionValue = Number(options?.contributionAmount ?? 0)
  const hasContribution = Number.isFinite(contributionValue) && contributionValue > 0

  return REQUIRED_DOCUMENTS.filter((document) => {
    if (!document.requiredFor.includes(acquisitionType)) {
      return false
    }

    if (document.requiresContribution && !hasContribution) {
      return false
    }

    return true
  })
}

export function findLatestDocument(documents: DocumentRecord[], documentType: DocumentType) {
  return documents.find((document) => document.documentType === documentType) ?? null
}

export function countCompletedDocuments(documents: DocumentRecord[], definitions: RequiredDocument[]) {
  return definitions.filter((document) => findLatestDocument(documents, document.documentType)).length
}

export function getMissingRequiredDocuments(documents: DocumentRecord[], definitions: RequiredDocument[]) {
  return definitions.filter((document) => !findLatestDocument(documents, document.documentType))
}

export function getDocumentCompletionPercent(documents: DocumentRecord[], definitions: RequiredDocument[]) {
  if (definitions.length === 0) {
    return 100
  }

  const completed = countCompletedDocuments(documents, definitions)
  return Math.round((completed / definitions.length) * 100)
}

export function formatDocumentTypeLabel(documentType: DocumentType) {
  return PROFILE_DOCUMENTS.find((document) => document.documentType === documentType)?.label ?? documentType
}
