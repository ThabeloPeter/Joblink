'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  UserCheck,
  ClipboardList
} from 'lucide-react'
import clsx from 'clsx'

interface SidebarProps {
  userRole: 'admin' | 'company'
}

const adminNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/companies', icon: Building2, label: 'Companies' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/job-cards', icon: FileText, label: 'Job Cards' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

const companyNavItems = [
  { href: '/company', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/company/providers', icon: UserCheck, label: 'Service Providers' },
  { href: '/company/job-cards', icon: ClipboardList, label: 'Job Cards' },
  { href: '/company/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const navItems = userRole === 'admin' ? adminNavItems : companyNavItems
  const basePath = userRole === 'admin' ? '/admin' : '/company'

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 dark:bg-gray-950 border-r border-gray-800 dark:border-gray-900 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 dark:border-gray-900">
        <h1 className="text-xl font-bold text-white">
          <span className="text-blue-400 dark:text-blue-500">Job</span>Link
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (item.href !== basePath && 
             pathname?.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 dark:border-gray-900 p-4">
        <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white transition-all">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

