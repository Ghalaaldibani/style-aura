import { Link, useParams } from 'react-router-dom'
import { getBoard, getProduct } from '../../data/catalog'
import { STYLES } from '../../data/styles'
import { usePageTitle } from '../../lib/usePageTitle'
import { useFavorites } from '../../lib/useFavorites'
import PageHeader from '../../components/ui/PageHeader'
import OutfitCollage from '../../components/art/OutfitCollage'
import ItemImage from '../../components/art/ItemImage'
import HeartButton from '../../components/HeartButton'
import { EmptyState } from '../../components/ui/States'
import Button from '../../components/ui/Button'

export default function BoardDetail() {
  const { id } = useParams()
  const board = getBoard(id)
  usePageTitle(board?.title ?? 'Outfit')
  const { isFavorite, toggle } = useFavorites()

  if (!board) {
    return (
      <>
        <PageHeader title="Outfit" />
        <EmptyState title="Outfit not found" text="It may have been removed." action={<Button to="/home">Back to Home</Button>} />
      </>
    )
  }

  const items = board.productIds.map(getProduct)
  const fav = isFavorite('board', board.id)
  const total = items.reduce((s, p) => s + p.price, 0)

  return (
    <section className="page-in">
      <PageHeader
        title={board.title}
        action={<HeartButton on={fav} label={`Save ${board.title} to favorites`} onClick={() => toggle('board', board.id, board.title, fav)} />}
      />
      <OutfitCollage items={items} className="mx-auto max-w-72" />
      <p className="mt-3 text-sm text-muted">
        {STYLES[board.style].name} · {items.length} pieces · about SAR {total}
      </p>

      <h2 className="mt-5 text-h3 font-semibold text-ink">Pieces</h2>
      <ul className="mt-2 flex flex-col gap-3">
        {items.map((p) => (
          <li key={p.id}>
            <Link to={`/product/${p.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 hover:border-primary">
              <span className="h-16 w-16 shrink-0 rounded-xl bg-primary-light p-1">
                <ItemImage item={p} />
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-ink">{p.name}</span>
                <span className="block text-sm text-muted">
                  {p.store} · SAR {p.price}
                </span>
              </span>
              <span aria-hidden="true" className="text-xl text-primary">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
