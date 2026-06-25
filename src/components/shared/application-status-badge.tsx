import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/lib/application/application-types'

type StatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  helper: string
}

export const applicationStatusMap: Record<ApplicationStatus, StatusMeta> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary', helper: 'Dossier enregistre mais pas encore envoye.' },
  SUBMITTED: { label: 'Soumis', variant: 'outline', helper: 'Dossier transmis au gestionnaire.' },
  UNDER_REVIEW: { label: 'En verification', variant: 'default', helper: 'Verification en cours.' },
  COMPLEMENT_REQUESTED: {
    label: 'Complement demande',
    variant: 'outline',
    className: 'border-orange-500 bg-orange-50 text-orange-800',
    helper: 'Une piece ou une precision est attendue.',
  },
  WAITING_CUSTOMER: {
    label: 'En attente client',
    variant: 'secondary',
    helper: 'Le gestionnaire attend la signature ou la validation finale du client.',
  },
  APPROVED: {
    label: 'Valide',
    variant: 'default',
    className: 'bg-emerald-600 text-white',
    helper: 'Dossier accepte.',
  },
  REJECTED: { label: 'Refuse', variant: 'destructive', helper: 'Dossier refuse.' },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const item = applicationStatusMap[status]
  return (
    <Badge variant={item.variant} className={item.className}>
      {item.label}
    </Badge>
  )
}
