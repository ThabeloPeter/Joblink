'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getAuthToken, removeAuthToken, isAdmin, isCompanyUser } from '@/lib/auth'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

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
    return <DashboardSkeleton />
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
