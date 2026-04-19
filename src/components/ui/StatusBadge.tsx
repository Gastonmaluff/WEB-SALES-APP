import type { OrderStatus } from '../../types'
import { cn } from '../../utils/format'

const statusColor: Record<OrderStatus, string> = {
  pendiente: 'bg-amber-100 text-amber-800',
  confirmado: 'bg-sky-100 text-sky-800',
  'en preparación': 'bg-indigo-100 text-indigo-800',
  enviado: 'bg-purple-100 text-purple-800',
  entregado: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-rose-100 text-rose-800',
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize',
        statusColor[status],
      )}
    >
      {status}
    </span>
  )
}
