import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useUiStore } from '../store/uiStore'

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const addToast = useUiStore((state) => state.addToast)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    city: '',
    reference: '',
  })
  const [submitting, setSubmitting] = useState(false)

  return (
    <MotionPage>
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-7">
        <h1 className="font-title text-3xl text-slate-900">Crear cuenta</h1>
        <p className="mt-2 text-slate-600">Registro obligatorio para comprar.</p>

        <form
          className="mt-6 grid gap-3 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault()
            setSubmitting(true)
            try {
              await register(form)
              addToast({
                tone: 'success',
                title: 'Cuenta creada',
                description: 'Ya podés iniciar sesión.',
              })
              navigate('/login')
            } catch (error) {
              addToast({
                tone: 'error',
                title: 'No se pudo crear la cuenta',
                description:
                  error instanceof Error ? error.message : 'Intentá nuevamente.',
              })
            } finally {
              setSubmitting(false)
            }
          }}
        >
          <Input
            label="Nombre"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <Input
            label="Teléfono"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
            minLength={6}
          />
          <div className="sm:col-span-2">
            <Input
              label="Dirección"
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
              required
            />
          </div>
          <Input
            label="Ciudad"
            value={form.city}
            onChange={(event) => setForm({ ...form, city: event.target.value })}
            required
          />
          <Input
            label="Referencia"
            value={form.reference}
            onChange={(event) =>
              setForm({ ...form, reference: event.target.value })
            }
            required
          />
          <div className="sm:col-span-2">
            <Button fullWidth disabled={submitting}>
              {submitting ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link className="font-semibold text-slate-800" to="/login">
            Ingresá aquí
          </Link>
        </p>
      </section>
    </MotionPage>
  )
}
