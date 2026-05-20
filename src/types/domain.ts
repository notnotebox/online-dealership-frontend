export type VehicleMode = 'buy' | 'rent'

export type Vehicle = {
  id: string
  brand: string
  model: string
  year: number
  mileage: number
  fuel: string
  transmission: string
  seats?: number
  doors?: number
  description?: string
  equipments?: string[]
  worksDone?: string[]
  status: 'draft' | 'published' | 'archived'
  availability: boolean
  mode: VehicleMode
  price?: number
  monthlyPrice?: number
  images: string[]
}

export type CustomerFileStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'missing-documents'
  | 'approved'
  | 'rejected'

export type CustomerFile = {
  id: string
  vehicleId: string
  customerId: string
  status: CustomerFileStatus
  createdAt: string
  updatedAt: string
  comment?: string
}

export type UploadedDocument = {
  id: string
  label: string
  fileName: string
  status: 'missing' | 'uploaded' | 'validated' | 'rejected'
  url?: string
}
