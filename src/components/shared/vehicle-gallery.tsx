import { useEffect, useState, type ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type VehicleGalleryItem = {
  id: string
  src: string
  alt: string
  label?: string
}

type VehicleGalleryProps = {
  items: VehicleGalleryItem[]
  emptyContent?: ReactNode
  imageClassName?: string
  thumbnailClassName?: string
}

export function VehicleGallery({
  items,
  emptyContent,
  imageClassName,
  thumbnailClassName,
}: VehicleGalleryProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    if (items.length === 0) {
      setActiveItemId(null)
      return
    }

    if (!items.some((item) => item.id === activeItemId)) {
      setActiveItemId(items[0].id)
    }
  }, [activeItemId, items])

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0] ?? null

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border bg-muted/30">
        {activeItem ? (
          <img
            src={activeItem.src}
            alt={activeItem.alt}
            className={cn('h-full min-h-[18rem] w-full object-cover', imageClassName)}
          />
        ) : (
          emptyContent ?? (
            <div className="flex min-h-[18rem] items-center justify-center px-6 text-sm text-muted-foreground">
              Aucun visuel disponible.
            </div>
          )
        )}
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => {
            const isActive = item.id === activeItem?.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItemId(item.id)}
                className={cn(
                  'group overflow-hidden rounded-xl border bg-background text-left transition',
                  isActive ? 'border-primary shadow-sm' : 'border-border hover:border-primary/40',
                  thumbnailClassName,
                )}
              >
                <div className="relative">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-24 w-full object-cover transition group-hover:scale-[1.02]"
                  />
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className="absolute left-2 top-2 text-[10px] uppercase tracking-[0.2em]"
                  >
                    {index + 1}
                  </Badge>
                </div>
                {item.label && (
                  <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                    {item.label}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
