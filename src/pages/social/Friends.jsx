import { useState } from 'react'
import { collection, query, where } from 'firebase/firestore'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { useFieldErrorTracker } from '../../adaptive/useFieldErrorTracker'
import { db } from '../../lib/firebase'
import { acceptFriendRequest, findProfileByEmail, friendshipId, removeFriendship, sendFriendRequest } from '../../lib/db'
import { useLiveQuery } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import * as v from '../../lib/validators'
import { STYLES } from '../../data/styles'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'

function Person({ name, sub, children }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
      <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light font-bold text-primary">
        {name?.charAt(0)?.toUpperCase() ?? '?'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink">{name}</span>
        {sub && <span className="block text-xs text-muted">{sub}</span>}
      </span>
      <span className="flex gap-2">{children}</span>
    </li>
  )
}

export default function Friends() {
  usePageTitle('Friends')
  const { user, profile } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const tracker = useFieldErrorTracker({
    screen: 'friends',
    validators: { email: v.email },
    hints: { email: 'Example: noura@gmail.com, the exact email your friend signed up with.' },
  })
  const { attachForm } = tracker
  const [result, setResult] = useState(null) // null | 'none' | profile
  const [searching, setSearching] = useState(false)
  const [removing, setRemoving] = useState(null)

  const friendships = useLiveQuery(`friends-${user.uid}`, () =>
    query(collection(db, 'friendships'), where('users', 'array-contains', user.uid))
  )
  const myName = profile?.name ?? user.displayName ?? 'User'
  const otherOf = (f) => f.users.find((u) => u !== user.uid)
  const nameOf = (f) => f.names?.[otherOf(f)] ?? 'Friend'

  const incoming = friendships.data.filter((f) => f.status === 'pending' && f.requestedBy !== user.uid)
  const outgoing = friendships.data.filter((f) => f.status === 'pending' && f.requestedBy === user.uid)
  const friends = friendships.data.filter((f) => f.status === 'accepted')

  async function search(e) {
    e.preventDefault()
    const { ok, values } = tracker.validate()
    if (!ok) return
    setSearching(true)
    try {
      const found = await findProfileByEmail(values.email)
      setResult(found ?? 'none')
      logEvent('friend_search', { found: Boolean(found) })
    } catch {
      toast.show({ message: 'Search failed. Check your connection.' })
    }
    setSearching(false)
  }

  async function add(other) {
    try {
      await sendFriendRequest({ uid: user.uid, name: myName }, { uid: other.id, name: other.name })
      toast.show({ message: `Request sent to ${other.name}` })
      logEvent('friend_request_sent')
      setResult(null)
    } catch {
      toast.show({ message: 'Couldn’t send the request. Try again.' })
    }
  }

  const existing = result && result !== 'none' ? friendships.data.find((f) => f.id === friendshipId(user.uid, result.id)) : null

  return (
    <section className="page-in">
      <PageHeader title="Friends" backTo="/feed" />

      <form ref={attachForm} onSubmit={search} noValidate className="flex flex-col gap-3">
        <Input label="Find a friend by email" type="email" inputMode="email" autoComplete="off" placeholder="friend@email.com" {...tracker.fieldProps('email')} />
        <Button type="submit" fullWidth loading={searching} loadingText="Searching…">
          Search
        </Button>
      </form>

      <div aria-live="polite" className="mt-3">
        {result === 'none' && <p className="rounded-xl bg-white p-3 text-sm text-helper">No Style Aura account uses this email.</p>}
        {result && result !== 'none' && (
          <ul>
            <Person name={result.name} sub={result.style ? STYLES[result.style]?.name : 'Style not chosen yet'}>
              {result.id === user.uid ? (
                <span className="text-sm text-muted">That’s you</span>
              ) : existing ? (
                <span className="text-sm text-muted">{existing.status === 'accepted' ? 'Friends ✓' : 'Pending'}</span>
              ) : (
                <Button size="sm" onClick={() => add(result)}>
                  Add friend
                </Button>
              )}
            </Person>
          </ul>
        )}
      </div>

      {incoming.length > 0 && (
        <>
          <h2 className="mt-6 text-h3 font-semibold text-ink">Requests ({incoming.length})</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {incoming.map((f) => (
              <Person key={f.id} name={nameOf(f)} sub="wants to be friends">
                <Button size="sm" onClick={() => acceptFriendRequest(f.id).then(() => logEvent('friend_accepted')).catch(() => {})}>
                  Accept
                </Button>
                <Button size="sm" variant="secondary" onClick={() => removeFriendship(f.id).catch(() => {})}>
                  Decline
                </Button>
              </Person>
            ))}
          </ul>
        </>
      )}

      <h2 className="mt-6 text-h3 font-semibold text-ink">My friends ({friends.length})</h2>
      {friends.length === 0 ? (
        <p className="mt-2 text-sm text-helper">No friends yet. Search by email to add someone.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {friends.map((f) => (
            <Person key={f.id} name={nameOf(f)}>
              <Button size="sm" variant="ghost" onClick={() => setRemoving(f)} aria-label={`Remove ${nameOf(f)}`}>
                Remove
              </Button>
            </Person>
          ))}
        </ul>
      )}

      {outgoing.length > 0 && (
        <>
          <h2 className="mt-6 text-h3 font-semibold text-ink">Sent requests</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {outgoing.map((f) => (
              <Person key={f.id} name={nameOf(f)} sub="pending">
                <Button size="sm" variant="ghost" onClick={() => removeFriendship(f.id).catch(() => {})}>
                  Cancel
                </Button>
              </Person>
            ))}
          </ul>
        </>
      )}

      <Dialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing ? nameOf(removing) : ''}?`}
        description="You’ll stop seeing each other’s friends-only posts."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                removeFriendship(removing.id).catch(() => {})
                setRemoving(null)
              }}
            >
              Remove
            </Button>
          </>
        }
      />
    </section>
  )
}
