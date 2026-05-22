import { TrackingTimeline } from '@/components/shared/tracking-timeline'

export function FileTrackingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Suivi dossier</h1>
      <TrackingTimeline items={[
        { status: 'submitted', date: '2026-05-10' },
        { status: 'reviewing', date: '2026-05-17', comment: 'En attente de justificatif' },
      ]} />
    </div>
  )
}
