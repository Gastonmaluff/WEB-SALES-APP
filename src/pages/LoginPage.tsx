import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useUiStore } from '../store/uiStore'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from =
    typeof location.state === 'object' &&
    location.state &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : '/'

  const { login } = useAuth()
  const addToast = useUiStore((state) => state.addToast)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  return (
    <MotionPage>
      <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-7">
        <h1 className="font-title text-3xl text-slate-900">Ingresar</h1>
        <p className="mt-2 text-slate-600">
          Accedé para comprar, ver pedidos y gestionar tu cuenta.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            setSubmitting(true)
            try {
              await login(email, password)
              addToast({ tone: 'success', title: 'Sesión iniciada' })
              navigate(from)
            } catch (error) {
              addToast({
                tone: 'error',
                title: 'No se pudo ingresar',
                description:
                  error instanceof Error
                    ? error.message
                    : 'Verificá tus credenciales.',
              })
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button fullWidth disabled={submitting}>
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          ¿No tenés cuenta?{' '}
          <Link className="font-semibold text-slate-800" to="/registro">
            Registrate
          </Link>
        </p>
      </section>
    </MotionPage>
  )
}
