'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApiError, getMe, login as loginRequest, register as registerRequest } from '@/lib/api'
import {
  AuthContextValue,
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/lib/auth'

const TOKEN_STORAGE_KEY = 'auth_token'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function persistSession(session: AuthResponse) {
  localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken)
  return {
    token: session.accessToken,
    user: session.user,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY)

    if (!storedToken) {
      setToken(null)
      setUser(null)
      return
    }

    try {
      const nextUser = await getMe(storedToken)
      setToken(storedToken)
      setUser(nextUser)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession()
        return
      }

      throw error
    }
  }, [clearSession])

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser()
      } finally {
        setIsLoading(false)
      }
    }

    bootstrap()
  }, [refreshUser])

  const login = useCallback(async (input: LoginInput) => {
    const session = await loginRequest(input)
    const nextSession = persistSession(session)
    setToken(nextSession.token)
    setUser(nextSession.user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const session = await registerRequest(input)
    const nextSession = persistSession(session)
    setToken(nextSession.token)
    setUser(nextSession.user)
  }, [])

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
