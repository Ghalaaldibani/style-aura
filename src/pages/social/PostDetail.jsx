import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { collection } from 'firebase/firestore'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { db } from '../../lib/firebase'
import { addComment, deleteComment, deletePost, setRating, toMillis } from '../../lib/db'
import { useLiveDoc, useLiveQuery } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Dialog from '../../components/ui/Dialog'
import OutfitCollage from '../../components/art/OutfitCollage'
import FullScreenLoader from '../../components/FullScreenLoader'
import { EmptyState } from '../../components/ui/States'
import { timeAgo } from '../../lib/time'

function Stars({ value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">Your rating</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n}>
            <input id={`star-${n}`} type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <label
              htmlFor={`star-${n}`}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-3xl leading-none peer-focus-visible:outline-3 peer-focus-visible:outline-primary"
            >
              <span aria-hidden="true" className={n <= (value ?? 0) ? 'text-warning' : 'text-line'}>
                ★
              </span>
              <span className="sr-only">
                {n} {n === 1 ? 'star' : 'stars'}
              </span>
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default function PostDetail() {
  usePageTitle('Post')
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { logEvent, announce } = useAdaptive()
  const toast = useToast()
  const { data: post, loading, error } = useLiveDoc(['posts', id])
  const ratings = useLiveQuery(post ? `ratings-${id}` : null, () => collection(db, 'posts', id, 'ratings'))
  const comments = useLiveQuery(post ? `comments-${id}` : null, () => collection(db, 'posts', id, 'comments'))
  const [text, setText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (loading) return <FullScreenLoader />
  if (error || !post) {
    return (
      <>
        <PageHeader title="Post" backTo="/feed" />
        <EmptyState title="This post isn’t available" text="It may have been deleted, or it’s only for the owner’s friends." action={<Button to="/feed">Back to feed</Button>} />
      </>
    )
  }

  const isOwner = post.ownerId === user.uid
  const myRating = ratings.data.find((r) => r.id === user.uid)?.value ?? null
  const avg = ratings.data.length ? ratings.data.reduce((s, r) => s + r.value, 0) / ratings.data.length : null
  const sortedComments = [...comments.data].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt))

  function rate(n) {
    setRating(id, user.uid, n).catch(() => toast.show({ message: 'Rating failed. Try again.' }))
    logEvent('post_rated', { value: n })
    announce(`You rated this outfit ${n} out of 5.`)
  }

  function submitComment(e) {
    e.preventDefault()
    const value = text.trim()
    if (!value) {
      setCommentError('Write a comment first.')
      return
    }
    if (value.length > 300) {
      setCommentError('Keep comments under 300 characters.')
      return
    }
    setCommentError('')
    addComment(id, { uid: user.uid, name: profile?.name ?? user.displayName ?? 'User', text: value }).catch(() =>
      toast.show({ message: 'Comment failed. Try again.' })
    )
    logEvent('comment_added')
    setText('')
  }

  function removePost() {
    deletePost(id).catch(() => toast.show({ message: 'Delete failed. Try again.' }))
    logEvent('post_deleted')
    toast.show({ message: 'Post deleted' })
    navigate('/feed', { replace: true })
  }

  return (
    <section className="page-in">
      <PageHeader title={post.outfitName ?? 'Post'} backTo="/feed" />
      <p className="text-sm text-muted">
        {isOwner ? 'You' : post.ownerName} · {timeAgo(toMillis(post.createdAt))} · {post.audience === 'public' ? '🌍 Public' : '👭 Friends'}
      </p>
      <OutfitCollage items={post.outfitSnapshot ?? []} className="mx-auto mt-3 max-w-64" />
      {post.caption && <p className="mt-3 text-base text-ink">{post.caption}</p>}

      <div className="mt-5 rounded-2xl border border-line bg-white p-4">
        <p className="text-sm text-helper">
          {avg ? (
            <>
              Average <strong className="text-ink">{avg.toFixed(1)} / 5</strong> from {ratings.data.length} {ratings.data.length === 1 ? 'rating' : 'ratings'}
            </>
          ) : (
            'No ratings yet. Be the first!'
          )}
        </p>
        {!isOwner && (
          <div className="mt-3">
            <Stars value={myRating} onChange={rate} />
          </div>
        )}
      </div>

      <h2 className="mt-6 text-h3 font-semibold text-ink">Comments ({sortedComments.length})</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {sortedComments.map((c) => (
          <li key={c.id} className="rounded-2xl border border-line bg-white p-3">
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm">
                <strong className="text-ink">{c.uid === user.uid ? 'You' : c.name}</strong>{' '}
                <span className="text-xs text-muted">{timeAgo(toMillis(c.createdAt))}</span>
                <span className="mt-0.5 block text-ink">{c.text}</span>
              </p>
              {(c.uid === user.uid || isOwner) && (
                <button
                  type="button"
                  onClick={() => {
                    deleteComment(id, c.id).catch(() => {})
                    toast.show({ message: 'Comment deleted' })
                  }}
                  aria-label={`Delete comment: ${c.text.slice(0, 30)}`}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted hover:bg-rose-light hover:text-error"
                >
                  <span aria-hidden="true">🗑</span>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={submitComment} noValidate className="mt-4 flex flex-col gap-3">
        <Input label="Add a comment" multiline value={text} onChange={(e) => setText(e.target.value)} maxLength={300} error={commentError} />
        <Button type="submit" fullWidth>
          Post comment
        </Button>
      </form>

      {isOwner && (
        <Button variant="ghost" fullWidth className="mt-6 !text-error" onClick={() => setConfirmDelete(true)}>
          Delete post
        </Button>
      )}

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this post?"
        description="It will be removed from the feed for everyone."
        actions={
          <>
            <Button variant="secondary" fullWidth onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={removePost}>
              Delete
            </Button>
          </>
        }
      />
    </section>
  )
}
