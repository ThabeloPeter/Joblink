'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Menu } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {sidebarVisible && <Sidebar userRole="admin" onToggle={() => setSidebarVisible(false)} />}
        <div className={`flex-1 ${sidebarVisible ? 'ml-64' : ''} transition-all duration-300`}>
          {!sidebarVisible && (
            <button
              onClick={() => setSidebarVisible(true)}
              className="fixed top-4 left-4 z-50 p-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
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

