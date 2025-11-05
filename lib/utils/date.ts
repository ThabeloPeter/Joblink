/**
 * Date formatting utilities
 */

/**
 * Format a date string to a readable format
 * @param dateString - ISO date string or Date object
 * @param format - Format type: 'short', 'long', 'relative', 'datetime'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  format: 'short' | 'long' | 'relative' | 'datetime' = 'short'
): string {
  if (!dateString) return 'N/A'

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString

  if (isNaN(date.getTime())) return 'Invalid Date'

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (format === 'relative') {
    if (diffInSeconds < 60) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    }
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    }
    const years = Math.floor(diffInDays / 365)
    return `${years} year${years > 1 ? 's' : ''} ago`
  }

  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  if (format === 'datetime') {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString()
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateForInput(dateString: string | Date | null | undefined): string {
  if (!dateString) return ''
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

/**
 * Check if a date is in the past
 */
export function isPastDate(dateString: string | Date | null | undefined): boolean {
  if (!dateString) return false
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return false
  return date < new Date()
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string | Date | null | undefined): boolean {
  if (!dateString) return false
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

