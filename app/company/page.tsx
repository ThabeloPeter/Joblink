'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  UserCheck, 
  ClipboardList, 
  CheckCircle, 
  Clock
} from 'lucide-react'
import { useCompanyDashboardData } from '@/lib/hooks/useDashboardData'
import { getCurrentUser } from '@/lib/auth'

export default function CompanyDashboard() {
  const { stats, loading: statsLoading } = useCompanyDashboardData()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

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
      
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Job Cards */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Job Cards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your ongoing jobs</p>
              </div>
              <button className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide">
                + New Job Card
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="text-center py-8 text-gray-500">No active job cards</div>
              </div>
              <button className="w-full mt-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide">
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
                <button className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center justify-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Create Job Card
                </button>
                <button className="w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Add Provider
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium uppercase tracking-wide">
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { action: 'Job completed', time: '2 hours ago', type: 'success' },
                  { action: 'New provider added', time: '5 hours ago', type: 'info' },
                  { action: 'Job card created', time: '1 day ago', type: 'info' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 border border-gray-300 dark:border-gray-700">
                      {activity.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

