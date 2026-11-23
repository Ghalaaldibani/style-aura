import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import Button from '../../components/ui/Button'
import OutfitCollage from '../../components/art/OutfitCollage'
import GarmentArt from '../../components/art/GarmentArt'
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/States'
import { resolvePieces } from './useOutfitPieces'

const SOURCE = { ai: 'AI Suggest', manual: 'Manual', event: 'Event' }

export default function Outfits() {
  usePageTitle('My Outfits')
  const { user } = useAuth()
  const outfits = useUserCollection(user.uid, 'outfits')
  const items = useUserCollection(user.uid, 'items')

  return (
    <section className="page-in">
      <h1 className="mb-4 text-h2 font-bold text-ink">My Outfits</h1>
      <div className="mb-5 flex flex-col gap-3">
        <Button to="/outfits/create" fullWidth>
          ✨ Create Outfit
        </Button>
        <Button to="/events" variant="secondary" fullWidth>
          Plan an event outfit
        </Button>
      </div>

      {outfits.error ? (
        <ErrorState message="We couldn’t load your outfits." onRetry={() => window.location.reload()} />
      ) : outfits.loading ? (
        <LoadingGrid />
      ) : outfits.data.length === 0 ? (
        <EmptyState
          art={<GarmentArt kind="dress" color="purple" />}
          title="No outfits yet"
          text="Let AI Suggest put one together from your wardrobe, or build your own."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {outfits.data.map((o) => (
            <li key={o.id}>
              <Link to={`/outfits/${o.id}`} className="block h-full rounded-2xl border border-line bg-white p-3 shadow-sm hover:border-primary">
                <OutfitCollage items={resolvePieces(o, items.data)} />
                <p className="mt-2 truncate font-semibold text-ink">{o.name}</p>
                <p className="text-sm text-muted">
                  {SOURCE[o.source] ?? 'Outfit'} · {o.itemIds?.length ?? 0} pieces
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
