import type { DocumentRecord } from '@/lib/documents/document-types'
import type { ApplicationStatus } from '@/lib/application/application-types'

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

export type AdminUserSummary = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: AuthRole
  createdAt: string
  profileCompletionPercent: number
  applicationCount: number
  activeApplicationCount: number
}

export type AdminUserApplicationSummary = {
  id: string
  vehicleId: string
  vehicleBrand: string
  vehicleTitle: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export type AdminUserDetail = {
  profile: UserProfile
  applications: AdminUserApplicationSummary[]
  documents: DocumentRecord[]
}

export type FavoriteVehicle = {
  id: string
  title: string
  brand: string
  price: string | number | null
  energy: string
  mileage: number | null
  seatCount?: number
  doorCount?: number
  color?: string
  commercialType?: 'UNSPECIFIED' | 'PURCHASE' | 'LEASE'
  published: boolean
  imageUrl?: string | null
}

export type FavoritesResponse = {
  favorites: FavoriteVehicle[]
}

export type AuthSession = {
  token: string
  user: AuthResponse
}
