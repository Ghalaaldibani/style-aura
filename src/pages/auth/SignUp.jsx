import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../../lib/firebase'
import { createUserProfile } from '../../lib/db'
import { friendlyAuthError } from '../../lib/authErrors'
import * as v from '../../lib/validators'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { usePageTitle } from '../../lib/usePageTitle'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PasswordStrength from './PasswordStrength'

const VALIDATORS = {
  name: v.lengthBetween('Name', 2, 40),
  email: v.email,
  password: v.password,
  confirm: (value, all) => (!value ? 'Please confirm your password.' : value !== all.password ? 'Passwords don’t match.' : ''),
  terms: (value) => (value ? '' : 'Please accept the Terms & Privacy Policy.'),
}

// Extra help shown only after the SAME field fails twice (dynamic error adaptation).
const HINTS = {
  name: 'Example: Sara Ahmed. Use at least 2 letters.',
  email: 'Example: sara@gmail.com. It needs an “@” and a domain such as “.com”.',
  password: 'Example: Closet2025. Use 8+ characters with letters AND numbers.',
  confirm: 'Type exactly the same password again. Tap the eye icon on both fields to compare them.',
  terms: 'Tick the box below the password to agree, then press Sign Up.',
}

export default function SignUp() {
  usePageTitle('Sign Up')
  const navigate = useNavigate()
  const { logEvent } = useAdaptive()
  const tracker = useFieldErrorTracker({ screen: 'signup', validators: VALIDATORS, hints: HINTS })
  const { attachForm } = tracker
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

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
      const name = values.name.trim()
      const cred = await createUserWithEmailAndPassword(auth, values.email.trim(), values.password)
      await updateProfile(cred.user, { displayName: name })
      await createUserProfile(cred.user, name)
      logEvent('sign_up')
      sendEmailVerification(cred.user).catch(() => {})
      navigate('/quiz', { replace: true })
    } catch (err) {
      const { field, message } = friendlyAuthError(err)
      if (field) tracker.setServerError(field, message)
      else {
        tracker.setServerError(null)
        setFormError(message)
      }
      setSubmitting(false)
    }
  }

  const termsProps = tracker.fieldProps('terms')

  return (
    <section className="page-in">
      <img src="/logo-320.webp" alt="" className="h-24 w-24 rounded-full object-cover" />
      <h1 className="mt-4 text-[2.125rem] font-bold leading-tight text-primary">Style Aura</h1>
      <p className="mt-2 text-base text-helper">Your digital closet with a built-in stylist.</p>

      <form ref={attachForm} onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        {formError && (
          <p role="alert" className="rounded-xl border-2 border-error bg-white p-3 text-sm font-medium text-error">
            {formError}
          </p>
        )}

        <Input label="Name" autoComplete="name" placeholder="Your name" {...tracker.fieldProps('name')} />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" placeholder="name@email.com" {...tracker.fieldProps('email')} />
        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            onChange={(e) => setPassword(e.target.value)}
            {...tracker.fieldProps('password')}
          />
          <PasswordStrength value={password} />
        </div>
        <Input label="Confirm password" type="password" autoComplete="new-password" placeholder="Type it again" {...tracker.fieldProps('confirm')} />

        <div>
          <div className={`flex items-start gap-3 rounded-xl ${termsProps.adaptiveHint ? 'ring-4 ring-rose/30' : ''}`}>
            <input
              id={termsProps.id}
              name="terms"
              type="checkbox"
              aria-invalid={termsProps.error ? true : undefined}
              aria-describedby={termsProps.error ? `${termsProps.id}-error` : undefined}
              className="mt-0.5 h-6 w-6 shrink-0 accent-primary"
            />
            <label htmlFor={termsProps.id} className="text-sm text-helper">
              I agree to the Terms &amp; Privacy Policy
            </label>
          </div>
          {termsProps.error && (
            <p id={`${termsProps.id}-error`} className="mt-1.5 flex gap-1.5 text-sm font-medium text-error">
              <span aria-hidden="true">⚠</span>
              {termsProps.error}
            </p>
          )}
          {termsProps.adaptiveHint && (
            <p className="mt-2 flex gap-2 rounded-xl border border-rose/40 bg-rose-light px-3 py-2 text-sm">
              <span aria-hidden="true">💡</span>
              {termsProps.adaptiveHint}
            </p>
          )}
        </div>

        <Button type="submit" fullWidth loading={submitting} loadingText="Creating your account…">
          Sign Up
        </Button>
        <Button to="/login" variant="secondary" fullWidth>
          Log In
        </Button>
        <p className="text-center text-sm text-helper">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary underline">
            Log in
          </Link>
        </p>
      </form>
    </section>
  )
}
