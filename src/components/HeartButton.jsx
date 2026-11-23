// Toggle button for favourites. State is shown by a filled heart AND the label (aria-pressed).
export default function HeartButton({ on, onClick, label, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={label}
      className={`flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/90 text-rose shadow-sm hover:bg-rose-light ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M12 20s-7-4.4-9.3-8.6C1 8 3 4.5 6.4 4.5c2 0 3.6 1.2 4.6 2.6 1-1.4 2.6-2.6 4.6-2.6C19 4.5 21 8 19.3 11.4 17 15.6 12 20 12 20Z" />
      </svg>
    </button>
  )
}
