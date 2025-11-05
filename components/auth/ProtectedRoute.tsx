'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAuthToken, removeAuthToken, isAdmin, isCompanyUser } from '@/lib/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'company' | 'provider')[]
  redirectTo?: string
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/auth',
}: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken()
      
      if (!token) {
        router.push(redirectTo)
        return
      }

      const user = await getCurrentUser()
      
      if (!user) {
        removeAuthToken()
        router.push(redirectTo)
        return
      }

      // Check if user has required role
      if (allowedRoles.length > 0) {
        const hasRole = allowedRoles.includes(user.role as 'admin' | 'company' | 'provider')
        if (!hasRole) {
          // Redirect based on user's role
          if (isAdmin(user)) {
            router.push('/admin')
          } else if (isCompanyUser(user)) {
            router.push('/company')
          } else {
            router.push(redirectTo)
          }
          return
        }
      }

      setIsAuthorized(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [router, allowedRoles, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
