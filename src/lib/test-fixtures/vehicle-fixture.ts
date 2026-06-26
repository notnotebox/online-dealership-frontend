import type { VehicleEnergy } from '@/lib/api/vehicle-api'
import { buildVehicleImageUrl } from '@/lib/images/vehicle-image'

const VEHICLE_FIXTURES = [
  {
    brand: 'Peugeot',
    model: '206',
    year: 2005,
    mileage: 212_000,
    energy: 'GASOLINE' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 5,
    price: 1_900,
    monthlyPrice: 79,
    title: 'Peugeot 206',
    description: 'Petite citadine fatiguée mais roulante, carrosserie propre sans chichis.',
    equipments: ['Autoradio', 'Vitres electriques', 'Airbags'],
    worksDone: ['Freins controles', 'Pneus corrects'],
    bodyColor: '#c3c0b8',
    accentColor: '#6f6a63',
    badgeColor: '#b9a37a',
    windowColor: '#75808a',
    rustColor: '#a36a3c',
  },
  {
    brand: 'Renault',
    model: 'Clio 2',
    year: 2004,
    mileage: 235_000,
    energy: 'DIESEL' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 5,
    price: 1_700,
    monthlyPrice: 69,
    title: 'Renault Clio 2',
    description: 'Petit diesel de campagne, quelques traces de vie mais un état encore acceptable.',
    equipments: ['Direction assistée', 'Radio', 'Climatisation'],
    worksDone: ['Courroie recente', 'Vidange faite'],
    bodyColor: '#a9b2a6',
    accentColor: '#717a6a',
    badgeColor: '#8d9b84',
    windowColor: '#6f7f88',
    rustColor: '#8c5b34',
  },
  {
    brand: 'Citroen',
    model: 'C3',
    year: 2008,
    mileage: 198_000,
    energy: 'GASOLINE' as VehicleEnergy,
    transmission: 'Automatique',
    seats: 5,
    doors: 5,
    price: 2_400,
    monthlyPrice: 89,
    title: 'Citroen C3',
    description: 'Compacte ancienne, un peu marquée par les années mais propre globalement.',
    equipments: ['Bluetooth', 'Radar de recul', 'Regulateur'],
    worksDone: ['Plaquettes changees', 'Batterie recente'],
    bodyColor: '#d0c3b2',
    accentColor: '#7d6859',
    badgeColor: '#a48d75',
    windowColor: '#768490',
    rustColor: '#9b6a3f',
  },
  {
    brand: 'Volkswagen',
    model: 'Golf 5',
    year: 2007,
    mileage: 221_000,
    energy: 'DIESEL' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 5,
    price: 2_900,
    monthlyPrice: 99,
    title: 'Volkswagen Golf 5',
    description: 'Compacte diesel propre de loin, avec quelques traces d’usage normales.',
    equipments: ['Climatisation', 'GPS', 'Vitres electriques'],
    worksDone: ['Revision complete', 'Pneus remplaces'],
    bodyColor: '#b7bbb8',
    accentColor: '#6c6f6d',
    badgeColor: '#9ba19f',
    windowColor: '#70808b',
    rustColor: '#88603b',
  },
  {
    brand: 'Toyota',
    model: 'Yaris',
    year: 2010,
    mileage: 176_000,
    energy: 'HYBRID' as VehicleEnergy,
    transmission: 'Automatique',
    seats: 5,
    doors: 5,
    price: 4_200,
    monthlyPrice: 129,
    title: 'Toyota Yaris',
    description: 'Petite hybride bien entretenue, un peu fatiguée mais encore sérieuse.',
    equipments: ['Camera de recul', 'Bluetooth', 'Climatisation auto'],
    worksDone: ['Freins ok', 'Petit entretien fait'],
    bodyColor: '#d8d2c7',
    accentColor: '#7b736b',
    badgeColor: '#b5a69a',
    windowColor: '#6e7a86',
    rustColor: '#97653f',
  },
  {
    brand: 'Ford',
    model: 'Focus',
    year: 2009,
    mileage: 214_000,
    energy: 'DIESEL' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 5,
    price: 3_100,
    monthlyPrice: 109,
    title: 'Ford Focus',
    description: 'Compacte robuste avec un look de quotidien, rien de brillant mais ça tient.',
    equipments: ['Air conditionne', 'USB', 'Regulateur'],
    worksDone: ['Vidange recente', 'Courroie controlee'],
    bodyColor: '#bcb6ac',
    accentColor: '#6e685f',
    badgeColor: '#a39482',
    windowColor: '#677685',
    rustColor: '#8d5f38',
  },
  {
    brand: 'BMW',
    model: 'Serie 3 E46',
    year: 2002,
    mileage: 248_000,
    energy: 'GASOLINE' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 4,
    price: 4_500,
    monthlyPrice: 149,
    title: 'BMW Serie 3 E46',
    description: 'Berline ancienne qui a vécu, saine mécaniquement malgré son âge.',
    equipments: ['Cuir', 'Toit ouvrant', 'Climatisation'],
    worksDone: ['Suspensions revues', 'Pneus corrects'],
    bodyColor: '#9ea4ad',
    accentColor: '#636a73',
    badgeColor: '#7f8893',
    windowColor: '#717d8a',
    rustColor: '#8a5d39',
  },
  {
    brand: 'Audi',
    model: 'A3',
    year: 2011,
    mileage: 189_000,
    energy: 'DIESEL' as VehicleEnergy,
    transmission: 'Automatique',
    seats: 5,
    doors: 5,
    price: 5_300,
    monthlyPrice: 169,
    title: 'Audi A3',
    description: 'Compacte premium sans excès, propre et encore presentable.',
    equipments: ['Bluetooth', 'Xenon', 'Radar de stationnement'],
    worksDone: ['Revision ok', 'Disques controles'],
    bodyColor: '#bcc3ca',
    accentColor: '#6d747c',
    badgeColor: '#a1adb6',
    windowColor: '#75808d',
    rustColor: '#936b42',
  },
  {
    brand: 'Opel',
    model: 'Astra',
    year: 2006,
    mileage: 228_000,
    energy: 'DIESEL' as VehicleEnergy,
    transmission: 'Manuelle',
    seats: 5,
    doors: 5,
    price: 1_800,
    monthlyPrice: 75,
    title: 'Opel Astra',
    description: 'Voiture simple et honnête, marquée par les années mais encore exploitable.',
    equipments: ['Radio', 'Vitres electriques', 'Climatisation manuelle'],
    worksDone: ['Filtre change', 'Pneus ok'],
    bodyColor: '#c5c1bb',
    accentColor: '#726d66',
    badgeColor: '#a99885',
    windowColor: '#75818b',
    rustColor: '#a16f42',
  },
  {
    brand: 'Skoda',
    model: 'Octavia',
    year: 2012,
    mileage: 167_000,
    energy: 'GASOLINE' as VehicleEnergy,
    transmission: 'Automatique',
    seats: 5,
    doors: 5,
    price: 5_900,
    monthlyPrice: 179,
    title: 'Skoda Octavia',
    description: 'Grande routière sobre, un peu fatiguée visuellement mais sérieuse.',
    equipments: ['GPS', 'Bluetooth', 'Regulateur adaptatif'],
    worksDone: ['Revision complete', 'Suspensions controlees'],
    bodyColor: '#d7d4cd',
    accentColor: '#7b766f',
    badgeColor: '#b0a89a',
    windowColor: '#717e8a',
    rustColor: '#987046',
  },
] as const

