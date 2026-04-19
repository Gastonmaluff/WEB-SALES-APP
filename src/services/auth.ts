import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { UserProfile } from '../types'
import { auth, collections, db } from './firebase'

interface RegisterPayload {
  name: string
  phone: string
  email: string
  password: string
  address: string
  city: string
  reference: string
}

interface ProfileUpdatePayload {
  name: string
  phone: string
  address: string
  city: string
  reference: string
}

export async function registerUser(payload: RegisterPayload) {
  const credentials = await createUserWithEmailAndPassword(
    auth,
    payload.email,
    payload.password,
  )
  const now = new Date().toISOString()
  const profile: UserProfile = {
    uid: credentials.user.uid,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    address: payload.address,
    city: payload.city,
    reference: payload.reference,
    role: 'customer',
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(doc(db, collections.users, credentials.user.uid), profile)

  return credentials.user
}

export async function loginUser(email: string, password: string) {
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  return credentials.user
}

export async function logoutUser() {
  await signOut(auth)
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(db, collections.users, uid))
  if (!snapshot.exists()) {
    return null
  }

  return snapshot.data() as UserProfile
}

export async function updateUserProfile(
  uid: string,
  payload: ProfileUpdatePayload,
) {
  await updateDoc(doc(db, collections.users, uid), {
    ...payload,
    updatedAt: new Date().toISOString(),
  })
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
