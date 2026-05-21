import { Navigate, Outlet } from 'react-router-dom'
import { mockAuth } from '@/lib/constants/mock-auth'

export function ProtectedRoute() {
  return mockAuth.loggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

export function ClientRoute() {
  return mockAuth.loggedIn && mockAuth.role !== 'guest' ? <Outlet /> : <Navigate to="/login" replace />
}

export function StaffRoute() {
  return mockAuth.loggedIn && mockAuth.role === 'staff' ? <Outlet /> : <Navigate to="/backoffice/login" replace />
}
