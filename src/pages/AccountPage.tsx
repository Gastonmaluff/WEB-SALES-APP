import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { useUiStore } from '../store/uiStore'

export function AccountPage() {
  const { profile, updateProfile, refreshProfile } = useAuth()
  const addToast = useUiStore((state) => state.addToast)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    reference: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) {
      return
    }
    setForm({
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      reference: profile.reference,
    })
  }, [profile])

  if (!profile) {
    return null
  }

  return (
    <MotionPage>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6">
          <h1 className="font-title text-3xl text-slate-900">Mi cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">
            Editá tus datos para agilizar checkout y envíos.
          </p>
          <form
            className="mt-6 grid gap-3 sm:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault()
              setSaving(true)
              try {
                await updateProfile(form)
                await refreshProfile()
                addToast({
                  tone: 'success',
                  title: 'Perfil actualizado',
                })
              } catch (error) {
                addToast({
                  tone: 'error',
                  title: 'No se pudo actualizar',
                  description:
                    error instanceof Error ? error.message : 'Intentá nuevamente.',
                })
              } finally {
                setSaving(false)
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
              <Button fullWidth disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
          <div className="mt-4 space-y-2">
            <Link to="/mi-pedidos">
              <Button variant="ghost" fullWidth>
                Ver mis pedidos
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button variant="secondary" fullWidth>
                Seguir comprando
              </Button>
            </Link>
          </div>
        </aside>
      </section>
    </MotionPage>
  )
}
