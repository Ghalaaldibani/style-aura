import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase'
import { toMillis, userCol } from './db'

const read = (d) => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) })

/**
 * Live list from a Firestore query. `key` must change when the query changes.
 * State is stored together with its key, so `loading` is derived (no setState inside the effect body).
 */
export function useLiveQuery(key, makeQuery) {
  const [state, setState] = useState({ key: null, data: [], error: null })

  useEffect(() => {
    if (!key) return
    const q = makeQuery()
    return onSnapshot(
      q,
      (snap) => setState({ key, data: snap.docs.map(read), error: null }),
      (error) => {
        console.error('[firestore]', key, error)
        setState({ key, data: [], error })
      }
    )
    // makeQuery is recreated every render; `key` describes it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const current = state.key === key
  return { data: current ? state.data : [], loading: Boolean(key) && !current, error: current ? state.error : null }
}

// users/{uid}/{name}, newest first.
export function useUserCollection(uid, name) {
  const result = useLiveQuery(uid ? `${uid}/${name}` : null, () => userCol(uid, name))
  const data = [...result.data].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))
  return { ...result, data }
}

// One live document by path segments, e.g. useLiveDoc(['posts', id]).
export function useLiveDoc(segments) {
  const key = segments.every(Boolean) ? segments.join('/') : null
  const [state, setState] = useState({ key: null, data: null, error: null })

  useEffect(() => {
    if (!key) return
    return onSnapshot(
      doc(db, key),
      (snap) => setState({ key, data: snap.exists() ? read(snap) : null, error: null }),
      (error) => setState({ key, data: null, error })
    )
  }, [key])

  const current = state.key === key
  return { data: current ? state.data : null, loading: Boolean(key) && !current, error: current ? state.error : null }
}
