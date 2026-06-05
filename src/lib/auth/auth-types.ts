export type AuthRole = 'CLIENT' | 'MANAGER' | 'ADMIN'

export type AuthResponse = {
  token: string
  userId: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  role: AuthRole
}

export type UserProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth: string
  role: AuthRole
  createdAt: string
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
