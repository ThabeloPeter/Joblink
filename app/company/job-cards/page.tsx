'use client'

import { useState } from 'react'
import Header from '@/components/dashboard/Header'
import { ClipboardList, Plus, Search, Filter, Calendar, MapPin, User, AlertCircle } from 'lucide-react'

// Mock data - replace with Supabase queries
const mockJobCards = [
  {
    id: 1,
    title: 'Office Repairs - Building A',
    description: 'Fix broken windows and door locks on the 3rd floor',
    provider: 'John Doe',
    status: 'in_progress',
    priority: 'high',
    location: 'Building A, 3rd Floor',
    createdAt: '2024-01-15',
    dueDate: '2024-01-20',
    completedAt: null,
  },
  {
    id: 2,
    title: 'Maintenance Check - HVAC System',
    description: 'Routine maintenance check for all HVAC units',
    provider: 'Jane Smith',
    status: 'accepted',
    priority: 'medium',
    location: 'Building B, All Floors',
    createdAt: '2024-01-16',
    dueDate: '2024-01-25',
    completedAt: null,
  },
  {
    id: 3,
    title: 'Installation Work - New Equipment',
    description: 'Install new machinery in the warehouse',
    provider: 'Mike Johnson',
    status: 'pending',
    priority: 'low',
    location: 'Warehouse',
    createdAt: '2024-01-17',
    dueDate: '2024-01-30',
    completedAt: null,
  },
  {
    id: 4,
    title: 'Emergency Fix - Electrical Issue',
    description: 'Urgent electrical repair needed in main office',
    provider: 'Sarah Wilson',
    status: 'in_progress',
    priority: 'high',
    location: 'Main Office, Ground Floor',
    createdAt: '2024-01-18',
    dueDate: '2024-01-19',
    completedAt: null,
  },
  {
    id: 5,
    title: 'Painting Work - Conference Room',
    description: 'Paint walls and ceiling in conference room',
    provider: 'John Doe',
    status: 'completed',
    priority: 'medium',
    location: 'Building A, 2nd Floor',
    createdAt: '2024-01-10',
    dueDate: '2024-01-15',
    completedAt: '2024-01-15',
  },
]

export default function JobCardsPage() {
  const [jobCards, setJobCards] = useState(mockJobCards)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header 
        title="Job Cards"
        user={{
          name: 'Company User',
          email: 'user@company.com',
          role: 'Company Manager'
        }}
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
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" />
            Create Job Card
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{jobCards.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {jobCards.filter((j) => j.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {jobCards.filter((j) => j.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {jobCards.filter((j) => j.status === 'completed').length}
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
          {filteredJobCards.map((job) => (
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
                  <User className="w-4 h-4" />
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
          ))}
        </div>

        {filteredJobCards.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ClipboardList className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No job cards found</p>
          </div>
        )}
      </main>
    </div>
  )
}

