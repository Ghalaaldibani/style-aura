import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, limit, query, where } from 'firebase/firestore'
import { useAuth } from '../../auth/AuthContext'
import { db } from '../../lib/firebase'
import { toMillis } from '../../lib/db'
import { useLiveQuery } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { timeAgo } from '../../lib/time'
import PageHeader from '../../components/ui/PageHeader'
import ChipGroup from '../../components/ui/ChipGroup'
import Button from '../../components/ui/Button'
import OutfitCollage from '../../components/art/OutfitCollage'
import GarmentArt from '../../components/art/GarmentArt'
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/States'

export default function Feed() {
  usePageTitle('Friends Feed')
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')

  // Two queries the security rules can prove: posts shared with me (friends + mine) and public posts.
  const mine = useLiveQuery(`feed-visible-${user.uid}`, () =>
    query(collection(db, 'posts'), where('visibleTo', 'array-contains', user.uid), limit(50))
  )
  const pub = useLiveQuery('feed-public', () => query(collection(db, 'posts'), where('audience', '==', 'public'), limit(50)))

  const merged = new Map()
  for (const p of [...mine.data, ...pub.data]) merged.set(p.id, p)
  let posts = [...merged.values()].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
  if (filter === 'friends') posts = posts.filter((p) => p.audience === 'friends' || p.ownerId === user.uid)
  if (filter === 'public') posts = posts.filter((p) => p.audience === 'public')

  const loading = mine.loading || pub.loading
  const error = mine.error && pub.error

  return (
    <section className="page-in">
      <PageHeader
        title="Friends Feed"
        action={
          <Link to="/friends" className="inline-flex min-h-11 items-center rounded-full bg-primary-light px-4 text-sm font-semibold text-primary">
            Friends
          </Link>
        }
        showContrastToggle={false}
      />
      <ChipGroup
        legend="Show"
        name="feed-filter"
        size="sm"
        options={[
          { value: 'all', label: 'All' },
          { value: 'friends', label: 'Friends' },
          { value: 'public', label: 'Public' },
        ]}
        value={filter}
        onChange={setFilter}
        className="mb-4 [&_legend]:sr-only"
      />

      {error ? (
        <ErrorState message="We couldn’t load the feed." onRetry={() => window.location.reload()} />
      ) : loading ? (
        <LoadingGrid count={2} label="Loading posts" />
      ) : posts.length === 0 ? (
        <EmptyState
          art={<GarmentArt kind="sunglasses" color="purple" />}
          title="No posts yet"
          text="Share one of your outfits, or add friends to see theirs."
          action={
            <>
              <Button to="/outfits">Share an outfit</Button>
              <Button to="/friends" variant="secondary">
                Find friends
              </Button>
            </>
          }
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.id}>
              <Link to={`/post/${p.id}`} className="block rounded-2xl border border-line bg-white p-4 shadow-sm hover:border-primary">
                <div className="mb-3 flex items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light font-bold text-rose">
                    {p.ownerName?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                  <span className="flex-1">
                    <span className="block font-semibold text-ink">{p.ownerId === user.uid ? 'You' : p.ownerName}</span>
                    <span className="block text-xs text-muted">
                      {timeAgo(toMillis(p.createdAt))} · {p.audience === 'public' ? '🌍 Public' : '👭 Friends'}
                    </span>
                  </span>
                </div>
                <OutfitCollage items={p.outfitSnapshot ?? []} className="mx-auto max-w-56" />
                <p className="mt-3 font-semibold text-ink">{p.outfitName}</p>
                {p.caption && <p className="mt-1 text-sm text-helper">{p.caption}</p>}
                <p className="mt-2 text-sm font-semibold text-primary">Rate &amp; comment ›</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
