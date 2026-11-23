import { useNavigate } from 'react-router-dom'
import { useAdaptive } from '../../adaptive/AdaptiveContext'

const iconButton =
  'flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink hover:bg-primary-light'

/**
 * Screen header: optional back button, the screen's single <h1>, a quick
 * high-contrast toggle, and an optional extra action on the right.
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
    <header className="mb-6 flex items-center gap-2">
      {back && (
        <button type="button" onClick={goBack} aria-label="Go back" className={`-ml-3 ${iconButton}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      <h1 className="flex-1 text-[22px] font-semibold text-ink">{title}</h1>

      {showContrastToggle && (
        <button
          type="button"
          onClick={toggleContrast}
          aria-label="High contrast"
          aria-pressed={highContrast}
          className={`${iconButton} ${highContrast ? 'ring-2 ring-primary' : ''}`}
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
