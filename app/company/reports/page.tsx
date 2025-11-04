'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/dashboard/Header'
import { BarChart3, FileText, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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

        {/* Coming Soon Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-12">
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Reports Coming Soon</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              We&apos;re working on building comprehensive reporting and analytics features. 
              Check back soon for detailed insights into your job cards and provider performance.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

