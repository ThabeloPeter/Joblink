'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { UserCheck, Plus, Search, Edit, Trash2, Power, PowerOff } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import AddProviderModal from '@/components/modals/AddProviderModal'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

interface Provider {
  id: string
  name: string
  email: string
  phone: string
  status: string
  jobCardsCompleted: number
  rating: number
}

export default function ServiceProvidersPage() {
  const notify = useNotify()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchProviders() {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch('/api/company/providers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch providers')
        }

        const data = await response.json()
        setProviders(data.providers || [])
      } catch (error) {
        console.error('Error fetching providers:', error)
        notify.showError('Failed to load providers', 'Error')
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [notify])

  const filteredProviders = providers.filter((provider) =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleProviderStatus = async (id: string) => {
    // TODO: Implement API call to update provider status
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    )
    const provider = providers.find((p) => p.id === id)
    notify.showSuccess(
      `Provider ${provider?.name} ${provider?.status === 'active' ? 'deactivated' : 'activated'}`,
      'Status Updated'
    )
  }

  const handleAddProvider = async (data: { name: string; email: string; phone: string }) => {
    // TODO: Implement API call to create provider
    const newProvider: Provider = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      status: 'active',
      jobCardsCompleted: 0,
      rating: 0,
    }
    setProviders([...providers, newProvider])
    notify.showSuccess('Service provider added successfully!', 'Success')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Service Providers"
        user={user ? {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'Company Manager'
        } : undefined}
      />
      
      <main className="p-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Manage Service Providers
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add and manage your service providers who handle job cards
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Provider
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Providers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{providers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Providers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {providers.filter((p) => p.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Power className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">4.8</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">★</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search providers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Jobs Completed
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {provider.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{provider.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{provider.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{provider.phone}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        provider.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {provider.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {provider.jobCardsCompleted}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {provider.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleProviderStatus(provider.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            provider.status === 'active'
                              ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                              : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={provider.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {provider.status === 'active' ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredProviders.length === 0 && (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No providers found</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Provider Modal */}
      <AddProviderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProvider}
      />
    </div>
  )
}

