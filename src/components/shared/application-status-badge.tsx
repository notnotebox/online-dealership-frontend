import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/lib/application/application-types'

type StatusMeta = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  helper: string
}

export const applicationStatusMap: Record<ApplicationStatus, StatusMeta> = {
  DRAFT: { label: 'Draft', variant: 'secondary', helper: 'Dossier commence mais pas envoye' },
  TO_COMPLETE: { label: 'To complete', variant: 'outline', helper: 'Dossier a terminer' },
  SUBMITTED: { label: 'Submitted', variant: 'outline', helper: 'Dossier transmis' },
  UNDER_REVIEW: { label: 'Under review', variant: 'default', helper: 'Verification en cours' },
  COMPLEMENT_REQUESTED: { label: 'Need info', variant: 'destructive', helper: 'Piece ou precision attendue' },
  WAITING_CUSTOMER: { label: 'Waiting customer', variant: 'secondary', helper: 'En attente de reponse client' },
  APPROVED: { label: 'Approved', variant: 'default', className: 'bg-emerald-600 text-white', helper: 'Dossier valide' },
  REJECTED: { label: 'Rejected', variant: 'destructive', helper: 'Dossier refuse' },
}

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const item = applicationStatusMap[status]
  return (
    <Badge variant={item.variant} className={item.className}>
      {item.label}
    </Badge>
  )
}
