import { FlaskConical } from 'lucide-react'
import { Button } from '@/components/ui/button'

type TestHelperCardProps = {
  title: string
  description: string
  buttonLabel: string
  onClick: () => void
}

export function TestHelperCard({ title, description, buttonLabel, onClick }: TestHelperCardProps) {
  return (
    <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-900">
          <FlaskConical className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold text-amber-900">{title}</p>
          <p className="text-xs text-amber-900/80">{description}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full border-amber-500/50 text-amber-900 hover:bg-amber-100"
        onClick={onClick}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
