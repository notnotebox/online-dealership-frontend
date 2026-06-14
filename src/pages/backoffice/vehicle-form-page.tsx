import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildVehicleFixtureText, createVehicleFixture } from '@/lib/test-fixtures/vehicle-fixture'
import { downloadTextFile } from '@/lib/test-fixtures/download-text-file'
import { buildVehicleImageUrl } from '@/lib/test-fixtures/vehicle-image'
import type { VehicleEnergy } from '@/lib/api/vehicle-api'

const ENERGY_OPTIONS: { value: VehicleEnergy; label: string }[] = [
  { value: 'GASOLINE', label: 'Essence' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybride' },
  { value: 'ELECTRIC', label: 'Electrique' },
  { value: 'LPG', label: 'GPL' },
  { value: 'OTHER', label: 'Autre' },
]

const TRANSMISSION_OPTIONS = ['Automatique', 'Manuelle']

function toCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ')
}

export function BackofficeVehicleFormPage() {
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [title, setTitle] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [energy, setEnergy] = useState<VehicleEnergy>('GASOLINE')
  const [transmission, setTransmission] = useState('Automatique')
  const [seats, setSeats] = useState('5')
  const [doors, setDoors] = useState('5')
  const [price, setPrice] = useState('')
  const [monthlyPrice, setMonthlyPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [equipments, setEquipments] = useState('GPS, Camera de recul, CarPlay')
  const [published, setPublished] = useState(true)

  function applyFixture() {
    const fixture = createVehicleFixture()
    setBrand(fixture.brand)
    setModel(fixture.model)
    setTitle(fixture.title)
    setYear(String(fixture.year))
    setMileage(String(fixture.mileage))
    setEnergy(fixture.energy)
    setTransmission(fixture.transmission)
    setSeats(String(fixture.seats))
    setDoors(String(fixture.doors))
    setPrice(String(fixture.price))
    setMonthlyPrice(String(fixture.monthlyPrice))
    setImageUrl(fixture.imageUrl)
    setDescription(fixture.description)
    setEquipments(fixture.equipments.join(', '))
    setPublished(fixture.published)

    downloadTextFile(
      `vehicle-fixture-${fixture.brand.toLowerCase()}-${fixture.model.toLowerCase()}.txt`,
      buildVehicleFixtureText(fixture),
    )
  }

  function refreshImageFromName(nextBrand = brand, nextModel = model) {
    if (!nextBrand.trim() || !nextModel.trim()) {
      return
    }

    setImageUrl(buildVehicleImageUrl(nextBrand, nextModel))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Creation / edition vehicule</h1>
        <p className="text-sm text-muted-foreground">
          Le bloc ci-dessous sert au back-office et au jeu de donnees de test, pas au parcours client.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-amber-400/60 bg-amber-50/60 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Outil de test formateurs</p>
          <p className="text-xs text-amber-900/80 dark:text-amber-100/80">
            Remplit la fiche avec un vehicule coherent et telecharge un fichier texte de reference.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full border-amber-500/50 text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-500/20"
          onClick={applyFixture}
        >
          Generer un vehicule de test
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
          <input
            className="h-10 rounded border px-3"
            placeholder="Marque"
            value={brand}
            onChange={(event) => {
              setBrand(event.target.value)
              refreshImageFromName(event.target.value, model)
            }}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Modele"
            value={model}
            onChange={(event) => {
              setModel(event.target.value)
              refreshImageFromName(brand, event.target.value)
            }}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Titre"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Annee"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Kilometrage"
            value={mileage}
            onChange={(event) => setMileage(event.target.value)}
          />
          <select
            className="h-10 rounded border px-3"
            value={energy}
            onChange={(event) => setEnergy(event.target.value as VehicleEnergy)}
          >
            {ENERGY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded border px-3"
            value={transmission}
            onChange={(event) => setTransmission(event.target.value)}
          >
            {TRANSMISSION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="h-10 rounded border px-3"
            placeholder="Nombre de places"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Nombre de portes"
            value={doors}
            onChange={(event) => setDoors(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Prix achat"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3"
            placeholder="Mensualite location"
            value={monthlyPrice}
            onChange={(event) => setMonthlyPrice(event.target.value)}
          />
          <input
            className="h-10 rounded border px-3 md:col-span-2"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <textarea
            className="min-h-28 rounded border px-3 py-2 md:col-span-2"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <textarea
            className="min-h-24 rounded border px-3 py-2 md:col-span-2"
            placeholder="Equipements, separes par une virgule"
            value={equipments}
            onChange={(event) => setEquipments(event.target.value)}
          />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
            Vehicule publie
          </label>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="overflow-hidden rounded-lg border bg-muted">
            {imageUrl ? (
              <img src={imageUrl} alt={title || `${brand} ${model}`.trim() || 'Vehicule de test'} className="h-48 w-full object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                Image de test a generer
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Marque:</span> {brand || 'Non renseigne'}</p>
            <p><span className="font-medium">Modele:</span> {model || 'Non renseigne'}</p>
            <p><span className="font-medium">Places:</span> {seats || 'Non renseigne'}</p>
            <p><span className="font-medium">Carburant:</span> {energy}</p>
            <p><span className="font-medium">Transmission:</span> {transmission}</p>
            <p><span className="font-medium">Equipements:</span> {toCsv(equipments) || 'Non renseigne'}</p>
          </div>
        </div>
      </div>

      <Button>Enregistrer</Button>
    </div>
  )
}
