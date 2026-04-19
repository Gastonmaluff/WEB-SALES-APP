import { Loader2, TicketPercent } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'
import { validateCoupon } from '../services/coupons'
import { createOrder } from '../services/orders'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import type { Order } from '../types'
import { formatCurrency } from '../utils/format'
import { generateOrderReceiptPdf, generatePreparationOrderPdf } from '../utils/pdf'

export function CheckoutPage() {
  const { profile } = useAuth()
  const addToast = useUiStore((state) => state.addToast)
  const items = useCartStore((state) => state.items)
  const subtotal = useCartStore((state) => state.subtotal())
  const cartCoupon = useCartStore((state) => state.coupon)
  const setCoupon = useCartStore((state) => state.setCoupon)
  const clearCart = useCartStore((state) => state.clearCart)
  const [couponCode, setCouponCode] = useState(cartCoupon?.coupon?.code ?? '')
  const [couponMessage, setCouponMessage] = useState(cartCoupon?.message ?? '')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)

  const discount = useMemo(
    () => (cartCoupon?.valid ? cartCoupon.discountAmount : 0),
    [cartCoupon],
  )
  const total = Math.max(0, subtotal - discount)

  if (!profile) {
    return (
      <MotionPage>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Necesitás iniciar sesión para comprar.</p>
          <Link to="/login">
            <Button className="mt-4">Ir a login</Button>
          </Link>
        </div>
      </MotionPage>
    )
  }

  if (!items.length && !createdOrder) {
    return (
      <MotionPage>
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No hay productos en el carrito.</p>
          <Link to="/catalogo">
            <Button className="mt-4">Ir al catálogo</Button>
          </Link>
        </div>
      </MotionPage>
    )
  }

  if (createdOrder) {
    return (
      <MotionPage>
        <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            Pedido confirmado
          </p>
          <h1 className="font-title mt-2 text-3xl text-slate-900">
            Gracias por tu compra
          </h1>
          <p className="mt-3 text-slate-600">
            Tu pedido <strong>{createdOrder.id}</strong> fue registrado
            correctamente.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => generateOrderReceiptPdf(createdOrder)}>
              Descargar comprobante
            </Button>
            <Button
              variant="ghost"
              onClick={() => generatePreparationOrderPdf(createdOrder)}
            >
              Orden de preparación
            </Button>
            <Link to="/mi-pedidos">
              <Button variant="secondary">Ver mis pedidos</Button>
            </Link>
          </div>
        </section>
      </MotionPage>
    )
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCoupon(null)
      setCouponMessage('Ingresá un código para validar.')
      return
    }
    setValidatingCoupon(true)
    try {
      const validation = await validateCoupon({
        code: couponCode,
        subtotal,
        userId: profile.uid,
      })
      setCoupon(validation)
      setCouponMessage(validation.message)
      addToast({
        tone: validation.valid ? 'success' : 'error',
        title: validation.valid ? 'Cupón aplicado' : 'Cupón inválido',
        description: validation.message,
      })
    } finally {
      setValidatingCoupon(false)
    }
  }

  const placeOrder = async () => {
    setSubmitting(true)
    try {
      const order = await createOrder({
        user: profile,
        items,
        couponValidation: cartCoupon,
      })
      setCreatedOrder(order)
      clearCart()
      setCoupon(null)
      addToast({
        tone: 'success',
        title: 'Pedido generado',
        description: `ID ${order.id}`,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo generar el pedido.'
      addToast({ tone: 'error', title: 'Error en checkout', description: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MotionPage>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
          <h1 className="font-title text-3xl text-slate-900">Checkout</h1>
          <p className="text-sm text-slate-600">
            Revisá tus datos y confirmá el pedido.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Nombre" value={profile.name} disabled />
            <Input label="Teléfono" value={profile.phone} disabled />
            <Input label="Email" value={profile.email} disabled />
            <Input label="Ciudad" value={profile.city} disabled />
          </div>
          <Input label="Dirección" value={profile.address} disabled />
          <Input label="Referencia" value={profile.reference} disabled />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-end gap-2">
              <Input
                label="Cupón promocional"
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Ej: SALE20"
              />
              <Button onClick={applyCoupon} disabled={validatingCoupon}>
                {validatingCoupon ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TicketPercent className="h-4 w-4" />
                )}
                <span className="ml-2">Aplicar</span>
              </Button>
            </div>
            {couponMessage ? (
              <p
                className={`mt-2 text-xs ${
                  cartCoupon?.valid ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {couponMessage}
              </p>
            ) : null}
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Resumen final</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span className="line-clamp-1">
                  {item.productName} x{item.quantity}
                </span>
                <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button
            fullWidth
            className="mt-5"
            onClick={placeOrder}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar pedido'
            )}
          </Button>
        </aside>
      </section>
    </MotionPage>
  )
}
