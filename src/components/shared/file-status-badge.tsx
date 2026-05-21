import type { CustomerFileStatus } from '@/types/domain'
import { Badge } from '@/components/ui/badge'

type FileStatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  helper: string
}

export const fileStatusMap: Record<CustomerFileStatus, FileStatusMeta> = {
  draft: { label: 'Brouillon', variant: 'secondary', helper: 'Dossier non envoye' },
  submitted: { label: 'Envoye', variant: 'outline', helper: 'En attente de prise en charge' },
  reviewing: { label: 'En etude', variant: 'default', helper: 'Analyse en cours par un conseiller' },
  'missing-documents': { label: 'Pieces manquantes', variant: 'destructive', helper: 'Action requise: ajouter les documents demandes' },
  approved: { label: 'Valide', variant: 'default', className: 'bg-emerald-600 text-white', helper: 'Dossier accepte' },
  rejected: { label: 'Refuse', variant: 'destructive', helper: 'Dossier non retenu' },
}

export function FileStatusBadge({ status }: { status: CustomerFileStatus }) {
  const item = fileStatusMap[status]
  return <Badge variant={item.variant} className={item.className}>{item.label}</Badge>
}
