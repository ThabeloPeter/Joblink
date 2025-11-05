'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

interface ConfirmActionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  type?: 'accept' | 'decline' | 'warning' | 'info'
  isLoading?: boolean
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  type = 'warning',
  isLoading = false,
}: ConfirmActionModalProps) {
  if (!isOpen) return null

  const iconColors = {
    accept: 'text-green-600 dark:text-green-400',
    decline: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const confirmButtonColors = {
    accept: 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600',
    decline: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600',
    warning: 'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-600',
    info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600',
  }

  const Icon = type === 'accept' ? CheckCircle : type === 'decline' ? XCircle : AlertTriangle

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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 w-full max-w-md"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-2 ${iconColors[type]} ${
                    type === 'accept' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : type === 'decline' 
                      ? 'bg-red-100 dark:bg-red-900/30' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelLabel}
                  </button>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`px-4 py-2 text-sm font-medium text-white ${confirmButtonColors[type]} transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide`}
                  >
                    {isLoading ? 'Processing...' : confirmLabel}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

