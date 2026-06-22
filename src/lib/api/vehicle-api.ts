import { apiRequest } from './client'

export type VehicleEnergy = 'GASOLINE' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'OTHER'

export type VehicleResponse = {
  id: string
  title: string
  brand: string
  price: string
  energy: VehicleEnergy
  mileage: number
  seatCount: number
  doorCount: number
  color: string
  published: boolean
  updatedAt: string
  imageUrl: string | null
}

export type AdminVehicleResponse = {
  id: string
  title: string
  brand: string
  price: string
  energy: VehicleEnergy
  mileage: number
  seatCount: number
  doorCount: number
  color: string
  published: boolean
  archived: boolean
  updatedAt: string
  imageUrl: string | null
  createdBy: string | null
  createdAt: string
}

export type VehicleMediaResponse = {
  id: string
  vehicleId: string
  sortOrder: number
  downloadUrl: string
}

export type CreateVehiclePayload = {
  title: string
  brand: string
  price: string | number
  energy: VehicleEnergy
  mileage: number
  seatCount: number
  doorCount: number
  color: string
  published: boolean
}

type PublicVehicleFilters = {
  brand?: string
  energy?: VehicleEnergy
  maxPrice?: number
}

type AdminVehicleFilters = {
  query?: string
  status?: 'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'
  energy?: VehicleEnergy
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

function buildAdminQueryString(filters?: AdminVehicleFilters) {
  if (!filters) {
    return ''
  }

  const params = new URLSearchParams()
  if (filters.query) {
    params.set('query', filters.query)
  }
  if (filters.status && filters.status !== 'ALL') {
    params.set('status', filters.status)
  }
  if (filters.energy) {
    params.set('energy', filters.energy)
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
  listAdminVehicles(filters?: AdminVehicleFilters) {
    return apiRequest<AdminVehicleResponse[]>(`/admin/vehicles${buildAdminQueryString(filters)}`)
  },
  getAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}`)
  },
  createAdminVehicle(payload: CreateVehiclePayload) {
    return apiRequest<AdminVehicleResponse>('/admin/vehicles', {
      method: 'POST',
      body: payload,
    })
  },
  updateAdminVehicle(vehicleId: string, payload: CreateVehiclePayload) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: payload,
    })
  },
  deleteAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}`, {
      method: 'DELETE',
    })
  },
  publishAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}/publish`, {
      method: 'PATCH',
    })
  },
  unpublishAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}/unpublish`, {
      method: 'PATCH',
    })
  },
  archiveAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}/archive`, {
      method: 'PATCH',
    })
  },
  unarchiveAdminVehicle(vehicleId: string) {
    return apiRequest<AdminVehicleResponse>(`/admin/vehicles/${vehicleId}/unarchive`, {
      method: 'PATCH',
    })
  },
  uploadAdminVehicleMedia(vehicleId: string, file: File, sortOrder = 0) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('sortOrder', String(sortOrder))

    return apiRequest<VehicleMediaResponse>(`/admin/vehicles/${vehicleId}/media`, {
      method: 'POST',
      body: formData,
    })
  },
  listAdminVehicleMedia(vehicleId: string) {
    return apiRequest<VehicleMediaResponse[]>(`/admin/vehicles/${vehicleId}/media`)
  },
  listPublicVehicleMedia(vehicleId: string) {
    return apiRequest<VehicleMediaResponse[]>(`/catalog/vehicles/${vehicleId}/media`)
  },
}
