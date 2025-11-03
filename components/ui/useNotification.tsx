'use client'

import { useState, useCallback } from 'react'
import { NotificationType } from './Notification'
import type { NotificationItem } from './NotificationContainer'

export function useNotification() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = useCallback(
    (
      type: NotificationType,
      message: string,
      options?: {
        title?: string
        duration?: number
      }
    ) => {
      const id = Math.random().toString(36).substring(2, 9)
      const notification: NotificationItem = {
        id,
        type,
        message,
        title: options?.title,
        duration: options?.duration ?? 5000,
      }

      setNotifications((prev) => [...prev, notification])

      return id
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const showError = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showNotification('error', message, { title, duration })
    },
    [showNotification]
  )

  const showSuccess = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showNotification('success', message, { title, duration })
    },
    [showNotification]
  )

  const showInfo = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showNotification('info', message, { title, duration })
    },
    [showNotification]
  )

  const showWarning = useCallback(
    (message: string, title?: string, duration?: number) => {
      return showNotification('warning', message, { title, duration })
    },
    [showNotification]
  )

  return {
    notifications,
    showNotification,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    removeNotification,
  }
}

