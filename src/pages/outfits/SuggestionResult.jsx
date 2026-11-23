import { Link } from 'react-router-dom'
import { CATEGORY_NAMES } from '../../data/categories'
import { categoryLabel, suggestProducts } from '../../lib/stylist'
import ItemImage from '../../components/art/ItemImage'

// Shows the pieces of a suggestion, "Why this outfit" (transparency) and what is missing.
export default function SuggestionResult({ pieces, reasons = [], missing = [], style, formality }) {
  return (
    <div className="flex flex-col gap-4">
      <ul aria-label="Outfit pieces" className="grid grid-cols-2 gap-3">
        {pieces.map((p) => (
          <li key={p.id} className="rounded-2xl border border-line bg-white p-3">
            <div className="mx-auto h-20 w-20">
              <ItemImage item={p} />
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-muted">{CATEGORY_NAMES[p.category]}</p>
          </li>
        ))}
      </ul>

      {reasons.length > 0 && (
        <details className="rounded-2xl border border-line bg-white p-4" open>
          <summary className="min-h-11 cursor-pointer font-semibold text-ink">Why this outfit?</summary>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-helper">
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      )}

      {missing.map((cat) => {
        const products = suggestProducts({ category: cat, style, formality })
        return (
          <div key={cat} className="rounded-2xl border border-warning bg-warning-light p-4">
            <p className="font-semibold text-ink">You’re missing {categoryLabel(cat).toLowerCase()}. See suggestions:</p>
            <ul className="mt-2 flex flex-col gap-2">
              {products.map((p) => (
                <li key={p.id}>
                  <Link to={`/product/${p.id}`} className="flex items-center gap-3 rounded-xl bg-white p-2 hover:outline-2 hover:outline-primary">
                    <span className="h-12 w-12 shrink-0">
                      <ItemImage item={p} />
                    </span>
                    <span className="flex-1 text-sm">
                      <span className="block font-semibold text-ink">{p.name}</span>
                      <span className="text-muted">
                        {p.store} · SAR {p.price}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-primary">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
