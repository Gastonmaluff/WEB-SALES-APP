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
  checkingPermissions: boolean
  isAdmin: boolean
  adminAccessReason: string | null
  authError: string | null
  register: (payload: RegisterPayload) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 12000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Tiempo de espera agotado (${timeoutMs}ms).`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingPermissions, setCheckingPermissions] = useState(true)
  const [adminAccessReason, setAdminAccessReason] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setAdminAccessReason('Sesion no autenticada.')
      return
    }

    try {
      const nextProfile = await withTimeout(getUserProfile(user.uid))
      setProfile(nextProfile)

      if (!nextProfile) {
        console.log(
          '[Auth] refreshProfile: documento de usuario no encontrado',
          user.uid,
        )
        setAdminAccessReason('No se encontro el perfil del usuario.')
        return
      }

      console.log('[Auth] refreshProfile: rol detectado ->', nextProfile.role)
      setAdminAccessReason(
        nextProfile.role === 'admin'
          ? null
          : 'No tienes permisos para acceder al panel admin.',
      )
    } catch (error) {
      console.error('[Auth] refreshProfile error:', error)
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Error inesperado al actualizar el perfil.',
      )
      setAdminAccessReason('Error validando permisos.')
    }
  }, [user])

  useEffect(() => {
    let isMounted = true
    let requestId = 0
    let authResolved = false

    setLoading(true)
    setCheckingPermissions(true)
    setAuthError(null)

    const authWatchdog = setTimeout(() => {
      if (!isMounted || authResolved) {
        return
      }
      console.error(
        '[Auth] timeout esperando respuesta de onAuthStateChanged. Cerrando loading por seguridad.',
      )
      setAuthError('No se pudo validar la sesion a tiempo.')
      setAdminAccessReason('Error al validar permisos de acceso.')
      setCheckingPermissions(false)
      setLoading(false)
    }, 15000)

    const unsubscribe = subscribeToAuth(
      async (firebaseUser) => {
        authResolved = true
        clearTimeout(authWatchdog)

        const currentRequestId = ++requestId
        if (!isMounted) {
          return
        }

        console.log(
          '[Auth] onAuthStateChanged user detectado:',
          firebaseUser ? firebaseUser.email : null,
        )

        setLoading(true)
        setCheckingPermissions(true)
        setAuthError(null)
        setUser(firebaseUser)

        if (!firebaseUser) {
          console.log('[Auth] sin sesion activa. Bloqueo admin por autenticacion.')
          if (isMounted && currentRequestId === requestId) {
            setProfile(null)
            setAdminAccessReason('Sesion no autenticada.')
            setCheckingPermissions(false)
            setLoading(false)
          }
          return
        }

        console.log('[Auth] uid detectado:', firebaseUser.uid)

        try {
          const nextProfile = await withTimeout(getUserProfile(firebaseUser.uid))
          if (!isMounted || currentRequestId !== requestId) {
            return
          }

          if (!nextProfile) {
            console.log(
              '[Auth] documento no encontrado en Firestore para uid:',
              firebaseUser.uid,
            )
            setProfile(null)
            setAdminAccessReason('No se encontro el perfil del usuario.')
            return
          }

          console.log('[Auth] documento encontrado para uid:', firebaseUser.uid)
          console.log('[Auth] rol detectado:', nextProfile.role)

          setProfile(nextProfile)

          if (nextProfile.role === 'admin') {
            setAdminAccessReason(null)
            console.log('[Auth] acceso admin concedido.')
          } else {
            setAdminAccessReason('No tienes permisos para acceder al panel admin.')
            console.log(
              '[Auth] acceso admin bloqueado: rol no autorizado ->',
              nextProfile.role,
            )
          }
        } catch (error) {
          console.error('[Auth] error al validar auth/permisos:', error)
          if (!isMounted || currentRequestId !== requestId) {
            return
          }
          setProfile(null)
          setAuthError(
            error instanceof Error
              ? error.message
              : 'No se pudo validar la sesion.',
          )
          setAdminAccessReason('Error al validar permisos de acceso.')
        } finally {
          if (isMounted && currentRequestId === requestId) {
            setCheckingPermissions(false)
            setLoading(false)
          }
        }
      },
      (error) => {
        authResolved = true
        clearTimeout(authWatchdog)

        console.error('[Auth] error en onAuthStateChanged:', error)
        if (!isMounted) {
          return
        }
        setUser(null)
        setProfile(null)
        setAuthError(error.message || 'Error del listener de autenticacion.')
        setAdminAccessReason('No se pudo validar la sesion.')
        setCheckingPermissions(false)
        setLoading(false)
      },
    )

    return () => {
      isMounted = false
      clearTimeout(authWatchdog)
      unsubscribe()
      console.log('[Auth] cleanup listener de autenticacion ejecutado.')
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      checkingPermissions,
      isAdmin: profile?.role === 'admin',
      adminAccessReason,
      authError,
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
          throw new Error('No hay sesion activa.')
        }
        await updateUserProfile(user.uid, payload)
        await refreshProfile()
      },
    }),
    [
      adminAccessReason,
      authError,
      checkingPermissions,
      loading,
      profile,
      refreshProfile,
      user,
    ],
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
