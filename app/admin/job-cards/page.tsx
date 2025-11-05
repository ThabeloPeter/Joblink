'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/dashboard/Header'
import { FileText, Search, Calendar, MapPin, User as UserIcon, Building2 } from 'lucide-react'
import { getAuthToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { User } from '@/lib/types/user'
import ViewJobCardModal from '@/components/modals/ViewJobCardModal'

interface JobCard {
  id: string
  title: string
  description: string
  company: string
  provider: string
  status: string
  priority: string
  location: string
  createdAt: string
  dueDate: string
  completedAt: string | null
}

export default function AdminJobCardsPage() {
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [companyFilter, setCompanyFilter] = useState<string>('all')
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

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

        const response = await fetch('/api/admin/job-cards', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch job cards')
        }

        const data = await response.json()
        setJobCards(data.jobCards || [])
      } catch (error) {
        console.error('Error fetching job cards:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobCards()
  }, [])

  const filteredJobCards = jobCards.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    const matchesCompany = companyFilter === 'all' || job.company === companyFilter
    return matchesSearch && matchesStatus && matchesCompany
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

  const uniqueCompanies = Array.from(new Set(jobCards.map((job) => job.company)))

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header
        title="Job Cards"
        user={user ? {
          name: user.email?.split('@')[0] || 'Admin',
          email: user.email || '',
          role: 'Administrator',
        } : undefined}
      />

      <main className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Manage Job Cards
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Monitor and manage all job cards across the platform
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : jobCards.filter((j) => j.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Companies</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '...' : uniqueCompanies.length}
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
                placeholder="Search job cards by title, description, company, or provider..."
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
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">All Companies</option>
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
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
                      Provider
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredJobCards.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-3 h-3 mt-2 flex-shrink-0 bg-gray-700 ${
                            priorityColors[job.priority as keyof typeof priorityColors] || 'bg-gray-700'
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {job.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {job.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {job.provider}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {job.location}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                          statusColors[job.status as keyof typeof statusColors] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {job.dueDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => {
                          setSelectedJobCard(job)
                          setShowViewModal(true)
                        }}
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredJobCards.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No job cards found</p>
            </div>
          )}
        </div>
      </main>

      {/* View Job Card Modal */}
      <ViewJobCardModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedJobCard(null)
        }}
        jobCard={selectedJobCard}
      />
    </div>
  )
}

