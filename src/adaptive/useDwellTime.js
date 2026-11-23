import { useCallback, useEffect, useRef, useState } from 'react'
import { useAdaptive } from './AdaptiveContext'

/**
 * Sensor: real-time friction / dwell-time log.
 * Measures how long the user stays on one task (e.g. one quiz question) WITHOUT counting
 * time when the tab is hidden (visibilitychange). When the time passes `thresholdMs`
 * it logs `hesitation` and returns hesitating = true, so the screen can show help.
 * Call `complete()` when the user finishes; it logs `dwell_time` with the duration.
 */
export function useDwellTime({ taskKey, thresholdMs = 15000 }) {
  const { logEvent, adaptiveOn } = useAdaptive()
  const [hesitatedKey, setHesitatedKey] = useState(null)
  const visibleMs = useRef(0)
  const lastStart = useRef(null)
  const fired = useRef(false)

  const elapsed = useCallback(() => {
    const running = lastStart.current != null ? performance.now() - lastStart.current : 0
    return visibleMs.current + running
  }, [])

  useEffect(() => {
    visibleMs.current = 0
    lastStart.current = document.visibilityState === 'visible' ? performance.now() : null
    fired.current = false

    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && lastStart.current != null) {
        visibleMs.current += performance.now() - lastStart.current
        lastStart.current = null
      } else if (document.visibilityState === 'visible' && lastStart.current == null) {
        lastStart.current = performance.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    const timer = setInterval(() => {
      if (!fired.current && elapsed() >= thresholdMs) {
        fired.current = true
        logEvent('hesitation', { task: taskKey, durationMs: elapsed(), kind: 'dwell' })
        if (adaptiveOn) setHesitatedKey(taskKey)
      }
    }, 500)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      clearInterval(timer)
    }
  }, [taskKey, thresholdMs, elapsed, logEvent, adaptiveOn])

  const complete = useCallback(
    (details = {}) => {
      const durationMs = elapsed()
      logEvent('dwell_time', { task: taskKey, durationMs, hesitated: fired.current, ...details })
      return durationMs
    },
    [elapsed, logEvent, taskKey]
  )

  return { hesitating: hesitatedKey === taskKey, complete }
}
