import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, loading, checkingPermissions } = useAuth()
  const location = useLocation()

  if (loading || checkingPermissions) {
    return (
      <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-6">
        <div className="text-sm text-slate-500">Cargando sesion...</div>
      </div>
    )
  }

  if (!user) {
    console.log('[ProtectedRoute] redirigir a login: sesion no activa.')
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
