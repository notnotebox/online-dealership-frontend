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
  const { isReady, isAuthenticated, isStaff, isClient } = useAuth()

  if (!isReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isStaff && isClient) {
    return <Navigate to="/app/dashboard" replace />
  }

  return isStaff ? <Outlet /> : <Navigate to="/login" replace />
}

export function AdminRoute() {
  const { isReady, isAuthenticated, isAdmin, isStaff } = useAuth()

  if (!isReady) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin && isStaff) {
    return <Navigate to="/backoffice/dashboard" replace />
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />
}
