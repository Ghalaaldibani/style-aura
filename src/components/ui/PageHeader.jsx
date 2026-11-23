import { useNavigate } from 'react-router-dom'
import { useAdaptive } from '../../adaptive/AdaptiveContext'

export const iconButtonClass =
  'flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-primary-light'

/**
 * Screen header like the Figma frames: "‹ Back" pill, the screen's single <h1>,
 * a quick high-contrast toggle and optional extra actions on the right.
 */
export default function PageHeader({ title, back = true, backTo = '/home', action, showContrastToggle = true }) {
  const navigate = useNavigate()
  const { highContrast, toggleContrast } = useAdaptive()

  function goBack() {
    // React Router stores the history index; if this is the first page, go to `backTo`.
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(backTo)
  }

  return (
    <header className="mb-6 flex items-center gap-3">
      {back && (
        <button
          type="button"
          onClick={goBack}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-line bg-white px-4 text-sm font-semibold text-primary hover:border-primary"
        >
          <span aria-hidden="true">‹</span> Back
        </button>
      )}

      <h1 className="min-w-0 flex-1 text-h2 font-bold text-ink">{title}</h1>

      {showContrastToggle && (
        <button
          type="button"
          onClick={toggleContrast}
          aria-label="High contrast"
          aria-pressed={highContrast}
          title="High contrast"
          className={`${iconButtonClass} ${highContrast ? 'ring-2 ring-primary' : ''}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
          </svg>
        </button>
      )}

      {action}
    </header>
  )
}
