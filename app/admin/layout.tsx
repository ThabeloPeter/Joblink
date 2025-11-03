import Sidebar from '@/components/dashboard/Sidebar'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute allowedRoles={['admin']} redirectTo="/auth">
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar userRole="admin" />
        <div className="flex-1 ml-64">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

