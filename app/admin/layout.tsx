'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {sidebarVisible && <Sidebar userRole="admin" onLogout={() => setSidebarVisible(false)} />}
        <div className={`flex-1 ${sidebarVisible ? 'ml-64' : ''} transition-all duration-300`}>
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

