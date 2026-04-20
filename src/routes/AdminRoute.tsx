import { useEffect } from 'react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'

export function AdminRoute() {
  const {
    loading,
    checkingPermissions,
    user,
    isAdmin,
    adminAccessReason,
    authError,
    refreshProfile,
  } = useAuth()

  useEffect(() => {
    console.log('[AdminRoute] estado auth:', {
      loading,
      checkingPermissions,
      hasUser: Boolean(user),
      isAdmin,
      adminAccessReason,
      authError,
    })
  }, [adminAccessReason, authError, checkingPermissions, isAdmin, loading, user])

  if (loading || checkingPermissions) {
    return (
      <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-6">
        <div className="text-sm text-slate-500">Validando permisos...</div>
      </div>
    )
  }

  if (!user) {
    console.log('[AdminRoute] redirigir a login: usuario no autenticado.')
    return <Navigate to="/login" replace state={{ reason: 'unauthenticated' }} />
  }

  if (!isAdmin) {
    console.log(
      '[AdminRoute] acceso denegado:',
      adminAccessReason || 'Usuario sin rol admin.',
    )
    return (
      <section className="mx-auto mt-8 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs tracking-wide text-slate-500 uppercase">Acceso restringido</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          No tienes permisos para acceder a este panel
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {adminAccessReason || 'Tu cuenta no posee rol administrador.'}
        </p>
        {authError ? (
          <p className="mt-2 text-xs text-rose-600">Detalle: {authError}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {user ? (
            <Button variant="secondary" onClick={() => void refreshProfile()}>
              Reintentar validacion
            </Button>
          ) : null}
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </section>
    )
  }

  return <Outlet />
}
