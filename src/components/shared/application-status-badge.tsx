import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/lib/application/application-types'

type StatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  helper: string
}

export const applicationStatusMap: Record<ApplicationStatus, StatusMeta> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary', helper: 'Demande en preparation' },
  SUBMITTED: { label: 'Soumise', variant: 'outline', helper: 'Demande envoyee au traitement' },
  UNDER_REVIEW: { label: 'En etude', variant: 'default', helper: 'Analyse en cours' },
  NEEDS_INFO: { label: 'Pieces manquantes', variant: 'destructive', helper: 'Complement demande' },
  APPROVED: { label: 'Validee', variant: 'default', className: 'bg-emerald-600 text-white', helper: 'Demande acceptee' },
  REJECTED: { label: 'Refusee', variant: 'destructive', helper: 'Demande non retenue' },
  CANCELLED: { label: 'Annulee', variant: 'outline', helper: 'Demande cloturee' },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const item = applicationStatusMap[status]
  return (
    <Badge variant={item.variant} className={item.className}>
      {item.label}
    </Badge>
  )
}
