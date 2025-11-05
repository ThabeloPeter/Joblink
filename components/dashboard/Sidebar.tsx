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
  ClipboardList
} from 'lucide-react'
import clsx from 'clsx'
import { removeAuthToken, getAuthToken } from '@/lib/auth'

interface SidebarProps {
  userRole: 'admin' | 'company'
  onLogout?: () => void
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

export default function Sidebar({ userRole, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navItems = userRole === 'admin' ? adminNavItems : companyNavItems
  const basePath = userRole === 'admin' ? '/admin' : '/company'

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
        
        // Hide sidebar if callback provided
        if (onLogout) {
          onLogout()
        }
        
        // Redirect to login page
        router.push('/auth')
      } else {
        const error = await response.json()
        console.error('Logout error:', error)
        // Still clear token and redirect even if API fails
        removeAuthToken()
        if (onLogout) {
          onLogout()
        }
        router.push('/auth')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear token and redirect even if API fails
      removeAuthToken()
      if (onLogout) {
        onLogout()
      }
      router.push('/auth')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 dark:bg-gray-950 border-r border-gray-800 dark:border-gray-900 flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 dark:border-gray-900">
        <h1 className="text-xl font-bold text-white uppercase tracking-wide">
          JobLink
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
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-l-2',
                isActive
                  ? 'bg-gray-800 text-white border-white'
                  : 'text-gray-300 border-transparent hover:bg-gray-800 hover:text-white hover:border-gray-500'
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
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-300 dark:text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white border border-transparent hover:border-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </div>
  )
}

