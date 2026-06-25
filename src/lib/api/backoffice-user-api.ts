import { apiRequest } from './client'
import type { AdminUserDetail, AdminUserSummary, AuthRole, UserProfile } from '@/lib/auth/auth-types'

export const backofficeUserApi = {
  listStaff() {
    return apiRequest<AdminUserSummary[]>('/users/admin/staff')
  },
  listClients() {
    return apiRequest<AdminUserSummary[]>('/users/admin/clients')
  },
  getUserDetail(userId: string) {
    return apiRequest<AdminUserDetail>(`/users/admin/${userId}`)
  },
  updateUserRole(userId: string, role: Extract<AuthRole, 'CLIENT' | 'MANAGER'>) {
    return apiRequest<UserProfile>(`/users/admin/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    })
  },
}
