'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import { BarChart3, FileText, Calendar, TrendingUp, ArrowLeft, Download, AlertCircle } from 'lucide-react'
import { getCurrentUser, getAuthToken } from '@/lib/auth'
import { User } from '@/lib/types/user'
import { formatDate } from '@/lib/utils/date'

interface ReportStats {
  total: number
  byStatus: {
    pending: number
    accepted: number
    in_progress: number
    completed: number
    declined: number
  }
  byPriority: {
    high: number
    medium: number
    low: number
  }
  avgCompletionDays: number
  completionRate: number
  recent: number
  overdue: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch('/api/company/reports', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Reports"
        user={user ? {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'Company Manager'
        } : undefined}
      />
      
      <main className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View detailed reports and analytics for your job cards and providers</p>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-gray-300 dark:border-gray-700">
                <BarChart3 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Job Card Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Performance metrics and trends</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-gray-300 dark:border-gray-700">
                <FileText className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Provider Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Provider performance and statistics</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 border border-gray-300 dark:border-gray-700">
                <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Time-based Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly and weekly summaries</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-12">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Job Cards</p>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.completionRate}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Completion Time</p>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.avgCompletionDays} days</p>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.byStatus.pending}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Accepted</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.byStatus.accepted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.byStatus.in_progress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.byStatus.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Declined</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.byStatus.declined}</p>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Priority Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.byPriority.high}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Medium</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.byPriority.medium}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Low</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.byPriority.low}</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity (Last 30 Days)</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.recent} job cards created</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-12">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Data Available</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Unable to load statistics. Please try again later.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

