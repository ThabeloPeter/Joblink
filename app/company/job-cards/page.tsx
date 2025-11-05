'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { ClipboardList, Plus, Search, Calendar, MapPin, User as UserIcon } from 'lucide-react'
import CreateJobCardModal from '@/components/modals/CreateJobCardModal'
import EditJobCardModal from '@/components/modals/EditJobCardModal'
import ViewCompletionModal from '@/components/modals/ViewCompletionModal'
import Pagination from '@/components/ui/Pagination'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'
import { formatDate } from '@/lib/utils/date'

interface JobCard {
  id: string
  title: string
  description: string
  provider: string
  providerId?: string
  status: string
  priority: string
  location: string
  createdAt: string
  dueDate: string
  completedAt: string | null
  auditedAt?: string | null
  completionNotes?: string | null
  completionImages?: string[] | null
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
  const [dateRangeFilter, setDateRangeFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
        if (!token) {
          setLoading(false)
          return
        }

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
        } else {
          const errorData = await jobCardsResponse.json().catch(() => ({ error: 'Unknown error' }))
          console.error('Failed to fetch job cards:', errorData)
          notify.showError(errorData.error || 'Failed to load job cards', 'Error')
        }

        if (providersResponse.ok) {
          const providersData = await providersResponse.json()
          setProviders(providersData.providers || [])
        } else {
          console.error('Failed to fetch providers')
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
    
    // Date range filtering
    let matchesDate = true
    if (dateRangeFilter !== 'all') {
      const jobDate = new Date(job.createdAt)
      const now = new Date()
      
      if (dateRangeFilter === 'today') {
        matchesDate = jobDate.toDateString() === now.toDateString()
      } else if (dateRangeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = jobDate >= weekAgo
      } else if (dateRangeFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = jobDate >= monthAgo
      } else if (dateRangeFilter === 'custom') {
        if (customDateStart) {
          const startDate = new Date(customDateStart)
          startDate.setHours(0, 0, 0, 0)
          if (jobDate < startDate) matchesDate = false
        }
        if (customDateEnd) {
          const endDate = new Date(customDateEnd)
          endDate.setHours(23, 59, 59, 999)
          if (jobDate > endDate) matchesDate = false
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  // Pagination
  const totalPages = Math.ceil(filteredJobCards.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobCards = filteredJobCards.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter, dateRangeFilter, customDateStart, customDateEnd])

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
        console.error('Job card creation error:', {
          status: response.status,
          error: result.error,
          details: result.details,
          hint: result.hint,
          code: result.code,
        })
        notify.showError(
          result.error || 'Failed to create job card',
          result.details ? `Error: ${result.details}` : 'Error'
        )
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

  const handleEditJobCard = async (data: {
    id: string
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

      const response = await fetch(`/api/company/job-cards/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          providerId: data.providerId,
          priority: data.priority,
          location: data.location,
          dueDate: data.dueDate,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Job card update error:', {
          status: response.status,
          error: result.error,
          details: result.details,
        })
        notify.showError(
          result.error || 'Failed to update job card',
          result.details ? `Error: ${result.details}` : 'Error'
        )
        throw new Error(result.error || 'Failed to update job card')
      }

      notify.showSuccess('Job card updated successfully!', 'Success')

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

      setShowEditModal(false)
      setSelectedJobCard(null)
    } catch (error) {
      console.error('Error updating job card:', error)
      throw error
    }
  }

  const handleViewDetails = (job: JobCard) => {
    // If job card is completed, show completion modal
    if (job.status === 'completed') {
      setSelectedJobCard(job)
      setShowCompletionModal(true)
    } else {
      // For other statuses, show edit modal (which will be read-only for accepted/declined)
      const provider = providers.find(p => p.name === job.provider)
      setSelectedJobCard({
        ...job,
        providerId: provider?.id || '',
      })
      setShowEditModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header 
        title="Job Cards"
        user={user ? {
          name: user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'Company Manager'
        } : undefined}
      />
      
      <main className="p-3 sm:p-4 md:p-6">
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
            className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Job Card
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '...' : jobCards.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search job cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as typeof dateRangeFilter)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateRangeFilter === 'custom' && (
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customDateStart}
                  onChange={(e) => setCustomDateStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={customDateEnd}
                  onChange={(e) => setCustomDateEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
            paginatedJobCards.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 sm:p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
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
                  <span>Due: {formatDate(job.dueDate, 'short')}</span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[job.status as keyof typeof statusColors]
                  }`}>
                    {job.status === 'completed' && job.auditedAt 
                      ? 'Completed & Audited' 
                      : job.status.replace('_', ' ')}
                  </span>
                  {job.status === 'completed' && job.auditedAt && (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Audited
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleViewDetails(job)}
                  className="text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium uppercase tracking-wide"
                >
                  {job.status === 'completed' ? 'View Completion →' : 'View Details →'}
                </button>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredJobCards.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredJobCards.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </main>

      {/* Create Job Card Modal */}
      <CreateJobCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        providers={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
        onSubmit={handleCreateJobCard}
      />

      {/* Edit Job Card Modal */}
      <EditJobCardModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedJobCard(null)
        }}
        jobCard={selectedJobCard}
        providers={providers.map(p => ({ id: p.id, name: p.name, email: p.email }))}
        onSave={handleEditJobCard}
      />

      {/* View Completion Modal */}
      {selectedJobCard && selectedJobCard.status === 'completed' && (
        <ViewCompletionModal
          isOpen={showCompletionModal}
          onClose={() => {
            setShowCompletionModal(false)
            setSelectedJobCard(null)
          }}
          jobCardTitle={selectedJobCard.title}
          jobCardId={selectedJobCard.id}
          providerName={selectedJobCard.provider}
          completionData={{
            notes: selectedJobCard.completionNotes || null,
            images: selectedJobCard.completionImages || null,
          }}
          completedAt={selectedJobCard.completedAt}
          auditedAt={selectedJobCard.auditedAt || null}
        />
      )}
    </div>
  )
}

