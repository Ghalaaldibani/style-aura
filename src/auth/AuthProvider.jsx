import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'
import { AuthContext } from './AuthContext'

/**
 * Knows who is logged in.
 * - `user`: the Firebase Auth user (null = logged out)
 * - `profile`: the live `users/{uid}` Firestore document (name, style, avatar, settings…)
 * - `loading`: true until Firebase tells us the first auth state,
 *   so guards don't wrongly send a logged-in user to /login on refresh.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  // 1) Listen to login / logout.
  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      if (!firebaseUser) setProfile(null)
      setLoading(false)
    })
  }, [])

  // 2) While logged in, keep the profile document in sync in real time.
  useEffect(() => {
    if (!user) return
    return onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (err) => console.error('[auth] profile listener failed', err)
    )
  }, [user])

  const value = useMemo(() => ({ user, profile, loading }), [user, profile, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