let remainingIndexes = VEHICLE_FIXTURES.map((_, index) => index)

function randomIndexFromRemaining() {
  if (remainingIndexes.length === 0) {
    remainingIndexes = VEHICLE_FIXTURES.map((_, index) => index)
  }

  const slot = Math.floor(Math.random() * remainingIndexes.length)
  const [nextIndex] = remainingIndexes.splice(slot, 1)
  return nextIndex
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
  commercialType: 'PURCHASE' | 'LEASE'
  published: boolean
}

export function createVehicleFixture(): VehicleFixture {
  const template = VEHICLE_FIXTURES[randomIndexFromRemaining()]

  return {
    brand: template.brand,
    model: template.model,
    title: template.title,
    year: template.year,
    mileage: template.mileage,
    energy: template.energy,
    transmission: template.transmission,
    seats: template.seats,
    doors: template.doors,
    price: template.price,
    monthlyPrice: template.monthlyPrice,
    imageUrl: buildVehicleImageUrl(),
    description: template.description,
    equipments: [...template.equipments],
    worksDone: [...template.worksDone],
    commercialType: Math.random() > 0.5 ? 'PURCHASE' : 'LEASE',
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
    `commercialType=${data.commercialType}`,
    `published=${data.published}`,
    `imageUrl=${data.imageUrl}`,
    `description=${data.description}`,
    `equipments=${data.equipments.join(', ')}`,
    `worksDone=${data.worksDone.join(', ')}`,
  ].join('\n')
}
