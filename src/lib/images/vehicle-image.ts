export const VEHICLE_IMAGE_URL = '/demo/vehicle.png'

export function buildVehicleImageUrl(..._args: unknown[]) {
  return VEHICLE_IMAGE_URL
}

export function buildVehicleImageUrlFromArt(..._args: unknown[]) {
  return VEHICLE_IMAGE_URL
}

const SUPPORTED_IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'webp'])

function getImageExtension(value: string) {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  try {
    const parsed = new URL(trimmed, 'http://local.test')
    const segments = parsed.pathname.split('.')
    return (segments[segments.length - 1] ?? '').toLowerCase()
  } catch {
    const clean = trimmed.split('?')[0].split('#')[0]
    const segments = clean.split('.')
    return (segments[segments.length - 1] ?? '').toLowerCase()
  }
}

export function isSupportedVehicleImageUrl(value: string) {
  return SUPPORTED_IMAGE_EXTENSIONS.has(getImageExtension(value))
}
