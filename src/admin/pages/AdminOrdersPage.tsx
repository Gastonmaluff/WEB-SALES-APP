import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { listOrders, updateOrderStatus } from '../../services/orders'
import { useUiStore } from '../../store/uiStore'
import type { Order, OrderStatus } from '../../types'
import { ORDER_STATUSES } from '../../utils/constants'
import { formatCurrency, formatDate } from '../../utils/format'
import { generateOrderReceiptPdf, generatePreparationOrderPdf } from '../../utils/pdf'

export function AdminOrdersPage() {
  const addToast = useUiStore((state) => state.addToast)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const response = await listOrders()
    setOrders(response)
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Pedidos</h1>
      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando pedidos...</p>
        ) : !orders.length ? (
          <p className="text-sm text-slate-500">No hay pedidos cargados.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="space-y-3 rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wide text-slate-500 uppercase">
                      Pedido #{order.id}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {order.customerName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatDate(order.createdAt)} · {order.customerPhone}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="space-y-1 text-sm text-slate-600">
                  {order.items.map((item) => (
                    <p key={`${order.id}-${item.productId}-${item.productName}`}>
                      {item.productName} x{item.quantity}
                    </p>
                  ))}
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                  <Select
                    label="Estado"
                    value={order.status}
                    onChange={async (event) => {
                      const nextStatus = event.target.value as OrderStatus
                      await updateOrderStatus(order.id, nextStatus)
                      await refresh()
                      addToast({
                        tone: 'success',
                        title: 'Estado actualizado',
                      })
                    }}
                    options={ORDER_STATUSES.map((status) => ({
                      value: status,
                      label: status,
                    }))}
                  />
                  <Button
                    variant="ghost"
                    className="self-end"
                    onClick={() => generateOrderReceiptPdf(order)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Comprobante
                  </Button>
                  <Button
                    variant="secondary"
                    className="self-end"
                    onClick={() => generatePreparationOrderPdf(order)}
                  >
                    Preparación
                  </Button>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="text-slate-500">
                    {order.address}, {order.city}
                  </span>
                  <strong className="text-slate-900">
                    {formatCurrency(order.total)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}
