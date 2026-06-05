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
}
