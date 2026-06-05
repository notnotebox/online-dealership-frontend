import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/auth/auth-context'

export function ProtectedRoute() {
  const { isReady, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

export function ClientRoute() {
  const { isReady, isAuthenticated } = useAuth()

  if (!isReady) {
    return null
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function StaffRoute() {
  const { isReady, isAuthenticated, isStaff } = useAuth()

  if (!isReady) {
    return null
  }

  return isAuthenticated && isStaff ? <Outlet /> : <Navigate to="/login" replace />
}
