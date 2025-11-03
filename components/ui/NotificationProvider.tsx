'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useNotification } from './useNotification'
import NotificationContainer from './NotificationContainer'

interface NotificationContextType {
  showError: (message: string, title?: string, duration?: number) => string
  showSuccess: (message: string, title?: string, duration?: number) => string
  showInfo: (message: string, title?: string, duration?: number) => string
  showWarning: (message: string, title?: string, duration?: number) => string
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    notifications,
    showError,
    showSuccess,
    showInfo,
    showWarning,
    removeNotification,
  } = useNotification()

  return (
    <NotificationContext.Provider
      value={{
        showError,
        showSuccess,
        showInfo,
        showWarning,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
        position="top-right"
      />
    </NotificationContext.Provider>
  )
}

export function useNotify() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotify must be used within a NotificationProvider')
  }
  return context
}

