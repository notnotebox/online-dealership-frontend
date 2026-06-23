export type ApplicationAcquisitionType = 'CASH' | 'CREDIT' | 'LOA' | 'LLD'

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLEMENT_REQUESTED' | 'WAITING_CUSTOMER' | 'APPROVED' | 'REJECTED'

export type ApplicationBoardColumn = 'UNPROCESSED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'

export type VehicleApplication = {
  id: string
  vehicleId: string
  vehicleTitle: string
  vehicleBrand: string
  vehiclePrice: string
  vehicleEnergy: string
  vehicleMileage: number
  acquisitionType: ApplicationAcquisitionType
  status: ApplicationStatus
  boardColumn: ApplicationBoardColumn
  firstName: string
  lastName: string
  dateOfBirth: string | null
  phoneNumber: string
  addressLine1: string
  addressLine2: string | null
  postalCode: string
  city: string
  country: string
  nationality: string
  familyStatus: string
  householdSize: number | null
  professionalStatus: string
  monthlyIncome: number | string | null
  monthlyCharges: number | string | null
  iban: string
  durationMonths: number
  annualMileage: number
  contributionAmount: number | string
  expectedStartDate: string | null
  tradeInDescription: string | null
  insuranceIncluded: boolean
  warrantyIncluded: boolean
  assistanceIncluded: boolean
  maintenanceIncluded: boolean
  comment: string | null
  internalComment: string | null
  applicantId: string
  submittedAt: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  createdAt: string
  updatedAt: string
  profileCompletionPercent: number
}

export type CreateVehicleApplicationRequest = {
  vehicleId: string
  acquisitionType: ApplicationAcquisitionType
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
  durationMonths?: number
  annualMileage?: number
  contributionAmount?: number | string
  expectedStartDate?: string
  tradeInDescription?: string
  insuranceIncluded: boolean
  warrantyIncluded: boolean
  assistanceIncluded: boolean
  maintenanceIncluded: boolean
  comment?: string
}

export type UpdateVehicleApplicationRequest = Partial<CreateVehicleApplicationRequest>

export type UpdateApplicationStatusRequest = {
  status: ApplicationStatus
  internalComment?: string
}
