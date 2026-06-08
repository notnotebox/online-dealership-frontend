export type AuthRole = 'CLIENT' | 'MANAGER' | 'ADMIN'

export type AuthResponse = {
  token: string
  userId: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  role: AuthRole
  createdAt?: string
}

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  role: AuthRole
  phoneNumber?: string | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
  city?: string | null
  country?: string | null
  nationality?: string | null
  familyStatus?: string | null
  householdSize?: number | null
  professionalStatus?: string | null
  monthlyIncome?: number | string | null
  monthlyCharges?: number | string | null
  iban?: string | null
  createdAt: string
  profileCompletionPercent?: number
}

export type FavoriteVehicle = {
  id: string
  title: string
  brand: string
  price: string | number | null
  energy: string
  mileage: number | null
  published: boolean
}

export type FavoritesResponse = {
  favorites: FavoriteVehicle[]
}

export type AuthSession = {
  token: string
  user: AuthResponse
}
