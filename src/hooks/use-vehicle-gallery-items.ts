import { useEffect, useState } from 'react'
import type { VehicleGalleryItem } from '@/components/shared/vehicle-gallery'
import { getStoredToken } from '@/lib/auth/auth-storage'
import type { VehicleMediaResponse } from '@/lib/api/vehicle-api'

type Options = {
  requiresAuth?: boolean
  altPrefix?: string
  labelPrefix?: string
}

export function useVehicleGalleryItems(
  media: VehicleMediaResponse[],
  options: Options = {},
) {
  const { requiresAuth = false, altPrefix = 'Visuel vehicule', labelPrefix = 'Image' } = options
  const [items, setItems] = useState<VehicleGalleryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    const objectUrls: string[] = []

    async function resolveItems() {
      if (media.length === 0) {
        setItems([])
        setError(null)
        return
      }

      if (!requiresAuth) {
        setItems(
          media.map((item, index) => ({
            id: item.id,
            src: item.downloadUrl,
            alt: `${altPrefix} ${index + 1}`,
            label: `${labelPrefix} ${index + 1}`,
          })),
        )
        setError(null)
        return
      }

      const token = getStoredToken()
      if (!token) {
        setItems([])
        setError('Session non disponible')
        return
      }

      try {
        const resolved = await Promise.all(
          media.map(async (item, index) => {
            const response = await fetch(item.downloadUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (!response.ok) {
              throw new Error('Impossible de charger les images du vehicule')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            objectUrls.push(url)

            return {
              id: item.id,
              src: url,
              alt: `${altPrefix} ${index + 1}`,
              label: `${labelPrefix} ${index + 1}`,
            } satisfies VehicleGalleryItem
          }),
        )

        if (!isCancelled) {
          setItems(resolved)
          setError(null)
        }
      } catch (cause) {
        if (!isCancelled) {
          setItems([])
          setError(cause instanceof Error ? cause.message : 'Impossible de charger les images du vehicule')
        }
      }
    }

    void resolveItems()

    return () => {
      isCancelled = true
      objectUrls.forEach((url) => window.URL.revokeObjectURL(url))
    }
  }, [altPrefix, labelPrefix, media, requiresAuth])

  return { items, error }
}
