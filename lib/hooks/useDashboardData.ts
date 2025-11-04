'use client'

import { useEffect, useState } from 'react'
import { getAuthToken } from '@/lib/auth'

interface DashboardStats {
  totalCompanies?: number
  pendingApprovals?: number
  activeJobCards?: number
  completedThisMonth?: number
  totalProviders?: number
  completedToday?: number
  pendingJobs?: number
  completionRate?: number
}

export function useAdminDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getAuthToken()
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        // Fetch stats from API
        const response = await fetch('/api/dashboard/admin-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setStats(data.stats || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, loading, error }
}

export function useCompanyDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getAuthToken()
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        // Fetch stats from API
        const response = await fetch('/api/dashboard/company-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setStats(data.stats || {})
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, loading, error }
}

