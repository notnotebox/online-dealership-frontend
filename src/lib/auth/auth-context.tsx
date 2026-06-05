import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authApi, type LoginRequest, type RegisterRequest } from '@/lib/api/auth-api'
import { clearStoredSession, getStoredSession, setStoredSession } from '@/lib/auth/auth-storage'
import type { AuthRole, AuthResponse, AuthSession, UserProfile } from './auth-types'

type AuthContextValue = {
  session: AuthSession | null
  profile: UserProfile | null
  isReady: boolean
  isAuthenticated: boolean
  isClient: boolean
  isStaff: boolean
  login: (payload: LoginRequest) => Promise<AuthSession>
  register: (payload: RegisterRequest) => Promise<AuthSession>
  logout: () => void
  refreshProfile: () => Promise<UserProfile | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isReady, setIsReady] = useState(false)

  const clearSession = useCallback(() => {
    clearStoredSession()
    setSession(null)
    setProfile(null)
  }, [])

  const toSession = useCallback((response: AuthResponse): AuthSession => {
    return {
      token: response.token,
      user: response,
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentSession = getStoredSession() ?? session
    if (!currentSession) {
      setProfile(null)
      return null
    }

    try {
      const me = await authApi.me()
      setProfile(me)
      return me
    } catch {
      clearSession()
      return null
    }
  }, [clearSession, session])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const storedSession = getStoredSession()
      if (!storedSession) {
        if (!cancelled) {
          setIsReady(true)
        }
        return
      }

      try {
        const me = await authApi.me()
        if (!cancelled) {
          setProfile(me)
          setSession(storedSession)
        }
      } catch {
        if (!cancelled) {
          clearStoredSession()
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (!cancelled) {
          setIsReady(true)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const nextSession = toSession(await authApi.login(payload))
    setStoredSession(nextSession)
    setSession(nextSession)
    await refreshProfile()
    return nextSession
  }, [refreshProfile, toSession])

  const register = useCallback(async (payload: RegisterRequest) => {
    const nextSession = toSession(await authApi.register(payload))
    setStoredSession(nextSession)
    setSession(nextSession)
    await refreshProfile()
    return nextSession
  }, [refreshProfile, toSession])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const currentRole = (profile?.role ?? session?.user.role) as AuthRole | undefined
  const isAuthenticated = Boolean(session)
  const isClient = currentRole === 'CLIENT'
  const isStaff = currentRole === 'MANAGER' || currentRole === 'ADMIN'

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isReady,
      isAuthenticated,
      isClient,
      isStaff,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [isAuthenticated, isClient, isReady, isStaff, login, logout, profile, register, refreshProfile, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
