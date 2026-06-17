import { useMemo } from 'react'
import { buildVehicleImageUrl } from '@/lib/images/vehicle-image'

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

  return (
    <img src={primarySrc} alt={alt} className={className} />
  )
}
