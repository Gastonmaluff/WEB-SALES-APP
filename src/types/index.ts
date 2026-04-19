export type UserRole = 'customer' | 'admin'

export type CouponType = 'percentage' | 'fixed'

export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en preparación'
  | 'enviado'
  | 'entregado'
  | 'cancelado'

export interface VariantOption {
  id: string
  value: string
  image?: string
  stock: number
  priceModifier?: number
}

export interface ProductVariant {
  id: string
  name: string
  options: VariantOption[]
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  category: string
  images: string[]
  basePrice: number
  stock?: number
  featured: boolean
  variants: ProductVariant[]
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  uid: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  reference: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  productName: string
  image: string
  category: string
  quantity: number
  selectedOptions: Record<string, string>
  selectedLabels: Record<string, string>
  unitPrice: number
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  startDate: string
  endDate: string
  totalUsageLimit: number
  perCustomerLimit: number
  minAmount: number
  usageCount: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CouponValidationResult {
  valid: boolean
  message: string
  discountAmount: number
  coupon?: Coupon
}

export interface OrderItem {
  productId: string
  productName: string
  image: string
  quantity: number
  unitPrice: number
  selectedOptions: Record<string, string>
  selectedLabels: Record<string, string>
  lineTotal: number
}

export interface Order {
  id: string
  userId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  reference: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  couponCode?: string
  total: number
  createdAt: string
  updatedAt: string
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  variantName?: string
  optionValue?: string
  quantityChange: number
  reason: 'sale' | 'manual_adjustment'
  orderId?: string
  actorId?: string
  createdAt: string
}

export interface DashboardMetrics {
  salesToday: number
  salesMonth: number
  totalOrders: number
  topProducts: Array<{ productName: string; quantity: number }>
}
