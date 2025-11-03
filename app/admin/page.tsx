'use client'

import Header from '@/components/dashboard/Header'
import StatCard from '@/components/dashboard/StatCard'
import { 
  Building2, 
  FileText, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react'

// Mock data - replace with actual Supabase queries
const stats = {
  totalCompanies: 42,
  pendingApprovals: 8,
  activeJobCards: 156,
  completedThisMonth: 234,
  companiesChange: 12,
  jobCardsChange: 8,
}

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Dashboard"
        user={{
          name: 'Admin User',
          email: 'admin@joblink.com',
          role: 'Administrator'
        }}
      />
      
      <main className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Companies"
            value={stats.totalCompanies}
            icon={Building2}
            iconColor="text-blue-600"
            change={{ value: stats.companiesChange, isPositive: true }}
            trend={{ label: "vs last month", isPositive: true }}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            iconColor="text-yellow-600"
          />
          <StatCard
            title="Active Job Cards"
            value={stats.activeJobCards}
            icon={FileText}
            iconColor="text-purple-600"
            change={{ value: stats.jobCardsChange, isPositive: true }}
          />
          <StatCard
            title="Completed This Month"
            value={stats.completedThisMonth}
            icon={CheckCircle}
            iconColor="text-green-600"
            trend={{ label: "↑ 15% vs last month", isPositive: true }}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Companies */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Company Approvals</h2>
              <p className="text-sm text-gray-600 mt-1">Review and approve company registrations</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Company Name {i}</p>
                        <p className="text-sm text-gray-600">contact@company{i}.com</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                View All Pending Approvals →
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="font-semibold text-gray-900">1,234</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Providers</span>
                <span className="font-semibold text-gray-900">892</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Platform Health</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Growth this month:</span>
                  <span className="font-semibold text-green-600">+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

