import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useCartStore } from '../store/cartStore'
import { formatCurrency } from '../utils/format'

export function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const coupon = useCartStore((state) => state.coupon)
  const subtotal = useCartStore((state) => state.subtotal())

  const discount = coupon?.valid ? coupon.discountAmount : 0
  const total = Math.max(0, subtotal - discount)

  if (!items.length) {
    return (
      <MotionPage>
        <section className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
          <h1 className="font-title text-3xl text-slate-900">Tu carrito está vacío</h1>
          <p className="mt-2 text-slate-600">
            Agregá productos desde el catálogo para comenzar.
          </p>
          <Link to="/catalogo">
            <Button className="mt-5">Ir al catálogo</Button>
          </Link>
        </section>
      </MotionPage>
    )
  }

  return (
    <MotionPage>
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="space-y-4">
          <h1 className="font-title text-3xl text-slate-900">Carrito</h1>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-[96px_1fr]"
            >
              <div className="aspect-square overflow-hidden rounded-xl bg-slate-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs tracking-wide text-slate-500 uppercase">
                      {item.category}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {item.productName}
                    </h2>
                    {Object.keys(item.selectedLabels).length ? (
                      <p className="text-sm text-slate-500">
                        {Object.entries(item.selectedLabels)
                          .map(([name, value]) => `${name}: ${value}`)
                          .join(' | ')}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      className="rounded-full p-2 text-slate-600 hover:bg-slate-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="rounded-full p-2 text-slate-600 hover:bg-slate-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Resumen</h2>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button
            fullWidth
            className="mt-5"
            onClick={() => (user ? navigate('/checkout') : navigate('/login'))}
          >
            Continuar al checkout
          </Button>
        </aside>
      </section>
    </MotionPage>
  )
}
