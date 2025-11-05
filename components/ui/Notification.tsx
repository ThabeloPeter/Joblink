'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'error' | 'success' | 'info' | 'warning'

export interface NotificationProps {
  id?: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
  onClose?: () => void
}

const notificationConfig = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-white dark:bg-gray-800',
    borderColor: 'border-red-500 dark:border-red-600',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-gray-900 dark:text-gray-100',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-white dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-700',
    iconColor: 'text-gray-700 dark:text-gray-300',
    titleColor: 'text-gray-900 dark:text-gray-100',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
  info: {
    icon: Info,
    bgColor: 'bg-white dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-700',
    iconColor: 'text-gray-700 dark:text-gray-300',
    titleColor: 'text-gray-900 dark:text-gray-100',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-white dark:bg-gray-800',
    borderColor: 'border-gray-300 dark:border-gray-700',
    iconColor: 'text-gray-700 dark:text-gray-300',
    titleColor: 'text-gray-900 dark:text-gray-100',
    textColor: 'text-gray-700 dark:text-gray-300',
  },
}

export default function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const config = notificationConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`${config.bgColor} ${config.borderColor} border rounded-none shadow-none p-4 min-w-[300px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`${config.titleColor} font-semibold text-sm mb-1`}>
              {title}
            </h4>
          )}
          <p className={`${config.textColor} text-sm`}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

