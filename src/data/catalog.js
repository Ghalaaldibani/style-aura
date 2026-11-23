// Product catalog and outfit boards. Read-only content shipped with the app
// (user data lives in Firestore). Links open a search on the retailer's site.
const search = {
  ASOS: (q) => `https://www.asos.com/search/?q=${encodeURIComponent(q)}`,
  'H&M': (q) => `https://www2.hm.com/en_gb/search-results.html?q=${encodeURIComponent(q)}`,
  Zara: (q) => `https://www.zara.com/sa/en/search?searchTerm=${encodeURIComponent(q)}`,
  Namshi: (q) => `https://www.namshi.com/saudi-en/search?q=${encodeURIComponent(q)}`,
}

// formality: 1 casual · 2 smart · 3 formal
const raw = [
  // Streetwear
  ['s1', 'Oversized Hoodie', 129, 'ASOS', 'top', 'hoodie', 'brown', ['streetwear'], 1, 'winter'],
  ['s2', 'Cargo Pants', 149, 'H&M', 'bottom', 'cargo', 'olive', ['streetwear'], 1, 'all'],
  ['s3', 'Chunky Sneakers', 299, 'Namshi', 'shoes', 'sneakers', 'white', ['streetwear', 'y2k'], 1, 'all'],
  ['s4', 'Graphic Tee', 59, 'H&M', 'top', 'tshirt', 'white', ['streetwear'], 1, 'summer'],
  ['s5', 'Baseball Cap', 79, 'ASOS', 'accessory', 'cap', 'green', ['streetwear'], 1, 'all'],
  ['s6', 'Puffer Jacket', 249, 'Zara', 'outerwear', 'jacket', 'black', ['streetwear'], 1, 'winter'],
  ['s7', 'Crossbody Bag', 99, 'Namshi', 'accessory', 'bag', 'black', ['streetwear', 'emo'], 1, 'all'],
  ['s8', 'Baggy Jeans', 159, 'Zara', 'bottom', 'jeans', 'blue', ['streetwear'], 1, 'all'],
  ['s9', 'Satin Bomber Jacket', 219, 'ASOS', 'outerwear', 'jacket', 'olive', ['streetwear'], 2, 'mild'],
  // Y2K
  ['y1', 'Baby Tee', 49, 'H&M', 'top', 'babytee', 'pink', ['y2k'], 1, 'summer'],
  ['y2', 'Low-rise Jeans', 139, 'ASOS', 'bottom', 'jeans', 'blue', ['y2k'], 1, 'all'],
  ['y3', 'Mini Skirt', 89, 'Zara', 'bottom', 'skirt', 'purple', ['y2k'], 2, 'summer'],
  ['y4', 'Platform Sneakers', 229, 'Namshi', 'shoes', 'sneakers', 'pink', ['y2k'], 1, 'all'],
  ['y5', 'Mini Shoulder Bag', 119, 'ASOS', 'accessory', 'bag', 'silver', ['y2k'], 2, 'all'],
  ['y6', 'Tinted Sunglasses', 59, 'H&M', 'accessory', 'sunglasses', 'pink', ['y2k'], 1, 'summer'],
  ['y7', 'Butterfly Necklace', 45, 'Zara', 'accessory', 'necklace', 'silver', ['y2k'], 2, 'all'],
  ['y8', 'Cropped Cardigan', 109, 'H&M', 'top', 'sweater', 'purple', ['y2k'], 1, 'mild'],
  ['y9', 'Satin Slip Dress', 179, 'Zara', 'dress', 'dress', 'pink', ['y2k'], 3, 'summer'],
  // Old Money
  ['o1', 'Tailored Blazer', 349, 'Zara', 'outerwear', 'blazer', 'navy', ['oldmoney'], 3, 'all'],
  ['o2', 'Cable-knit Sweater', 199, 'H&M', 'top', 'sweater', 'cream', ['oldmoney'], 2, 'winter'],
  ['o3', 'Pleated Trousers', 179, 'Zara', 'bottom', 'trousers', 'beige', ['oldmoney'], 3, 'all'],
  ['o4', 'Leather Loafers', 279, 'Namshi', 'shoes', 'loafers', 'brown', ['oldmoney'], 2, 'all'],
  ['o5', 'Silk Shirt', 189, 'ASOS', 'top', 'shirt', 'white', ['oldmoney'], 3, 'all'],
  ['o6', 'Midi Skirt', 159, 'H&M', 'bottom', 'skirt', 'camel', ['oldmoney'], 2, 'mild'],
  ['o7', 'Structured Bag', 259, 'Namshi', 'accessory', 'bag', 'camel', ['oldmoney'], 3, 'all'],
  ['o8', 'Trench Coat', 399, 'Zara', 'outerwear', 'coat', 'beige', ['oldmoney'], 3, 'mild'],
  ['o9', 'Pearl Necklace', 89, 'ASOS', 'accessory', 'necklace', 'white', ['oldmoney'], 3, 'all'],
  ['o10', 'Classic Heels', 229, 'Namshi', 'shoes', 'heels', 'black', ['oldmoney', 'emo'], 3, 'all'],
  ['o11', 'Long Satin Dress', 329, 'Zara', 'dress', 'dress', 'navy', ['oldmoney'], 3, 'all'],
  // Emo
  ['e1', 'Band Tee', 69, 'H&M', 'top', 'tshirt', 'black', ['emo'], 1, 'summer'],
  ['e2', 'Ripped Skinny Jeans', 149, 'ASOS', 'bottom', 'jeans', 'black', ['emo'], 1, 'all'],
  ['e3', 'Combat Boots', 299, 'Namshi', 'shoes', 'boots', 'black', ['emo'], 1, 'winter'],
  ['e4', 'Studded Belt', 59, 'ASOS', 'accessory', 'belt', 'black', ['emo'], 1, 'all'],
  ['e5', 'Striped Long Sleeve', 89, 'H&M', 'top', 'sweater', 'burgundy', ['emo'], 1, 'mild'],
  ['e6', 'Plaid Skirt', 99, 'Zara', 'bottom', 'skirt', 'red', ['emo'], 2, 'all'],
  ['e7', 'Black Hoodie', 139, 'H&M', 'top', 'hoodie', 'black', ['emo', 'streetwear'], 1, 'winter'],
  ['e8', 'Chain Necklace', 49, 'Zara', 'accessory', 'necklace', 'silver', ['emo'], 1, 'all'],
  ['e9', 'Knit Beanie', 49, 'ASOS', 'accessory', 'beanie', 'black', ['emo'], 1, 'winter'],
  ['e10', 'Leather Jacket', 329, 'Zara', 'outerwear', 'jacket', 'black', ['emo'], 2, 'mild'],
  ['e11', 'Black Velvet Dress', 239, 'ASOS', 'dress', 'dress', 'black', ['emo'], 3, 'all'],
]

