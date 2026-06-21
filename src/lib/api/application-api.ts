import { apiRequest } from './client'
import type { CreateVehicleApplicationRequest, UpdateApplicationStatusRequest, UpdateVehicleApplicationRequest, VehicleApplication } from '@/lib/application/application-types'

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
  updateMine(applicationId: string, payload: UpdateVehicleApplicationRequest) {
    return apiRequest<VehicleApplication>(`/applications/${applicationId}`, {
      method: 'PATCH',
      body: payload,
    })
  },
  submitMine(applicationId: string) {
    return apiRequest<VehicleApplication>(`/applications/${applicationId}/submit`, {
      method: 'POST',
    })
  },
  listAdmin() {
    return apiRequest<VehicleApplication[]>('/applications/admin')
  },
  getAdmin(applicationId: string) {
    return apiRequest<VehicleApplication>(`/applications/admin/${applicationId}`)
  },
  updateStatusAdmin(applicationId: string, payload: UpdateApplicationStatusRequest) {
    return apiRequest<VehicleApplication>(`/applications/admin/${applicationId}/status`, {
      method: 'PATCH',
      body: payload,
    })
  },
}
