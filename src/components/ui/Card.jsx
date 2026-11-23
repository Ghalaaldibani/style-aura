// White rounded container used for items, outfits, posts…
// `as` picks the HTML element (e.g. "article", "li") for correct semantics.
export default function Card({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-2xl border border-line bg-white p-4 shadow-sm ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
