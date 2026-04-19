import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { User } from 'firebase/auth'
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  subscribeToAuth,
  updateUserProfile,
} from '../services/auth'
import type { UserProfile } from '../types'

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

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  register: (payload: RegisterPayload) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const nextProfile = await getUserProfile(user.uid)
    setProfile(nextProfile)
  }, [user])

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      setLoading(true)
      setUser(firebaseUser)
      if (firebaseUser) {
        const nextProfile = await getUserProfile(firebaseUser.uid)
        setProfile(nextProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      register: async (payload) => {
        await registerUser(payload)
      },
      login: async (email, password) => {
        await loginUser(email, password)
      },
      logout: async () => {
        await logoutUser()
      },
      refreshProfile,
      updateProfile: async (payload) => {
        if (!user) {
          throw new Error('No hay sesión activa.')
        }
        await updateUserProfile(user.uid, payload)
        await refreshProfile()
      },
    }),
    [loading, profile, refreshProfile, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
