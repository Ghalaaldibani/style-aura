import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { createPost } from '../../lib/db'
import { useLiveDoc, useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import PageHeader from '../../components/ui/PageHeader'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import OutfitCollage from '../../components/art/OutfitCollage'
import FullScreenLoader from '../../components/FullScreenLoader'
import { EmptyState } from '../../components/ui/States'
import { resolvePieces } from '../outfits/useOutfitPieces'

const AUDIENCES = [
  { id: 'friends', label: 'Friends', text: 'Only people you’ve added as friends', icon: '👭' },
  { id: 'public', label: 'Public', text: 'Anyone on Style Aura can see it', icon: '🌍' },
]
const MAX = 200

export default function Share() {
  usePageTitle('Share outfit')
  const { outfitId } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const { data: outfit, loading } = useLiveDoc(['users', user.uid, 'outfits', outfitId])
  const items = useUserCollection(user.uid, 'items')
  const [caption, setCaption] = useState('')
  const [audience, setAudience] = useState('friends')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <FullScreenLoader />
  if (!outfit) {
    return (
      <>
        <PageHeader title="Share outfit" />
        <EmptyState title="Outfit not found" action={<Button to="/outfits">Back to outfits</Button>} />
      </>
    )
  }
  const pieces = resolvePieces(outfit, items.data)

  async function post(e) {
    e.preventDefault()
    if (caption.length > MAX) {
      setError(`Keep the caption under ${MAX} characters.`)
      return
    }
    setPosting(true)
    setError('')
    try {
      const id = await createPost({
        uid: user.uid,
        name: profile?.name ?? user.displayName ?? 'Style Aura user',
        outfit,
        items: pieces,
        caption: caption.trim(),
        audience,
      })
      logEvent('outfit_shared', { audience })
      toast.show({ message: audience === 'public' ? 'Shared publicly' : 'Shared with your friends' })
      navigate(`/post/${id}`, { replace: true })
    } catch (err) {
      console.error(err)
      setError('Sharing failed. Check your connection and try again.')
      setPosting(false)
    }
  }

  return (
    <section className="page-in">
      <PageHeader title="Share outfit" />
      <OutfitCollage items={pieces} className="mx-auto max-w-60" />
      <p className="mt-2 text-center font-semibold text-ink">{outfit.name}</p>

      <form onSubmit={post} className="mt-5 flex flex-col gap-5" noValidate>
        <div>
          <Input
            label="Caption (optional)"
            multiline
            name="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Say something about this look…"
            error={error && caption.length > MAX ? error : undefined}
            hint={`${caption.length}/${MAX} characters`}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink">Who can see it?</legend>
          <div className="flex flex-col gap-3">
            {AUDIENCES.map((a) => (
              <div key={a.id}>
                <input
                  id={`aud-${a.id}`}
                  type="radio"
                  name="audience"
                  value={a.id}
                  checked={audience === a.id}
                  onChange={() => setAudience(a.id)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={`aud-${a.id}`}
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border bg-white p-4 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                    audience === a.id ? 'border-2 border-primary' : 'border-line'
                  }`}
                >
                  <span aria-hidden="true" className="text-2xl">
                    {a.icon}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">{a.label}</span>
                    <span className="block text-sm text-helper">{a.text}</span>
                  </span>
                  {audience === a.id && (
                    <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-white">
                      ✓
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
        </fieldset>

        {error && caption.length <= MAX && (
          <p role="alert" className="text-sm font-medium text-error">
            ⚠ {error}
          </p>
        )}
        <Button type="submit" fullWidth loading={posting} loadingText="Sharing…">
          Share
        </Button>
      </form>
    </section>
  )
}
