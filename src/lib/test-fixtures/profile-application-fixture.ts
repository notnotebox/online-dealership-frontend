const FIRST_NAMES = ['Alex', 'Camille', 'Jordan', 'Lina', 'Noah', 'Sofia', 'Malo', 'Ines']
const LAST_NAMES = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Durand', 'Dubois', 'Moreau']
const PROFESSIONAL_STATUSES = ['CDI', 'CDD', 'Indépendant', 'Fonctionnaire', 'Retraité', 'Étudiant']
const FAMILY_STATUSES = ['Célibataire', 'Marié', 'Pacsé', 'En union', 'Divorcé']
const NATIONALITIES = ['Française', 'Belge', 'Suisse', 'Portugaise', 'Espagnole']
const CITIES = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nantes']
const STREETS = ['Paix', 'République', 'Liberté', 'Victoire', 'Gare']

function randomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('')
}

function randomBirthDate() {
  const now = new Date()
  const age = 24 + Math.floor(Math.random() * 20)
  const year = now.getFullYear() - age
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function randomFutureDate() {
  const date = new Date()
  date.setDate(date.getDate() + 15 + Math.floor(Math.random() * 120))
  return date.toISOString().slice(0, 10)
}

export type ProfileFixture = {
  firstName: string
  lastName: string
  dateOfBirth: string
  phoneNumber: string
  addressLine1: string
  addressLine2: string
  postalCode: string
  city: string
  country: string
  nationality: string
  familyStatus: string
  householdSize: string
  professionalStatus: string
  monthlyIncome: string
  monthlyCharges: string
  iban: string
}

export type ApplicationFixture = ProfileFixture & {
  acquisitionType: 'CASH' | 'CREDIT' | 'LOA' | 'LLD'
  durationMonths: string
  annualMileage: string
  contributionAmount: string
  expectedStartDate: string
  tradeInDescription: string
  insuranceIncluded: boolean
  warrantyIncluded: boolean
  assistanceIncluded: boolean
  maintenanceIncluded: boolean
  comment: string
}

export function createProfileFixture(): ProfileFixture {
  return {
    firstName: randomItem(FIRST_NAMES),
    lastName: randomItem(LAST_NAMES),
    dateOfBirth: randomBirthDate(),
    phoneNumber: `06${randomDigits(8)}`,
    addressLine1: `${Math.floor(10 + Math.random() * 180)} Rue de la ${randomItem(STREETS)}`,
    addressLine2: Math.random() > 0.6 ? `Bâtiment ${randomItem(['A', 'B', 'C'])}` : '',
    postalCode: String(Math.floor(10000 + Math.random() * 89999)),
    city: randomItem(CITIES),
    country: 'France',
    nationality: randomItem(NATIONALITIES),
    familyStatus: randomItem(FAMILY_STATUSES),
    householdSize: String(1 + Math.floor(Math.random() * 4)),
    professionalStatus: randomItem(PROFESSIONAL_STATUSES),
    monthlyIncome: String(1800 + Math.floor(Math.random() * 5200)),
    monthlyCharges: String(300 + Math.floor(Math.random() * 1800)),
    iban: `FR${randomDigits(2)}${randomDigits(2)}${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}${randomDigits(4)}${randomDigits(2)}`,
  }
}

export function createApplicationFixture(): ApplicationFixture {
  const profile = createProfileFixture()
  return {
    ...profile,
    acquisitionType: randomItem(['CASH', 'CREDIT', 'LOA', 'LLD']),
    durationMonths: String(randomItem([24, 36, 48, 60])),
    annualMileage: String(randomItem([10000, 12000, 15000, 18000, 20000])),
    contributionAmount: String(randomItem([0, 1500, 3000, 5000, 8000])),
    expectedStartDate: randomFutureDate(),
    tradeInDescription: Math.random() > 0.5 ? 'Reprise à estimer' : '',
    insuranceIncluded: Math.random() > 0.5,
    warrantyIncluded: Math.random() > 0.5,
    assistanceIncluded: Math.random() > 0.5,
    maintenanceIncluded: Math.random() > 0.5,
    comment: 'Génération de test pour le parcours client.',
  }
}

export function buildProfileFixtureText(data: ProfileFixture) {
  return [
    `firstName=${data.firstName}`,
    `lastName=${data.lastName}`,
    `dateOfBirth=${data.dateOfBirth}`,
    `phoneNumber=${data.phoneNumber}`,
    `addressLine1=${data.addressLine1}`,
    `addressLine2=${data.addressLine2}`,
    `postalCode=${data.postalCode}`,
    `city=${data.city}`,
    `country=${data.country}`,
    `nationality=${data.nationality}`,
    `familyStatus=${data.familyStatus}`,
    `householdSize=${data.householdSize}`,
    `professionalStatus=${data.professionalStatus}`,
    `monthlyIncome=${data.monthlyIncome}`,
    `monthlyCharges=${data.monthlyCharges}`,
    `iban=${data.iban}`,
  ].join('\n')
}

export function buildApplicationFixtureText(data: ApplicationFixture, vehicle?: { id?: string; brand?: string; title?: string } | null) {
  return [
    `vehicleId=${vehicle?.id ?? ''}`,
    `vehicleTitle=${vehicle ? `${vehicle.brand ?? ''} ${vehicle.title ?? ''}`.trim() : ''}`,
    `acquisitionType=${data.acquisitionType}`,
    buildProfileFixtureText(data),
    `durationMonths=${data.durationMonths}`,
    `annualMileage=${data.annualMileage}`,
    `contributionAmount=${data.contributionAmount}`,
    `expectedStartDate=${data.expectedStartDate}`,
    `tradeInDescription=${data.tradeInDescription}`,
    `insuranceIncluded=${data.insuranceIncluded}`,
    `warrantyIncluded=${data.warrantyIncluded}`,
    `assistanceIncluded=${data.assistanceIncluded}`,
    `maintenanceIncluded=${data.maintenanceIncluded}`,
    `comment=${data.comment}`,
  ].join('\n')
}
