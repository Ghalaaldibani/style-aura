// Small validation helpers. Each returns an error message, or '' when the value is valid.
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const required = (label) => (v) => (String(v ?? '').trim() ? '' : `${label} is required.`)

export const email = (v) => {
  const value = String(v ?? '').trim()
  if (!value) return 'Email is required.'
  if (!EMAIL_RE.test(value)) return 'Enter a valid email address.'
  return ''
}

export const password = (v) => {
  const value = String(v ?? '')
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Use both letters and numbers.'
  return ''
}

export const lengthBetween = (label, min, max) => (v) => {
  const value = String(v ?? '').trim()
  if (!value) return `${label} is required.`
  if (value.length < min) return `${label} must be at least ${min} characters.`
  if (value.length > max) return `${label} must be ${max} characters or less.`
  return ''
}

// 0–4 score + label for the password strength meter.
export function passwordStrength(value = '') {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++
  const labels = ['Too weak', 'Weak', 'Okay', 'Good', 'Strong']
  return { score, label: value ? labels[score] : '' }
}
