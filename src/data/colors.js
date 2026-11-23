// Colour names used for wardrobe items, products and the stylist's harmony rules.
export const COLORS = {
  black: { name: 'Black', hex: '#232026' },
  white: { name: 'White', hex: '#F7F5F2' },
  grey: { name: 'Grey', hex: '#A3A3AB' },
  navy: { name: 'Navy', hex: '#26375A' },
  blue: { name: 'Denim blue', hex: '#5B84C9' },
  beige: { name: 'Beige', hex: '#DCC7A6' },
  cream: { name: 'Cream', hex: '#F3EAD6' },
  camel: { name: 'Camel', hex: '#C49A66' },
  brown: { name: 'Brown', hex: '#6E4630' },
  olive: { name: 'Olive', hex: '#6F7748' },
  green: { name: 'Green', hex: '#3E8E74' },
  red: { name: 'Red', hex: '#C23B32' },
  burgundy: { name: 'Burgundy', hex: '#6E2333' },
  pink: { name: 'Pink', hex: '#F2A7C3' },
  purple: { name: 'Purple', hex: '#9466C9' },
  yellow: { name: 'Yellow', hex: '#F2C94C' },
  orange: { name: 'Orange', hex: '#E8893A' },
  silver: { name: 'Silver', hex: '#C9CCD3' },
}

export const COLOR_IDS = Object.keys(COLORS)

// Neutrals go with everything (colour-harmony rule "neutral + one accent").
export const NEUTRALS = ['black', 'white', 'grey', 'navy', 'beige', 'cream', 'camel', 'brown', 'blue']

// Pairs that usually clash.
export const CLASHES = [
  ['red', 'pink'],
  ['red', 'orange'],
  ['pink', 'orange'],
  ['red', 'green'],
  ['purple', 'orange'],
  ['yellow', 'purple'],
  ['olive', 'pink'],
]

export function colorHex(id) {
  return COLORS[id]?.hex ?? '#CCCCCC'
}
