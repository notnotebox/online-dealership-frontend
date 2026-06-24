import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/lib/application/application-types'

type StatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  helper: string
}

export const applicationStatusMap: Record<ApplicationStatus, StatusMeta> = {
  DRAFT: { label: 'Brouillon', variant: 'secondary', helper: 'Dossier enregistré mais pas encore envoyé.' },
  SUBMITTED: { label: 'Soumis', variant: 'outline', helper: 'Dossier transmis au gestionnaire.' },
  UNDER_REVIEW: { label: 'En revue', variant: 'default', helper: 'Vérification en cours.' },
  COMPLEMENT_REQUESTED: {
    label: 'Complément demandé',
    variant: 'outline',
    className: 'border-orange-500 bg-orange-50 text-orange-800',
    helper: 'Une pièce ou une précision est attendue.',
  },
  WAITING_CUSTOMER: { label: 'En attente client', variant: 'secondary', helper: 'Le dossier attend un retour du client.' },
  APPROVED: { label: 'Validé', variant: 'default', className: 'bg-emerald-600 text-white', helper: 'Dossier accepté.' },
  REJECTED: { label: 'Refusé', variant: 'destructive', helper: 'Dossier refusé.' },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const item = applicationStatusMap[status]
  return (
    <Badge variant={item.variant} className={item.className}>
      {item.label}
    </Badge>
  )
}
