import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
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
      <span className={cn('flex items-center gap-2 font-medium', missing ? 'text-amber-700' : 'text-muted-foreground')}>
        {missing ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
        <span>{label}</span>
        <span
          className={cn(
            'ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]',
            missing ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700',
          )}
        >
          {missing ? 'À compléter' : 'OK'}
        </span>
      </span>
      {children}
    </label>
  )
}
