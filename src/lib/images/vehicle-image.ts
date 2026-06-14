function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildVehicleImageUrl(brand: string, model: string, seed?: string) {
  const keywords = ['car', brand, model]
    .map(slugify)
    .filter(Boolean)
    .join(',')

  const lock = seed ? slugify(seed).length + keywords.length : keywords.length + 42
  return `https://loremflickr.com/1280/720/${keywords}?lock=${lock}`
}
