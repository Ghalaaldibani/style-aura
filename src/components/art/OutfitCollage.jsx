import ItemImage from './ItemImage'

// Small grid of the pieces of an outfit / board (up to 4 shown).
export default function OutfitCollage({ items, className = '' }) {
  const shown = items.slice(0, 4)
  const cols = shown.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
  return (
    <div aria-hidden="true" className={`grid ${cols} gap-1 rounded-xl bg-primary-light/60 p-2 ${className}`}>
      {shown.map((item, i) => (
        <div key={item.id ?? i} className="flex aspect-square items-center justify-center rounded-lg bg-white p-1">
          <ItemImage item={item} />
        </div>
      ))}
    </div>
  )
}
