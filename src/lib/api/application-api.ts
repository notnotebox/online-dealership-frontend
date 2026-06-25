import { apiRequest } from './client'
import type {
  ApplicationStatusHistoryEntry,
  CreateVehicleApplicationRequest,
  UpdateApplicationStatusRequest,
  UpdateVehicleApplicationRequest,
  VehicleApplication,
} from '@/lib/application/application-types'

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
  listHistoryMine(applicationId: string) {
    return apiRequest<ApplicationStatusHistoryEntry[]>(`/applications/${applicationId}/history`)
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
  confirmCustomerAction(applicationId: string) {
    return apiRequest<VehicleApplication>(`/applications/${applicationId}/customer-confirmation`, {
      method: 'POST',
    })
  },
  listAdmin() {
    return apiRequest<VehicleApplication[]>('/applications/admin')
  },
  getAdmin(applicationId: string) {
    return apiRequest<VehicleApplication>(`/applications/admin/${applicationId}`)
  },
  listHistoryAdmin(applicationId: string) {
    return apiRequest<ApplicationStatusHistoryEntry[]>(`/applications/admin/${applicationId}/history`)
  },
  updateStatusAdmin(applicationId: string, payload: UpdateApplicationStatusRequest) {
    return apiRequest<VehicleApplication>(`/applications/admin/${applicationId}/status`, {
      method: 'PATCH',
      body: payload,
    })
  },
}
