import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getBoard, getProduct } from '../../data/catalog'
import { usePageTitle } from '../../lib/usePageTitle'
import { useFavorites } from '../../lib/useFavorites'
import { useUserCollection } from '../../lib/useFirestore'
import Tabs from '../../components/ui/Tabs'
import OutfitCollage from '../../components/art/OutfitCollage'
import ItemImage from '../../components/art/ItemImage'
import HeartButton from '../../components/HeartButton'
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/States'
import Button from '../../components/ui/Button'
import GarmentArt from '../../components/art/GarmentArt'

export default function Favorites() {
  usePageTitle('Favorites')
  const { user } = useAuth()
  const { favorites, loading, error, toggle } = useFavorites()
  const outfits = useUserCollection(user.uid, 'outfits')
  const items = useUserCollection(user.uid, 'items')
  const [tab, setTab] = useState('outfits')

  const cards = favorites
    .map((f) => {
      if (f.type === 'product') {
        const p = getProduct(f.refId)
        return p && { f, title: p.name, kind: 'Product', to: `/product/${p.id}`, art: <ItemImage item={p} /> }
      }
      if (f.type === 'board') {
        const b = getBoard(f.refId)
        return b && { f, title: b.title, kind: 'Outfit', to: `/board/${b.id}`, art: <OutfitCollage items={b.productIds.map(getProduct)} /> }
      }
      if (f.type === 'outfit') {
        const o = outfits.data.find((x) => x.id === f.refId)
        if (!o) return null
        const pieces = (o.itemIds ?? []).map((id) => items.data.find((i) => i.id === id) ?? null).filter(Boolean)
        return { f, title: o.name, kind: 'My outfit', to: `/outfits/${o.id}`, art: <OutfitCollage items={pieces.length ? pieces : o.pieces ?? []} /> }
      }
      return null
    })
    .filter(Boolean)

  const shown = cards.filter((c) => (tab === 'products' ? c.kind === 'Product' : c.kind !== 'Product'))

  return (
    <section className="page-in">
      <h1 className="mb-4 text-h2 font-bold text-ink">Favorites</h1>
      <Tabs
        label="Favorite type"
        tabs={[
          { id: 'outfits', label: 'Outfits' },
          { id: 'products', label: 'Products' },
        ]}
        value={tab}
        onChange={setTab}
      >
        {error ? (
          <ErrorState message="We couldn’t load your favorites." onRetry={() => window.location.reload()} />
        ) : loading ? (
          <LoadingGrid />
        ) : shown.length === 0 ? (
          <EmptyState
            art={<GarmentArt kind="heart" color="pink" />}
            title={tab === 'products' ? 'No saved products yet' : 'No saved outfits yet'}
            text="Tap the heart on any outfit or product to keep it here."
            action={<Button to="/home">Browse outfits</Button>}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-4">
            {shown.map((c) => (
              <li key={c.f.id} className="relative">
                <Link to={c.to} className="block h-full rounded-2xl border border-line bg-white p-3 shadow-sm hover:border-primary">
                  <div className="flex aspect-square items-center justify-center">{c.art}</div>
                  <p className="mt-2 font-semibold text-ink">{c.title}</p>
                  <p className="text-sm text-muted">{c.kind}</p>
                </Link>
                <HeartButton on label={`Remove ${c.title} from favorites`} onClick={() => toggle(c.f.type, c.f.refId, c.title, true)} className="absolute right-2 top-2" />
              </li>
            ))}
          </ul>
        )}
      </Tabs>
    </section>
  )
}
