import type { VehicleEnergy } from '@/lib/api/vehicle-api'
import { buildVehicleImageUrl } from './vehicle-image'

const BRANDS = ['Peugeot', 'Renault', 'Citroen', 'Volkswagen', 'Tesla', 'Toyota', 'BMW', 'Audi']
const MODELS = ['208', 'Clio', 'C3', 'Golf', 'Model 3', 'Corolla', 'Serie 1', 'A3']
const ENERGIES: VehicleEnergy[] = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC']
const TRANSMISSIONS = ['Automatique', 'Manuelle']
const EQUIPMENTS = ['GPS', 'Camera de recul', 'CarPlay', 'Bluetooth', 'Regulateur', 'Climatisation']

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomNumber(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1))
}

function randomPrice(min: number, max: number) {
  return randomNumber(min, max)
}

function pickSeveral(items: string[], count: number) {
  const copied = [...items]
  const picked: string[] = []

  while (picked.length < count && copied.length > 0) {
    const index = Math.floor(Math.random() * copied.length)
    picked.push(copied.splice(index, 1)[0])
  }

  return picked
}

export type VehicleFixture = {
  brand: string
  model: string
  title: string
  year: number
  mileage: number
  energy: VehicleEnergy
  transmission: string
  seats: number
  doors: number
  price: number
  monthlyPrice: number
  imageUrl: string
  description: string
  equipments: string[]
  worksDone: string[]
  published: boolean
}

export function createVehicleFixture(): VehicleFixture {
  const brand = randomItem(BRANDS)
  const model = randomItem(MODELS)
  const year = randomNumber(2019, 2025)
  const mileage = randomNumber(5_000, 85_000)
  const energy = randomItem(ENERGIES)
  const transmission = randomItem(TRANSMISSIONS)
  const seats = randomItem([2, 4, 5, 5, 5, 7])
  const doors = seats >= 5 ? 5 : 3
  const price = randomPrice(15_000, 58_000)
  const monthlyPrice = randomPrice(189, 899)
  const imageUrl = buildVehicleImageUrl(brand, model, `${brand}-${model}-${year}`)

  return {
    brand,
    model,
    title: `${brand} ${model}`,
    year,
    mileage,
    energy,
    transmission,
    seats,
    doors,
    price,
    monthlyPrice,
    imageUrl,
    description: `Vehicule de demonstration pour la phase de test, avec ${energy.toLowerCase()} et ${transmission.toLowerCase()}.`,
    equipments: pickSeveral(EQUIPMENTS, 3),
    worksDone: ['Revision complete', 'Controle technique ok'],
    published: true,
  }
}

export function buildVehicleFixtureText(data: VehicleFixture) {
  return [
    `brand=${data.brand}`,
    `model=${data.model}`,
    `title=${data.title}`,
    `year=${data.year}`,
    `mileage=${data.mileage}`,
    `energy=${data.energy}`,
    `transmission=${data.transmission}`,
    `seats=${data.seats}`,
    `doors=${data.doors}`,
    `price=${data.price}`,
    `monthlyPrice=${data.monthlyPrice}`,
    `published=${data.published}`,
    `imageUrl=${data.imageUrl}`,
    `description=${data.description}`,
    `equipments=${data.equipments.join(', ')}`,
    `worksDone=${data.worksDone.join(', ')}`,
  ].join('\n')
}
