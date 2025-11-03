'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, MapPin, User, AlertCircle, FileText } from 'lucide-react'
import { useNotify } from '@/components/ui/NotificationProvider'

const jobCardSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  providerId: z.string().min(1, 'Please select a provider'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority',
  }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type JobCardFormData = z.infer<typeof jobCardSchema>

interface CreateJobCardModalProps {
  isOpen: boolean
  onClose: () => void
  providers: Array<{ id: number; name: string; email: string }>
  onSubmit?: (data: JobCardFormData) => Promise<void> | void
}

export default function CreateJobCardModal({
  isOpen,
  onClose,
  providers,
  onSubmit,
}: CreateJobCardModalProps) {
  const notify = useNotify()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobCardFormData>({
    resolver: zodResolver(jobCardSchema),
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  const onSubmitForm = async (data: JobCardFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Default behavior - mock submission
        console.log('Job Card Data:', data)
        notify.showSuccess('Job card created successfully!', 'Success')
      }
      onClose()
      reset()
    } catch {
      notify.showError('Failed to create job card. Please try again.', 'Error')
    }
  }

  if (!isOpen) return null

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create Job Card
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Fill in the details to create a new job card
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      {...register('title')}
                      placeholder="e.g., Office Repairs - Building A"
                      className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium ${
                        errors.title
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    placeholder="Provide detailed description of the job..."
                    className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium resize-none ${
                      errors.description
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-gray-400 dark:border-gray-600'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Grid: Provider and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Service Provider <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <select
                        {...register('providerId')}
                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium appearance-none ${
                          errors.providerId
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-400 dark:border-gray-600'
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
                    {errors.providerId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.providerId.message}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('priority')}
                      className={`w-full px-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium ${
                        errors.priority
                          ? 'border-red-300 dark:border-red-700'
                          : 'border-gray-400 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select priority...</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {errors.priority && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.priority.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grid: Location and Due Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        {...register('location')}
                        placeholder="e.g., Building A, 3rd Floor"
                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 font-medium ${
                          errors.location
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-400 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="date"
                        {...register('dueDate')}
                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium ${
                          errors.dueDate
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-400 dark:border-gray-600'
                        }`}
                      />
                    </div>
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.dueDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Job Card'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

