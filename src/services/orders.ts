import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
} from 'firebase/firestore'
import type {
  CartItem,
  CouponValidationResult,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  UserProfile,
  VariantOption,
} from '../types'
import { collections, db } from './firebase'
import { resolveUnitPrice } from './products'

interface CreateOrderInput {
  user: UserProfile
  items: CartItem[]
  couponValidation?: CouponValidationResult | null
}

function cloneProduct(product: Product): Product {
  return {
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      options: variant.options.map((option) => ({ ...option })),
    })),
  }
}

function decrementProductStock(
  product: Product,
  selectedOptions: Record<string, string>,
  quantity: number,
) {
  const updated = cloneProduct(product)
  let touchedOption: {
    variantName?: string
    option?: VariantOption
  } = {}

  if (typeof updated.stock === 'number') {
    if (updated.stock < quantity) {
      throw new Error('Stock insuficiente.')
    }
    updated.stock -= quantity
    return { updatedProduct: updated, touchedOption }
  }

  Object.entries(selectedOptions).forEach(([variantId, optionId]) => {
    const variant = updated.variants.find((item) => item.id === variantId)
    const option = variant?.options.find((item) => item.id === optionId)
    if (!variant || !option) {
      throw new Error('La variante seleccionada ya no existe.')
    }
    if (option.stock < quantity) {
      throw new Error(`Stock insuficiente para ${variant.name}: ${option.value}.`)
    }
    option.stock -= quantity
    touchedOption = { variantName: variant.name, option }
  })

  return { updatedProduct: updated, touchedOption }
}

function mapOrder(id: string, data: Record<string, unknown>): Order {
  return {
    id,
    userId: String(data.userId ?? ''),
    customerName: String(data.customerName ?? ''),
    customerEmail: String(data.customerEmail ?? ''),
    customerPhone: String(data.customerPhone ?? ''),
    address: String(data.address ?? ''),
    city: String(data.city ?? ''),
    reference: String(data.reference ?? ''),
    status: (data.status as OrderStatus) ?? 'pendiente',
    items: Array.isArray(data.items) ? (data.items as OrderItem[]) : [],
    subtotal: Number(data.subtotal ?? 0),
    discount: Number(data.discount ?? 0),
    couponCode:
      typeof data.couponCode === 'string' ? data.couponCode : undefined,
    total: Number(data.total ?? 0),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  }
}

