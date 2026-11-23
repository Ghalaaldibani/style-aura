import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { CATEGORIES, CATEGORY_NAMES } from '../../data/categories'
import { SAMPLE_ITEMS } from '../../data/catalog'
import { addSampleItems } from '../../lib/db'
import { useUserCollection } from '../../lib/useFirestore'
import { usePageTitle } from '../../lib/usePageTitle'
import { useToast } from '../../components/ui/ToastContext'
import ChipGroup from '../../components/ui/ChipGroup'
import Button from '../../components/ui/Button'
import ItemImage from '../../components/art/ItemImage'
import GarmentArt from '../../components/art/GarmentArt'
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/States'

export default function Wardrobe() {
  usePageTitle('My Wardrobe')
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const { data: items, loading, error } = useUserCollection(user.uid, 'items')
  const [category, setCategory] = useState('all')
  const [adding, setAdding] = useState(false)

  const shown = category === 'all' ? items : items.filter((i) => i.category === category)
  const usedCategories = CATEGORIES.filter((c) => items.some((i) => i.category === c.id))

  async function addSamples() {
    setAdding(true)
    try {
      await addSampleItems(user.uid, SAMPLE_ITEMS)
      logEvent('sample_items_added')
      toast.show({ message: `${SAMPLE_ITEMS.length} sample items added to your wardrobe` })
    } catch {
      toast.show({ message: 'Couldn’t add sample items. Try again.' })
    }
    setAdding(false)
  }

  return (
    <section className="page-in">
      <h1 className="mb-4 text-h2 font-bold text-ink">My Wardrobe</h1>

      {error ? (
        <ErrorState message="We couldn’t load your wardrobe." onRetry={() => window.location.reload()} />
      ) : loading ? (
        <LoadingGrid count={6} label="Loading your wardrobe" />
      ) : items.length === 0 ? (
        <EmptyState
          art={<GarmentArt kind="hoodie" color="purple" />}
          title="Your wardrobe is empty"
          text="Add your clothes so the stylist can build outfits from them, or start with sample items."
          action={
            <>
              <Button to="/wardrobe/add">+ Add item</Button>
              <Button variant="secondary" loading={adding} loadingText="Adding…" onClick={addSamples}>
                Add sample items
              </Button>
            </>
          }
        />
      ) : (
        <>
          {usedCategories.length > 1 && (
            <ChipGroup
              legend="Filter by category"
              name="wardrobe-filter"
              size="sm"
              options={[{ value: 'all', label: 'All' }, ...usedCategories.map((c) => ({ value: c.id, label: c.name }))]}
              value={category}
              onChange={setCategory}
              className="mb-4 [&_legend]:sr-only"
            />
          )}
          <p className="sr-only" aria-live="polite">
            {shown.length} items shown
          </p>
          <ul className="grid grid-cols-2 gap-4">
            {shown.map((item) => (
              <li key={item.id}>
                <Link to={`/wardrobe/${item.id}`} className="block h-full rounded-2xl border border-line bg-white p-3 shadow-sm hover:border-primary">
                  <div className="mx-auto h-20 w-24">
                    <ItemImage item={item} />
                  </div>
                  <p className="mt-2 truncate font-semibold text-ink">{item.name}</p>
                  <p className="text-sm text-muted">{CATEGORY_NAMES[item.category]}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {items.length > 0 && (
        <div className="mt-5 flex flex-col gap-4">
          <Button to="/wardrobe/add" fullWidth>
            + Add item
          </Button>
          <Button to="/events" variant="secondary" fullWidth>
            Plan an event outfit
          </Button>
        </div>
      )}
    </section>
  )
}
