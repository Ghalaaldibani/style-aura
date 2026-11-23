// Wardrobe categories. `kind` = default illustration when the user adds no photo.
export const CATEGORIES = [
  { id: 'top', name: 'Top', kind: 'tshirt' },
  { id: 'bottom', name: 'Bottom', kind: 'jeans' },
  { id: 'dress', name: 'Dress', kind: 'dress' },
  { id: 'outerwear', name: 'Outerwear', kind: 'jacket' },
  { id: 'shoes', name: 'Shoes', kind: 'sneakers' },
  { id: 'accessory', name: 'Accessory', kind: 'bag' },
]

export const CATEGORY_NAMES = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.name]))

export const SEASONS = [
  { id: 'all', name: 'All year' },
  { id: 'summer', name: 'Summer' },
  { id: 'winter', name: 'Winter' },
  { id: 'mild', name: 'Spring / Autumn' },
]

// 1 = casual, 2 = smart, 3 = formal
export const OCCASIONS = [
  { id: 1, name: 'Casual' },
  { id: 2, name: 'Smart' },
  { id: 3, name: 'Formal' },
]

export const EVENT_TYPES = [
  { id: 'casual', name: 'Casual outing', formality: 1 },
  { id: 'party', name: 'Party', formality: 2 },
  { id: 'work', name: 'Work / Interview', formality: 2 },
  { id: 'graduation', name: 'Graduation', formality: 3 },
  { id: 'wedding', name: 'Wedding', formality: 3 },
]

// Item types per category (decides the illustration when there is no photo).
export const KINDS = {
  top: [
    { id: 'tshirt', name: 'T-shirt' },
    { id: 'babytee', name: 'Baby tee' },
    { id: 'shirt', name: 'Shirt' },
    { id: 'sweater', name: 'Sweater' },
    { id: 'hoodie', name: 'Hoodie' },
  ],
  bottom: [
    { id: 'jeans', name: 'Jeans' },
    { id: 'trousers', name: 'Trousers' },
    { id: 'cargo', name: 'Cargo pants' },
    { id: 'skirt', name: 'Skirt' },
    { id: 'shorts', name: 'Shorts' },
  ],
  dress: [{ id: 'dress', name: 'Dress' }],
  outerwear: [
    { id: 'jacket', name: 'Jacket' },
    { id: 'blazer', name: 'Blazer' },
    { id: 'coat', name: 'Coat' },
  ],
  shoes: [
    { id: 'sneakers', name: 'Sneakers' },
    { id: 'boots', name: 'Boots' },
    { id: 'loafers', name: 'Loafers' },
    { id: 'heels', name: 'Heels' },
  ],
  accessory: [
    { id: 'bag', name: 'Bag' },
    { id: 'cap', name: 'Cap' },
    { id: 'beanie', name: 'Beanie' },
    { id: 'necklace', name: 'Necklace' },
    { id: 'sunglasses', name: 'Sunglasses' },
    { id: 'belt', name: 'Belt' },
  ],
}
