'use client'

import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  UserCheck, 
  ClipboardList, 
  CheckCircle, 
  Clock,
  TrendingUp
} from 'lucide-react'

// Mock data - replace with actual Supabase queries
const stats = {
  totalProviders: 12,
  activeJobCards: 28,
  completedToday: 5,
  pendingJobs: 8,
  providersChange: 5,
  completionRate: 94,
}

export default function CompanyDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Dashboard"
        user={{
          name: 'Company User',
          email: 'user@company.com',
          role: 'Company Manager'
        }}
      />
      
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Service Providers"
            value={stats.totalProviders}
            icon={UserCheck}
            iconColor="text-blue-600"
            change={{ value: stats.providersChange, isPositive: true }}
            trend={{ label: "Active providers", isPositive: true }}
          />
          <StatCard
            title="Active Job Cards"
            value={stats.activeJobCards}
            icon={ClipboardList}
            iconColor="text-purple-600"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={CheckCircle}
            iconColor="text-green-600"
            trend={{ label: "Last 24 hours", isPositive: true }}
          />
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            icon={TrendingUp}
            iconColor="text-orange-600"
            trend={{ label: "↑ 2% this month", isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Job Cards */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Active Job Cards</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Monitor your ongoing jobs</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                + New Job Card
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { id: 1, title: 'Office Repairs', provider: 'John Doe', status: 'in_progress', priority: 'high', location: 'Building A', dueDate: 'Today' },
                  { id: 2, title: 'Maintenance Check', provider: 'Jane Smith', status: 'accepted', priority: 'medium', location: 'Building B', dueDate: 'Tomorrow' },
                  { id: 3, title: 'Installation Work', provider: 'Mike Johnson', status: 'pending', priority: 'low', location: 'Warehouse', dueDate: 'Next Week' },
                  { id: 4, title: 'Emergency Fix', provider: 'Sarah Wilson', status: 'in_progress', priority: 'high', location: 'Main Office', dueDate: 'Today' },
                ].map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        job.priority === 'high' ? 'bg-red-500' : 
                        job.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{job.title}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                          <span>{job.provider}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>Due: {job.dueDate}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        job.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        job.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                    <button className="ml-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium whitespace-nowrap">
                      View →
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium">
                View All Job Cards →
              </button>
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Create Job Card
                </button>
                <button className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Add Provider
                </button>
                <button className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm font-medium">
                  View Reports
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
                    <div className={`mt-1 p-1.5 rounded-lg ${
                      activity.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      {activity.type === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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

