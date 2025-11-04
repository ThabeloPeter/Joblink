'use client'

import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Dashboard"
        user={user ? {
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'Administrator'
        } : undefined}
      />
      
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Companies */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Company Approvals</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review and approve company registrations</p>
            </div>
            <div className="p-6">
              {loadingCompanies ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : pendingCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pending company approvals</div>
              ) : (
                <div className="space-y-4">
                  {pendingCompanies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{company.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{company.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(company.id)}
                          className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(company.id)}
                          className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full mt-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide">
                View All Pending Approvals →
              </button>
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

