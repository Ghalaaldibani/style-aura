// "AI Suggest" — our own rule-based stylist (no external AI service).
// It builds outfits from the user's own wardrobe and explains every choice.
import { CLASHES, COLORS, NEUTRALS } from '../data/colors'
import { STYLES } from '../data/styles'
import { PRODUCTS } from '../data/catalog'
import { CATEGORY_NAMES } from '../data/categories'

const isNeutral = (c) => NEUTRALS.includes(c)
const clashes = (a, b) => CLASHES.some(([x, y]) => (x === a && y === b) || (x === b && y === a))

function currentSeason(date = new Date()) {
  const m = date.getMonth() + 1 // Saudi climate: hot most of the year
  if (m >= 5 && m <= 9) return 'summer'
  if (m === 12 || m <= 2) return 'winter'
  return 'mild'
}

// Score one piece for the user's style, the season and the event's formality.
function pieceScore(item, { style, season, formality }) {
  let score = 0
  const reasons = []
  if (style && item.tags?.includes(style)) {
    score += 3
    reasons.push(`it’s tagged ${STYLES[style].name}`)
  } else if (style && STYLES[style].palette.includes(item.color)) {
    score += 1.5
    reasons.push(`its ${COLORS[item.color]?.name.toLowerCase() ?? ''} colour fits ${STYLES[style].name}`)
  }
  if (item.season === 'all' || item.season === season) score += 1
  else score -= 1.5
  if (formality) {
    const diff = Math.abs((item.formality ?? 1) - formality)
    score -= diff * 2
    if (diff === 0) reasons.push('it matches the dress code')
  }
  return { score, reasons }
}

// Colour harmony of the whole outfit: neutrals + at most two accents, no clashing pairs.
function harmony(pieces) {
  const colors = pieces.map((p) => p.color)
  const accents = [...new Set(colors.filter((c) => !isNeutral(c)))]
  let score = 0
  const notes = []
  if (accents.length <= 1) {
    score += 2
    notes.push(accents.length ? `Neutrals with one ${COLORS[accents[0]].name.toLowerCase()} accent keep it balanced.` : 'An all-neutral palette always works together.')
  } else if (accents.length === 2 && !clashes(accents[0], accents[1])) {
    score += 0.5
  } else {
    score -= 2 * (accents.length - 1)
  }
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (clashes(colors[i], colors[j])) score -= 3
    }
  }
  return { score, notes }
}

const sameSet = (a, b) => a.length === b.length && a.every((id) => b.includes(id))

/**
 * Suggest one outfit.
 * @param items     the user's wardrobe items
 * @param options   { style, formality, avoid: [[ids], ...] (last suggestions), random }
 * @returns { pieces, reasons, missing: [category], score } or null if nothing fits
 */
export function suggestOutfit(items, { style, formality, avoid = [], random = Math.random } = {}) {
  const season = currentSeason()
  const ctx = { style, season, formality }
  const by = (cat) => items.filter((i) => i.category === cat)

  const scored = (list) =>
    list
      .map((item) => ({ item, ...pieceScore(item, ctx) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // keep the best few per category → fewer combinations

  const tops = scored(by('top'))
  const bottoms = scored(by('bottom'))
  const dresses = scored(by('dress'))
  const shoes = scored(by('shoes'))
  const outer = scored(by('outerwear'))
  const acc = scored(by('accessory'))

  // Base = top + bottom, or a dress.
  const bases = []
  for (const t of tops) for (const b of bottoms) bases.push([t, b])
  for (const d of dresses) bases.push([d])

  const missing = []
  if (!bases.length) {
    if (!tops.length && !dresses.length) missing.push('top')
    if (!bottoms.length && !dresses.length) missing.push('bottom')
  }
  if (!shoes.length) missing.push('shoes')

  const candidates = []
  const shoeOptions = shoes.length ? shoes : [null]
  const extraOptions = [null, ...outer.slice(0, 2), ...acc.slice(0, 2)]

  for (const base of bases.length ? bases : [[]]) {
    for (const s of shoeOptions) {
      for (const extra of extraOptions) {
        const picks = [...base, s, extra].filter(Boolean)
        if (!picks.length) continue
        const pieces = picks.map((p) => p.item)
        const h = harmony(pieces)
        const pieceTotal = picks.reduce((sum, p) => sum + p.score, 0) / picks.length
        // random tie-break so Regenerate gives something different
        const score = pieceTotal + h.score + random() * 1.5
        candidates.push({ picks, pieces, score, harmonyNotes: h.notes })
      }
    }
  }
  if (!candidates.length) return null

  candidates.sort((a, b) => b.score - a.score)
  const fresh = candidates.find((c) => !avoid.some((ids) => sameSet(ids, c.pieces.map((p) => p.id))))
  const best = fresh ?? candidates[0]

  const reasons = []
  for (const p of best.picks) {
    if (p.reasons.length) reasons.push(`${p.item.name}: ${p.reasons.join(' and ')}.`)
  }
  reasons.push(...best.harmonyNotes)
  if (season !== 'all') {
    const fits = best.pieces.filter((p) => p.season === 'all' || p.season === season).length
    if (fits === best.pieces.length) reasons.push(`Every piece works for ${season === 'mild' ? 'spring / autumn' : season} weather.`)
  }

  return { pieces: best.pieces, reasons, missing, score: best.score }
}

// Products that could fill a missing category, best match first.
export function suggestProducts({ category, style, formality, limit = 3 }) {
  return PRODUCTS.filter((p) => p.category === category)
    .map((p) => ({
      p,
      s: (style && p.styles.includes(style) ? 3 : 0) - (formality ? Math.abs(p.formality - formality) * 2 : 0),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.p)
}

export const categoryLabel = (id) => CATEGORY_NAMES[id] ?? id

// Event planner: which pieces the user owns for this event and which are missing.
export function planEvent(items, { style, formality }) {
  const outfit = suggestOutfit(items, { style, formality })
  const owned = outfit?.pieces ?? []
  const missing = new Set(outfit?.missing ?? [])
  // A formal event needs something formal enough: if the best piece in a slot is too casual, mark it missing.
  if (formality >= 3) {
    for (const piece of owned) {
      if ((piece.formality ?? 1) < 2 && piece.category !== 'accessory') missing.add(piece.category)
    }
  }
  const ownedOk = owned.filter((p) => !missing.has(p.category))
  return { owned: ownedOk, missing: [...missing], reasons: outfit?.reasons ?? [] }
}
