import { useId } from 'react'

// On/off setting. role="switch" + aria-checked; state shown by position, colour AND "On/Off" text.
export default function Switch({ label, description, checked, onChange }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex-1">
        <span id={`${id}-label`} className="block font-medium text-ink">
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className="block text-sm text-helper">
            {description}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex min-h-11 min-w-[4.5rem] items-center rounded-full border-2 px-1 text-xs font-bold transition-colors ${
          checked ? 'border-primary bg-primary text-white' : 'border-line bg-white text-muted'
        }`}
      >
        <span aria-hidden="true" className={`absolute h-7 w-7 rounded-full shadow transition-all ${checked ? 'right-1 bg-white' : 'left-1 bg-line'}`} />
        <span aria-hidden="true" className={checked ? 'pl-2' : 'ml-auto pr-2'}>
          {checked ? 'On' : 'Off'}
        </span>
      </button>
    </div>
  )
}
