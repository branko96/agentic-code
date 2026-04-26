export type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  user: AuthUser
}

export type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}
