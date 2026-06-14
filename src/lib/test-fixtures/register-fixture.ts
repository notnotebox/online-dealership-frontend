const FIRST_NAMES = ['Alex', 'Camille', 'Jordan', 'Lina', 'Noah', 'Sofia', 'Malo', 'Ines']
const LAST_NAMES = ['Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Durand', 'Dubois', 'Moreau']

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomEmail(firstName: string, lastName: string) {
  const suffix = Math.floor(100 + Math.random() * 900)
  const clean = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9.]/g, '')
  return `${clean}${suffix}@example.com`
}

function randomBirthDate() {
  const now = new Date()
  const age = 21 + Math.floor(Math.random() * 18)
  const year = now.getFullYear() - age
  const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')
  const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function randomPassword() {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `Test${randomItem(FIRST_NAMES)}!${digits}`
}

export type RegisterFixture = {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  password: string
}

export function createRegisterFixture(): RegisterFixture {
  const firstName = randomItem(FIRST_NAMES)
  const lastName = randomItem(LAST_NAMES)
  const email = randomEmail(firstName, lastName)
  const dateOfBirth = randomBirthDate()
  const password = randomPassword()

  return {
    firstName,
    lastName,
    email,
    dateOfBirth,
    password,
  }
}

export function buildRegisterFixtureText(data: RegisterFixture) {
  return [
    `firstName=${data.firstName}`,
    `lastName=${data.lastName}`,
    `email=${data.email}`,
    `dateOfBirth=${data.dateOfBirth}`,
    `password=${data.password}`,
    `confirmPassword=${data.password}`,
    'acceptedTerms=true',
  ].join('\n')
}
