import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

/**
 * Short message at the bottom of the screen, optionally with an action (e.g. Undo).
 * - Lives in an aria-live region, so screen readers announce it.
 * - Disappears after `duration` ms (default 5 s), but the timer pauses while
 *   the user hovers or focuses it (WCAG 2.2.1 Timing Adjustable).
 * - `raised` lifts it above the bottom navigation.
 */
export default function ToastProvider({ children, raised = false }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }, [])

  const startTimer = useCallback(
    (duration) => {
      clearTimer()
      timerRef.current = setTimeout(() => setToast(null), duration)
    },
    [clearTimer]
  )

  const dismiss = useCallback(() => {
    clearTimer()
    setToast(null)
  }, [clearTimer])

  const show = useCallback(
    ({ message, actionLabel, onAction, duration = 5000 }) => {
      setToast({ id: Date.now(), message, actionLabel, onAction, duration })
      startTimer(duration)
    },
    [startTimer]
  )

  // Clear the timer if the provider unmounts.
  useEffect(() => clearTimer, [clearTimer])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-4 z-40 ${raised ? 'bottom-28' : 'bottom-6'}`}
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-ink py-1 pl-4 pr-1 text-white shadow-lg"
            onMouseEnter={clearTimer}
            onMouseLeave={() => startTimer(toast.duration)}
            onFocus={clearTimer}
            onBlur={() => startTimer(toast.duration)}
          >
            <p className="flex-1 py-2 text-sm">{toast.message}</p>
            {toast.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  toast.onAction?.()
                  dismiss()
                }}
                className="min-h-11 rounded-lg px-3 font-semibold text-rose-light underline focus-visible:outline-white"
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={dismiss}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-xl focus-visible:outline-white"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
