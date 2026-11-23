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
 * - `profileLoading`: true until the profile document has been read once for this user.
 */
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  // Profile is stored with the uid it belongs to, so "loading" can be derived.
  const [profileState, setProfileState] = useState({ uid: null, data: null })

  // 1) Listen to login / logout.
  useEffect(() => {
    if (!isFirebaseConfigured) return
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
  }, [])

  // 2) While logged in, keep the profile document in sync in real time.
  useEffect(() => {
    if (!user) return
    const uid = user.uid
    return onSnapshot(
      doc(db, 'users', uid),
      (snap) => setProfileState({ uid, data: snap.exists() ? { id: snap.id, ...snap.data() } : null }),
      (err) => {
        console.error('[auth] profile listener failed', err)
        setProfileState({ uid, data: null })
      }
    )
  }, [user])

  const profile = user && profileState.uid === user.uid ? profileState.data : null
  const profileLoading = Boolean(user) && profileState.uid !== user?.uid

  const value = useMemo(() => ({ user, profile, loading, profileLoading }), [user, profile, loading, profileLoading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
