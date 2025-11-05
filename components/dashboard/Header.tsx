'use client'

import { useState } from 'react'
import { Bell, Search, ChevronDown } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import NotificationCenter from '@/components/modals/NotificationCenter'
import { getAuthToken } from '@/lib/auth'
import { useRealtimeUpdates } from '@/lib/hooks/useRealtimeUpdates'

interface HeaderProps {
  title: string
  user?: {
    name: string
    email: string
    role: string
  }
}

export default function Header({ title, user }: HeaderProps) {
  const [showNotificationCenter, setShowNotificationCenter] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  // Real-time updates for notification count
  useRealtimeUpdates({
    enabled: !showNotificationCenter,
    interval: 30000, // 30 seconds
    onUpdate: fetchUnreadCount,
    onError: (error) => console.error('Error in real-time update:', error),
  })

  const userRole = (user?.role === 'admin' ? 'admin' : user?.role === 'company' ? 'company' : 'provider') as 'admin' | 'company' | 'provider'

  return (
    <>
      <header className="h-14 sm:h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-3 sm:px-4 md:px-6 sticky top-0 z-30 relative">
        <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 absolute left-1/2 sm:left-0 transform -translate-x-1/2 sm:translate-x-0 text-center sm:text-left">{title}</h1>
        
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-auto">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-48 sm:w-56 md:w-64 border border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-400 outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            onClick={() => setShowNotificationCenter(true)}
            className="relative p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

        {/* User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Role'}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden lg:block" />
        </div>
      </div>
    </header>

    {/* Notification Center */}
    <NotificationCenter
      isOpen={showNotificationCenter}
      onClose={() => {
        setShowNotificationCenter(false)
        fetchUnreadCount() // Refresh count when closing
      }}
      userRole={userRole}
    />
    </>
  )
}

