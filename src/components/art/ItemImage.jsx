import GarmentArt from './GarmentArt'

// Shows a wardrobe item / product: the user's photo if there is one, otherwise our illustration.
export default function ItemImage({ item, className = '', decorative = true }) {
  if (item?.image) {
    return (
      <img
        src={item.image}
        alt={decorative ? '' : item.name}
        className={`h-full w-full object-contain ${className}`}
        loading="lazy"
      />
    )
  }
  return (
    <GarmentArt
      kind={item?.kind}
      color={item?.color}
      label={decorative ? undefined : item?.name}
      className={`h-full w-full ${className}`}
    />
  )
}
