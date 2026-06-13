import type { UserProfile } from '@/lib/auth/auth-types'

export type ProfileFieldKey =
  | 'firstName'
  | 'lastName'
  | 'dateOfBirth'
  | 'phoneNumber'
  | 'addressLine1'
  | 'postalCode'
  | 'city'
  | 'country'
  | 'nationality'
  | 'familyStatus'
  | 'householdSize'
  | 'professionalStatus'
  | 'monthlyIncome'
  | 'monthlyCharges'
  | 'iban'

type ProfileFieldDescriptor = {
  key: ProfileFieldKey
  label: string
}

export const PROFILE_FIELDS: ProfileFieldDescriptor[] = [
  { key: 'firstName', label: 'Prénom' },
  { key: 'lastName', label: 'Nom' },
  { key: 'dateOfBirth', label: 'Date de naissance' },
  { key: 'phoneNumber', label: 'Téléphone' },
  { key: 'addressLine1', label: 'Adresse' },
  { key: 'postalCode', label: 'Code postal' },
  { key: 'city', label: 'Ville' },
  { key: 'country', label: 'Pays' },
  { key: 'nationality', label: 'Nationalité' },
  { key: 'familyStatus', label: 'Situation familiale' },
  { key: 'householdSize', label: 'Nombre de personnes au foyer' },
  { key: 'professionalStatus', label: 'Situation professionnelle' },
  { key: 'monthlyIncome', label: 'Revenus mensuels' },
  { key: 'monthlyCharges', label: 'Charges mensuelles' },
  { key: 'iban', label: 'IBAN' },
]

function hasValue(value: unknown) {
  if (value == null) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  return true
}

export function getProfileCompletionPercent(profile: Partial<UserProfile> | null | undefined) {
  if (!profile) {
    return 0
  }

  const completed = PROFILE_FIELDS.filter((field) => hasValue(profile[field.key])).length
  return Math.round((completed * 1000) / PROFILE_FIELDS.length) / 10
}

export function getMissingProfileFields(profile: Partial<UserProfile> | null | undefined) {
  if (!profile) {
    return PROFILE_FIELDS.map((field) => field.label)
  }

  return PROFILE_FIELDS.filter((field) => !hasValue(profile[field.key])).map((field) => field.label)
}
