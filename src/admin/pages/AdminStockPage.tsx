import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { listStockMovements } from '../../services/admin'
import { adjustVariantOptionStock, listProducts } from '../../services/products'
import { useUiStore } from '../../store/uiStore'
import type { Product, StockMovement } from '../../types'
import { formatDate } from '../../utils/format'

function stockKey(productId: string, variantId: string, optionId: string) {
  return `${productId}|${variantId}|${optionId}`
}

export function AdminStockPage() {
  const { user } = useAuth()
  const addToast = useUiStore((state) => state.addToast)
  const [products, setProducts] = useState<Product[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    const [productsData, movementsData] = await Promise.all([
      listProducts({ sort: 'latest' }),
      listStockMovements(50),
    ])
    setProducts(productsData)
    setMovements(movementsData)
    setLoading(false)
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false))
  }, [])

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Stock</h1>

      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Stock por variante</h2>
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Cargando stock...</p>
        ) : (
          <div className="mt-4 space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="space-y-2 rounded-2xl border border-slate-100 p-3"
              >
                <p className="font-semibold text-slate-900">{product.name}</p>
                {product.variants.length ? (
                  product.variants.map((variant) => (
                    <div key={variant.id} className="space-y-1">
                      <p className="text-xs tracking-wide text-slate-500 uppercase">
                        {variant.name}
                      </p>
                      {variant.options.map((option) => {
                        const key = stockKey(product.id, variant.id, option.id)
                        return (
                          <div
                            key={option.id}
                            className="grid gap-2 rounded-xl bg-slate-50 p-2 sm:grid-cols-[1fr_100px_110px]"
                          >
                            <p className="self-center text-sm text-slate-700">
                              {option.value}
                            </p>
                            <input
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
                              type="number"
                              value={drafts[key] ?? String(option.stock)}
                              onChange={(event) =>
                                setDrafts((previous) => ({
                                  ...previous,
                                  [key]: event.target.value,
                                }))
                              }
                            />
                            <Button
                              variant="ghost"
                              onClick={async () => {
                                const rawValue = drafts[key] ?? String(option.stock)
                                const nextStock = Number(rawValue)
                                if (Number.isNaN(nextStock)) {
                                  return
                                }
                                try {
                                  await adjustVariantOptionStock({
                                    productId: product.id,
                                    variantId: variant.id,
                                    optionId: option.id,
                                    nextStock,
                                    actorId: user?.uid,
                                  })
                                  await refresh()
                                  addToast({
                                    tone: 'success',
                                    title: 'Stock actualizado',
                                  })
                                } catch (error) {
                                  addToast({
                                    tone: 'error',
                                    title: 'No se pudo actualizar',
                                    description:
                                      error instanceof Error
                                        ? error.message
                                        : 'Reintentá.',
                                  })
                                }
                              }}
                            >
                              Guardar
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Este producto no usa variantes.
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Historial de movimientos
        </h2>
        <div className="mt-4 space-y-2">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-slate-800">{movement.productName}</p>
                <p className="text-slate-500">
                  {movement.variantName ? `${movement.variantName}: ` : ''}
                  {movement.optionValue ?? 'Stock base'}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-semibold ${
                    movement.quantityChange >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {movement.quantityChange > 0 ? '+' : ''}
                  {movement.quantityChange}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(movement.createdAt)}
                </p>
              </div>
            </div>
          ))}
          {!movements.length ? (
            <p className="text-sm text-slate-500">Sin movimientos registrados.</p>
          ) : null}
        </div>
      </article>
    </section>
  )
}
