/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authApi, type LoginRequest, type RegisterRequest } from '@/lib/api/auth-api'
import { clearStoredSession, getStoredSession, setStoredSession } from '@/lib/auth/auth-storage'
import type { AuthRole, AuthResponse, AuthSession, FavoriteVehicle, UserProfile } from './auth-types'

type AuthContextValue = {
  session: AuthSession | null
  profile: UserProfile | null
  favorites: FavoriteVehicle[]
  isReady: boolean
  isAuthenticated: boolean
  isClient: boolean
  isAdmin: boolean
  isStaff: boolean
  login: (payload: LoginRequest) => Promise<AuthSession>
  register: (payload: RegisterRequest) => Promise<AuthSession>
  logout: () => void
  refreshProfile: () => Promise<UserProfile | null>
  refreshFavorites: () => Promise<FavoriteVehicle[]>
  addFavorite: (vehicleId: string) => Promise<FavoriteVehicle[]>
  removeFavorite: (vehicleId: string) => Promise<FavoriteVehicle[]>
  isFavorite: (vehicleId: string) => boolean
  toggleFavorite: (vehicleId: string) => Promise<FavoriteVehicle[]>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession())
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([])
  const [isReady, setIsReady] = useState(false)

  const clearSession = useCallback(() => {
    clearStoredSession()
    setSession(null)
    setProfile(null)
    setFavorites([])
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
      setFavorites([])
      return null
    }

    try {
      const me = await authApi.me()
      setProfile(me)

      if (me.role === 'CLIENT') {
        try {
          const favoriteResponse = await authApi.favorites()
          setFavorites(favoriteResponse.favorites)
        } catch {
          setFavorites([])
        }
      } else {
        setFavorites([])
      }

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
          if (me.role === 'CLIENT') {
            try {
              const favoriteResponse = await authApi.favorites()
              setFavorites(favoriteResponse.favorites)
            } catch {
              setFavorites([])
            }
          } else {
            setFavorites([])
          }
        }
      } catch {
        if (!cancelled) {
          clearStoredSession()
          setSession(null)
          setProfile(null)
          setFavorites([])
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

  const refreshFavorites = useCallback(async () => {
    const currentSession = getStoredSession() ?? session
    if (!currentSession || currentSession.user.role !== 'CLIENT') {
      setFavorites([])
      return []
    }

    const response = await authApi.favorites()
    setFavorites(response.favorites)
    return response.favorites
  }, [session])

  const addFavorite = useCallback(async (vehicleId: string) => {
    if (!session) {
      throw new Error('Authentication required')
    }

    const nextFavorites = await authApi.addFavorite(vehicleId)
    setFavorites(nextFavorites.favorites)
    return nextFavorites.favorites
  }, [session])

  const removeFavorite = useCallback(async (vehicleId: string) => {
    if (!session) {
      throw new Error('Authentication required')
    }

    const nextFavorites = await authApi.removeFavorite(vehicleId)
    setFavorites(nextFavorites.favorites)
    return nextFavorites.favorites
  }, [session])

  const isFavorite = useCallback(
    (vehicleId: string) => favorites.some((favorite) => favorite.id === vehicleId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (vehicleId: string) => {
      if (!session) {
        throw new Error('Authentication required')
      }

      const nextFavorites = isFavorite(vehicleId)
        ? await authApi.removeFavorite(vehicleId)
        : await authApi.addFavorite(vehicleId)

      setFavorites(nextFavorites.favorites)
      return nextFavorites.favorites
    },
    [isFavorite, session],
  )

  const currentRole = (profile?.role ?? session?.user.role) as AuthRole | undefined
  const isAuthenticated = Boolean(session)
  const isClient = currentRole === 'CLIENT'
  const isAdmin = currentRole === 'ADMIN'
  const isStaff = currentRole === 'MANAGER' || currentRole === 'ADMIN'

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      favorites,
      isReady,
      isAuthenticated,
      isClient,
      isAdmin,
      isStaff,
      login,
      register,
      logout,
      refreshProfile,
      refreshFavorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      toggleFavorite,
    }),
    [addFavorite, favorites, isAdmin, isAuthenticated, isClient, isReady, isStaff, isFavorite, login, logout, profile, refreshFavorites, refreshProfile, register, removeFavorite, session, toggleFavorite],
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
