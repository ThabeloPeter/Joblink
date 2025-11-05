'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Menu } from 'lucide-react'

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarVisible, setSidebarVisible] = useState(false) // Hidden by default on mobile

  return (
    <ProtectedRoute allowedRoles={['provider']} redirectTo="/auth">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar - hidden on mobile by default, always visible on desktop */}
        <div className={`${sidebarVisible ? 'block' : 'hidden'} md:block`}>
          <Sidebar userRole="provider" onToggle={() => setSidebarVisible(false)} />
        </div>
        
        <div className="flex-1 md:ml-64 transition-all duration-300 w-full">
          {/* Mobile menu button */}
          {!sidebarVisible && (
            <button
              onClick={() => setSidebarVisible(true)}
              className="fixed top-3 left-3 z-50 p-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors md:hidden"
              title="Show sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

