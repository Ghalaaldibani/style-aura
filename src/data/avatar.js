// Avatar options (Avatar screen) and helper to dress the avatar with an outfit.
export const SKIN_TONES = [
  { id: 'light', name: 'Light', hex: '#F6D5BC' },
  { id: 'medium', name: 'Medium', hex: '#E9B992' },
  { id: 'tan', name: 'Tan', hex: '#C98B5E' },
  { id: 'deep', name: 'Deep', hex: '#8A5A3B' },
]

export const BODY_SHAPES = [
  { id: 'slim', name: 'Slim', hip: 0 },
  { id: 'regular', name: 'Regular', hip: 4 },
  { id: 'curvy', name: 'Curvy', hip: 10 },
]

// Turns a list of wardrobe items into the avatar's outfit slots (first item per category).
export function outfitSlots(items) {
  const slots = {}
  for (const item of items) {
    if (item && !slots[item.category]) slots[item.category] = item
  }
  return slots
}
