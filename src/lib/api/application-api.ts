import { apiRequest } from './client'
import type { CreateVehicleApplicationRequest, VehicleApplication } from '@/lib/application/application-types'

export const applicationApi = {
  create(payload: CreateVehicleApplicationRequest) {
    return apiRequest<VehicleApplication>('/applications', {
      method: 'POST',
      body: payload,
    })
  },
  listMine() {
    return apiRequest<VehicleApplication[]>('/applications/me')
  },
  getMine(applicationId: string) {
    return apiRequest<VehicleApplication>(`/applications/${applicationId}`)
  },
}
