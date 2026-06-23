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

export type ProfileFieldDescriptor = {
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

export const PROFILE_FIELD_KEYS = PROFILE_FIELDS.map((field) => field.key)
export const PROFILE_FIELD_LABEL_BY_KEY: Record<ProfileFieldKey, string> = PROFILE_FIELDS.reduce(
  (accumulator, field) => ({ ...accumulator, [field.key]: field.label }),
  {} as Record<ProfileFieldKey, string>,
)

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

export function getMissingProfileFieldKeys(profile: Partial<UserProfile> | null | undefined) {
  if (!profile) {
    return [...PROFILE_FIELD_KEYS]
  }

  return PROFILE_FIELDS.filter((field) => !hasValue(profile[field.key])).map((field) => field.key)
}

export function getMissingProfileFields(profile: Partial<UserProfile> | null | undefined) {
  return getMissingProfileFieldKeys(profile).map((key) => PROFILE_FIELD_LABEL_BY_KEY[key])
}

export function isProfileFieldMissing(profile: Partial<UserProfile> | null | undefined, field: ProfileFieldKey) {
  return getMissingProfileFieldKeys(profile).includes(field)
}
