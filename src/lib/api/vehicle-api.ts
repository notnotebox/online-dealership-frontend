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

export const vehicleApi = {
  listPublicVehicles() {
    return apiRequest<VehicleResponse[]>('/catalog/vehicles')
  },
  getPublicVehicle(vehicleId: string) {
    return apiRequest<VehicleResponse>(`/catalog/vehicles/${vehicleId}`)
  },
}
