'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  UserCheck, 
  ClipboardList, 
  CheckCircle, 
  TrendingUp,
  Calendar,
  Building2,
  User as UserIcon
} from 'lucide-react'
import { useCompanyDashboardData } from '@/lib/hooks/useDashboardData'
import { getCurrentUser, getAuthToken } from '@/lib/auth'
import { User } from '@/lib/types/user'

interface ActiveJobCard {
  id: string
  title: string
  description: string
  provider: string
  status: string
  priority: string
  location: string
  dueDate: string
  createdAt: string
}

export default function CompanyDashboard() {
  const router = useRouter()
  const { stats, loading: statsLoading } = useCompanyDashboardData()
  const [user, setUser] = useState<User | null>(null)
  const [activeJobCards, setActiveJobCards] = useState<ActiveJobCard[]>([])
  const [loadingJobCards, setLoadingJobCards] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchActiveJobCards() {
      try {
        const token = getAuthToken()
        if (!token) {
          setLoadingJobCards(false)
          return
        }

        const response = await fetch('/api/company/job-cards', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          // Filter for active job cards (pending, accepted, in_progress)
          const active = (data.jobCards || []).filter(
            (job: { status: string }) => 
              job.status === 'pending' || 
              job.status === 'accepted' || 
              job.status === 'in_progress'
          )
          // Sort by created date (newest first) and limit to 5
          const sorted = active
            .sort((a: ActiveJobCard, b: ActiveJobCard) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5)
          setActiveJobCards(sorted)
        }
      } catch (error) {
        console.error('Error fetching active job cards:', error)
      } finally {
        setLoadingJobCards(false)
      }
    }

    fetchActiveJobCards()
  }, [])

  const handleCreateJobCard = () => {
    router.push('/company/job-cards')
  }

  const handleAddProvider = () => {
    router.push('/company/providers')
  }

  const handleViewReports = () => {
    // Navigate to reports page (or show a message if it doesn't exist yet)
    router.push('/company/reports')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Dashboard"
        user={user ? {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'Company Manager'
        } : undefined}
      />
      
      <main className="p-3 sm:p-4 md:p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Service Providers"
            value={statsLoading ? '...' : (stats.totalProviders || 0)}
            icon={UserCheck}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Active Job Cards"
            value={statsLoading ? '...' : (stats.activeJobCards || 0)}
            icon={ClipboardList}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Completed Today"
            value={statsLoading ? '...' : (stats.completedToday || 0)}
            icon={CheckCircle}
            iconColor="text-gray-700"
          />
          <StatCard
            title="Completion Rate"
            value={statsLoading ? '...' : `${stats.completionRate || 0}%`}
            icon={TrendingUp}
            iconColor="text-gray-700"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Active Job Cards */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Job Cards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your ongoing jobs</p>
              </div>
              <button 
                onClick={handleCreateJobCard}
                className="w-full sm:w-auto px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                + New Job Card
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {loadingJobCards ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : activeJobCards.length === 0 ? (
                <div className="space-y-3">
                  <div className="text-center py-8 text-gray-500">No active job cards</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeJobCards.map((job) => {
                    const statusColors = {
                      pending: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                      accepted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                      in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
                    }
                    const priorityColors = {
                      high: 'bg-red-500',
                      medium: 'bg-yellow-500',
                      low: 'bg-green-500',
                    }
                    return (
                      <div
                        key={job.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                        onClick={() => router.push('/company/job-cards')}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {job.description}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            <span>{job.provider || 'Unassigned'}</span>
                          </div>
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          {job.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(job.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <span className={`w-2 h-2 rounded-full ${priorityColors[job.priority as keyof typeof priorityColors] || 'bg-gray-500'}`}></span>
                            <span className="capitalize">{job.priority}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              <button 
                onClick={() => router.push('/company/job-cards')}
                className="w-full mt-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
              >
                View All Job Cards →
              </button>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button 
                  onClick={handleCreateJobCard}
                  className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  Create Job Card
                </button>
                <button 
                  onClick={handleAddProvider}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Add Provider
                </button>
                <button 
                  onClick={handleViewReports}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium uppercase tracking-wide"
                >
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8 text-gray-500">No recent activity</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

