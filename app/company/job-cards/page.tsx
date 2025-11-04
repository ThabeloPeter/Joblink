'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { ClipboardList, Plus, Search, Calendar, MapPin, User as UserIcon } from 'lucide-react'
import CreateJobCardModal from '@/components/modals/CreateJobCardModal'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'

interface JobCard {
  id: string
  title: string
  description: string
  provider: string
  status: string
  priority: string
  location: string
  createdAt: string
  dueDate: string
  completedAt: string | null
}

interface Provider {
  id: string
  name: string
  email: string
}

export default function JobCardsPage() {
  const notify = useNotify()
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getAuthToken()
        if (!token) return

        const [jobCardsResponse, providersResponse] = await Promise.all([
          fetch('/api/company/job-cards', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/company/providers', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (jobCardsResponse.ok) {
          const jobCardsData = await jobCardsResponse.json()
          setJobCards(jobCardsData.jobCards || [])
        }

        if (providersResponse.ok) {
          const providersData = await providersResponse.json()
          setProviders(providersData.providers || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        notify.showError('Failed to load data', 'Error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [notify])

  const filteredJobCards = jobCards.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const statusColors = {
    pending: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    accepted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    declined: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  }

  const handleCreateJobCard = async (data: {
    title: string
    description: string
    providerId: string
    priority: string
    location: string
    dueDate: string
  }) => {
    try {
      const token = getAuthToken()
      if (!token) {
        notify.showError('Authentication required', 'Error')
        return
      }

      const response = await fetch('/api/company/job-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        notify.showError(result.error || 'Failed to create job card', 'Error')
        return
      }

      notify.showSuccess('Job card created successfully!', 'Success')

      // Refresh job cards list
      const jobCardsResponse = await fetch('/api/company/job-cards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (jobCardsResponse.ok) {
        const jobCardsData = await jobCardsResponse.json()
        setJobCards(jobCardsData.jobCards || [])
      }

      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating job card:', error)
      notify.showError('Failed to create job card. Please try again.', 'Error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Job Cards"
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
              Manage Job Cards
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create, track, and manage job cards assigned to service providers
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Job Card
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '...' : jobCards.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search job cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="declined">Declined</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading job cards...</p>
            </div>
          ) : filteredJobCards.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No job cards found</p>
            </div>
          ) : (
            filteredJobCards.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-3 h-3 rounded-full mt-2 ${priorityColors[job.priority as keyof typeof priorityColors]}`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="w-4 h-4" />
                  <span>{job.provider}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {job.dueDate}</span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[job.status as keyof typeof statusColors]
                }`}>
                  {job.status.replace('_', ' ')}
                </span>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  View Details →
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </main>

      {/* Create Job Card Modal */}
      <CreateJobCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        providers={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
        onSubmit={handleCreateJobCard}
      />
    </div>
  )
}

