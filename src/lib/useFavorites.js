import { useCallback } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useAdaptive } from '../adaptive/AdaptiveContext'
import { useToast } from '../components/ui/ToastContext'
import { favoriteId, setFavorite } from './db'
import { useUserCollection } from './useFirestore'

// Live favourites + a toggle that always offers Undo.
export function useFavorites() {
  const { user } = useAuth()
  const { logEvent } = useAdaptive()
  const toast = useToast()
  const { data, loading, error } = useUserCollection(user?.uid, 'favorites')
  const ids = new Set(data.map((f) => f.id))

  const isFavorite = (type, refId) => ids.has(favoriteId(type, refId))

  const toggle = useCallback(
    (type, refId, label, currentlyOn) => {
      const next = !currentlyOn
      setFavorite(user.uid, type, refId, next).catch(() => toast.show({ message: 'Couldn’t update favourites. Try again.' }))
      logEvent(next ? 'favorite_added' : 'favorite_removed', { type, refId })
      toast.show({
        message: next ? `${label} saved to Favorites` : `${label} removed from Favorites`,
        actionLabel: 'Undo',
        onAction: () => setFavorite(user.uid, type, refId, !next).catch(() => {}),
      })
    },
    [user, logEvent, toast]
  )

  return { favorites: data, loading, error, isFavorite, toggle }
}
