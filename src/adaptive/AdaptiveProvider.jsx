import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdaptiveContext } from './AdaptiveContext'

// After this many errors in one session, high contrast turns on automatically.
const AUTO_CONTRAST_THRESHOLD = 3

export default function AdaptiveProvider({ children }) {
  const [errorCount, setErrorCount] = useState(0)
  const [highContrast, setHighContrast] = useState(false)
  const [autoContrast, setAutoContrast] = useState(false) // true = the app turned it on and the banner is showing
  const [logs, setLogs] = useState([])

  // A ref keeps the latest count right away (state updates are async).
  const errorRef = useRef(0)

  // Interaction log: every sensor writes here (saved to Firebase in a later phase).
  const logEvent = useCallback((type, detail = {}) => {
    const entry = { type, detail, time: new Date().toISOString() }
    setLogs((prev) => [...prev, entry])
    console.info('[adaptive]', type, detail)
  }, [])

  // Called by any form/screen when the user makes an error.
  const reportError = useCallback(
    (source) => {
      errorRef.current += 1
      setErrorCount(errorRef.current)
      logEvent('input_error', { source, count: errorRef.current })

      if (errorRef.current >= AUTO_CONTRAST_THRESHOLD && !highContrast) {
        setHighContrast(true)
        setAutoContrast(true)
        logEvent('auto_contrast_on', { afterErrors: errorRef.current })
      }
    },
    [highContrast, logEvent]
  )

  // "Undo" from the banner: user control & freedom.
  const undoContrast = useCallback(() => {
    setHighContrast(false)
    setAutoContrast(false)
    errorRef.current = 0
    setErrorCount(0)
    logEvent('auto_contrast_undo')
  }, [logEvent])

  // "Keep it" from the banner: contrast stays on, banner hides.
  const keepContrast = useCallback(() => {
    setAutoContrast(false)
    logEvent('auto_contrast_kept')
  }, [logEvent])

  // Manual on/off switch (header quick toggle, settings).
  const toggleContrast = useCallback(() => {
    logEvent('manual_contrast_toggle', { on: !highContrast })
    setHighContrast(!highContrast)
    setAutoContrast(false)
  }, [highContrast, logEvent])

  // Put/remove the `high-contrast` class on <html> so CSS can react globally.
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  const value = useMemo(
    () => ({
      errorCount,
      highContrast,
      autoContrast,
      logs,
      logEvent,
      reportError,
      undoContrast,
      keepContrast,
      toggleContrast,
    }),
    [errorCount, highContrast, autoContrast, logs, logEvent, reportError, undoContrast, keepContrast, toggleContrast]
  )

  return <AdaptiveContext.Provider value={value}>{children}</AdaptiveContext.Provider>
}
