import { getStoredToken } from '@/lib/auth/auth-storage'

export async function downloadProtectedFile(url: string, fileName: string) {
  const token = getStoredToken()
  const headers = new Headers()

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error(`Téléchargement impossible (${response.status})`)
  }

  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(objectUrl)
}
