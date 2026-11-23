import { useId, useState } from 'react'

function EyeIcon({ open }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  )
}

/**
 * Labelled text field with hint + error + adaptive hint.
 * - Real <label for>, so tapping the label focuses the field.
 * - Hint, error and adaptive hint are linked with aria-describedby (read by screen readers).
 * - aria-invalid marks the field when there is an error.
 * - Errors use text + icon + thicker border, never colour alone.
 * - `adaptiveHint` (shown after repeated errors) adds an example box and highlights the field.
 * - type="password" adds a show/hide button. `multiline` renders a <textarea>.
 */
export default function Input({
  label,
  hint,
  error,
  adaptiveHint,
  id,
  type = 'text',
  multiline = false,
  className = '',
  ref,
  children,
  ...rest
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const adaptiveId = `${inputId}-adaptive`
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  const describedBy = [error && errorId, adaptiveHint && adaptiveId, hint && hintId].filter(Boolean).join(' ') || undefined

  const fieldClass = [
    'w-full rounded-xl bg-white px-4 text-base text-ink placeholder:text-muted transition-shadow',
    multiline ? 'min-h-24 py-3' : 'min-h-12',
    error ? 'border-2 border-error' : 'border border-line',
    adaptiveHint ? 'ring-4 ring-rose/30' : '',
    isPassword ? 'pr-14' : '',
  ].join(' ')

  const shared = {
    ref,
    id: inputId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    className: fieldClass,
    ...rest,
  }

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        {multiline ? (
          <textarea {...shared} />
        ) : children ? (
          <select {...shared}>{children}</select>
        ) : (
          <input {...shared} type={isPassword && showPassword ? 'text' : type} />
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label="Show password"
            aria-pressed={showPassword}
            aria-controls={inputId}
            className="absolute right-1 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:text-ink"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-error">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}
      {adaptiveHint && (
        <p id={adaptiveId} className="mt-2 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose-light px-3 py-2 text-sm text-ink">
          <span aria-hidden="true">💡</span>
          <span>{adaptiveHint}</span>
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-helper">
          {hint}
        </p>
      )}
    </div>
  )
}
