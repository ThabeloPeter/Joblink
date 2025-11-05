'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, CheckCircle, Image as ImageIcon, FileText, Clock } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'
import { getAuthToken } from '@/lib/auth'
import { formatDate } from '@/lib/utils/date'

interface CompletionData {
  notes: string | null
  images: string[] | null
}

interface ViewCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  jobCardTitle: string
  jobCardId: string
  providerName: string
  completionData: CompletionData
  completedAt: string | null
  auditedAt?: string | null
}

export default function ViewCompletionModal({
  isOpen,
  onClose,
  jobCardTitle,
  jobCardId,
  providerName,
  completionData,
  completedAt,
  auditedAt,
}: ViewCompletionModalProps) {
  const notify = useNotify()
  const [isAuditing, setIsAuditing] = useState(false)

  if (!isOpen) return null

  const images = completionData.images && Array.isArray(completionData.images) 
    ? completionData.images 
    : completionData.images 
      ? [completionData.images] 
      : []

  const handleAudit = async () => {
    setIsAuditing(true)
    try {
      const token = getAuthToken()
      if (!token) {
        notify.showError('Authentication required', 'Error')
        return
      }

      const response = await fetch(`/api/company/job-cards/${jobCardId}/audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to audit job card')
      }

      notify.showSuccess('Job card audited successfully. Provider has been notified.', 'Success')
      onClose()
    } catch (error) {
      console.error('Error auditing job card:', error)
      notify.showError(
        `Failed to audit job card: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Error'
      )
    } finally {
      setIsAuditing(false)
    }
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
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      Job Card Completion Details
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {jobCardTitle}
                    </p>
                  </div>
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
                {/* Job Card Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Provider
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {providerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Completed At
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {completedAt ? formatDate(completedAt, 'datetime') : 'N/A'}
                    </p>
                  </div>
                  {auditedAt && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Audited At
                      </p>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {formatDate(auditedAt, 'datetime')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Completion Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Completion Notes
                    </h3>
                  </div>
                  {completionData.notes ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {completionData.notes}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No completion notes provided
                      </p>
                    </div>
                  )}
                </div>

                {/* Completion Images */}
                {images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Completion Images ({images.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                          <Image
                            src={imageUrl}
                            alt={`Completion image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                          >
                            <span className="text-white text-sm font-medium">View Full Size</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Close
                  </button>
                  {auditedAt ? (
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Already Audited</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAudit}
                      disabled={isAuditing}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {isAuditing ? 'Auditing...' : 'Audit & Approve'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

