import { useEffect, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../../lib/firebase'
import * as v from '../../lib/validators'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { usePageTitle } from '../../lib/usePageTitle'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'

const COOLDOWN = 60

export default function ForgotPassword() {
  usePageTitle('Reset password')
  const { logEvent, announce } = useAdaptive()
  const tracker = useFieldErrorTracker({
    screen: 'forgot',
    validators: { email: v.email },
    hints: { email: 'Example: sara@gmail.com, the email you used to sign up.' },
  })
  const { attachForm } = tracker
  const [sentTo, setSentTo] = useState('')
  const [sending, setSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function send(email) {
    setSending(true)
    setError('')
    try {
      if (isFirebaseConfigured) await sendPasswordResetEmail(auth, email)
    } catch (err) {
      // Privacy: we show the same message whether or not the account exists.
      if (err.code === 'auth/network-request-failed') {
        setError('No internet connection. Check your network and try again.')
        setSending(false)
        return
      }
      if (err.code === 'auth/invalid-email') {
        tracker.setServerError('email', 'This email address doesn’t look right.')
        setSending(false)
        return
      }
    }
    logEvent('password_reset_requested')
    setSentTo(email)
    setCooldown(COOLDOWN)
    setSending(false)
    announce('If an account exists for this email, a reset link is on its way.')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const { ok, values } = tracker.validate()
    if (ok) send(values.email.trim())
  }

  return (
    <section className="page-in">
      <PageHeader title="Reset password" backTo="/login" showContrastToggle={false} />

      {sentTo ? (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="text-4xl" aria-hidden="true">
              📬
            </p>
            <h2 className="mt-2 text-h3 font-semibold">Check your inbox</h2>
            <p className="mt-1 text-sm text-helper">
              If an account exists for <strong className="break-all">{sentTo}</strong>, we sent a link to reset your password. Check
              your spam folder too.
            </p>
          </div>
          <Button variant="secondary" fullWidth disabled={cooldown > 0 || sending} loading={sending} onClick={() => send(sentTo)}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend email'}
          </Button>
          <Button to="/login" fullWidth>
            Back to log in
          </Button>
        </div>
      ) : (
        <form ref={attachForm} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <p className="text-base text-helper">Enter your email and we’ll send you a link to choose a new password.</p>
          {error && (
            <p role="alert" className="rounded-xl border-2 border-error bg-white p-3 text-sm font-medium text-error">
              {error}
            </p>
          )}
          <Input label="Email" type="email" autoComplete="email" inputMode="email" placeholder="name@email.com" {...tracker.fieldProps('email')} />
          <Button type="submit" fullWidth loading={sending} loadingText="Sending…">
            Send reset link
          </Button>
        </form>
      )}
    </section>
  )
}
