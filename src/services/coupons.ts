import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { Coupon, CouponValidationResult } from '../types'
import { collections, db } from './firebase'

export interface UpsertCouponPayload {
  id?: string
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

interface CouponValidationInput {
  code: string
  subtotal: number
  userId: string
}

function mapCoupon(id: string, data: Record<string, unknown>): Coupon {
  return {
    id,
    code: String(data.code ?? ''),
    type: (data.type as Coupon['type']) ?? 'percentage',
    value: Number(data.value ?? 0),
    startDate: String(data.startDate ?? ''),
    endDate: String(data.endDate ?? ''),
    totalUsageLimit: Number(data.totalUsageLimit ?? 0),
    perCustomerLimit: Number(data.perCustomerLimit ?? 1),
    minAmount: Number(data.minAmount ?? 0),
    usageCount: Number(data.usageCount ?? 0),
    active: Boolean(data.active),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  }
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase()
}

export async function listCoupons() {
  const snapshot = await getDocs(collection(db, collections.coupons))
  const coupons = snapshot.docs.map((item) => mapCoupon(item.id, item.data()))
  coupons.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )
  return coupons
}

export async function getCouponById(couponId: string) {
  const snapshot = await getDoc(doc(db, collections.coupons, couponId))
  if (!snapshot.exists()) {
    return null
  }

  return mapCoupon(snapshot.id, snapshot.data())
}

export async function getCouponByCode(code: string) {
  const normalized = normalizeCouponCode(code)
  const couponsQuery = query(
    collection(db, collections.coupons),
    where('code', '==', normalized),
  )
  const snapshot = await getDocs(couponsQuery)
  if (!snapshot.docs.length) {
    return null
  }

  return mapCoupon(snapshot.docs[0].id, snapshot.docs[0].data())
}

export async function upsertCoupon(payload: UpsertCouponPayload) {
  const now = new Date().toISOString()
  const normalizedCode = normalizeCouponCode(payload.code)
  const body = {
    code: normalizedCode,
    type: payload.type,
    value: Number(payload.value),
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalUsageLimit: Number(payload.totalUsageLimit),
    perCustomerLimit: Number(payload.perCustomerLimit),
    minAmount: Number(payload.minAmount),
    active: payload.active,
    updatedAt: now,
  }

  if (payload.id) {
    await updateDoc(doc(db, collections.coupons, payload.id), body)
    return payload.id
  }

  const reference = await addDoc(collection(db, collections.coupons), {
    ...body,
    usageCount: 0,
    createdAt: now,
  })
  return reference.id
}

export async function validateCoupon(
  input: CouponValidationInput,
): Promise<CouponValidationResult> {
  const empty: CouponValidationResult = {
    valid: false,
    message: 'Cupón inválido.',
    discountAmount: 0,
  }

  const coupon = await getCouponByCode(input.code)
  if (!coupon) {
    return empty
  }

  const now = new Date()
  const start = new Date(coupon.startDate)
  const end = new Date(coupon.endDate)

  if (!coupon.active) {
    return { ...empty, message: 'Este cupón no está activo.' }
  }

  if (now < start) {
    return { ...empty, message: 'Este cupón todavía no está habilitado.' }
  }

  if (now > end) {
    return { ...empty, message: 'Este cupón está vencido.' }
  }

  if (coupon.totalUsageLimit > 0 && coupon.usageCount >= coupon.totalUsageLimit) {
    return { ...empty, message: 'Este cupón está agotado.' }
  }

  if (input.subtotal < coupon.minAmount) {
    return {
      ...empty,
      message: `Monto mínimo requerido: ${coupon.minAmount}.`,
    }
  }

  const usageQuery = query(
    collection(db, collections.couponUsages),
    where('couponId', '==', coupon.id),
  )
  const usageSnapshot = await getDocs(usageQuery)
  const customerUsages = usageSnapshot.docs.filter(
    (document) => document.data().userId === input.userId,
  ).length

  if (coupon.perCustomerLimit > 0 && customerUsages >= coupon.perCustomerLimit) {
    return { ...empty, message: 'Ya alcanzaste el límite de uso de este cupón.' }
  }

  const discountAmount =
    coupon.type === 'percentage'
      ? Math.round((input.subtotal * coupon.value) / 100)
      : coupon.value

  return {
    valid: true,
    message: 'Cupón aplicado correctamente.',
    discountAmount: Math.min(discountAmount, input.subtotal),
    coupon,
  }
}
