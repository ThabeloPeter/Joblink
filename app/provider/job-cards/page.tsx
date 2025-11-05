'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { ClipboardList, Search, Calendar, Building2, CheckCircle, XCircle, PlayCircle } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'
import ViewJobCardModal from '@/components/modals/ViewJobCardModal'
import ConfirmActionModal from '@/components/modals/ConfirmActionModal'

interface JobCard {
  id: string
  title: string
  description: string
  company: string
  companyId: string
  status: string
  priority: string
  location: string
  dueDate: string
  createdAt: string
  completedAt: string | null
}

export default function ProviderJobCardsPage() {
  const notify = useNotify()
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ jobCardId: string; status: 'accepted' | 'declined' } | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function fetchJobCards() {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch('/api/provider/job-cards', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setJobCards(data.jobCards || [])
        } else {
          notify.showError('Failed to load job cards', 'Error')
        }
      } catch (error) {
        console.error('Error fetching job cards:', error)
        notify.showError('Failed to load job cards', 'Error')
      } finally {
        setLoading(false)
      }
    }

    fetchJobCards()
  }, [notify])

  const filteredJobCards = jobCards.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
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

  const handleStatusUpdateClick = (jobCardId: string, status: 'accepted' | 'declined') => {
    const jobCard = jobCards.find(j => j.id === jobCardId)
    setPendingAction({ jobCardId, status })
    setShowConfirmModal(true)
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return

    setIsUpdating(true)
    try {
      const token = getAuthToken()
      if (!token) {
        notify.showError('Authentication required', 'Error')
        setShowConfirmModal(false)
        setPendingAction(null)
        setIsUpdating(false)
        return
      }

      const response = await fetch(`/api/provider/job-cards/${pendingAction.jobCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: pendingAction.status }),
      })

      const result = await response.json()

      if (!response.ok) {
        notify.showError(result.error || 'Failed to update job card', 'Error')
        setShowConfirmModal(false)
        setPendingAction(null)
        setIsUpdating(false)
        return
      }

      // Update local state
      setJobCards((prev) =>
        prev.map((job) =>
          job.id === pendingAction.jobCardId
            ? { ...job, status: pendingAction.status }
            : job
        )
      )

      const statusMessages: Record<string, string> = {
        accepted: 'Job card accepted',
        declined: 'Job card declined',
      }

      notify.showSuccess(statusMessages[pendingAction.status] || 'Job card updated', 'Success')
      setShowConfirmModal(false)
      setPendingAction(null)
    } catch (error) {
      console.error('Error updating job card:', error)
      notify.showError('Failed to update job card. Please try again.', 'Error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusUpdate = async (jobCardId: string, newStatus: 'in_progress' | 'completed') => {
    try {
      const token = getAuthToken()
      if (!token) {
        notify.showError('Authentication required', 'Error')
        return
      }

      const response = await fetch(`/api/provider/job-cards/${jobCardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()

      if (!response.ok) {
        notify.showError(result.error || 'Failed to update job card', 'Error')
        return
      }

      // Update local state
      setJobCards((prev) =>
        prev.map((job) =>
          job.id === jobCardId
            ? { ...job, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : job.completedAt }
            : job
        )
      )

      const statusMessages: Record<string, string> = {
        in_progress: 'Job card marked as in progress',
        completed: 'Job card marked as completed',
      }

      notify.showSuccess(statusMessages[newStatus] || 'Job card updated', 'Success')
    } catch (error) {
      console.error('Error updating job card:', error)
      notify.showError('Failed to update job card. Please try again.', 'Error')
    }
  }

  const handleViewDetails = (jobCard: JobCard) => {
    setSelectedJobCard(jobCard)
    setShowViewModal(true)
  }

  const statusCounts = {
    all: jobCards.length,
    pending: jobCards.filter((j) => j.status === 'pending').length,
    accepted: jobCards.filter((j) => j.status === 'accepted').length,
    in_progress: jobCards.filter((j) => j.status === 'in_progress').length,
    completed: jobCards.filter((j) => j.status === 'completed').length,
    declined: jobCards.filter((j) => j.status === 'declined').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="My Job Cards"
        user={user ? {
          name: user.email?.split('@')[0] || 'Provider',
          email: user.email || '',
          role: 'Service Provider'
        } : undefined}
      />
      
      <main className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Job Cards
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            View and manage your assigned job cards
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.all}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.accepted}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.in_progress}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.completed}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Declined</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{statusCounts.declined}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
          </div>
        </div>

        {/* Job Cards Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading job cards...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Job Card
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredJobCards.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{job.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${priorityColors[job.priority as keyof typeof priorityColors] || 'bg-gray-500'}`}></span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{job.priority}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.dueDate ? (
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(job.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No due date</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(job)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors uppercase tracking-wide"
                          >
                            View
                          </button>
                          {job.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdateClick(job.id, 'accepted')}
                                className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 transition-colors uppercase tracking-wide flex items-center gap-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusUpdateClick(job.id, 'declined')}
                                className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 transition-colors uppercase tracking-wide flex items-center gap-1"
                              >
                                <XCircle className="w-4 h-4" />
                                Decline
                              </button>
                            </>
                          )}
                          {job.status === 'accepted' && (
                            <button
                              onClick={() => handleStatusUpdate(job.id, 'in_progress')}
                              className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600 transition-colors uppercase tracking-wide flex items-center gap-1"
                            >
                              <PlayCircle className="w-4 h-4" />
                              Start
                            </button>
                          )}
                          {job.status === 'in_progress' && (
                            <button
                              onClick={() => handleStatusUpdate(job.id, 'completed')}
                              className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 border border-green-300 dark:border-green-700 hover:border-green-400 dark:hover:border-green-600 transition-colors uppercase tracking-wide flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && filteredJobCards.length === 0 && (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No job cards found</p>
            </div>
          )}
        </div>
      </main>

      {/* View Job Card Modal */}
      {selectedJobCard && (
        <ViewJobCardModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false)
            setSelectedJobCard(null)
          }}
          jobCard={{
            id: selectedJobCard.id,
            title: selectedJobCard.title,
            description: selectedJobCard.description,
            company: selectedJobCard.company,
            provider: '',
            location: selectedJobCard.location,
            dueDate: selectedJobCard.dueDate,
            status: selectedJobCard.status,
            priority: selectedJobCard.priority,
            createdAt: selectedJobCard.createdAt,
            completedAt: selectedJobCard.completedAt,
          }}
        />

        {/* Confirmation Modal */}
        {pendingAction && (
          <ConfirmActionModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false)
              setPendingAction(null)
            }}
            onConfirm={handleConfirmAction}
            title={pendingAction.status === 'accepted' ? 'Accept Job Card?' : 'Decline Job Card?'}
            message={
              pendingAction.status === 'accepted'
                ? 'Are you sure you want to accept this job card? You will be able to start working on it once accepted.'
                : 'Are you sure you want to decline this job card? This action cannot be undone. The company will be notified.'
            }
            confirmLabel={pendingAction.status === 'accepted' ? 'Accept' : 'Decline'}
            type={pendingAction.status === 'accepted' ? 'accept' : 'decline'}
            isLoading={isUpdating}
          />
        )}
      </div>
    )
  }

