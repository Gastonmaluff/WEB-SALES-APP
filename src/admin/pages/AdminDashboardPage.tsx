import { useEffect, useState } from 'react'
import { getDashboardMetrics } from '../../services/admin'
import type { DashboardMetrics } from '../../types'
import { formatCurrency } from '../../utils/format'

const initialMetrics: DashboardMetrics = {
  salesToday: 0,
  salesMonth: 0,
  totalOrders: 0,
  topProducts: [],
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(initialMetrics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const response = await getDashboardMetrics()
      if (!active) {
        return
      }
      setMetrics(response)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Ventas del día</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.salesToday)}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Ventas del mes</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(metrics.salesMonth)}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Pedidos totales</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {metrics.totalOrders}
          </p>
        </article>
      </div>

      <article className="rounded-3xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Productos top</h2>
        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando métricas...</p>
          ) : metrics.topProducts.length ? (
            metrics.topProducts.map((product) => (
              <div
                key={product.productName}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span>{product.productName}</span>
                <strong>{product.quantity} uds</strong>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Aún no hay ventas para calcular ranking.
            </p>
          )}
        </div>
      </article>
    </section>
  )
}
