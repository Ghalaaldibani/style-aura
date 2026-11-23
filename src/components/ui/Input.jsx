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
 * Labelled text field with hint + error support.
 * - The label is a real <label for>, so tapping it focuses the field.
 * - Hint and error are linked with aria-describedby, so screen readers read them.
 * - aria-invalid marks the field when there is an error.
 * - Errors use text + an icon + a thicker border, never colour alone.
 * - type="password" adds a show/hide button.
 */
export default function Input({ label, hint, error, id, type = 'text', className = '', ref, ...rest }) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            'min-h-12 w-full rounded-xl bg-white px-4 text-base text-ink placeholder:text-muted',
            error ? 'border-2 border-error' : 'border border-line',
            isPassword ? 'pr-14' : '',
          ].join(' ')}
          {...rest}
        />
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

      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-helper">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-error">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
