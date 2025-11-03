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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className={clsx('p-3 rounded-lg bg-gray-50 dark:bg-gray-700', iconColor.replace('text-', 'bg-').replace('-600', '-50'))}>
          <Icon className={clsx('w-6 h-6', iconColor)} />
        </div>
      </div>
      
      {(change || trend) && (
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          {change && (
            <span className={clsx(
              'text-sm font-medium',
              change.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {change.isPositive ? '+' : ''}{change.value}%
            </span>
          )}
          {trend && (
            <span className={clsx(
              'text-xs',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

