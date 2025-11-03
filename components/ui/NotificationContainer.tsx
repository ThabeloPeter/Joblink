'use client'

import { AnimatePresence } from 'framer-motion'
import Notification, { NotificationType } from './Notification'

export interface NotificationItem {
  id: string
  type: NotificationType
  title?: string
  message: string
  duration?: number
}

interface NotificationContainerProps {
  notifications: NotificationItem[]
  onRemove: (id: string) => void
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export default function NotificationContainer({
  notifications,
  onRemove,
  position = 'top-right',
}: NotificationContainerProps) {
  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 flex flex-col gap-3 pointer-events-none`}
    >
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              {...notification}
              onClose={() => onRemove(notification.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

