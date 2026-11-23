import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-white text-primary border-[1.5px] border-primary hover:bg-primary-light',
  ghost: 'text-primary hover:bg-primary-light',
  danger: 'bg-error text-white hover:opacity-90',
}

// Every size is at least 44px tall (touch target, WCAG 2.5.5).
const SIZES = {
  sm: 'min-h-11 px-4 rounded-xl text-sm',
  md: 'min-h-[3.125rem] px-5 rounded-xl text-base',
  lg: 'min-h-14 px-6 rounded-2xl text-h3',
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
    />
  )
}

/**
 * One button for the whole app.
 * - `to` turns it into a router link (same look).
 * - `loading` disables it, shows a spinner and sets aria-busy.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  loadingText,
  to,
  type = 'button',
  disabled,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 font-semibold transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner />}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
