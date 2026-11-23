import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../../lib/firebase'
import { friendlyAuthError } from '../../lib/authErrors'
import * as v from '../../lib/validators'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { usePageTitle } from '../../lib/usePageTitle'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const VALIDATORS = {
  email: v.email,
  password: (value) => (value ? '' : 'Password is required.'),
}

const HINTS = {
  email: 'Example: sara@gmail.com. Use the same email you signed up with.',
  password: 'Passwords are case-sensitive. Check Caps Lock, or use “Forgot password?” below to reset it.',
}

export default function LogIn() {
  usePageTitle('Log In')
  const { logEvent } = useAdaptive()
  const tracker = useFieldErrorTracker({ screen: 'login', validators: VALIDATORS, hints: HINTS })
  const { attachForm } = tracker
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [failedLogins, setFailedLogins] = useState(0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setFormError('')
    const { ok, values } = tracker.validate()
    if (!ok) return
    if (!isFirebaseConfigured) {
      setFormError('The app is not connected to Firebase yet.')
      return
    }

    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, values.email.trim(), values.password)
      logEvent('log_in')
      // PublicOnlyRoute sends the user to the page they wanted, or Home.
    } catch (err) {
      const { field, message } = friendlyAuthError(err)
      setFailedLogins((n) => n + 1)
      if (field) tracker.setServerError(field, message)
      else {
        tracker.setServerError(null)
        setFormError(message)
      }
      setSubmitting(false)
    }
  }

  // Adaptive: after 2 failed log-ins, the reset-password route is highlighted.
  const emphasiseReset = failedLogins >= 2

  return (
    <section className="page-in">
      <h1 className="text-h2 font-bold text-ink">Welcome back</h1>
      <img src="/avatar.svg" alt="" className="mt-4 h-20 w-20" />

      <form ref={attachForm} onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-4">
        {formError && (
          <p role="alert" className="rounded-xl border-2 border-error bg-white p-3 text-sm font-medium text-error">
            {formError}
          </p>
        )}

        <Input label="Email" type="email" autoComplete="email" inputMode="email" placeholder="name@email.com" {...tracker.fieldProps('email')} />
        <Input label="Password" type="password" autoComplete="current-password" placeholder="Your password" {...tracker.fieldProps('password')} />

        {emphasiseReset ? (
          <div className="rounded-xl border-2 border-rose bg-rose-light p-3">
            <p className="text-sm text-ink">Having trouble logging in?</p>
            <Link to="/forgot-password" className="mt-1 inline-flex min-h-11 items-center font-semibold text-primary underline">
              Reset your password
            </Link>
          </div>
        ) : (
          <Link to="/forgot-password" className="inline-flex min-h-11 items-center self-start text-sm text-primary underline-offset-2 hover:underline">
            Forgot password?
          </Link>
        )}

        <Button type="submit" fullWidth loading={submitting} loadingText="Logging in…">
          Log In
        </Button>
        <Button to="/signup" variant="secondary" fullWidth>
          Create a new account
        </Button>
      </form>
    </section>
  )
}
