import { Link } from 'react-router-dom'
import { useAdaptive } from '../adaptive/AdaptiveContext'

// Shown when the app turned on high contrast by itself (after repeated errors).
// The live region is always in the DOM so screen readers announce the message
// as soon as it appears (WCAG 4.1.3 Status Messages).
export default function ContrastBanner() {
  const { autoContrast, undoContrast, keepContrast } = useAdaptive()

  return (
    <div role="status" aria-live="polite" className="px-4 pt-3 md:pt-8">
      {autoContrast && (
        <div className="rounded-2xl border-2 border-primary bg-primary-light p-3 text-sm text-ink">
          <p className="font-medium">We increased contrast to make things easier to read.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={undoContrast}
              className="min-h-11 rounded-xl bg-primary px-4 font-semibold text-white"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={keepContrast}
              className="min-h-11 rounded-xl border border-primary px-4 font-semibold text-primary"
            >
              Keep it
            </button>
            <Link to="/profile" className="ml-auto inline-flex min-h-11 items-center px-2 font-semibold text-primary underline">
              Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
