'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, User as UserIcon, Building2, FileText } from 'lucide-react'

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

interface ViewJobCardModalProps {
  isOpen: boolean
  onClose: () => void
  jobCard: JobCard | null
}

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

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

const statusLabels = {
  pending: 'Pending',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  declined: 'Declined',
}

export default function ViewJobCardModal({
  isOpen,
  onClose,
  jobCard,
}: ViewJobCardModalProps) {
  if (!isOpen) return null

  if (!jobCard) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-2xl p-6 pointer-events-auto"
              >
                <p className="text-gray-600 dark:text-gray-400">No job card data available.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700">
                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Job Card Details
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`w-3 h-3 mt-2 flex-shrink-0 ${
                        priorityColors[jobCard.priority as keyof typeof priorityColors] || 'bg-gray-500'
                      }`}
                    ></div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex-1">
                      {jobCard.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 ml-5">
                    {jobCard.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Company */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Company
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {jobCard.company}
                      </p>
                    </div>
                  </div>

                  {/* Service Provider */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Service Provider
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {jobCard.provider}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {jobCard.location}
                      </p>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Due Date
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {jobCard.dueDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                        statusColors[jobCard.status as keyof typeof statusColors] || 
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {statusLabels[jobCard.status as keyof typeof statusLabels] || jobCard.status}
                    </span>
                  </div>

                  <div className="p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Priority
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 ${
                          priorityColors[jobCard.priority as keyof typeof priorityColors] || 'bg-gray-500'
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {priorityLabels[jobCard.priority as keyof typeof priorityLabels] || jobCard.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {(jobCard.createdAt || jobCard.completedAt) && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    {jobCard.createdAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {jobCard.createdAt}
                        </span>
                      </div>
                    )}
                    {jobCard.completedAt && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {jobCard.completedAt}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white border border-gray-900 dark:border-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors text-sm font-medium uppercase tracking-wide"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

