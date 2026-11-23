import { useId } from 'react'

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  )
}

/**
 * Pill choices built on REAL radio buttons / checkboxes (so keyboard arrows, screen readers
 * and FormData all work). The selected pill is filled AND shows a check mark — not colour alone.
 * Works controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 */
export default function ChipGroup({
  legend,
  name,
  options,
  type = 'radio',
  value,
  defaultValue,
  onChange,
  error,
  adaptiveHint,
  hint,
  size = 'md',
  className = '',
}) {
  const baseId = useId()
  const errorId = `${baseId}-error`
  const adaptiveId = `${baseId}-adaptive`
  const hintId = `${baseId}-hint`
  const controlled = value !== undefined
  const isChecked = (v) => (type === 'checkbox' ? (value ?? []).includes(v) : value === v)
  const isDefault = (v) => (type === 'checkbox' ? (defaultValue ?? []).includes(v) : defaultValue === v)

  const handle = (v, checked) => {
    if (!onChange) return
    if (type === 'checkbox') {
      const set = new Set(value ?? [])
      if (checked) set.add(v)
      else set.delete(v)
      onChange([...set])
    } else onChange(v)
  }

  const describedBy = [error && errorId, adaptiveHint && adaptiveId, hint && hintId].filter(Boolean).join(' ') || undefined

  return (
    <fieldset className={className} aria-describedby={describedBy} aria-invalid={error ? true : undefined}>
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}</legend>
      <div className={`flex flex-wrap gap-2 rounded-2xl ${adaptiveHint ? 'p-1 ring-4 ring-rose/30' : ''}`}>
        {options.map((opt) => {
          const v = String(opt.value)
          const inputId = `${baseId}-${v}`
          return (
            <div key={v}>
              <input
                id={inputId}
                type={type}
                name={name}
                value={v}
                className="peer sr-only"
                {...(controlled
                  ? { checked: isChecked(opt.value), onChange: (e) => handle(opt.value, e.target.checked) }
                  : { defaultChecked: isDefault(opt.value), onChange: (e) => handle(opt.value, e.target.checked) })}
              />
              <label
                htmlFor={inputId}
                className={[
                  'flex cursor-pointer items-center gap-1.5 rounded-full border font-medium transition-colors',
                  size === 'sm' ? 'min-h-11 px-3 text-sm' : 'min-h-11 px-4 text-base',
                  'border-line bg-white text-ink hover:border-primary',
                  'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white',
                  'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                  '[&>.check]:hidden peer-checked:[&>.check]:inline',
                  error ? 'border-error' : '',
                ].join(' ')}
              >
                <span className="check">
                  <Check />
                </span>
                {opt.swatch && (
                  <span aria-hidden="true" className="h-4 w-4 rounded-full border border-ink/30" style={{ background: opt.swatch }} />
                )}
                {opt.label}
              </label>
            </div>
          )
        })}
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
    </fieldset>
  )
}
