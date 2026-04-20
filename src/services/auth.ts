import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  doc,
  getDocFromCache,
  getDocFromServer,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
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

interface UserProfileReadOptions {
  serverTimeoutMs?: number
  allowCacheFallback?: boolean
}

function errorCodeOf(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    return String((error as { code?: unknown }).code ?? '')
  }
  return ''
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Tiempo de espera agotado (${timeoutMs}ms).`))
      }, timeoutMs)
    }),
  ]).finally(() => {
    if (timer) {
      clearTimeout(timer)
    }
  })
}

function isRecoverableReadError(error: unknown) {
  const code = errorCodeOf(error)
  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'resource-exhausted' ||
    code === 'aborted'
  ) {
    return true
  }
  if (error instanceof Error) {
    return error.message.includes('Tiempo de espera agotado')
  }
  return false
}

export function isTimeoutError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }
  return error.message.includes('Tiempo de espera agotado')
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

export async function getUserProfile(
  uid: string,
  options: UserProfileReadOptions = {},
) {
  const { serverTimeoutMs = 10000, allowCacheFallback = true } = options
  const reference = doc(db, collections.users, uid)

  try {
    const snapshot = await withTimeout(getDocFromServer(reference), serverTimeoutMs)
    if (!snapshot.exists()) {
      return null
    }
    console.log('[AuthService] perfil leido desde servidor para uid:', uid)
    return snapshot.data() as UserProfile
  } catch (serverError) {
    console.warn(
      '[AuthService] fallo lectura de servidor para perfil, uid:',
      uid,
      serverError,
    )

    if (!allowCacheFallback || !isRecoverableReadError(serverError)) {
      throw serverError
    }

    try {
      const cacheSnapshot = await getDocFromCache(reference)
      if (!cacheSnapshot.exists()) {
        console.warn(
          '[AuthService] no hay perfil en cache para uid (fallback):',
          uid,
        )
        return null
      }
      console.log('[AuthService] perfil leido desde cache para uid:', uid)
      return cacheSnapshot.data() as UserProfile
    } catch (cacheError) {
      console.error(
        '[AuthService] fallo lectura de cache para perfil, uid:',
        uid,
        cacheError,
      )
      throw serverError
    }
  }
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

export function subscribeToAuth(
  callback: (user: User | null) => void,
  onError?: (error: Error) => void,
) {
  return onAuthStateChanged(auth, callback, onError)
}
