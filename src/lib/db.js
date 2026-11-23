// All Firestore reads/writes in one place, so screens stay simple.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebase'

export const userDoc = (uid) => doc(db, 'users', uid)
export const userCol = (uid, name) => collection(db, 'users', uid, name)

// Firestore Timestamp | Date | number → milliseconds
export function toMillis(t) {
  if (!t) return 0
  if (typeof t === 'number') return t
  if (t.toMillis) return t.toMillis()
  if (t instanceof Date) return t.getTime()
  return 0
}

/* ---------- user profile ---------- */

export async function createUserProfile(user, name) {
  const base = {
    name,
    email: user.email,
    style: null,
    styleScores: null,
    quizSkipped: false,
    avatar: { skinTone: 'tan', bodyShape: 'regular' },
    createdAt: serverTimestamp(),
  }
  await setDoc(userDoc(user.uid), base, { merge: true })
  await savePublicProfile(user.uid, { name, emailLower: user.email.toLowerCase(), style: null })
}

export const updateUser = (uid, data) => setDoc(userDoc(uid), data, { merge: true })

// Small public card other users can see (needed to find friends by email).
export async function savePublicProfile(uid, data) {
  try {
    await setDoc(doc(db, 'profiles', uid), data, { merge: true })
  } catch (err) {
    console.warn('[db] public profile not saved (check Firestore rules)', err)
  }
}

export async function getPublicProfile(uid) {
  const snap = await getDoc(doc(db, 'profiles', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function findProfileByEmail(email) {
  const q = query(collection(db, 'profiles'), where('emailLower', '==', email.trim().toLowerCase()), limit(1))
  const snap = await getDocs(q)
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
}

/* ---------- generic sub-collection helpers (items, outfits, events…) ---------- */

export const addUserDoc = (uid, name, data) => addDoc(userCol(uid, name), { ...data, createdAt: serverTimestamp() })
export const updateUserDoc = (uid, name, id, data) => updateDoc(doc(db, 'users', uid, name, id), data)
export const deleteUserDoc = (uid, name, id) => deleteDoc(doc(db, 'users', uid, name, id))
// Used by Undo: put the deleted document back with the same id.
export const restoreUserDoc = (uid, name, id, data) => setDoc(doc(db, 'users', uid, name, id), data)

export async function getUserDoc(uid, name, id) {
  const snap = await getDoc(doc(db, 'users', uid, name, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function addSampleItems(uid, items) {
  const batch = writeBatch(db)
  for (const item of items) {
    batch.set(doc(userCol(uid, 'items')), { ...item, image: null, sample: true, createdAt: serverTimestamp() })
  }
  await batch.commit()
}

/* ---------- favorites (doc id = type_refId, so toggling is easy) ---------- */

export const favoriteId = (type, refId) => `${type}_${refId}`

export async function setFavorite(uid, type, refId, on) {
  const ref = doc(db, 'users', uid, 'favorites', favoriteId(type, refId))
  if (on) await setDoc(ref, { type, refId, createdAt: serverTimestamp() })
  else await deleteDoc(ref)
}

/* ---------- interaction logs (bonus: live database) ---------- */

export async function writeLogs(uid, entries) {
  const batch = writeBatch(db)
  for (const e of entries) batch.set(doc(userCol(uid, 'interactionLogs')), e)
  await batch.commit()
}

/* ---------- social ---------- */

export const friendshipId = (a, b) => [a, b].sort().join('_')

export async function sendFriendRequest(me, other) {
  await setDoc(doc(db, 'friendships', friendshipId(me.uid, other.uid)), {
    users: [me.uid, other.uid].sort(),
    names: { [me.uid]: me.name, [other.uid]: other.name },
    status: 'pending',
    requestedBy: me.uid,
    createdAt: serverTimestamp(),
  })
}

export const acceptFriendRequest = (id) => updateDoc(doc(db, 'friendships', id), { status: 'accepted' })
export const removeFriendship = (id) => deleteDoc(doc(db, 'friendships', id))

export async function getFriendIds(uid) {
  const snap = await getDocs(query(collection(db, 'friendships'), where('users', 'array-contains', uid)))
  return snap.docs
    .map((d) => d.data())
    .filter((f) => f.status === 'accepted')
    .map((f) => f.users.find((u) => u !== uid))
}

export async function createPost({ uid, name, outfit, items, caption, audience }) {
  const friendIds = await getFriendIds(uid)
  const snapshot = items.slice(0, 5).map(({ name: n, category, kind, color, image }) => ({
    name: n,
    category,
    kind,
    color,
    image: image ?? null,
  }))
  const ref = await addDoc(collection(db, 'posts'), {
    ownerId: uid,
    ownerName: name,
    outfitId: outfit.id,
    outfitName: outfit.name,
    outfitSnapshot: snapshot,
    caption,
    audience,
    // who can read it: the owner + friends at the time of posting (+ everyone if public)
    visibleTo: [uid, ...friendIds],
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const deletePost = (id) => deleteDoc(doc(db, 'posts', id))
export const setRating = (postId, uid, value) => setDoc(doc(db, 'posts', postId, 'ratings', uid), { value })
export const addComment = (postId, { uid, name, text }) =>
  addDoc(collection(db, 'posts', postId, 'comments'), { uid, name, text, createdAt: serverTimestamp() })
export const deleteComment = (postId, commentId) => deleteDoc(doc(db, 'posts', postId, 'comments', commentId))

/* ---------- account deletion ---------- */

export async function deleteAllUserData(uid) {
  for (const name of ['items', 'outfits', 'favorites', 'events', 'interactionLogs']) {
    const snap = await getDocs(userCol(uid, name))
    let batch = writeBatch(db)
    let count = 0
    for (const d of snap.docs) {
      batch.delete(d.ref)
      if (++count === 450) {
        await batch.commit()
        batch = writeBatch(db)
        count = 0
      }
    }
    if (count) await batch.commit()
  }
  await deleteDoc(doc(db, 'profiles', uid)).catch(() => {})
  await deleteDoc(userDoc(uid))
}
