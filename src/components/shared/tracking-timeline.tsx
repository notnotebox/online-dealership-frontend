import type { CustomerFileStatus } from '@/types/domain'
import { Card, CardContent } from '@/components/ui/card'
import { FileStatusBadge } from './file-status-badge'

type Item = { status: CustomerFileStatus; date: string; comment?: string }

export function TrackingTimeline({ items }: { items: Item[] }) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        {items.map((item, index) => (
          <div key={`${item.status}-${item.date}`} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
            {index !== items.length - 1 && <span className="absolute left-1 top-4 h-10 w-px bg-border" />}
            <div className="flex items-center justify-between gap-2">
              <FileStatusBadge status={item.status} />
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
            {item.comment ? <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
