// Loading state shown while Firebase checks whether the user is logged in.
export default function FullScreenLoader({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex min-h-full flex-col items-center justify-center gap-4 py-24">
      <span
        aria-hidden="true"
        className="h-10 w-10 rounded-full border-4 border-primary-light border-t-primary motion-safe:animate-spin"
      />
      <p className="text-helper">{label}</p>
    </div>
  )
}
