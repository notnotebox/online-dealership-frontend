import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { VehicleGallery, type VehicleGalleryItem } from '@/components/shared/vehicle-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useVehicleGalleryItems } from '@/hooks/use-vehicle-gallery-items'
import {
  vehicleApi,
  type AdminVehicleResponse,
  type VehicleCommercialType,
  type VehicleEnergy,
  type VehicleMediaResponse,
} from '@/lib/api/vehicle-api'

const ENERGY_OPTIONS: { value: VehicleEnergy; label: string }[] = [
  { value: 'GASOLINE', label: 'Essence' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybride' },
  { value: 'ELECTRIC', label: 'Electrique' },
  { value: 'LPG', label: 'GPL' },
  { value: 'OTHER', label: 'Autre' },
]

const COMMERCIAL_TYPE_OPTIONS: { value: VehicleCommercialType; label: string }[] = [
  { value: 'PURCHASE', label: 'Achat' },
  { value: 'LEASE', label: 'Location' },
]

const ACCEPTED_IMAGE_LABEL = 'PNG, JPG ou WEBP'
const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

type FormState = {
  title: string
  brand: string
  price: string
  mileage: string
  seatCount: string
  doorCount: string
  color: string
  energy: VehicleEnergy
  commercialType: VehicleCommercialType
  published: boolean
}

const DEFAULT_STATE: FormState = {
  title: '',
  brand: '',
  price: '',
  mileage: '',
  seatCount: '5',
  doorCount: '5',
  color: 'Noir',
  energy: 'GASOLINE',
  commercialType: 'PURCHASE',
  published: true,
}

function isAcceptedImage(file: File) {
  if (ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return true
  }

  const extension = file.name.split('.').pop()?.toLowerCase()
  return extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'webp'
}

function uniqueFiles(existing: File[], incoming: File[]) {
  const seen = new Set(
    existing.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
  )
  const output = [...existing]

  incoming.forEach((file) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`
    if (!seen.has(key)) {
      seen.add(key)
      output.push(file)
    }
  })

  return output
}

export function BackofficeVehicleFormPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [form, setForm] = useState<FormState>(DEFAULT_STATE)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [existingMedia, setExistingMedia] = useState<VehicleMediaResponse[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(vehicleId))
  const [isSaving, setIsSaving] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedVehicle, setLoadedVehicle] = useState<AdminVehicleResponse | null>(null)
  const [localGalleryItems, setLocalGalleryItems] = useState<VehicleGalleryItem[]>([])

  const previewLabel = useMemo(() => {
    if (selectedFiles.length === 0) {
      return 'Glissez une ou plusieurs images ou cliquez pour les selectionner.'
    }

    if (selectedFiles.length === 1) {
      return selectedFiles[0].name
    }

    return `${selectedFiles.length} fichiers selectionnes`
  }, [selectedFiles])

  const { items: existingGalleryItems, error: existingGalleryError } = useVehicleGalleryItems(existingMedia, {
    requiresAuth: true,
    altPrefix: 'Visuel enregistre',
    labelPrefix: 'Enregistree',
  })

  const galleryItems = useMemo(
    () => [...existingGalleryItems, ...localGalleryItems],
    [existingGalleryItems, localGalleryItems],
  )

  useEffect(() => {
    let cancelled = false

    async function loadVehicle() {
      if (!vehicleId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const [vehicle, media] = await Promise.all([
          vehicleApi.getAdminVehicle(vehicleId),
          vehicleApi.listAdminVehicleMedia(vehicleId),
        ])

        if (cancelled) {
          return
        }

        setLoadedVehicle(vehicle)
        setExistingMedia(media)
        setForm({
          title: vehicle.title,
          brand: vehicle.brand,
          price: String(vehicle.price),
          mileage: String(vehicle.mileage),
          seatCount: String(vehicle.seatCount),
          doorCount: String(vehicle.doorCount),
          color: vehicle.color,
          energy: vehicle.energy,
          commercialType: vehicle.commercialType,
          published: vehicle.published,
        })
        setError(null)
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : 'Impossible de charger le vehicule',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadVehicle()

    return () => {
      cancelled = true
    }
  }, [vehicleId])

  useEffect(() => {
    const objectUrls: string[] = []

    const nextItems = selectedFiles.map((file, index) => {
      const src = window.URL.createObjectURL(file)
      objectUrls.push(src)

      return {
        id: `local-${file.name}-${file.lastModified}-${index}`,
        src,
        alt: `Image ajoutee ${index + 1}`,
        label: `Ajoutee ${index + 1}`,
      } satisfies VehicleGalleryItem
    })

    setLocalGalleryItems(nextItems)

    return () => {
      objectUrls.forEach((url) => window.URL.revokeObjectURL(url))
    }
  }, [selectedFiles])

  useEffect(() => {
    if (existingGalleryError) {
      setError(existingGalleryError)
    }
  }, [existingGalleryError])

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files).filter(isAcceptedImage)
    if (incoming.length === 0) {
      setError(`Seuls les fichiers ${ACCEPTED_IMAGE_LABEL} sont acceptes.`)
      return
    }

    setError(null)
    setSelectedFiles((current) => uniqueFiles(current, incoming))
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.brand.trim()) {
      setError('Le titre et la marque sont requis.')
      return
    }

    const price = Number(form.price)
    const mileage = Number(form.mileage)
    const seatCount = Number(form.seatCount)
    const doorCount = Number(form.doorCount)

    if (!Number.isFinite(price) || price < 0) {
      setError('Le prix doit etre un nombre positif.')
      return
    }

    if (!Number.isFinite(mileage) || mileage < 0) {
      setError('Le kilometrage doit etre un nombre positif.')
      return
    }

    if (!Number.isFinite(seatCount) || seatCount < 1) {
      setError('Le nombre de places doit etre au moins egal a 1.')
      return
    }

    if (!Number.isFinite(doorCount) || doorCount < 1) {
      setError('Le nombre de portes doit etre au moins egal a 1.')
      return
    }

    if (!form.color.trim()) {
      setError('La couleur est requise.')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        price,
        energy: form.energy,
        mileage: Math.trunc(mileage),
        seatCount: Math.trunc(seatCount),
        doorCount: Math.trunc(doorCount),
        color: form.color.trim(),
        commercialType: form.commercialType,
        published: form.published,
      }

      const savedVehicle = vehicleId
        ? await vehicleApi.updateAdminVehicle(vehicleId, payload)
        : await vehicleApi.createAdminVehicle(payload)

      for (let index = 0; index < selectedFiles.length; index += 1) {
        await vehicleApi.uploadAdminVehicleMedia(
          savedVehicle.id,
          selectedFiles[index],
          existingMedia.length + index,
        )
      }

      navigate('/backoffice/vehicles')
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Impossible de sauvegarder le vehicule',
      )
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        Chargement...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {vehicleId ? 'Modifier un vehicule' : 'Ajouter un vehicule'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {vehicleId
            ? 'Mettre a jour les informations et les medias du vehicule.'
            : 'Creer une nouvelle fiche vehicule et joindre ses images par glisser-deposer.'}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Informations vehicule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Marque</span>
              <input
                className="h-10 w-full rounded-md border px-3"
                value={form.brand}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    brand: event.target.value,
                  }))
                }
                placeholder="Peugeot"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Modele / titre</span>
              <input
                className="h-10 w-full rounded-md border px-3"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="3008 GT"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Prix</span>
              <input
                className="h-10 w-full rounded-md border px-3"
                type="number"
                min="0"
                step="100"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="26990"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Kilometrage</span>
              <input
                className="h-10 w-full rounded-md border px-3"
                type="number"
                min="0"
                step="1000"
                value={form.mileage}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    mileage: event.target.value,
                  }))
                }
                placeholder="18400"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Places: {form.seatCount}</span>
              <input
                className="w-full"
                type="range"
                min="1"
                max="9"
                value={form.seatCount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    seatCount: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Portes: {form.doorCount}</span>
              <input
                className="w-full"
                type="range"
                min="2"
                max="6"
                value={form.doorCount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    doorCount: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">Couleur</span>
              <input
                className="h-10 w-full rounded-md border px-3"
                value={form.color}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    color: event.target.value,
                  }))
                }
                placeholder="Noir, blanc, gris..."
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">Categorie catalogue</span>
              <select
                className="h-10 w-full rounded-md border px-3"
                value={form.commercialType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    commercialType: event.target.value as VehicleCommercialType,
                  }))
                }
              >
                {COMMERCIAL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="text-muted-foreground">Energie</span>
              <select
                className="h-10 w-full rounded-md border px-3"
                value={form.energy}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    energy: event.target.value as VehicleEnergy,
                  }))
                }
              >
                {ENERGY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published: event.target.checked,
                  }))
                }
              />
              Vehicule visible
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={[
                'rounded-xl border-2 border-dashed p-5 transition',
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30',
              ].join(' ')}
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                addFiles(event.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-muted p-3">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Glisser deposer les images du vehicule</p>
                  <p className="text-sm text-muted-foreground">
                    Formats acceptes: {ACCEPTED_IMAGE_LABEL}
                  </p>
                </div>
                <Button type="button" variant="outline">
                  Choisir des fichiers
                </Button>
              </div>
              <input
                ref={fileInputRef}
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={(event) => {
                  if (event.target.files) {
                    addFiles(event.target.files)
                    event.target.value = ''
                  }
                }}
              />
            </div>

            {galleryItems.length > 0 ? (
              <VehicleGallery items={galleryItems} imageClassName="min-h-[14rem]" />
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                {previewLabel}
              </div>
            )}

            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}:${file.size}:${file.lastModified}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.type || 'Type inconnu'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setSelectedFiles((current) =>
                        current.filter((_, currentIndex) => currentIndex !== index),
                      )
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {existingMedia.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Medias deja enregistres</p>
                {existingMedia.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium">Image #{media.sortOrder + 1}</p>
                      <p className="text-xs text-muted-foreground">{media.downloadUrl}</p>
                    </div>
                    <Badge variant="secondary">Visible dans la galerie</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/backoffice/vehicles')}
        >
          Retour
        </Button>
        {loadedVehicle && (
          <Badge variant="outline">
            Vehicule charge: {loadedVehicle.brand} {loadedVehicle.title}
          </Badge>
        )}
      </div>
    </div>
  )
}
