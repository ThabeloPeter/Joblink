'use client'

import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    isPositive: boolean
  }
  icon: LucideIcon
  iconColor?: string
  trend?: {
    label: string
    isPositive: boolean
  }
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 sm:p-5 md:p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 sm:mb-2 uppercase tracking-wide">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        </div>
        <div className="p-1.5 sm:p-2 border border-gray-300 dark:border-gray-700 flex-shrink-0 ml-2">
          <Icon className={clsx('w-4 h-4 sm:w-5 sm:h-5', iconColor)} />
        </div>
      </div>
      
      {(change || trend) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {change && (
            <span className={clsx(
              'text-xs font-medium uppercase tracking-wide',
              change.isPositive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'
            )}>
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
          )}
          {trend && (
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

