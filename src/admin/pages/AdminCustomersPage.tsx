import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { listCustomers, updateCustomerProfile } from '../../services/admin'
import { useUiStore } from '../../store/uiStore'
import { formatCurrency, formatDate } from '../../utils/format'

interface CustomerRow {
  user: {
    uid: string
    name: string
    phone: string
    email: string
    address: string
    city: string
    reference: string
  }
  totalOrders: number
  totalSpent: number
  lastOrderDate: string
}

export function AdminCustomersPage() {
  const addToast = useUiStore((state) => state.addToast)
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    reference: '',
  })

  const refresh = async () => {
    setLoading(true)
    const rows = await listCustomers()
    setCustomers(rows as CustomerRow[])
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Clientes</h1>
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando clientes...</p>
        ) : !customers.length ? (
          <p className="text-sm text-slate-500">No hay clientes registrados.</p>
        ) : (
          <div className="space-y-3">
            {customers.map((row) => (
              <div
                key={row.user.uid}
                className="space-y-3 rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{row.user.name}</p>
                    <p className="text-sm text-slate-500">{row.user.email}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-slate-500">{row.totalOrders} pedidos</p>
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(row.totalSpent)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Última compra: {formatDate(row.lastOrderDate)}
                </p>

                {editingId === row.user.uid ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      label="Nombre"
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                    <Input
                      label="Teléfono"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                    />
                    <Input
                      label="Ciudad"
                      value={form.city}
                      onChange={(event) =>
                        setForm({ ...form, city: event.target.value })
                      }
                    />
                    <Input
                      label="Referencia"
                      value={form.reference}
                      onChange={(event) =>
                        setForm({ ...form, reference: event.target.value })
                      }
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Dirección"
                        value={form.address}
                        onChange={(event) =>
                          setForm({ ...form, address: event.target.value })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <Button
                        onClick={async () => {
                          await updateCustomerProfile(row.user.uid, form)
                          setEditingId(null)
                          await refresh()
                          addToast({
                            tone: 'success',
                            title: 'Cliente actualizado',
                          })
                        }}
                      >
                        Guardar
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingId(row.user.uid)
                      setForm({
                        name: row.user.name,
                        phone: row.user.phone,
                        address: row.user.address,
                        city: row.user.city,
                        reference: row.user.reference,
                      })
                    }}
                  >
                    Editar datos
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
