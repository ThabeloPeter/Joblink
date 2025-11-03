// Utility functions for authentication

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('supabase_token')
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('supabase_token', token)
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('supabase_token')
}

export async function getCurrentUser() {
  const token = getAuthToken()
  if (!token) return null

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.user
  } catch {
    return null
  }
}

export function isAdmin(user: { role: string } | null): boolean {
  return user?.role === 'admin'
}

export function isCompanyUser(user: { role: string } | null): boolean {
  return user?.role === 'company'
}

