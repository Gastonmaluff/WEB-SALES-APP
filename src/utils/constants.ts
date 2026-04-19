import type { OrderStatus } from '../types'

export const ORDER_STATUSES: OrderStatus[] = [
  'pendiente',
  'confirmado',
  'en preparación',
  'enviado',
  'entregado',
  'cancelado',
]

export const PRODUCT_SORT_OPTIONS = [
  { value: 'latest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
  { value: 'name_asc', label: 'Nombre A-Z' },
] as const

export const DEFAULT_CATEGORIES = [
  'Indumentaria',
  'Calzado',
  'Accesorios',
  'Ofertas',
]

export const WHATSAPP_TEMPLATE_MESSAGE =
  'Hola, quisiera asistencia con mi pedido en la tienda.'
