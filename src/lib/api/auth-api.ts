import { apiRequest } from './client'
import type { AuthResponse, FavoritesResponse, UserProfile } from '@/lib/auth/auth-types'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  password: string
}

export type UpdateProfileRequest = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  phoneNumber?: string
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  city?: string
  country?: string
  nationality?: string
  familyStatus?: string
  householdSize?: number
  professionalStatus?: string
  monthlyIncome?: number | string
  monthlyCharges?: number | string
  iban?: string
}

export type FavoriteVehicleId = string

export const authApi = {
  login(payload: LoginRequest) {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    })
  },
  register(payload: RegisterRequest) {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    })
  },
  me() {
    return apiRequest<UserProfile>('/users/me')
  },
  updateProfile(payload: UpdateProfileRequest) {
    return apiRequest<UserProfile>('/users/me', {
      method: 'PATCH',
      body: payload,
    })
  },
  favorites() {
    return apiRequest<FavoritesResponse>('/users/me/favorites')
  },
  addFavorite(vehicleId: FavoriteVehicleId) {
    return apiRequest<FavoritesResponse>(`/users/me/favorites/${vehicleId}`, {
      method: 'POST',
    })
  },
  removeFavorite(vehicleId: FavoriteVehicleId) {
    return apiRequest<FavoritesResponse>(`/users/me/favorites/${vehicleId}`, {
      method: 'DELETE',
    })
  },
  logout() {
    return apiRequest<void>('/auth/logout', {
      method: 'POST',
    })
  },
}
