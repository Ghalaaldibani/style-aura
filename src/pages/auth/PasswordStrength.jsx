import { passwordStrength } from '../../lib/validators'

const COLORS = ['bg-error', 'bg-error', 'bg-warning', 'bg-success', 'bg-success']

// 4 bars + a text label (never colour alone). The label is announced politely.
export default function PasswordStrength({ value }) {
  const { score, label } = passwordStrength(value)
  if (!value) return null
  return (
    <div className="mt-2">
      <div aria-hidden="true" className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? COLORS[score] : 'bg-line'}`} />
        ))}
      </div>
      <p className="mt-1 text-xs text-helper" aria-live="polite">
        Password strength: <strong>{label}</strong>
      </p>
    </div>
  )
}
