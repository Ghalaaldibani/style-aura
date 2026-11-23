import { useCallback, useEffect, useRef, useState } from 'react'
import { useAdaptive } from './AdaptiveContext'

/**
 * Sensor 1 + adaptation 2: cognitive-load & error sensing → dynamic error adaptation.
 *
 * Uses real DOM event listeners on the <form>:
 *  - focusin  → remembers when the user entered a field
 *  - input    → time from focus to first keystroke (long pause = hesitation), and live re-validation
 *               of a field that has an error, so the error + hint disappear as soon as it is fixed
 *  - focusout → re-checks a field that already had an error
 *  - invalid  → native browser validation failures are counted too
 *  - submit   → time to complete the form (task time)
 *
 * Counts errors PER FIELD. After `threshold` (2) errors on the same field the screen shows an
 * extra hint with an example and highlights the field. Every event is logged.
 */
export function useFieldErrorTracker({ screen, validators, hints = {}, threshold = 2, hesitationMs = 8000 }) {
  // Callback ref backed by state: the listeners attach as soon as the <form> exists.
  const [formEl, setFormEl] = useState(null)
  const [errors, setErrors] = useState({})
  const [counts, setCounts] = useState({})
  const { reportError, logEvent, adaptiveOn, announce } = useAdaptive()

  const errorsRef = useRef(errors)
  const countsRef = useRef({})
  const hintShown = useRef(new Set())
  const focusInfo = useRef({})
  const startedAt = useRef(null)
  const validatorsRef = useRef(validators)

  useEffect(() => {
    errorsRef.current = errors
    validatorsRef.current = validators
  })

  const readValues = useCallback(() => {
    const values = {}
    if (!formEl) return values
    for (const [key, value] of new FormData(formEl).entries()) values[key] = value
    return values
  }, [formEl])

  // Record a set of field errors from one attempt.
  const registerErrors = useCallback(
    (fieldErrors) => {
      const failing = Object.keys(fieldErrors).filter((k) => fieldErrors[k])
      setErrors(fieldErrors)
      if (!failing.length) return

      for (const field of failing) countsRef.current[field] = (countsRef.current[field] ?? 0) + 1
      setCounts({ ...countsRef.current })
      reportError(screen, { fields: failing })

      for (const field of failing) {
        if (adaptiveOn && hints[field] && countsRef.current[field] >= threshold && !hintShown.current.has(field)) {
          hintShown.current.add(field)
          logEvent('hint_shown', { field, count: countsRef.current[field] })
        }
      }

      // Move focus to the first invalid field (its label, error and hint are read out).
      const first = formEl?.querySelector(`[name="${failing[0]}"]`)
      first?.focus()
      announce(failing.length === 1 ? 'Please fix 1 field.' : `Please fix ${failing.length} fields.`)
    },
    [screen, hints, threshold, adaptiveOn, reportError, logEvent, announce, formEl]
  )

  // Validate everything (call from onSubmit). Returns { ok, values }.
  const validate = useCallback(() => {
    const values = readValues()
    const fieldErrors = {}
    for (const [name, fn] of Object.entries(validatorsRef.current)) {
      const message = fn(values[name], values)
      if (message) fieldErrors[name] = message
    }
    registerErrors(fieldErrors)
    return { ok: Object.keys(fieldErrors).length === 0, values }
  }, [readValues, registerErrors])

  // Errors that come from the server (e.g. "wrong password").
  const setServerError = useCallback(
    (field, message) => {
      if (field) registerErrors({ [field]: message })
      else reportError(screen, { server: true })
    },
    [registerErrors, reportError, screen]
  )

  // DOM listeners
  useEffect(() => {
    const form = formEl
    if (!form) return

    const revalidate = (name) => {
      const fn = validatorsRef.current[name]
      if (!fn || !errorsRef.current[name]) return
      const message = fn(readValues()[name], readValues())
      if (message !== errorsRef.current[name]) {
        setErrors((prev) => {
          const next = { ...prev }
          if (message) next[name] = message
          else delete next[name]
          return next
        })
        if (!message) logEvent('error_fixed', { field: name })
      }
    }

    const onFocusIn = (e) => {
      const name = e.target.name
      if (!name) return
      if (!startedAt.current) startedAt.current = performance.now()
      focusInfo.current[name] = { at: performance.now(), typed: false }
    }
    const onInput = (e) => {
      const name = e.target.name
      if (!name) return
      const info = focusInfo.current[name]
      if (info && !info.typed) {
        info.typed = true
        const latency = performance.now() - info.at
        if (latency > hesitationMs) logEvent('hesitation', { field: name, durationMs: latency, kind: 'first_keystroke' })
      }
      revalidate(name)
    }
    const onFocusOut = (e) => {
      if (e.target.name) revalidate(e.target.name)
    }
    const onInvalid = (e) => {
      e.preventDefault()
      logEvent('native_invalid', { field: e.target.name })
    }
    const onSubmit = () => {
      if (startedAt.current) logEvent('task_time', { durationMs: performance.now() - startedAt.current, form: screen })
    }

    form.addEventListener('focusin', onFocusIn)
    form.addEventListener('input', onInput)
    form.addEventListener('focusout', onFocusOut)
    form.addEventListener('invalid', onInvalid, true)
    form.addEventListener('submit', onSubmit)
    return () => {
      form.removeEventListener('focusin', onFocusIn)
      form.removeEventListener('input', onInput)
      form.removeEventListener('focusout', onFocusOut)
      form.removeEventListener('invalid', onInvalid, true)
      form.removeEventListener('submit', onSubmit)
    }
  }, [formEl, readValues, logEvent, hesitationMs, screen])

  const showHint = (field) => adaptiveOn && Boolean(errors[field]) && (counts[field] ?? 0) >= threshold && Boolean(hints[field])

  // Props for <Input>: name, error, adaptive hint.
  const fieldProps = (name) => ({
    name,
    id: `${screen}-${name}`,
    error: errors[name],
    adaptiveHint: showHint(name) ? hints[name] : undefined,
  })

  return { attachForm: setFormEl, errors, counts, validate, setServerError, fieldProps, showHint, clearErrors: () => setErrors({}) }
}
