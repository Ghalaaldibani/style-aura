import Button from './Button'

// Empty state: friendly message + next step (never a blank screen).
export function EmptyState({ art, title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-8 text-center">
      {art && <div className="mb-3 h-24 w-24">{art}</div>}
      <h2 className="text-h3 font-semibold text-ink">{title}</h2>
      {text && <p className="mt-1 text-sm text-helper">{text}</p>}
      {action && <div className="mt-4 flex w-full flex-col gap-2">{action}</div>}
    </div>
  )
}

// Error state with a retry button.
export function ErrorState({ message = 'Something went wrong while loading.', onRetry }) {
  return (
    <div role="alert" className="rounded-2xl border-2 border-error bg-white p-4 text-sm text-ink">
      <p className="flex items-start gap-2 font-medium text-error">
        <span aria-hidden="true">⚠</span>
        {message}
      </p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

// Skeleton grid while data loads.
export function LoadingGrid({ count = 4, label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-line/60 motion-safe:animate-pulse" />
      ))}
    </div>
  )
}
