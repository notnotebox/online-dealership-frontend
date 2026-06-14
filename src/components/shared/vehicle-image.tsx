import { useMemo, useState } from 'react'
import { buildVehicleImageUrl, vehicleImageFallbacks } from '@/lib/images/vehicle-image'

type VehicleImageProps = {
  brand: string
  model: string
  seed?: string
  alt: string
  className?: string
  src?: string
}

export function VehicleImage({ brand, model, seed, src: sourceUrl, alt, className }: VehicleImageProps) {
  const primarySrc = useMemo(() => sourceUrl ?? buildVehicleImageUrl(brand, model, seed), [brand, model, seed, sourceUrl])
  const [fallbackIndex, setFallbackIndex] = useState(0)

  const currentSrc = fallbackIndex === 0 ? primarySrc : vehicleImageFallbacks[(fallbackIndex - 1) % vehicleImageFallbacks.length]

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        setFallbackIndex((current) => {
          const next = current + 1
          return next > vehicleImageFallbacks.length ? current : next
        })
      }}
    />
  )
}
