import { AuthResponse, AuthUser, LoginInput, RegisterInput } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

type ApiRequestOptions = {
  method?: 'GET' | 'POST'
  body?: unknown
  token?: string | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers()

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message =
      typeof payload?.message === 'string'
        ? payload.message
        : 'Something went wrong. Please try again.'

    throw new ApiError(message, response.status)
  }

  return payload as T
}

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  })
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: input,
  })
}

export function getMe(token: string) {
  return apiRequest<AuthUser>('/auth/me', {
    token,
  })
}
