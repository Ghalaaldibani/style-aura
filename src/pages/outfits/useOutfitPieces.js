// Resolve an outfit's itemIds against the live wardrobe; fall back to the saved snapshot
// for pieces that were deleted later.
export function resolvePieces(outfit, items) {
  if (!outfit) return []
  const snap = outfit.pieces ?? []
  return (outfit.itemIds ?? []).map((id, i) => items.find((it) => it.id === id) ?? snap[i]).filter(Boolean)
}

export const snapshotPieces = (pieces) =>
  pieces.map(({ name, category, kind, color }) => ({ name, category, kind, color }))
