import { apiRequest } from './client'

export type VehicleEnergy = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'OTHER'

export type VehicleResponse = {
  id: string
  title: string
  brand: string
  price: string
  energy: VehicleEnergy
  mileage: number
  published: boolean
}

type PublicVehicleFilters = {
  brand?: string
  energy?: VehicleEnergy
  maxPrice?: number
}

function buildQueryString(filters?: PublicVehicleFilters) {
  if (!filters) {
    return ''
  }

  const params = new URLSearchParams()
  if (filters.brand) {
    params.set('brand', filters.brand)
  }
  if (filters.energy) {
    params.set('energy', filters.energy)
  }
  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    params.set('maxPrice', String(filters.maxPrice))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const vehicleApi = {
  listPublicVehicles(filters?: PublicVehicleFilters) {
    return apiRequest<VehicleResponse[]>(`/catalog/vehicles${buildQueryString(filters)}`)
  },
  getPublicVehicle(vehicleId: string) {
    return apiRequest<VehicleResponse>(`/catalog/vehicles/${vehicleId}`)
  },
}
