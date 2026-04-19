import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ??
    'AIzaSyDwJzkR8zfLkhOs5oMiGWZWCCG3M_A4Lag',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ??
    'web-app-sales.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'web-app-sales',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    'web-app-sales.firebasestorage.app',
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '583521480677',
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ??
    '1:583521480677:web:0b2efeb9ab858e689fc90c',
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-0T66J2NC8L',
}

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export const collections = {
  products: 'products',
  users: 'users',
  orders: 'orders',
  coupons: 'coupons',
  couponUsages: 'couponUsages',
  stockMovements: 'stockMovements',
} as const
