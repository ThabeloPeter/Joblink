'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/dashboard/Header'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

export default function ProviderSettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    loadUser()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        title="Settings"
        user={user ? {
          name: user.email?.split('@')[0] || 'Provider',
          email: user.email || '',
          role: 'Service Provider'
        } : undefined}
      />
      
      <main className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Settings
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Information</h3>
          </div>
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

