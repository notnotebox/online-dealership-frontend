import type { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type CompletionFieldProps = {
  label: string
  missing: boolean
  className?: string
  children: ReactNode
}

export function completionInputClassName(missing: boolean) {
  return cn(
    'h-10 w-full rounded-md border px-3 transition-colors outline-none',
    missing
      ? 'border-amber-500 bg-amber-50/60 text-foreground focus-visible:border-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500/30'
      : 'border-input bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
  )
}

export function completionTextareaClassName(missing: boolean) {
  return cn(
    'min-h-24 w-full rounded-md border px-3 py-2 transition-colors outline-none',
    missing
      ? 'border-amber-500 bg-amber-50/60 text-foreground focus-visible:border-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500/30'
      : 'border-input bg-background focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
  )
}

export function CompletionField({ label, missing, className, children }: CompletionFieldProps) {
  return (
    <label className={cn('space-y-1 text-sm', className)}>
      <span className="flex items-center gap-2 font-medium text-muted-foreground">
        <span>{label}</span>
        {missing ? (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] text-amber-800">
            <AlertCircle className="h-3 w-3 shrink-0" />
            À compléter
          </span>
        ) : null}
      </span>
      {children}
    </label>
  )
}
