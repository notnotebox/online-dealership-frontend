const VEHICLE_IMAGES = [
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1471479917710-c18f5b26c4a0?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop',
] as const

function hashValue(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash)
}

export function buildVehicleImageUrl(brand: string, model: string, seed?: string) {
  const basis = `${brand}-${model}-${seed ?? ''}`.trim() || 'vehicle'
  return VEHICLE_IMAGES[hashValue(basis) % VEHICLE_IMAGES.length]
}

export const vehicleImageFallbacks = VEHICLE_IMAGES
