'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  UserCheck,
  ClipboardList,
  ChevronLeft
} from 'lucide-react'
import clsx from 'clsx'
import { removeAuthToken, getAuthToken } from '@/lib/auth'

interface SidebarProps {
  userRole: 'admin' | 'company' | 'provider'
  onToggle?: () => void
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

const providerNavItems = [
  { href: '/provider', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/provider/job-cards', icon: ClipboardList, label: 'Job Cards' },
  { href: '/provider/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ userRole, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navItems = userRole === 'admin' 
    ? adminNavItems 
    : userRole === 'provider' 
    ? providerNavItems 
    : companyNavItems
  const basePath = userRole === 'admin' 
    ? '/admin' 
    : userRole === 'provider' 
    ? '/provider' 
    : '/company'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const token = getAuthToken()
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      })

      if (response.ok) {
        // Clear local storage token
        removeAuthToken()
        
        // Redirect to login page
        router.push('/auth')
      } else {
        const error = await response.json()
        console.error('Logout error:', error)
        // Still clear token and redirect even if API fails
        removeAuthToken()
        router.push('/auth')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear token and redirect even if API fails
      removeAuthToken()
      router.push('/auth')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {onToggle && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
      <div className="fixed left-0 top-0 h-full w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          ServiceLink
        </h1>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Toggle sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-4 h-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
    </>
  )
}