export const PRODUCTS = raw.map(([id, name, price, store, category, kind, color, styles, formality, season]) => ({
  id,
  name,
  price,
  store,
  url: search[store](name),
  category,
  kind,
  color,
  styles,
  formality,
  season,
}))

const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))
export const getProduct = (id) => byId[id] ?? null

export const BOARDS = [
  { id: 'b-campus', title: 'Campus Casual', style: 'streetwear', productIds: ['s4', 's8', 's3', 's5'] },
  { id: 'b-layered', title: 'Layered Fit', style: 'streetwear', productIds: ['s1', 's2', 's3'] },
  { id: 'b-hoodie', title: 'Weekend Hoodie', style: 'streetwear', productIds: ['e7', 's8', 's3'] },
  { id: 'b-cargo', title: 'Cargo Set', style: 'streetwear', productIds: ['s4', 's6', 's2', 's3', 's7'] },
  { id: 'b-pink', title: 'Pink Era', style: 'y2k', productIds: ['y1', 'y2', 'y4', 'y5'] },
  { id: 'b-mini', title: 'Mini & Shine', style: 'y2k', productIds: ['y8', 'y3', 'y4', 'y7'] },
  { id: 'b-denim', title: 'Throwback Denim', style: 'y2k', productIds: ['y1', 'y2', 'y6', 'y5'] },
  { id: 'b-party', title: 'Party Slip', style: 'y2k', productIds: ['y9', 'y4', 'y7'] },
  { id: 'b-quiet', title: 'Quiet Luxury', style: 'oldmoney', productIds: ['o5', 'o3', 'o4', 'o7'] },
  { id: 'b-club', title: 'Country Club', style: 'oldmoney', productIds: ['o2', 'o6', 'o4', 'o9'] },
  { id: 'b-trench', title: 'City Trench', style: 'oldmoney', productIds: ['o8', 'o5', 'o3', 'o10'] },
  { id: 'b-gala', title: 'Evening Gala', style: 'oldmoney', productIds: ['o11', 'o10', 'o9'] },
  { id: 'b-black', title: 'All Black', style: 'emo', productIds: ['e1', 'e2', 'e3', 'e4'] },
  { id: 'b-plaid', title: 'Plaid Mood', style: 'emo', productIds: ['e5', 'e6', 'e3', 'e8'] },
  { id: 'b-cozy', title: 'Cozy Dark', style: 'emo', productIds: ['e7', 'e2', 'e3', 'e9'] },
  { id: 'b-leather', title: 'Leather Night', style: 'emo', productIds: ['e10', 'e11', 'o10', 'e8'] },
]

const boardById = Object.fromEntries(BOARDS.map((b) => [b.id, b]))
export const getBoard = (id) => boardById[id] ?? null

// Sample wardrobe so new users can try the stylist right away.
export const SAMPLE_ITEMS = [
  { name: 'White Tee', category: 'top', kind: 'tshirt', color: 'white', season: 'all', tags: ['streetwear', 'oldmoney'], formality: 1 },
  { name: 'Black Hoodie', category: 'top', kind: 'hoodie', color: 'black', season: 'winter', tags: ['streetwear', 'emo'], formality: 1 },
  { name: 'Cream Sweater', category: 'top', kind: 'sweater', color: 'cream', season: 'winter', tags: ['oldmoney'], formality: 2 },
  { name: 'Blue Jeans', category: 'bottom', kind: 'jeans', color: 'blue', season: 'all', tags: ['streetwear', 'y2k'], formality: 1 },
  { name: 'Beige Trousers', category: 'bottom', kind: 'trousers', color: 'beige', season: 'all', tags: ['oldmoney'], formality: 2 },
  { name: 'Pink Mini Skirt', category: 'bottom', kind: 'skirt', color: 'pink', season: 'summer', tags: ['y2k'], formality: 2 },
  { name: 'White Sneakers', category: 'shoes', kind: 'sneakers', color: 'white', season: 'all', tags: ['streetwear', 'y2k'], formality: 1 },
  { name: 'Black Boots', category: 'shoes', kind: 'boots', color: 'black', season: 'winter', tags: ['emo'], formality: 1 },
  { name: 'Black Crossbody Bag', category: 'accessory', kind: 'bag', color: 'black', season: 'all', tags: ['streetwear', 'emo'], formality: 1 },
  { name: 'Denim Jacket', category: 'outerwear', kind: 'jacket', color: 'blue', season: 'mild', tags: ['streetwear', 'y2k'], formality: 1 },
]
