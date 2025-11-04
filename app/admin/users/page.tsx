'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { Users, Search, Phone } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  role: string
  company: string | null
  status: string
  lastLogin: string
  createdAt: string
}

export default function UsersPage() {
  const notify = useNotify()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchUsers() {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        setUsers(data.users || [])
      } catch (error) {
        console.error('Error fetching users:', error)
        notify.showError('Failed to load users', 'Error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [notify])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleToggleStatus = async (id: string) => {
    // TODO: Implement API call to update user status
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
      )
    )
    const userData = users.find((u) => u.id === id)
    notify.showSuccess(
      `User ${userData?.name} has been ${userData?.status === 'active' ? 'deactivated' : 'activated'}`,
      'Status Updated'
    )
  }

  const roleLabels = {
    admin: 'Administrator',
    company_manager: 'Company Manager',
    service_provider: 'Service Provider',
  }

  const roleColors = {
    admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
    company_manager: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    service_provider: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        title="Users"
        user={user ? {
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'Administrator',
        } : undefined}
      />

      <main className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Manage Users
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage all platform users across different roles
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '...' : users.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Company Managers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : users.filter((u) => u.role === 'company_manager').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Providers</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : users.filter((u) => u.role === 'service_provider').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Users</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : users.filter((u) => u.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="company_manager">Company Manager</option>
              <option value="service_provider">Service Provider</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((userData) => (
                    <tr
                      key={userData.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-gray-300 dark:border-gray-700 flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                              {userData.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {userData.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-4 h-4" />
                          <span>{userData.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                            roleColors[userData.role as keyof typeof roleColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {roleLabels[userData.role as keyof typeof roleLabels] || userData.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {userData.company || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                            userData.status === 'active'
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
                          }`}
                        >
                          {userData.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 dark:text-gray-100">{userData.lastLogin}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleToggleStatus(userData.id)}
                          className={`px-3 py-1.5 border border-gray-300 dark:border-gray-700 transition-colors text-sm font-medium uppercase tracking-wide ${
                            userData.status === 'active'
                              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600'
                              : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                          }`}
                        >
                          {userData.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

