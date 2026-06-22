import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type ContentStateCardProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function ContentStateCard({ title, description, actionLabel, onAction }: ContentStateCardProps) {
  return (
    <Card className="border-dashed bg-muted/20">
      <CardContent className="flex flex-col items-start gap-4 p-6">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