export async function createOrder(input: CreateOrderInput) {
  if (!input.items.length) {
    throw new Error('No hay productos en el carrito.')
  }

  const orderReference = doc(collection(db, collections.orders))
  const now = new Date().toISOString()

  const createdOrder = await runTransaction(db, async (transaction) => {
    const normalizedItems: OrderItem[] = []
    let subtotal = 0

    for (const cartItem of input.items) {
      const productRef = doc(db, collections.products, cartItem.productId)
      const productSnapshot = await transaction.get(productRef)
      if (!productSnapshot.exists()) {
        throw new Error(
          `El producto ${cartItem.productName} ya no está disponible.`,
        )
      }

      const product = {
        id: productSnapshot.id,
        ...(productSnapshot.data() as Omit<Product, 'id'>),
      }

      const recalculatedPrice = resolveUnitPrice(product, cartItem.selectedOptions)
      const lineTotal = recalculatedPrice * cartItem.quantity
      subtotal += lineTotal

      const { updatedProduct, touchedOption } = decrementProductStock(
        product,
        cartItem.selectedOptions,
        cartItem.quantity,
      )

      transaction.update(productRef, {
        variants: updatedProduct.variants,
        stock:
          typeof updatedProduct.stock === 'number' ? updatedProduct.stock : null,
        updatedAt: now,
      })

      const movementReference = doc(collection(db, collections.stockMovements))
      transaction.set(movementReference, {
        productId: product.id,
        productName: product.name,
        variantName: touchedOption.variantName ?? null,
        optionValue: touchedOption.option?.value ?? null,
        quantityChange: -cartItem.quantity,
        reason: 'sale',
        orderId: orderReference.id,
        actorId: input.user.uid,
        createdAt: now,
      })

      normalizedItems.push({
        productId: product.id,
        productName: product.name,
        image: cartItem.image,
        quantity: cartItem.quantity,
        unitPrice: recalculatedPrice,
        selectedOptions: cartItem.selectedOptions,
        selectedLabels: cartItem.selectedLabels,
        lineTotal,
      })
    }

    let discount = 0
    let couponCode: string | undefined

    if (input.couponValidation?.valid && input.couponValidation.coupon) {
      const coupon = input.couponValidation.coupon
      const couponRef = doc(db, collections.coupons, coupon.id)
      const couponSnapshot = await transaction.get(couponRef)
      if (!couponSnapshot.exists()) {
        throw new Error('El cupón ya no está disponible.')
      }
      const couponData = couponSnapshot.data() as {
        usageCount?: number
        totalUsageLimit?: number
        active?: boolean
        endDate?: string
        startDate?: string
      }
      const usageCount = Number(couponData.usageCount ?? 0)
      const totalUsageLimit = Number(couponData.totalUsageLimit ?? 0)
      const active = Boolean(couponData.active)
      const startsAt = couponData.startDate ? new Date(couponData.startDate) : null
      const endsAt = couponData.endDate ? new Date(couponData.endDate) : null
      const nowDate = new Date()

      if (!active) {
        throw new Error('Este cupón ya no está activo.')
      }
      if (startsAt && nowDate < startsAt) {
        throw new Error('Este cupón aún no está habilitado.')
      }
      if (endsAt && nowDate > endsAt) {
        throw new Error('Este cupón está vencido.')
      }
      if (totalUsageLimit > 0 && usageCount >= totalUsageLimit) {
        throw new Error('Este cupón alcanzó su límite de uso.')
      }

      discount = Math.min(input.couponValidation.discountAmount, subtotal)
      couponCode = coupon.code
      const nextUsage = usageCount + 1

      transaction.update(couponRef, {
        usageCount: nextUsage,
        active: totalUsageLimit > 0 ? nextUsage < totalUsageLimit : active,
        updatedAt: now,
      })

      const couponUsageRef = doc(collection(db, collections.couponUsages))
      transaction.set(couponUsageRef, {
        couponId: coupon.id,
        code: coupon.code,
        userId: input.user.uid,
        orderId: orderReference.id,
        usedAt: now,
      })
    }

    const total = Math.max(0, subtotal - discount)
    const orderPayload: Omit<Order, 'id'> = {
      userId: input.user.uid,
      customerName: input.user.name,
      customerEmail: input.user.email,
      customerPhone: input.user.phone,
      address: input.user.address,
      city: input.user.city,
      reference: input.user.reference,
      status: 'pendiente',
      items: normalizedItems,
      subtotal,
      discount,
      couponCode,
      total,
      createdAt: now,
      updatedAt: now,
    }

    transaction.set(orderReference, orderPayload)

    return {
      id: orderReference.id,
      ...orderPayload,
    }
  })

  return createdOrder
}

export async function getOrderById(orderId: string) {
  const snapshot = await getDoc(doc(db, collections.orders, orderId))
  if (!snapshot.exists()) {
    return null
  }
  return mapOrder(snapshot.id, snapshot.data())
}

export async function listOrdersByUser(userId: string) {
  const ordersQuery = query(
    collection(db, collections.orders),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(ordersQuery)
  return snapshot.docs.map((item) => mapOrder(item.id, item.data()))
}

export async function listOrders() {
  const ordersQuery = query(
    collection(db, collections.orders),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(ordersQuery)
  return snapshot.docs.map((item) => mapOrder(item.id, item.data()))
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, collections.orders, orderId), {
    status,
    updatedAt: new Date().toISOString(),
  })
}
