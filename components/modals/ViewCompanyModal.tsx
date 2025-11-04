'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Mail, User as UserIcon, Phone, Calendar } from 'lucide-react'

interface Company {
  id: string
  name: string
  email: string
  contactPerson: string
  phone: string
  status: string
  createdAt: string
  totalJobCards: number
  activeJobCards: number
}

interface ViewCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  company: Company | null
}

const statusColors = {
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  suspended: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
}

const statusLabels = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export default function ViewCompanyModal({
  isOpen,
  onClose,
  company,
}: ViewCompanyModalProps) {
  if (!isOpen) return null

  if (!company) {
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
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-2xl p-6 pointer-events-auto"
              >
                <p className="text-gray-600 dark:text-gray-400">No company data available.</p>
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
                    <Building2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Company Details
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
                {/* Company Name */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {company.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Company registration information and statistics
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Email Address
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {company.email}
                      </p>
                    </div>
                  </div>

                  {/* Contact Person */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Contact Person
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {company.contactPerson}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Phone Number
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {company.phone}
                      </p>
                    </div>
                  </div>

                  {/* Registration Date */}
                  <div className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-700">
                    <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Registered
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {company.createdAt}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status */}
                  <div className="p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                        statusColors[company.status as keyof typeof statusColors] || 
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {statusLabels[company.status as keyof typeof statusLabels] || company.status}
                    </span>
                  </div>

                  {/* Job Cards Statistics */}
                  <div className="p-4 border border-gray-300 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                      Job Cards
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {company.activeJobCards}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {company.totalJobCards}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company ID */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Company ID:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">
                      {company.id}
                    </span>
                  </div>
                </div>
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

