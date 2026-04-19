import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { listCoupons, upsertCoupon } from '../../services/coupons'
import { useUiStore } from '../../store/uiStore'
import type { Coupon } from '../../types'
import { formatDate } from '../../utils/format'

interface CouponForm {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  startDate: string
  endDate: string
  totalUsageLimit: number
  perCustomerLimit: number
  minAmount: number
  active: boolean
}

function getInitialForm(): CouponForm {
  const today = new Date()
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return {
    code: '',
    type: 'percentage',
    value: 10,
    startDate: today.toISOString().slice(0, 10),
    endDate: nextMonth.toISOString().slice(0, 10),
    totalUsageLimit: 100,
    perCustomerLimit: 1,
    minAmount: 0,
    active: true,
  }
}

function resolveCouponState(coupon: Coupon) {
  const now = new Date()
  if (now > new Date(coupon.endDate)) {
    return 'vencido'
  }
  if (coupon.totalUsageLimit > 0 && coupon.usageCount >= coupon.totalUsageLimit) {
    return 'agotado'
  }
  return coupon.active ? 'activo' : 'inactivo'
}

export function AdminCouponsPage() {
  const addToast = useUiStore((state) => state.addToast)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState<CouponForm>(getInitialForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const refresh = async () => {
    setLoading(true)
    const response = await listCoupons()
    setCoupons(response)
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [])

  const statusTone = useMemo(
    () => ({
      activo: 'bg-emerald-100 text-emerald-800',
      inactivo: 'bg-slate-100 text-slate-700',
      agotado: 'bg-amber-100 text-amber-800',
      vencido: 'bg-rose-100 text-rose-800',
    }),
    [],
  )

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Cupones</h1>
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Crear cupón</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Código"
            value={form.code}
            onChange={(event) =>
              setForm({ ...form, code: event.target.value.toUpperCase() })
            }
          />
          <Select
            label="Tipo"
            value={form.type}
            onChange={(event) =>
              setForm({ ...form, type: event.target.value as CouponForm['type'] })
            }
            options={[
              { value: 'percentage', label: 'Porcentaje' },
              { value: 'fixed', label: 'Monto fijo' },
            ]}
          />
          <Input
            label="Valor"
            type="number"
            value={String(form.value)}
            onChange={(event) =>
              setForm({ ...form, value: Number(event.target.value) || 0 })
            }
          />
          <Input
            label="Monto mínimo"
            type="number"
            value={String(form.minAmount)}
            onChange={(event) =>
              setForm({ ...form, minAmount: Number(event.target.value) || 0 })
            }
          />
          <Input
            label="Fecha inicio"
            type="date"
            value={form.startDate}
            onChange={(event) =>
              setForm({ ...form, startDate: event.target.value })
            }
          />
          <Input
            label="Fecha fin"
            type="date"
            value={form.endDate}
            onChange={(event) => setForm({ ...form, endDate: event.target.value })}
          />
          <Input
            label="Límite total de usos"
            type="number"
            value={String(form.totalUsageLimit)}
            onChange={(event) =>
              setForm({
                ...form,
                totalUsageLimit: Number(event.target.value) || 0,
              })
            }
          />
          <Input
            label="Límite por cliente"
            type="number"
            value={String(form.perCustomerLimit)}
            onChange={(event) =>
              setForm({
                ...form,
                perCustomerLimit: Number(event.target.value) || 0,
              })
            }
          />
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm({ ...form, active: event.target.checked })}
          />
          Activo
        </label>

        <Button
          className="mt-4"
          disabled={saving}
          onClick={async () => {
            if (!form.code.trim()) {
              addToast({
                tone: 'error',
                title: 'Ingresá un código',
              })
              return
            }
            setSaving(true)
            try {
              await upsertCoupon(form)
              setForm(getInitialForm())
              await refresh()
              addToast({
                tone: 'success',
                title: 'Cupón guardado',
              })
            } finally {
              setSaving(false)
            }
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cupón'}
        </Button>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Historial de cupones</h2>
        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando cupones...</p>
          ) : coupons.length ? (
            coupons.map((coupon) => {
              const state = resolveCouponState(coupon)
              return (
                <div
                  key={coupon.id}
                  className="space-y-2 rounded-2xl border border-slate-100 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{coupon.code}</p>
                      <p className="text-sm text-slate-500">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%`
                          : `${coupon.value} fijo`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[state]}`}
                    >
                      {state}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Usos: {coupon.usageCount}</span>
                    <span>Límite total: {coupon.totalUsageLimit}</span>
                    <span>Límite cliente: {coupon.perCustomerLimit}</span>
                    <span>Inicio: {formatDate(coupon.startDate)}</span>
                    <span>Fin: {formatDate(coupon.endDate)}</span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-slate-500">Aún no hay cupones.</p>
          )}
        </div>
      </article>
    </section>
  )
}
