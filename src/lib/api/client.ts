import { getStoredToken } from '@/lib/auth/auth-storage'

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '/api/v1'

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

function buildHeaders(initHeaders: HeadersInit | undefined, body: ApiRequestOptions['body']) {
  const headers = new Headers(initHeaders)

  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getStoredToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return headers
}

function serializeBody(body: ApiRequestOptions['body']) {
  if (body == null || body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
    return body ?? undefined
  }

  return JSON.stringify(body)
}

export async function apiRequest<T>(path: string, init: ApiRequestOptions = {}): Promise<T> {
  const response = await fetch(`${normalizeBaseUrl(API_BASE_URL)}${path}`, {
    ...init,
    headers: buildHeaders(init.headers, init.body),
    body: serializeBody(init.body),
  })

  if (!response.ok) {
    const payload = await safeReadPayload(response)
    const message =
      extractErrorMessage(payload) ||
      response.statusText ||
      `Request failed with status ${response.status}`

    throw new ApiError(message, response.status, payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}

async function safeReadPayload(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch {
    return null
  }
}

function extractErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const candidate = payload as Record<string, unknown>
  const message = candidate.message ?? candidate.error ?? candidate.detail

  return typeof message === 'string' && message.trim().length > 0 ? message : null
}
