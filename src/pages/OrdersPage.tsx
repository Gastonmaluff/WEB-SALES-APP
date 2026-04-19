import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { listOrdersByUser } from '../services/orders'
import type { Order } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import { generateOrderReceiptPdf } from '../utils/pdf'

export function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      return
    }
    let active = true
    const load = async () => {
      setLoading(true)
      const response = await listOrdersByUser(user.uid)
      if (!active) {
        return
      }
      setOrders(response)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [user])

  return (
    <MotionPage>
      <section className="space-y-4">
        <h1 className="font-title text-3xl text-slate-900">Mis pedidos</h1>
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Cargando historial...
          </div>
        ) : !orders.length ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Aún no registrás compras.
          </div>
        ) : (
          orders.map((order) => (
            <article
              key={order.id}
              className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Pedido #{order.id}</p>
                  <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                {order.items.map((item) => (
                  <p key={`${order.id}-${item.productId}-${item.image}`}>
                    {item.productName} x{item.quantity}
                  </p>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                <p className="text-lg font-bold text-slate-900">
                  Total {formatCurrency(order.total)}
                </p>
                <Button variant="ghost" onClick={() => generateOrderReceiptPdf(order)}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </article>
          ))
        )}
      </section>
    </MotionPage>
  )
}
