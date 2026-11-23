import { useCallback, useEffect, useRef, useState } from 'react'
import { useAdaptive } from './AdaptiveContext'

/**
 * Adaptation 3: contextual simplification (cognitive-load reduction, Hick's Law).
 * Watches a screen with DOM listeners (pointerdown, keydown, input, wheel, touchmove).
 * If the user does nothing for `idleMs` (hesitation) OR makes `errorThreshold` errors,
 * `simplified` becomes true: the screen hides optional options and emphasises the main action.
 * The user can always undo it with `restore()` ("Show more options").
 */
export function useSimplifiedUI({ screen, idleMs = 20000, errorThreshold = 2 }) {
  const { logEvent, adaptiveOn } = useAdaptive()
  // Callback ref backed by state: listeners attach as soon as the element exists.
  const [el, setEl] = useState(null)
  const [state, setState] = useState({ simplified: false, reason: null, restored: false })
  const lastActivity = useRef(0)
  const errors = useRef(0)
  const done = useRef(false)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  })

  const simplify = useCallback(
    (reason, details = {}) => {
      const s = stateRef.current
      if (!adaptiveOn || done.current || s.simplified || s.restored) return
      setState({ simplified: true, reason, restored: false })
      logEvent('ui_simplified', { screen, reason, ...details })
    },
    [adaptiveOn, logEvent, screen]
  )

  useEffect(() => {
    if (!el) return
    const bump = () => {
      lastActivity.current = performance.now()
    }
    lastActivity.current = performance.now()
    const events = ['pointerdown', 'keydown', 'input', 'wheel', 'touchmove']
    events.forEach((e) => el.addEventListener(e, bump, { passive: true }))

    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') {
        lastActivity.current = performance.now() // hidden time is not hesitation
        return
      }
      const idle = performance.now() - lastActivity.current
      if (idle >= idleMs) simplify('hesitation', { durationMs: idle })
    }, 1000)

    return () => {
      events.forEach((e) => el.removeEventListener(e, bump))
      clearInterval(timer)
    }
  }, [el, idleMs, simplify])

  // Call when the user makes an error on this screen.
  const registerError = useCallback(() => {
    errors.current += 1
    if (errors.current >= errorThreshold) simplify('errors', { count: errors.current })
  }, [errorThreshold, simplify])

  // "Show more options"
  const restore = useCallback(() => {
    setState({ simplified: false, reason: null, restored: true })
    logEvent('ui_restored', { screen })
  }, [logEvent, screen])

  // Stop sensing once the main task is done (e.g. outfit saved).
  const markDone = useCallback(() => {
    done.current = true
  }, [])

  return { attach: setEl, simplified: state.simplified, reason: state.reason, restore, registerError, markDone }
}
