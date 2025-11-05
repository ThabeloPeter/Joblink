'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, FileText } from 'lucide-react'

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
}

interface Provider {
  id: string
  name: string
  email: string
}

interface EditJobCardModalProps {
  isOpen: boolean
  onClose: () => void
  jobCard: JobCard | null
  providers: Provider[]
  onSave: (data: {
    id: string
    title: string
    description: string
    providerId: string
    priority: string
    location: string
    dueDate: string
  }) => Promise<void>
}

const statusColors = {
  pending: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  accepted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  declined: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

export default function EditJobCardModal({
  isOpen,
  onClose,
  jobCard,
  providers,
  onSave,
}: EditJobCardModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    providerId: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    location: '',
    dueDate: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [canEditProvider, setCanEditProvider] = useState(false)

  useEffect(() => {
    if (jobCard) {
      setFormData({
        title: jobCard.title || '',
        description: jobCard.description || '',
        providerId: jobCard.providerId || providers.find(p => p.name === jobCard.provider)?.id || '',
        priority: (jobCard.priority as 'low' | 'medium' | 'high') || 'medium',
        location: jobCard.location || '',
        dueDate: jobCard.dueDate || '',
      })
      // Provider can only be edited if status is pending (not accepted or beyond)
      setCanEditProvider(jobCard.status === 'pending')
    }
  }, [jobCard, providers])

  // Check if job card can be edited at all
  const canEdit = jobCard && !['completed', 'accepted', 'declined'].includes(jobCard.status)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobCard) return

    setIsSaving(true)
    try {
      await onSave({
        id: jobCard.id,
        ...formData,
      })
      onClose()
    } catch (error) {
      console.error('Error saving job card:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const providerChanged = canEditProvider && jobCard.providerId && formData.providerId !== jobCard.providerId

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
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700">
                    <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {canEdit ? 'Edit Job Card' : 'View Job Card'}
                    </h2>
                    {!canEdit && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        This job card cannot be edited. Only pending and in_progress job cards can be edited.
                      </p>
                    )}
                    {canEdit && !canEditProvider && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Provider cannot be changed once job card is accepted
                      </p>
                    )}
                    {canEdit && canEditProvider && providerChanged && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Changing provider will recall this job card
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Current Status Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Current Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-xs font-medium uppercase tracking-wide ${
                        statusColors[jobCard.status as keyof typeof statusColors] || 
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {jobCard.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Current Provider
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {jobCard.provider}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={!canEdit}
                    className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                      !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    disabled={!canEdit}
                    className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none ${
                      !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Provider and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Provider *
                      {canEditProvider && providerChanged && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                          (Will recall and reassign)
                        </span>
                      )}
                      {!canEditProvider && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Cannot change - job card already accepted)
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.providerId}
                      onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                      required
                      disabled={!canEditProvider}
                      className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        !canEditProvider ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Select a provider...</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      required
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Location and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                      disabled={!canEdit}
                      className={`w-full px-4 py-3 border-2 border-gray-400 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
                        !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  {canEdit && (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

