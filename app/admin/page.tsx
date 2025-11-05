'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  Building2, 
  FileText, 
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAdminDashboardData } from '@/lib/hooks/useDashboardData'
import { getCurrentUser } from '@/lib/auth'
import { getAuthToken } from '@/lib/auth'
import { User } from '@/lib/types/user'

interface PendingCompany {
  id: string
  name: string
  email: string
  contact_person: string
  created_at: string
}

export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useAdminDashboardData()
  const [user, setUser] = useState<User | null>(null)
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchPendingCompanies() {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch('/api/admin/pending-companies', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setPendingCompanies(data.companies || [])
        }
      } catch (error) {
        console.error('Error fetching pending companies:', error)
      } finally {
        setLoadingCompanies(false)
      }
    }

    fetchPendingCompanies()
  }, [])

  const handleApprove = async (companyId: string) => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`/api/admin/companies/${companyId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from pending list
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId))
        // Refresh stats
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve company')
      }
    } catch (error) {
      console.error('Error approving company:', error)
      alert('Failed to approve company. Please try again.')
    }
  }

  const handleReject = async (companyId: string) => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`/api/admin/companies/${companyId}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        // Remove from pending list
        setPendingCompanies((prev) => prev.filter((c) => c.id !== companyId))
        // Refresh stats
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject company')
      }
    } catch (error) {
      console.error('Error rejecting company:', error)
      alert('Failed to reject company. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        title="Dashboard"
        user={user ? {
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'Administrator'
        } : undefined}
      />
      
      <main className="p-3 sm:p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Companies"
            value={statsLoading ? '...' : (stats.totalCompanies || 0)}
            icon={Building2}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Pending Approvals"
            value={statsLoading ? '...' : (stats.pendingApprovals || 0)}
            icon={Clock}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Active Job Cards"
            value={statsLoading ? '...' : (stats.activeJobCards || 0)}
            icon={FileText}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Completed This Month"
            value={statsLoading ? '...' : (stats.completedThisMonth || 0)}
            icon={CheckCircle}
            iconColor="text-gray-700"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Pending Companies */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Company Approvals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review and approve company registrations</p>
            </div>
            <div className="p-4 sm:p-6">
              {loadingCompanies ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-300 dark:border-gray-700 animate-pulse">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none sm:w-20"></div>
                        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded flex-1 sm:flex-none sm:w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending company approvals</div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {pendingCompanies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{company.name}</p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{company.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(company.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(company.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/admin/companies?status=pending" className="w-full mt-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center justify-center">
                View All Pending Approvals →
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Stats</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Companies</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{statsLoading ? '...' : (stats.totalCompanies || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Job Cards</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{statsLoading ? '...' : (stats.activeJobCards || 0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-300 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed This Month</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{statsLoading ? '...' : (stats.completedThisMonth || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

