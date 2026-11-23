import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdaptiveContext } from './AdaptiveContext'
import { useAuth } from '../auth/AuthContext'
import { updateUser, writeLogs } from '../lib/db'

// After this many errors in one session, high contrast turns on automatically.
const AUTO_CONTRAST_THRESHOLD = 3
const FLUSH_DELAY_MS = 4000
const MAX_MEMORY_LOGS = 300

const media = (q) => typeof window !== 'undefined' && window.matchMedia?.(q).matches

// Defaults respect the operating-system preferences on first load.
function defaultSettings() {
  return {
    highContrast: Boolean(media('(prefers-contrast: more)')),
    largeText: false,
    reduceMotion: Boolean(media('(prefers-reduced-motion: reduce)')),
    adaptiveOn: true,
  }
}

const newSessionId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2))

export default function AdaptiveProvider({ children }) {
  const { user, profile } = useAuth()
  const { pathname } = useLocation()

  const [defaults] = useState(defaultSettings)
  const [localSettings, setLocalSettings] = useState({})
  const [errorCount, setErrorCount] = useState(0)
  const [autoContrast, setAutoContrast] = useState(false) // true = app turned it on and the banner is showing
  const [logs, setLogs] = useState([])
  const [announcement, setAnnouncement] = useState({ id: 0, text: '' })
  const [sessionId] = useState(newSessionId)

  // Saved settings (Firestore) < this session's changes
  const settings = useMemo(
    () => ({ ...defaults, ...(profile?.settings ?? {}), ...localSettings }),
    [defaults, profile?.settings, localSettings]
  )

  const errorRef = useRef(0)
  const queueRef = useRef([])
  const flushTimer = useRef(null)
  const screenRef = useRef(pathname)
  const uidRef = useRef(user?.uid ?? null)

  useEffect(() => {
    screenRef.current = pathname
  }, [pathname])

  /* ---------- interaction log → Firestore (batched, debounced, kept in memory if offline) ---------- */

  const flush = useCallback(async () => {
    clearTimeout(flushTimer.current)
    flushTimer.current = null
    const uid = uidRef.current
    if (!uid || queueRef.current.length === 0) return
    const batch = queueRef.current.splice(0, 400)
    try {
      await writeLogs(uid, batch)
    } catch (err) {
      console.warn('[adaptive] logs not saved yet, will retry', err)
      queueRef.current.unshift(...batch)
    }
  }, [])

  useEffect(() => {
    // Logged out: drop unsent events so they are never saved under the NEXT account on this device.
    if (!user && uidRef.current) queueRef.current = []
    uidRef.current = user?.uid ?? null
    if (user) flush() // events from before login (e.g. sign-up errors) are saved now
  }, [user, flush])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [flush])

  const logEvent = useCallback(
    (type, details = {}) => {
      const entry = {
        type,
        screen: screenRef.current,
        details,
        timestamp: Date.now(),
        sessionId,
      }
      if (details.field) entry.field = details.field
      if (details.durationMs != null) entry.durationMs = Math.round(details.durationMs)
      if (details.count != null) entry.count = details.count

      setLogs((prev) => [...prev.slice(-MAX_MEMORY_LOGS + 1), entry])
      queueRef.current.push(entry)
      if (queueRef.current.length >= 10) flush()
      else if (!flushTimer.current) flushTimer.current = setTimeout(flush, FLUSH_DELAY_MS)
      if (import.meta.env.DEV) console.info('[adaptive]', type, details)
    },
    [sessionId, flush]
  )

  /* ---------- screen-reader announcements (one shared aria-live region) ---------- */

  const announce = useCallback((text) => {
    setAnnouncement((prev) => ({ id: prev.id + 1, text }))
  }, [])

  /* ---------- settings ---------- */

  const setSetting = useCallback(
    (key, value, { persist = true } = {}) => {
      setLocalSettings((prev) => ({ ...prev, [key]: value }))
      if (persist && uidRef.current) {
        updateUser(uidRef.current, { settings: { [key]: value } }).catch((err) =>
          console.warn('[adaptive] setting not saved', err)
        )
      }
      logEvent('setting_changed', { setting: key, value })
    },
    [logEvent]
  )

  /* ---------- error sensor + auto contrast ---------- */

  // Called once per failed attempt (e.g. a form submit with errors).
  const reportError = useCallback(
    (source, details = {}) => {
      errorRef.current += 1
      setErrorCount(errorRef.current)
      logEvent('input_error', { source, count: errorRef.current, ...details })

      if (settings.adaptiveOn && errorRef.current >= AUTO_CONTRAST_THRESHOLD && !settings.highContrast) {
        setLocalSettings((prev) => ({ ...prev, highContrast: true })) // this session only, until "Keep it"
        setAutoContrast(true)
        logEvent('auto_contrast_on', { afterErrors: errorRef.current })
      }
    },
    [logEvent, settings.adaptiveOn, settings.highContrast]
  )

  // "Undo" from the banner: user control & freedom.
  const undoContrast = useCallback(() => {
    setLocalSettings((prev) => ({ ...prev, highContrast: false }))
    setAutoContrast(false)
    errorRef.current = 0
    setErrorCount(0)
    logEvent('auto_contrast_undo')
  }, [logEvent])

  // "Keep it": save the choice to the profile.
  const keepContrast = useCallback(() => {
    setAutoContrast(false)
    if (uidRef.current) updateUser(uidRef.current, { settings: { highContrast: true } }).catch(() => {})
    logEvent('auto_contrast_kept')
  }, [logEvent])

  const toggleContrast = useCallback(() => {
    const next = !settings.highContrast
    setAutoContrast(false)
    setSetting('highContrast', next)
    logEvent('manual_contrast_toggle', { on: next })
  }, [settings.highContrast, setSetting, logEvent])

  /* ---------- apply settings to <html> so CSS reacts globally ---------- */

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('high-contrast', settings.highContrast)
    root.classList.toggle('large-text', settings.largeText)
    root.classList.toggle('reduce-motion', settings.reduceMotion)
  }, [settings.highContrast, settings.largeText, settings.reduceMotion])

  const value = useMemo(
    () => ({
      errorCount,
      highContrast: settings.highContrast,
      autoContrast,
      settings,
      adaptiveOn: settings.adaptiveOn,
      logs,
      sessionId,
      logEvent,
      reportError,
      undoContrast,
      keepContrast,
      toggleContrast,
      setSetting,
      announce,
    }),
    [errorCount, settings, autoContrast, logs, sessionId, logEvent, reportError, undoContrast, keepContrast, toggleContrast, setSetting, announce]
  )

  return (
    <AdaptiveContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        <span key={announcement.id}>{announcement.text}</span>
      </div>
    </AdaptiveContext.Provider>
  )
}
