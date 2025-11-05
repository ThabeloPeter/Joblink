'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  PlayCircle
} from 'lucide-react'
import { getCurrentUser, getAuthToken } from '@/lib/auth'
import { User } from '@/lib/types/user'

export default function ProviderDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    pendingJobCards: 0,
    acceptedJobCards: 0,
    inProgressJobCards: 0,
    completedJobCards: 0,
    totalJobCards: 0,
    completedToday: 0,
    completionRate: 0,
  })
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

        const response = await fetch('/api/dashboard/provider-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats((prevStats) => data.stats || prevStats)
        }
      } catch (error) {
        console.error('Error fetching provider stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleViewJobCards = () => {
    router.push('/provider/job-cards')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        title="Dashboard"
        user={user ? {
          name: user.email?.split('@')[0] || 'Provider',
          email: user.email || '',
          role: 'Service Provider'
        } : undefined}
      />
      
      <main className="p-3 sm:p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Pending Jobs"
            value={loading ? '...' : stats.pendingJobCards}
            icon={Clock}
            iconColor="text-gray-700"
          />
          <StatCard
            title="In Progress"
            value={loading ? '...' : stats.inProgressJobCards}
            icon={PlayCircle}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Completed Today"
            value={loading ? '...' : stats.completedToday}
            icon={CheckCircle}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Completion Rate"
            value={loading ? '...' : `${stats.completionRate}%`}
            icon={TrendingUp}
            iconColor="text-gray-700"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Job Cards */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Pending Job Cards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Review and accept new job assignments</p>
              </div>
              <button 
                onClick={handleViewJobCards}
                className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stats.pendingJobCards > 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400">
                      You have {stats.pendingJobCards} pending job {stats.pendingJobCards === 1 ? 'card' : 'cards'} to review
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No pending job cards</div>
                )}
              </div>
              <button 
                onClick={handleViewJobCards}
                className="w-full mt-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                View All Job Cards →
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{loading ? '...' : stats.totalJobCards}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Accepted</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{loading ? '...' : stats.acceptedJobCards}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">{loading ? '...' : stats.completedJobCards}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Completion Rate</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{loading ? '...' : `${stats.completionRate}%`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

