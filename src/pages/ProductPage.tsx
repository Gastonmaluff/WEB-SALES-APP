import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { VariantSelector } from '../components/product/VariantSelector'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useCartStore } from '../store/cartStore'
import { useUiStore } from '../store/uiStore'
import {
  buildCartItemFromProduct,
  getProductBySlug,
  resolveAvailableStock,
  resolveUnitPrice,
  resolveVariantImage,
} from '../services/products'
import type { Product } from '../types'
import { formatCurrency } from '../utils/format'

function getInitialSelection(product: Product) {
  const selected: Record<string, string> = {}
  product.variants.forEach((variant) => {
    const first = variant.options[0]
    if (first) {
      selected[variant.id] = first.id
    }
  })
  return selected
}

export function ProductPage() {
  const { slug = '' } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const addToast = useUiStore((state) => state.addToast)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const fetched = await getProductBySlug(slug)
      if (!active) {
        return
      }
      setProduct(fetched)
      setSelectedOptions(fetched ? getInitialSelection(fetched) : {})
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  const unitPrice = useMemo(
    () => (product ? resolveUnitPrice(product, selectedOptions) : 0),
    [product, selectedOptions],
  )

  const availableStock = useMemo(
    () => (product ? resolveAvailableStock(product, selectedOptions) : 0),
    [product, selectedOptions],
  )

  const displayImage = useMemo(
    () => (product ? resolveVariantImage(product, selectedOptions) : ''),
    [product, selectedOptions],
  )

  if (loading) {
    return (
      <MotionPage>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </MotionPage>
    )
  }

  if (!product) {
    return (
      <MotionPage>
        <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-slate-600">Producto no encontrado.</p>
          <Link className="mt-4 inline-flex text-sm font-semibold" to="/catalogo">
            Volver al catálogo
          </Link>
        </div>
      </MotionPage>
    )
  }

  const canAdd = quantity > 0 && quantity <= availableStock

  return (
    <MotionPage>
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          <div className="aspect-square bg-slate-100">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sin imagen
              </div>
            )}
          </div>
        </article>

        <article className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 md:p-7">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            {product.category}
          </p>
          <h1 className="font-title text-3xl text-slate-900">{product.name}</h1>
          <p className="text-slate-600">{product.description}</p>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Precio</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {formatCurrency(unitPrice)}
            </p>
          </div>

          {product.variants.length ? (
            <VariantSelector
              product={product}
              selectedOptions={selectedOptions}
              onSelect={(variantId, optionId) =>
                setSelectedOptions((previous) => ({
                  ...previous,
                  [variantId]: optionId,
                }))
              }
            />
          ) : null}

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-2">
              <button
                type="button"
                className="rounded-full p-2 text-slate-600 hover:bg-slate-200"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                className="rounded-full p-2 text-slate-600 hover:bg-slate-200"
                onClick={() =>
                  setQuantity((value) => Math.min(availableStock || 1, value + 1))
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Stock disponible: <strong>{availableStock}</strong>
            </p>
          </div>

          <Button
            disabled={!canAdd}
            fullWidth
            onClick={() => {
              const cartItem = buildCartItemFromProduct({
                product,
                selectedOptions,
                quantity,
              })
              addItem(cartItem)
              openCart()
              addToast({
                tone: 'success',
                title: 'Producto agregado al carrito',
                description: `${product.name} x${quantity}`,
              })
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar al carrito
          </Button>
        </article>
      </section>
    </MotionPage>
  )
}
