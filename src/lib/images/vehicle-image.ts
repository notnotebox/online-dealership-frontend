function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildVehicleImageUrl(brand: string, model: string, seed?: string) {
  const query = [
    'car',
    'old car',
    'rusty car',
    'abandoned car',
    'wrecked car',
    'junk car',
    'scrap car',
    'car exterior',
    'vintage car',
    'classic car',
    'epave',
    'voiture ancienne',
    'voiture rouille',
    'voiture vieux',
    'exterieur voiture',
    'voiture abandonnee',
    'voiture casse',
    brand,
    model,
  ]
    .map(slugify)
    .filter(Boolean)
    .join(',')

  const sig = seed ? slugify(seed).slice(0, 24) : slugify(`${brand}-${model}`).slice(0, 24)
  return `https://source.unsplash.com/featured/1280x720/?${query}&sig=${sig}`
}

export const vehicleImageFallbacks = [
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop',
] as const
