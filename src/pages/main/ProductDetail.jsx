import { useParams } from 'react-router-dom'
import { getProduct } from '../../data/catalog'
import { COLORS } from '../../data/colors'
import { useAdaptive } from '../../adaptive/AdaptiveContext'
import { usePageTitle } from '../../lib/usePageTitle'
import { useFavorites } from '../../lib/useFavorites'
import PageHeader from '../../components/ui/PageHeader'
import Button from '../../components/ui/Button'
import ItemImage from '../../components/art/ItemImage'
import { EmptyState } from '../../components/ui/States'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProduct(id)
  usePageTitle(product?.name ?? 'Product')
  const { logEvent } = useAdaptive()
  const { isFavorite, toggle } = useFavorites()

  if (!product) {
    return (
      <>
        <PageHeader title="Product" />
        <EmptyState title="Product not found" action={<Button to="/home">Back to Home</Button>} />
      </>
    )
  }

  const fav = isFavorite('product', product.id)

  return (
    <section className="page-in">
      <PageHeader title="Product" />
      <div className="mx-auto h-56 w-56">
        <ItemImage item={product} decorative={false} />
      </div>
      <h1 className="mt-4 text-h2 font-bold text-ink">{product.name}</h1>
      <p className="mt-2 text-h3 font-semibold text-primary">SAR {product.price}</p>
      <p className="mt-1 text-sm text-muted">Colour: {COLORS[product.color]?.name}</p>

      <div className="mt-4 rounded-2xl border border-warning bg-warning-light p-4">
        <p className="font-semibold text-ink">Sold by {product.store}</p>
        <p className="mt-1 text-sm text-ink">You will leave Style Aura and open the retailer’s site in a new tab.</p>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => logEvent('open_retailer', { productId: product.id, store: product.store })}
          className="inline-flex min-h-[3.125rem] w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-white hover:bg-primary-dark"
        >
          Open on {product.store}
          <span className="sr-only">(opens in a new tab)</span>
          <span aria-hidden="true">↗</span>
        </a>
        <Button variant="secondary" fullWidth aria-pressed={fav} onClick={() => toggle('product', product.id, product.name, fav)}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M12 20s-7-4.4-9.3-8.6C1 8 3 4.5 6.4 4.5c2 0 3.6 1.2 4.6 2.6 1-1.4 2.6-2.6 4.6-2.6C19 4.5 21 8 19.3 11.4 17 15.6 12 20 12 20Z" />
          </svg>
          {fav ? 'Saved to Favorites' : 'Save to Favorites'}
        </Button>
      </div>
    </section>
  )
}
