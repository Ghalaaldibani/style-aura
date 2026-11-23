// The four style results of the quiz.
// `palette` = colours the stylist prefers for this style (keys of COLORS in colors.js).
export const STYLES = {
  streetwear: {
    id: 'streetwear',
    name: 'Streetwear',
    description: 'Relaxed fits, layered pieces and bold sneakers. We matched outfit boards to your style.',
    short: 'Comfort-first, sporty and urban',
    palette: ['black', 'grey', 'olive', 'white', 'orange', 'green', 'blue'],
  },
  y2k: {
    id: 'y2k',
    name: 'Y2K',
    description: 'Playful 2000s energy: baby tees, low-rise denim, shine and pink. We matched outfit boards to your style.',
    short: 'Fun, colourful and nostalgic',
    palette: ['pink', 'purple', 'silver', 'white', 'blue', 'yellow'],
  },
  oldmoney: {
    id: 'oldmoney',
    name: 'Old Money',
    description: 'Quiet luxury: tailored pieces, soft neutrals and timeless shapes. We matched outfit boards to your style.',
    short: 'Elegant, neutral and timeless',
    palette: ['cream', 'beige', 'camel', 'navy', 'white', 'brown'],
  },
  emo: {
    id: 'emo',
    name: 'Emo',
    description: 'Dark, expressive and layered: black denim, band tees, boots and silver details. We matched outfit boards to your style.',
    short: 'Dark, edgy and expressive',
    palette: ['black', 'burgundy', 'red', 'grey', 'purple', 'silver'],
  },
}

export const STYLE_IDS = Object.keys(STYLES)

export function styleName(id) {
  return STYLES[id]?.name ?? 'Your style'
}
