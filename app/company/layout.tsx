import Sidebar from '@/components/dashboard/Sidebar'

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar userRole="company" />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  )
}

