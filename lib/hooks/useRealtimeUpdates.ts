'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseRealtimeUpdatesOptions {
  enabled?: boolean
  interval?: number
  onUpdate?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook for real-time updates using polling
 * @param options Configuration options
 * @returns Object with start/stop functions and active state
 */
export function useRealtimeUpdates({
  enabled = true,
  interval = 30000, // 30 seconds default
  onUpdate,
  onError,
}: UseRealtimeUpdatesOptions = {}) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onUpdateRef = useRef(onUpdate)
  const onErrorRef = useRef(onError)

  // Keep refs updated
  useEffect(() => {
    onUpdateRef.current = onUpdate
    onErrorRef.current = onError
  }, [onUpdate, onError])

  const start = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (!enabled || !onUpdateRef.current) return

    // Immediate first update
    try {
      onUpdateRef.current()
    } catch (error) {
      onErrorRef.current?.(error as Error)
    }

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      try {
        onUpdateRef.current?.()
      } catch (error) {
        onErrorRef.current?.(error as Error)
      }
    }, interval)
  }, [enabled, interval])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      start()
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [enabled, start, stop])

  return {
    start,
    stop,
    isActive: intervalRef.current !== null,
  }
}

