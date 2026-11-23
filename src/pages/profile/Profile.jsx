import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmailAuthProvider, deleteUser, reauthenticateWithCredential, signOut, updatePassword, updateProfile } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { STYLES } from '../../data/styles'
import { deleteAllUserData, savePublicProfile, updateUser } from '../../lib/db'
import { friendlyAuthError } from '../../lib/authErrors'
import { usePageTitle } from '../../lib/usePageTitle'
import * as v from '../../lib/validators'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import Switch from '../../components/ui/Switch'
import AvatarFigure from '../../components/art/AvatarFigure'

function Section({ title, children }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-4">
      <h2 className="mb-2 text-h3 font-semibold text-ink">{title}</h2>
      {children}
    </section>
  )
}

const linkRow = 'flex min-h-12 items-center justify-between border-b border-line py-2 font-medium text-ink last:border-0 hover:text-primary'

export default function Profile() {
  usePageTitle('Profile & Settings')
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { settings, setSetting, logEvent } = useAdaptive()
  const toast = useToast()
  const [dialog, setDialog] = useState(null) // 'logout' | 'delete'
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [busy, setBusy] = useState(false)

  const nameForm = useFieldErrorTracker({
    screen: 'profile-name',
    validators: { name: v.lengthBetween('Name', 2, 40) },
    hints: { name: 'Example: Sara Ahmed. Use at least 2 letters.' },
  })
  const { attachForm: attachNameForm } = nameForm

  const pwForm = useFieldErrorTracker({
    screen: 'change-password',
    validators: { currentPassword: (x) => (x ? '' : 'Enter your current password.'), newPassword: v.password },
    hints: { newPassword: 'Example: Closet2025. Use 8+ characters with letters AND numbers.' },
  })
  const { attachForm: attachPwForm } = pwForm
  const [pwBusy, setPwBusy] = useState(false)

  const name = profile?.name ?? user.displayName ?? ''

  function saveName(e) {
    e.preventDefault()
    const { ok, values } = nameForm.validate()
    if (!ok) return
    const newName = values.name.trim()
    updateUser(user.uid, { name: newName }).catch(() => {})
    savePublicProfile(user.uid, { name: newName })
    updateProfile(user, { displayName: newName }).catch(() => {})
    toast.show({ message: 'Name updated' })
  }

  async function changePassword(e) {
    e.preventDefault()
    const { ok, values } = pwForm.validate()
    if (!ok) return
    setPwBusy(true)
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, values.currentPassword))
      await updatePassword(user, values.newPassword)
      e.target.reset()
      toast.show({ message: 'Password changed' })
      logEvent('password_changed')
    } catch (err) {
      const { message } = friendlyAuthError(err)
      pwForm.setServerError(err.code === 'auth/weak-password' ? 'newPassword' : 'currentPassword', message)
    }
    setPwBusy(false)
  }

  async function logOut() {
    logEvent('log_out')
    await signOut(auth)
    navigate('/', { replace: true })
  }

  async function deleteAccount() {
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm.')
      return
    }
    setBusy(true)
    setDeleteError('')
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, deletePassword))
      await deleteAllUserData(user.uid)
      await deleteUser(user)
      navigate('/', { replace: true })
    } catch (err) {
      setDeleteError(friendlyAuthError(err).message)
      setBusy(false)
    }
  }

  return (
    <div className="page-in">
      <PageHeader title="Profile" />

      <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
        <div className="h-24 w-14 shrink-0 rounded-xl bg-primary-light">
          <AvatarFigure skinTone={profile?.avatar?.skinTone} bodyShape={profile?.avatar?.bodyShape} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-h3 font-semibold text-ink">{name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-1 inline-block rounded-full bg-primary-light px-3 py-0.5 text-sm font-medium text-primary-dark">
            {profile?.style ? STYLES[profile.style].name : 'No style yet'}
          </p>
        </div>
      </div>

      <nav aria-label="Profile shortcuts" className="mt-4 rounded-2xl border border-line bg-white px-4">
        <Link to="/avatar" className={linkRow}>
          Edit my avatar <span aria-hidden="true">›</span>
        </Link>
        <Link to="/quiz" className={linkRow}>
          {profile?.style ? 'Retake the style quiz' : 'Take the style quiz'} <span aria-hidden="true">›</span>
        </Link>
        <Link to="/friends" className={linkRow}>
          Friends <span aria-hidden="true">›</span>
        </Link>
        <Link to="/events" className={linkRow}>
          Event Planner <span aria-hidden="true">›</span>
        </Link>
        <Link to="/profile/log" className={linkRow}>
          My interaction log <span aria-hidden="true">›</span>
        </Link>
      </nav>

      <Section title="Accessibility">
        <Switch
          label="High contrast"
          description="Darker text and stronger borders."
          checked={settings.highContrast}
          onChange={(on) => setSetting('highContrast', on)}
        />
        <Switch label="Larger text" description="Makes all text about 12% bigger." checked={settings.largeText} onChange={(on) => setSetting('largeText', on)} />
        <Switch
          label="Reduce motion"
          description="Turns off animations and transitions."
          checked={settings.reduceMotion}
          onChange={(on) => setSetting('reduceMotion', on)}
        />
        <Switch
          label="Adaptive help"
          description="Lets the app add hints, simplify screens and raise contrast when you seem stuck."
          checked={settings.adaptiveOn}
          onChange={(on) => setSetting('adaptiveOn', on)}
        />
      </Section>

      <Section title="Your name">
        <form ref={attachNameForm} onSubmit={saveName} noValidate className="flex flex-col gap-3">
          <Input label="Name" defaultValue={name} autoComplete="name" {...nameForm.fieldProps('name')} />
          <Button type="submit" variant="secondary">
            Save name
          </Button>
        </form>
      </Section>

      <Section title="Change password">
        <form ref={attachPwForm} onSubmit={changePassword} noValidate className="flex flex-col gap-3">
          <Input label="Current password" type="password" autoComplete="current-password" {...pwForm.fieldProps('currentPassword')} />
          <Input label="New password" type="password" autoComplete="new-password" {...pwForm.fieldProps('newPassword')} />
          <Button type="submit" variant="secondary" loading={pwBusy} loadingText="Saving…">
            Change password
          </Button>
        </form>
      </Section>

      <div className="mt-6 flex flex-col gap-3">
        <Button variant="secondary" fullWidth onClick={() => setDialog('logout')}>
          Log out
        </Button>
        <Button variant="ghost" fullWidth className="!text-error" onClick={() => setDialog('delete')}>
          Delete account
        </Button>
      </div>

      <Dialog
        open={dialog === 'logout'}
        onClose={() => setDialog(null)}
        title="Log out?"
        description="Your wardrobe and outfits stay saved in your account."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button fullWidth onClick={logOut}>
              Log out
            </Button>
          </>
        }
      />

      <Dialog
        open={dialog === 'delete'}
        onClose={() => {
          setDialog(null)
          setDeletePassword('')
          setDeleteError('')
        }}
        title="Delete your account?"
        description="This permanently deletes your wardrobe, outfits, favorites, events and logs. This can’t be undone."
      >
        <div className="mt-4 flex flex-col gap-3">
          <Input label="Password" type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} error={deleteError} />
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth loading={busy} loadingText="Deleting…" onClick={deleteAccount}>
              Delete forever
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
